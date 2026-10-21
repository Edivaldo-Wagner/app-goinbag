import {useState, useEffect} from 'react';
import {useAuth} from '../../context/AuthContext';
import fetchViagensEmNegociacao from '../api/fetchViagensEmNegociacao';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UseViagensDestinatario() {
  const {authFetch, accessToken, user, loading} = useAuth();

  const [viagensEmNegociacaoDestinatario, setViagensEmNegociacaoDestinatario] =
    useState([]);

  const [
    loadingViagensEmNegociacaoDestinatario,
    setLoadingViagensEmNegociacaoDestinatario,
  ] = useState(true);

  const [
    erroViagensEmNegociacaoDestinatario,
    setErroViagensEmNegociacaoDestinatario,
  ] = useState(null);

  const buscarViagensEmNegociacaoDestinatario = async () => {
    //console.log('=== BUSCAR VIAGENS ===');

    try {
      setLoadingViagensEmNegociacaoDestinatario(true);
      setErroViagensEmNegociacaoDestinatario(null);

      //console.log('loading:', loading);
      //console.log('user:', user);
      //console.log('accessToken existe:', !!accessToken);

      const serie_logado_Destinatario = await AsyncStorage.getItem(
        'serie_logado',
      );

      //console.log('serie_logado:', serie_logado_Destinatario);

      const responseViagensEmNegociacaoDestinatario =
        await fetchViagensEmNegociacao(authFetch);

      //console.log('response:', responseViagensEmNegociacaoDestinatario);

      //console.log('status:', responseViagensEmNegociacaoDestinatario.status);

      const rawTextViagensEmNegociacaoDestinatario =
        await responseViagensEmNegociacaoDestinatario.text();

      //console.log('RAW RESPONSE:', rawTextViagensEmNegociacaoDestinatario);

      if (!responseViagensEmNegociacaoDestinatario.ok) {
        throw new Error(
          `Erro HTTP ${responseViagensEmNegociacaoDestinatario.status}: ${rawTextViagensEmNegociacaoDestinatario}`,
        );
      }

      const dataViagensEmNegociacaoDestinatario = JSON.parse(
        rawTextViagensEmNegociacaoDestinatario,
      );

      //console.log('DATA:', dataViagensEmNegociacaoDestinatario);

      const resultados = dataViagensEmNegociacaoDestinatario.resultados || [];

      //console.log('RESULTADOS:', resultados);
      //console.log('TOTAL:', resultados.length);

      setViagensEmNegociacaoDestinatario(
        resultados.filter(item => item.receiver?.serie === user.serie),
      );
    } catch (err) {
      console.log('ERRO BUSCANDO VIAGENS:', err);

      setErroViagensEmNegociacaoDestinatario(
        err.message || 'Erro desconhecido',
      );
    } finally {
      setLoadingViagensEmNegociacaoDestinatario(false);
    }
  };

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!accessToken) {
      console.log('Ainda sem accessToken');
      return;
    }

    buscarViagensEmNegociacaoDestinatario();
  }, [loading, accessToken]);

  return {
    viagensEmNegociacaoDestinatario,
    loadingViagensEmNegociacaoDestinatario,
    erroViagensEmNegociacaoDestinatario,
    buscarViagensEmNegociacaoDestinatario,
  };
}
