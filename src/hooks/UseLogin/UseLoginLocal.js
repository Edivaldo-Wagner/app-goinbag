import {useState} from 'react';
import { Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '../../context/AuthContext';
import {useNavigation} from '@react-navigation/native';
import UseViagensCliente from '../UseViagens/UseViagensCliente';
import {saveToGlobalState, getStoredData} from '../../utils/storage';

import Config from 'react-native-config';

const URL_MAIN = Config.URL_MAIN;

const API_URL = URL_MAIN;

export default function UseLogin({activeTab}) {
  const navigation = useNavigation();

  const {authFetch, setUser, setAccessToken, saveRefreshToken, closeLoginModal} = useAuth();

  const [email, setEmail] = useState('');

  const [senha, setSenha] = useState('');

  const [loading, setLoading] = useState(false);

  const [showErrorModal, setShowErrorModal] = useState(false);

  const [error, setError] = useState('');

  const {
    buscarViagensEmNegociacaoCliente,
  } = UseViagensCliente();

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      setError('Preencha todos os campos');

      setShowErrorModal(true);

      return;
    }

    //alert(activeTab);

    try {
      setLoading(true);

      setError('');

      setShowErrorModal(false);

      const res = await fetch(`${API_URL}/api/auth/login/`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          email,

          senha,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.redirect === 'confirmacao_email') {
          navigation.navigate('ConfirmacaoEmail', {
            email: data.email,

            telefone: data.telefone,

            phone_confirmation: data.phone_confirmation,

            confirmation_token: data.confirmation_token,
          });

          return;
        }

        if (data.redirect === 'confirmacao_telefone') {
          navigation.navigate('ConfirmacaoTelefone', {
            telefone: data.telefone,

            confirmation_token: data.confirmation_token,
          });

          return;
        }

        setError(data.detail || 'Erro no login');

        setShowErrorModal(true);

        setSenha('');

        return;
      }

      /*
        SALVA SOMENTE O REFRESH TOKEN
        NO KEYCHAIN
      */

      await saveRefreshToken(data.refresh);

      /*
        FICA SOMENTE NO CONTEXT
      */

      setAccessToken(data.access);

      setUser(data.user);

      const {tab_login, payload, tripData} = await getStoredData();

      if (tab_login === 'COMPRAR') {
        await saveToGlobalState({
          tipoCadastro: 'CLIENTE',
          tab_login: 'CLIENTE',
        });
        closeLoginModal();

        const response = await authFetch(
          `${API_URL}/api/create-trip-negotiations/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        const resData = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(resData.detail || "Erro ao criar negociação.");
        }

        await AsyncStorage.removeItem('payment_service');

        const listaAtualizada = await buscarViagensEmNegociacaoCliente();

        const t = tripData || {};
        const itemNegociacao = (listaAtualizada || []).find(
          (v) => v?.serie_trip_negotiations === resData.serie_trip_negotiations
        ) || {
          serie_trip_negotiations: resData.serie_trip_negotiations,
          trip_status: '1',
          client_order_type: t.tipo_encomenda || payload?.client_order_type,
          order_value: payload?.order_value || t.preco_estimado,
          insurance_amount: payload?.insurance_amount || t.insurance_amount,
          trip: {
            cidade_origem: t.cidade_de_onde_vai_sair || t.cidade_origem,
            cidade_destino: t.cidade_para_onde_vai || t.cidade_destino,
            meio_transporte: t.meio_transporte,
            duracao_viagem: t.duracao_viagem,
            data_partida: t.data_partida_para_busca || t.data_partida,  
            horas_partida: t.horas_partida,
            data_chegada: t.data_chegada_para_busca || t.data_chegada,
            horas_chegada: t.horas_chegada,
            informacao_sobre_trajeto: t.informacao_sobre_trajeto,
            lat_cidade_origem: t.lat_cidade_origem,
            lng_cidade_origem: t.lng_cidade_origem,
            lat_cidade_destino: t.lat_cidade_destino,
            lng_cidade_destino: t.lng_cidade_destino,
          },
          traveler: {
            nome: t.nome_usuario,
            imagem: t.imagem_usuario,
          },
        };

        // Limpa as flags do storage para não repetir o fluxo no próximo login
        await saveToGlobalState({ payload: null, tripData: null });

        navigation.navigate('PaymentService', {
          item: itemNegociacao,
          from: 'dashboard',
        });
        return;
      }

      if (activeTab === 'CLIENTE') {
        await saveToGlobalState({
          tipoCadastro: 'CLIENTE',
        });
        closeLoginModal()
        navigation.navigate('DashboardClient');
      }

      if (activeTab === 'VIAJANTE') {
        await saveToGlobalState({
          tipoCadastro: 'VIAJANTE',
        });
        closeLoginModal()
        navigation.navigate('DashboardTraveler');
      }

      if (activeTab === 'DESTINATÁRIO') {
        await saveToGlobalState({
          tipoCadastro: 'DESTINATÁRIO',
        });
        closeLoginModal()
        navigation.navigate('DashboardReceiver');
      }

    } catch (e) {
      console.log('LOGIN ERROR:', e);

      setError('Erro de conexão');

      setShowErrorModal(true);

      setSenha('');
    } finally {
      setLoading(false);
    }
  };

  return {
    handleLogin,

    API_URL,

    email,

    setEmail,

    senha,

    setSenha,

    loading,

    error, 

    setError,

    showErrorModal,

    setShowErrorModal,
  };
}
