import { useState } from 'react';
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;

const API_URL = `${URL_MAIN}/controllers/mobile/GerarCodigoConfirmacaoController.php`;

export default function UseGerarCodigoConfirmacao() {
  const [loadingInserirGerarCodigoConfirmacao, setLoadingInserirGerarCodigoConfirmacao] = useState(false);
  const [error, setError] = useState(null);
  const [insercaoGerarCodigoConfirmacao, setInsercaoGerarCodigoConfirmacao] = useState('');


const inserirGerarCodigoConfirmacao = async (tipoEnvio, nomeCadastro, emailOuTelefoneCadastro) => {
  setLoadingInserirGerarCodigoConfirmacao(true);
  setError(null);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tipoEnvio, nomeCadastro, emailOuTelefoneCadastro }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Resposta inválida do servidor');
    }

    const jsonInserirGerarCodigoConfirmacao = await response.json();
    setInsercaoGerarCodigoConfirmacao(jsonInserirGerarCodigoConfirmacao);
    console.log(jsonInserirGerarCodigoConfirmacao)
    return jsonInserirGerarCodigoConfirmacao; // <- Retorna diretamente aqui
  } catch (err) {
    setError(err.message || 'Erro inesperado');
    return null;
  } finally {
    setLoadingInserirGerarCodigoConfirmacao(false);
  }
};



  return { inserirGerarCodigoConfirmacao, insercaoGerarCodigoConfirmacao, loadingInserirGerarCodigoConfirmacao };
}
