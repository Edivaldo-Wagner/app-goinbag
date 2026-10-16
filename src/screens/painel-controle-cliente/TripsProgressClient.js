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
  PermissionsAndroid,
  Platform,
  Alert,
  TouchableWithoutFeedback,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import logo from '../../assets/logo/mini-logo.png';
import no_image from '../../assets/images/no-image.png';
import styles from './PainelCliente.styles';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import {TextInputMask} from 'react-native-masked-text';
import CountryFlag from 'react-native-country-flag';
import ClientTripsProgressNegotiations from './ClientTripsProgressNegotiations';

import UseModalChat from '../../hooks/UseModalChat/UseModalChat';
import ModalChat from '../../components/modal-chat/ModalChat';

import UseModalPhotosOrder from '../../hooks/UseModalPhotosOrder/UseModalPhotosOrder';
import ModalPhotosOrder from '../../components/modal-photos-order/ModalPhotosOrder';
import UseModalReceiverData from '../../hooks/UseModalReceiverData/UseModalReceiverData';
import ModalReceiverData from '../../components/modal-receiver-data/ModalReceiverData';
import UseInserirDadosDestinatario from '../../hooks/UseInserirDadosDestinatario/UseInserirDadosDestinatario';
import UseCancelarViagemEmNegociacaoCliente from '../../hooks/UseCancelarViagemEmNegociacaoCliente/UseCancelarViagemEmNegociacaoCliente';
import UseInserirFotografiasViagemNegociacao from '../../hooks/UseInserirFotografiasViagemNegociacao/UseInserirFotografiasViagemNegociacao';
import {useAuth} from '../../context/AuthContext';
import HeaderCliente from '../../components/headerCliente/HeaderCliente';
import UseViagensCliente from '../../hooks/UseViagens/UseViagensCliente';
import UseUsuarios from '../../hooks/UseUsuarios/UseUsuarios';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import ClienteSessionStore from './ClienteSessionStore';
import Config from 'react-native-config';

const URL_MAIN = Config.URL_MAIN;

export default function TripsProgressClient() {
  const navigation = useNavigation();
  const {width} = useWindowDimensions();

  const screenWidth = Dimensions.get('window').width;
  const itemWidth = Math.min(screenWidth * 0.35, 200);

  const inputRef = useRef(null);
  const [tecladoAtivo, setTecladoAtivo] = useState(false);

  const {
    inserirCancelarViagemEmNegociacao,
    insercaoCancelarViagemEmNegociacao,
    loadingCancelarViagemEmNegociacao,
  } = UseCancelarViagemEmNegociacaoCliente();
  const {
    inserirDadosDestinatario,
    insercaoDadosDestinatario,
    loadingInserirDadosDestinatario,
  } = UseInserirDadosDestinatario();
  const {
    inserirFotografiasViagemNegociacao,
    insercaoFotografiasViagemNegociacao,
    loadingInserirFotografiasViagemNegociacao,
  } = UseInserirFotografiasViagemNegociacao();
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
  const [showBtnInserirDadosDestinatario, setShowBtnInserirDadosDestinatario] =
    useState(true);
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
    viagensEmNegociacaoCliente,
    loadingViagensEmNegociacaoCliente,
    erroViagensEmNegociacaoCliente,
    buscarViagensEmNegociacaoCliente,
  } = UseViagensCliente();

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
  } = UseModalPhotosOrder(buscarViagensEmNegociacaoCliente);

  const {
    isOpenReceiverData,
    showSuccessScreenReceiverData,
    openModalReceiverData,
    closeModalReceiverData,
    selectedNegotiationReceiverData,
    formDataReceiverData,
    handleChange,
    handlePhoneChange,
    handleBlur,
    handleSubmit,
    loadingReceiverData,
    errorReceiverData,
    errorsReceiverData,
  } = UseModalReceiverData(buscarViagensEmNegociacaoCliente);

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
      await buscarViagensEmNegociacaoCliente();
    }
  };

  const handleModalDadosDestinatario = (
    serie_viagem_negociacao,
    status_disponibilidade,
  ) => {
    setSerieViagemNegociacao(serie_viagem_negociacao);
    const dadosDestinatario = viagensEmNegociacaoCliente.filter(
      item => item.serie_viagem_negociacao === serie_viagem_negociacao,
    );

    if (status_disponibilidade == 'destinatario_recusou') {
      setNomeDestinatario('');
      setEmailDestinatario('');
      setCelularDestinatario('');
      setShowBtnInserirDadosDestinatario(false);
      setShowEditarModalDadosDestinatario(true);
      return;
    }

    setNomeDestinatario(
      dadosDestinatario[0].nome_confirmacacao_do_destinatario,
    );
    setEmailDestinatario(
      dadosDestinatario[0].email_confirmacacao_do_destinatario,
    );
    setCelularDestinatario(
      dadosDestinatario[0].telefone_confirmacacao_do_destinatario,
    );

    if (
      dadosDestinatario[0].email_confirmacacao_do_destinatario == '' ||
      dadosDestinatario[0].email_confirmacacao_do_destinatario == null
    ) {
      setShowBtnInserirDadosDestinatario(false);
    } else {
      setShowBtnInserirDadosDestinatario(true);
    }

    /*if(status_disponibilidade == 'confirmar_disponibilidade'){
      setShowTextInserirDadosDestinatario('Confirmar Disponibilidade')
    }else if(status_disponibilidade == 'recusar_disponibilidade'){
      setShowTextInserirDadosDestinatario('Recusar Disponibilidade')
    }*/

    setShowEditarModalDadosDestinatario(true);
  };

  async function requestCameraPermission() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Permissão para usar a câmera',
            message: 'Precisamos acessar sua câmera para tirar fotos.',
            buttonNeutral: 'Pergunte-me depois',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      return true; // no iOS, a permissão já é solicitada pelo sistema automaticamente
    }
  }

  const selecionarImagem = async index => {
    Alert.alert(
      'Selecionar Imagem',
      'Escolha uma opção',
      [
        {
          text: 'Câmera',
          onPress: async () => {
            const hasPermission = await requestCameraPermission();
            if (!hasPermission) {
              Alert.alert(
                'Permissão negada',
                'Não foi possível acessar a câmera.',
              );
              return;
            }
            const result = await launchCamera({
              mediaType: 'photo',
              quality: 0.8,
            });
            handleImageResult(result, index);
          },
        },
        {
          text: 'Galeria',
          onPress: async () => {
            const result = await launchImageLibrary({
              mediaType: 'photo',
              quality: 0.8,
            });
            handleImageResult(result, index);
          },
        },
        {text: 'Cancelar', style: 'cancel'},
      ],
      {cancelable: true},
    );
  };

  const handleImageResult = (result, index) => {
    if (!result.didCancel && !result.errorCode && result.assets?.[0]) {
      const imagemSelecionada = {uri: result.assets[0].uri};

      switch (index) {
        case 1:
          setfotografia1ViagemNegociacao(imagemSelecionada);
          break;
        case 2:
          setfotografia2ViagemNegociacao(imagemSelecionada);
          break;
        case 3:
          setfotografia3ViagemNegociacao(imagemSelecionada);
          break;
        case 4:
          setfotografia4ViagemNegociacao(imagemSelecionada);
          break;
      }
    }
  };

  const handleFotografiasViagemNegociacao = (
    serie_viagem_negociacao,
    verificar_fotografias,
  ) => {
    setSerieViagemNegociacao(serie_viagem_negociacao);
    const dadosFotografias = viagensEmNegociacaoCliente.filter(
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

    if (verificar_fotografias == true) {
      setShowBtnModalConfirmacaoFotografias(false);
    } else {
      setShowBtnModalConfirmacaoFotografias(true);
    }

    setShowEditarModalFotografias(true);
  };

  const handleInserirFotografiasViagemNegociacao = async () => {
    const imagens = [
      fotografia1ViagemNegociacao,
      fotografia2ViagemNegociacao,
      fotografia3ViagemNegociacao,
      fotografia4ViagemNegociacao,
    ];

    const faltando = imagens.some(foto => !foto || !foto.uri);

    if (faltando) {
      setMsgIconColorAlertModal('#9c053a');
      setMsgIconAlertModal('error-outline');
      setMsgTitleAlertModal('ATENÇÃO');
      setMsgDescAlertModal(
        'Por favor, insira todas as 4 fotografias antes de enviar!',
      );
      setShowAlertModal(true);
      return;
    }

    let serie_logado = await AsyncStorage.getItem('serie_logado');
    let nome_cliente = await AsyncStorage.getItem('nome_carteiro');

    setsendingData(true);

    const result = await inserirFotografiasViagemNegociacao(
      serieViagemNegociacao,
      serie_logado,
      nome_cliente,
      imagens,
    );

    if (result?.status === 'sucesso') {
      setsendingData(false);
      setMsgIconColorAlertModal('#188211');
      setMsgIconAlertModal('task-alt');
      setMsgTitleAlertModal('SUCESSO');
      setMsgDescAlertModal('Fotografias Inseridas Com Sucesso!');
      setShowAlertModal(true);
      setShowEditarModalFotografias(false);
      await buscarViagensEmNegociacaoCliente();
    }
  };

  const handleInserirDadosDestinatario = async () => {
    let serie_logado = await AsyncStorage.getItem('serie_logado');
    let nome_cliente = await AsyncStorage.getItem('nome_carteiro');

    setsendingData(true);

    let resultDadosDestinatario = await inserirDadosDestinatario(
      serieViagemNegociacao,
      serie_logado,
      nomeDestinatario,
      emailDestinatario,
      '+55 ' + celularDestinatario,
      nome_cliente,
    );

    console.log('Resultado direto da API:', resultDadosDestinatario);
    if (resultDadosDestinatario.status == 'sucesso') {
      setsendingData(false);
      setMsgIconColorAlertModal('#188211');
      setMsgIconAlertModal('task-alt');
      setMsgTitleAlertModal('SUCESSO');
      setMsgDescAlertModal('Destinatário Adicionado Com Sucesso!');
      setShowAlertModal(true);
      setShowEditarModalDadosDestinatario(false);
      await buscarViagensEmNegociacaoCliente();
    }
  };

  const redirectVisualizarViagem = (
    serie_viagem_negociacao,
    detalhes_pagamento,
  ) => {
    const dadosVisualizarViagem = viagensEmNegociacaoCliente.filter(
      item => item.serie_viagem_negociacao === serie_viagem_negociacao,
    );

    if (dadosVisualizarViagem[0].meio_transporte === 'Avião') {
      ClienteSessionStore.setMeioTransporte('aereo');
    } else if (dadosVisualizarViagem[0].meio_transporte != 'Avião') {
      ClienteSessionStore.setMeioTransporte('terrestre');
    }

    if (
      dadosVisualizarViagem[0].qrcode_pix_pagamento_servico == null ||
      (dadosVisualizarViagem[0].qrcode_pix_pagamento_servico == '' &&
        dadosVisualizarViagem[0].pix_pago_servico == 0)
    ) {
      ClienteSessionStore.setCodidoPixGeradoAtualmente(false);
    } else {
      ClienteSessionStore.setCodidoPixGeradoAtualmente(true);
    }

    if (detalhes_pagamento == true) {
      ClienteSessionStore.setPagamentoRealizadoSucesso(detalhes_pagamento);
    } else {
      ClienteSessionStore.setPagamentoRealizadoSucesso(detalhes_pagamento);
    }

    ClienteSessionStore.setSerieViagemEmNegociacao(
      dadosVisualizarViagem[0].serie_viagem_negociacao,
    );
    if (dadosVisualizarViagem[0].pix_pago_servico == 1) {
      ClienteSessionStore.setPixPago(true);
    } else {
      ClienteSessionStore.setPixPago(false);
    }

    ClienteSessionStore.setQrcodePix(
      dadosVisualizarViagem[0].qrcode_pix_pagamento_servico,
    );
    ClienteSessionStore.setCodigoCopiaColaPix(
      dadosVisualizarViagem[0].codigo_copia_cola_pix_pagamento_servico,
    );

    if (dadosVisualizarViagem[0].forma_pagamento_servico == 'cartao_credito') {
      ClienteSessionStore.setTipoPagamento('cartao_credito');
    } else if (dadosVisualizarViagem[0].forma_pagamento_servico == 'pix') {
      ClienteSessionStore.setTipoPagamento('pix');
    } else {
      ClienteSessionStore.setTipoPagamento('cartao_credito');
    }

    ClienteSessionStore.setTransporte(dadosVisualizarViagem[0].meio_transporte);
    ClienteSessionStore.setRotaSelecionada(
      dadosVisualizarViagem[0].rota_selecionada,
    );
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

    const valorServicoServico = parseFloat(
      dadosVisualizarViagem[0].valor_servico
        .replace(',', '.')
        .replace('R$', ''),
    )
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    ClienteSessionStore.setValorServico(valorServicoServico);
    ClienteSessionStore.setValorSeguro(
      dadosVisualizarViagem[0].valor_seguro_original
        .replace(' ', '')
        .replace(',', '.')
        .replace('R$', ''),
    );

    navigation.navigate('VisualizarViagemCliente');
  };

  const redirectAcompanhamentoViagem = async serie_viagem_negociacao => {
    const dadosVisualizarViagem = viagensEmNegociacaoCliente.filter(
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
    const dadosChat = viagensEmNegociacaoCliente.filter(
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

    await AsyncStorage.setItem('tipo_usuario_chat', 'Cliente');

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

  if (loadingViagensEmNegociacaoCliente) {
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
        onRequestClose={() => setShowEditarModalDadosDestinatario(false)}
        onShow={() => {
          if (!showBtnInserirDadosDestinatario) {
            setTimeout(() => {
              inputRef.current?.focus();
              setTecladoAtivo(true);
            }, 1000);
          }
        }}>
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
                    ref={inputRef}
                    editable={!showBtnInserirDadosDestinatario ? true : false}
                    value={nomeDestinatario}
                    onChangeText={setNomeDestinatario}
                    style={[
                      styles.inputModal,
                      {
                        marginTop: 0,
                        backgroundColor: !showBtnInserirDadosDestinatario
                          ? '#fff'
                          : '#eee',
                      },
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
                    editable={!showBtnInserirDadosDestinatario ? true : false}
                    value={emailDestinatario}
                    onChangeText={setEmailDestinatario}
                    autoCapitalize="none"
                    onChangeText={text => {
                      const minusculo = text.toLowerCase();
                      setEmailDestinatario(minusculo);
                    }}
                    style={[
                      styles.inputModal,
                      {
                        marginTop: 0,
                        backgroundColor: !showBtnInserirDadosDestinatario
                          ? '#fff'
                          : '#eee',
                      },
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
                      editable={!showBtnInserirDadosDestinatario ? true : false}
                      style={{
                        backgroundColor: !showBtnInserirDadosDestinatario
                          ? '#fff'
                          : '#eee',
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
                        {
                          backgroundColor: '#f5f5f5',
                          width: !showBtnInserirDadosDestinatario
                            ? '32%'
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
                      onPress={handleInserirDadosDestinatario}
                      style={[
                        styles.mainButtonModal,
                        {
                          width: '65%',
                          display: !showBtnInserirDadosDestinatario
                            ? 'block'
                            : 'none',
                        },
                      ]}>
                      {!sendingData ? (
                        <Text
                          style={[
                            styles.mainButtonTextModal,
                            {fontFamily: 'Montserrat-Regular', fontSize: 15},
                          ]}>
                          Inserir Destinatário
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
                      {showBtnModalConfirmacaoFotografias
                        ? 'INSERIR FOTOGRAFIAS'
                        : 'VERIFICAR FOTOGRAFIAS'}
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
                    <View
                      style={{
                        alignItems: 'center',
                        marginHorizontal: 15,
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
                        }}
                        resizeMode="cover"
                      />
                      {showBtnModalConfirmacaoFotografias && (
                        <TouchableOpacity
                          onPress={() => selecionarImagem(1)}
                          style={{
                            backgroundColor: '#084d6e',
                            width: '80%',
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: 7,
                            display: showBtnModalConfirmacaoFotografias
                              ? 'block'
                              : 'none',
                          }}>
                          <Text
                            style={{
                              color: '#fff',
                              textAlign: 'center',
                              fontFamily: 'Montserrat-Regular',
                            }}>
                            Upload
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View
                      style={{
                        alignItems: 'center',
                        marginHorizontal: 15,
                        marginBottom: 20,
                      }}>
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
                        }}
                        resizeMode="cover"
                      />
                      {showBtnModalConfirmacaoFotografias && (
                        <TouchableOpacity
                          onPress={() => selecionarImagem(2)}
                          style={{
                            backgroundColor: '#084d6e',
                            width: '80%',
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: 7,
                            display: showBtnModalConfirmacaoFotografias
                              ? 'block'
                              : 'none',
                          }}>
                          <Text
                            style={{
                              color: '#fff',
                              textAlign: 'center',
                              fontFamily: 'Montserrat-Regular',
                            }}>
                            Upload
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View
                      style={{
                        alignItems: 'center',
                        marginHorizontal: 15,
                        marginTop: !showBtnModalConfirmacaoFotografias
                          ? -18
                          : 0,
                        marginBottom: !showBtnModalConfirmacaoFotografias
                          ? 0
                          : 15,
                      }}>
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
                          marginBottom: 10,
                        }}
                        resizeMode="cover"
                      />
                      {showBtnModalConfirmacaoFotografias && (
                        <TouchableOpacity
                          onPress={() => selecionarImagem(3)}
                          style={{
                            backgroundColor: '#084d6e',
                            width: '80%',
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: 7,
                            display: showBtnModalConfirmacaoFotografias
                              ? 'block'
                              : 'none',
                          }}>
                          <Text
                            style={{
                              color: '#fff',
                              textAlign: 'center',
                              fontFamily: 'Montserrat-Regular',
                            }}>
                            Upload
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View
                      style={{
                        alignItems: 'center',
                        marginHorizontal: 15,
                        marginTop: !showBtnModalConfirmacaoFotografias
                          ? -18
                          : 0,
                        marginBottom: !showBtnModalConfirmacaoFotografias
                          ? 0
                          : 15,
                      }}>
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
                        }}
                        resizeMode="cover"
                      />
                      {showBtnModalConfirmacaoFotografias && (
                        <TouchableOpacity
                          onPress={() => selecionarImagem(4)}
                          style={{
                            backgroundColor: '#084d6e',
                            width: '80%',
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: 7,
                            display: showBtnModalConfirmacaoFotografias
                              ? 'block'
                              : 'none',
                          }}>
                          <Text
                            style={{
                              color: '#fff',
                              textAlign: 'center',
                              fontFamily: 'Montserrat-Regular',
                            }}>
                            Upload
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
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
                      onPress={() => handleInserirFotografiasViagemNegociacao()}
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
                          Inserir Fotografias
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

      <HeaderCliente />
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
              Dashboard do Cliente
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: '#666',
                fontFamily: 'Montserrat-Regular',
                marginTop: 4,
              }}>
              Início / Solicitações em Andamento
            </Text>
          </View>
          <View style={styles.viagensWrapper}>
            <ClientTripsProgressNegotiations
              viagensEmNegociacaoCliente={viagensEmNegociacaoCliente}
              onOpenChatModal={openChatModal}
              erroViagensEmNegociacaoCliente={erroViagensEmNegociacaoCliente}
              onOpenPhotosOrderModal={openPhotosOrderModal}
              onOpenReceiverModal={openModalReceiverData}
              redirectVisualizarViagem={redirectVisualizarViagem}
              redirectAcompanhamentoViagem={redirectAcompanhamentoViagem}
              redirectChat={redirectChat}
              handleModalDadosDestinatario={handleModalDadosDestinatario}
              handleFotografiasViagemNegociacao={
                handleFotografiasViagemNegociacao
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

            <ModalReceiverData
              isClient={true}
              isOpenReceiverData={isOpenReceiverData}
              showSuccessScreenReceiverData={showSuccessScreenReceiverData}
              closeModalReceiverData={closeModalReceiverData}
              formDataReceiverData={formDataReceiverData}
              handleChange={handleChange}
              handlePhoneChange={handlePhoneChange}
              handleBlur={handleBlur}
              handleSubmit={handleSubmit}
              loadingReceiverData={loadingReceiverData}
              errorReceiverData={errorReceiverData}
              errorsReceiverData={errorsReceiverData}
              selectedNegotiationReceiverData={selectedNegotiationReceiverData}
            />
          </View>
        </View>
      </ScrollView>
      </SafeAreaView>
    </>
  );
}
