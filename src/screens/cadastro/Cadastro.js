import React, {useState, useEffect, useRef} from 'react';
import {
  Modal,
  ScrollView,
  Image,
  TextInput,
  Dimensions,
  Pressable,
  PermissionsAndroid,
  Platform,
  Alert,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import UseGerarCodigoConfirmacao from '../../hooks/UseGerarCodigoConfirmacao/UseGerarCodigoConfirmacao';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {Picker} from '@react-native-picker/picker';
import pLimit from 'p-limit';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import no_image from '../../assets/images/register-img-icon-main.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UseUsuarios from '../../hooks/UseUsuarios/UseUsuarios';
import {TextInputMask} from 'react-native-masked-text';
import CountryFlag from 'react-native-country-flag';
import {useNavigation} from '@react-navigation/native';
import styles from './Cadastro.styles';

const Cadastro = () => {
  const navigation = useNavigation();

  const screenWidth = Dimensions.get('window').width;
  const maxWidth = 600;

  const {
    inserirGerarCodigoConfirmacao,
    insercaoGerarCodigoConfirmacao,
    loadingInserirGerarCodigoConfirmacao,
  } = UseGerarCodigoConfirmacao();
  const [showAlertTravelModal, setShowAlertTravelModal] = useState(false);
  const [showMsgTravelModal, setShowMsgTravelModal] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [nome, setNome] = useState('');
  const [sobreNome, setSobreNome] = useState('');
  const [email, setEmail] = useState('');
  const [dataNascimento, setDataNascimento] = useState();
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const [telefone, setTelefone] = useState('');
  const telefoneRef = useRef(null);
  const [cpf, setCpf] = useState('');
  const [tipochavePix, setTipoChavePix] = useState('');
  const [chavePix, setChavePix] = useState('');
  const [senha, setSenha] = useState('');
  const [exibirSenha, setExibirSenha] = useState(true);
  const [repetirSenha, setRepetirSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  const [uploadFt, setUploadFt] = useState(false);
  const [registerIcon, setRegisterIcon] = useState(no_image);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    {label: '', value: ''},
    {label: 'Opção 1', value: 'opcao1'},
    {label: 'Opção 2', value: 'opcao2'},
    {label: 'Opção 3', value: 'opcao3'},
  ]);

  const {usuarios} = UseUsuarios();

  useEffect(() => {
    async function fetchDataGoogle() {
      try {
        const emailGoogle = await AsyncStorage.getItem('emailGoogle');
        const nomeGoogle = await AsyncStorage.getItem('nomeGoogle');
        const sobreNomeGoogle = await AsyncStorage.getItem('sobreNomeGoogle');

        if (emailGoogle) {
          setEmail(emailGoogle);
          setNome(nomeGoogle);
          setSobreNome(sobreNomeGoogle);
          setExibirSenha(false);

          await AsyncStorage.removeItem('emailGoogle');
          await AsyncStorage.removeItem('nomeGoogle');
          await AsyncStorage.removeItem('sobreNomeGoogle');
        }
      } catch (error) {
        console.log('Erro ao ler AsyncStorage:', error);
      }
    }

    fetchDataGoogle();
  }, []);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirmDate = async date => {
    await AsyncStorage.setItem(
      'dataNascimentoCadastro',
      date.toLocaleDateString(),
    );
    setDataNascimento(date);
    hideDatePicker();
  };

  const mascaraRegistrarCPF = valor => {
    let cpfNumeros = valor.replace(/\D/g, ''); // Remove não numéricos
    cpfNumeros = cpfNumeros.replace(/^(\d{3})(\d)/, '$1.$2');
    cpfNumeros = cpfNumeros.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
    cpfNumeros = cpfNumeros.replace(/\.(\d{3})(\d)/, '.$1-$2');
    return cpfNumeros;
  };

  // Função para validar CPF
  const validarRegistrarCPF = valor => {
    let cpfNumeros = valor.replace(/\D/g, ''); // Remove pontos e traços

    if (cpfNumeros.length === 0) {
      setMensagem('');
      return;
    }

    if (cpfNumeros.length !== 11 || /^(\d)\1{10}$/.test(cpfNumeros)) {
      setMensagem('CPF inválido');
      return;
    }

    let soma = 0;
    let resto;

    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpfNumeros.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfNumeros.substring(9, 10))) {
      setMensagem('CPF inválido');
      return;
    }

    soma = 0;
    // Segundo dígito verificador
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpfNumeros.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfNumeros.substring(10, 11))) {
      setMensagem('CPF inválido');
      return;
    }

    setMensagem('CPF válido');
  };

  const handleChangeCpf = texto => {
    const cpfMascarado = mascaraRegistrarCPF(texto);
    setCpf(cpfMascarado);
    validarRegistrarCPF(cpfMascarado);
  };

  /*const handleChangeTelefone = (text) => {
    // Remove tudo que não for número
    let cleaned = text.replace(/\D/g, "");

    // Limita a 11 dígitos (padrão Brasil com DDD + 9 dígitos)
    if (cleaned.length > 11) cleaned = cleaned.slice(0, 11);

    // Aplica máscara
    if (cleaned.length <= 10) {
      cleaned = cleaned.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    } else {
      cleaned = cleaned.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
    }

    setTelefone(cleaned);
  };*/

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

  const selecionarImagem = () => {
    setModalVisible(true);
  };

  const handleImageResult = result => {
    if (!result.didCancel && !result.errorCode && result.assets?.[0]) {
      const imagemSelecionada = {uri: result.assets[0].uri};
      setRegisterIcon(imagemSelecionada);
    }
    setModalVisible(false);
  };

  const handleCameraPress = async () => {
    try {
      const hasPermission = await requestCameraPermission(); // Verifique se essa função existe
      if (!hasPermission) {
        alert('Permissão negada para acessar a câmera.');
        setModalVisible(false);
        return;
      }
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
      });
      handleImageResult(result);
      setUploadFt(true);
    } catch (err) {
      console.error('Erro ao abrir câmera:', err);
    }
  };

  const handleGalleryPress = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });
      handleImageResult(result);
      setUploadFt(true);
    } catch (err) {
      console.error('Erro ao abrir galeria:', err);
    }
  };

  const steps = exibirSenha ? [1, 2, 3, 4] : [1, 2, 3];
  const [currentStep, setCurrentStep] = useState(1);
  // dentro do componente, antes do return
  const totalSteps = exibirSenha ? 4 : 3;
  const passwordStep = exibirSenha ? 3 : null;
  const uploadStep = exibirSenha ? 4 : 3;

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 20,
      }}>
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor:
                step <= currentStep ? 'rgba(12, 159, 227, 1)' : '#e0e0e0',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: step <= currentStep ? '#fff' : '#555',
                fontWeight: 'bold',
              }}>
              {step}
            </Text>
          </View>

          {index < steps.length - 1 && (
            <View
              style={{
                flex: 1,
                height: 2,
                backgroundColor:
                  step < currentStep ? 'rgba(12, 159, 227, 1)' : '#e0e0e0',
                marginHorizontal: 5,
              }}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  const renderStepContent = () => {
    if (!exibirSenha) {
      switch (currentStep) {
        case 1:
          return (
            <>
              <View style={{width: '100%', padding: 5}}>
                <Text
                  style={{
                    fontFamily: 'Montserrat-Bold',
                    color: 'rgba(8, 77, 110, 1)',
                    fontSize: 17,
                  }}>
                  NOME
                </Text>
                <TextInput
                  autoFocus
                  value={nome}
                  onChangeText={setNome}
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
                <Text
                  style={{
                    marginTop: 10,
                    fontFamily: 'Montserrat-Bold',
                    color: 'rgba(8, 77, 110, 1)',
                    fontSize: 17,
                  }}>
                  SOBRENOME
                </Text>
                <TextInput
                  value={sobreNome}
                  onChangeText={setSobreNome}
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
                <Text
                  style={{
                    marginTop: 10,
                    fontFamily: 'Montserrat-Bold',
                    color: 'rgba(8, 77, 110, 1)',
                    fontSize: 17,
                  }}>
                  EMAIL
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
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
                <Text
                  style={{
                    marginTop: 10,
                    fontFamily: 'Montserrat-Bold',
                    color: 'rgba(8, 77, 110, 1)',
                    fontSize: 17,
                  }}>
                  DATA DE NASCIMENTO
                </Text>
                <TouchableOpacity
                  style={[
                    styles.pickerButton,
                    {
                      backgroundColor: '#fff',
                      marginTop: -2,
                      paddingLeft: 15,
                      color: 'rgba(0, 0, 0, 0.5)',
                      borderRadius: 10,
                      height: 45,
                      fontSize: 18,
                      fontFamily: 'Montserrat-Regular',
                      borderWidth: 0,
                      shadowColor: '#000',
                      shadowOffset: {width: 0, height: 2},
                      shadowOpacity: 0.2,
                      shadowRadius: 3,
                      elevation: 4,
                    },
                  ]}
                  onPress={showDatePicker}>
                  <Text
                    style={{
                      paddingTop: 13,
                      fontFamily: 'Montserrat-Regular',
                      fontSize: 16,
                      paddingLeft: 2,
                      color: '#353738',
                    }}>
                    {dataNascimento
                      ? new Intl.DateTimeFormat('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        }).format(dataNascimento)
                      : ''}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          );
        case 2:
        case 2:
          return (
            <>
              <View style={{width: '100%', padding: 5}}>
                <Text
                  style={{
                    marginTop: 10,
                    fontFamily: 'Montserrat-Bold',
                    color: 'rgba(8, 77, 110, 1)',
                    fontSize: 17,
                  }}>
                  TELEFONE COM WHATSAPP
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
                    value={telefone}
                    onChangeText={text => setTelefone(text)}
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

                <Text
                  style={{
                    marginTop: 10,
                    fontFamily: 'Montserrat-Bold',
                    color: 'rgba(8, 77, 110, 1)',
                    fontSize: 17,
                  }}>
                  CPF
                </Text>
                <TextInput
                  value={cpf}
                  keyboardType="numeric"
                  onChangeText={handleChangeCpf}
                  maxLength={14}
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
                {mensagem !== '' && (
                  <Text
                    style={{
                      fontFamily: 'Montserrat-Bold',
                      marginTop: -6,
                      fontSize: 15,
                      color:
                        mensagem === 'CPF válido'
                          ? '#077820'
                          : 'rgb(209, 72, 95)',
                    }}>
                    {mensagem}
                  </Text>
                )}

                <Text
                  style={{
                    marginTop: 10,
                    fontFamily: 'Montserrat-Bold',
                    color: 'rgba(8, 77, 110, 1)',
                    fontSize: 17,
                  }}>
                  TIPO DE CHAVE PIX
                </Text>
                <View
                  style={{
                    // SOMBRA (View externa)
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: 4,
                    borderRadius: 100, // deixa a sombra arredondada
                    backgroundColor: '#fff', // necessário no Android
                  }}>
                  <View
                    style={{
                      // BORDA ARREDONDADA (View interna)
                      borderRadius: 10,
                      overflow: 'hidden',
                      borderWidth: 0.5,
                      borderColor: '#ccc',
                      backgroundColor: '#fff',
                    }}>
                    <Picker
                      selectedValue={tipochavePix}
                      onValueChange={itemValue => setTipoChavePix(itemValue)}
                      style={{
                        paddingLeft: 15,
                        fontFamily: 'Montserrat-Regular',
                        fontSize: 14,
                        height: 50,
                        color: '#353738',
                        backgroundColor: '#fff', // evita o fundo cinza do Android
                      }}>
                      <Picker.Item label="Selecione uma opção" value="" />
                      <Picker.Item label="CPF" value="CPF" />
                      <Picker.Item label="Telefone" value="Telefone" />
                      <Picker.Item label="Email" value="EMAIL" />
                    </Picker>
                  </View>
                </View>

                <Text
                  style={{
                    marginTop: 10,
                    fontFamily: 'Montserrat-Bold',
                    color: 'rgba(8, 77, 110, 1)',
                    fontSize: 17,
                  }}>
                  CHAVE PIX
                </Text>
                <TextInput
                  value={chavePix}
                  onChangeText={setChavePix}
                  style={[styles.input, {marginTop: 8}]}
                />
              </View>
            </>
          );
        case 3:
          return (
            <>
              <View style={{width: '100%', padding: 5}}>
                <View
                  style={{
                    width: '100%',
                    alignItems: 'center',
                    padding: 15,
                    backgroundColor: '#fff',
                    borderRadius: 5,
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: 4,
                    color: '#353738',
                  }}>
                  <Text
                    style={{
                      marginTop: 10,
                      marginLeft: -5,
                      textAlign: 'center',
                      fontFamily: 'Montserrat-Regular',
                      color: 'rgba(8, 77, 110, 1)',
                      fontSize: 18,
                    }}>
                    Para continuar seu cadastro precisamos que nos envie uma
                    foto de identificação
                  </Text>
                  <Image
                    source={
                      typeof registerIcon === 'string'
                        ? {uri: registerIcon}
                        : registerIcon
                    }
                    style={{
                      marginTop: 5,
                      width: 80,
                      height: 80,
                      borderRadius: !uploadFt ? 0 : 50,
                      overflow: 'hidden',
                    }}
                    resizeMode="cover"
                  />

                  <Text
                    style={{
                      marginTop: 5,
                      marginLeft: -5,
                      textAlign: 'center',
                      fontFamily: 'Montserrat-Bold',
                      color: '#353738',
                      fontSize: 18,
                    }}>
                    Sem arquivo de identificação
                  </Text>
                  <TouchableOpacity
                    onPress={selecionarImagem}
                    style={[
                      styles.button,
                      {width: '90%', backgroundColor: 'rgba(244, 163, 11 ,1)'},
                    ]}>
                    <Text
                      style={[
                        styles.buttonText,
                        {fontFamily: 'Montserrat-Regular', fontSize: 17},
                      ]}>
                      Escolher arquivo
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          );
        default:
          return null;
      }
    }

    // fluxo normal (com senha)
    switch (currentStep) {
      case 1:
        return (
          <>
            <View style={{width: '100%', padding: 5}}>
              <Text
                style={{
                  fontFamily: 'Montserrat-Bold',
                  color: 'rgba(8, 77, 110, 1)',
                  fontSize: 17,
                }}>
                NOME
              </Text>
              <TextInput
                autoFocus
                value={nome}
                onChangeText={setNome}
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
              <Text
                style={{
                  marginTop: 10,
                  fontFamily: 'Montserrat-Bold',
                  color: 'rgba(8, 77, 110, 1)',
                  fontSize: 17,
                }}>
                SOBRENOME
              </Text>
              <TextInput
                value={sobreNome}
                onChangeText={setSobreNome}
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
              <Text
                style={{
                  marginTop: 10,
                  fontFamily: 'Montserrat-Bold',
                  color: 'rgba(8, 77, 110, 1)',
                  fontSize: 17,
                }}>
                EMAIL
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
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
              <Text
                style={{
                  marginTop: 10,
                  fontFamily: 'Montserrat-Bold',
                  color: 'rgba(8, 77, 110, 1)',
                  fontSize: 17,
                }}>
                DATA DE NASCIMENTO
              </Text>
              <TouchableOpacity
                style={[
                  styles.pickerButton,
                  {
                    backgroundColor: '#fff',
                    marginTop: -2,
                    paddingLeft: 15,
                    color: 'rgba(0, 0, 0, 0.5)',
                    borderRadius: 10,
                    height: 45,
                    fontSize: 18,
                    fontFamily: 'Montserrat-Regular',
                    borderWidth: 0,
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: 4,
                  },
                ]}
                onPress={showDatePicker}>
                <Text
                  style={{
                    paddingTop: 13,
                    fontFamily: 'Montserrat-Regular',
                    fontSize: 16,
                    paddingLeft: 2,
                    color: '#353738',
                  }}>
                  {dataNascimento
                    ? new Intl.DateTimeFormat('pt-BR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      }).format(dataNascimento)
                    : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        );
      case 2:
      case 2:
        return (
          <>
            <View style={{width: '100%', padding: 5}}>
              <Text
                style={{
                  marginTop: 10,
                  fontFamily: 'Montserrat-Bold',
                  color: 'rgba(8, 77, 110, 1)',
                  fontSize: 17,
                }}>
                TELEFONE COM WHATSAPP
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
                  value={telefone}
                  onChangeText={text => setTelefone(text)}
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

              <Text
                style={{
                  marginTop: 10,
                  fontFamily: 'Montserrat-Bold',
                  color: 'rgba(8, 77, 110, 1)',
                  fontSize: 17,
                }}>
                CPF
              </Text>
              <TextInput
                value={cpf}
                keyboardType="numeric"
                onChangeText={handleChangeCpf}
                maxLength={14}
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
              {mensagem !== '' && (
                <Text
                  style={{
                    fontFamily: 'Montserrat-Bold',
                    marginTop: -6,
                    fontSize: 15,
                    color:
                      mensagem === 'CPF válido'
                        ? '#077820'
                        : 'rgb(209, 72, 95)',
                  }}>
                  {mensagem}
                </Text>
              )}

              <Text
                style={{
                  marginTop: 10,
                  fontFamily: 'Montserrat-Bold',
                  color: 'rgba(8, 77, 110, 1)',
                  fontSize: 17,
                }}>
                TIPO DE CHAVE PIX
              </Text>
              <View
                style={{
                  // SOMBRA (View externa)
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.2,
                  shadowRadius: 3,
                  elevation: 4,
                  borderRadius: 100, // deixa a sombra arredondada
                  backgroundColor: '#fff', // necessário no Android
                }}>
                <View
                  style={{
                    // BORDA ARREDONDADA (View interna)
                    borderRadius: 10,
                    overflow: 'hidden',
                    borderWidth: 0.5,
                    borderColor: '#ccc',
                    backgroundColor: '#fff',
                  }}>
                  <Picker
                    selectedValue={tipochavePix}
                    onValueChange={itemValue => setTipoChavePix(itemValue)}
                    style={{
                      paddingLeft: 15,
                      fontFamily: 'Montserrat-Regular',
                      fontSize: 14,
                      height: 50,
                      color: '#353738',
                      backgroundColor: '#fff', // evita o fundo cinza do Android
                    }}>
                    <Picker.Item label="Selecione uma opção" value="" />
                    <Picker.Item label="CPF" value="CPF" />
                    <Picker.Item label="CNPJ" value="CNPJ" />
                    <Picker.Item label="Email" value="EMAIL" />
                  </Picker>
                </View>
              </View>

              <Text
                style={{
                  marginTop: 10,
                  fontFamily: 'Montserrat-Bold',
                  color: 'rgba(8, 77, 110, 1)',
                  fontSize: 17,
                }}>
                CHAVE PIX
              </Text>
              <TextInput
                value={chavePix}
                onChangeText={setChavePix}
                style={[styles.input, {marginTop: 8}]}
              />
            </View>
          </>
        );
      case 3:
        return (
          <>
            <View style={{width: '100%', padding: 5}}>
              <Text
                style={{
                  marginTop: 10,
                  fontFamily: 'Montserrat-Bold',
                  color: 'rgba(8, 77, 110, 1)',
                  fontSize: 17,
                }}>
                SENHA
              </Text>
              <TextInput
                value={senha}
                onChangeText={setSenha}
                style={[styles.input, {marginTop: 8}]}
                secureTextEntry={true}
              />

              <Text
                style={{
                  marginTop: 10,
                  fontFamily: 'Montserrat-Bold',
                  color: 'rgba(8, 77, 110, 1)',
                  fontSize: 17,
                }}>
                REPETIR SENHA
              </Text>
              <TextInput
                value={repetirSenha}
                onChangeText={setRepetirSenha}
                style={[styles.input, {marginTop: 8}]}
                secureTextEntry
              />

              <View
                style={{
                  borderTopWidth: 1,
                  borderColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: 10,
                  width: '100%',
                  marginTop: 15,
                  padding: 10,
                }}>
                <Text
                  style={{
                    color: 'rgb(166, 16, 5)',
                    lineHeight: 23,
                    fontFamily: 'Montserrat-Regular',
                    fontSize: 18,
                  }}>
                  As senhas devem conter 8 caracteres, 1 (uma) letra maiúscula,
                  1 (uma) minúscula e um símbolo “_” “ , ” “ . “ “ * “.
                </Text>
              </View>
            </View>
          </>
        );
      case 4:
        return (
          <>
            <View style={{width: '100%', padding: 5}}>
              <View
                style={{
                  width: '100%',
                  alignItems: 'center',
                  padding: 15,
                  backgroundColor: '#fff',
                  borderRadius: 5,
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.2,
                  shadowRadius: 3,
                  elevation: 4,
                  color: '#353738',
                }}>
                <Text
                  style={{
                    marginTop: 10,
                    marginLeft: -5,
                    textAlign: 'center',
                    fontFamily: 'Montserrat-Regular',
                    color: 'rgba(8, 77, 110, 1)',
                    fontSize: 18,
                  }}>
                  Para continuar seu cadastro precisamos que nos envie uma foto
                  de identificação
                </Text>
                <Image
                  source={
                    typeof registerIcon === 'string'
                      ? {uri: registerIcon}
                      : registerIcon
                  }
                  style={{
                    marginTop: 5,
                    width: 80,
                    height: 80,
                    borderRadius: !uploadFt ? 0 : 50,
                    overflow: 'hidden',
                  }}
                  resizeMode="cover"
                />

                <Text
                  style={{
                    marginTop: 5,
                    marginLeft: -5,
                    textAlign: 'center',
                    fontFamily: 'Montserrat-Bold',
                    color: '#353738',
                    fontSize: 18,
                  }}>
                  Sem arquivo de identificação
                </Text>
                <TouchableOpacity
                  onPress={selecionarImagem}
                  style={[
                    styles.button,
                    {width: '90%', backgroundColor: 'rgba(244, 163, 11 ,1)'},
                  ]}>
                  <Text
                    style={[
                      styles.buttonText,
                      {fontFamily: 'Montserrat-Regular', fontSize: 17},
                    ]}>
                    Escolher arquivo
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={{flex: 1, alignItems: 'center', backgroundColor: '#fff'}}>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        maximumDate={new Date()} // impede datas futuras
        minimumDate={
          new Date(new Date().setFullYear(new Date().getFullYear() - 120))
        } // impede datas muito antigas
      />

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.4)',
              justifyContent: 'flex-end',
            }}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  backgroundColor: '#F2F2F7',
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  padding: 24,
                  paddingBottom: Platform.OS === 'ios' ? 40 : 24,
                }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: 'Montserrat-Regular',
                    marginBottom: 20,
                    color: '#1C1C1E',
                    textAlign: 'center',
                  }}>
                  Selecionar Imagem
                </Text>

                <TouchableOpacity
                  onPress={handleCameraPress}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 10,
                    paddingVertical: 12,
                    marginBottom: 12,
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      color: '#1C1C1E',
                      fontSize: 17,
                      fontFamily: 'Montserrat-Regular',
                    }}>
                    Tirar Foto
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleGalleryPress}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 10,
                    paddingVertical: 12,
                    marginBottom: 12,
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      color: '#1C1C1E',
                      fontSize: 17,
                      fontFamily: 'Montserrat-Regular',
                    }}>
                    Escolher da Galeria
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={{
                    backgroundColor: '#b20d26',
                    borderRadius: 10,
                    paddingVertical: 9,
                    alignItems: 'center',
                    marginTop: 4,
                  }}>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 17,
                      fontFamily: 'Montserrat-Regular',
                    }}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showAlertTravelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAlertTravelModal(false)}>
        <TouchableWithoutFeedback
          onPress={() => setShowAlertTravelModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.alertModal}>
                <MaterialIcon
                  name="error-outline"
                  size={48}
                  color="#e74c3c"
                  style={{marginBottom: 10}}
                />
                <Text style={styles.alertTitle}>Atenção</Text>
                <Text style={styles.alertMessage}>{showMsgTravelModal}</Text>
                <TouchableOpacity
                  style={styles.alertButton}
                  onPress={() => setShowAlertTravelModal(false)}>
                  <Text style={styles.alertButtonText}>Entendi</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <View
        style={[
          styles.container,
          {
            height: '100%',
            width: screenWidth * 0.9 > maxWidth ? maxWidth : screenWidth * 0.9,
          },
        ]}>
        {renderStepIndicator()}
        <Text
          style={{
            textAlign: 'center',
            color: 'rgba(8, 77, 110, 1)',
            fontSize: 25,
            fontFamily: 'Montserrat-Bold',
          }}>
          CADASTRO
        </Text>

        <ScrollView keyboardShouldPersistTaps="handled">
          {renderStepContent()}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 0,
              marginBottom: 50,
            }}>
            {currentStep > 1 ? (
              <TouchableOpacity
                style={[styles.button, {width: '48%'}]}
                onPress={prevStep}>
                <Text
                  style={[
                    styles.buttonText,
                    {fontFamily: 'Montserrat-Regular', fontSize: 18},
                  ]}>
                  Voltar
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, {width: '48%'}]}
                onPress={() => navigation.goBack()}>
                <Text
                  style={[
                    styles.buttonText,
                    {fontFamily: 'Montserrat-Regular', fontSize: 18},
                  ]}>
                  Voltar
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, {width: '48%'}]}
              onPress={async () => {
                try {
                  // validação STEP 1 (dados pessoais)
                  if (
                    currentStep === 1 &&
                    (nome === '' ||
                      sobreNome === '' ||
                      email === '' ||
                      !dataNascimento)
                  ) {
                    setShowMsgTravelModal(
                      `${currentStep} Preencha corretamente todos os campos antes de avançar!`,
                    );
                    setShowAlertTravelModal(true);
                    return;
                  }

                  // validação de email único (STEP 1)
                  if (currentStep === 1) {
                    let dadosEmail = usuarios.filter(
                      item => item.email === email,
                    );
                    if (dadosEmail.length === 1) {
                      setShowMsgTravelModal(
                        'Este email já existe, tente novamente!',
                      );
                      setShowAlertTravelModal(true);
                      return;
                    }
                  }

                  // validação STEP 2 (telefone / cpf / pix)
                  if (
                    currentStep === 2 &&
                    (telefone === '' ||
                      cpf === '' ||
                      tipochavePix === '' ||
                      chavePix === '')
                  ) {
                    setShowMsgTravelModal(
                      `${currentStep} Preencha corretamente todos os campos antes de avançar!`,
                    );
                    setShowAlertTravelModal(true);
                    return;
                  }

                  if (currentStep === 2) {
                    let numero = '+55 ' + telefone;
                    let dadosTelefone = usuarios.filter(
                      item => item.celular === numero,
                    );
                    if (dadosTelefone.length > 0) {
                      setShowMsgTravelModal(
                        'Este telefone já está cadastrado, tente novamente!',
                      );
                      setShowAlertTravelModal(true);
                      return;
                    }

                    let dadosCpf = usuarios.filter(item => item.cpf === cpf);
                    if (dadosCpf.length === 1) {
                      setShowMsgTravelModal(
                        'Este cpf já está cadastrado, tente novamente!',
                      );
                      setShowAlertTravelModal(true);
                      return;
                    }

                    if (mensagem.startsWith('CPF inv')) {
                      setShowMsgTravelModal('CPF inválido, tente novamente!');
                      setShowAlertTravelModal(true);
                      return;
                    }

                    let dadosChavePix = usuarios.filter(
                      item => item.chave_pix === chavePix,
                    );
                    if (dadosChavePix.length > 0) {
                      setShowMsgTravelModal(
                        'Esta chave pix já está cadastrada, tente novamente!',
                      );
                      setShowAlertTravelModal(true);
                      return;
                    }
                  }

                  // validação STEP senha (apenas se existir passwordStep)
                  if (passwordStep && currentStep === passwordStep) {
                    if (senha === '' || repetirSenha === '') {
                      setShowMsgTravelModal(
                        `${currentStep} Preencha corretamente todos os campos antes de avançar!`,
                      );
                      setShowAlertTravelModal(true);
                      return;
                    }

                    if (senha !== repetirSenha) {
                      setShowMsgTravelModal(
                        'As senhas não devem ser distintas!',
                      );
                      setShowAlertTravelModal(true);
                      return;
                    }
                  }

                  // validação upload (neste step precisa ter upload)
                  if (currentStep === uploadStep && uploadFt === false) {
                    setShowMsgTravelModal('Por favor selecione a imagem!');
                    setShowAlertTravelModal(true);
                    return;
                  }

                  // finalize quando estiver no step de upload e imagem presente
                  if (currentStep === uploadStep && uploadFt === true) {
                    await AsyncStorage.setItem('nomeCadastro', nome);
                    await AsyncStorage.setItem('sobreNomeCadastro', sobreNome);

                    await AsyncStorage.setItem('emailCadastro', email);

                    await AsyncStorage.setItem('telefoneCadastro', telefone);
                    await AsyncStorage.setItem('cpfCadastro', cpf);

                    await AsyncStorage.setItem(
                      'tipochavePixCadastro',
                      tipochavePix,
                    );
                    await AsyncStorage.setItem('chavePixCadastro', chavePix);

                    // só salvar senha se existir (i.e., exibirSenha === true)
                    if (exibirSenha) {
                      await AsyncStorage.setItem('senhaCadastro', senha);
                      await AsyncStorage.setItem(
                        'repetirSenhaCadastro',
                        repetirSenha,
                      );
                    } else {
                      await AsyncStorage.setItem('senhaCadastro', '');
                      await AsyncStorage.setItem('repetirSenhaCadastro', '');
                    }

                    // salvar imagem (verifica se registerIcon e uri existem)
                    if (registerIcon && registerIcon.uri) {
                      await AsyncStorage.setItem(
                        'imgPerfilCadastro',
                        registerIcon.uri,
                      );
                    }

                    let resultGerarCodigoConfirmacao =
                      await inserirGerarCodigoConfirmacao('email', nome, email);
                    console.log(resultGerarCodigoConfirmacao);
                    if (resultGerarCodigoConfirmacao.status === 'sucesso') {
                      navigation.replace('ConfirmacaoEmail');
                      return; // não chamar nextStep após navegar
                    }
                  }

                  // avançar para próximo step (se não finalizou/navegou)
                  nextStep();
                } catch (err) {
                  console.error('Erro no fluxo de cadastro:', err);
                  setShowMsgTravelModal('Ocorreu um erro. Tente novamente.');
                  setShowAlertTravelModal(true);
                }
              }}>
              <Text
                style={[
                  styles.buttonText,
                  {fontFamily: 'Montserrat-Regular', fontSize: 18},
                ]}>
                {currentStep < totalSteps ? 'Próximo' : 'Finalizar'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default Cadastro;
