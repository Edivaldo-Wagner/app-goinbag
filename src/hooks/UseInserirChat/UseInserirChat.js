import { useState } from 'react';
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;

const API_URL = `${URL_MAIN}/controllers/mobile/InserirChatController.php`;

export default function UseInserirChat() {
  const [loadingInserirChat, setLoadingInserirChat] = useState(false);
  const [error, setError] = useState(null);
  const [insercaoChat, setInsercaoChat] = useState('');


const inserirChat = async (
  tipoUsuarioChat, // tipo_usuario_chat
  mensagem, // mensagem
  serieLogado, // serie_logado  
  serieViagemNegociacaoChat, // serie_viagem_negociacao_chat
  serieClienteChat, // serie_cliente_chat
  nomeClienteChat, //nome_cliente_chat
  emailClienteChat, // email_cliente_chat
  serieCarteiroChat, // serie_carteiro_chat
  nomeCarteiroChat, // nome_carteiro_chat
  emailCarteiroChat, // email_carteiro_chat
  serieDestinatarioChat, // serie_destinatario_chat
  nomeDestinatarioChat, // nome_destinatario_chat
  emailDestinatarioChat, // email_destinatario_chat

  ) => {
  setLoadingInserirChat(true);
  setError(null);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(
        { 
          tipoUsuarioChat, // tipo_usuario_chat
          mensagem, // mensagem
          serieLogado, // serie_logado  
          serieViagemNegociacaoChat, // serie_viagem_negociacao_chat
          serieClienteChat, // serie_cliente_chat
          nomeClienteChat, //nome_cliente_chat
          emailClienteChat, // email_cliente_chat
          serieCarteiroChat, // serie_carteiro_chat
          nomeCarteiroChat, // nome_carteiro_chat
          emailCarteiroChat, // email_carteiro_chat
          serieDestinatarioChat, // serie_destinatario_chat
          nomeDestinatarioChat, // nome_destinatario_chat
          emailDestinatarioChat, // email_destinatario_chat
        }),
    });



    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Resposta inválida do servidor');
    }

    const jsonInserirChat = await response.json();
    console.log(jsonInserirChat)
    setInsercaoChat(jsonInserirChat);
    return jsonInserirChat; // <- Retorna diretamente aqui
  } catch (err) {
    setError(err.message || 'Erro inesperado');
    return null;
  } finally {
    setLoadingInserirChat(false);
  }
};



  return { inserirChat, insercaoChat, loadingInserirChat };
}
