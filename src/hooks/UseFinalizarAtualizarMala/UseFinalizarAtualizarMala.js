import { useState } from 'react';
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = `${URL_MAIN}/controllers/mobile/AtualizarMobileCargaController.php`;

export default function UseFinalizarAtualizarMala() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usuario, setUsuario] = useState(null);

  const finalizarAtualizarMala = async (distancia_viagem) => {
    setLoading(true);
    setError(null);

    try {

      const bodyData = {
        serie_logado: await AsyncStorage.getItem('serie_logado'),
        serie_viagem: await AsyncStorage.getItem('serie_editar_viagem'),

        qual_meio_transporte: await AsyncStorage.getItem('qual_meio_transporte'),
        rota_selecionada: await AsyncStorage.getItem('rota-selecionada'),
        distancia_viagem: distancia_viagem?.toFixed(2),

        pais_origem: await AsyncStorage.getItem('pais_origem'),
        cidade_origem_main: await AsyncStorage.getItem('cidade_origem_main'),
        cidade_origem: await AsyncStorage.getItem('cidade_origem'),
        lat_cidade_origem: await AsyncStorage.getItem('lat_cidade_origem'),
        lng_cidade_origem: await AsyncStorage.getItem('lng_cidade_origem'),

        pais_destino: await AsyncStorage.getItem('pais_destino'),
        cidade_destino_main: await AsyncStorage.getItem('cidade_destino_main'),
        cidade_destino: await AsyncStorage.getItem('cidade_destino'),
        lat_cidade_destino: await AsyncStorage.getItem('lat_cidade_destino'),
        lng_cidade_destino: await AsyncStorage.getItem('lng_cidade_destino'),
        
        dia_mes_ano_ida_viagem: await AsyncStorage.getItem('dia-mes-ano-ida-viagem'),
        dia_mes_ano_ida_viagem_para_busca: await AsyncStorage.getItem('dia-mes-ano-ida-viagem-para-busca'),
        hora_ida_viagem: await AsyncStorage.getItem('hora-ida-viagem'),

        dia_mes_ano_destino: await AsyncStorage.getItem('dia-mes-ano-destino'),
        dia_mes_ano_destino_para_busca: await AsyncStorage.getItem('dia-mes-ano-destino-para-busca'),
        hora_destino: await AsyncStorage.getItem('hora-destino'),

        select_espaco_mala: await AsyncStorage.getItem('select-espaco-mala'),
        informacao_a_viagem: await AsyncStorage.getItem('informacao-a-viagem'),
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Resposta inválida do servidor');
      }

      const json = await response.json();

      console.log(json)

      if (json.status !== 'sucesso') {
        throw new Error(json.mensagem || 'Falha no Atualizar');
      }

      setUsuario(json.usuario);
      return true;
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro inesperado');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { finalizarAtualizarMala, loading, error, usuario, setError };
}
