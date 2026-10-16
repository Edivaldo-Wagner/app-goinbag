import React, {useState, useEffect} from 'react';
import {
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import LocalizacaoAtual from '../../components/localizacaoAtual/LocalizacaoAtual';
import styles from './InformacaoAVagem.styles';
import {useNavigation} from '@react-navigation/native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const InformacaoAVagem = ({navigation}) => {
  const nav = useNavigation();
  const screenWidth = Dimensions.get('window').width;
  const maxWidth = 600;

  const [text, setText] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  const charCount = text.length;
  const maxChars = 78;

  useEffect(() => {
    const loadData = async () => {
      const savedText = await AsyncStorage.getItem('informacao-a-viagem');
      setText(savedText ?? ''); // 👈 se for null, usa string vazia
    };

    loadData();
  }, []);

  const handleProximo = async () => {
    if (text) {
      try {
        await AsyncStorage.setItem('informacao-a-viagem', text); // 👈 Salvando no AsyncStorage

        if ((await AsyncStorage.getItem('editando_viagem')) == 'sim') {
          await AsyncStorage.setItem('viagem_editada_sucesso', 'sim');
          navigation.navigate('FinalizarAtualizarMala');
          return;
        }

        if ((await AsyncStorage.getItem('voltando_trajeto')) == 'sim') {
          navigation.navigate('FinalizarCadastramentoMala');
        } else {
          navigation.navigate('OferecerEspacoNaVolta'); // 👈 Navegação
        }
      } catch (e) {
        //console.error('Erro ao salvar informação da viagem:', e);
        // Aqui você pode mostrar um alerta, toast, etc.
      }
    } else {
      //Alert.alert('Erro', 'Não foi possível finalizar a viagem.');
      setShowErrorModal(true);
    }
  };

  const closeModal = () => {
    setShowErrorModal(false);
  };

  return (
    <View style={{flex: 1, alignItems: 'center', backgroundColor: '#fff'}}>
      <LocalizacaoAtual />
      {/* MODAL DE ERRO */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal}>
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
                  Preencha alguma informação para a viagem!
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#0c9fe3',
                    borderRadius: 8,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    elevation: 4,
                  }}
                  onPress={closeModal}>
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

      <View
        style={[
          styles.container,
          {width: screenWidth * 0.9 > maxWidth ? maxWidth : screenWidth * 0.9},
        ]}>
        <Text
          style={{
            marginTop: 0,
            marginBottom: 10,
            fontFamily: 'Montserrat-Bold',
            color: '#353437',
            fontSize: 21,
            lineHeight: 32,
          }}>
          Descreva a informação da sua viagem
        </Text>

        <View style={styles.shadow}>
          <TextInput
            autoFocus
            style={[
              styles.textArea,
              {fontFamily: 'Montserrat-Regular', padding: 20, fontSize: 19},
            ]}
            multiline
            value={text}
            onChangeText={setText}
            maxLength={78}
            placeholder="Digite aqui..."
            placeholderTextColor="#aaa"
          />
          <Text
            style={{
              alignSelf: 'flex-end',
              fontSize: 20,
              color: '#999',
              margin: 10,
              fontFamily: 'Montserrat-Regular',
            }}>
            {charCount}/{maxChars}
          </Text>
        </View>

        <View style={styles.botoes}>
          <TouchableOpacity
            style={styles.botaoVoltar}
            onPress={() => nav.goBack()}>
            <Text style={styles.textoBotaoVoltar}>Voltar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.botaoContinuar,
              {
                width: '48%',
                marginLeft: 10,
                padding: 0,
                overflow: 'hidden',
              },
            ]}
            onPress={handleProximo}>
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              colors={['rgb(26, 127, 231)', 'rgb(25, 196, 201)']}
              locations={[0, 0.4]}
              style={{
                flex: 1,
                width: '100%',
                height: '100%',
                borderRadius: 25,
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 12,
              }}>
              <Text style={styles.textoBotaoContinuar}>Continuar</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default InformacaoAVagem;
