import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Config from 'react-native-config';

const { width } = Dimensions.get('window');

const TrajetoCarroRetorno = () => {
  const navigation = useNavigation();
  const mapRef = useRef(null);
  const [origemCoords, setOrigemCoords] = useState(null);
  const [destinoCoords, setDestinoCoords] = useState(null);
  const [rotas, setRotas] = useState([]);
  const [rotaSelecionada, setRotaSelecionada] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [dadosArmazenados, setDadosArmazenados] = useState(null);

  // Busca coordenadas de origem/destino
  useEffect(() => {
    (async () => {
      await AsyncStorage.removeItem('cidades_trajeto_retorno');
      const cidadeOrigem = await AsyncStorage.getItem('cidade_origem_retorno');
      const cidadeDestino = await AsyncStorage.getItem('cidade_destino_retorno');
      setDadosArmazenados({
        cidadeOrigem,
        cidadeDestino,
      });
      const latO = await AsyncStorage.getItem('lat_cidade_origem_retorno');
      const lngO = await AsyncStorage.getItem('lng_cidade_origem_retorno');
      const latD = await AsyncStorage.getItem('lat_cidade_destino_retorno');
      const lngD = await AsyncStorage.getItem('lng_cidade_destino_retorno');
      setOrigemCoords({ lat: parseFloat(latO), lng: parseFloat(lngO) });
      setDestinoCoords({ lat: parseFloat(latD), lng: parseFloat(lngD) });
    })();
  }, []);

  // Quando tivermos origem e destino, já chama o Directions API
  useEffect(() => {
    if (origemCoords && destinoCoords) {
      buscarRotasAlternativas();
    }
  }, [origemCoords, destinoCoords]);

  // Ajusta zoom sempre que a rota muda
  useEffect(() => {
    if (rotaSelecionada) {
      ajustarZoomParaRota(rotaSelecionada.coordenadas);
    }
  }, [rotaSelecionada]);

  const ajustarZoomParaRota = (coordenadas) => {
    if (mapRef.current && coordenadas.length) {
      mapRef.current.fitToCoordinates(coordenadas, {
        edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
        animated: true,
      });
    }
  };

  const buscarRotasAlternativas = async () => {
    const origin = `${origemCoords.lat},${origemCoords.lng}`;
    const destination = `${destinoCoords.lat},${destinoCoords.lng}`;
    const apiKey = Config.GOOGLE_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&alternatives=true&key=${apiKey}&mode=driving&language=pt-BR`;

    try {
      const resp = await fetch(url);
      const data = await resp.json();

      if (!data.routes.length) {
        console.warn('Nenhuma rota encontrada');
        return;
      }

      // Decodifica e formata cada rota
      const rotasDecodificadas = data.routes.map((rota, idx) => {
        const pontos = decodePolyline(rota.overview_polyline.points);
        const coords = pontos.map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
        const durSec = rota.legs[0].duration.value;
        const h = Math.floor(durSec / 3600);
        const m = Math.floor((durSec % 3600) / 60);
        return {
          id: idx.toString(),
          coordenadas: coords,
          resumo: rota.summary,
          distancia: rota.legs[0].distance.text,
          duracao: `${h} horas ${m} minutos`,
          horas: h,
        };
      });

      setRotas(rotasDecodificadas);

      // Carrega rota salva ou usa a primeira
      const saved = await AsyncStorage.getItem('rota-selecionada-retorno');
      let inicial = rotasDecodificadas[0];
      if (saved) {
        const idxSalvo = parseInt(saved.replace('opcao-rota-', ''), 10) - 1;
        if (rotasDecodificadas[idxSalvo]) {
          inicial = rotasDecodificadas[idxSalvo];
        }
      }
      await selecionarRota(inicial);

    } catch (err) {
      console.error('Erro ao buscar rotas:', err);
    }
  };

  const decodePolyline = (encoded) => {
    let points = [];
    let index = 0, lat = 0, lng = 0;
    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
      lat += dlat;
      shift = 0; result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
      lng += dlng;
      points.push([lat / 1e5, lng / 1e5]);
    }
    return points;
  };

  const selecionarRota = async (rota) => {
    setRotaSelecionada(rota);
    await AsyncStorage.setItem('rota-selecionada-retorno', `opcao-rota-${parseInt(rota.id, 10) + 1}`);
    await AsyncStorage.setItem('horas-rota-selecionada-retorno', rota.horas.toString()); 
  };

  const renderItem = ({ item }) => {
    const isSel = rotaSelecionada?.id === item.id;
    return (
      <View style={[styles.rotaItemContainer, isSel && styles.rotaItemSelecionado]}>
        <TouchableOpacity
          style={styles.rotaInfo}
          onPress={async () => {
            await selecionarRota(item);
            setModalVisible(false);
          }}
        >
          <Text style={styles.rotaTexto}>{item.resumo}</Text>
          <Text style={styles.rotaTexto}>{item.distancia} – {item.duracao}</Text>
        </TouchableOpacity>
        {isSel && (
          <TouchableOpacity
            style={styles.botaoProximo}
            onPress={() => navigation.navigate('CidadesTrajetoCarroRetorno')}
          >
            <Text style={styles.botaoTexto}>Próximo</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: origemCoords?.lat || -23.55052,
          longitude: origemCoords?.lng || -46.633308,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {origemCoords && (
          <Marker coordinate={{ latitude: origemCoords.lat, longitude: origemCoords.lng }} title={dadosArmazenados.cidadeOrigem} />
        )}
        {destinoCoords && (
          <Marker coordinate={{ latitude: destinoCoords.lat, longitude: destinoCoords.lng }} title={dadosArmazenados.cidadeDestino} />
        )}
        {rotaSelecionada && (
          <Polyline coordinates={rotaSelecionada.coordenadas} strokeColor="#0c9fe3" strokeWidth={4} />
        )}
      </MapView>

      <FlatList
        data={rotas}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        style={styles.listaRotas}
      />

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Todas as rotas</Text>
            <ScrollView>
              {rotas.map(r => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.rotaItemContainer, rotaSelecionada?.id === r.id && styles.rotaItemSelecionado]}
                  onPress={async () => { await selecionarRota(r); setModalVisible(false); }}
                >
                  <Text style={styles.rotaTexto}>{r.resumo}</Text>
                  <Text style={styles.rotaTexto}>{r.distancia} – {r.duracao}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.botaoFechar} onPress={() => setModalVisible(false)}>
              <Text style={styles.rotaTexto}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  listaRotas: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    zIndex: 1,
  },
  rotaItemContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  rotaItemSelecionado: {
    backgroundColor: '#d0ebff',
  },
  rotaInfo: {
    flex: 1,
    marginRight: 10,
  },
  rotaTexto: {
    color: '#000',
  },
  botaoProximo: {
    backgroundColor: '#0c9fe3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    maxHeight: '80%',
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  botaoFechar: {
    marginTop: 20,
    alignItems: 'center',
  },
});

export default TrajetoCarroRetorno;
