import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {TextInputMask} from 'react-native-masked-text';
import CountryFlag from 'react-native-country-flag';
import UseGerarCodigoConfirmacao from '../../hooks/UseGerarCodigoConfirmacao/UseGerarCodigoConfirmacao';
import useSelectCodigoConfirmacao from '../../hooks/useSelectCodigoConfirmacao/useSelectCodigoConfirmacao';
import UseCadastroUsuario from '../../hooks/UseCadastroUsuario/UseCadastroUsuario';

// -----------------------------
// Componente OTPInput
// -----------------------------
const OTPInput = ({length = 5, value = '', onChange, isError}) => {
  const [code, setCode] = useState(Array(length).fill(''));
  const hiddenInputRef = useRef(null);

  useEffect(() => {
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
            style={[styles.box, {borderColor: isError ? '#f00' : '#084D6E'}]}>
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

// -----------------------------
// Componente Login
// -----------------------------
const Login = () => {
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width;
  const maxWidth = 600;
  const {cadastroUsuario, cadastramentoUsuario, loadingCadastroUsuario} =
    UseCadastroUsuario();
  const [timer, setTimer] = useState(60);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [otpCode, setOtpCode] = useState('');
  const [isError, setIsError] = useState(false);
  const [telefone, setTelefone] = useState('');
  const [showAlertTravelModal, setShowAlertTravelModal] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [novoTelefone, setNovoTelefone] = useState('');
  const telefoneRef = useRef(null);

  const {inserirGerarCodigoConfirmacao} = UseGerarCodigoConfirmacao();
  const {selectCodigoConfirmacao} = useSelectCodigoConfirmacao();
  const [tecladoAtivo, setTecladoAtivo] = useState(false);
  const inputRef = useRef(null);

  // -----------------------------
  // Funções de código
  // -----------------------------
  const handleGerarCodigoConfirmacao = async () => {
    const expiresAt = Date.now() + 60 * 1000;
    await AsyncStorage.setItem('PhoneTimerExpiresAt', expiresAt.toString());

    setTimer(60);
    setIsButtonDisabled(true);

    let telefoneCadastro =
      '55' + (await AsyncStorage.getItem('telefoneCadastro'));
    let nomeCadastro = await AsyncStorage.getItem('nomeCadastro');

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

    console.log(numeroLimpo);

    await inserirGerarCodigoConfirmacao('telefone', nomeCadastro, numeroLimpo);
  };

  useEffect(() => {
    const initTimer = async () => {
      const storedExpiresAt = await AsyncStorage.getItem('PhoneTimerExpiresAt');

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
      await AsyncStorage.setItem('PhoneTimerExpiresAt', expiresAt.toString());
      setTimer(60);
      setIsButtonDisabled(true);
    };

    initTimer();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const expiresAt = await AsyncStorage.getItem('PhoneTimerExpiresAt');
      if (!expiresAt) return;

      const remaining = Math.max(
        Math.ceil((Number(expiresAt) - Date.now()) / 1000),
        0,
      );

      setTimer(remaining);

      if (remaining === 0) {
        setIsButtonDisabled(false);
        await AsyncStorage.removeItem('PhoneTimerExpiresAt');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const isOtpComplete = otpCode.length === 5;

  const handleVerificarCodigo = async () => {
    let codigoValidado = await selectCodigoConfirmacao(otpCode);

    if (codigoValidado.status == 'sucesso') {
      setIsError(false);
      setOtpCode('');
      let nomeCadastro = await AsyncStorage.getItem('nomeCadastro');
      let sobreNomeCadastro = await AsyncStorage.getItem('sobreNomeCadastro');
      let emailCadastro = await AsyncStorage.getItem('emailCadastro');
      let dataNascimentoCadastro = await AsyncStorage.getItem(
        'dataNascimentoCadastro',
      );
      let telefoneCadastro =
        '+55 ' + (await AsyncStorage.getItem('telefoneCadastro'));
      let cpfCadastro = await AsyncStorage.getItem('cpfCadastro');
      let tipochavePixCadastro = await AsyncStorage.getItem(
        'tipochavePixCadastro',
      );
      let chavePixCadastro = await AsyncStorage.getItem('chavePixCadastro');
      let senhaCadastro = await AsyncStorage.getItem('senhaCadastro');
      let imgPerfilCadastro = await AsyncStorage.getItem('imgPerfilCadastro');
      let tipoCadastro = await AsyncStorage.getItem('tipoCadastro');

      const result = await cadastroUsuario(
        nomeCadastro,
        sobreNomeCadastro,
        emailCadastro,
        dataNascimentoCadastro,
        telefoneCadastro,
        cpfCadastro,
        tipochavePixCadastro,
        chavePixCadastro,
        senhaCadastro,
        imgPerfilCadastro,
        tipoCadastro,
      );

      if (result?.status === 'sucesso') {
        setShowAlertTravelModal(true);

        setTimeout(() => {
          navigation.replace('Login');
        }, 1000);
      }
    } else {
      setIsError(true);
    }
  };

  const handleOtpChange = code => {
    setOtpCode(code);
    if (isError) setIsError(false);
  };

  useEffect(() => {
    const carregarTelefone = async () => {
      try {
        const telefoneCadastro = await AsyncStorage.getItem('telefoneCadastro');
        if (telefoneCadastro) {
          setTelefone(telefoneCadastro);
        }
      } catch (e) {}
    };

    carregarTelefone();
  }, []);

  const handleConfirmarNovoTelefone = async () => {
    if (!novoTelefone) return;

    //const apenasNumeros = novoTelefone.replace(/\D/g, "");
    await AsyncStorage.setItem('telefoneCadastro', novoTelefone);
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

    let nomeCadastro = await AsyncStorage.getItem('nomeCadastro');
    setTelefone(novoTelefone);
    setIsModalVisible(false);
    setNovoTelefone('');

    const expiresAt = Date.now() + 60 * 1000;
    await AsyncStorage.setItem('PhoneTimerExpiresAt', expiresAt.toString());

    setTimer(60);
    setIsButtonDisabled(true);

    await inserirGerarCodigoConfirmacao('telefone', nomeCadastro, numeroLimpo);
  };

  // -----------------------------
  // Render
  // -----------------------------
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
          CONFIRMAÇÃO DE TELEFONE
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
          Um código foi enviado ao número {'\n'}
          <Text style={{fontFamily: 'Montserrat-Bold'}}>{telefone}</Text>.{'\n'}
          Número errado?
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
              Alterar número
            </Text>
          </TouchableOpacity>
        </Text>

        <OTPInput
          length={5}
          value={otpCode}
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
              : 'Não recebi o código no meu telefone'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ----------------------------- Modal ----------------------------- */}
      <Modal
        visible={showAlertTravelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAlertTravelModal(false)}>
        <TouchableWithoutFeedback
          onPress={() => setShowAlertTravelModal(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View
                style={{
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
                }}>
                <MaterialIcon
                  name="task-alt"
                  size={48}
                  color="#188211"
                  style={{marginBottom: 10}}
                />
                <Text
                  style={{
                    fontSize: 22,
                    fontFamily: 'Montserrat-Bold',
                    marginBottom: 8,
                  }}>
                  Parabéns
                </Text>
                <Text
                  style={{
                    fontSize: 19,
                    fontFamily: 'Montserrat-Regular',
                    textAlign: 'center',
                    marginBottom: 20,
                  }}>
                  Cadastro finalizado com sucesso.
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#188211',
                    borderRadius: 8,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: 4,
                  }}
                  onPress={() => setShowAlertTravelModal(false)}>
                  <Text
                    style={{
                      width: 100,
                      color: '#fff',
                      fontSize: 18,
                      textAlign: 'center',
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
                Alterar número de telefone
              </Text>

              <View style={styles.inputContainer}>
                {/* Bandeira Brasil */}
                <CountryFlag isoCode="BR" size={28} style={{marginRight: 10}} />

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
                  value={novoTelefone}
                  onChangeText={text => setNovoTelefone(text)}
                  style={{
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
                  }}
                  keyboardType="numeric"
                  placeholder="(11) 91234-5678"
                  placeholderTextColor="#999"
                  ref={telefoneRef}
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
                  onPress={handleConfirmarNovoTelefone}
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

// -----------------------------
// Estilos
// -----------------------------
const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 15,

    // Sombra (iOS)
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 3.5,

    // Sombra (Android)
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
