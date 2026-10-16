import React, {useEffect, useState} from 'react';
import {View, ActivityIndicator, StyleSheet, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import UseFinalizarCadastramentoMala from '../../hooks/UseFinalizarCadastramentoMala/UseFinalizarCadastramentoMala';

const key = Config.GOOGLE_API_KEY;

const FinalizarCadastramentoMala = () => {
  const navigation = useNavigation();
  const [loadingScreen, setLoadingScreen] = useState(false);
  const {finalizarCadastramentoMala} = UseFinalizarCadastramentoMala();

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

      let distanciaRetorno = null;
      const temRetorno = await AsyncStorage.getItem(
        'dia-mes-ano-ida-viagem-retorno',
      );
      if (temRetorno) {
        distanciaRetorno = await getDistanceInKm(
          latDestino,
          lngDestino,
          latOrigem,
          lngOrigem,
        );
      }

      //const ok = await finalizarCadastramentoMala(distanciaIda, distanciaRetorno);
      const ok = true;

      //return
      if (ok) {
        if ((await AsyncStorage.getItem('voltando_trajeto')) == 'sim') {
          navigation.navigate('DashboardAvailable');
          return;
        }

        if ((await AsyncStorage.getItem('oferecer_espaco_na_volta')) == 'sim') {
          await AsyncStorage.removeItem('cidade_origem');
          await AsyncStorage.removeItem('lat_cidade_origem');
          await AsyncStorage.removeItem('lng_cidade_origem');
          await AsyncStorage.removeItem('cidade_origem_main');
          await AsyncStorage.removeItem('pais_origem');

          await AsyncStorage.removeItem('cidade_destino');
          await AsyncStorage.removeItem('lat_cidade_destino');
          await AsyncStorage.removeItem('lng_cidade_destino');
          await AsyncStorage.removeItem('cidade_destino_main');
          await AsyncStorage.removeItem('pais_destino');

          await AsyncStorage.removeItem('rota-selecionada');
          await AsyncStorage.removeItem('horas-rota-selecionada');
          await AsyncStorage.removeItem('cidades_trajeto');

          await AsyncStorage.removeItem('dia-mes-ano-ida-viagem');
          await AsyncStorage.removeItem('dia-mes-ano-ida-viagem-para-busca');
          await AsyncStorage.removeItem('hora-ida-viagem');

          await AsyncStorage.removeItem('dia-mes-ano-destino');
          await AsyncStorage.removeItem('dia-mes-ano-destino-para-busca');
          await AsyncStorage.removeItem('hora-destino');
          await AsyncStorage.removeItem('select-espaco-mala');
          await AsyncStorage.removeItem('informacao-a-viagem');

          await AsyncStorage.setItem('voltando_trajeto', 'sim');

          if ((await AsyncStorage.getItem('qual_meio_transporte')) == 'Avião') {
            navigation.navigate('OpcaoAviao');
          }
          if (
            (await AsyncStorage.getItem('qual_meio_transporte')) == 'Ônibus'
          ) {
            navigation.navigate('OpcaoOnibus');
          }
          if ((await AsyncStorage.getItem('qual_meio_transporte')) == 'Trem') {
            navigation.navigate('OpcaoTrems');
          }
          if ((await AsyncStorage.getItem('qual_meio_transporte')) == 'Carro') {
            navigation.navigate('OpcaoCarro');
          }
          if ((await AsyncStorage.getItem('qual_meio_transporte')) == 'Moto') {
            navigation.navigate('OpcaoMoto');
          }
        } else {
          navigation.navigate('DashboardAvailable');
        }
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

export default FinalizarCadastramentoMala;
