// hooks/UseNotificacoesDestinatario.js
import { useState, useEffect } from 'react';
import fetchNotificacoes from '../api/fetchNotificacoes';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UseNotificacoesDestinatario() {
  const [notificacoesDestinatario, setNotificacoesDestinatario] = useState([]);
  const [loadingNotificacoesDestinatario, setLoadingNotificacoesDestinatario] = useState(true);
  const [erroNotificacoesDestinatario, setErroNotificacoesDestinatario] = useState(null);

  const buscarNotificacoesDestinatario = async () => {
    setLoadingNotificacoesDestinatario(true);
    try {
      const serie_logado_destinatario = await AsyncStorage.getItem('serie_logado');
      const responseNotificacoesDestinatario = await fetchNotificacoes();

      if (!responseNotificacoesDestinatario.ok) throw new Error('Erro ao buscar viagens');

      const rawTextNotificacoesDestinatario = await responseNotificacoesDestinatario.text();
      const dataNotificacoesDestinatario = JSON.parse(rawTextNotificacoesDestinatario);

      let notificacoesFiltradas = [];

      notificacoesFiltradas = dataNotificacoesDestinatario.filter(
          (item) =>
            item.serie_estrangeira_destinatario === serie_logado_destinatario &&
            item.categoria_quem_notificou !== "Destinatário" &&
            item.categoria_quem_notificou !== "Destinatario"
        );

      setNotificacoesDestinatario(notificacoesFiltradas);

    } catch (err) {
      setErroNotificacoesDestinatario(err.message || 'Erro desconhecido');
    } finally {
      setLoadingNotificacoesDestinatario(false);
    }
  };

  useEffect(() => {
    buscarNotificacoesDestinatario();
  }, []);

  return {
    notificacoesDestinatario,
    loadingNotificacoesDestinatario,
    erroNotificacoesDestinatario,
    buscarNotificacoesDestinatario
  };
}
