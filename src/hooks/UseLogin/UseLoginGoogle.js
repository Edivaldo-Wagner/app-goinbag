import { useState } from 'react';
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;

const API_URL = `${URL_MAIN}/controllers/mobile/LoginGoogleController.php`;
//const API_URL = 'http://192.168.100.8/goinbag/controllers/mobile/LoginGoogleController.php';

export default function useLoginGoogle() {
  const [loading, setLoading] = useState(false);
  const [errorLoginGoogle, setErrorLoginGoogle] = useState(null);
  const [usuario, setUsuario] = useState(null);

  const loginGoogle = async (idToken, tipoUsuario) => {
    setLoading(true);
    setErrorLoginGoogle(null);

    //console.log(idToken)
    //console.log(tipoUsuario)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken, logar_como: tipoUsuario }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Resposta inválida do servidor');
      }

      const json = await response.json();

      if (json.status !== 'sucesso') {
        return null;
        throw new Error(json.mensagem || 'Falha no login');
      }

      setUsuario(json.usuario);       // continua setando o estado
      return json.usuario;            // <-- retorna diretamente o usuário!
    } catch (err) {
      setErrorLoginGoogle(err.message || 'Erro inesperado');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loginGoogle };
}

