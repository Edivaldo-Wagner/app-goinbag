import React, {useState, useEffect, useRef} from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  useWindowDimensions,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import logo from '../../assets/logo/mini-logo.png';
import no_image from '../../assets/images/no-image.png';
import styles from './PainelCarteiro.styles';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import {TextInputMask} from 'react-native-masked-text';
import CountryFlag from 'react-native-country-flag';
import TravelsAvailable from './TravelsAvailable';
import UseConfirmarFotografiasCarteiroCarga from '../../hooks/UseConfirmarFotografiasCarteiroCarga/UseConfirmarFotografiasCarteiroCarga';
import UseCancelarViagemEmNegociacaoCarteiro from '../../hooks/UseCancelarViagemEmNegociacaoCarteiro/UseCancelarViagemEmNegociacaoCarteiro';
import HeaderCarteiro from '../../components/headerCarteiro/HeaderCarteiro';
import UseViagensDisponibilizadas from '../../hooks/UseViagens/UseViagensDisponibilizadas';
import UseUsuarios from '../../hooks/UseUsuarios/UseUsuarios';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CarteiroSessionStore from './CarteiroSessionStore';
import Config from 'react-native-config';

const URL_MAIN = Config.URL_MAIN;

export default function TripsProgressTraveler() {
  const navigation = useNavigation();
  const {width} = useWindowDimensions();

  const screenWidth = Dimensions.get('window').width;
  const itemWidth = Math.min(screenWidth * 0.35, 200);

  const {
    confirmarFotografias,
    confirmacaoFotografias,
    loadingConfirmacaoFotografias,
  } = UseConfirmarFotografiasCarteiroCarga();
  const {
    inserirCancelarViagemEmNegociacao,
    insercaoCancelarViagemEmNegociacao,
    loadingCancelarViagemEmNegociacao,
  } = UseCancelarViagemEmNegociacaoCarteiro();
  const [sendingData, setsendingData] = useState(false);
  const [
    showBtnModalConfirmacaoFotografias,
    setShowBtnModalConfirmacaoFotografias,
  ] = useState(true);
  const [
    showExcluirViagemEmNegociacaoModal,
    setShowExcluirViagemEmNegociacaoModal,
  ] = useState(false);
  const [
    showEditarModalDadosDestinatario,
    setShowEditarModalDadosDestinatario,
  ] = useState(false);
  const [showEditarModalFotografias, setShowEditarModalFotografias] =
    useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [fotografia1ViagemNegociacao, setfotografia1ViagemNegociacao] =
    useState(no_image);
  const [fotografia2ViagemNegociacao, setfotografia2ViagemNegociacao] =
    useState(no_image);
  const [fotografia3ViagemNegociacao, setfotografia3ViagemNegociacao] =
    useState(no_image);
  const [fotografia4ViagemNegociacao, setfotografia4ViagemNegociacao] =
    useState(no_image);
  const [msgIconColorAlertModal, setMsgIconColorAlertModal] = useState('');
  const [msgIconAlertModal, setMsgIconAlertModal] = useState('');
  const [msgTitleAlertModal, setMsgTitleAlertModal] = useState('');
  const [msgDescAlertModal, setMsgDescAlertModal] = useState('');
  const [serieViagemNegociacao, setSerieViagemNegociacao] = useState('');
  const [nomeDestinatario, setNomeDestinatario] = useState('');
  const [emailDestinatario, setEmailDestinatario] = useState('');
  const [celularDestinatario, setCelularDestinatario] = useState('');
  const telefoneRef = useRef(null);

  const {
    viagensDisponibilizadasCarteiro,
    loadingViagensDisponibilizadasCarteiro,
    erroViagensDisponibilizadasCarteiro,
    buscarViagensDisponibilizadasCarteiro,
  } = UseViagensDisponibilizadas();

  console.log('FEITO:', viagensDisponibilizadasCarteiro);

  const {usuarios} = UseUsuarios();

  const handleModalExcluirViagemEmNegociacao = serie_viagem_negociacao => {
    setSerieViagemNegociacao(serie_viagem_negociacao);
    setShowExcluirViagemEmNegociacaoModal(true);
  };

  const handleInserirCancelarViagemEmNegociacao = async () => {
    let chave_pix = await AsyncStorage.getItem('chave_pix');

    setsendingData(true);

    let resultCancelarViagemEmNegociacao =
      await inserirCancelarViagemEmNegociacao(serieViagemNegociacao, chave_pix);

    console.log('Resultado direto da API:', resultCancelarViagemEmNegociacao);
    if (resultCancelarViagemEmNegociacao.status == 'sucesso') {
      setsendingData(false);
      setMsgIconColorAlertModal('#188211');
      setMsgIconAlertModal('task-alt');
      setMsgTitleAlertModal('SUCESSO');
      setMsgDescAlertModal('Viagem Cancelada Com Sucesso!');
      setShowAlertModal(true);
      setShowExcluirViagemEmNegociacaoModal(false);
      await buscarViagensDisponibilizadasCarteiro();
    }
  };

  const handleModalDadosDestinatario = serie_viagem_negociacao => {
    //setSerieViagemNegociacao(serie_viagem_negociacao)
    const dadosDestinatario = viagensDisponibilizadasCarteiro.filter(
      item => item.serie_viagem_negociacao === serie_viagem_negociacao,
    );
    setNomeDestinatario(
      dadosDestinatario[0].nome_confirmacacao_do_destinatario,
    );
    setEmailDestinatario(
      dadosDestinatario[0].email_confirmacacao_do_destinatario,
    );
    setCelularDestinatario(
      dadosDestinatario[0].telefone_confirmacacao_do_destinatario,
    );
    setShowEditarModalDadosDestinatario(true);
  };

  const handleFotografiasViagemNegociacao = (
    serie_viagem_negociacao,
    verificar_fotografias,
  ) => {
    setSerieViagemNegociacao(serie_viagem_negociacao);
    const dadosFotografias = viagensDisponibilizadasCarteiro.filter(
      item => item.serie_viagem_negociacao === serie_viagem_negociacao,
    );

    if (dadosFotografias[0].fotografias_inseridas == '1') {
      const timestamp = new Date().getTime();

      setfotografia1ViagemNegociacao(
        `${URL_MAIN}/views/painel-controle-destinatario/fotografias_carga/${serie_viagem_negociacao}/0.png?time=${timestamp}`,
      );
      setfotografia2ViagemNegociacao(
        `${URL_MAIN}/views/painel-controle-destinatario/fotografias_carga/${serie_viagem_negociacao}/1.png?time=${timestamp}`,
      );
      setfotografia3ViagemNegociacao(
        `${URL_MAIN}/views/painel-controle-destinatario/fotografias_carga/${serie_viagem_negociacao}/2.png?time=${timestamp}`,
      );
      setfotografia4ViagemNegociacao(
        `${URL_MAIN}/views/painel-controle-destinatario/fotografias_carga/${serie_viagem_negociacao}/3.png?time=${timestamp}`,
      );
    } else {
      setfotografia1ViagemNegociacao(
        require('../../assets/images/no-image.png'),
      );
      setfotografia2ViagemNegociacao(
        require('../../assets/images/no-image.png'),
      );
      setfotografia3ViagemNegociacao(
        require('../../assets/images/no-image.png'),
      );
      setfotografia4ViagemNegociacao(
        require('../../assets/images/no-image.png'),
      );
    }

    console.log(verificar_fotografias);

    if (verificar_fotografias == true) {
      setShowBtnModalConfirmacaoFotografias(false);
    } else {
      setShowBtnModalConfirmacaoFotografias(true);
    }

    setShowEditarModalFotografias(true);
  };

  const handleConfirmacaoFotografiasChange = async () => {
    let serie_logado = await AsyncStorage.getItem('serie_logado');
    let nome_carteiro = await AsyncStorage.getItem('nome_carteiro');
    setsendingData(true);
    let resultFotografias = await confirmarFotografias(
      serieViagemNegociacao,
      serie_logado,
      nome_carteiro,
    );

    //console.log('Resultado direto da API:', resultFotografias);
    if (resultFotografias.status == 'sucesso') {
      setsendingData(false);
      setMsgIconColorAlertModal('#188211');
      setMsgIconAlertModal('task-alt');
      setMsgTitleAlertModal('SUCESSO');
      setMsgDescAlertModal('Fotografias Confirmadas Com Sucesso!');
      setShowAlertModal(true);
      setShowEditarModalFotografias(false);
      await buscarViagensDisponibilizadasCarteiro();
    }
  };

  const redirectVisualizarViagem = (
    serie_viagem_negociacao,
    detalhes_pagamento,
  ) => {
    const dadosVisualizarViagem = viagensDisponibilizadasCarteiro.filter(
      item => item.serie_viagem_negociacao === serie_viagem_negociacao,
    );

    if (dadosVisualizarViagem[0].meio_transporte === 'Avião') {
      CarteiroSessionStore.setMeioTransporte('aereo');
    } else if (dadosVisualizarViagem[0].meio_transporte != 'Avião') {
      CarteiroSessionStore.setMeioTransporte('terrestre');
    }

    if (
      dadosVisualizarViagem[0].qrcode_pix_pagamento_seguro == null ||
      (dadosVisualizarViagem[0].qrcode_pix_pagamento_seguro == '' &&
        dadosVisualizarViagem[0].pix_pago_seguro == 0)
    ) {
      CarteiroSessionStore.setCodidoPixGeradoAtualmente(false);
    } else {
      CarteiroSessionStore.setCodidoPixGeradoAtualmente(true);
    }

    if (detalhes_pagamento == true) {
      CarteiroSessionStore.setPagamentoRealizadoSucesso(detalhes_pagamento);
    } else {
      CarteiroSessionStore.setPagamentoRealizadoSucesso(detalhes_pagamento);
    }

    CarteiroSessionStore.setSerieViagemEmNegociacao(
      dadosVisualizarViagem[0].serie_viagem_negociacao,
    );
    if (dadosVisualizarViagem[0].pix_pago_seguro == 1) {
      CarteiroSessionStore.setPixPago(true);
    } else {
      CarteiroSessionStore.setPixPago(false);
    }

    CarteiroSessionStore.setQrcodePix(
      dadosVisualizarViagem[0].qrcode_pix_pagamento_seguro,
    );
    CarteiroSessionStore.setCodigoCopiaColaPix(
      dadosVisualizarViagem[0].codigo_copia_cola_pix_pagamento_seguro,
    );

    if (dadosVisualizarViagem[0].forma_pagamento_seguro == 'cartao_credito') {
      CarteiroSessionStore.setTipoPagamento('cartao_credito');
    } else if (dadosVisualizarViagem[0].forma_pagamento_seguro == 'pix') {
      CarteiroSessionStore.setTipoPagamento('pix');
    } else {
      CarteiroSessionStore.setTipoPagamento('cartao_credito');
    }

    CarteiroSessionStore.setTransporte(
      dadosVisualizarViagem[0].meio_transporte,
    );
    CarteiroSessionStore.setRotaSelecionada(
      dadosVisualizarViagem[0].rota_selecionada,
    );
    CarteiroSessionStore.setCidadeOrigem(
      dadosVisualizarViagem[0].local_partida,
    );
    CarteiroSessionStore.setCidadeOrigemLat(
      dadosVisualizarViagem[0].local_partida_lat,
    );
    CarteiroSessionStore.setCidadeOrigemLng(
      dadosVisualizarViagem[0].local_partida_lng,
    );

    CarteiroSessionStore.setCidadeDestino(
      dadosVisualizarViagem[0].local_chegada,
    );
    CarteiroSessionStore.setCidadeDestinoLat(
      dadosVisualizarViagem[0].local_chegada_lat,
    );
    CarteiroSessionStore.setCidadeDestinoLng(
      dadosVisualizarViagem[0].local_chegada_lng,
    );

    CarteiroSessionStore.setDataPartida(dadosVisualizarViagem[0].data_partida);
    CarteiroSessionStore.setDataPartidaParaBusca(
      dadosVisualizarViagem[0].data_partida_para_busca,
    );
    CarteiroSessionStore.setHoraPartida(dadosVisualizarViagem[0].hora_chegada);
    CarteiroSessionStore.setDataChegada(dadosVisualizarViagem[0].data_chegada);
    CarteiroSessionStore.setDataChegadaParaBusca(
      dadosVisualizarViagem[0].data_chegada_para_busca,
    );
    CarteiroSessionStore.setHoraChegada(dadosVisualizarViagem[0].hora_chegada);

    CarteiroSessionStore.setTipoEncomenda(
      dadosVisualizarViagem[0].tipo_encomenda,
    );
    CarteiroSessionStore.setTipoEncomendaDoCliente(
      dadosVisualizarViagem[0].tipo_encomenda_do_cliente,
    );

    const valorSeguroOriginal = dadosVisualizarViagem[0].valor_seguro_original
      .replace('R$', '')
      .replace(',', '.')
      .replace(/\s/g, '');
    const valorSeguroCarteiro =
      Math.round(
        (parseFloat(valorSeguroOriginal) +
          (parseFloat(
            dadosVisualizarViagem[0].valor_servico
              .replace(',', '.')
              .replace('R$', ''),
          ) -
            parseFloat(
              dadosVisualizarViagem[0].valor_servico
                .replace(',', '.')
                .replace('R$', ''),
            ) /
              parseFloat(dadosVisualizarViagem[0].taxa_goinbag))) *
          100,
      ) / 100;
    CarteiroSessionStore.setValorSeguro(valorSeguroCarteiro);

    const valorServicoCarteiro = +(
      dadosVisualizarViagem[0].valor_servico
        .replace(',', '.')
        .replace('R$', '') / dadosVisualizarViagem[0].taxa_goinbag
    ).toFixed(2);
    CarteiroSessionStore.setValorServico(valorServicoCarteiro);

    navigation.navigate('VisualizarViagemCarteiro');
  };

  const redirectChat = async serie_viagem_negociacao => {
    console.log(serie_viagem_negociacao);

    const dadosChat = viagensDisponibilizadasCarteiro.filter(
      item => item.serie_viagem_negociacao === serie_viagem_negociacao,
    );
    let dadosCarteiroChat = usuarios.filter(
      item => item.serie === dadosChat[0].serie_estrangeira_carteiro,
    );
    let dadosClienteChat = usuarios.filter(
      item => item.serie === dadosChat[0].serie_estrangeira_cliente,
    );
    let dadosDestinatarioChat = usuarios.filter(
      item => item.serie === dadosChat[0].serie_estrangeira_destinatario,
    );

    await AsyncStorage.setItem('tipo_usuario_chat', 'Carteiro');

    await AsyncStorage.setItem(
      'serie_viagem_negociacao_chat',
      dadosChat[0].serie_viagem_negociacao,
    );
    await AsyncStorage.setItem(
      'serie_carteiro_chat',
      dadosChat[0].serie_estrangeira_carteiro,
    );
    await AsyncStorage.setItem(
      'nome_carteiro_chat',
      `${dadosCarteiroChat[0].nome} ${dadosCarteiroChat[0].sobrenome}`,
    );
    await AsyncStorage.setItem(
      'email_carteiro_chat',
      dadosCarteiroChat[0].email,
    );

    await AsyncStorage.setItem(
      'serie_cliente_chat',
      dadosChat[0].serie_estrangeira_cliente,
    );
    await AsyncStorage.setItem(
      'nome_cliente_chat',
      `${dadosClienteChat[0].nome} ${dadosClienteChat[0].sobrenome}`,
    );
    await AsyncStorage.setItem('email_cliente_chat', dadosClienteChat[0].email);

    if (dadosDestinatarioChat.length === 0) {
      await AsyncStorage.setItem('serie_destinatario_chat', '');
      await AsyncStorage.setItem('nome_destinatario_chat', '');
      await AsyncStorage.setItem('email_destinatario_chat', '');
    } else {
      await AsyncStorage.setItem(
        'serie_destinatario_chat',
        dadosChat[0].serie_estrangeira_destinatario,
      );
      await AsyncStorage.setItem(
        'nome_destinatario_chat',
        `${dadosDestinatarioChat[0].nome} ${dadosDestinatarioChat[0].sobrenome}`,
      );
      await AsyncStorage.setItem(
        'email_destinatario_chat',
        dadosDestinatarioChat[0].email,
      );
    }

    navigation.navigate('Chat');
  };

  if (loadingViagensDisponibilizadasCarteiro) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#007ACC" />
      </View>
    );
  }

  return (
    <>
      <SafeAreaView style={{flex: 1, backgroundColor: '#0a768f'}} edges={['top', 'left', 'right']}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#0a768f" 
        translucent={false} 
      />
      <Modal
        visible={showAlertModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAlertModal(false)}>
        <TouchableWithoutFeedback onPress={() => setShowAlertModal(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  backgroundColor: '#fff',
                  padding: 25,
                  width: '90%',
                  maxWidth: 350,
                  borderRadius: 15,
                  alignItems: 'center',
                  marginHorizontal: 40,
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 4},
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                  elevation: 10,
                }}>
                <MaterialIcons
                  name={msgIconAlertModal}
                  size={48}
                  color={msgIconColorAlertModal}
                  style={{marginBottom: 10}}
                />
                <Text
                  style={{
                    fontSize: 22,
                    fontFamily: 'Montserrat-Bold',
                    marginBottom: 8,
                    color: 'rgba(0, 0, 0, 0.7)',
                  }}>
                  {msgTitleAlertModal}
                </Text>
                <Text
                  style={{
                    fontSize: 19,
                    fontFamily: 'Montserrat-Regular',
                    textAlign: 'center',
                    marginBottom: 20,
                  }}>
                  {msgDescAlertModal}
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: msgIconColorAlertModal,
                    borderRadius: 8,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    elevation: 4,
                  }}
                  onPress={() => setShowAlertModal(false)}>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 18,
                      fontFamily: 'Montserrat-Regular',
                    }}>
                    Entendi
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showExcluirViagemEmNegociacaoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExcluirViagemEmNegociacaoModal(false)}>
        <TouchableWithoutFeedback
          onPress={() => setShowExcluirViagemEmNegociacaoModal(false)}>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  backgroundColor: '#fff',
                  width: '95%',
                  marginTop: 20,
                  borderRadius: 15,
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 4},
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                  elevation: 10,
                }}>
                <View
                  style={{
                    borderBottomWidth: 1,
                    borderColor: 'rgba(8, 77, 110,0.5)',
                    marginTop: 15,
                    marginBottom: 10,
                    paddingBottom: 10,
                    width: '100%',
                  }}>
                  <Text
                    style={{
                      color: 'rgba(8, 77, 110,1)',
                      textAlign: 'center',
                      fontFamily: 'Montserrat-Bold',
                      fontSize: 22,
                    }}>
                    RECUSANDO VIAGEM EM NEGOCIAÇÃO
                  </Text>
                </View>
                <View
                  style={{
                    top: 3,
                    width: '90%',
                    marginTop: 0,
                    borderRadius: 20,
                    backgroundColor: 'transparent',
                  }}>
                  <Text
                    style={{
                      color: 'rgba(8, 77, 110, 1)',
                      paddingBottom: 10,
                      fontSize: 18,
                      fontFamily: 'Montserrat-Regular',
                    }}>
                    Tem Certeza Que Deseja Recusar Está Viagem em Negociação?
                  </Text>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      marginTop: 20,
                      alignItems: 'center',
                      gap: 10,
                    }}>
                    <TouchableOpacity
                      disabled={sendingData ? true : false}
                      onPress={handleInserirCancelarViagemEmNegociacao}
                      style={[
                        styles.mainButtonModal,
                        {width: sendingData ? 140 : 100},
                      ]}>
                      {!sendingData ? (
                        <Text
                          style={[
                            styles.mainButtonTextModal,
                            {fontFamily: 'Montserrat-Regular', fontSize: 15},
                          ]}>
                          Sim
                        </Text>
                      ) : (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <Text
                            style={[
                              styles.mainButtonTextModal,
                              {fontFamily: 'Montserrat-Regular', fontSize: 15},
                            ]}>
                            Enviando...
                          </Text>
                          <ActivityIndicator
                            style={{marginLeft: 8}}
                            size="small"
                            color="#e3e3e3"
                          />
                        </View>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() =>
                        setShowExcluirViagemEmNegociacaoModal(false)
                      }
                      style={[
                        styles.mainButtonModal,
                        {backgroundColor: '#9c053a', width: 100},
                      ]}>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text
                          style={[
                            styles.mainButtonTextModal,
                            {fontFamily: 'Montserrat-Regular', fontSize: 17},
                          ]}>
                          Não
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showEditarModalDadosDestinatario}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditarModalDadosDestinatario(false)}>
        <TouchableWithoutFeedback
          onPress={() => setShowEditarModalDadosDestinatario(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  backgroundColor: '#fff',
                  width: '95%',
                  borderRadius: 15,
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 4},
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                  elevation: 10,
                }}>
                <View
                  style={{
                    borderBottomWidth: 1,
                    borderColor: 'rgba(8, 77, 110,0.5)',
                    marginTop: 15,
                    marginBottom: 20,
                    paddingBottom: 10,
                    width: '100%',
                  }}>
                  <Text
                    style={{
                      color: 'rgba(8, 77, 110,1)',
                      textAlign: 'center',
                      fontFamily: 'Montserrat-Bold',
                      fontSize: 22,
                    }}>
                    DADOS DO DESTINATÁRIO
                  </Text>
                </View>
                <View
                  style={{
                    top: 3,
                    width: '90%',
                    marginTop: 0,
                    borderRadius: 20,
                    backgroundColor: 'transparent',
                  }}>
                  <Text
                    style={{
                      color: 'rgba(8, 77, 110, 1)',
                      paddingBottom: 10,
                      fontSize: 18,
                      fontFamily: 'Montserrat-Bold',
                    }}>
                    Nome do Destinatário
                  </Text>
                  <TextInput
                    editable={false}
                    value={nomeDestinatario}
                    onChangeText={setNomeDestinatario}
                    style={[
                      styles.inputModal,
                      {marginTop: 0, backgroundColor: '#eee'},
                    ]}
                  />

                  <Text
                    style={{
                      color: 'rgba(8, 77, 110, 1)',
                      paddingBottom: 10,
                      fontSize: 18,
                      fontFamily: 'Montserrat-Bold',
                    }}>
                    Email do Destinatário
                  </Text>
                  <TextInput
                    editable={false}
                    value={emailDestinatario}
                    onChangeText={setEmailDestinatario}
                    style={[
                      styles.inputModal,
                      {marginTop: 0, backgroundColor: '#eee'},
                    ]}
                  />

                  <Text
                    style={{
                      color: 'rgba(8, 77, 110, 1)',
                      paddingBottom: 10,
                      fontSize: 18,
                      fontFamily: 'Montserrat-Bold',
                    }}>
                    Celular do Destinatário
                  </Text>
                  <View style={styles.inputContainer}>
                    {/* Bandeira Brasil */}
                    <CountryFlag
                      isoCode="BR"
                      size={28}
                      style={{marginRight: 10}}
                    />

                    {/* Código +55 fixo */}
                    <View style={styles.dddContainer}>
                      <Text style={styles.ddd}>+55</Text>
                    </View>

                    {/* Input de telefone com máscara */}
                    <TextInputMask
                      type={'custom'}
                      options={{
                        mask: '(99) 99999-9999', // 8 ou 9 dígitos
                      }}
                      value={celularDestinatario}
                      onChangeText={text => setCelularDestinatario(text)}
                      editable={false}
                      style={{
                        backgroundColor: '#eee',
                        flex: 1,
                        fontSize: 17,
                        fontFamily: 'Montserrat-Regular',
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: 10,
                        color: '#353738',
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 1},
                        shadowOpacity: 0.1,
                        shadowRadius: 1.5,
                        elevation: 2,
                      }}
                      keyboardType="numeric"
                      placeholder="(11) 91234-5678"
                      placeholderTextColor="#999"
                      ref={telefoneRef}
                    />
                  </View>

                  {/* Um campo e um botão lado a lado */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 15,
                      alignItems: 'center',
                    }}>
                    <TouchableOpacity
                      onPress={() => setShowEditarModalDadosDestinatario(false)}
                      style={[
                        styles.mainButtonModal,
                        {backgroundColor: '#f5f5f5', width: '100%'},
                      ]}>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text
                          style={[
                            styles.mainButtonTextModal,
                            {
                              fontFamily: 'Montserrat-Regular',
                              fontSize: 17,
                              color: '#808080',
                            },
                          ]}>
                          Sair
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/*<TouchableOpacity onPress={() => { enviarDadosDestinatario() }} style={styles.mainButtonModal}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Text style={[styles.mainButtonTextModal, { fontFamily: 'Montserrat-Regular', fontSize: 14 }]}>Enviar</Text>
                            </View>
                          </TouchableOpacity>*/}
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showEditarModalFotografias}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditarModalFotografias(false)}>
        <TouchableWithoutFeedback
          onPress={() => setShowEditarModalFotografias(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  backgroundColor: '#fff',
                  width: '95%',
                  maxWidth: 500,
                  borderRadius: 15,
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 4},
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                  elevation: 10,
                  maxHeight: '90%',
                }}>
                <ScrollView
                  contentContainerStyle={{
                    alignItems: 'center',
                    paddingBottom: 30,
                    paddingHorizontal: 10,
                  }}
                  showsVerticalScrollIndicator={false}>
                  {/* Cabeçalho */}
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderColor: 'rgba(8, 77, 110,0.5)',
                      marginTop: 15,
                      marginBottom: 20,
                      paddingBottom: 10,
                      width: '100%',
                    }}>
                    <Text
                      style={{
                        color: 'rgba(8, 77, 110,1)',
                        textAlign: 'center',
                        fontFamily: 'Montserrat-Bold',
                        fontSize: 22,
                      }}>
                      VERIFICAR FOTOGRAFIAS
                    </Text>
                  </View>

                  {/* Galeria de imagens */}
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      width: '100%',
                      marginTop: -10,
                      marginBottom: 20,
                    }}>
                    <Image
                      source={
                        typeof fotografia1ViagemNegociacao === 'string'
                          ? {uri: fotografia1ViagemNegociacao}
                          : fotografia1ViagemNegociacao
                      }
                      style={{
                        width: itemWidth,
                        height: itemWidth,
                        borderRadius: itemWidth / 2,
                        marginBottom: 10,
                        marginHorizontal: 15,
                      }}
                      resizeMode="cover"
                    />
                    <Image
                      source={
                        typeof fotografia2ViagemNegociacao === 'string'
                          ? {uri: fotografia2ViagemNegociacao}
                          : fotografia2ViagemNegociacao
                      }
                      style={{
                        width: itemWidth,
                        height: itemWidth,
                        borderRadius: itemWidth / 2,
                        marginBottom: 10,
                        marginHorizontal: 15,
                      }}
                      resizeMode="cover"
                    />
                    <Image
                      source={
                        typeof fotografia3ViagemNegociacao === 'string'
                          ? {uri: fotografia3ViagemNegociacao}
                          : fotografia3ViagemNegociacao
                      }
                      style={{
                        width: itemWidth,
                        height: itemWidth,
                        borderRadius: itemWidth / 2,
                        borderRadius: 99,
                        marginBottom: 10,
                        marginHorizontal: 15,
                      }}
                      resizeMode="cover"
                    />
                    <Image
                      source={
                        typeof fotografia4ViagemNegociacao === 'string'
                          ? {uri: fotografia4ViagemNegociacao}
                          : fotografia4ViagemNegociacao
                      }
                      style={{
                        width: itemWidth,
                        height: itemWidth,
                        borderRadius: itemWidth / 2,
                        marginBottom: 10,
                        marginHorizontal: 15,
                      }}
                      resizeMode="cover"
                    />
                  </View>

                  {/* Divisor */}
                  <View
                    style={{
                      width: '100%',
                      height: 1,
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      marginTop: -20,
                      marginBottom: 20,
                    }}
                  />

                  {/* Botões */}
                  <View
                    style={{
                      width: '100%',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 15,
                      marginBottom: -30,
                      alignItems: 'center',
                    }}>
                    <TouchableOpacity
                      onPress={() => setShowEditarModalFotografias(false)}
                      style={[
                        styles.mainButtonModal,
                        {
                          backgroundColor: '#f5f5f5',
                          width: showBtnModalConfirmacaoFotografias
                            ? '48%'
                            : '100%',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.mainButtonTextModal,
                          {
                            fontFamily: 'Montserrat-Regular',
                            fontSize: 16,
                            color: '#808080',
                          },
                        ]}>
                        Sair
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      disabled={sendingData ? true : false}
                      onPress={() => handleConfirmacaoFotografiasChange()}
                      style={[
                        styles.mainButtonModal,
                        {
                          width: '48%',
                          display: showBtnModalConfirmacaoFotografias
                            ? 'flex'
                            : 'none',
                        },
                      ]}>
                      {!sendingData ? (
                        <Text
                          style={[
                            styles.mainButtonTextModal,
                            {fontFamily: 'Montserrat-Regular', fontSize: 15},
                          ]}>
                          Confirmar Fotografias
                        </Text>
                      ) : (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <Text
                            style={[
                              styles.mainButtonTextModal,
                              {fontFamily: 'Montserrat-Regular', fontSize: 15},
                            ]}>
                            Enviando...
                          </Text>
                          <ActivityIndicator
                            style={{marginLeft: 8}}
                            size="small"
                            color="#e3e3e3"
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <HeaderCarteiro />

      <ScrollView style={styles.container}>
        <View style={{marginTop: 0}}>
          <View
            style={{
              paddingHorizontal: 20,
              marginBottom: -16,
              backgroundColor: '#e8eef6bd',
            }}>
            <Text
              style={{
                fontSize: 20,
                fontFamily: 'Montserrat-Bold',
                color: '#007aff',
              }}>
              Dashboard do Viajante
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: '#666',
                fontFamily: 'Montserrat-Regular',
                marginTop: 4,
              }}>
              Início / Viagens Disponibilizadas
            </Text>
          </View>

          <View style={styles.viagensWrapper}>
            <TravelsAvailable
              viagensDisponibilizadasCarteiro={viagensDisponibilizadasCarteiro}
              loadingViagensDisponibilizadasCarteiro={
                loadingViagensDisponibilizadasCarteiro
              }
              erroViagensDisponibilizadasCarteiro={
                erroViagensDisponibilizadasCarteiro
              }
              onConfirmarFotografias={handleConfirmacaoFotografiasChange}
              redirectVisualizarViagem={redirectVisualizarViagem}
              redirectChat={redirectChat}
              handleModalDadosDestinatario={handleModalDadosDestinatario}
              handleFotografiasViagemNegociacao={
                handleFotografiasViagemNegociacao
              }
              handleModalExcluirViagemEmNegociacao={
                handleModalExcluirViagemEmNegociacao
              }
            />
          </View>
        </View>
      </ScrollView>
      </SafeAreaView>
    </>
  );
}
