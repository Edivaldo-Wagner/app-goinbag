import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  Pressable,
} from 'react-native';
import LocalizacaoAtual from '../../components/localizacaoAtual/LocalizacaoAtual';
import {useNavigation} from '@react-navigation/native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

const OferecerEspacoNaVolta = ({navigation}) => {
  const nav = useNavigation();
  const [showAlertTravelModal, setShowAlertTravelModal] = useState(false);
  const [resposta, setResposta] = useState(null);

  const handleContinuar = async () => {
    if (!resposta) {
      setShowAlertTravelModal(true);
      return;
    }

    try {
      await AsyncStorage.setItem('oferecer_espaco_na_volta', resposta);
      nav.navigate('FinalizarCadastramentoMala');
    } catch (error) {
      // Tratar erro se necessário
    }
  };

  const RenderCardContent = ({tipo, titulo, subtitulo}) => {
    const isSelected = resposta === tipo;

    const ConteudoTexto = () => (
      <View style={styles.cardContentInner}>
        <Text style={[styles.cardTitulo, isSelected && styles.textoBranco]}>
          {titulo}
        </Text>
        <Text
          style={[styles.cardSubtitulo, isSelected && styles.textoBrancoSutil]}>
          {subtitulo}
        </Text>
      </View>
    );

    if (isSelected) {
      return (
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          colors={['rgb(26, 127, 231)', 'rgb(25, 196, 201)']}
          locations={[0, 0.4]}
          style={styles.gradientStyle}>
          <ConteudoTexto />
        </LinearGradient>
      );
    }

    return (
      <View style={styles.cardStylePadrao}>
        <ConteudoTexto />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LocalizacaoAtual />

      {/* Modal de Alerta */}
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
                <Text style={styles.alertMessage}>
                  Por favor, selecione uma opção antes de continuar.
                </Text>
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

      {/* Conteúdo Principal */}
      <View style={styles.contentContainer}>
        <Text style={styles.tituloScreen}>
          Deseja Oferecer espaço na volta?
        </Text>

        <View style={styles.cardsContainer}>
          {/* Card SIM */}
          <Pressable
            style={styles.cardPressableShadow}
            onPress={() => setResposta('sim')}>
            <RenderCardContent
              tipo="sim"
              titulo="Sim"
              subtitulo="Quero oferecer espaço"
            />
          </Pressable>

          {/* Card NÃO */}
          <Pressable
            style={styles.cardPressableShadow}
            onPress={() => setResposta('nao')}>
            <RenderCardContent
              tipo="nao"
              titulo="Não"
              subtitulo="Não quero oferecer"
            />
          </Pressable>
        </View>
        {/* Botões de Navegação Inferiores */}
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
            onPress={handleContinuar}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  tituloScreen: {
    fontSize: 22,
    color: '#0A2540',
    fontWeight: 'bold',
    marginBottom: 25,
    paddingHorizontal: 5,
  },
  cardsContainer: {
    gap: 20,
    width: '100%',
  },
  // O pai lida APENAS com a sombra do container para não bugar no Android/iOS
  cardPressableShadow: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  // Os filhos aplicam o fundo real e contêm o seu próprio borderRadius e padding
  cardStylePadrao: {
    width: '100%',
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#fff',
  },
  gradientStyle: {
    width: '100%',
    padding: 24,
    borderRadius: 24,
  },
  cardContentInner: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  cardTitulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0A2540',
    marginBottom: 6,
  },
  cardSubtitulo: {
    fontSize: 16,
    color: '#627D98',
    fontWeight: '500',
  },
  textoBranco: {
    color: '#ffffff',
  },
  textoBrancoSutil: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  botoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 10,
  },
  botaoVoltar: {
    flex: 1,
    width: '100%',
    border: 'none',
    backgroundColor: 'rgb(232, 232, 232)',
    borderColor: 'rgb(232, 232, 232)',
    borderWidth: 2,
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  textoBotaoVoltar: {color: '#353437', fontSize: 16, fontWeight: 'bold'},

  textoBotaoContinuar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    fontWeight: 'bold',
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  alertButton: {
    backgroundColor: '#00aaff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  alertButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default OferecerEspacoNaVolta;
