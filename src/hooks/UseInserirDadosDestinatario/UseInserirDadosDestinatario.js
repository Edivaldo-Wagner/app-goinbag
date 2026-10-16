import { useState } from 'react';
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;

const API_URL = `${URL_MAIN}/controllers/mobile/InserirDadosDestinatarioController.php`;

export default function UseInserirDadosDestinatario() {
  const [loadingInserirDadosDestinatario, setLoadingInserirDadosDestinatario] = useState(false);
  const [error, setError] = useState(null);
  const [insercaoDadosDestinatario, setInsercaoDadosDestinatario] = useState('');


const inserirDadosDestinatario = async (serieViagemNegociacao, serieLogado, nomeDestinatario, emailDestinatario, celularDestinatario, nomeCliente) => {
  setLoadingInserirDadosDestinatario(true);
  setError(null);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ serieViagemNegociacao, serieLogado, nomeDestinatario, emailDestinatario, celularDestinatario, nomeCliente }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Resposta inválida do servidor');
    }

    const jsonInserirDadosDestinatario = await response.json();
    setInsercaoDadosDestinatario(jsonInserirDadosDestinatario);
    return jsonInserirDadosDestinatario; // <- Retorna diretamente aqui
  } catch (err) {
    setError(err.message || 'Erro inesperado');
    return null;
  } finally {
    setLoadingInserirDadosDestinatario(false);
  }
};



  return { inserirDadosDestinatario, insercaoDadosDestinatario, loadingInserirDadosDestinatario };
}
