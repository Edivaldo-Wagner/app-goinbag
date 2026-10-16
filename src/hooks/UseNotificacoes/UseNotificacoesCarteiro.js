// hooks/UseNotificacoesCarteiro.js
import { useState, useEffect } from 'react';
import fetchNotificacoes from '../api/fetchNotificacoes';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UseNotificacoesCarteiro() {
  const [notificacoesCarteiro, setNotificacoesCarteiro] = useState([]);
  const [loadingNotificacoesCarteiro, setLoadingNotificacoesCarteiro] = useState(true);
  const [erroNotificacoesCarteiro, setErroNotificacoesCarteiro] = useState(null);

  const buscarNotificacoesCarteiro = async () => {
    setLoadingNotificacoesCarteiro(true);
    try {
      const serie_logado_carteiro = await AsyncStorage.getItem('serie_logado');
      const responseNotificacoesCarteiro = await fetchNotificacoes();

      if (!responseNotificacoesCarteiro.ok) throw new Error('Erro ao buscar viagens');

      const rawTextNotificacoesCarteiro = await responseNotificacoesCarteiro.text();
      const dataNotificacoesCarteiro = JSON.parse(rawTextNotificacoesCarteiro);

      let notificacoesFiltradas = [];

      notificacoesFiltradas = dataNotificacoesCarteiro.filter(
          (item) =>
            item.serie_estrangeira_carteiro === serie_logado_carteiro &&
            item.categoria_quem_notificou !== "Carteiro"
        );

      setNotificacoesCarteiro(notificacoesFiltradas);

    } catch (err) {
      setErroNotificacoesCarteiro(err.message || 'Erro desconhecido');
    } finally {
      setLoadingNotificacoesCarteiro(false);
    }
  };

  useEffect(() => {
    buscarNotificacoesCarteiro();
  }, []);

  return {
    notificacoesCarteiro,
    loadingNotificacoesCarteiro,
    erroNotificacoesCarteiro,
    buscarNotificacoesCarteiro
  };
}
