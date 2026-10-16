// api/fetchViagensNaoEfetivadasCarteiro.js
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;
const GOOGLE_API_KEY = Config.GOOGLE_API_KEY;

export default async function fetchViagensNaoEfetivadasCarteiro({ serie_logado }) {
  const bodyData = {
    serie_logado
  };

  const response = await fetch(`${URL_MAIN}/controllers/mobile/SelectViagensNaoEfetivadasCarteiroController.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyData),
  });

  return response;
}
