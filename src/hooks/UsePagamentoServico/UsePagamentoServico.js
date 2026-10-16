import { useState } from 'react';
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;

const API_URL = `${URL_MAIN}/controllers/mobile/PagamentoClienteController.php`;

export default function UsePagamentoServico() {
  const [loadingPagamentoServico, setLoadingPagamentoServico] = useState(false);
  const [error, setError] = useState(null);
  const [dadosPagamentoServico, setDadosPagamentoServico] = useState('');


const pagamentoServico = async (serie_logado, serie_viagem_negociacao, local_partida, local_chegada, email_cliente, cpf_cliente, nome_cliente, valor_servico, tipoCobranca, holderName, cardNumber, expiryMonthYear, ccv, holderEmail, cep, numberAdress, addressComplement, holderPhone) => {
  setLoadingPagamentoServico(true);
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
        email_cliente,
        cpf_cliente,
        nome_cliente,
        valor_servico,
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

    const jsonPagamentoServico = await response.json();
    setDadosPagamentoServico('jsonPagamentoServico');
    return jsonPagamentoServico; // <- Retorna diretamente aqui
  } catch (err) {
    setError(err.message || 'Erro inesperado');
    return null;
  } finally {
    setLoadingPagamentoServico(false);
  }
};



  return { pagamentoServico, dadosPagamentoServico, loadingPagamentoServico };
}
