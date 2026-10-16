import { useState } from 'react';
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;

const API_URL = `${URL_MAIN}/controllers/mobile/InserirNotificacoesNovasViagensController.php`;

export default function useInserirNotificacoesNovasViagens() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  //const [usuario, setUsuario] = useState(null);

  const notificacoesNovasViagens = async (saindoDe, indoPara, email, telefone) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ saindoDe, indoPara, email, telefone }),
      });

      const json = await response.json();

      //setUsuario(json.usuario);     
      return json.status;           
    } catch (err) {
      setError(err.message || 'Erro inesperado');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { notificacoesNovasViagens };
}

