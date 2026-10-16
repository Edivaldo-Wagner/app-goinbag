import { useState } from 'react';
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;

const API_URL = `${URL_MAIN}/controllers/mobile/ConfirmarOuRecusarDadosDestinatarioController.php`;

export default function UseConfirmarOuRecusarDadosDestinatario() {
  const [loadingConfirmacaoOuRecusarDadosDestinatario, setLoadingConfirmacaoOuRecusarDadosDestinatario] = useState(false);
  const [error, setError] = useState(null);
  const [confirmacaoOuRecusarDadosDestinatario, setConfirmacaoOuRecusarDadosDestinatario] = useState('');


const confirmarOuRecusarDadosDestinatario = async (statusDisponibilidade, serieViagemNegociacao, serieLogado, nomeDestinatario) => {
  setLoadingConfirmacaoOuRecusarDadosDestinatario(true);
  setError(null);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ statusDisponibilidade, serieViagemNegociacao, serieLogado, nomeDestinatario }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Resposta inválida do servidor');
    }

    const jsonConfirmacaoOuRecusarDadosDestinatario = await response.json();
    setConfirmacaoOuRecusarDadosDestinatario(jsonConfirmacaoOuRecusarDadosDestinatario);
    return jsonConfirmacaoOuRecusarDadosDestinatario; // <- Retorna diretamente aqui
  } catch (err) {
    setError(err.message || 'Erro inesperado');
    return null;
  } finally {
    setLoadingConfirmacaoOuRecusarDadosDestinatario(false);
  }
};



  return { confirmarOuRecusarDadosDestinatario, confirmacaoOuRecusarDadosDestinatario, loadingConfirmacaoOuRecusarDadosDestinatario };
}
