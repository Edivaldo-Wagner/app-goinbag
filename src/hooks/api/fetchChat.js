// api/fetchChat.js
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;

export default async function fetchChat(/*{ saindo_de, indo_para, carga, valor_seguro }*/) {
  /*const bodyData = {
    saindo_de,
    indo_para,
    carga,
    valor_seguro: 'R$ ' + valor_seguro,
    api_key_google_maps: GOOGLE_API_KEY,
  };*/

  const response = await fetch(`${URL_MAIN}/controllers/mobile/SelectChatController.php`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    //body: JSON.stringify(bodyData),
  });

  return response;
}
