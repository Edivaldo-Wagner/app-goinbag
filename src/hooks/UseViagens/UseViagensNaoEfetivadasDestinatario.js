// hooks/UseViagensNaoEfetivadasDestinatario.js
import { useState, useEffect } from 'react';
import fetchViagensNaoEfetivadasDestinatario from '../api/fetchViagensNaoEfetivadasDestinatario';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UseViagensNaoEfetivadasDestinatario() {
  const [viagensNaoEfetivadasDestinatario, setViagensNaoEfetivadasDestinatario] = useState([]);
  const [loadingViagensNaoEfetivadasDestinatario, setLoadingViagensNaoEfetivadasDestinatario] = useState(true);
  const [erroViagensNaoEfetivadasDestinatario, setErroViagensNaoEfetivadasDestinatario] = useState(null);

  const buscarViagensNaoEfetivadasDestinatario = async () => {
    setLoadingViagensNaoEfetivadasDestinatario(true);
    try {
      const serie_logado = await AsyncStorage.getItem('serie_logado');

      const responseViagensNaoEfetivadasDestinatario = await fetchViagensNaoEfetivadasDestinatario({ serie_logado });

      if (!responseViagensNaoEfetivadasDestinatario.ok) throw new Error('Erro ao buscar viagens');

      const rawTextViagensNaoEfetivadaDestinatario = await responseViagensNaoEfetivadasDestinatario.text();
      const dataViagensNaoEfetivadasDestinatario = JSON.parse(rawTextViagensNaoEfetivadaDestinatario);

      setViagensNaoEfetivadasDestinatario(dataViagensNaoEfetivadasDestinatario);

    } catch (err) {
      setErroViagensNaoEfetivadasDestinatario(err.message || 'Erro desconhecido');
    } finally {
      setLoadingViagensNaoEfetivadasDestinatario(false);
    }
  };

  useEffect(() => {
    buscarViagensNaoEfetivadasDestinatario();
  }, []);

  return {
    viagensNaoEfetivadasDestinatario,
    loadingViagensNaoEfetivadasDestinatario,
  };
}
