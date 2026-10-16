import { useState } from 'react';
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;

const API_URL = `${URL_MAIN}/controllers/mobile/CancelarViagemEmNegociacaoCarteiro.php`;

export default function UseCancelarViagemEmNegociacaoCarteiro() {
  const [loadingCancelarViagemEmNegociacao, setloadingCancelarViagemEmNegociacao] = useState(false);
  const [error, setError] = useState(null);
  const [insercaoCancelarViagemEmNegociacao, setInsercaoCancelarViagemEmNegociacao] = useState('');


const inserirCancelarViagemEmNegociacao = async (serieViagemNegociacao, chavePix) => {
  setloadingCancelarViagemEmNegociacao(true);
  setError(null);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ serieViagemNegociacao, chavePix }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Resposta inválida do servidor');
    }

    const jsonInserirCancelarViagemEmNegociacao = await response.json();
    console.log(jsonInserirCancelarViagemEmNegociacao)
    setInsercaoCancelarViagemEmNegociacao(jsonInserirCancelarViagemEmNegociacao);
    return jsonInserirCancelarViagemEmNegociacao; // <- Retorna diretamente aqui
  } catch (err) {
    setError(err.message || 'Erro inesperado');
    return null;
  } finally {
    setloadingCancelarViagemEmNegociacao(false);
  }
};



  return { inserirCancelarViagemEmNegociacao, insercaoCancelarViagemEmNegociacao, loadingCancelarViagemEmNegociacao };
}
