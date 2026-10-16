// api/fetchViagensNoRaio.js
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;
const GOOGLE_API_KEY = Config.GOOGLE_API_KEY;

export default async function fetchViagensNoRaio({ saindo_de, indo_para, carga, valor_seguro }) {
  const bodyData = {
    saindo_de,
    indo_para,
    carga,
    valor_seguro: 'R$ ' + valor_seguro,
    api_key_google_maps: GOOGLE_API_KEY,
  };

  const response = await fetch(`${URL_MAIN}/controllers/mobile/busca.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
       'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify(bodyData),
  });

  return response;
}
