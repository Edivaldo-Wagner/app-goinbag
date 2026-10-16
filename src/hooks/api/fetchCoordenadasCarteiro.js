// api/fetchCoordenadasCarteiro.js
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;

export default async function fetchCoordenadasCarteiro() {

  const response = await fetch(`${URL_MAIN}/controllers/mobile/SelectLatLngController.php`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response;
}
