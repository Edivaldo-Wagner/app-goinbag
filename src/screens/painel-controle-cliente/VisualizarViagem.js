import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Keyboard,
  Dimensions,
  Alert,
  Clipboard,
} from 'react-native';
import MapView, {Marker, Polyline} from 'react-native-maps';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import UseValidacaoCep from '../../hooks/UseValidacaoCep/UseValidacaoCep';
import UsePagamentoServico from '../../hooks/UsePagamentoServico/UsePagamentoServico';
import UseGerarQrCodeServico from '../../hooks/UsePagamentoServico/UseGerarQrCodeServico';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import QRCode from 'react-native-qrcode-svg';
import bannerPix from '../../assets/images/banner-pix.png';
import logoPix from '../../assets/images/logo-pix.png';
import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderCliente from '../../components/headerCliente/HeaderCliente';
import ClienteSessionStore from './ClienteSessionStore';
import styles from './VisualizarViagem.styles';

function decodePolyline(encoded) {
  let points = [];
  let index = 0,
    lat = 0,
    lng = 0;

  while (index < encoded.length) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({latitude: lat / 1e5, longitude: lng / 1e5});
  }
  return points;
}

const VisualizarViagem = () => {
  const [sendingData, setsendingData] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showMsgErrorModal, setShowMsgErrorModal] = useState('');
  const {validandoCep, validacaoCep, loadingValidacaoCep} = UseValidacaoCep();
  const {pagamentoServico, dadosPagamentoServico, loadingPagamentoServico} =
    UsePagamentoServico();
  const {
    gerarQrCodeServico,
    dadosGerarQrCodeServico,
    loadingGerarQrCodeServico,
  } = UseGerarQrCodeServico();
  const [pagamentoRealizadoSucesso, setPagamentoRealizadoSucesso] = useState(
    ClienteSessionStore.getPagamentoRealizadoSucesso(),
  );
  const [metodoPagamento, setMetodoPagamento] = useState(
    ClienteSessionStore.getTipoPagamento(),
  );
  const [pixPago, setPixPago] = useState(ClienteSessionStore.getPixPago());
  const [qrcodePix, setQrcodePix] = useState(
    ClienteSessionStore.getQrcodePix(),
  );
  const [codigoCopiaColaPix, setCodigoCopiaColaPix] = useState(
    ClienteSessionStore.getCodigoCopiaColaPix(),
  );
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [cidadeOrigem, setCidadeOrigem] = useState('');
  const [cidadeDestino, setCidadeDestino] = useState('');
  const [dataHoraPartida, setDataHoraPartida] = useState('');
  const [dataHoraChegada, setDataHoraChegada] = useState('');
  const [tipoTransporte, setTipoTransporte] = useState('');
  const [tipoEncomenda, setTipoEncomenda] = useState('');
  const [tipoEncomendaDoCliente, setTipoEncomendaDoCliente] = useState('');
  const [valorSeguro, setValorSeguro] = useState('');
  const [valorServico, setValorServico] = useState('');

  const [cartaoCredito, setCartaoCredito] = useState('');
  const [codidoPixGeradoAtualmente, setCodidoPixGeradoAtualmente] = useState(
    ClienteSessionStore.getCodidoPixGeradoAtualmente(),
  );
  const [showMsgErrorCartaoCreditoModal, setShowMsgErrorCartaoCreditoModal] =
    useState('');
  const [nomeTitularCartao, setNomeTitularCartao] = useState('');
  const [
    showMsgErrorNomeTitularCartaoModal,
    setShowMsgErrorNomeTitularCartaoModal,
  ] = useState('');
  const [emailTitularCartao, setEmailTitularCartao] = useState('');
  const [
    showMsgErrorEmailTitularCartaoModal,
    setShowMsgErrorEmailTitularCartaoModal,
  ] = useState('');
  const [celularTitularCartao, setCelularTitularCartao] = useState('');
  const [
    showMsgErrorCelularTitularCartaoModal,
    setShowMsgErrorCelularTitularCartaoModal,
  ] = useState('');
  const [dataExpiracao, setDataExpiracao] = useState('');
  const [
    showMsgErrorDataExpiracaoCartaoModal,
    setShowMsgErrorDataExpiracaoCartaoModal,
  ] = useState('');
  const [codidoCvv, setCodidoCvv] = useState('');
  const [
    showMsgErrorCodidoCvvCartaoModal,
    setShowMsgErrorCodidoCvvCartaoModal,
  ] = useState('');

  const [cep, setCep] = useState('');
  const [showMsgErrorCepCartaoModal, setShowMsgErrorCepCartaoModal] =
    useState('');
  const [msgCepNaoLocalizado, setMsgCepNaoLocalizado] = useState('');
  const [rua, seRua] = useState('');
  const [showMsgErrorRuaCartaoModal, setShowMsgErrorRuaCartaoModal] =
    useState('');
  const [numero, seNumero] = useState('');
  const [showMsgErrorNumeroCartaoModal, setShowMsgErrorNumeroCartaoModal] =
    useState('');
  const [bairro, seBairro] = useState('');
  const [showMsgErrorBairroCartaoModal, setShowMsgErrorBairroCartaoModal] =
    useState('');
  const [complemento, seComplemento] = useState('');
  const [cidade, seCidade] = useState('');
  const [showMsgErrorCidadeCartaoModal, setShowMsgErrorCidadeCartaoModal] =
    useState('');

  const [rotaSelecionada, setRotaSelecionada] = useState('opcao-rota-0');
  const [rota, setRota] = useState(null);
  const [region, setRegion] = useState(null);
  const [meioTransporte, setMeioTransporte] = useState('terrestre'); // default

  const screenWidth = Dimensions.get('window').width;
  const maxWidth = 600;

  const codigoPix = codigoCopiaColaPix;

  const copiarCodigo = () => {
    Clipboard.setString(codigoPix);
    Alert.alert('Código Pix copiado com sucesso!');
  };

  const handleCepChange = async text => {
    if (text === '') {
      setMsgCepNaoLocalizado('');
      setCep('');
      return;
    }

    let numericCep = text.replace(/\D/g, '').slice(0, 8);

    // Aplica máscara 12345-678
    let maskedCep = numericCep;
    if (numericCep.length > 5) {
      maskedCep = numericCep.replace(/^(\d{5})(\d{1,3})/, '$1-$2');
    }

    setCep(maskedCep);
    setMsgCepNaoLocalizado('');
    setShowMsgErrorCepCartaoModal('');
    if (numericCep.length === 8) {
      const resultadoCep = await validandoCep(maskedCep);
      console.log('Resultado direto da API:', resultadoCep);
      if (resultadoCep.cep == null) {
        setMsgCepNaoLocalizado(
          'Dados de CEP não localizados. Insira o seu endereço manualmente',
        );
        seRua('');
        seBairro('');
        seComplemento('');
        seCidade('');
      } else {
        setMsgCepNaoLocalizado('');
        seRua(resultadoCep.logradouro);
        seBairro(resultadoCep.bairro);
        seComplemento(resultadoCep.complemento);
        seCidade(resultadoCep.localidade);
      }
    }
  };

  useEffect(() => {
    // Carregar dados da sessão
    const latOrigem = ClienteSessionStore.getCidadeOrigemLat();
    const lngOrigem = ClienteSessionStore.getCidadeOrigemLng();
    const cidadeO = ClienteSessionStore.getCidadeOrigem();
    const latDestino = ClienteSessionStore.getCidadeDestinoLat();
    const lngDestino = ClienteSessionStore.getCidadeDestinoLng();
    const cidadeD = ClienteSessionStore.getCidadeDestino();
    const transporte = ClienteSessionStore.getMeioTransporte() || 'terrestre';
    const rotaSel = ClienteSessionStore.getRotaSelecionada() || 'opcao-rota-0';

    if (latOrigem && lngOrigem) setOrigem(`${latOrigem},${lngOrigem}`);
    if (latDestino && lngDestino) setDestino(`${latDestino},${lngDestino}`);

    setCidadeOrigem(cidadeO);
    setCidadeDestino(cidadeD);
    setMeioTransporte(transporte);
    setRotaSelecionada(rotaSel);
    setDataHoraPartida(
      ClienteSessionStore.getDataPartidaParaBusca() +
        ' - ' +
        ClienteSessionStore.getHoraPartida() +
        ' horas',
    );
    setDataHoraChegada(
      ClienteSessionStore.getDataChegadaParaBusca() +
        ' - ' +
        ClienteSessionStore.getHoraChegada() +
        ' horas',
    );
    setTipoTransporte(ClienteSessionStore.getTransporte());
    setTipoEncomenda(ClienteSessionStore.getTipoEncomenda());
    setTipoEncomendaDoCliente(ClienteSessionStore.getTipoEncomendaDoCliente());
    setValorSeguro('R$ ' + ClienteSessionStore.getValorSeguro());
    setValorServico('R$ ' + ClienteSessionStore.getValorServico());
  }, []);

  useEffect(() => {
    if (!origem || !destino) return;

    if (meioTransporte === 'aereo') {
      // Se for aéreo, vamos só exibir a linha reta simples
      const [latOrig, lngOrig] = origem.split(',');
      const [latDest, lngDest] = destino.split(',');
      const points = [
        {latitude: parseFloat(latOrig), longitude: parseFloat(lngOrig)},
        {latitude: parseFloat(latDest), longitude: parseFloat(lngDest)},
      ];
      setRota(points);

      // Ajustar região para caber ambos os pontos
      const minLat = Math.min(parseFloat(latOrig), parseFloat(latDest));
      const maxLat = Math.max(parseFloat(latOrig), parseFloat(latDest));
      const minLng = Math.min(parseFloat(lngOrig), parseFloat(lngDest));
      const maxLng = Math.max(parseFloat(lngOrig), parseFloat(lngDest));
      setRegion({
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: (maxLat - minLat) * 1.5,
        longitudeDelta: (maxLng - minLng) * 1.5,
      });
      return;
    }

    // Caso terrestre (ou outro)
    const routeIndex = parseInt(rotaSelecionada.split('-')[2]) || 0;

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origem}&destination=${destino}&mode=driving&alternatives=true&key=${Config.GOOGLE_API_KEY}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'OK' && data.routes.length > 0) {
          const route = data.routes[routeIndex] || data.routes[0];
          const points = decodePolyline(route.overview_polyline.points);
          setRota(points);

          const latitudes = points.map(p => p.latitude);
          const longitudes = points.map(p => p.longitude);
          const minLat = Math.min(...latitudes);
          const maxLat = Math.max(...latitudes);
          const minLng = Math.min(...longitudes);
          const maxLng = Math.max(...longitudes);

          setRegion({
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2,
            latitudeDelta: (maxLat - minLat) * 1.5,
            longitudeDelta: (maxLng - minLng) * 1.5,
          });
        } else {
          setRota(null);
          console.warn('Nenhuma rota encontrada');
        }
      })
      .catch(err => console.error('Erro ao buscar rotas:', err));
  }, [origem, destino, rotaSelecionada, meioTransporte]);

  const handleCartaoCreditoChange = async text => {
    setShowMsgErrorCartaoCreditoModal('');
    const cleaned = text.replace(/\D/g, '');
    // Aplica a máscara: 0000 0000 0000 0000
    const masked = cleaned.replace(/(.{4})/g, '$1 ').trim();
    setCartaoCredito(masked);
  };

  const handleNomeTitularCartaoChange = async text => {
    setShowMsgErrorNomeTitularCartaoModal('');
    setNomeTitularCartao(text);
  };

  const handleEmailTitularCartaoChange = async text => {
    setShowMsgErrorEmailTitularCartaoModal('');
    setEmailTitularCartao(text);
  };

  const handleCelularTitularCartaoChange = async text => {
    setShowMsgErrorCelularTitularCartaoModal('');
    setCelularTitularCartao(text);
  };

  const handleDataExpiracaoChange = async text => {
    setShowMsgErrorDataExpiracaoCartaoModal('');
    setDataExpiracao(text);
  };

  const handleCodidoCvvChange = async text => {
    setShowMsgErrorCodidoCvvCartaoModal('');
    setCodidoCvv(text);
  };

  const handleRuaCartaoChange = async text => {
    setShowMsgErrorRuaCartaoModal('');
    seRua(text);
  };

  const handleNumeroCartaoChange = async text => {
    setShowMsgErrorNumeroCartaoModal('');
    seNumero(text);
  };

  const handleBairroCartaoChange = async text => {
    setShowMsgErrorBairroCartaoModal('');
    seBairro(text);
  };

  const handleCidadeCartaoChange = async text => {
    setShowMsgErrorCidadeCartaoModal('');
    seCidade(text);
  };

  const payPix = async () => {
    //alert('entrando..')
    let serie_logado = await AsyncStorage.getItem('serie_logado');
    let email_cliente = await AsyncStorage.getItem('email_cliente');
    let cpf_cliente = await AsyncStorage.getItem('cpf_cliente');
    let nome_cliente = await AsyncStorage.getItem('nome_cliente');
    setsendingData(true);
    const okPagamentoServicoPix = await pagamentoServico(
      serie_logado,
      ClienteSessionStore.getSerieViagemEmNegociacao(),
      ClienteSessionStore.getCidadeOrigem(),
      ClienteSessionStore.getCidadeDestino(),
      email_cliente,
      cpf_cliente,
      nome_cliente,
      ClienteSessionStore.getValorServico(),
      metodoPagamento, //tipoCobranca
      nomeTitularCartao, //holderName
      cartaoCredito, //cardNumber
      dataExpiracao, //expiryMonthYear
      codidoCvv, //ccv
      emailTitularCartao, //holderEmail
      cep, //cep
      numero, //numberAdress
      complemento, //addressComplement
      celularTitularCartao, //holderPhone
    );

    //alert('perto..')

    console.log(okPagamentoServicoPix);
    console.log(okPagamentoServicoPix.result.cobranca_id);

    setTimeout(async () => {
      //alert('novo  entrada..')
      const okGerarQrCodeServico = await gerarQrCodeServico(
        okPagamentoServicoPix.result.cobranca_id,
        ClienteSessionStore.getSerieViagemEmNegociacao(),
      );

      //alert('novo perto..')

      if (okGerarQrCodeServico.status === 'sucesso') {
        setsendingData(false);
        setCodidoPixGeradoAtualmente(true);
        setCodigoCopiaColaPix(
          okGerarQrCodeServico.result.codigo_copia_cola_pix_pagamento_servico,
        );
      }
    }, 2000);
  };

  const payCreditCard = async text => {
    if (cartaoCredito == '') {
      setShowErrorModal(true);
      setShowMsgErrorModal('Preencha o número do seu cartão de crédito!');
      setShowMsgErrorCartaoCreditoModal(
        'Preencha o número do seu cartão de crédito!',
      );
      return;
    } else if (nomeTitularCartao == '') {
      setShowErrorModal(true);
      setShowMsgErrorModal('Preencha o nome do titular do cartão de crédito!');
      setShowMsgErrorNomeTitularCartaoModal(
        'Preencha o nome do titular do cartão de crédito!',
      );
      return;
    } else if (emailTitularCartao == '') {
      setShowErrorModal(true);
      setShowMsgErrorModal('Preencha o email do titular do cartão de crédito!');
      setShowMsgErrorEmailTitularCartaoModal(
        'Preencha o email do titular do cartão de crédito!',
      );
      return;
    } else if (celularTitularCartao == '') {
      setShowErrorModal(true);
      setShowMsgErrorModal(
        'Preencha o celular do titular do cartão de crédito!',
      );
      setShowMsgErrorCelularTitularCartaoModal(
        'Preencha o celular do titular do cartão de crédito!',
      );
      return;
    } else if (dataExpiracao == '') {
      setShowErrorModal(true);
      setShowMsgErrorModal(
        'Preencha a data de expiração do cartão de crédito!',
      );
      setShowMsgErrorDataExpiracaoCartaoModal(
        'Preencha a data de expiração do cartão de crédito!',
      );
      return;
    } else if (codidoCvv == '') {
      setShowErrorModal(true);
      setShowMsgErrorModal('Preencha o código CVV do cartão de crédito!');
      setShowMsgErrorCodidoCvvCartaoModal(
        'Preencha o código CVV do cartão de crédito!',
      );
      return;
    } else if (cep == '') {
      setShowErrorModal(true);
      setShowMsgErrorModal('Preencha o CEP!');
      setShowMsgErrorCepCartaoModal('Preencha o CEP!');
      return;
    } else if (rua == '') {
      setShowErrorModal(true);
      setShowMsgErrorModal('Preencha a rua!');
      setShowMsgErrorRuaCartaoModal('Preencha a rua!');
      return;
    } else if (numero == '') {
      setShowErrorModal(true);
      setShowMsgErrorModal('Preencha o número!');
      setShowMsgErrorNumeroCartaoModal('Preencha o número!');
      return;
    } else if (bairro == '') {
      setShowErrorModal(true);
      setShowMsgErrorModal('Preencha o bairro!');
      setShowMsgErrorBairroCartaoModal('Preencha o bairro!');
      return;
    } else if (cidade == '') {
      setShowErrorModal(true);
      setShowMsgErrorModal('Preencha a cidade!');
      setShowMsgErrorCidadeCartaoModal('Preencha a cidade!');
      return;
    }

    let serie_logado = await AsyncStorage.getItem('serie_logado');
    let email_cliente = await AsyncStorage.getItem('email_cliente');
    let cpf_cliente = await AsyncStorage.getItem('cpf_cliente');
    let nome_cliente = await AsyncStorage.getItem('nome_cliente');
    //alert('chegando')
    //return
    setsendingData(true);
    const okPagamentoServico = await pagamentoServico(
      serie_logado,
      ClienteSessionStore.getSerieViagemEmNegociacao(),
      ClienteSessionStore.getCidadeOrigem(),
      ClienteSessionStore.getCidadeDestino(),
      email_cliente,
      cpf_cliente,
      nome_cliente,
      ClienteSessionStore.getValorServico(),
      metodoPagamento, //tipoCobranca
      nomeTitularCartao, //holderName
      cartaoCredito, //cardNumber
      dataExpiracao, //expiryMonthYear
      codidoCvv, //ccv
      emailTitularCartao, //holderEmail
      cep, //cep
      numero, //numberAdress
      complemento, //addressComplement
      celularTitularCartao, //holderPhone
    );

    //return

    if (okPagamentoServico.status == 'sucesso') {
      setsendingData(false);
      setPagamentoRealizadoSucesso(true);
    }
  };

  if (!region) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#007ACC" />
      </View>
    );
  }

  //alert(pixPago)

  const renderCartao = () => (
    <View style={{marginTop: 15}}>
      <Text style={styles.labelCheckout}>Cartão de Crédito</Text>
      <TextInput
        placeholder="0000 0000 0000 0000"
        style={{
          borderBottomWidth: 1,
          borderBottomColor: '#ccc',
          paddingVertical: 8,
          fontSize: 16,
        }}
        value={cartaoCredito}
        onChangeText={handleCartaoCreditoChange}
        maxLength={23}
        keyboardType="numeric"
      />
      {showMsgErrorCartaoCreditoModal ? (
        <Text
          style={[
            styles.labelCheckout,
            {marginTop: 5, color: 'rgb(244, 9, 63)', lineHeight: 28},
          ]}>
          {showMsgErrorCartaoCreditoModal}
        </Text>
      ) : (
        ''
      )}

      <Text style={styles.labelCheckout}>Nome do titular do cartão</Text>
      <View style={styles.inputIcon}>
        <TextInput
          placeholder="Nome do titular do cartão"
          style={styles.inputCheckout}
          value={nomeTitularCartao}
          onChangeText={handleNomeTitularCartaoChange}
        />
        <FontAwesome name="user" size={20} color="#57c97d" />
      </View>
      {showMsgErrorNomeTitularCartaoModal ? (
        <Text
          style={[
            styles.labelCheckout,
            {marginTop: 5, color: 'rgb(244, 9, 63)', lineHeight: 28},
          ]}>
          {showMsgErrorNomeTitularCartaoModal}
        </Text>
      ) : (
        ''
      )}

      <Text style={styles.labelCheckout}>Email do titular do cartão</Text>
      <View style={styles.inputIcon}>
        <TextInput
          placeholder="Email do titular do cartão"
          style={styles.inputCheckout}
          value={emailTitularCartao}
          onChangeText={handleEmailTitularCartaoChange}
          keyboardType="email-address"
        />
        <MaterialIcons name="email" size={20} color="#57c97d" />
      </View>
      {showMsgErrorEmailTitularCartaoModal ? (
        <Text
          style={[
            styles.labelCheckout,
            {marginTop: 5, color: 'rgb(244, 9, 63)', lineHeight: 28},
          ]}>
          {showMsgErrorEmailTitularCartaoModal}
        </Text>
      ) : (
        ''
      )}

      <Text style={styles.labelCheckout}>Celular do titular do cartão</Text>
      <View style={styles.inputIcon}>
        <TextInput
          placeholder="Celular do titular do cartão"
          style={styles.inputCheckout}
          value={celularTitularCartao}
          onChangeText={handleCelularTitularCartaoChange}
          keyboardType="phone-pad"
        />
        <FontAwesome name="phone" size={20} color="#57c97d" />
      </View>
      {showMsgErrorCelularTitularCartaoModal ? (
        <Text
          style={[
            styles.labelCheckout,
            {marginTop: 5, color: 'rgb(244, 9, 63)', lineHeight: 28},
          ]}>
          {showMsgErrorCelularTitularCartaoModal}
        </Text>
      ) : (
        ''
      )}

      <View style={{flexDirection: 'row', marginTop: 10}}>
        <View style={{flex: 1, marginRight: 10}}>
          <Text style={styles.labelCheckout}>Data de expiração</Text>
          <View style={styles.inputIcon}>
            <TextInput
              placeholder="MM/AA"
              style={styles.inputCheckout}
              value={dataExpiracao}
              onChangeText={handleDataExpiracaoChange}
            />
            <MaterialIcons name="date-range" size={20} color="#57c97d" />
          </View>
          {showMsgErrorDataExpiracaoCartaoModal ? (
            <Text
              style={[
                styles.labelCheckout,
                {marginTop: 5, color: 'rgb(244, 9, 63)', lineHeight: 28},
              ]}>
              {showMsgErrorDataExpiracaoCartaoModal}
            </Text>
          ) : (
            ''
          )}
        </View>
        <View style={{flex: 1, marginRight: 10}}>
          <Text style={styles.labelCheckout}>Código CVV</Text>
          <View style={styles.inputIcon}>
            <TextInput
              placeholder="***"
              style={styles.inputCheckout}
              value={codidoCvv}
              onChangeText={handleCodidoCvvChange}
              secureTextEntry
            />
            <FontAwesome name="lock" size={20} color="#57c97d" />
          </View>
          {showMsgErrorCodidoCvvCartaoModal ? (
            <Text
              style={[
                styles.labelCheckout,
                {marginTop: 5, color: 'rgb(244, 9, 63)', lineHeight: 28},
              ]}>
              {showMsgErrorCodidoCvvCartaoModal}
            </Text>
          ) : (
            ''
          )}
        </View>
      </View>

      <View
        style={{
          backgroundColor: '#eee',
          padding: 12,
          alignItems: 'center',
          marginTop: 30,
          borderRadius: 5,
        }}>
        <Text
          style={{
            color: '#3ecc6d',
            fontSize: 19,
            fontFamily: 'Montserrat-Regular',
          }}>
          Informações do endereço
        </Text>
      </View>

      <Text style={[styles.labelCheckout, {marginTop: 20}]}>CEP</Text>
      <View style={styles.inputIcon}>
        <TextInput
          placeholder="00000-000"
          value={cep}
          style={styles.inputCheckout}
          onChangeText={handleCepChange}
          keyboardType="numeric"
          maxLength={9}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>
      {msgCepNaoLocalizado ? (
        <Text
          style={[
            styles.labelCheckout,
            {marginTop: 5, color: 'rgb(236, 107, 0)', lineHeight: 28},
          ]}>
          {msgCepNaoLocalizado}
        </Text>
      ) : (
        ''
      )}

      {showMsgErrorCepCartaoModal ? (
        <Text
          style={[
            styles.labelCheckout,
            {marginTop: 5, color: 'rgb(244, 9, 63)', lineHeight: 28},
          ]}>
          {showMsgErrorCepCartaoModal}
        </Text>
      ) : (
        ''
      )}

      <Text style={[styles.labelCheckout, {marginTop: 20}]}>Rua</Text>
      <View style={styles.inputIcon}>
        <TextInput
          placeholder="Informe a rua"
          value={rua}
          style={styles.inputCheckout}
          onChangeText={handleRuaCartaoChange}
        />
      </View>
      {showMsgErrorRuaCartaoModal ? (
        <Text
          style={[
            styles.labelCheckout,
            {marginTop: 5, color: 'rgb(244, 9, 63)', lineHeight: 28},
          ]}>
          {showMsgErrorRuaCartaoModal}
        </Text>
      ) : (
        ''
      )}

      <Text style={[styles.labelCheckout, {marginTop: 20}]}>Número</Text>
      <View style={styles.inputIcon}>
        <TextInput
          placeholder="123"
          value={numero}
          style={styles.inputCheckout}
          onChangeText={handleNumeroCartaoChange}
          keyboardType="numeric"
        />
      </View>
      {showMsgErrorNumeroCartaoModal ? (
        <Text
          style={[
            styles.labelCheckout,
            {marginTop: 5, color: 'rgb(244, 9, 63)', lineHeight: 28},
          ]}>
          {showMsgErrorNumeroCartaoModal}
        </Text>
      ) : (
        ''
      )}

      <Text style={styles.labelCheckout}>Bairro</Text>
      <View style={styles.inputIcon}>
        <TextInput
          placeholder="Informe o Bairro"
          value={bairro}
          style={styles.inputCheckout}
          onChangeText={handleBairroCartaoChange}
        />
      </View>
      {showMsgErrorBairroCartaoModal ? (
        <Text
          style={[
            styles.labelCheckout,
            {marginTop: 5, color: 'rgb(244, 9, 63)', lineHeight: 28},
          ]}>
          {showMsgErrorBairroCartaoModal}
        </Text>
      ) : (
        ''
      )}

      <Text style={styles.labelCheckout}>Complemento (Opcional)</Text>
      <View style={styles.inputIcon}>
        <TextInput
          placeholder="Informe o Complemento"
          value={complemento}
          style={styles.inputCheckout}
          onChangeText={seComplemento}
        />
      </View>

      <Text style={styles.labelCheckout}>Cidade</Text>
      <View style={styles.inputIcon}>
        <TextInput
          placeholder="Informe a Cidade"
          value={cidade}
          style={styles.inputCheckout}
          onChangeText={handleCidadeCartaoChange}
        />
      </View>
      {showMsgErrorCidadeCartaoModal ? (
        <Text
          style={[
            styles.labelCheckout,
            {marginTop: 5, color: 'rgb(244, 9, 63)', lineHeight: 28},
          ]}>
          {showMsgErrorCidadeCartaoModal}
        </Text>
      ) : (
        ''
      )}

      <TouchableOpacity
        disabled={sendingData ? true : false}
        onPress={payCreditCard}
        style={{
          backgroundColor: '#0C9FE3',
          padding: 12,
          marginTop: 20,
          alignItems: 'center',
          borderRadius: 5,
          width: '100%',
        }}>
        {!sendingData ? (
          <Text
            style={[
              styles.mainButtonTextModal,
              {color: '#fff', fontFamily: 'Montserrat-Bold', fontSize: 17},
            ]}>
            Realizar o Pagamento
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
                {color: '#fff', fontFamily: 'Montserrat-Bold', fontSize: 17},
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

      <View
        style={{
          width: '100%',
          marginTop: 15,
          padding: 10,
          backgroundColor: 'rgba(12, 159, 227, 0.6)',
        }}>
        <Text
          style={{lineHeight: 26, color: 'rgba(8, 77, 110,1)', fontSize: 16}}>
          Fique tranquilo, o valor do pagamento só será definitivamente debitado
          do seu cartão quando o viajante aceitar levar á sua encomenda
        </Text>
      </View>
    </View>
  );

  const renderPix = () =>
    codidoPixGeradoAtualmente && !pixPago ? (
      <View
        style={{
          backgroundColor: '#fff',
          alignItems: 'center',
          padding: 20,
          flex: 1,
          justifyContent: 'center',
        }}>
        <View
          style={{
            width: '110%',
            padding: 20,
            alignItems: 'center',
            backgroundColor: 'rgba(207, 207, 212, 0.3)',
            borderWidth: 1.5,
            borderColor: ' rgba(0, 0, 0, 0.2)',
          }}>
          <Text
            style={{
              fontSize: 17,
              fontFamily: 'Montserrat-Bold',
              marginBottom: 15,
              color: 'rgba(0, 0, 0, 0.7)',
              textAlign: 'center',
            }}>
            Escaneie e pague no app do banco
          </Text>

          <View
            style={{
              borderWidth: 10,
              borderColor: '#00B2A9',
              padding: 10,
              borderRadius: 10,
              backgroundColor: '#fff',
            }}>
            <QRCode value={codigoPix} size={230} style={{width: '90%'}} />
          </View>

          <Image
            source={logoPix} // Substitua pelo caminho correto
            style={{width: 180, height: 40, marginTop: 15, marginBottom: 10}}
            resizeMode="contain"
          />
        </View>

        <View
          style={{
            width: '110%',
            padding: 10,
            marginTop: 10,
            alignItems: 'center',
            backgroundColor: 'rgba(207, 207, 212, 0.3)',
            borderWidth: 1.5,
            borderColor: 'rgba(0, 0, 0, 0.2)',
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={{fontSize: 14, marginRight: 10}}>
              Ou copie o código para pagar
            </Text>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                backgroundColor: '#fff',
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 6,
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 4},
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
                elevation: 8,
              }}
              onPress={copiarCodigo}>
              <MaterialIcons name="file-copy" size={20} color="#000" />
              <Text style={{marginLeft: 8, fontSize: 16}}>Copiar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text
          style={{
            marginTop: 20,
            fontSize: 12,
            color: '#555',
            textAlign: 'center',
          }}>
          Cole o código Pix em 'Pix copiar e colar' no seu portal bancário.
        </Text>
      </View>
    ) : (
      <View style={{padding: 20, alignItems: 'center'}}>
        <Image
          source={bannerPix}
          style={{width: '120%', height: 120, marginBottom: 30}}
        />

        <TouchableOpacity
          disabled={sendingData ? true : false}
          onPress={payPix}
          style={{
            backgroundColor: 'rgba(5, 107, 97, 0.8)',
            padding: 12,
            alignItems: 'center',
            borderRadius: 5,
            width: '110%',
          }}>
          {!sendingData ? (
            <Text
              style={[
                styles.mainButtonTextModal,
                {color: '#fff', fontFamily: 'Montserrat-Bold', fontSize: 17},
              ]}>
              Gerar Código QR Pix
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
                  {color: '#fff', fontFamily: 'Montserrat-Bold', fontSize: 17},
                ]}>
                Gerando QRCode...
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
    );

  return (
    <>
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}>
        <TouchableWithoutFeedback onPress={() => setShowErrorModal(false)}>
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
                  name="error-outline"
                  size={48}
                  color="#e74c3c"
                  style={{marginBottom: 10}}
                />
                <Text
                  style={{
                    fontSize: 22,
                    fontFamily: 'Montserrat-Bold',
                    marginBottom: 8,
                  }}>
                  Atenção
                </Text>
                <Text
                  style={{
                    fontSize: 19,
                    fontFamily: 'Montserrat-Regular',
                    textAlign: 'center',
                    marginBottom: 20,
                  }}>
                  {showMsgErrorModal}
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#0c9fe3',
                    borderRadius: 8,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    elevation: 4,
                  }}
                  onPress={() => setShowErrorModal(false)}>
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

      <HeaderCliente />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          style={{flex: 1, backgroundColor: '#fff'}}
          keyboardShouldPersistTaps="handled">
          <View style={{alignItems: 'center'}}>
            <View
              style={[
                styles.container,
                {
                  width:
                    screenWidth * 0.9 > maxWidth ? maxWidth : screenWidth * 0.9,
                },
              ]}>
              {/* Campos de origem e destino */}
              <Text
                style={{
                  fontFamily: 'Montserrat-Bold',
                  color: 'rgba(8, 77, 110, 1)',
                  fontSize: 17,
                }}>
                Cidade de Origem
              </Text>
              <View style={[styles.input, {marginTop: 8, paddingLeft: 15}]}>
                <Text
                  style={{
                    marginTop: 12,
                    fontSize: 17,
                    fontFamily: 'Montserrat-Regular',
                    color: 'rgba(12, 159, 227, 1)',
                  }}>
                  {cidadeOrigem}
                </Text>
              </View>

              <Text
                style={{
                  fontFamily: 'Montserrat-Bold',
                  color: 'rgba(8, 77, 110, 1)',
                  fontSize: 17,
                  marginTop: 5,
                }}>
                Cidade de Destino
              </Text>
              <View style={[styles.input, {marginTop: 8, paddingLeft: 15}]}>
                <Text
                  style={{
                    marginTop: 12,
                    fontSize: 17,
                    fontFamily: 'Montserrat-Regular',
                    color: 'rgba(12, 159, 227, 1)',
                  }}>
                  {cidadeDestino}
                </Text>
              </View>

              <Text
                style={{
                  fontFamily: 'Montserrat-Bold',
                  color: 'rgba(8, 77, 110, 1)',
                  fontSize: 17,
                  marginTop: 5,
                }}>
                Data e Hora da Saida
              </Text>
              <View style={[styles.input, {marginTop: 8, paddingLeft: 15}]}>
                <Text
                  style={{
                    marginTop: 12,
                    fontSize: 17,
                    fontFamily: 'Montserrat-Regular',
                    color: 'rgba(12, 159, 227, 1)',
                  }}>
                  {dataHoraPartida}
                </Text>
              </View>

              <Text
                style={{
                  fontFamily: 'Montserrat-Bold',
                  color: 'rgba(8, 77, 110, 1)',
                  fontSize: 17,
                  marginTop: 5,
                }}>
                Data e Hora da Chegada
              </Text>
              <View style={[styles.input, {marginTop: 8, paddingLeft: 15}]}>
                <Text
                  style={{
                    marginTop: 12,
                    fontSize: 17,
                    fontFamily: 'Montserrat-Regular',
                    color: 'rgba(12, 159, 227, 1)',
                  }}>
                  {dataHoraChegada}
                </Text>
              </View>

              <Text
                style={{
                  fontFamily: 'Montserrat-Bold',
                  color: 'rgba(8, 77, 110, 1)',
                  fontSize: 17,
                  marginTop: 5,
                }}>
                Transporte
              </Text>
              <View style={[styles.input, {marginTop: 8, paddingLeft: 15}]}>
                <Text
                  style={{
                    marginTop: 12,
                    fontSize: 17,
                    fontFamily: 'Montserrat-Regular',
                    color: 'rgba(12, 159, 227, 1)',
                  }}>
                  {tipoTransporte}
                </Text>
              </View>

              <Text
                style={{
                  fontFamily: 'Montserrat-Bold',
                  color: 'rgba(8, 77, 110, 1)',
                  fontSize: 17,
                  marginTop: 5,
                }}>
                Tipo de Encomenda
              </Text>
              <View style={[styles.input, {marginTop: 8, paddingLeft: 15}]}>
                <Text
                  style={{
                    marginTop: 12,
                    fontSize: 17,
                    fontFamily: 'Montserrat-Regular',
                    color: 'rgba(12, 159, 227, 1)',
                  }}>
                  {tipoEncomenda}
                </Text>
              </View>

              <Text
                style={{
                  fontFamily: 'Montserrat-Bold',
                  color: 'rgba(8, 77, 110, 1)',
                  fontSize: 17,
                  marginTop: 5,
                }}>
                Valor do Seguro
              </Text>
              <View style={[styles.input, {marginTop: 8, paddingLeft: 15}]}>
                <Text
                  style={{
                    marginTop: 12,
                    fontSize: 17,
                    fontFamily: 'Montserrat-Regular',
                    color: 'rgba(12, 159, 227, 1)',
                  }}>
                  {valorSeguro}
                </Text>
              </View>

              <Text
                style={{
                  fontFamily: 'Montserrat-Bold',
                  color: 'rgba(8, 77, 110, 1)',
                  fontSize: 17,
                  marginTop: 5,
                }}>
                Valor do Serviço
              </Text>
              <View style={[styles.input, {marginTop: 8, paddingLeft: 15}]}>
                <Text
                  style={{
                    marginTop: 12,
                    fontSize: 17,
                    fontFamily: 'Montserrat-Bold',
                    color: '#d9991a',
                  }}>
                  {valorServico}
                </Text>
              </View>

              <TouchableWithoutFeedback
                onPress={Keyboard.dismiss}
                accessible={false}>
                <ScrollView
                  style={styles.container}
                  keyboardShouldPersistTaps="handled">
                  <View style={{flexDirection: 'row', marginTop: 0}}>
                    {(!pagamentoRealizadoSucesso ||
                      metodoPagamento == 'cartao_credito') &&
                      ((
                        <TouchableOpacity
                          style={[
                            {
                              flex: 1,
                              padding: 15,
                              alignItems: 'center',
                              borderBottomWidth: 2,
                              borderBottomColor: '#ccc',
                            },
                            metodoPagamento === 'cartao_credito' && {
                              borderBottomColor: '#2ecc71',
                            },
                          ]}
                          onPress={() => {
                            Keyboard.dismiss();
                            setMetodoPagamento('cartao_credito');
                          }}>
                          <Text style={{fontWeight: 'bold', color: '#333'}}>
                            CARTÃO DE CRÉDITO
                          </Text>
                        </TouchableOpacity>
                      ): '')}

                    {(!pagamentoRealizadoSucesso || metodoPagamento == 'pix') &&
                      ((
                        <TouchableOpacity
                          style={[
                            {
                              flex: 1,
                              padding: 15,
                              alignItems: 'center',
                              borderBottomWidth: 2,
                              borderBottomColor: '#ccc',
                            },
                            metodoPagamento === 'pix' && {
                              borderBottomColor: '#2ecc71',
                            },
                          ]}
                          onPress={() => {
                            Keyboard.dismiss();
                            setMetodoPagamento('pix');
                          }}>
                          <Text style={{fontWeight: 'bold', color: '#333'}}>
                            PIX
                          </Text>
                        </TouchableOpacity>
                      ): '')}
                  </View>

                  {(pagamentoRealizadoSucesso &&
                    metodoPagamento == 'cartao_credito') ||
                  (pagamentoRealizadoSucesso &&
                    pixPago &&
                    codidoPixGeradoAtualmente) ? (
                    <View style={{alignItems: 'center', marginTop: 10}}>
                      <MaterialIcons
                        name="task-alt"
                        size={100}
                        color="#3ecc6d"
                      />
                      <Text
                        style={{
                          fontSize: 20,
                          fontFamily: 'Montserrat-Regular',
                        }}>
                        Pagamento Realizado com Sucesso!
                      </Text>
                    </View>
                  ) : metodoPagamento === 'cartao_credito' ? (
                    renderCartao()
                  ) : (
                    renderPix()
                  )}
                </ScrollView>
              </TouchableWithoutFeedback>

              {/* Mapa */}
              <MapView
                style={{
                  height: 400,
                  marginTop: 20,
                  marginBottom: 20,
                  borderRadius: 10,
                }}
                region={region}
                zoomEnabled={true}
                scrollEnabled={true}
                showsUserLocation={false}>
                {/* Marcadores */}
                {origem && (
                  <Marker
                    coordinate={{
                      latitude: parseFloat(origem.split(',')[0]),
                      longitude: parseFloat(origem.split(',')[1]),
                    }}
                    title={cidadeOrigem.replace(
                      'Qual aeroporto você irá sair: ',
                      '',
                    )}
                  />
                )}
                {destino && (
                  <Marker
                    coordinate={{
                      latitude: parseFloat(destino.split(',')[0]),
                      longitude: parseFloat(destino.split(',')[1]),
                    }}
                    title={cidadeDestino.replace(
                      'Qual aeroporto será o destino: ',
                      '',
                    )}
                  />
                )}

                {/* Linha da rota */}
                {rota && (
                  <Polyline
                    coordinates={rota}
                    strokeColor="#0c9fe3"
                    strokeWidth={3}
                  />
                )}
              </MapView>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </>
  );
};

export default VisualizarViagem;
