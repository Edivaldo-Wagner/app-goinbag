import React, {useState, useEffect, useRef} from 'react';
import {
  Platform,
  TextInput,
  Image,
  Dimensions,
  ScrollView,
  Keyboard,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import styles from './Login.styles';
import googleicon from '../../assets/images/googleicon.png';
import faceicon from '../../assets/images/faceicon.png';

import LinearGradient from 'react-native-linear-gradient';

import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {useNavigation} from '@react-navigation/native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {useAuth} from '../../context/AuthContext';
import {
  saveToGlobalState,
  getStoredData,
  removeSpecificData,
} from '../../utils/storage';

import ClienteSessionStore from '../../screens/painel-controle-cliente/ClienteSessionStore';
import useLoginLocal from '../../hooks/UseLogin/UseLoginLocal';
import useLoginGoogle from '../../hooks/UseLogin/UseLoginGoogle';
import UseInserirViagensEmNegociacao from '../../hooks/UseInserirViagensEmNegociacao/UseInserirViagensEmNegociacao';

import {getApp} from '@react-native-firebase/app';
import {
  getMessaging,
  getToken,
  requestPermission,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';

import {v4 as uuidv4} from 'uuid';
import Config from 'react-native-config';

const URL_MAIN = Config.URL_MAIN;

async function ensureDeviceId() {
  const {device_id} = await getStoredData();

  if (device_id) {
    return device_id;
  }

  const newDeviceId = uuidv4();

  await saveToGlobalState({
    device_id: newDeviceId,
  });

  return newDeviceId;
}

const LoginModal = ({visible, onClose}) => {
  const navigation = useNavigation();
  const {saveRefreshToken, setUser, setAccessToken} = useAuth();

  const screenWidth = Dimensions.get('window').width;
  const maxWidth = 600;
  const scrollRef = useRef(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const [activeTab, setActiveTab] = useState('CLIENTE');
  const [lockedTab, setLockedTab] = useState(false);

  const {
    handleLogin,
    email,
    setEmail,
    senha,
    setSenha,
    loading,
    error,
    showErrorModal,
    setShowErrorModal,
  } = useLoginLocal({activeTab});

  const {loginGoogle} = useLoginGoogle();
  const {inserirViagensEmNegociacao} = UseInserirViagensEmNegociacao();

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
      scrollRef.current?.scrollTo({
        y: 0,
        animated: true,
      });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '914831317238-qmbehds9v83lo194dmausqec89ctvehe.apps.googleusercontent.com',
      offlineAccess: false,
    });
  }, []);

  // Executado sempre que a Modal abre ou fecha
  useEffect(() => {
    if (visible) {
      const verificarLoginComo = async () => {
        const data = await getStoredData();
        const loginComo = data.logar_como || data.login_como;

        if (
          loginComo === 'CLIENTE' ||
          loginComo === 'VIAJANTE' ||
          loginComo === 'DESTINATÁRIO'
        ) {
          setLockedTab(loginComo);
          setActiveTab(loginComo);
        } else {
          setLockedTab(null);
        }
      };

      verificarLoginComo();
    } else {
      // Limpa dados de trava ao fechar a modal
      removeSpecificData('logar_como');
      removeSpecificData('login_como');
    }
  }, [visible]);

  const handleSuccessAuth = async (usuarioLogado) => {
    onClose(); // Fecha a Modal de Login antes de navegar

    const stored = await getStoredData();

    if (stored.cadastramento_mala !== undefined) {
      await removeSpecificData('cadastramento_mala');
      navigation.navigate('QualMeioTransporteCadastramento');
      return;
    }

    if (stored.notificacoes !== undefined) {
      await removeSpecificData('notificacoes');
      navigation.navigate('Notificacoes');
      return;
    }

    if (stored.redireccionamento_cliente_visualizar_viagem !== undefined) {
      const resultViagensEmNegociacao = await inserirViagensEmNegociacao(
        ClienteSessionStore.getCidadeOrigem(),
        ClienteSessionStore.getCidadeOrigemLat(),
        ClienteSessionStore.getCidadeOrigemLng(),
        ClienteSessionStore.getCidadeDestino(),
        ClienteSessionStore.getCidadeDestinoLat(),
        ClienteSessionStore.getCidadeDestinoLng(),
        ClienteSessionStore.getDataPartida(),
        ClienteSessionStore.getDataChegada(),
        ClienteSessionStore.getDataPartidaParaBusca(),
        ClienteSessionStore.getDataChegadaParaBusca(),
        ClienteSessionStore.getHoraPartida(),
        ClienteSessionStore.getHoraChegada(),
        ClienteSessionStore.getValorServicoSeNaoLogado(),
        ClienteSessionStore.getTipoEncomenda(),
        ClienteSessionStore.getTipoEncomendaDoCliente(),
        ClienteSessionStore.getTransporte(),
        ClienteSessionStore.getInformacaoSobreTrajeto(),
        usuarioLogado.serie_logado,
        ClienteSessionStore.getSerieEstrangeiraCarteiroVisualizarViagem(),
        ClienteSessionStore.getValorSeguroSeNaoLogado(),
        ClienteSessionStore.getDuracaoViagem(),
        ClienteSessionStore.getRotaSelecionada(),
        ClienteSessionStore.getSerieVisualizarViagem(),
      );

      ClienteSessionStore.setSerieViagemEmNegociacao(
        resultViagensEmNegociacao.serie_viagem_negociacao,
      );

      await removeSpecificData(
        'redireccionamento_cliente_visualizar_viagem',
      );
      navigation.navigate('VisualizarViagemCliente');
      return;
    }

    if (usuarioLogado.tipo === 'CLIENTE') {
      navigation.navigate('DashboardClient');
    } else if (usuarioLogado.tipo === 'VIAJANTE') {
      navigation.navigate('DashboardTraveler');
    } else if (usuarioLogado.tipo === 'Destinatário') {
      navigation.navigate('DashboardReceiver');
    }
  };

  const signInGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

      const userInfo = await GoogleSignin.signIn();

      const tipoMap = {
        CLIENTE: 'CLIENTE',
        VIAJANTE: 'VIAJANTE',
        DESTINATÁRIO: 'DESTINATÁRIO',
      };

      const tipoUsuario = tipoMap[activeTab];

      const usuarioLogado = await loginGoogle(
        userInfo.data.idToken,
        tipoUsuario,
      );

      await GoogleSignin.signOut();

      if (usuarioLogado) {
        await saveToGlobalState({
          logar_como: usuarioLogado.tipo,
          serie_logado: usuarioLogado.serie_logado,
          tipo_chave_pix: usuarioLogado.tipo_chave_pix,
          chave_pix: usuarioLogado.chave_pix,

          id_carteiro: `${usuarioLogado.id_carteiro}`,
          nome_carteiro: usuarioLogado.nome,
          sobrenome_carteiro: usuarioLogado.sobrenome,
          celular_carteiro: usuarioLogado.celular,
          email_carteiro: usuarioLogado.email,
          cpf_carteiro: usuarioLogado.cpf,
          nascimento_carteiro: usuarioLogado.nascimento,
          status_carteiro: usuarioLogado.status,

          id_cliente: `${usuarioLogado.id_carteiro}`,
          nome_cliente: usuarioLogado.nome,
          sobrenome_cliente: usuarioLogado.sobrenome,
          celular_cliente: usuarioLogado.celular,
          email_cliente: usuarioLogado.email,
          cpf_cliente: usuarioLogado.cpf,
          nascimento_cliente: usuarioLogado.nascimento,
          status_cliente: usuarioLogado.status,

          id_destinatario: `${usuarioLogado.id_carteiro}`,
          nome_destinatario: usuarioLogado.nome,
          sobrenome_destinatario: usuarioLogado.sobrenome,
          celular_destinatario: usuarioLogado.celular,
          email_destinatario: usuarioLogado.email,
          cpf_destinatario: usuarioLogado.cpf,
          nascimento_destinatario: usuarioLogado.nascimento,
          status_destinatario: usuarioLogado.status,
        });

        if (
          usuarioLogado?.refresh &&
          usuarioLogado?.access &&
          usuarioLogado?.user
        ) {
          await saveRefreshToken(usuarioLogado.refresh);
          setAccessToken(usuarioLogado.access);
          setUser(usuarioLogado.user);
        }

        try {
          const messagingInstance = getMessaging(getApp());
          const authStatus = await requestPermission(messagingInstance);

          const enabled =
            authStatus === AuthorizationStatus.AUTHORIZED ||
            authStatus === AuthorizationStatus.PROVISIONAL;

          if (enabled) {
            const device_id = await ensureDeviceId();
            const token = await getToken(messagingInstance);

            const payload = {
              serie_estrangeira: usuarioLogado.serie_logado,
              fcm_token: token,
              device_id,
              device_type: Platform.OS,
              device_name: `${Platform.OS} ${Platform.Version}`,
            };

            await fetch(
              `${URL_MAIN}/controllers/mobile/SalvarFcmTokenController.php`,
              {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
              },
            );
          }
        } catch (err) {
          console.log('Erro ao salvar token FCM:', err);
        }

        await handleSuccessAuth(usuarioLogado);
      } else {
        await saveToGlobalState({
          tipoCadastro: 'google',
          nomeGoogle: userInfo.data.user.givenName ?? '',
          sobreNomeGoogle: userInfo.data.user.familyName ?? '',
          emailGoogle: userInfo.data.user.email?.trim() ?? '',
        });

        await removeSpecificData('cadastramento_mala');
        onClose();
        navigation.navigate('Cadastro');
        return;
      }

      await GoogleSignin.signOut();
    } catch (error) {
      console.log('GOOGLE ERROR:', error.code, error.message, error);

      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Google Play Services indisponível');
      }
    }
  };

  const closeModal = () => {
    setShowErrorModal(false);
  };

  const redirectCadastro = async () => {
    await removeSpecificData('nomeGoogle');
    await removeSpecificData('sobreNomeGoogle');
    await removeSpecificData('emailGoogle');

    await saveToGlobalState({
      tipoCadastro: 'local',
    });

    onClose();
    //navigation.navigate('Cadastro');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}>
        <TouchableWithoutFeedback>
          <View
            style={[
              styles.container,
              {width: Math.min(screenWidth * 0.9, maxWidth)},
            ]}>
            <TouchableOpacity
              style={{alignSelf: 'center', padding: 10,}}
              onPress={onClose}>
              <MaterialIcon name="close" size={35} color="#00bbe6" />
            </TouchableOpacity>

            <ScrollView
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              scrollEnabled={keyboardVisible}>
              
              <Text style={styles.headerTitle}>Fazer login como</Text>

              {/* Abas */}
              <View style={styles.tabsContainer}>
                {['CLIENTE', 'VIAJANTE', 'DESTINATÁRIO'].map((t, index, array) => {
                  const isDisabled = lockedTab && lockedTab !== t;
                  const isActive = activeTab === t;

                  if (isActive) {
                    return (
                      <TouchableOpacity
                        key={t}
                        disabled={isDisabled}
                        style={styles.tabButtonActiveWrapper}>
                        <LinearGradient
                          start={{x: 0, y: 0}}
                          end={{x: 1, y: 0}}
                          colors={['#1a7fe7', '#19c4c9']}
                          style={styles.gradientTab}>
                          <Text style={styles.textTabActive}>{t}</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    );
                  }

                  const isNextActive = array[index + 1] === activeTab;
                  const isLast = index === array.length - 1;

                  return (
                    <TouchableOpacity
                      key={t}
                      onPress={() => !isDisabled && setActiveTab(t)}
                      disabled={isDisabled}
                      style={[
                        styles.tabButtonInactive,
                        !isLast && !isNextActive && styles.tabWithRightCurve,
                        {opacity: isDisabled ? 0.4 : 1},
                      ]}>
                      <Text style={styles.textTabInactive}>{t}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Campo Email */}
              <View style={{marginTop: 15, padding: 5}}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  autoFocus
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Campo Senha */}
              <View style={{marginTop: 5, padding: 5}}>
                <Text style={styles.inputLabel}>Senha</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={senha}
                  onChangeText={setSenha}
                />
              </View>

              {/* Esqueci a senha */}
              <TouchableOpacity style={{marginTop: 15}}>
                <Text style={styles.forgotPasswordText}>Esqueci a senha</Text>
              </TouchableOpacity>

              {/* Botão Entrar */}
              <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Entrar</Text>
                )}
              </TouchableOpacity>

              {/* Redirecionar Cadastro */}
              <TouchableOpacity onPress={redirectCadastro}>
                <Text style={styles.redirectCadastroText}>
                  Ainda não fiz o cadastro
                </Text>
              </TouchableOpacity>

              {/* Redes Sociais */}
              <View style={{marginTop: 10, marginBottom: 20, padding: 5}}>
                <Text style={styles.sectionTitle}>Criar conta nova</Text>

                <TouchableOpacity
                  onPress={signInGoogle}
                  style={styles.socialButtonGoogle}>
                  <View style={styles.socialButtonContent}>
                    <Image
                      source={googleicon}
                      style={styles.socialIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.socialTextGoogle}>
                      Continuar com Google
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.socialButtonFacebook}>
                  <View style={styles.socialButtonContent}>
                    <Image
                      source={faceicon}
                      style={styles.socialIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.socialTextFacebook}>
                      Entrar com Facebook
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>

      {/* Modal Interna de Erro */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <MaterialIcon
                  name="error-outline"
                  size={48}
                  color="#e74c3c"
                  style={{marginBottom: 10}}
                />
                <Text style={styles.modalTitle}>Atenção</Text>
                <Text style={styles.modalMessage}>{error}</Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={closeModal}>
                  <Text style={styles.modalButtonText}>Entendido</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </Modal>
  );
};

export default LoginModal;