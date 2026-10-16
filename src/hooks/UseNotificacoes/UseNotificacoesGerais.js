// hooks/UseNotificacoesGerais.js
import { useState, useEffect } from 'react';
import fetchNotificacoes from '../api/fetchNotificacoes';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UseNotificacoesGerais() {
  const [notificacoesGerais, setNotificacoesGerais] = useState([]);
  const [loadingNotificacoesGerais, setLoadingNotificacoesGerais] = useState(true);
  const [erroNotificacoesGerais, setErroNotificacoesGerais] = useState(null);

  const buscarNotificacoesGerais = async () => {
    setLoadingNotificacoesGerais(true);
    try {
      const logar_como = await AsyncStorage.getItem('logar_como');
      const serie_logado = await AsyncStorage.getItem('serie_logado');
      const responseNotificacoesGerais = await fetchNotificacoes();

      if (!responseNotificacoesGerais.ok) throw new Error('Erro ao buscar viagens');

      const rawTextNotificacoesGerais = await responseNotificacoesGerais.text();
      const dataNotificacoesGerais = JSON.parse(rawTextNotificacoesGerais);

      let notificacoesFiltradas = [];

      //console.log(logar_como)

      if (logar_como === "Viajante") {
        notificacoesFiltradas = dataNotificacoesGerais.filter(
          (item) =>
            item.serie_estrangeira_carteiro === serie_logado &&
            item.categoria_quem_notificou !== "Carteiro"
        );
      } else if (logar_como === "Cliente") {
        notificacoesFiltradas = dataNotificacoesGerais.filter(
          (item) =>
            item.serie_estrangeira_cliente === serie_logado &&
            item.categoria_quem_notificou !== "Cliente"
        );
      } else if (logar_como === "Destinatário" || logar_como === "Destinatario") {
        notificacoesFiltradas = dataNotificacoesGerais.filter(
          (item) =>
            item.serie_estrangeira_destinatario === serie_logado &&
            item.categoria_quem_notificou !== "Destinatário" &&
            item.categoria_quem_notificou !== "Destinatario"
        );
      }

      setNotificacoesGerais(notificacoesFiltradas);

    } catch (err) {
      setErroNotificacoesGerais(err.message || 'Erro desconhecido');
    } finally {
      setLoadingNotificacoesGerais(false);
    }
  };

  useEffect(() => {
    buscarNotificacoesGerais();
  }, []);

  return {
    notificacoesGerais,
    loadingNotificacoesGerais,
    erroNotificacoesGerais,
    buscarNotificacoesGerais
  };
}
