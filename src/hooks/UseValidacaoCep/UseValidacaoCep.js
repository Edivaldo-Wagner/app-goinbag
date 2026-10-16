import { useState } from 'react';
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;

const API_URL = `${URL_MAIN}/controllers/mobile/ValidacaoCep.php`;

export default function UseValidacaoCep() {
  const [loadingValidacaoCep, setLoadingValidacaoCep] = useState(false);
  const [error, setError] = useState(null);
  const [validacaoCep, setValidacaoCep] = useState('');


const validandoCep = async (maskedCep) => {
  setLoadingValidacaoCep(true);
  setError(null);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ maskedCep }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Resposta inválida do servidor');
    }

    const json = await response.json();
    setValidacaoCep(json);
    return json; // <- Retorna diretamente aqui
  } catch (err) {
    setError(err.message || 'Erro inesperado');
    return null;
  } finally {
    setLoadingValidacaoCep(false);
  }
};



  return { validandoCep, validacaoCep, loadingValidacaoCep };
}
