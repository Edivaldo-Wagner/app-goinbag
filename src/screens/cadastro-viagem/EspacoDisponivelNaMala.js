import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
  ScrollView,
  Dimensions,
  Pressable,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LocalizacaoAtual from '../../components/localizacaoAtual/LocalizacaoAtual';
import Header from '../../components/header/Header';
import SidebarLandingPage from '../../components/sidebarDashboard/SidebarLandingPage';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import UseFinalizarCadastramentoMala from '../../hooks/UseFinalizarCadastramentoMala/UseFinalizarCadastramentoMala';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {getSecureData} from '../../utils/secureStorage';
import {
  saveToGlobalState,
  clearAppState,
  getStoredData,
} from '../../utils/storage';

const bagOptions = [
  {
    label: 'Pequeno, estilo envelope',
    weight: 'até 1kg',
    fullText: 'Pequeno, estilo envelope até 1kg',
  },
  {
    label: 'Caixa de Sapato/Sacola',
    weight: '1 a 5kg',
    fullText: 'Caixa de Sapato/Sacola – 1 kg a 5 kg',
  },
  {
    label: 'Mochila/Mala',
    weight: '5 a 10kg',
    fullText: 'Mochila/Mala – 5 kg a 10 kg',
  },
  {
    label: 'Mala/Caixa',
    weight: '10 a 23kg',
    fullText: 'Mala/Caixa – 10 kg até 23 kg',
  },
];

const EspacoDisponivelNaMala = () => {
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width;
  const maxWidth = 600;

  const [voltandoTrajeto, setVoltandoTrajeto] = useState(null);
  const [selectedBagOption, setSelectedBagOption] = useState(bagOptions[0]);
  const [showBagList, setShowBagList] = useState(false);
  const [text, setText] = useState('');
  const [respostaVolta, setRespostaVolta] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const charCount = text.length;
  const maxChars = 49;

  const {finalizarCadastramento, loading} = UseFinalizarCadastramentoMala();

  useEffect(() => {
    const redirectLogin = async () => {
      try {
        const refresh_token = await getSecureData('refresh_token');
        if (!refresh_token) {
          await saveToGlobalState({ logar_como: 'VIAJANTE' });
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
    const loadData = async () => {
      try {
        const {
          voltando_trajeto: isVoltando,
          select_espaco_mala: bagSaved,
          informacao_a_viagem: savedText,
          oferecer_espaco_na_volta: savedVolta,
        } = await getStoredData();

        // 1. Atualiza status de viagem de volta no estado
        setVoltandoTrajeto(isVoltando);

        // Se for a viagem de volta, define como "nao" internamente para passar nas validações
        if (isVoltando === 'sim') {
          setRespostaVolta('nao');
        } else if (savedVolta === 'sim' || savedVolta === 'nao') {
          setRespostaVolta(savedVolta);
        } else {
          setRespostaVolta(null);
        }

        if (
          bagSaved &&
          bagOptions.some(b => b.fullText === bagSaved || b.label === bagSaved)
        ) {
          const matchedOption = bagOptions.find(
            b => b.fullText === bagSaved || b.label === bagSaved,
          );
          setSelectedBagOption(matchedOption);
        } else {
          await saveToGlobalState({
            select_espaco_mala: bagOptions[0].fullText,
          });
        }

        if (savedText) {
          setText(savedText);
        }
      } catch (e) {
        console.error('Erro ao carregar dados:', e);
      }
    };

    loadData();
  }, []);

  const salvarBagOption = async option => {
    try {
      await saveToGlobalState({
        select_espaco_mala: option.fullText,
      });
    } catch (e) {
      console.error('Erro ao salvar opção de bagagem', e);
    }
  };

  const handleBagSelect = option => {
    setSelectedBagOption(option);
    salvarBagOption(option);
    setShowBagList(false);
  };

  const closeModal = () => {
    setShowErrorModal(false);
  };

  const handleProximo = async () => {
    // 1. Validações Iniciais
    if (!text.trim()) {
      setErrorMessage('Preencha alguma informação para a viagem!');
      setShowErrorModal(true);
      return;
    }

    const dataStorage = await getStoredData();
    const estaVoltando = dataStorage?.voltando_trajeto === 'sim';

    // Só exige respostaVolta se NÃO estiver editando e NÃO for a viagem de volta
    if (
      !estaVoltando &&
      dataStorage?.editar_trajeto !== 'sim' &&
      !respostaVolta
    ) {
      setErrorMessage(
        'Por favor, selecione se deseja oferecer espaço na volta!',
      );
      setShowErrorModal(true);
      return;
    }

    try {
      // Grava no estado global
      await saveToGlobalState({
        informacao_a_viagem: text,
        oferecer_espaco_na_volta: estaVoltando ? 'nao' : respostaVolta,
      });

      const stored = await getStoredData();

      console.log(stored);
      //return

      // 2. Finaliza o cadastro (envio à API)
      await finalizarCadastramento();

      // 3. Caso seja Edição de Trajeto
      if (stored?.editar_trajeto === 'sim') {
        await clearAppState();
        await saveToGlobalState({tab_login: 'VIAJANTE'});

        navigation.reset({
          index: 0,
          routes: [{name: 'DashboardAvailable'}],
        });
        return;
      }

      // 4. Caso já esteja cadastrando a VOLTA
      if (estaVoltando) {
        await clearAppState();
        await saveToGlobalState({tab_login: 'VIAJANTE'});

        navigation.reset({
          index: 0,
          routes: [{name: 'DashboardAvailable'}],
        });
        return;
      }

      // 5. Caso deseje cadastrar a VOLTA agora
      const type = stored?.qual_meio_transporte;
      const routesMap = {
        aviao: 'OpcaoAviao',
        onibus: 'OpcaoOnibus',
        trem: 'OpcaoTrems',
        carro: 'OpcaoCarro',
        moto: 'OpcaoMoto',
      };

      const targetRoute = routesMap[type];

      if (respostaVolta === 'sim' && targetRoute) {
        await clearAppState();
        await saveToGlobalState({
          qual_meio_transporte: type,
          voltando_trajeto: 'sim', // Seta que o próximo ciclo é o trajeto de volta
        });

        navigation.reset({
          index: 0,
          routes: [{name: targetRoute}],
        });
        return;
      }

      // 6. Caso NÃO queira cadastrar a volta
      await clearAppState();
      await saveToGlobalState({
        voltando_trajeto: 'nao',
      });

      navigation.reset({
        index: 0,
        routes: [{name: 'DashboardAvailable'}],
      });
    } catch (e) {
      console.error('Erro ao finalizar cadastro:', e);
      setErrorMessage(e.message || 'Erro ao finalizar viagem.');
      setShowErrorModal(true);
    }
  };

  const RenderCardContent = ({tipo, titulo, subtitulo}) => {
    const isSelected = respostaVolta === tipo;

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
          style={styles.gradientCardStyle}>
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
    <>
      <SafeAreaView style={{flex: 1, backgroundColor: '#0a768f'}} edges={['top', 'left', 'right']}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#0a768f" 
        translucent={false} 
      />
      <SidebarLandingPage backgroundColor="#f0eded" />
      <TouchableOpacity
        style={{flex: 1}}
        activeOpacity={1}
        onPress={() => {
          Keyboard.dismiss();
          setShowBagList(false);
        }}>
        <View style={styles.page}>
          <LocalizacaoAtual />

          <Modal
            visible={showErrorModal}
            transparent
            animationType="fade"
            onRequestClose={closeModal}>
            <TouchableWithoutFeedback onPress={closeModal}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.modalContent}>
                    <MaterialIcon
                      name="error-outline"
                      size={48}
                      color="#e74c3c"
                      style={{marginBottom: 10}}
                    />
                    <Text style={styles.modalTitle}>Atenção</Text>
                    <Text style={styles.modalText}>{errorMessage}</Text>

                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={closeModal}>
                      <Text style={styles.modalButtonText}>Entendi</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}>
            <View
              style={[
                styles.container,
                {
                  width:
                    screenWidth * 0.9 > maxWidth ? maxWidth : screenWidth * 0.9,
                },
              ]}>
              {/* Seção 1: Seleção de Mala */}
              <Text style={styles.title}>Selecione o tamanho da mala</Text>

              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  onPress={() => setShowBagList(!showBagList)}
                  activeOpacity={0.8}
                  style={styles.input}>
                  <Text style={styles.inputText}>
                    {selectedBagOption?.label ||
                      selectedBagOption?.fullText ||
                      selectedBagOption}
                  </Text>
                  <MaterialIcon
                    name="keyboard-arrow-down"
                    size={24}
                    color="#19c4c9"
                  />
                </TouchableOpacity>

                {showBagList && (
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={e => e.stopPropagation?.()}
                    style={styles.bagList}>
                    {bagOptions.map((item, index) => {
                      const isSelected =
                        item.fullText === selectedBagOption?.fullText ||
                        item.label === selectedBagOption;
                      return (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleBagSelect(item)}
                          style={[
                            styles.bagItem,
                            isSelected && styles.bagItemSelected,
                          ]}>
                          <Text
                            style={[
                              styles.bagItemText,
                              isSelected && styles.bagItemTextSelected,
                            ]}>
                            {item.label}
                          </Text>
                          <View style={styles.badgeWeight}>
                            <Text style={styles.badgeWeightText}>
                              {item.weight}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </TouchableOpacity>
                )}
              </View>

              {/* Seção 2: Descrição da Viagem */}
              <Text style={[styles.title, {marginTop: 25}]}>
                Descreva a informação da sua viagem
              </Text>

              <View style={styles.shadow}>
                <TextInput
                  autoFocus={false}
                  style={styles.textArea}
                  multiline
                  value={text}
                  onChangeText={setText}
                  maxLength={maxChars}
                  placeholder="Descreva a sua viagem..."
                  placeholderTextColor="#aaa"
                />

                <Text style={styles.counterText}>
                  {charCount}/{maxChars}
                </Text>
              </View>

              {/* Seção 3: Oferecer Espaço na Volta (Renderiza APENAS na Ida) */}
              {voltandoTrajeto !== 'sim' && (
                <>
                  <Text style={[styles.title, {marginTop: 25}]}>
                    Deseja Oferecer espaço na volta?
                  </Text>

                  <View style={styles.sideBySideCardsContainer}>
                    <Pressable
                      style={styles.halfCardPressable}
                      onPress={() => setRespostaVolta('sim')}>
                      <RenderCardContent
                        tipo="sim"
                        titulo="Sim"
                        subtitulo="Quero oferecer espaço"
                      />
                    </Pressable>

                    <Pressable
                      style={styles.halfCardPressable}
                      onPress={() => setRespostaVolta('nao')}>
                      <RenderCardContent
                        tipo="nao"
                        titulo="Não"
                        subtitulo="Não quero oferecer"
                      />
                    </Pressable>
                  </View>
                </>
              )}

              {/* Botões de Ação */}
              <View style={styles.botoes}>
                <TouchableOpacity
                  style={styles.botaoVoltar}
                  onPress={() => navigation.goBack()}>
                  <Text style={styles.textoBotaoVoltar}>VOLTAR</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.botaoContinuar}
                  onPress={handleProximo}
                  disabled={loading}>
                  <LinearGradient
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    colors={['rgb(26, 127, 231)', 'rgb(25, 196, 201)']}
                    locations={[0, 0.4]}
                    style={styles.gradientButton}>
                    <Text style={styles.textoBotaoContinuar}>
                      {loading ? 'SALVANDO...' : 'CONTINUAR'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </TouchableOpacity>
      <Header />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f0eded',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  container: {
    alignSelf: 'center',
    marginTop: 0,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  title: {
    marginBottom: 10,
    fontFamily: 'Montserrat-Bold',
    color: '#0A2540',
    fontSize: 17,
    fontWeight: 'bold',
  },
  dropdownContainer: {
    position: 'relative',
    borderRadius: 20,
    backgroundColor: '#fff',
    zIndex: 999,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  shadow: {
    position: 'relative',
    borderRadius: 20,
    zIndex: 1,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  input: {
    height: 55,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  inputText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    color: '#333',
    flex: 1,
  },
  bagList: {
    position: 'absolute',
    top: 65,
    left: 0,
    right: 0,
    borderRadius: 20,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 8,
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  bagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 50,
    paddingHorizontal: 16,
    borderRadius: 15,
    marginVertical: 2,
  },
  bagItemSelected: {
    backgroundColor: '#f0fdfd',
  },
  bagItemText: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Montserrat-Bold',
    fontWeight: '700',
    flex: 1,
    paddingRight: 10,
  },
  bagItemTextSelected: {
    color: '#19c4c9',
  },
  badgeWeight: {
    backgroundColor: '#e6f7f7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeWeightText: {
    fontSize: 13,
    color: '#19c4c9',
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 15,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#353738',
  },
  counterText: {
    alignSelf: 'flex-end',
    fontSize: 15,
    color: '#999',
    marginRight: 15,
    marginBottom: 10,
    fontFamily: 'Montserrat-Regular',
  },
  sideBySideCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 5,
  },
  halfCardPressable: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardStylePadrao: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#fff',
    minHeight: 100,
    justifyContent: 'center',
  },
  gradientCardStyle: {
    padding: 18,
    borderRadius: 20,
    minHeight: 100,
    justifyContent: 'center',
  },
  cardContentInner: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  cardTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A2540',
    marginBottom: 4,
  },
  cardSubtitulo: {
    fontSize: 13,
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
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botaoVoltar: {
    flex: 1,
    backgroundColor: 'rgb(232, 232, 232)',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 8,
  },
  textoBotaoVoltar: {
    color: '#353437',
    fontSize: 15,
    fontWeight: 'bold',
  },
  botaoContinuar: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 25,
    overflow: 'hidden',
  },
  gradientButton: {
    width: '100%',
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoBotaoContinuar: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
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
  modalTitle: {
    fontSize: 22,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 17,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#0c9fe3',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 4,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
  },
});

export default EspacoDisponivelNaMala;
