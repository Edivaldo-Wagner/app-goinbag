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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../header/Header';
import LocalizacaoAtual from '../localizacaoAtual/LocalizacaoAtual';
import {useAuth} from '../../context/AuthContext';
import UseUsuarios from '../../hooks/UseUsuarios/UseUsuarios';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {launchImageLibrary} from 'react-native-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {Picker} from '@react-native-picker/picker';
import {TextInputMask} from 'react-native-masked-text';
import CountryFlag from 'react-native-country-flag';
import {getSecureData, clearSecureStorage} from '../../utils/secureStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UseEditarUsuario from '../../hooks/UseEditarUsuario/UseEditarUsuario';
import UseGerarCodigoConfirmacao from '../../hooks/UseGerarCodigoConfirmacao/UseGerarCodigoConfirmacao';
import useSelectCodigoConfirmacao from '../../hooks/useSelectCodigoConfirmacao/useSelectCodigoConfirmacao';
import {useFocusEffect} from '@react-navigation/native';
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;

// ======= Helper functions to integrate with your backend =======
const sendVerificationCode = async (
  item,
  nome,
  inserirGerarCodigoConfirmacao,
) => {
  if (item.type == 'email') {
    await inserirGerarCodigoConfirmacao('email', nome, item.value);
  } else {
    let numeroLimpo = item.value.replace(/\D/g, '');
    if (numeroLimpo.startsWith('55')) {
      const ddd = numeroLimpo.slice(2, 4);
      const restante = numeroLimpo.slice(4);

      if (restante.length === 9 && restante.startsWith('9')) {
        numeroLimpo = '55' + ddd + restante.slice(1);
      }
    }
    await inserirGerarCodigoConfirmacao('telefone', nome, numeroLimpo);
  }
  return {success: true};
};

const verifyCode = async (code, selectCodigoConfirmacao) => {
  let codigoValidado = await selectCodigoConfirmacao(code);
  if (codigoValidado.status == 'sucesso') {
    return {success: true};
  } else {
    return {success: false};
  }
};
// =============================================================

const EditarPerfil = () => {
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
  const [email, setEmail] = useState('');
  const [uploadAvatar, setUploadAvatar] = useState(false);
  const [avatar, setAvatar] = useState('');

  // verification flow states
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [currentVerificationIndex, setCurrentVerificationIndex] = useState(0);
  const [isVerificationModalVisible, setIsVerificationModalVisible] =
    useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // 5-digit inputs
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '']);
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const [pendingProfileData, setPendingProfileData] = useState(null);

  const {usuarios} = UseUsuarios();
  const {editarUsuario} = UseEditarUsuario();
  const {inserirGerarCodigoConfirmacao} = UseGerarCodigoConfirmacao();
  const {selectCodigoConfirmacao} = useSelectCodigoConfirmacao();

  useFocusEffect(
    useCallback(() => {
      setAvatarVersion(Date.now());
    }, []),
  );

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const refresh_token = await getSecureData('refresh_token');
        if (refresh_token) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.log('Erro ao verificar login:', error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

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

        // Mapeamento seguro para o Picker
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

  // date picker handlers
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirmDate = date => {
    setSelectedDate(date);
    hideDatePicker();
  };

  const selecionarImagem = () => {
    setUploadAvatar(false);
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
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

  const startVerificationFlow = async (queue, nomeUsuario) => {
    if (!queue || queue.length === 0) return;
    setVerificationQueue(queue);
    setCurrentVerificationIndex(0);
    await sendCurrentCode(queue[0], nomeUsuario);
    setIsVerificationModalVisible(true);
  };

  const sendCurrentCode = async (item, nomeUsuario) => {
    try {
      setIsSendingCode(true);
      setResendCountdown(60);
      startCountdown();
      const resp = await sendVerificationCode(
        item,
        nomeUsuario,
        inserirGerarCodigoConfirmacao,
      );
      setIsSendingCode(false);
      if (!resp || !resp.success) {
        setMsgIconColorAlertModal('#9c053a');
        setMsgIconAlertModal('error-outline');
        setMsgTitleAlertModal('ERRO');
        setMsgDescAlertModal('Falha ao enviar código. Tente novamente.');
        setShowAlertModal(true);
      }
    } catch (err) {
      setIsSendingCode(false);
      setMsgIconColorAlertModal('#9c053a');
      setMsgIconAlertModal('error-outline');
      setMsgTitleAlertModal('ERRO');
      setMsgDescAlertModal('Falha ao enviar código. Tente novamente.');
      setShowAlertModal(true);
    }
  };

  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown(s => {
          if (s <= 1) {
            clearInterval(timer);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const startCountdown = () => {
    setResendCountdown(60);
  };

  const resendCurrentCode = async () => {
    const item = verificationQueue[currentVerificationIndex];
    if (!item) return;
    if (resendCountdown > 0) return;
    let nomeUsuario = await AsyncStorage.getItem('temp_nome_editar_perfil');
    await sendCurrentCode(item, nomeUsuario);
  };

  const onChangeDigit = (text, idx) => {
    if (!text) {
      const next = [...codeDigits];
      next[idx] = '';
      setCodeDigits(next);
      return;
    }

    if (text.length > 1) {
      const chars = text.replace(/\s/g, '').split('').slice(0, 5);
      const next = [...codeDigits];
      for (let i = 0; i < 5; i++) {
        next[i] = chars[i] || '';
      }
      setCodeDigits(next);
      const firstEmpty = next.findIndex(c => c === '');
      if (firstEmpty === -1) {
        inputRefs[4].current && inputRefs[4].current.blur();
      } else {
        inputRefs[firstEmpty].current && inputRefs[firstEmpty].current.focus();
      }
      return;
    }

    const char = text[text.length - 1];
    if (!/^\d$/.test(char)) return;

    const next = [...codeDigits];
    next[idx] = char;
    setCodeDigits(next);

    if (idx < 4) {
      inputRefs[idx + 1].current && inputRefs[idx + 1].current.focus();
    } else {
      Keyboard.dismiss();
    }
  };

  const onKeyPress = (e, idx) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (codeDigits[idx] === '') {
        if (idx > 0) {
          inputRefs[idx - 1].current && inputRefs[idx - 1].current.focus();
          const next = [...codeDigits];
          next[idx - 1] = '';
          setCodeDigits(next);
        }
      } else {
        const next = [...codeDigits];
        next[idx] = '';
        setCodeDigits(next);
      }
    }
  };

  const getComposedCode = () => codeDigits.join('');

  const confirmCurrentCode = async () => {
    const code = getComposedCode();
    if (code.length !== 5) {
      setMsgIconColorAlertModal('#9c053a');
      setMsgIconAlertModal('error-outline');
      setMsgTitleAlertModal('ATENÇÃO');
      setMsgDescAlertModal('Digite o código de 5 dígitos');
      setShowAlertModal(true);
      return;
    }

    const current = verificationQueue[currentVerificationIndex];
    if (!current) return;

    const result = await verifyCode(code, selectCodigoConfirmacao);
    if (!result || !result.success) {
      setMsgIconColorAlertModal('#9c053a');
      setMsgIconAlertModal('error-outline');
      setMsgTitleAlertModal('CÓDIGO INVÁLIDO');
      setMsgDescAlertModal('Código inválido. Tente novamente.');
      setShowAlertModal(true);
      return;
    }

    setMsgIconColorAlertModal('#188211');
    setMsgIconAlertModal('task-alt');
    setMsgTitleAlertModal('OK');
    setMsgDescAlertModal('Código confirmado.');
    setShowAlertModal(true);

    setCodeDigits(['', '', '', '', '']);

    const nextIndex = currentVerificationIndex + 1;
    if (nextIndex < verificationQueue.length) {
      setCurrentVerificationIndex(nextIndex);
      let nomeUsuario = await AsyncStorage.getItem('temp_nome_editar_perfil');
      await sendCurrentCode(verificationQueue[nextIndex], nomeUsuario);
      setTimeout(
        () => inputRefs[0].current && inputRefs[0].current.focus(),
        250,
      );
    } else {
      setIsVerificationModalVisible(false);
      await completeProfileUpdateAfterVerification();
    }
  };

  const completeProfileUpdateAfterVerification = async () => {
    if (!pendingProfileData) return;
    const {
      serieLogado: serie,
      nome: novoNome,
      sobreNome: novoSobre,
      selectedDate: data,
      numero,
      email: novoEmail,
      tipochavePix: novoTipoPix,
      chavePix: novaChave,
      uploadAvatar: novoUploadAvatar,
      avatar: novoAvatar,
    } = pendingProfileData;

    try {
      const nomeCompletoEditado = `${novoNome} ${novoSobre}`.trim();
      const result = await editarUsuario(
        serie,
        nomeCompletoEditado,
        '',
        data ? data.toLocaleDateString() : '',
        numero,
        novoEmail,
        novoTipoPix,
        novaChave,
        novoUploadAvatar,
        novoAvatar,
      );

      if (result?.status === 'sucesso') {
        setMsgIconColorAlertModal('#188211');
        setMsgIconAlertModal('task-alt');
        setMsgTitleAlertModal('SUCESSO');
        setMsgDescAlertModal('Perfil atualizado com sucesso!');
        setShowAlertModal(true);

        setPendingProfileData(null);
      } else {
        setMsgIconColorAlertModal('#9c053a');
        setMsgIconAlertModal('error-outline');
        setMsgTitleAlertModal('ERRO');
        setMsgDescAlertModal('Falha ao atualizar perfil. Tente novamente.');
        setShowAlertModal(true);
      }
    } catch (err) {
      console.warn('editarUsuario error', err);
      setMsgIconColorAlertModal('#9c053a');
      setMsgIconAlertModal('error-outline');
      setMsgTitleAlertModal('ERRO');
      setMsgDescAlertModal('Falha ao atualizar perfil. Tente novamente.');
      setShowAlertModal(true);
    }
  };

  const handleSalvarPerfil = async () => {
    alert('faltando alguns ajustes')
    return
    if (
      nome === '' ||
      sobreNome === '' ||
      telefone === '' ||
      email === '' ||
      chavePix === ''
    ) {
      setMsgIconColorAlertModal('#9c053a');
      setMsgIconAlertModal('error-outline');
      setMsgTitleAlertModal('ATENÇÃO');
      setMsgDescAlertModal('Preencha corretamente todos os campos!');
      setShowAlertModal(true);
      return;
    }

    let telefone_antigo = user?.telefone || '';
    let email_antigo = user?.email || '';

    let numero = '+55 ' + telefone;
    let dadosTelefone = usuarios.filter(
      item => item.telefone === numero && item.telefone !== telefone_antigo,
    );
    if (dadosTelefone.length > 0) {
      setMsgIconColorAlertModal('#9c053a');
      setMsgIconAlertModal('error-outline');
      setMsgTitleAlertModal('ATENÇÃO');
      setMsgDescAlertModal(
        'Este telefone já está cadastrado, tente novamente!',
      );
      setShowAlertModal(true);
      return;
    }

    let dadosEmail = usuarios.filter(
      item => item.email === email && item.email !== email_antigo,
    );
    if (dadosEmail.length === 1) {
      setMsgIconColorAlertModal('#9c053a');
      setMsgIconAlertModal('error-outline');
      setMsgTitleAlertModal('ATENÇÃO');
      setMsgDescAlertModal('Este email já existe, tente novamente!');
      setShowAlertModal(true);
      return;
    }

    const dadosPendentes = {
      serieLogado,
      nome,
      sobreNome,
      selectedDate,
      numero,
      email,
      tipochavePix,
      chavePix,
      uploadAvatar,
      avatar,
    };

    const queue = [];
    if (numero !== telefone_antigo)
      queue.push({type: 'telefone', value: numero});
    if (email !== email_antigo) queue.push({type: 'email', value: email});

    if (queue.length === 0) {
      setPendingProfileData(dadosPendentes);
      await completeProfileUpdateAfterVerification();
      return;
    }

    setPendingProfileData(dadosPendentes);
    await AsyncStorage.setItem('temp_nome_editar_perfil', nome);
    await startVerificationFlow(queue, nome);
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
                {codeDigits.map((d, i) => (
                  <TextInput
                    key={`digit-${i}`}
                    ref={inputRefs[i]}
                    value={d}
                    onChangeText={t => onChangeDigit(t, i)}
                    onKeyPress={e => onKeyPress(e, i)}
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
                  disabled={codeDigits.join('').length !== 5}>
                  <Text style={{color: '#fff', fontWeight: 'bold'}}>
                    Confirmar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={resendCurrentCode}
                  disabled={resendCountdown > 0}
                  style={{marginLeft: 12}}>
                  <Text
                    style={{color: resendCountdown > 0 ? '#999' : '#007bff'}}>
                    {resendCountdown > 0
                      ? `Reenviar em ${resendCountdown}s`
                      : 'Reenviar código'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={{marginTop: 12}}
                onPress={() => {
                  setIsVerificationModalVisible(false);
                  setVerificationQueue([]);
                  setPendingProfileData(null);
                  setCodeDigits(['', '', '', '', '']);
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
            style={styles.saveButton}>
            <Text
              style={{
                color: '#fff',
                fontSize: 17,
                fontFamily: 'Montserrat-Bold',
              }}>
              Salvar
            </Text>
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

  return (
    <ScrollView contentContainerStyle={{...styles.scroll, flexGrow: 1, backgroundColor: '#f0eded', paddingBottom: 120}}>
      <View style={styles.form}>
        <Text style={styles.label}>Senha atual</Text>
        <TextInput
          style={styles.inputStyle}
          secureTextEntry
          value={senhaAtual}
          onChangeText={setSenhaAtual}
        />

        <Text style={styles.label}>Nova senha</Text>
        <TextInput
          style={styles.inputStyle}
          secureTextEntry
          value={novaSenha}
          onChangeText={setNovaSenha}
        />

        <Text style={styles.label}>Confirmar nova senha</Text>
        <TextInput
          style={styles.inputStyle}
          secureTextEntry
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
        />

        <TouchableOpacity style={styles.saveButton}>
          <Text
            style={{
              color: '#fff',
              fontSize: 17,
              fontFamily: 'Montserrat-Bold',
            }}>
            Modificar Senha
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
    fontFamily: 'Montserrat-Bold',
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 19,
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
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'Montserrat-Regular',
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
});