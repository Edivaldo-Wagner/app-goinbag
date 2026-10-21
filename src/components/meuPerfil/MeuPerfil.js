//MeuPerfil.js
import React, {useEffect, useRef, useState, useCallback} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  Keyboard,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../header/Header';
import LocalizacaoAtual from '../localizacaoAtual/LocalizacaoAtual';
import {useAuth} from '../../context/AuthContext';
import UseUsuarios from '../../hooks/UseUsuarios/UseUsuarios';
import UseAlterarSenha from '../../hooks/UseAlterarSenha/UseAlterarSenha';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {launchImageLibrary} from 'react-native-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {Picker} from '@react-native-picker/picker';
import {TextInputMask} from 'react-native-masked-text';
import CountryFlag from 'react-native-country-flag';
import {getSecureData} from '../../utils/secureStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UseEditarUsuario from '../../hooks/UseEditarUsuario/UseEditarUsuario';
import UseConfirmacaoTelefone from '../../hooks/UseConfirmacaoTelefone/UseConfirmacaoTelefone';
import UseConfirmacaoEmail from '../../hooks/UseConfirmacaoEmail/UseConfirmacaoEmail';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;

// ======= Helper functions =======
const normalizarTelefone = valor => {
  let digitos = String(valor || '').replace(/\D/g, '');
  if (digitos.startsWith('55') && digitos.length > 11) {
    digitos = digitos.slice(2);
  }
  return digitos;
};

const formatarDataParaAPI = data => {
  if (!data || !(data instanceof Date) || isNaN(data.getTime())) {
    return '';
  }
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
};
// ================================

const EditarPerfil = () => {
  const navigation = useNavigation();
  const {user} = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatarVersion, setAvatarVersion] = useState(Date.now());
  const [msgIconColorAlertModal, setMsgIconColorAlertModal] = useState('');
  const [msgIconAlertModal, setMsgIconAlertModal] = useState('');
  const [msgTitleAlertModal, setMsgTitleAlertModal] = useState('');
  const [msgDescAlertModal, setMsgDescAlertModal] = useState('');
  const [showAlertModal, setShowAlertModal] = useState(false);

  const [nome, setNome] = useState('');
  const [sobreNome, setSobreNome] = useState('');
  const [serieLogado, setSerieLogado] = useState('');

  const [selectedDate, setSelectedDate] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const [tipochavePix, setTipoChavePix] = useState('');
  const [chavePix, setChavePix] = useState('');
  const [telefone, setTelefone] = useState('');
  const telefoneRef = useRef(null);
  const telefoneOriginalRef = useRef('');
  const [email, setEmail] = useState('');
  const emailOriginalRef = useRef('');
  const [uploadAvatar, setUploadAvatar] = useState(false);
  const [avatar, setAvatar] = useState('');

  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const salvamentoEmAndamento = useRef(false);

  // verification flow states
  const verificationQueueRef = useRef([]);
  const currentVerificationIndexRef = useRef(0);
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [currentVerificationIndex, setCurrentVerificationIndex] = useState(0);
  const [isVerificationModalVisible, setIsVerificationModalVisible] = useState(false);

  // 5-digit inputs refs
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const {usuarios} = UseUsuarios();
  const {editarUsuario} = UseEditarUsuario();

  const handleNextVerificationStep = async (data) => {
    try {
      if (data?.confirmation_token) {
        await AsyncStorage.setItem('confirmation_token', data.confirmation_token);
      }

      const queue = verificationQueueRef.current;
      const nextIndex = currentVerificationIndexRef.current + 1;

      if (nextIndex < queue.length) {
        currentVerificationIndexRef.current = nextIndex;
        setCurrentVerificationIndex(nextIndex);

        const nextVerification = queue[nextIndex];

        phoneConfirmationHook.setCode(['', '', '', '', '']);
        emailConfirmationHook.setCode(['', '', '', '', '']);

        if (nextVerification.type === 'telefone') {
          await phoneConfirmationHook.generateCode();
        } else {
          await emailConfirmationHook.generateCode();
        }
        return;
      }

      setIsVerificationModalVisible(false);
      setVerificationQueue([]);
      verificationQueueRef.current = [];
      currentVerificationIndexRef.current = 0;
      await AsyncStorage.removeItem('confirmation_token');

      setUploadAvatar(false);
      setMsgIconColorAlertModal('#188211');
      setMsgIconAlertModal('task-alt');
      setMsgTitleAlertModal('SUCESSO');
      setMsgDescAlertModal('Perfil e dados confirmados com sucesso!');
      setShowAlertModal(true);
    } catch (error) {
      console.warn('Erro na sequência de confirmação:', error);
    }
  };

  const phoneConfirmationHook = UseConfirmacaoTelefone({
    onVerified: (data) => handleNextVerificationStep(data),
  });

  const emailConfirmationHook = UseConfirmacaoEmail({
    onVerified: (data) => handleNextVerificationStep(data),
  });

  const currentVerificationType = verificationQueue[currentVerificationIndex]?.type;
  const activeHook = currentVerificationType === 'telefone'
    ? phoneConfirmationHook
    : emailConfirmationHook;

  useFocusEffect(
    useCallback(() => {
      setAvatarVersion(Date.now());
    }, []),
  );

  useEffect(() => {
    const redirectLogin = async () => {
      try {
        const refresh_token = await getSecureData('refresh_token');
        if (!refresh_token) {
          navigation.reset({
            index: 1,
            routes: [
              { name: 'Home' },
              { name: 'Login' },
            ],
          });
          return;
        }
      } catch (error) {}
    };
    redirectLogin();
  }, []);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const refresh_token = await getSecureData('refresh_token');
        setIsLoggedIn(!!refresh_token);
      } catch (error) {
        console.log('Erro ao verificar login:', error);
        setIsLoggedIn(false);
      }
    };
    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (user) {
      emailOriginalRef.current = String(user.email || '')
        .trim()
        .toLowerCase();

      telefoneOriginalRef.current = normalizarTelefone(user.telefone);
    }
  }, [user]);

  useEffect(() => {
    const renderizarDadosPerfil = () => {
      if (user) {
        if (user.identificacao) {
          setAvatar(`${URL_MAIN}${user.identificacao}?t=${avatarVersion}`);
        }

        setSerieLogado(user.serie || user.serie_viagem || '');

        const nomeCompleto = (user.nome || '').trim();
        const [primeiroNome, ...restanteSobrenome] = nomeCompleto.split(' ');

        setNome(primeiroNome || '');
        setSobreNome(restanteSobrenome.join(' ') || '');

        if (user.data_nascimento) {
          const parts = user.data_nascimento.split('-');
          if (parts.length === 3) {
            const [ano, mes, dia] = parts.map(Number);
            setSelectedDate(new Date(ano, mes - 1, dia));
          }
        }

        const telefoneFormatado = user.telefone ? user.telefone.replace(/^\+55\s*/, '') : '';
        setTelefone(telefoneFormatado);
        setEmail(user.email || '');
        setChavePix(user.chave_pix || '');

        if (user.tipo_pix) {
          const pixLower = user.tipo_pix.toLowerCase().trim();
          if (['cpf', 'cnpj', 'cpf/cnpj'].includes(pixLower)) {
            setTipoChavePix('CPF/CNPJ');
          } else if (pixLower === 'telefone') {
            setTipoChavePix('Telefone');
          } else if (pixLower === 'email') {
            setTipoChavePix('Email');
          } else if (pixLower.includes('aleat')) {
            setTipoChavePix('Chave aleatória');
          } else {
            setTipoChavePix(user.tipo_pix);
          }
        } else {
          setTipoChavePix('');
        }
      }
    };
    renderizarDadosPerfil();
  }, [user, avatarVersion]);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirmDate = date => {
    setSelectedDate(date);
    hideDatePicker();
  };

  const selecionarImagem = () => {
    setUploadAvatar(false);
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8 },
      response => {
        if (response.didCancel) {
          // cancelado
        } else if (response.errorCode) {
          console.log('Erro: ', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const imagemSelecionada = response.assets[0].uri;
          setAvatar(imagemSelecionada);
          setUploadAvatar(true);
        }
      },
    );
  };

  const maskValueForDisplay = (type, value) => {
    if (!value) return '';
    if (type === 'telefone') {
      const digits = value.replace(/\D/g, '');
      const last4 = digits.slice(-4);
      return `+55 •••••• ${last4}`;
    } else {
      const parts = value.split('@');
      if (parts.length === 2) {
        const name = parts[0];
        const domain = parts[1];
        const start = name[0] || '';
        return `${start}•••@${domain}`;
      }
      return '•••';
    }
  };

  const confirmCurrentCode = async () => {
    const composedCode = activeHook.code.join('');
    if (composedCode.length !== 5) {
      setMsgIconColorAlertModal('#9c053a');
      setMsgIconAlertModal('error-outline');
      setMsgTitleAlertModal('ATENÇÃO');
      setMsgDescAlertModal('Digite o código de 5 dígitos');
      setShowAlertModal(true);
      return;
    }

    const success = await activeHook.verifyCode();
    if (!success) {
      setMsgIconColorAlertModal('#9c053a');
      setMsgIconAlertModal('error-outline');
      setMsgTitleAlertModal('CÓDIGO INVÁLIDO');
      setMsgDescAlertModal(activeHook.error || 'Código inválido ou expirado.');
      setShowAlertModal(true);
    }
  };

  const resendCurrentCode = async () => {
    if (activeHook.timer > 0) return;
    await activeHook.generateCode();
    if (activeHook.success) {
      setMsgIconColorAlertModal('#188211');
      setMsgIconAlertModal('task-alt');
      setMsgTitleAlertModal('SUCESSO');
      setMsgDescAlertModal(activeHook.success);
      setShowAlertModal(true);
    }
  };

  const handleSalvarPerfil = async () => {
    if (salvamentoEmAndamento.current) return;

    if (
      !nome.trim() ||
      !sobreNome.trim() ||
      !telefone.trim() ||
      !email.trim() ||
      !chavePix.trim()
    ) {
      setMsgIconColorAlertModal('#9c053a');
      setMsgIconAlertModal('error-outline');
      setMsgTitleAlertModal('ATENÇÃO');
      setMsgDescAlertModal('Preencha corretamente todos os campos!');
      setShowAlertModal(true);
      return;
    }

    const telefoneAntigo = telefoneOriginalRef.current;
    const telefoneNovo = normalizarTelefone(telefone);

    const emailAntigo = emailOriginalRef.current;
    const emailNovo = email.trim().toLowerCase();

    const telefoneMudou = telefoneNovo !== telefoneAntigo;
    const emailMudou = emailNovo !== emailAntigo;

    const telefoneLimpo = `+55 ${telefone.trim()}`;
    const nomeCompleto = `${nome.trim()} ${sobreNome.trim()}`;
    const dataFormatada = formatarDataParaAPI(selectedDate);

    salvamentoEmAndamento.current = true;
    setSalvandoPerfil(true);

    try {
      const result = await editarUsuario(
        serieLogado,
        nomeCompleto,
        '',
        dataFormatada,
        telefoneLimpo,
        emailNovo,
        tipochavePix,
        chavePix.trim(),
        uploadAvatar,
        avatar,
      );

      if (result?.status !== 'sucesso') {
        throw new Error(result?.message || 'Erro ao atualizar perfil.');
      }

      emailOriginalRef.current = emailNovo;
      telefoneOriginalRef.current = telefoneNovo;

      if (result.data?.confirmation_token) {
        await AsyncStorage.setItem('confirmation_token', result.data.confirmation_token);
      }

      const queue = [];
      if (emailMudou) queue.push({ type: 'email', value: emailNovo });
      if (telefoneMudou) queue.push({ type: 'telefone', value: telefoneLimpo });

      if (queue.length > 0) {
        verificationQueueRef.current = queue;
        currentVerificationIndexRef.current = 0;

        phoneConfirmationHook.setCode(['', '', '', '', '']);
        emailConfirmationHook.setCode(['', '', '', '', '']);

        setVerificationQueue(queue);
        setCurrentVerificationIndex(0);
        setIsVerificationModalVisible(true);

        if (queue[0].type === 'telefone') {
          await phoneConfirmationHook.generateCode();
        } else {
          await emailConfirmationHook.generateCode();
        }
      } else {
        setUploadAvatar(false);
        setMsgIconColorAlertModal('#188211');
        setMsgIconAlertModal('task-alt');
        setMsgTitleAlertModal('SUCESSO');
        setMsgDescAlertModal('Perfil atualizado com sucesso!');
        setShowAlertModal(true);
      }
    } catch (error) {
      console.warn('Erro ao salvar perfil:', error);
      setMsgIconColorAlertModal('#9c053a');
      setMsgIconAlertModal('error-outline');
      setMsgTitleAlertModal('ERRO');
      setMsgDescAlertModal(error.message || 'Falha ao atualizar perfil.');
      setShowAlertModal(true);
    } finally {
      salvamentoEmAndamento.current = false;
      setSalvandoPerfil(false);
    }
  };

  const currentVerification = verificationQueue[currentVerificationIndex];

  return (
    <>
      <Modal
        visible={showAlertModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAlertModal(false)}>
        <TouchableWithoutFeedback onPress={() => setShowAlertModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.alertModal}>
                <MaterialIcons
                  name={msgIconAlertModal}
                  size={48}
                  color={msgIconColorAlertModal}
                  style={{marginBottom: 10}}
                />
                <Text style={styles.alertTitle}>{msgTitleAlertModal}</Text>
                <Text style={styles.alertMessage}>{msgDescAlertModal}</Text>
                <TouchableOpacity
                  style={[
                    styles.alertButton,
                    {backgroundColor: msgIconColorAlertModal},
                  ]}
                  onPress={() => setShowAlertModal(false)}>
                  <Text style={styles.alertButtonText}>Entendi</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={isVerificationModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {}}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.modalOverlay}>
            <View style={styles.verifyContainer}>
              <Text style={styles.verifyTitle}>Verificação de segurança</Text>

              <Text style={styles.verifySubtitle}>
                Enviamos um código de 5 dígitos para:
              </Text>

              <Text style={styles.verifyTarget}>
                {currentVerification
                  ? `${
                      currentVerification.type === 'telefone'
                        ? 'Telefone'
                        : 'Email'
                    } — ${maskValueForDisplay(
                      currentVerification.type,
                      currentVerification.value,
                    )}`
                  : ''}
              </Text>

              <View style={styles.codeRow}>
                {activeHook.code.map((d, i) => (
                  <TextInput
                    key={`digit-${i}`}
                    ref={inputRefs[i]}
                    value={d}
                    onChangeText={t => {
                      const newCode = [...activeHook.code];
                      newCode[i] = t.replace(/\D/g, '').slice(-1);
                      activeHook.setCode(newCode);
                      if (t && i < 4) {
                        inputRefs[i + 1]?.current?.focus();
                      }
                    }}
                    onKeyPress={e => {
                      if (e.nativeEvent.key === 'Backspace' && !activeHook.code[i] && i > 0) {
                        inputRefs[i - 1]?.current?.focus();
                      }
                    }}
                    keyboardType="numeric"
                    maxLength={1}
                    style={styles.codeInput}
                    textContentType="oneTimeCode"
                    returnKeyType={i === 4 ? 'done' : 'next'}
                    autoFocus={i === 0}
                    selectTextOnFocus
                  />
                ))}
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 12,
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={confirmCurrentCode}
                  disabled={activeHook.loading || activeHook.code.join('').length !== 5}>
                  <Text style={{color: '#fff', fontWeight: 'bold'}}>
                    {activeHook.loading ? 'A validar...' : 'Confirmar'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={resendCurrentCode}
                  disabled={activeHook.timer > 0}
                  style={{marginLeft: 12}}>
                  <Text
                    style={{color: activeHook.timer > 0 ? '#999' : '#007bff'}}>
                    {activeHook.timer > 0
                      ? `Reenviar em ${activeHook.timer}s`
                      : 'Reenviar código'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={{marginTop: 12}}
                onPress={() => {
                  setIsVerificationModalVisible(false);
                  setVerificationQueue([]);
                  verificationQueueRef.current = [];
                  currentVerificationIndexRef.current = 0;

                  phoneConfirmationHook.setCode(['', '', '', '', '']);
                  emailConfirmationHook.setCode(['', '', '', '', '']);

                  salvamentoEmAndamento.current = false;
                  setSalvandoPerfil(false);
                }}>
                <Text style={{color: '#ff3b30'}}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <ScrollView contentContainerStyle={{...styles.scroll, flexGrow: 1, backgroundColor: '#f0eded', paddingBottom: 120}}>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={hideDatePicker}
        />
        <TouchableOpacity onPress={selecionarImagem}>
          <Image 
            key={avatarVersion}
            source={{uri: avatar, cache: 'reload'}} 
            style={styles.avatar} 
          />
        </TouchableOpacity>
        <View style={styles.form}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.inputStyle}
            value={nome}
            onChangeText={setNome}
          />

          <Text style={styles.label}>SobreNome</Text>
          <TextInput
            style={styles.inputStyle}
            value={sobreNome}
            onChangeText={setSobreNome}
          />

          <Text style={styles.label}>Data de Nascimento</Text>
          <TouchableOpacity style={styles.inputStyle} onPress={showDatePicker}>
            <Text style={{color: '#353738'}}>
              {selectedDate
                ? new Intl.DateTimeFormat('pt-BR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }).format(selectedDate)
                : ''}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Telefone</Text>
          <View style={styles.inputContainer}>
            <CountryFlag isoCode="BR" size={28} style={{marginRight: 10}} />
            <View style={styles.dddContainer}>
              <Text style={styles.ddd}>+55</Text>
            </View>
            <TextInputMask
              type={'custom'}
              options={{mask: '(99) 99999-9999'}}
              value={telefone}
              onChangeText={text => setTelefone(text)}
              style={styles.phoneInput}
              keyboardType="numeric"
              placeholder="(11) 91234-5678"
              placeholderTextColor="#999"
              ref={telefoneRef}
            />
          </View>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.inputStyle}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <Text style={styles.label}>Tipo de Chave Pix</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={tipochavePix}
              onValueChange={v => setTipoChavePix(v)}
              style={[styles.picker, { color: '#353738' }]}>
              <Picker.Item label="Selecione uma opção" value="" />
              <Picker.Item label="CPF/CNPJ" value="CPF/CNPJ" />
              <Picker.Item label="Telefone" value="Telefone" />
              <Picker.Item label="Email" value="Email" />
              <Picker.Item label="Chave aleatória" value="Chave aleatória" />
            </Picker>
          </View>

          <Text style={styles.label}>Chave Pix</Text>
          <TextInput
            style={styles.inputStyle}
            value={chavePix}
            onChangeText={setChavePix}
          />

          <TouchableOpacity
            onPress={handleSalvarPerfil}
            disabled={salvandoPerfil}
            activeOpacity={0.8}
            style={[
              styles.saveButton,
              salvandoPerfil && styles.saveButtonDisabled,
            ]}
          >
            {salvandoPerfil ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator
                  size="small"
                  color="#fff"
                  style={{ marginRight: 10 }}
                />
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 17,
                    fontFamily: 'Montserrat-Bold',
                  }}
                >
                  Processando...
                </Text>
              </View>
            ) : (
              <Text
                style={{
                  color: '#fff',
                  fontSize: 17,
                  fontFamily: 'Montserrat-Bold',
                }}
              >
                Salvar
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
};

// ---------- other tabs ----------

const AlterarSenha = () => {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  const {alterarSenha, loading} = UseAlterarSenha();

  const handleModificarSenha = async () => {
    if (salvandoSenha || loading) {
      return;
    }

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      Alert.alert('Atenção', 'Preencha todos os campos de senha.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      Alert.alert('Erro', 'A nova senha e a confirmação não coincidem.');
      return;
    }

    setSalvandoSenha(true);

    try {
      const resultado = await alterarSenha(senhaAtual, novaSenha);

      if (resultado?.status === 'sucesso') {
        Alert.alert('Sucesso', 'Senha alterada com sucesso!');
        setSenhaAtual('');
        setNovaSenha('');
        setConfirmarSenha('');
      } else {
        Alert.alert('Erro', resultado?.message || 'Não foi possível alterar a senha.');
      }
    } catch (error) {
      console.warn('Erro ao alterar senha:', error);
      Alert.alert('Erro', 'Não foi possível alterar a senha. Tente novamente.');
    } finally {
      setSalvandoSenha(false);
    }
  };

  const carregando = salvandoSenha || loading;

  return (
    <ScrollView
      contentContainerStyle={{
        ...styles.scroll,
        flexGrow: 1,
        backgroundColor: '#f0eded',
        paddingBottom: 120,
      }}>
      <View style={styles.form}>
        <Text style={styles.label}>Senha atual</Text>
        <TextInput
          style={styles.inputStyle}
          secureTextEntry
          value={senhaAtual}
          onChangeText={setSenhaAtual}
          editable={!carregando}
        />

        <Text style={styles.label}>Nova senha</Text>
        <TextInput
          style={styles.inputStyle}
          secureTextEntry
          value={novaSenha}
          onChangeText={setNovaSenha}
          editable={!carregando}
        />

        <Text style={styles.label}>Confirmar nova senha</Text>
        <TextInput
          style={styles.inputStyle}
          secureTextEntry
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          editable={!carregando}
        />

        <TouchableOpacity
          onPress={handleModificarSenha}
          disabled={carregando}
          style={[
            styles.saveButton,
            carregando && {opacity: 0.6},
          ]}>
          <Text
            style={{
              color: '#fff',
              fontSize: 17,
              fontFamily: 'Montserrat-Bold',
            }}>
            {carregando ? 'A guardar...' : 'Salvar'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};


const MeuPerfil = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'editar', title: 'Editar Perfil'},
    {key: 'senha', title: 'Alterar Senha'},
  ]);

  const renderScene = SceneMap({
    editar: EditarPerfil,
    senha: AlterarSenha,
  });

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#0a768f'}} edges={['top', 'left', 'right']}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#0a768f" 
        translucent={false} 
      />
      <TabView
        navigationState={{index, routes}}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{width: Dimensions.get('window').width}}
        renderTabBar={props => (
          <TabBar
            {...props}
            indicatorStyle={{backgroundColor: '#007bff'}}
            style={{backgroundColor: '#f8f8f8'}}
            activeColor="#007bff"
            inactiveColor="#999"
            labelStyle={{fontWeight: 'bold'}}
          />
        )}
      />
      <LocalizacaoAtual />
      <Header />
    </SafeAreaView>
  );
};

export default MeuPerfil;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  verifyContainer: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    elevation: 8,
  },
  verifyTitle: {fontSize: 20, fontFamily: 'Montserrat-Bold', marginBottom: 6},
  verifySubtitle: {fontSize: 14, color: '#555', textAlign: 'center'},
  verifyTarget: {fontSize: 14, marginTop: 6, color: '#333', fontWeight: '600'},
  codeRow: {flexDirection: 'row', marginTop: 18, justifyContent: 'center'},
  codeInput: {
    width: 48,
    height: 56,
    marginHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    color: '#353734',
    borderColor: '#ddd',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
    backgroundColor: '#fafafa',
  },
  confirmButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 10,
  },
  alertModal: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  alertTitle: {
    fontSize: 22,
    color: '#353437',
    fontFamily: 'Montserrat-Bold',
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 17,
    color: '#353437',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  alertButton: {
    backgroundColor: '#0c9fe3',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  alertButtonText: {
    width: 100,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Montserrat-Regular',
    data: '...',
  },
  scroll: {
    padding: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 20,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#444',
    marginBottom: 5,
    marginTop: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 3.5,
    elevation: 4,
  },
  dddContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    paddingHorizontal: 6,
    backgroundColor: '#e1e6eb',
    borderRadius: 8,
    height: 45,
  },
  ddd: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#333',
  },
  phoneInput: {
    flex: 1,
    fontSize: 17,
    fontFamily: 'Montserrat-Regular',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    color: '#353738',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 2,
  },
  inputStyle: {
    backgroundColor: '#fff',
    marginTop: 5,
    paddingLeft: 15,
    color: 'rgba(0,0,0,0.8)',
    borderRadius: 10,
    height: 45,
    fontSize: 17,
    fontFamily: 'Montserrat-Regular',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
    paddingVertical: 10,
  },
  pickerWrapper: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    backgroundColor: '#fff',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#00aaff',
    borderRadius: 15,
    marginTop: 15,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
});