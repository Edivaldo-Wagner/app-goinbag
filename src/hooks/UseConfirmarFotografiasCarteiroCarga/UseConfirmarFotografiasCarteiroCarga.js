import { useState } from 'react';
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;

const API_URL = `${URL_MAIN}/controllers/mobile/ConfirmarFotografiasCarteiroCargaController.php`;

export default function UseConfirmarFotografiasCarteiroCarga() {
  const [loadingConfirmacaoFotografias, setLoadingConfirmacaoFotografias] = useState(false);
  const [error, setError] = useState(null);
  const [confirmacaoFotografias, setConfirmacaoFotografias] = useState('');


const confirmarFotografias = async (serieViagemNegociacao, serieLogado, nomeCarteiro) => {
  setLoadingConfirmacaoFotografias(true);
  setError(null);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ serieViagemNegociacao, serieLogado, nomeCarteiro }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Resposta inválida do servidor');
    }

    const jsonConfirmacaoFotografias = await response.json();
    setConfirmacaoFotografias(jsonConfirmacaoFotografias);
    return jsonConfirmacaoFotografias; // <- Retorna diretamente aqui
  } catch (err) {
    setError(err.message || 'Erro inesperado');
    return null;
  } finally {
    setLoadingConfirmacaoFotografias(false);
  }
};



  return { confirmarFotografias, confirmacaoFotografias, loadingConfirmacaoFotografias };
}
