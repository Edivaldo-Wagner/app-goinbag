import React, {useState} from 'react';
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
import styles from './InformacaoAVagemRetorno.styles';
import {useNavigation} from '@react-navigation/native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 👈 Importação

const InformacaoAVagemRetorno = ({navigation}) => {
  const nav = useNavigation();
  const screenWidth = Dimensions.get('window').width;
  const maxWidth = 600;

  const [text, setText] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  const charCount = text.length;
  const maxChars = 137;

  const handleProximo = async () => {
    if (text) {
      try {
        await AsyncStorage.setItem('informacao-a-viagem-retorno', text); // 👈 Salvando no AsyncStorage
        navigation.navigate('FinalizarCadastramentoMala'); // 👈 Navegação
      } catch (e) {
        console.error('Erro ao salvar informação da viagem:', e);
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
            textAlign: 'center',
            color: '#0C9FE3',
            fontSize: 25,
            fontFamily: 'Montserrat-Bold',
          }}>
          Deseja adicionar alguma informação para a viagem?
        </Text>

        <View style={{marginTop: 20}}>
          <TextInput
            style={[
              styles.textArea,
              {fontFamily: 'Montserrat-Regular', padding: 20, fontSize: 19},
            ]}
            multiline
            value={text}
            onChangeText={setText}
            maxLength={137}
            placeholder="Digite aqui..."
            placeholderTextColor="#aaa"
          />
          <Text
            style={{
              alignSelf: 'flex-end',
              fontSize: 20,
              color: '#999',
              marginTop: 4,
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
            style={styles.botaoContinuar}
            onPress={handleProximo}>
            <Text style={styles.textoBotaoContinuar}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default InformacaoAVagemRetorno;
