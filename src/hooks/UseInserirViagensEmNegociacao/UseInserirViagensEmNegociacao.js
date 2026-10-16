import { useState } from 'react';
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;

const API_URL = `${URL_MAIN}/controllers/mobile/ViagensEmNegociacaoController.php`;

export default function UseInserirViagensEmNegociacao() {
  const [loadingInserirViagensEmNegociacao, setLoadingInserirViagensEmNegociacao] = useState(false);
  const [error, setError] = useState(null);
  const [insercaoViagensEmNegociacao, setInsercaoViagensEmNegociacao] = useState('');


const inserirViagensEmNegociacao = async (
  cidadeDeOndeVaiSair, // cidade_de_onde_vai_sair
  cidadeDeOndeVaiSairLat, // cidade_de_onde_vai_sair_lat
  cidadeDeOndeVaiSairLng, // cidade_de_onde_vai_sair_lng
  cidadeParaOndeVai, // cidade_para_onde_vai
  cidadeParaOndeVaiLat, // cidade_para_onde_vai_lat
  cidadeParaOndeVaiLng, // cidade_para_onde_vai_lng
  dataPartida, // data_partida
  dataChegada, // data_chegada
  dataPartidaParaBusca, // data_partida_para_busca
  dataChegadaParaBusca, // data_chegada_para_busca
  horasPartida, // horas_partida
  horasChegada, // horas_chegada
  valorServico, // valor_total_servico_inteira valor_total_servico_decimal
  tipoEncomenda, // tipo_encomenda
  tipoEncomendaDoCliente, // tipo_encomenda_do_cliente
  meioTransporte, // meio_transporte
  informacaoSobreTrajeto, // informacao_sobre_trajeto
  serieLogadoCliente, //serie_logado_cliente
  serieEstrangeiraCarteiro, // serie_estrangeira_carteiro
  valorSeguro, // valorSeguro
  duracaoViagem, // duracao_viagem
  rotaSelecionada, // rota_selecionada
  serieViagem, // serie_viagem
  ) => {
  setLoadingInserirViagensEmNegociacao(true);
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
          cidadeDeOndeVaiSair, // cidade_de_onde_vai_sair
          cidadeDeOndeVaiSairLat, // cidade_de_onde_vai_sair_lat
          cidadeDeOndeVaiSairLng, // cidade_de_onde_vai_sair_lng
          cidadeParaOndeVai, // cidade_para_onde_vai
          cidadeParaOndeVaiLat, // cidade_para_onde_vai_lat
          cidadeParaOndeVaiLng, // cidade_para_onde_vai_lng
          dataPartida, // data_partida
          dataChegada, // data_chegada
          dataPartidaParaBusca, // data_partida_para_busca
          dataChegadaParaBusca, // data_chegada_para_busca
          horasPartida, // horas_partida
          horasChegada, // horas_chegada
          valorServico, // valorServico
          tipoEncomenda, // tipo_encomenda
          tipoEncomendaDoCliente, // tipo_encomenda_do_cliente
          meioTransporte, // meio_transporte
          informacaoSobreTrajeto, // informacao_sobre_trajeto
          serieLogadoCliente, //serie_logado_cliente
          serieEstrangeiraCarteiro, // serie_estrangeira_carteiro
          valorSeguro, // valorSeguro
          duracaoViagem, // duracao_viagem
          rotaSelecionada, // rota_selecionada
          serieViagem, // serie_viagem
        }),
    });



    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Resposta inválida do servidor');
    }

    const jsonInserirViagensEmNegociacao = await response.json();
    console.log(jsonInserirViagensEmNegociacao)
    setInsercaoViagensEmNegociacao(jsonInserirViagensEmNegociacao);
    return jsonInserirViagensEmNegociacao; // <- Retorna diretamente aqui
  } catch (err) {
    setError(err.message || 'Erro inesperado');
    return null;
  } finally {
    setLoadingInserirViagensEmNegociacao(false);
  }
};



  return { inserirViagensEmNegociacao, insercaoViagensEmNegociacao, loadingInserirViagensEmNegociacao };
}
