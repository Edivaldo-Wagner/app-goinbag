import React, {useRef, useState, useEffect} from 'react';
import UseGerarCodigoConfirmacao from '../../hooks/UseGerarCodigoConfirmacao/UseGerarCodigoConfirmacao';
import useSelectCodigoConfirmacao from '../../hooks/useSelectCodigoConfirmacao/useSelectCodigoConfirmacao';
import {
  View,
  TextInput,
  Alert,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

// Componente OTPInput
const OTPInput = ({length = 5, value = '', onChange, isError}) => {
  const [code, setCode] = useState(Array(length).fill(''));
  const hiddenInputRef = useRef(null);

  useEffect(() => {
    // sempre sincroniza com valor do pai
    const newCode = value
      .split('')
      .concat(Array(length).fill(''))
      .slice(0, length);
    setCode(newCode);
  }, [value, length]);

  const focusHiddenInput = () => {
    hiddenInputRef.current?.focus();
  };

  const handleChangeText = text => {
    const digits = text.replace(/\D/g, '').split('').slice(0, length);
    const newCode = Array(length).fill('');
    digits.forEach((d, i) => (newCode[i] = d));
    setCode(newCode);
    onChange?.(newCode.join(''));
  };

  const handleKeyPress = ({nativeEvent}) => {
    if (nativeEvent.key === 'Backspace') {
      const lastFilledIndex = code.findIndex(c => c === '');
      let indexToClear =
        lastFilledIndex === -1 ? length - 1 : lastFilledIndex - 1;
      if (indexToClear >= 0) {
        const newCode = [...code];
        newCode[indexToClear] = '';
        setCode(newCode);
        onChange?.(newCode.join(''));
      }
    }
  };

  return (
    <View style={{alignItems: 'center', marginTop: 20}}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={focusHiddenInput}
        style={{flexDirection: 'row'}}>
        {code.map((digit, index) => (
          <View
            key={index}
            style={[styles.box, {borderColor: isError ? 'red' : '#084D6E'}]}>
            <Text style={styles.digit}>{digit}</Text>
          </View>
        ))}
      </TouchableOpacity>

      <TextInput
        ref={hiddenInputRef}
        value={code.join('')}
        onChangeText={handleChangeText}
        onKeyPress={handleKeyPress}
        keyboardType="numeric"
        maxLength={length}
        style={{position: 'absolute', width: 1, height: 1, opacity: 0}}
        autoFocus
      />
    </View>
  );
};

// Componente Login
const Login = () => {
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width;
  const maxWidth = 600;
  const [timer, setTimer] = useState(60);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [novoEmail, setNovoEmail] = useState('');
  const emailRef = useRef(null);

  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isError, setIsError] = useState(false);
  const {inserirGerarCodigoConfirmacao} = UseGerarCodigoConfirmacao();
  const {selectCodigoConfirmacao} = useSelectCodigoConfirmacao();
  const [tecladoAtivo, setTecladoAtivo] = useState(false);
  const inputRef = useRef(null);

  const handleGerarCodigoConfirmacao = async () => {
    const expiresAt = Date.now() + 60 * 1000;
    await AsyncStorage.setItem('EmailTimerExpiresAt', expiresAt.toString());

    setTimer(60);
    setIsButtonDisabled(true);

    let nomeCadastro = await AsyncStorage.getItem('nomeCadastro');
    let emailCadastro = await AsyncStorage.getItem('emailCadastro');
    await inserirGerarCodigoConfirmacao('email', nomeCadastro, emailCadastro);
  };

  useEffect(() => {
    const carregarEmail = async () => {
      try {
        const emailCadastro = await AsyncStorage.getItem('emailCadastro');
        if (emailCadastro) {
          setEmail(emailCadastro);
        }
      } catch (e) {}
    };

    carregarEmail();
  }, []);

  const handleConfirmarNovoEmail = async () => {
    if (!novoEmail) return;

    await AsyncStorage.setItem('emailCadastro', novoEmail);
    let emailCadastro = await AsyncStorage.getItem('emailCadastro');
    let nomeCadastro = await AsyncStorage.getItem('nomeCadastro');
    setEmail(novoEmail);
    setIsModalVisible(false);
    setNovoEmail('');

    const expiresAt = Date.now() + 60 * 1000;
    await AsyncStorage.setItem('EmailTimerExpiresAt', expiresAt.toString());

    setTimer(60);
    setIsButtonDisabled(true);

    await inserirGerarCodigoConfirmacao('email', nomeCadastro, emailCadastro);
  };

  useEffect(() => {
    const initTimer = async () => {
      const storedExpiresAt = await AsyncStorage.getItem('EmailTimerExpiresAt');

      if (storedExpiresAt) {
        const remaining = Math.ceil(
          (Number(storedExpiresAt) - Date.now()) / 1000,
        );

        if (remaining > 0) {
          setTimer(remaining);
          setIsButtonDisabled(true);
          return;
        }
      }

      // se não existir ou já expirou, cria um novo
      const expiresAt = Date.now() + 60 * 1000;
      await AsyncStorage.setItem('EmailTimerExpiresAt', expiresAt.toString());
      setTimer(60);
      setIsButtonDisabled(true);
    };

    initTimer();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const expiresAt = await AsyncStorage.getItem('EmailTimerExpiresAt');
      if (!expiresAt) return;

      const remaining = Math.max(
        Math.ceil((Number(expiresAt) - Date.now()) / 1000),
        0,
      );

      setTimer(remaining);

      if (remaining === 0) {
        setIsButtonDisabled(false);
        await AsyncStorage.removeItem('EmailTimerExpiresAt');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const isOtpComplete = otpCode.length === 5;

  const handleVerificarCodigo = async () => {
    let codigoValidado = await selectCodigoConfirmacao(otpCode);
    let nomeCadastro = await AsyncStorage.getItem('nomeCadastro');
    let telefoneCadastro =
      '55' + (await AsyncStorage.getItem('telefoneCadastro'));
    //let telefoneCadastro = '(258) 84 9163-775';

    // Remove tudo que não é dígito
    let numeroLimpo = telefoneCadastro.replace(/\D/g, '');

    // Remove o '9' extra para DDD 83
    if (numeroLimpo.startsWith('55')) {
      const ddd = numeroLimpo.slice(2, 4);
      const restante = numeroLimpo.slice(4);

      if (restante.length === 9 && restante.startsWith('9')) {
        numeroLimpo = '55' + ddd + restante.slice(1); // remove o primeiro 9
      }
    }

    if (codigoValidado.status == 'sucesso') {
      setIsError(false);
      setOtpCode('');
      await inserirGerarCodigoConfirmacao(
        'telefone',
        nomeCadastro,
        numeroLimpo,
      );
      navigation.replace('ConfirmacaoTelefone');
    } else {
      setIsError(true);
    }
  };

  // Reseta erro ao digitar
  const handleOtpChange = code => {
    setOtpCode(code);
    if (isError) setIsError(false);
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
      }}>
      <View
        style={[
          {width: screenWidth * 0.9 > maxWidth ? maxWidth : screenWidth * 0.9},
        ]}>
        <Text
          style={{
            fontSize: 23,
            fontFamily: 'Montserrat-Bold',
            textAlign: 'center',
            color: 'rgba(12, 159, 227, 1)',
            marginBottom: 10,
          }}>
          CONFIRMAÇÃO DE EMAIL
        </Text>

        <Text
          style={{
            fontSize: 18,
            fontFamily: 'Montserrat-Regular',
            textAlign: 'center',
            color: 'rgba(0, 0, 0, 0.8)',
            lineHeight: 25,
            marginBottom: 10,
          }}>
          Um código foi enviado ao seu email {'\n'}
          <Text style={{fontFamily: 'Montserrat-Bold'}}>{email}</Text>.{'\n'}
          Email errado?
          <TouchableOpacity
            style={{top: 10}}
            onPress={() => setIsModalVisible(true)}>
            <Text
              style={{
                fontFamily: 'Montserrat-Bold',
                top: 8,
                fontSize: 18,
                textDecorationLine: 'underline',
                color: 'rgba(244, 163, 11 ,1)',
              }}>
              {' '}
              Alterar email
            </Text>
          </TouchableOpacity>
        </Text>

        <OTPInput
          length={5}
          value={otpCode} // 🔹 valor controlado
          onChange={handleOtpChange}
          isError={isError}
        />

        <TouchableOpacity
          onPress={handleVerificarCodigo}
          disabled={!isOtpComplete}
          style={{
            marginTop: 20,
            backgroundColor: isOtpComplete
              ? 'rgba(12, 159, 227, 1)'
              : 'rgba(12, 159, 227, 0.4)',
            paddingVertical: 12,
            borderRadius: 8,
          }}>
          <Text
            style={{
              color: '#fff',
              fontSize: 18,
              textAlign: 'center',
              fontFamily: 'Montserrat-Bold',
            }}>
            Verificar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleGerarCodigoConfirmacao}
          disabled={isButtonDisabled}>
          <Text
            style={{
              marginTop: 20,
              fontSize: 18,
              fontFamily: 'Montserrat-Regular',
              textAlign: 'left',
              color: 'rgba(8, 77, 110, 0.8)',
              textDecorationLine: 'underline',
            }}>
            {isButtonDisabled
              ? `Aguarde ${timer}s para reenviar`
              : 'Não recebi o código no meu email'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
        onShow={() => {
          setTimeout(() => {
            inputRef.current?.focus();
            setTecladoAtivo(true);
          }, 1000);
        }}>
        <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text
                style={{
                  fontSize: 22,
                  fontFamily: 'Montserrat-Bold',
                  marginBottom: 15,
                  textAlign: 'center',
                  color: 'rgba(12, 159, 227, 1)',
                }}>
                Alterar email
              </Text>

              <View style={styles.inputContainer}>
                <TextInput
                  ref={inputRef}
                  value={novoEmail}
                  onChangeText={setNovoEmail}
                  style={[
                    styles.input,
                    {
                      marginTop: 8,
                      paddingLeft: 15,
                      fontFamily: 'Montserrat-Regular',
                      fontSize: 17,
                    },
                  ]}
                />
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 5,
                }}>
                <TouchableOpacity
                  onPress={() => setIsModalVisible(false)}
                  style={[styles.btn, {backgroundColor: '#f5f5f5'}]}>
                  <Text
                    style={{
                      color: '#808080',
                      fontFamily: 'Montserrat-Bold',
                      fontSize: 17,
                    }}>
                    Sair
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleConfirmarNovoEmail}
                  style={[
                    styles.btn,
                    {backgroundColor: 'rgba(12, 159, 227, 1)'},
                  ]}>
                  <Text
                    style={{
                      color: '#fff',
                      fontFamily: 'Montserrat-Bold',
                      fontSize: 17,
                    }}>
                    Confirmar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    width: 60,
    height: 60,
    margin: 5,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  digit: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
    color: '#084D6E',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    color: '#353738',
    borderRadius: 10,
    padding: 10,
    fontSize: 18,
    fontFamily: 'Montserrat-Regular',
    marginBottom: 15,
  },
  btn: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default Login;
