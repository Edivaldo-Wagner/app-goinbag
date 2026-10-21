import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import fetchViagensDisponibilizadas from '../api/fetchViagensDisponibilizadas';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UseViagensCarteiro() {
  const { authFetch, accessToken, user, loading } = useAuth();

  const [viagensDisponibilizadasCarteiro, setViagensDisponibilizadasCarteiro] =
    useState([]);

  const [
    loadingViagensDisponibilizadasCarteiro,
    setLoadingViagensDisponibilizadasCarteiro,
  ] = useState(true);

  const [erroViagensDisponibilizadasCarteiro, setErroViagensDisponibilizadasCarteiro] =
    useState(null);

  const buscarViagensDisponibilizadasCarteiro = async () => {
    //console.log('=== BUSCAR VIAGENS ===');

    try {
      setLoadingViagensDisponibilizadasCarteiro(true);
      setErroViagensDisponibilizadasCarteiro(null);

      //console.log('loading:', loading);
      //console.log('user:', user);
      //console.log('accessToken existe:', !!accessToken);

      const responseViagensDisponibilizadasCarteiro =
        await fetchViagensDisponibilizadas(authFetch);

      //console.log('response:', responseViagensDisponibilizadasCarteiro);

      //console.log('status:', responseViagensDisponibilizadasCarteiro.status);

      const rawTextViagensDisponibilizadasCarteiro =
        await responseViagensDisponibilizadasCarteiro.text();

      //console.log('RAW RESPONSE:', rawTextViagensDisponibilizadasCarteiro);

      if (!responseViagensDisponibilizadasCarteiro.ok) {
        throw new Error(
          `Erro HTTP ${responseViagensDisponibilizadasCarteiro.status}: ${rawTextViagensDisponibilizadasCarteiro}`,
        );
      }

      const dataViagensDisponibilizadasCarteiro = JSON.parse(
        rawTextViagensDisponibilizadasCarteiro,
      );

      //console.log('DATA:', dataViagensDisponibilizadasCarteiro);

      const resultados = dataViagensDisponibilizadasCarteiro.resultados || [];

      //console.log('RESULTADOS:', resultados);
      //console.log('TOTAL:', resultados.length);

      setViagensDisponibilizadasCarteiro(resultados);

      // Imprime o resultado processado da variável local (já que o estado só atualiza no próximo render)
      //console.log('FEITO (Dados salvos no estado):', resultados);
    } catch (err) {
      console.log('ERRO BUSCANDO VIAGENS:', err);

      setErroViagensDisponibilizadasCarteiro(err.message || 'Erro desconhecido');
    } finally {
      setLoadingViagensDisponibilizadasCarteiro(false);
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

    buscarViagensDisponibilizadasCarteiro();
  }, [loading, accessToken]);

  return {
    viagensDisponibilizadasCarteiro,
    loadingViagensDisponibilizadasCarteiro,
    erroViagensDisponibilizadasCarteiro,
    buscarViagensDisponibilizadasCarteiro,
  };
}