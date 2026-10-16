import { useState } from 'react';
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;

const API_URL = `${URL_MAIN}/controllers/mobile/PagamentoCarteiroController.php`;

export default function UsePagamentoSeguro() {
  const [loadingPagamentoSeguro, setLoadingPagamentoSeguro] = useState(false);
  const [error, setError] = useState(null);
  const [dadosPagamentoSeguro, setDadosPagamentoSeguro] = useState('');


const pagamentoSeguro = async (serie_logado, serie_viagem_negociacao, local_partida, local_chegada, email_carteiro, cpf_carteiro, nome_carteiro, valor_seguro, tipoCobranca, holderName, cardNumber, expiryMonthYear, ccv, holderEmail, cep, numberAdress, addressComplement, holderPhone) => {
  setLoadingPagamentoSeguro(true);
  setError(null);


    
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        serie_logado,
        serie_viagem_negociacao,
        local_partida,
        local_chegada,
        email_carteiro,
        cpf_carteiro,
        nome_carteiro,
        valor_seguro,
        tipoCobranca, //metodoPagamento
        holderName, //nomeTitularCartao
        cardNumber, //cartaoCredito
        expiryMonthYear, //dataExpiracao
        ccv, //codidoCvv
        holderEmail, //emailTitularCartao
        cep, //cep
        numberAdress, //numero
        addressComplement, //complemento
        holderPhone, //celularTitularCartao
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Resposta inválida do servidor');
    }

    const jsonPagamentoSeguro = await response.json();
    setDadosPagamentoSeguro('jsonPagamentoSeguro');
    return jsonPagamentoSeguro; // <- Retorna diretamente aqui
  } catch (err) {
    setError(err.message || 'Erro inesperado');
    return null;
  } finally {
    setLoadingPagamentoSeguro(false);
  }
};



  return { pagamentoSeguro, dadosPagamentoSeguro, loadingPagamentoSeguro };
}
