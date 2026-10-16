import { useState } from 'react';
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;

const API_URL = `${URL_MAIN}/controllers/mobile/ExcluirNotificacoes.php`;

export default function UseRemoverNotificacoesGerais() {
  const [loadingRemoverNotificacoesGerais, setLoadingRemoverNotificacoesGerais] = useState(false);
  const [error, setError] = useState(null);
  const [removerNotificacoesGerais, setRemoverNotificacoesGerais] = useState(null);

  const removendoNotificacoesGerais = async (idNotificacao) => {
    setLoadingRemoverNotificacoesGerais(true);
    setError(null);

    //console.log(email)
    //console.log(tipoUsuario)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idNotificacao }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Resposta inválida do servidor');
      }

      const json = await response.json();

      if (json.status !== 'sucesso') {
        throw new Error(json.mensagem || 'Falha no login');
      }

      setRemoverNotificacoesGerais(json);       // continua setando o estado
      return json;            // <-- retorna diretamente o usuário!
    } catch (err) {
      setError(err.message || 'Erro inesperado');
      return null;
    } finally {
      setLoadingRemoverNotificacoesGerais(false);
    }
  };

  return { removendoNotificacoesGerais, removerNotificacoesGerais, loadingRemoverNotificacoesGerais };
}

