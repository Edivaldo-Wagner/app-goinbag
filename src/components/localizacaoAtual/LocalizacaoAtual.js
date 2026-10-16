import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

import UseViagensCarteiro from '../../hooks/UseViagens/UseViagensCarteiro';
import UseAtualizarLocalizacaoAtualUsuario from '../../hooks/UseAtualizarLocalizacaoAtualUsuario/UseAtualizarLocalizacaoAtualUsuario';

const LocalizacaoAtual = () => {
  const watchId = useRef(null);

  const {
    viagensEmNegociacaoCarteiro,
    loadingViagensEmNegociacaoCarteiro,
  } = UseViagensCarteiro();

  const { localizacaoAtualUsuario } =
    UseAtualizarLocalizacaoAtualUsuario();

  /**
   * Para completamente o rastreamento
   */
  const stopTracking = () => {
    if (watchId.current !== null) {
      Geolocation.clearWatch(watchId.current);
      watchId.current = null;
      console.log('📍 Rastreamento GPS parado');
    }
  };

  useEffect(() => {
    const startTracking = async () => {
      try {
        // 🔐 Verifica sessão
        const session = await AsyncStorage.getItem('serie_logado');
        if (!session) {
          stopTracking();
          return;
        }

        // Aguarda carregamento das viagens
        if (loadingViagensEmNegociacaoCarteiro) return;

        // Verifica se existe viagem válida
        const viagensComCarteiro = viagensEmNegociacaoCarteiro.filter(
          item =>
            item.serie_estrangeira_carteiro === session &&
            item.status_viagem === '7'
        );

        if (viagensComCarteiro.length === 0) {
          stopTracking();
          return;
        }

        // Evita múltiplos watches
        if (watchId.current !== null) return;

        // 📲 Permissão de localização
        const permission =
          Platform.OS === 'android'
            ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
            : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

        const result = await request(permission);

        if (result !== RESULTS.GRANTED) {
          console.log('Permissão de localização negada');
          return;
        }

        // 🛰️ Inicia rastreamento
        watchId.current = Geolocation.watchPosition(
          async position => {
            // 🔄 Revalida sessão a cada atualização
            const currentSession = await AsyncStorage.getItem('serie_logado');

            if (!currentSession) {
              stopTracking();
              //return;
            }

            const { latitude, longitude } = position.coords;

            localizacaoAtualUsuario(
              latitude,
              longitude,
              currentSession
            );
          },
          error => {
            console.log('Erro GPS:', error);
          },
          {
            enableHighAccuracy: true,
            distanceFilter: 10,
            interval: 5000,
            fastestInterval: 2000,
          }
        );
      } catch (error) {
        console.log('Erro ao iniciar GPS:', error);
      }
    };

    startTracking();

    return () => {
      stopTracking();
    };
  }, [
    viagensEmNegociacaoCarteiro,
    loadingViagensEmNegociacaoCarteiro,
  ]);

  return null;
};

export default LocalizacaoAtual;
