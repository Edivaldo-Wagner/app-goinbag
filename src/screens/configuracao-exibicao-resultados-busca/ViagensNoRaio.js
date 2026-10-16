import React, {useState, useEffect} from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import LocalizacaoAtual from '../../components/localizacaoAtual/LocalizacaoAtual';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import styles from './ViagensNoRaio.styles';
import ResultadosBuscaSessionStore from '../resultados-busca/ResultadosBuscaSessionStore';
import UseViagensNoRaioDesejado from '../../hooks/UseViagensNoRaioDesejado/UseViagensNoRaioDesejado';
import UseInserirViagensEmNegociacao from '../../hooks/UseInserirViagensEmNegociacao/UseInserirViagensEmNegociacao';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import ClienteSessionStore from '../painel-controle-cliente/ClienteSessionStore';
import Config from 'react-native-config';

const URL_MAIN = Config.URL_MAIN;

export default function ViagensNoRaio({
  setShowEditarBuscaModal,
  abrirModalEditarBusca,
  setModalVisibleEditarBusca,
  setShowWarningNoTravelModal,
}) {
  const navigation = useNavigation();
  const {height, width} = useWindowDimensions();
  const isSmall = width < 360;

  // -----------------------  ESTADOS DOS FILTROS -----------------------
  const [filtroRecomendadas, setFiltroRecomendadas] = useState('rapido'); // "rapido" | "preco"
  const [filtroOutras, setFiltroOutras] = useState('origem'); // "origem" | "destino"

  // -----------------------------------------------------------
  const origem = ResultadosBuscaSessionStore.getOrigem();
  const destino = ResultadosBuscaSessionStore.getDestino();
  const carga = ResultadosBuscaSessionStore.getCarga();
  const valorSeguro = ResultadosBuscaSessionStore.getValorSeguro();

  const {viagensNoRaioDesejado, viagensNoRaioNaoDesejado, loading} =
    UseViagensNoRaioDesejado({
      saindo_de: origem,
      indo_para: destino,
      carga,
      valor_seguro: valorSeguro,
    });

  const {inserirViagensEmNegociacao} = UseInserirViagensEmNegociacao();

  const openEditarBuscaModal = () => {
    setShowEditarBuscaModal(true);
    setTimeout(() => {
      abrirModalEditarBusca('saindoDe');
    }, 1000);
  };

  // ----------------------- HELPERS PARA OS FILTROS -----------------------
  const toNumberDistancia = valor => {
    if (!valor) return Infinity;
    const clean = valor
      .replace(/\s/g, '') // remove espaços
      .replace(/[^\d.,]/g, '') // remove tudo que não é número, ponto ou vírgula
      .replace(',', '.'); // substitui vírgula por ponto
    const n = parseFloat(clean);
    return isNaN(n) ? Infinity : n;
  };

  const toNumberPreco = valor => {
    if (!valor) return 0;
    return parseFloat(valor.replace('.', '').replace(',', '.'));
  };

  // ----------------------- APLICANDO FILTROS -----------------------
  let viagensRecomendadas = [...viagensNoRaioDesejado];
  let viagensOutras = [...viagensNoRaioNaoDesejado];

  if (filtroRecomendadas === 'rapido') {
    viagensRecomendadas.sort(
      (a, b) =>
        toNumberDistancia(a.distancia_viagem) -
        toNumberDistancia(b.distancia_viagem),
    );
  }

  if (filtroRecomendadas === 'preco') {
    viagensRecomendadas.sort(
      (a, b) => toNumberPreco(a.valor_servico) - toNumberPreco(b.valor_servico),
    );
  }

  if (filtroOutras === 'origem') {
    viagensOutras.sort(
      (a, b) =>
        toNumberDistancia(a.distancia_viagem) -
        toNumberDistancia(b.distancia_viagem),
    );
  }

  if (filtroOutras === 'destino') {
    viagensOutras.sort(
      (a, b) =>
        toNumberDistancia(a.distancia_destino) -
        toNumberDistancia(b.distancia_destino),
    );
  }

  // ---------------------- CONFIGURAÇÕES DE TELAS -----------------------
  const availableWidthNoRaio = width - 68;
  const avatarWidthNoRaio = 52;
  let iconSizeNoRaio = 20;
  let iconTextSizeNoRaio = 12;
  let iconBoxWidthNoRaio = 70;

  if (width < 350) {
    iconSizeNoRaio = 16;
    iconTextSizeNoRaio = 10;
    iconBoxWidthNoRaio = 55;
  } else if (width < 450) {
    iconSizeNoRaio = 18;
    iconTextSizeNoRaio = 11;
    iconBoxWidthNoRaio = 50;
  }

  const totalIconsWidthNoRaio = iconBoxWidthNoRaio * 3 + 8 * 2;
  const userInfoMaxWidthNoRaio =
    availableWidthNoRaio - avatarWidthNoRaio - totalIconsWidthNoRaio - 10;

  const isSmallScreenNoRaio = width < 400;

  // -------------------- ÍCONE DE MEIO DE TRANSPORTE ----------------------
  const getTransporteIconNoRaio = tipo => {
    switch ((tipo || '').toLowerCase()) {
      case 'avião':
      case 'aviao':
        return {name: 'flight', label: 'Avião'};
      case 'ônibus':
      case 'onibus':
        return {name: 'directions-bus', label: 'Ônibus'};
      case 'carro':
        return {name: 'directions-car', label: 'Carro'};
      case 'moto':
        return {name: 'two-wheeler', label: 'Moto'};
      case 'trem':
        return {name: 'train', label: 'Trem'};
      default:
        return {name: 'help', label: 'Desconhecido'};
    }
  };

  // -------------------- REDIRECIONAR PARA DETALHE -----------------------
  const redirectVisualizarViagem = async (
    serie_viagem_resultados_busca,
    valorServico,
  ) => {
    let serie_logado_cliente = await AsyncStorage.getItem('serie_logado');
    let valorSeguroReplaced =
      'R$ ' + valorSeguro.replace(' ', '').replace('.', ','); // valorSeguro
    //let valorServico = `R$${valor_total_servico_inteira}.${valor_total_servico_decimal}` // valorServico

    let dadosVisualizarViagem = viagensNoRaioDesejado.find(
      item => item.serie_viagem === serie_viagem_resultados_busca,
    );
    if (!dadosVisualizarViagem) {
      dadosVisualizarViagem = viagensNoRaioNaoDesejado.find(
        item => item.serie_viagem === serie_viagem_resultados_busca,
      );
    }

    /*console.log({
  cidadeDeOndeVaiSair: dadosVisualizarViagem.cidade_de_onde_vai_sair,
  cidadeDeOndeVaiSairLat: dadosVisualizarViagem.cidade_de_onde_vai_sair_lat,
  cidadeDeOndeVaiSairLng: dadosVisualizarViagem.cidade_de_onde_vai_sair_lng,
  cidadeParaOndeVai: dadosVisualizarViagem.cidade_para_onde_vai,
  cidadeParaOndeVaiLat: dadosVisualizarViagem.cidade_para_onde_vai_lat,
  cidadeParaOndeVaiLng: dadosVisualizarViagem.cidade_para_onde_vai_lng,
  dataPartidaNormal: dadosVisualizarViagem.data_partida,
  dataChegadaNormal: dadosVisualizarViagem.data_chegada,
  dataPartidaParaBusca: dadosVisualizarViagem.data_partida_para_busca,
  dataChegadaParaBusca: dadosVisualizarViagem.data_chegada_para_busca,
  horasPartida: dadosVisualizarViagem.horas_partida,
  horasChegada: dadosVisualizarViagem.horas_chegada,
  valorServico,
  tipoEncomenda: dadosVisualizarViagem.tipo_encomenda,
  tipoEncomendaDoCliente: dadosVisualizarViagem.tipo_encomenda_do_cliente,
  meioTransporte: dadosVisualizarViagem.meio_transporte,
  informacaoSobreTrajeto: dadosVisualizarViagem.informacao_sobre_trajeto,
  serieLogadoCliente: serie_logado_cliente,
  serieEstrangeiraCarteiro: dadosVisualizarViagem.serie_estrangeira_carteiro,
  valorSeguroReplaced,
  duracaoViagem: dadosVisualizarViagem.duracao_viagem,
  rotaSelecionada: dadosVisualizarViagem.rota_selecionada,
  serieViagem: dadosVisualizarViagem.serie_viagem
});
return*/

    //console.log(dadosVisualizarViagem.meio_transporte)

    if (
      dadosVisualizarViagem.meio_transporte === 'Avião' ||
      dadosVisualizarViagem.meio_transporte === 'Aviao'
    ) {
      ClienteSessionStore.setMeioTransporte('aereo');
    } else {
      ClienteSessionStore.setMeioTransporte('terrestre');
    }

    ClienteSessionStore.setSerieVisualizarViagem(serie_viagem_resultados_busca);
    ClienteSessionStore.setCodidoPixGeradoAtualmente(false);
    //ClienteSessionStore.setSerieViagemEmNegociacao(dadosVisualizarViagem.serie_viagem_negociacao); // IRA VIR SO INSERT
    ClienteSessionStore.setPixPago(false);
    ClienteSessionStore.setQrcodePix('');
    ClienteSessionStore.setCodigoCopiaColaPix('');
    ClienteSessionStore.setTipoPagamento('cartao_credito');
    ClienteSessionStore.setTransporte(dadosVisualizarViagem.meio_transporte);

    if (
      dadosVisualizarViagem.meio_transporte === 'Avião' ||
      dadosVisualizarViagem.meio_transporte === 'Aviao'
    ) {
      ClienteSessionStore.setTransporte('Avião');
    } else if (
      dadosVisualizarViagem.meio_transporte === 'Ônibus' ||
      dadosVisualizarViagem.meio_transporte === 'Onibus'
    ) {
      ClienteSessionStore.setTransporte('Ônibus');
    }

    ClienteSessionStore.setSerieEstrangeiraCarteiroVisualizarViagem(
      dadosVisualizarViagem.serie_estrangeira_carteiro,
    );
    ClienteSessionStore.setRotaSelecionada(
      dadosVisualizarViagem.rota_selecionada,
    );
    ClienteSessionStore.setCidadeOrigem(
      dadosVisualizarViagem.cidade_de_onde_vai_sair,
    );
    ClienteSessionStore.setCidadeOrigemLat(
      dadosVisualizarViagem.cidade_de_onde_vai_sair_lat,
    );
    ClienteSessionStore.setCidadeOrigemLng(
      dadosVisualizarViagem.cidade_de_onde_vai_sair_lng,
    );

    ClienteSessionStore.setCidadeDestino(
      dadosVisualizarViagem.cidade_para_onde_vai,
    );
    ClienteSessionStore.setCidadeDestinoLat(
      dadosVisualizarViagem.cidade_para_onde_vai_lat,
    );
    ClienteSessionStore.setCidadeDestinoLng(
      dadosVisualizarViagem.cidade_para_onde_vai_lng,
    );

    ClienteSessionStore.setDataPartida(dadosVisualizarViagem.data_partida);
    ClienteSessionStore.setDataPartidaParaBusca(
      dadosVisualizarViagem.data_partida_para_busca,
    );
    ClienteSessionStore.setHoraPartida(dadosVisualizarViagem.horas_partida);
    ClienteSessionStore.setDataChegada(dadosVisualizarViagem.data_chegada);
    ClienteSessionStore.setDataChegadaParaBusca(
      dadosVisualizarViagem.data_chegada_para_busca,
    );
    ClienteSessionStore.setHoraChegada(dadosVisualizarViagem.horas_partida);

    ClienteSessionStore.setTipoEncomenda(dadosVisualizarViagem.tipo_encomenda);
    ClienteSessionStore.setTipoEncomendaDoCliente(
      dadosVisualizarViagem.tipo_encomenda_do_cliente,
    );
    ClienteSessionStore.setDuracaoViagem(dadosVisualizarViagem.duracao_viagem);
    ClienteSessionStore.setInformacaoSobreTrajeto(
      dadosVisualizarViagem.informacao_sobre_trajeto,
    );

    ClienteSessionStore.setValorServico(`${valorServico.replace(',', '.')}`);
    ClienteSessionStore.setValorSeguro(
      valorSeguro.replace(' ', '').replace(',', '.'),
    );

    await AsyncStorage.removeItem(
      'redireccionamento_cliente_visualizar_viagem',
    );
    if (!serie_logado_cliente) {
      await AsyncStorage.setItem('login_como', 'cliente');
      await AsyncStorage.setItem(
        'redireccionamento_cliente_visualizar_viagem',
        '1',
      );
      ClienteSessionStore.setValorServicoSeNaoLogado(valorServico);
      ClienteSessionStore.setValorSeguroSeNaoLogado(valorSeguroReplaced);
      navigation.navigate('Login');
      return;
    }

    let resultViagensEmNegociacao = await inserirViagensEmNegociacao(
      dadosVisualizarViagem.cidade_de_onde_vai_sair, // cidadeDeOndeVaiSair
      dadosVisualizarViagem.cidade_de_onde_vai_sair_lat, // cidadeDeOndeVaiSairLat
      dadosVisualizarViagem.cidade_de_onde_vai_sair_lng, // cidadeDeOndeVaiSairLng
      dadosVisualizarViagem.cidade_para_onde_vai, // cidadeParaOndeVai
      dadosVisualizarViagem.cidade_para_onde_vai_lat, // cidadeParaOndeVaiLat
      dadosVisualizarViagem.cidade_para_onde_vai_lng, // cidadeParaOndeVaiLng
      dadosVisualizarViagem.data_partida, // dataPartida
      dadosVisualizarViagem.data_chegada, // dataChegada
      dadosVisualizarViagem.data_partida_para_busca, // dataPartidaParaBusca
      dadosVisualizarViagem.data_chegada_para_busca, // dataChegadaParaBusca
      dadosVisualizarViagem.horas_partida, // horasPartida
      dadosVisualizarViagem.horas_chegada, // horasChegada
      valorServico, // valorServico
      dadosVisualizarViagem.tipo_encomenda, // tipoEncomenda
      dadosVisualizarViagem.tipo_encomenda_do_cliente, // tipoEncomendaDoCliente
      ClienteSessionStore.getTransporte(), // meioTransporte
      dadosVisualizarViagem.informacao_sobre_trajeto, // informacaoSobreTrajeto
      serie_logado_cliente, // serieLogadoCliente
      dadosVisualizarViagem.serie_estrangeira_carteiro, // serieEstrangeiraCarteiro
      valorSeguroReplaced, // valorSeguro
      dadosVisualizarViagem.duracao_viagem, // duracaoViagem
      dadosVisualizarViagem.rota_selecionada, // rotaSelecionada
      dadosVisualizarViagem.serie_viagem, // serieViagem
    );

    ClienteSessionStore.setSerieViagemEmNegociacao(
      resultViagensEmNegociacao.serie_viagem_negociacao,
    );

    navigation.navigate('VisualizarViagemCliente');
  };

  // ---------------------------- LOADING -------------------------------
  useEffect(() => {
    if (loading) return;

    //console.log(viagensNoRaioDesejado);
    //console.log(viagensNoRaioNaoDesejado);

    if (viagensNoRaioDesejado.length === 0) {
      setShowWarningNoTravelModal(true);
    } else {
      setShowWarningNoTravelModal(false);
    }
  }, [viagensNoRaioDesejado, viagensNoRaioNaoDesejado, loading]);

  if (loading) {
    return (
      <View
        style={{
          minHeight: height - 180,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator size="large" color="#007ACC" />
      </View>
    );
  }

  return (
    <>
      <LocalizacaoAtual />
      <ScrollView contentContainerStyle={{paddingBottom: 250}}>
        {/* ------------------- GRUPO RECOMENDADAS ------------------- */}
        {viagensRecomendadas.length > 0 && (
          <View>
            {/* FILTROS: MAIS RÁPIDO / MENOS PREÇO */}
            <View
              style={[
                styles.switchRow,
                isSmallScreenNoRaio && styles.switchRowWrap,
                {marginBottom: 20},
              ]}>
              {/* Botão Editar */}
              <TouchableOpacity
                onPress={openEditarBuscaModal}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#E6F7FF',
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 30,
                  shadowColor: '#000',
                  shadowOpacity: 0.12,
                  shadowRadius: 4,
                  elevation: 3,
                  marginBottom: isSmallScreenNoRaio ? 12 : 0,
                }}>
                <MaterialIcons name="search" size={26} color="#007ACC" />
                <Text
                  style={{
                    fontFamily: 'Montserrat-Bold',
                    color: '#007ACC',
                    fontSize: 16,
                    marginLeft: 6,
                  }}>
                  Editar
                </Text>
              </TouchableOpacity>

              {/* --- Segmented Control (Mais rápido / Menos preço) --- */}
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: '#F2F7FB',
                  padding: 4,
                  borderRadius: 30,
                  marginLeft: 'auto',
                  shadowColor: '#000',
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: 2,
                }}>
                {/* MAIS RÁPIDO */}
                <TouchableOpacity
                  onPress={() => setFiltroRecomendadas('rapido')}
                  style={[
                    {
                      paddingVertical: 8,
                      paddingHorizontal: 18,
                      borderRadius: 30,
                      justifyContent: 'center',
                    },
                    filtroRecomendadas === 'rapido'
                      ? {
                          backgroundColor: '#007ACC',
                          shadowColor: '#007ACC',
                          shadowOpacity: 0.25,
                          shadowRadius: 6,
                          elevation: 3,
                        }
                      : {},
                  ]}>
                  <Text
                    style={{
                      color:
                        filtroRecomendadas === 'rapido' ? '#FFF' : '#007ACC',
                      fontFamily: 'Montserrat-Bold',
                      fontSize: 15,
                    }}>
                    Mais Rápido
                  </Text>
                </TouchableOpacity>

                {/* MENOS PREÇO */}
                <TouchableOpacity
                  onPress={() => setFiltroRecomendadas('preco')}
                  style={[
                    {
                      paddingVertical: 8,
                      paddingHorizontal: 18,
                      borderRadius: 30,
                      justifyContent: 'center',
                    },
                    filtroRecomendadas === 'preco'
                      ? {
                          backgroundColor: '#007ACC',
                          shadowColor: '#007ACC',
                          shadowOpacity: 0.25,
                          shadowRadius: 6,
                          elevation: 3,
                        }
                      : {},
                  ]}>
                  <Text
                    style={{
                      color:
                        filtroRecomendadas === 'preco' ? '#FFF' : '#007ACC',
                      fontFamily: 'Montserrat-Bold',
                      fontSize: 15,
                    }}>
                    Menos Preço
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={{
                width: '100%',
                height: 1,
                backgroundColor: '#007ACC',
                marginBottom: 10,
              }}
            />

            <View style={{padding: 10, flexDirection: 'row'}}>
              <MaterialIcons
                name="star"
                size={28}
                color="#FFAA00"
                style={{marginLeft: -10, marginTop: 0}}
              />
              <Text
                style={{
                  fontFamily: 'Montserrat-Bold',
                  color: '#007ACC',
                  fontSize: 18,
                  marginTop: 1,
                  marginLeft: 5,
                }}>
                Recomendado para Você
              </Text>
            </View>

            <View style={{flex: 1, alignItems: 'center'}}>
              {viagensRecomendadas.map((viagem, index) => {
                const transporteNoRaio = getTransporteIconNoRaio(
                  viagem.meio_transporte,
                );

                return (
                  <View key={index} style={styles.card}>
                    {/* ORIGEM / DESTINO */}
                    <View style={styles.origemDestino}>
                      <View style={styles.cidade}>
                        <Text style={styles.cidadeTitulo} numberOfLines={1}>
                          {viagem.cidade_de_onde_vai_sair}
                        </Text>
                        <Text style={styles.cidadeData} numberOfLines={1}>
                          {viagem.data_partida_para_busca} às{' '}
                          {viagem.horas_partida}
                        </Text>
                      </View>

                      <Text style={styles.separador}>•••</Text>

                      <View style={[styles.cidade, {alignItems: 'flex-end'}]}>
                        <Text style={styles.cidadeTitulo} numberOfLines={1}>
                          {viagem.cidade_para_onde_vai}
                        </Text>
                        <Text style={styles.cidadeData} numberOfLines={1}>
                          {viagem.data_chegada_para_busca} às{' '}
                          {viagem.horas_chegada}
                        </Text>
                      </View>
                    </View>

                    {/* USUÁRIO */}
                    <View style={styles.usuario}>
                      <Image
                        source={{
                          uri: `${URL_MAIN}/views/painel-controle-carteiro/img-carteiro/${viagem.serie_estrangeira_carteiro}/img.png`,
                        }}
                        style={styles.avatar}
                      />
                      <View>
                        <Text style={styles.nomeUsuario} numberOfLines={1}>
                          {viagem.nome_carteiro}
                        </Text>
                        <Text style={styles.subUsuario}>Carteiro</Text>
                      </View>
                    </View>

                    {/* INFO TRANSPORTE */}
                    <View style={styles.infoTransporte}>
                      {[
                        {
                          name: transporteNoRaio.name,
                          label: transporteNoRaio.label,
                        },
                        {name: 'schedule', label: viagem.duracao_viagem},
                        {name: 'archive', label: 'Mala'},
                      ].map((item, i) => (
                        <View key={i} style={styles.cardInfo}>
                          <MaterialIcons
                            name={item.name}
                            size={18}
                            color="#0090e8"
                            style={{marginTop: 5}}
                          />
                          <Text style={styles.cardInfoText} numberOfLines={1}>
                            {item.label}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* DESCRIÇÃO */}
                    <Text style={styles.descricao}>
                      {viagem.informacao_sobre_trajeto}
                    </Text>

                    {/* RODAPÉ */}
                    <View
                      style={[
                        styles.rodape,
                        isSmall && {
                          flexDirection: 'column',
                          alignItems: 'stretch',
                        },
                      ]}>
                      <Text style={styles.preco}>
                        R$ {viagem.valor_servico}
                      </Text>

                      <TouchableOpacity
                        style={[
                          styles.botao,
                          isSmall && {width: '100%', marginTop: 10},
                        ]}
                        onPress={() =>
                          redirectVisualizarViagem(
                            viagem.serie_viagem,
                            viagem.valor_servico,
                          )
                        }>
                        <Text style={styles.botaoTexto}>Reservar espaço</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ------------------- GRUPO OUTRAS VIAGENS ------------------- */}
        {viagensOutras.length > 0 && (
          <View>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: isSmallScreenNoRaio ? 'wrap' : 'nowrap',
                alignItems: 'center',
                marginBottom: 20,
                paddingTop: 20,
              }}>
              {viagensRecomendadas.length === 0 && (
                <TouchableOpacity
                  onPress={openEditarBuscaModal}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#E6F7FF',
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: 30,
                    marginBottom: isSmallScreenNoRaio ? 12 : 0,
                    shadowColor: '#000',
                    shadowOpacity: 0.12,
                    shadowRadius: 4,
                    elevation: 3,
                  }}>
                  <MaterialIcons name="search" size={26} color="#007ACC" />
                  <Text
                    style={{
                      fontFamily: 'Montserrat-Bold',
                      color: '#007ACC',
                      fontSize: 16,
                      marginLeft: 6,
                    }}>
                    Editar
                  </Text>
                </TouchableOpacity>
              )}

              {/* --- NOVO SEGMENTED CONTROL --- */}
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: '#F2F7FB',
                  padding: 4,
                  borderRadius: 30,
                  marginLeft: 'auto',
                  shadowColor: '#000',
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: 2,
                }}>
                {/* ORIGEM */}
                <TouchableOpacity
                  onPress={() => setFiltroOutras('origem')}
                  style={[
                    {
                      paddingVertical: 8,
                      paddingHorizontal: 18,
                      borderRadius: 30,
                      justifyContent: 'center',
                    },
                    filtroOutras === 'origem'
                      ? {
                          backgroundColor: '#007ACC',
                          shadowColor: '#007ACC',
                          shadowOpacity: 0.25,
                          shadowRadius: 6,
                          elevation: 3,
                        }
                      : {},
                  ]}>
                  <Text
                    style={{
                      color: filtroOutras === 'origem' ? '#FFF' : '#007ACC',
                      fontFamily: 'Montserrat-Bold',
                      fontSize: 15,
                    }}>
                    Cidade de Origem
                  </Text>
                </TouchableOpacity>

                {/* DESTINO */}
                <TouchableOpacity
                  onPress={() => setFiltroOutras('destino')}
                  style={[
                    {
                      paddingVertical: 8,
                      paddingHorizontal: 18,
                      borderRadius: 30,
                      justifyContent: 'center',
                    },
                    filtroOutras === 'destino'
                      ? {
                          backgroundColor: '#007ACC',
                          shadowColor: '#007ACC',
                          shadowOpacity: 0.25,
                          shadowRadius: 6,
                          elevation: 3,
                        }
                      : {},
                  ]}>
                  <Text
                    style={{
                      color: filtroOutras === 'destino' ? '#FFF' : '#007ACC',
                      fontFamily: 'Montserrat-Bold',
                      fontSize: 15,
                    }}>
                    Cidade de Destino
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={{
                width: '100%',
                height: 1,
                backgroundColor: '#007ACC',
                marginBottom: 10,
              }}
            />

            <View style={{padding: 10, flexDirection: 'row'}}>
              <MaterialIcons
                name="radio-button-unchecked"
                size={24}
                color="#FFAA00"
                style={{marginLeft: -10, marginTop: 2.5}}
              />
              <Text
                style={{
                  fontFamily: 'Montserrat-Bold',
                  color: '#007ACC',
                  fontSize: 18,
                  marginTop: 1,
                  marginLeft: 5,
                }}>
                Outras Viagens Encontradas
              </Text>
            </View>

            <View style={{flex: 1, alignItems: 'center'}}>
              {viagensOutras.map((viagem, index) => {
                const transporteNoRaio = getTransporteIconNoRaio(
                  viagem.meio_transporte,
                );

                return (
                  <View key={index} style={styles.card}>
                    {/* ORIGEM / DESTINO */}
                    <View style={styles.origemDestino}>
                      <View style={styles.cidade}>
                        <Text style={styles.cidadeTitulo} numberOfLines={1}>
                          {viagem.cidade_de_onde_vai_sair}
                        </Text>
                        <Text style={styles.cidadeData} numberOfLines={1}>
                          {viagem.data_partida_para_busca} às{' '}
                          {viagem.horas_partida}
                        </Text>
                      </View>

                      <Text style={styles.separador}>•••</Text>

                      <View style={[styles.cidade, {alignItems: 'flex-end'}]}>
                        <Text style={styles.cidadeTitulo} numberOfLines={1}>
                          {viagem.cidade_para_onde_vai}
                        </Text>
                        <Text style={styles.cidadeData} numberOfLines={1}>
                          {viagem.data_chegada_para_busca} às{' '}
                          {viagem.horas_chegada}
                        </Text>
                      </View>
                    </View>

                    {/* USUÁRIO */}
                    <View style={styles.usuario}>
                      <Image
                        source={{
                          uri: `${URL_MAIN}/views/painel-controle-carteiro/img-carteiro/${viagem.serie_estrangeira_carteiro}/img.png`,
                        }}
                        style={styles.avatar}
                      />
                      <View>
                        <Text style={styles.nomeUsuario} numberOfLines={1}>
                          {viagem.nome_carteiro}
                        </Text>
                        <Text style={styles.subUsuario}>Carteiro</Text>
                      </View>
                    </View>

                    {/* INFO TRANSPORTE */}
                    <View style={styles.infoTransporte}>
                      {[
                        {
                          name: transporteNoRaio.name,
                          label: transporteNoRaio.label,
                        },
                        {name: 'schedule', label: viagem.duracao_viagem},
                        {name: 'archive', label: 'Mala'},
                      ].map((item, i) => (
                        <View key={i} style={styles.cardInfo}>
                          <MaterialIcons
                            name={item.name}
                            size={18}
                            color="#0090e8"
                            style={{marginTop: 5}}
                          />
                          <Text style={styles.cardInfoText} numberOfLines={1}>
                            {item.label}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* DESCRIÇÃO */}
                    <Text style={styles.descricao} numberOfLines={2}>
                      {viagem.informacao_sobre_trajeto}
                    </Text>

                    {/* RODAPÉ */}
                    <View
                      style={[
                        styles.rodape,
                        isSmall && {
                          flexDirection: 'column',
                          alignItems: 'stretch',
                        },
                      ]}>
                      <Text style={styles.preco}>
                        R$ {viagem.valor_servico}
                      </Text>

                      <TouchableOpacity
                        style={[
                          styles.botao,
                          isSmall && {width: '100%', marginTop: 10},
                        ]}
                        onPress={() =>
                          redirectVisualizarViagem(
                            viagem.serie_viagem,
                            viagem.valor_servico,
                          )
                        }>
                        <Text style={styles.botaoTexto}>Reservar espaço</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </>
  );
}
