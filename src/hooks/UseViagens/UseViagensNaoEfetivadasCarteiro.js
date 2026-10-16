// hooks/UseViagensNaoEfetivadasCarteiro.js
import { useState, useEffect } from 'react';
import fetchViagensNaoEfetivadasCarteiro from '../api/fetchViagensNaoEfetivadasCarteiro';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UseViagensNaoEfetivadasCarteiro() {
  const [viagensNaoEfetivadasCarteiro, setViagensNaoEfetivadasCarteiro] = useState([]);
  const [loadingViagensNaoEfetivadasCarteiro, setLoadingViagensNaoEfetivadasCarteiro] = useState(true);
  const [erroViagensNaoEfetivadasCarteiro, setErroViagensNaoEfetivadasCarteiro] = useState(null);

  const buscarViagensNaoEfetivadasCarteiro = async () => {
    setLoadingViagensNaoEfetivadasCarteiro(true);
    try {
      const serie_logado = await AsyncStorage.getItem('serie_logado');
      const responseViagensNaoEfetivadasCarteiro = await fetchViagensNaoEfetivadasCarteiro({ serie_logado });

      if (!responseViagensNaoEfetivadasCarteiro.ok) throw new Error('Erro ao buscar viagens');

      const rawTextViagensNaoEfetivadasCarteiro = await responseViagensNaoEfetivadasCarteiro.text();
      //console.log(rawTextViagensNaoEfetivadasCarteiro)
      const dataViagensNaoEfetivadasCarteiro = JSON.parse(rawTextViagensNaoEfetivadasCarteiro);

      //console.log(dataViagensNaoEfetivadasCarteiro)
      //return

      setViagensNaoEfetivadasCarteiro(dataViagensNaoEfetivadasCarteiro);

    } catch (err) {
      setErroViagensNaoEfetivadasCarteiro(err.message || 'Erro desconhecido');
    } finally {
      setLoadingViagensNaoEfetivadasCarteiro(false);
    }
  };

  useEffect(() => {
    buscarViagensNaoEfetivadasCarteiro();
  }, []);

  return {
    viagensNaoEfetivadasCarteiro,
    loadingViagensNaoEfetivadasCarteiro,
  };
}
