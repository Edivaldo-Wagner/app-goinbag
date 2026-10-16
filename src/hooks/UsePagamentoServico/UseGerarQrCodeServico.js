import { useState } from 'react';
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;

const API_URL = `${URL_MAIN}/controllers/mobile/GerarQrCodeClienteController.php`;

export default function UseGerarQrCodeServico() {
  const [loadingGerarQrCodeServico, setLoadingGerarQrCodeServico] = useState(false);
  const [error, setError] = useState(null);
  const [dadosGerarQrCodeServico, setDadosGerarQrCodeServico] = useState('');


const gerarQrCodeServico = async (cobranca_id, serie_viagem_negociacao) => {
  setLoadingGerarQrCodeServico(true);
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

    const jsonGerarQrCodeServico = await response.json();
    setDadosGerarQrCodeServico('jsonGerarQrCodeServico');
    return jsonGerarQrCodeServico; // <- Retorna diretamente aqui
  } catch (err) {
    setError(err.message || 'Erro inesperado');
    return null;
  } finally {
    setLoadingGerarQrCodeServico(false);
  }
};



  return { gerarQrCodeServico, dadosGerarQrCodeServico, loadingGerarQrCodeServico };
}
