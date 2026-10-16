import { useState } from 'react';
import Config from 'react-native-config';

const URL_MAIN = Config.URL_MAIN;
const API_URL = `${URL_MAIN}/controllers/mobile/LocalizacaoAtualUsuarioController.php`;

export default function UseAtualizarLocalizacaoAtualUsuario() {
  const [loadingLocalizacaoAtualUsuario, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationAtualUsuario, setLocationAtualUsuario] = useState(null);

  const localizacaoAtualUsuario = async (
    latitude,
    longitude,
    serieLogado
  ) => {
    if (!serieLogado) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    formData.append('serie_logado', serieLogado);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      const json = await response.json();
      setLocationAtualUsuario(json);
      return json;
    } catch (err) {
      setError(err.message || 'Erro inesperado');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    localizacaoAtualUsuario,
    locationAtualUsuario,
    loadingLocalizacaoAtualUsuario,
    error,
  };
}
