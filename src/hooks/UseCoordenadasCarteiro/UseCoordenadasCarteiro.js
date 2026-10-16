import { useState, useEffect, useCallback } from 'react';
import fetchCoordenadasCarteiro from '../api/fetchCoordenadasCarteiro';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UseCoordenadasCarteiro() {
  const [coordenadasCarteiro, setCoordenadasCarteiro] = useState([]);
  const [loadingCoordenadasCarteiro, setLoadingCoordenadasCarteiro] = useState(true);
  const [erroCoordenadasCarteiro, setErroCoordenadasCarteiro] = useState(null);

  const buscarCoordenadasCarteiro = useCallback(async () => {
    try {
      const serie_carteiro_viagem_atual = await AsyncStorage.getItem('serie_carteiro_viagem_atual');
      const response = await fetchCoordenadasCarteiro();

      if (!response.ok) {
        throw new Error('Erro ao buscar coordenadas do carteiro');
      }

      const data = await response.json();

      const filtrado = data.filter(item => item.serie === serie_carteiro_viagem_atual);

      // 🔥 Garante nova referência
      setCoordenadasCarteiro(filtrado.map(item => ({ ...item })));

      setErroCoordenadasCarteiro(null);
    } catch (err) {
      console.error(err);
      setErroCoordenadasCarteiro(err.message || 'Erro desconhecido');
    } finally {
      setLoadingCoordenadasCarteiro(false);
    }
  }, []);

  useEffect(() => {
    buscarCoordenadasCarteiro();
    const interval = setInterval(buscarCoordenadasCarteiro, 5000);
    return () => clearInterval(interval);
  }, [buscarCoordenadasCarteiro]);

  return {
    coordenadasCarteiro,
    loadingCoordenadasCarteiro,
    erroCoordenadasCarteiro,
    buscarCoordenadasCarteiro,
  };
}
