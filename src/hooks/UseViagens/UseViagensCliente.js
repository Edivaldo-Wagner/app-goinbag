import {useState, useEffect} from 'react';
import {useAuth} from '../../context/AuthContext';
import fetchViagensEmNegociacao from '../api/fetchClientViagensEmNegociacao';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UseViagensCliente() {
  const {authFetch, accessToken, user, loading} = useAuth();

  const [viagensEmNegociacaoCliente, setViagensEmNegociacaoCliente] = useState(
    [],
  );

  const [
    loadingViagensEmNegociacaoCliente,
    setLoadingViagensEmNegociacaoCliente,
  ] = useState(true);

  const [erroViagensEmNegociacaoCliente, setErroViagensEmNegociacaoCliente] =
    useState(null);

  const buscarViagensEmNegociacaoCliente = async () => {
    console.log('=== BUSCAR VIAGENS ===');

    try {
      setLoadingViagensEmNegociacaoCliente(true);
      setErroViagensEmNegociacaoCliente(null);

      console.log('loading:', loading);
      console.log('user:', user);
      console.log('accessToken existe:', !!accessToken);

      const serie_logado_cliente = await AsyncStorage.getItem('serie_logado');

      console.log('serie_logado:', serie_logado_cliente);

      const responseViagensEmNegociacaoCliente = await fetchViagensEmNegociacao(
        authFetch,
      );

      console.log('response:', responseViagensEmNegociacaoCliente);

      console.log('status:', responseViagensEmNegociacaoCliente.status);

      const rawTextViagensEmNegociacaoCliente =
        await responseViagensEmNegociacaoCliente.text();

      console.log('RAW RESPONSE:', rawTextViagensEmNegociacaoCliente);

      if (!responseViagensEmNegociacaoCliente.ok) {
        throw new Error(
          `Erro HTTP ${responseViagensEmNegociacaoCliente.status}: ${rawTextViagensEmNegociacaoCliente}`,
        );
      }

      const dataViagensEmNegociacaoCliente = JSON.parse(
        rawTextViagensEmNegociacaoCliente,
      );

      console.log('DATA:', dataViagensEmNegociacaoCliente);

      const resultados = dataViagensEmNegociacaoCliente.resultados || [];

      console.log('RESULTADOS:', resultados);
      console.log('TOTAL:', resultados.length);

      setViagensEmNegociacaoCliente(
        resultados.filter(item => item.client?.serie === user.serie),
      );
    } catch (err) {
      console.log('ERRO BUSCANDO VIAGENS:', err);

      setErroViagensEmNegociacaoCliente(err.message || 'Erro desconhecido');
    } finally {
      setLoadingViagensEmNegociacaoCliente(false);
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

    buscarViagensEmNegociacaoCliente();
  }, [loading, accessToken]);

  return {
    viagensEmNegociacaoCliente,
    loadingViagensEmNegociacaoCliente,
    erroViagensEmNegociacaoCliente,
    buscarViagensEmNegociacaoCliente,
  };
}
