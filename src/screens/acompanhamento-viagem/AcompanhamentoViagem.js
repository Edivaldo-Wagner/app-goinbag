import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
} from 'react-native-maps';

import ClienteSessionStore from '../painel-controle-cliente/ClienteSessionStore';
import UseCoordenadasCarteiro from '../../hooks/UseCoordenadasCarteiro/UseCoordenadasCarteiro';
import Config from 'react-native-config';

const GOOGLE_MAPS_API_KEY = Config.GOOGLE_API_KEY;

export default function AcompanhamentoViagem() {
  const mapRef = useRef(null);

  const [location, setLocation] = useState(null);
  const [destino, setDestino] = useState(null);
  const [rota, setRota] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    coordenadasCarteiro,
    loadingCoordenadasCarteiro,
    erroCoordenadasCarteiro,
  } = UseCoordenadasCarteiro();

  // ===============================
  // Decode Polyline (Google)
  // ===============================
  function decodePolyline(encoded) {
    let points = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      let dlat = (result & 1) ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      let dlng = (result & 1) ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }
    return points;
  }

  // ===============================
  // Destino
  // ===============================
  useEffect(() => {
    const lat = ClienteSessionStore.getCidadeDestinoLat();
    const lng = ClienteSessionStore.getCidadeDestinoLng();

    if (lat && lng) {
      setDestino({
        latitude: Number(lat),
        longitude: Number(lng),
      });
    }
  }, []);

  // ===============================
  // Atualiza localização do carteiro
  // ===============================
  useEffect(() => {
    if (!coordenadasCarteiro?.length) return;

    const item = coordenadasCarteiro[0];

    const latitude = Number(item.latitude ?? item.lat);
    const longitude = Number(item.longitude ?? item.lng);

    if (isNaN(latitude) || isNaN(longitude)) return;

    const newLocation = {
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    setLocation(prev => {
      if (
        prev &&
        Math.abs(prev.latitude - latitude) < 0.00001 &&
        Math.abs(prev.longitude - longitude) < 0.00001
      ) {
        return prev;
      }

      console.log(newLocation)

      mapRef.current?.animateToRegion(newLocation, 600);
      return newLocation;
    });

    setLoading(false);
  }, [coordenadasCarteiro]);

  // ===============================
  // Buscar rota
  // ===============================
  async function buscarRota(origem, destino) {
    try {
      const url =
        `https://maps.googleapis.com/maps/api/directions/json` +
        `?origin=${origem.latitude},${origem.longitude}` +
        `&destination=${destino.latitude},${destino.longitude}` +
        `&mode=driving` +
        `&key=${GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      const json = await response.json();

      if (!json.routes?.length) return;

      const steps = json.routes[0].legs[0].steps;

      const pontos = steps.flatMap(step =>
        decodePolyline(step.polyline.points)
      );

      setRota(pontos);
    } catch (e) {
      console.log('Erro ao buscar rota:', e);
    }
  }

  // ===============================
  // Atualiza rota quando posição muda
  // ===============================
  useEffect(() => {
    if (location && destino) {
      buscarRota(location, destino);
    }
  }, [location, destino]);

  // ===============================
  // Loading
  // ===============================
  if (loading || loadingCoordenadasCarteiro) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // ===============================
  // Render
  // ===============================
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={location}
      >
        <Marker coordinate={location} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.userLocationOuter}>
              <View style={styles.userLocationInner} />
            </View>
          </Marker>

        {destino && (
          <Marker
            coordinate={destino}
            title="Destino"
          />
        )}

        {rota.length > 0 && (
          <>
            <Polyline
              coordinates={rota}
              strokeColor="#0A3D91"
              strokeWidth={8}
              geodesic
            />
            <Polyline
              coordinates={rota}
              strokeColor="#1E90FF"
              strokeWidth={5}
              geodesic
            />
          </>
        )}
      </MapView>

      {location && (
        <View style={styles.overlay}>
          <Text>Lat: {location.latitude}</Text>
          <Text>Lng: {location.longitude}</Text>
        </View>
      )}
    </View>
  );
}

// ===============================
// Styles
// ===============================
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 15,
    borderRadius: 10,
  },
  userLocationOuter: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(30,144,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userLocationInner: {
    width: 22,
    height: 22,
    borderRadius: 12,
    backgroundColor: '#1E90FF',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
