import { useState } from 'react';
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;

const API_URL = `${URL_MAIN}/controllers/mobile/InserirDadosDestinatarioMobileController.php`;

export default function UseDestinatario() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usuario, setUsuario] = useState(null);

  /*const inserirDadosDestinatario = async (email, tipoUsuario) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, logar_como: tipoUsuario }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Resposta inválida do servidor');
      }

      const json = await response.json();

      if (json.status !== 'sucesso') {
        throw new Error(json.mensagem || 'Falha no login');
      }

      setUsuario(json.usuario);
      return true;
    } catch (err) {
      //console.error('Login error:', err);
      setError(err.message || 'Erro inesperado');
      return false;
    } finally {
      setLoading(false);
    }
  };*/

  return { /*inserirDadosDestinatario*/ };
}
