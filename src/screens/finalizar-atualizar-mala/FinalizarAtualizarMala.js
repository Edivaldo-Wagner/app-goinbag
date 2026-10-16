import React, {useEffect, useState} from 'react';
import {View, ActivityIndicator, StyleSheet, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import UseFinalizarAtualizarMala from '../../hooks/UseFinalizarAtualizarMala/UseFinalizarAtualizarMala';

const key = Config.GOOGLE_API_KEY;

const FinalizarAtualizarMala = () => {
  const navigation = useNavigation();
  const [loadingScreen, setLoadingScreen] = useState(false);
  const {finalizarAtualizarMala} = UseFinalizarAtualizarMala();

  const getDistanceInKm = async (lat1, lng1, lat2, lng2) => {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${lat1},${lng1}&destinations=${lat2},${lng2}&key=${key}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.rows?.[0]?.elements?.[0]?.distance?.value) {
        return data.rows[0].elements[0].distance.value / 1000; // metros para KM
      } else {
        throw new Error('Erro ao calcular distância');
      }
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleFinalizar = async () => {
    setLoadingScreen(true);
    try {
      for (const keyy of ['cidades_trajeto', 'cidades_trajeto_retorno']) {
        if ((await AsyncStorage.getItem(keyy)) === null) {
          await AsyncStorage.setItem(keyy, '');
        }
      }

      const latOrigem = await AsyncStorage.getItem('lat_cidade_origem');
      const lngOrigem = await AsyncStorage.getItem('lng_cidade_origem');
      const latDestino = await AsyncStorage.getItem('lat_cidade_destino');
      const lngDestino = await AsyncStorage.getItem('lng_cidade_destino');

      const distanciaIda = await getDistanceInKm(
        latOrigem,
        lngOrigem,
        latDestino,
        lngDestino,
      );

      const ok = await finalizarAtualizarMala(distanciaIda);

      //return
      if (ok) {
        navigation.navigate('DashboardAvailable');
      } else {
        //Alert.alert('Erro', 'Não foi possível finalizar a viagem.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Erro inesperado');
    } finally {
      setLoadingScreen(false);
    }
  };

  useEffect(() => {
    handleFinalizar();
  }, []);

  return (
    <View style={styles.container}>
      {loadingScreen && <ActivityIndicator size="large" color="#0000ff" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FinalizarAtualizarMala;
