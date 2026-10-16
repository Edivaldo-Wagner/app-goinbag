// hooks/UseViagensNaoEfetivadasDestinatario.js
import { useState, useEffect } from 'react';
import fetchViagensNaoEfetivadasCliente from '../api/fetchViagensNaoEfetivadasCliente';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UseViagensNaoEfetivadasCliente() {
  const [viagensNaoEfetivadasCliente, setViagensNaoEfetivadasCliente] = useState([]);
  const [loadingViagensNaoEfetivadasCliente, setLoadingViagensNaoEfetivadasCliente] = useState(true);
  const [erroViagensNaoEfetivadasCliente, setErroViagensNaoEfetivadasCliente] = useState(null);

  const buscarViagensNaoEfetivadasCliente = async () => {
    setLoadingViagensNaoEfetivadasCliente(true);
    try {
      const serie_logado = await AsyncStorage.getItem('serie_logado');

      const responseViagensNaoEfetivadasCliente = await fetchViagensNaoEfetivadasCliente({ serie_logado });

      if (!responseViagensNaoEfetivadasCliente.ok) throw new Error('Erro ao buscar viagens');

      const rawTextViagensNaoEfetivadaCliente = await responseViagensNaoEfetivadasCliente.text();
      const dataViagensNaoEfetivadasCliente = JSON.parse(rawTextViagensNaoEfetivadaCliente);

      setViagensNaoEfetivadasCliente(dataViagensNaoEfetivadasCliente);

    } catch (err) {
      setErroViagensNaoEfetivadasCliente(err.message || 'Erro desconhecido');
    } finally {
      setLoadingViagensNaoEfetivadasCliente(false);
    }
  };

  useEffect(() => {
    buscarViagensNaoEfetivadasCliente();
  }, []);

  return {
    viagensNaoEfetivadasCliente,
    loadingViagensNaoEfetivadasCliente,
  };
}
