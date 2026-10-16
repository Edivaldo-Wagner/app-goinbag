import {useState, useEffect} from 'react';
import {useAuth} from '../../context/AuthContext';
import fetchViagensEmNegociacao from '../api/fetchTravelerViagensEmNegociacao';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UseViagensCarteiro() {
  const {authFetch, accessToken, user, loading} = useAuth();

  const [viagensEmNegociacaoCarteiro, setViagensEmNegociacaoCarteiro] =
    useState([]);

  const [
    loadingViagensEmNegociacaoCarteiro,
    setLoadingViagensEmNegociacaoCarteiro,
  ] = useState(true);

  const [erroViagensEmNegociacaoCarteiro, setErroViagensEmNegociacaoCarteiro] =
    useState(null);

  const buscarViagensEmNegociacaoCarteiro = async () => {
    console.log('=== BUSCAR VIAGENS ===');

    try {
      setLoadingViagensEmNegociacaoCarteiro(true);
      setErroViagensEmNegociacaoCarteiro(null);

      console.log('loading:', loading);
      console.log('user:', user);
      console.log('accessToken existe:', !!accessToken);

      const responseViagensEmNegociacaoCarteiro =
        await fetchViagensEmNegociacao(authFetch);

      console.log('response:', responseViagensEmNegociacaoCarteiro);

      console.log('status:', responseViagensEmNegociacaoCarteiro.status);

      const rawTextViagensEmNegociacaoCarteiro =
        await responseViagensEmNegociacaoCarteiro.text();

      console.log('RAW RESPONSE:', rawTextViagensEmNegociacaoCarteiro);

      if (!responseViagensEmNegociacaoCarteiro.ok) {
        throw new Error(
          `Erro HTTP ${responseViagensEmNegociacaoCarteiro.status}: ${rawTextViagensEmNegociacaoCarteiro}`,
        );
      }

      const dataViagensEmNegociacaoCarteiro = JSON.parse(
        rawTextViagensEmNegociacaoCarteiro,
      );

      console.log('DATA:', dataViagensEmNegociacaoCarteiro);

      const resultados = dataViagensEmNegociacaoCarteiro.resultados || [];

      console.log('RESULTADOS:', resultados);
      console.log('TOTAL:', resultados.length);

      setViagensEmNegociacaoCarteiro(
        resultados.filter(item => item.traveler?.serie === user.serie),
      );
    } catch (err) {
      console.log('ERRO BUSCANDO VIAGENS:', err);

      setErroViagensEmNegociacaoCarteiro(err.message || 'Erro desconhecido');
    } finally {
      setLoadingViagensEmNegociacaoCarteiro(false);
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

    buscarViagensEmNegociacaoCarteiro();
  }, [loading, accessToken]);

  return {
    viagensEmNegociacaoCarteiro,
    loadingViagensEmNegociacaoCarteiro,
    erroViagensEmNegociacaoCarteiro,
    buscarViagensEmNegociacaoCarteiro,
  };
}
