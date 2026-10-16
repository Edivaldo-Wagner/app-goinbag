// hooks/UseNotificacoesCliente.js
import { useState, useEffect } from 'react';
import fetchNotificacoes from '../api/fetchNotificacoes';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UseNotificacoesCliente() {
  const [notificacoesCliente, setNotificacoesCliente] = useState([]);
  const [loadingNotificacoesCliente, setLoadingNotificacoesCliente] = useState(true);
  const [erroNotificacoesCliente, setErroNotificacoesCliente] = useState(null);

  const buscarNotificacoesCliente = async () => {
    setLoadingNotificacoesCliente(true);
    try {
      const serie_logado_cliente = await AsyncStorage.getItem('serie_logado');
      const responseNotificacoesCliente = await fetchNotificacoes();

      if (!responseNotificacoesCliente.ok) throw new Error('Erro ao buscar viagens');

      const rawTextNotificacoesCliente = await responseNotificacoesCliente.text();
      const dataNotificacoesCliente = JSON.parse(rawTextNotificacoesCliente);

      let notificacoesFiltradas = [];

      notificacoesFiltradas = dataNotificacoesCliente.filter(
          (item) =>
            item.serie_estrangeira_cliente === serie_logado_cliente &&
            item.categoria_quem_notificou !== "Cliente"
        );

      setNotificacoesCliente(notificacoesFiltradas);

    } catch (err) {
      setErroNotificacoesCliente(err.message || 'Erro desconhecido');
    } finally {
      setLoadingNotificacoesCliente(false);
    }
  };

  useEffect(() => {
    buscarNotificacoesCliente();
  }, []);

  return {
    notificacoesCliente,
    loadingNotificacoesCliente,
    erroNotificacoesCliente,
    buscarNotificacoesCliente
  };
}
