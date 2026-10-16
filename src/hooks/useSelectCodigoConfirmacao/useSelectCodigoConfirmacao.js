import {useState} from 'react';
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;

const API_URL = `${URL_MAIN}/controllers/mobile/SelectCodigoConfirmacaoController.php`;

export default function useSelectCodigoConfirmacao() {
  const [loadingSelectCodigoConfirmacao, setLoadingSelectCodigoConfirmacao] =
    useState(false);
  const [error, setError] = useState(null);
  const [selecaotCodigoConfirmacao, setSelecaotCodigoConfirmacao] =
    useState('');

  const selectCodigoConfirmacao = async codigo => {
    setLoadingSelectCodigoConfirmacao(true);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({codigo}),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Resposta inválida do servidor');
      }

      const jsonSelectCodigoConfirmacao = await response.json();
      setSelecaotCodigoConfirmacao(jsonSelectCodigoConfirmacao);
      return jsonSelectCodigoConfirmacao; // <- Retorna diretamente aqui
    } catch (err) {
      setError(err.message || 'Erro inesperado');
      return null;
    } finally {
      setLoadingSelectCodigoConfirmacao(false);
    }
  };

  return {selectCodigoConfirmacao};
}
