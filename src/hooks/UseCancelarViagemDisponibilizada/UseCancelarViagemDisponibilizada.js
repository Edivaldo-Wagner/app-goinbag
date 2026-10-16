import { useState } from 'react';
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;

const API_URL = `${URL_MAIN}/controllers/mobile/CancelarViagemDisponibilizadaCarteiro.php`;

export default function UseCancelarViagemDisponibilizada() {
  const [loadingCancelarViagemDisponibilizada, setloadingCancelarViagemDisponibilizada] = useState(false);
  const [error, setError] = useState(null);
  const [insercaoCancelarViagemDisponibilizada, setInsercaoCancelarViagemDisponibilizada] = useState('');


const inserirCancelarViagemDisponibilizada = async (serieViagem) => {
  setloadingCancelarViagemDisponibilizada(true);
  setError(null);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ serieViagem }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Resposta inválida do servidor');
    }

    const jsonInserirCancelarViagemDisponibilizada = await response.json();
    console.log(jsonInserirCancelarViagemDisponibilizada)
    setInsercaoCancelarViagemDisponibilizada(jsonInserirCancelarViagemDisponibilizada);
    return jsonInserirCancelarViagemDisponibilizada; // <- Retorna diretamente aqui
  } catch (err) {
    setError(err.message || 'Erro inesperado');
    return null;
  } finally {
    setloadingCancelarViagemDisponibilizada(false);
  }
};



  return { inserirCancelarViagemDisponibilizada, insercaoCancelarViagemDisponibilizada, loadingCancelarViagemDisponibilizada };
}
