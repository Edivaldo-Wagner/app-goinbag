import { useState } from 'react';
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = `${URL_MAIN}/controllers/mobile/ConfirmarChegadaDestinoDestinatarioController.php`;

export default function UseConfirmarChegadaAoDestino() {
  const [loadingConfirmacaoChegadaAoDestino, setLoadingConfirmacaoChegadaAoDestino] = useState(false);
  const [error, setError] = useState(null);
  const [confirmacaoChegadaAoDestino, setConfirmacaoChegadaAoDestino] = useState('');


const confirmarChegadaAoDestino = async (serieViagemNegociacao, estadoEncomenda) => {
  setLoadingConfirmacaoChegadaAoDestino(true);
  setError(null);

  try {
    const chavePix = await AsyncStorage.getItem('chave_pix');

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ serieViagemNegociacao, estadoEncomenda, chavePix }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Resposta inválida do servidor');
    }

    const jsonConfirmacaoChegadaAoDestino = await response.json();
    console.log(jsonConfirmacaoChegadaAoDestino)
    setConfirmacaoChegadaAoDestino(jsonConfirmacaoChegadaAoDestino);
    return jsonConfirmacaoChegadaAoDestino; // <- Retorna diretamente aqui
  } catch (err) {
    setError(err.message || 'Erro inesperado');
    return null;
  } finally {
    setLoadingConfirmacaoChegadaAoDestino(false);
  }
};



  return { confirmarChegadaAoDestino, confirmacaoChegadaAoDestino, loadingConfirmacaoChegadaAoDestino };
}
