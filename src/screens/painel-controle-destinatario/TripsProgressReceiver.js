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
import styles from './PainelDestinatario.styles';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import {TextInputMask} from 'react-native-masked-text';
import CountryFlag from 'react-native-country-flag';
import ReceiverTripsProgressNegotiations from './ReceiverTripsProgressNegotiations';

import UseModalChat from '../../hooks/UseModalChat/UseModalChat';
import ModalChat from '../../components/modal-chat/ModalChat';

import UseModalReceiverConfirmData from '../../hooks/UseModalReceiverConfirmData/UseModalReceiverConfirmData';
import ModalReceiverConfirmData from '../../components/modal-receiver-confirm-data/ModalReceiverConfirmData';

import UseModalPhotosOrder from '../../hooks/UseModalPhotosOrder/UseModalPhotosOrder';
import ModalPhotosOrder from '../../components/modal-photos-order/ModalPhotosOrder';
import UseConfirmarOuRecusarDadosDestinatario from '../../hooks/UseConfirmarOuRecusarDadosDestinatario/UseConfirmarOuRecusarDadosDestinatario';
import UseConfirmarChegadaAoDestino from '../../hooks/UseConfirmarChegadaAoDestino/UseConfirmarChegadaAoDestino';
import HeaderDestinatario from '../../components/headerDestinatario/HeaderDestinatario';
import UseViagensDestinatario from '../../hooks/UseViagens/UseViagensDestinatario';
import UseUsuarios from '../../hooks/UseUsuarios/UseUsuarios';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DestinatarioSessionStore from './DestinatarioSessionStore';
import ClienteSessionStore from '../painel-controle-cliente/ClienteSessionStore';
import Config from 'react-native-config';

const URL_MAIN = Config.URL_MAIN;

export default function TripsProgressReceiver() {
  const navigation = useNavigation();
  const {width} = useWindowDimensions();

  const screenWidth = Dimensions.get('window').width;
  const itemWidth = Math.min(screenWidth * 0.35, 200);

  const [estadoEncomenda, setEstadoEncomenda] = useState(null);

  const opcoesEstadoEncomenda = [
    {label: 'A encomenda chegou conforme as fotos', value: '1-chegou-sucesso'},
    {label: 'A encomenda não chegou', value: '2-nao-chegou'},
    {label: 'A encomenda chegou com defeito', value: '3-nao-chegou'},
  ];

  const {
    confirmarOuRecusarDadosDestinatario,
    confirmacaoOuRecusarDadosDestinatario,
    loadingConfirmacaoOuRecusarDadosDestinatario,
  } = UseConfirmarOuRecusarDadosDestinatario();
  const {
    confirmarChegadaAoDestino,
    confirmacaoChegadaAoDestino,
    loadingConfirmacaoChegadaAoDestino,
  } = UseConfirmarChegadaAoDestino();
  //const [showBtnModalConfirmacaoFotografias, setShowBtnModalConfirmacaoFotografias] = useState(true);
  const [sendingData, setsendingData] = useState(false);
  const [
    showExcluirViagemEmNegociacaoModal,
    setShowExcluirViagemEmNegociacaoModal,
  ] = useState(false);
  const [
    showEditarModalConfirmarChegadaAoDestino,
    setShowEditarModalConfirmarChegadaAoDestino,
  ] = useState(false);
  const [
    showEditarModalDadosDestinatario,
    setShowEditarModalDadosDestinatario,
  ] = useState(false);
  const [
    showTextConfirmarRecusarModalDadosDestinatario,
    setShowTextConfirmarRecusarModalDadosDestinatario,
  ] = useState('');
  const [statusDisponibilidade, setStatusDisponibilidade] = useState(false);
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
    viagensEmNegociacaoDestinatario,
    loadingViagensEmNegociacaoDestinatario,
    erroViagensEmNegociacaoDestinatario,
    buscarViagensEmNegociacaoDestinatario,
  } = UseViagensDestinatario();

  const {
    isOpenChat,
    selectedNegotiationChat,
    currentRoleChat,
    messagesChat,
    messageChat,
    emojiList,
    setShowEmojiPickerChat,
    showEmojiPickerChat,
    handleEmojiSelect,
    loadingMessagesChat,
    sendingChat,
    errorChat,
    flatListRef,
    openChatModal,
    closeChatModal,
    handleMessageChange,
    handleSendMessage,
  } = UseModalChat();

  const {
    isOpenPhotosOrder,
    showSuccessScreenPhotosOrder,
    selectedNegotiationPhotosOrder,
    photosPhotosOrder,
    modePhotosOrder,
    loadingPhotosOrder,
    errorPhotosOrder,
    successPhotosOrder,
    openPhotosOrderModal,
    closePhotosOrderModal,
    handleChangePhotoOrder,
    handleSubmitPhotosOrder,
  } = UseModalPhotosOrder(buscarViagensEmNegociacaoDestinatario);

  const {
    isOpenReceiverConfirmData,
    showSuccessScreenReceiverConfirmData,
    openModalReceiverConfirmData,
    closeModalReceiverConfirmData,
    selectedNegotiationReceiverConfirmData,
    actionTypeReceiverConfirmData,
    handleSubmit: handleSubmitReceiverConfirmData,
    loadingReceiverConfirmData,
    errorReceiverConfirmData,
    successReceiverConfirmData,
  } = UseModalReceiverConfirmData(buscarViagensEmNegociacaoDestinatario);

  const {usuarios} = UseUsuarios();

  const handleModalExcluirViagemEmNegociacao = serie_viagem_negociacao => {
    setSerieViagemNegociacao(serie_viagem_negociacao);
    setShowExcluirViagemEmNegociacaoModal(true);
    /*const dadosDestinatario = viagensEmNegociacaoDestinatario.filter((item) => item.serie_viagem_negociacao === serie_viagem_negociacao)
    setNomeDestinatario(dadosDestinatario[0].nome_confirmacacao_do_destinatario)
    setEmailDestinatario(dadosDestinatario[0].email_confirmacacao_do_destinatario)
    setCelularDestinatario(dadosDestinatario[0].telefone_confirmacacao_do_destinatario)
    setShowEditarModalDadosDestinatario(true);*/
  };

  const handleModalDadosDestinatario = (
    serie_viagem_negociacao,
    status_disponibilidade,
  ) => {
    setSerieViagemNegociacao(serie_viagem_negociacao);
    const dadosDestinatario = viagensEmNegociacaoDestinatario.filter(
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

    if (status_disponibilidade == 'confirmar_disponibilidade') {
      setShowTextConfirmarRecusarModalDadosDestinatario(
        'Confirmar Disponibilidade',
      );
    } else if (status_disponibilidade == 'recusar_disponibilidade') {
      setShowTextConfirmarRecusarModalDadosDestinatario(
        'Recusar Disponibilidade',
      );
    }

    setShowEditarModalDadosDestinatario(true);
  };

  const handleFotografiasViagemNegociacao = (
    serie_viagem_negociacao,
    verificar_fotografias,
  ) => {
    setSerieViagemNegociacao(serie_viagem_negociacao);
    const dadosFotografias = viagensEmNegociacaoDestinatario.filter(
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

    //console.log(verificar_fotografias)

    /*if(verificar_fotografias == true){
      setShowBtnModalConfirmacaoFotografias(false)
    }else{
      setShowBtnModalConfirmacaoFotografias(true)
    }*/

    setShowEditarModalFotografias(true);
  };

  const handleConfirmacaoOuRecusarDadosDestinatario = async () => {
    let serie_logado = await AsyncStorage.getItem('serie_logado');
    let nome_destinatario = await AsyncStorage.getItem('nome_carteiro');
    let status_disponibilidade = showTextConfirmarRecusarModalDadosDestinatario;
    setsendingData(true);
    let resultDadosDestinatario = await confirmarOuRecusarDadosDestinatario(
      status_disponibilidade,
      serieViagemNegociacao,
      serie_logado,
      nome_destinatario,
    );

    console.log('Resultado direto da API:', resultDadosDestinatario);
    if (resultDadosDestinatario.status == 'sucesso') {
      setsendingData(false);
      setMsgIconColorAlertModal('#188211');
      setMsgIconAlertModal('task-alt');
      setMsgTitleAlertModal('SUCESSO');
      if (
        resultDadosDestinatario.status_disponibilidade ==
        'Confirmar Disponibilidade'
      ) {
        setMsgDescAlertModal('Disponibilidade Confirmada Com Sucesso!');
      } else if (
        resultDadosDestinatario.status_disponibilidade ==
        'Recusar Disponibilidade'
      ) {
        setMsgDescAlertModal('Disponibilidade Recusada Com Sucesso!');
      }
      setShowAlertModal(true);
      setShowEditarModalDadosDestinatario(false);
      await buscarViagensEmNegociacaoDestinatario();
    }
  };

  const handleOpenConfirmarChegadaAoDestino = serie_viagem_negociacao => {
    setSerieViagemNegociacao(serie_viagem_negociacao);
    setEstadoEncomenda(null);
    setShowEditarModalConfirmarChegadaAoDestino(true);
  };

  const handleConfirmarChegadaAoDestino = async () => {
    let statusEncomenda = '';

    if (estadoEncomenda == null) {
      return;
    } else if (estadoEncomenda == '1-chegou-sucesso') {
      statusEncomenda = '1-chegou-sucesso';
    } else if (
      estadoEncomenda == '2-nao-chegou' ||
      estadoEncomenda == '3-nao-chegou'
    ) {
      statusEncomenda = '2-nao-chegou';
    }

    //let serie_logado =  await AsyncStorage.getItem('serie_logado')
    setsendingData(true);
    let resultConfirmarChegadaAoDestino = await confirmarChegadaAoDestino(
      serieViagemNegociacao,
      statusEncomenda,
    );

    console.log('Resultado direto da API:', resultConfirmarChegadaAoDestino);
    if (resultConfirmarChegadaAoDestino.status == 'sucesso') {
      setsendingData(false);
      setMsgIconColorAlertModal('#188211');
      setMsgIconAlertModal('task-alt');
      setMsgTitleAlertModal('SUCESSO');
      setMsgDescAlertModal(resultConfirmarChegadaAoDestino.result.mensagem);
      setShowAlertModal(true);
      setShowEditarModalConfirmarChegadaAoDestino(false);
      await buscarViagensEmNegociacaoDestinatario();
    }
  };

  const redirectAcompanhamentoViagem = async serie_viagem_negociacao => {
    const dadosVisualizarViagem = viagensEmNegociacaoDestinatario.filter(
      item => item.serie_viagem_negociacao === serie_viagem_negociacao,
    );

    if (dadosVisualizarViagem[0].meio_transporte === 'Avião') {
      ClienteSessionStore.setMeioTransporte('aereo');
    } else if (dadosVisualizarViagem[0].meio_transporte != 'Avião') {
      ClienteSessionStore.setMeioTransporte('terrestre');
    }

    ClienteSessionStore.setSerieViagemEmNegociacao(
      dadosVisualizarViagem[0].serie_viagem_negociacao,
    );

    await AsyncStorage.setItem(
      'serie_carteiro_viagem_atual',
      dadosVisualizarViagem[0].serie_estrangeira_carteiro,
    );

    ClienteSessionStore.setTransporte(dadosVisualizarViagem[0].meio_transporte);
    ClienteSessionStore.setCidadeOrigem(dadosVisualizarViagem[0].local_partida);
    ClienteSessionStore.setCidadeOrigemLat(
      dadosVisualizarViagem[0].local_partida_lat,
    );
    ClienteSessionStore.setCidadeOrigemLng(
      dadosVisualizarViagem[0].local_partida_lng,
    );

    ClienteSessionStore.setCidadeDestino(
      dadosVisualizarViagem[0].local_chegada,
    );
    ClienteSessionStore.setCidadeDestinoLat(
      dadosVisualizarViagem[0].local_chegada_lat,
    );
    ClienteSessionStore.setCidadeDestinoLng(
      dadosVisualizarViagem[0].local_chegada_lng,
    );

    ClienteSessionStore.setDataPartida(dadosVisualizarViagem[0].data_partida);
    ClienteSessionStore.setDataPartidaParaBusca(
      dadosVisualizarViagem[0].data_partida_para_busca,
    );
    ClienteSessionStore.setHoraPartida(dadosVisualizarViagem[0].hora_chegada);
    ClienteSessionStore.setDataChegada(dadosVisualizarViagem[0].data_chegada);
    ClienteSessionStore.setDataChegadaParaBusca(
      dadosVisualizarViagem[0].data_chegada_para_busca,
    );
    ClienteSessionStore.setHoraChegada(dadosVisualizarViagem[0].hora_chegada);

    ClienteSessionStore.setTipoEncomenda(
      dadosVisualizarViagem[0].tipo_encomenda,
    );
    ClienteSessionStore.setTipoEncomendaDoCliente(
      dadosVisualizarViagem[0].tipo_encomenda_do_cliente,
    );

    navigation.navigate('AcompanhamentoViagem');
  };

  const redirectChat = async serie_viagem_negociacao => {
    const dadosChat = viagensEmNegociacaoDestinatario.filter(
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

    await AsyncStorage.setItem('tipo_usuario_chat', 'Destinatario');

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

    navigation.navigate('Chat');
  };

  if (loadingViagensEmNegociacaoDestinatario) {
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
                      onPress={() =>
                        setShowExcluirViagemEmNegociacaoModal(false)
                      }
                      style={[styles.mainButtonModal, {width: 100}]}>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text
                          style={[
                            styles.mainButtonTextModal,
                            {fontFamily: 'Montserrat-Regular', fontSize: 14},
                          ]}>
                          Sim
                        </Text>
                      </View>
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

                  {/* Botões */}
                  <View
                    style={{
                      width: '100%',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 20,
                      marginBottom: 0,
                      alignItems: 'center',
                    }}>
                    <TouchableOpacity
                      onPress={() => setShowEditarModalDadosDestinatario(false)}
                      style={[
                        styles.mainButtonModal,
                        {backgroundColor: '#f5f5f5', width: '30%'},
                      ]}>
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
                    </TouchableOpacity>

                    <TouchableOpacity
                      disabled={sendingData ? true : false}
                      onPress={() =>
                        handleConfirmacaoOuRecusarDadosDestinatario()
                      }
                      style={[styles.mainButtonModal, {width: '67%'}]}>
                      {!sendingData ? (
                        <Text
                          style={[
                            styles.mainButtonTextModal,
                            {fontFamily: 'Montserrat-Regular', fontSize: 14},
                          ]}>
                          {showTextConfirmarRecusarModalDadosDestinatario}
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
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showEditarModalConfirmarChegadaAoDestino}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowEditarModalConfirmarChegadaAoDestino(false)
        }>
        <TouchableWithoutFeedback
          onPress={() => setShowEditarModalConfirmarChegadaAoDestino(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  backgroundColor: '#fff',
                  width: '95%',
                  maxWidth: 600,
                  maxHeight: '80%',
                  borderRadius: 15,
                  paddingVertical: 20,
                  paddingHorizontal: 15,
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 4},
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                  elevation: 10,
                }}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{paddingBottom: 20}}>
                  {/* Título */}
                  <View
                    style={{
                      marginBottom: 20,
                      paddingBottom: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: '#ddd',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color: 'rgba(8, 77, 110,1)',
                        fontFamily: 'Montserrat-Bold',
                        fontSize: 22,
                        textAlign: 'center',
                      }}>
                      Em que Estado Chegou a Encomenda
                    </Text>
                  </View>

                  {/* Opções */}
                  {opcoesEstadoEncomenda.map(option => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setEstadoEncomenda(option.value)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        backgroundColor: '#fff',
                        padding: 15,
                        marginBottom: 15,
                        borderRadius: 12,
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 2},
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 2,
                        width: '100%',
                      }}>
                      <View
                        style={{
                          height: 22,
                          width: 22,
                          borderRadius: 11,
                          borderWidth: 2,
                          borderColor: 'rgba(8, 77, 110, 1)',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12,
                          marginTop: 2,
                        }}>
                        {estadoEncomenda === option.value && (
                          <View
                            style={{
                              height: 12,
                              width: 12,
                              borderRadius: 6,
                              backgroundColor: 'rgba(8, 77, 110, 1)',
                            }}
                          />
                        )}
                      </View>
                      <Text
                        style={{
                          flex: 1,
                          flexWrap: 'wrap',
                          color: 'rgba(8, 77, 110, 1)',
                          fontSize: 17,
                          fontFamily: 'Montserrat-Bold',
                        }}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  {/* Botões */}
                  <View
                    style={{
                      width: '100%',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 20,
                      marginBottom: -35,
                      alignItems: 'center',
                    }}>
                    <TouchableOpacity
                      onPress={() =>
                        setShowEditarModalConfirmarChegadaAoDestino(false)
                      }
                      style={[
                        styles.mainButtonModal,
                        {backgroundColor: '#f5f5f5', width: '48%'},
                      ]}>
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
                    </TouchableOpacity>

                    <TouchableOpacity
                      disabled={sendingData ? true : false}
                      onPress={() => handleConfirmarChegadaAoDestino()}
                      style={[styles.mainButtonModal, {width: '48%'}]}>
                      {!sendingData ? (
                        <Text
                          style={[
                            styles.mainButtonTextModal,
                            {fontFamily: 'Montserrat-Regular', fontSize: 15},
                          ]}>
                          Cofirmar
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
                        {backgroundColor: '#f5f5f5', width: '100%'},
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

                    {/*<TouchableOpacity               
                    style={[styles.mainButtonModal, { width: '48%', display: showBtnModalConfirmacaoFotografias ? 'block' : 'none' }]}
                  >
                    <Text style={[styles.mainButtonTextModal, { fontFamily: 'Montserrat-Regular', fontSize: 14 }]}>Confirmar Fotografias</Text>
                  </TouchableOpacity>*/}
                  </View>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <HeaderDestinatario />

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
              Dashboard do Destinatário
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: '#666',
                fontFamily: 'Montserrat-Regular',
                marginTop: 4,
              }}>
              Início / Encomendas em Andamento
            </Text>
          </View>

          <View style={styles.viagensWrapper}>
            <ReceiverTripsProgressNegotiations
              viagensEmNegociacaoDestinatario={viagensEmNegociacaoDestinatario}
              onOpenChatModal={openChatModal}
              erroViagensEmNegociacaoDestinatario={
                erroViagensEmNegociacaoDestinatario
              }
              onOpenPhotosOrderModal={openPhotosOrderModal}
              onOpenReceiverConfirmModal={openModalReceiverConfirmData}
              redirectChat={redirectChat}
              redirectAcompanhamentoViagem={redirectAcompanhamentoViagem}
              handleModalDadosDestinatario={handleModalDadosDestinatario}
              handleFotografiasViagemNegociacao={
                handleFotografiasViagemNegociacao
              }
              handleOpenConfirmarChegadaAoDestino={
                handleOpenConfirmarChegadaAoDestino
              }
              handleModalExcluirViagemEmNegociacao={
                handleModalExcluirViagemEmNegociacao
              }
            />

            <ModalChat
              isOpenChat={isOpenChat}
              selectedNegotiationChat={selectedNegotiationChat}
              currentRoleChat={currentRoleChat}
              messagesChat={messagesChat}
              messageChat={messageChat}
              emojiList={emojiList}
              setShowEmojiPickerChat={setShowEmojiPickerChat}
              showEmojiPickerChat={showEmojiPickerChat}
              handleEmojiSelect={handleEmojiSelect}
              loadingMessagesChat={loadingMessagesChat}
              sendingChat={sendingChat}
              errorChat={errorChat}
              flatListRef={flatListRef}
              closeChatModal={closeChatModal}
              handleMessageChange={handleMessageChange}
              handleSendMessage={handleSendMessage}
            />

            <ModalPhotosOrder
              isOpenPhotosOrder={isOpenPhotosOrder}
              closePhotosOrderModal={closePhotosOrderModal}
              showSuccessScreenPhotosOrder={showSuccessScreenPhotosOrder}
              selectedNegotiationPhotosOrder={selectedNegotiationPhotosOrder}
              photosPhotosOrder={photosPhotosOrder}
              modePhotosOrder={modePhotosOrder}
              loadingPhotosOrder={loadingPhotosOrder}
              errorPhotosOrder={errorPhotosOrder}
              successPhotosOrder={successPhotosOrder}
              handlePhotoChange={handleChangePhotoOrder}
              handleSubmit={handleSubmitPhotosOrder}
            />

            <ModalReceiverConfirmData
              isOpenReceiverConfirmData={isOpenReceiverConfirmData}
              showSuccessScreenReceiverConfirmData={
                showSuccessScreenReceiverConfirmData
              }
              closeModalReceiverConfirmData={closeModalReceiverConfirmData}
              selectedNegotiationReceiverConfirmData={
                selectedNegotiationReceiverConfirmData
              }
              actionTypeReceiverConfirmData={actionTypeReceiverConfirmData}
              handleSubmit={handleSubmitReceiverConfirmData}
              loadingReceiverConfirmData={loadingReceiverConfirmData}
              errorReceiverConfirmData={errorReceiverConfirmData}
              successReceiverConfirmData={successReceiverConfirmData}
            />
          </View>
        </View>
      </ScrollView>
      </SafeAreaView>
    </>
  );
}
