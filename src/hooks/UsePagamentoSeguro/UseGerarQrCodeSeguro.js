import { useState } from 'react';
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;

const API_URL = `${URL_MAIN}/controllers/mobile/GerarQrCodeCarteiroController.php`;

export default function UseGerarQrCodeSeguro() {
  const [loadingGerarQrCodeSeguro, setLoadingGerarQrCodeSeguro] = useState(false);
  const [error, setError] = useState(null);
  const [dadosGerarQrCodeSeguro, setDadosGerarQrCodeSeguro] = useState('');


const gerarQrCodeSeguro = async (cobranca_id, serie_viagem_negociacao) => {
  setLoadingGerarQrCodeSeguro(true);
  setError(null);
    
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        cobranca_id,
        serie_viagem_negociacao,
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Resposta inválida do servidor');
    }

    const jsonGerarQrCodeSeguro = await response.json();
    setDadosGerarQrCodeSeguro('jsonGerarQrCodeSeguro');
    return jsonGerarQrCodeSeguro; // <- Retorna diretamente aqui
  } catch (err) {
    setError(err.message || 'Erro inesperado');
    return null;
  } finally {
    setLoadingGerarQrCodeSeguro(false);
  }
};



  return { gerarQrCodeSeguro, dadosGerarQrCodeSeguro, loadingGerarQrCodeSeguro };
}
