import { useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import UseViagensCliente from '../UseViagens/UseViagensCliente';
import { saveToGlobalState } from '../../utils/storage';
import {
  getSecureData,
  clearSecureStorage,
} from '../../utils/secureStorage';

import Config from 'react-native-config';

const URL_MAIN = Config.URL_MAIN;
const API_URL = URL_MAIN;

export default function UseCreateTripNegotiations() {
  const navigation = useNavigation();
  const { authFetch, user, openLoginModal } = useAuth();
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    buscarViagensEmNegociacaoCliente,
  } = UseViagensCliente();

  const buyTrip = async (trip) => {
    try {
      setLoadingId(trip.id || trip.serie_viagem);
      setError("");
      setSuccess("");

      const payload = {
        serie_trip: trip.serie_viagem,
        serie_receiver: null,
        order_value: trip.preco_estimado_formatado
          ? String(trip.preco_estimado_formatado)
          : null,
        insurance_amount: trip.insurance_amount || null,
        client_order_type: trip.client_order_type || null,
      };

      const refresh_token = await getSecureData('refresh_token');

      if (!refresh_token) {
        await saveToGlobalState({
          voltando_trajeto: "nao",
          tab_login: "COMPRAR",
          payload: payload,
          tripData: trip,
        });
        openLoginModal('CLIENTE');
        return;
      }

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

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || "Erro ao criar negociação.");
      }

      setSuccess(data.detail || "Negociação criada com sucesso.");

      await AsyncStorage.removeItem('payment_service');

      // 1. Atualiza as viagens do cliente
      const listaAtualizada = await buscarViagensEmNegociacaoCliente();

      // 2. Procura na lista ou formata preenchendo tanto o padrão de busca quanto o padrão de painel
      const itemNegociacao = (listaAtualizada || []).find(
        (v) => v?.serie_trip_negotiations === data.serie_trip_negotiations
      ) || {
        serie_trip_negotiations: data.serie_trip_negotiations,
        trip_status: '1',
        client_order_type: trip.tipo_encomenda || searchData?.encomenda,
        order_value: trip.preco_estimado || trip.preco_estimado_num,
        insurance_amount: trip.insurance_amount,
        trip: {
          cidade_origem: trip.cidade_de_onde_vai_sair || trip.cidade_origem,
          cidade_destino: trip.cidade_para_onde_vai || trip.cidade_destino,
          meio_transporte: trip.meio_transporte,
          duracao_viagem: trip.duracao_viagem,
          data_partida: trip.data_partida_para_busca || trip.data_partida,
          horas_partida: trip.horas_partida,
          data_chegada: trip.data_chegada_para_busca || trip.data_chegada,
          horas_chegada: trip.horas_chegada,
          informacao_sobre_trajeto: trip.informacao_sobre_trajeto,
          lat_cidade_origem: trip.lat_cidade_origem,
          lng_cidade_origem: trip.lng_cidade_origem,
          lat_cidade_destino: trip.lat_cidade_destino,
          lng_cidade_destino: trip.lng_cidade_destino,
        },
        traveler: {
          nome: trip.nome_usuario,
          imagem: trip.imagem_usuario,
        },
      };

      // 3. Navega passando o objeto unificado para o PaymentService
      navigation.navigate('PaymentService', {
        item: itemNegociacao,
        from: 'dashboard',
      });

      return data;
    } catch (err) {
      setError(err.message || "Erro inesperado.");
      Alert.alert("Erro na Negociação", err.message || "Erro inesperado.");
      throw err;
    } finally {
      setLoadingId(null);
    }
  };  
 
  return {
    buyTrip,
    loadingId,
    loading: Boolean(loadingId),
  };
}