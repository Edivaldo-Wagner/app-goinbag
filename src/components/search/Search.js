// Search.js
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import styles from '../../screens/home/Home.styles';
import {getCoordinatesFromAddress} from '../locationService/locationService';
import SearchAllCityGoogleMaps from '../../components/searchAllCityGoogleMaps/SearchAllCityGoogleMaps';
import ResultadosBuscaSessionStore from '../../screens/resultados-busca/ResultadosBuscaSessionStore';

const Search = ({onSearch, onError, onNavigate}) => {
  // Estados do Formulário
  const [saindoDe, setSaindoDe] = useState('Origem');
  const [indoPara, setIndoPara] = useState('Destino');
  const [tipoEncomenda, setTipoEncomenda] = useState('Encomenda');
  const [valorSeguro, setValorSeguro] = useState('Seguro');

  // Cores de Texto
  const [colorTextSaindoDe, setColorTextSaindoDe] = useState('rgba(106, 115, 132, 0.55)');
  const [colorTextIndoPara, setColorTextIndoPara] = useState('rgba(106, 115, 132, 0.55)');
  const [colorTextTipoEncomenda, setColorTextTipoEncomenda] =
    useState('rgba(106, 115, 132, 0.55)');
  const [colorTextValorSeguro, setColorTextValorSeguro] = useState('rgba(106, 115, 132, 0.55)');

  // Estados de Validação e Loading
  const [erroSaindoDe, setErroSaindoDe] = useState(false);
  const [erroIndoPara, setErroIndoPara] = useState(false);
  const [erroTipoEncomenda, setErroTipoEncomenda] = useState(false);
  const [erroValorSeguro, setErroValorSeguro] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados de Controle de TODAS as Modais
  const [modalVisible, setModalVisible] = useState(false); // Cidades e Encomenda
  const [modalValorSeguro, setModalValorSeguro] = useState(false); // Seguro
  const [showWarningEnvelopeModal, setShowWarningEnvelopeModal] =
    useState(false); // Alerta Envelope
  const [showErrorModal, setShowErrorModal] = useState(false); // Alerta Erro de Validação

  // Auxiliares das Modais
  const [campoSelecionado, setCampoSelecionado] = useState(null);
  const [textoTemporario, setTextoTemporario] = useState('');
  const [placeholderFieldMainCity, setPlaceholderFieldMainCity] = useState('');
  const [isEditable, setIsEditable] = useState(true);
  const [alternateCityToOrder, setAlternateCityToOrder] = useState('none');
  const [alternateOrderToCity, setAlternateOrderToCity] = useState('none');
  const [textoValorSeguro, setTextoValorSeguro] = useState('');

  const cityInputRef = useRef(null);
  const seguroInputRef = useRef(null);

  useEffect(() => {
    const origemSalva = ResultadosBuscaSessionStore.getOrigem?.();
    const destinoSalvo = ResultadosBuscaSessionStore.getDestino?.();
    const cargaSalva = ResultadosBuscaSessionStore.getCarga?.();
    // Declarado como 'seguroSalvo' para manter a consistência com os outros campos
    const seguroSalvo =
      ResultadosBuscaSessionStore.getValorSeguro?.() ||
      ResultadosBuscaSessionStore.getSeguro?.() ||
      '';

    if (origemSalva) {
      setSaindoDe(origemSalva);
      setColorTextSaindoDe('rgba(85, 85, 85, 0.7)');
    }
    if (destinoSalvo) {
      setIndoPara(destinoSalvo);
      setColorTextIndoPara('rgba(85, 85, 85, 0.7)');
    }
    if (cargaSalva) {
      setTipoEncomenda(cargaSalva);
      setColorTextTipoEncomenda('rgba(85, 85, 85, 0.7)');
    }
    if (seguroSalvo) {
      setValorSeguro(
        seguroSalvo.startsWith('R$') ? seguroSalvo : `R$ ${seguroSalvo}`,
      );
      setColorTextValorSeguro('rgba(85, 85, 85, 0.7)');
    }
  }, []);

  // Ações de Abertura das Modais
  const abrirModal = campo => {
    setCampoSelecionado(campo);
    if (campo === 'saindoDe' || campo === 'indoPara') {
      setIsEditable(true);
      setTextoTemporario('');
      setPlaceholderFieldMainCity('Digite aqui');
      setAlternateCityToOrder('none');
      setAlternateOrderToCity('flex');
    } else if (campo === 'tipoEncomenda') {
      setIsEditable(false);
      setTextoTemporario('');
      setPlaceholderFieldMainCity('Selecione o tipo de encomenda');
      setAlternateCityToOrder('flex');
      setAlternateOrderToCity('none');
    }
    setModalVisible(true);
  };

  const abrirModalValorSeguro = () => {
    if (
      ResultadosBuscaSessionStore.getCarga?.() !== 'Pequeno, estilo envelope'
    ) {
      setModalValorSeguro(true);
    }
  };

  // Handlers de Seleção
  const handleCitySelect = cidadeSelecionada => {
    Keyboard.dismiss();
    if (campoSelecionado === 'saindoDe') {
      ResultadosBuscaSessionStore.setOrigem?.(cidadeSelecionada);
      setSaindoDe(cidadeSelecionada);
      setColorTextSaindoDe('rgba(85, 85, 85, 0.7)');
    } else if (campoSelecionado === 'indoPara') {
      ResultadosBuscaSessionStore.setDestino?.(cidadeSelecionada);
      setIndoPara(cidadeSelecionada);
      setColorTextIndoPara('rgba(85, 85, 85, 0.7)');
    }
    setTextoTemporario('');
    setModalVisible(false);
  };

  const saveOrder = encomendaSelecionada => {
    if (campoSelecionado === 'tipoEncomenda') {
      setValorSeguro('Seguro');
      setColorTextValorSeguro('rgba(85, 85, 85, 0.7)');

      if (encomendaSelecionada === 'Pequeno, estilo envelope') {
        setShowWarningEnvelopeModal(true);
        setErroValorSeguro(false);
        setValorSeguro('R$ 0,00');
        ResultadosBuscaSessionStore.setValorSeguro?.('0,00');
      }

      ResultadosBuscaSessionStore.setCarga?.(encomendaSelecionada);
      setTipoEncomenda(encomendaSelecionada);
      setColorTextTipoEncomenda('rgba(85, 85, 85, 0.7)');
    }
    setModalVisible(false);
  };

  const handleChangeValorSeguro = texto => {
    const somenteNumeros = texto.replace(/\D/g, '');
    if (!somenteNumeros) {
      setTextoValorSeguro('');
      return;
    }
    const numero = Number(somenteNumeros) / 100;
    const valorFormatado = numero.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    setTextoValorSeguro(valorFormatado);
  };

  const salvarValorSeguro = () => {
    if (textoValorSeguro !== '') {
      ResultadosBuscaSessionStore.setValorSeguro?.(textoValorSeguro);
      setValorSeguro('R$ ' + textoValorSeguro);
      setTextoValorSeguro('');
      setColorTextValorSeguro('rgba(85, 85, 85, 0.7)');
    }
    setModalValorSeguro(false);
  };

  // Execução da Busca
  const handleProcurarMala = async () => {
    const valSaindoDe = String(saindoDe || '').trim();
    const valIndoPara = String(indoPara || '').trim();
    const valTipoEncomenda = String(tipoEncomenda || '').trim();
    const valValorSeguro = String(valorSeguro || '').trim();

    const isSaindoDeVazio = !valSaindoDe || valSaindoDe === 'Origem';
    const isIndoParaVazio = !valIndoPara || valIndoPara === 'Destino';
    const isTipoEncomendaVazio =
      !valTipoEncomenda || valTipoEncomenda === 'Encomenda';
    const isValorSeguroVazio = !valValorSeguro || valValorSeguro === 'Seguro';

    setErroSaindoDe(isSaindoDeVazio);
    setErroIndoPara(isIndoParaVazio);
    setErroTipoEncomenda(isTipoEncomendaVazio);
    setErroValorSeguro(isValorSeguroVazio);

    if (
      isSaindoDeVazio ||
      isIndoParaVazio ||
      isTipoEncomendaVazio ||
      isValorSeguroVazio
    ) {
      setShowErrorModal(true); // Exibe a modal interna de erro
      if (onError) onError();
      return;
    }

    setLoading(true);

    try {
      const coordsOrigem = await getCoordinatesFromAddress(saindoDe);
      const coordsDestino = await getCoordinatesFromAddress(indoPara);

      const payloadBusca = {
        origem: saindoDe,
        destino: indoPara,
        encomenda: tipoEncomenda,
        seguro: valorSeguro,
        origem_lat: coordsOrigem?.latitude || -3.1190275,
        origem_lng: coordsOrigem?.longitude || -60.0217314,
        destino_lat: coordsDestino?.latitude || -23.3197305,
        destino_lng: coordsDestino?.longitude || -51.1662008,
      };

      if (onSearch) {
        onSearch(payloadBusca);
      } else if (onNavigate) {
        onNavigate('ResultadosBusca', payloadBusca);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.containerBuscaViagensMain}>
      {/* CAMPO: SAINDO DE */}
      <TouchableOpacity
        onPress={() => {
          setErroSaindoDe(false);
          abrirModal('saindoDe');
        }}
        style={[
          styles.input,
          {
            marginTop: 8,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: erroSaindoDe ? '#ff4d4f' : '#11b9a3',
          },
        ]}>
        <MaterialIcon
          name="place"
          size={22}
          color="#11b9a3"
          style={{marginRight: 5, paddingTop: 3}}
        />
        <Text
          style={{
            fontSize: 14,
            fontFamily: 'Montserrat-Bold',
            color: colorTextSaindoDe,
            paddingTop: 5,
            flex: 1,
          }}>
          {saindoDe.length > 30 ? `${saindoDe.substring(0, 30)}...` : saindoDe}
        </Text>
      </TouchableOpacity>

      {/* CAMPO: INDO PARA */}
      <TouchableOpacity
        onPress={() => {
          setErroIndoPara(false);
          abrirModal('indoPara');
        }}
        style={[
          styles.input,
          {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: erroIndoPara ? '#ff4d4f' : '#11b9a3',
          },
        ]}>
        <MaterialIcon
          name="place"
          size={22}
          color="#11b9a3"
          style={{marginRight: 5, paddingTop: 3}}
        />
        <Text
          style={{
            fontSize: 14,
            fontFamily: 'Montserrat-Bold',
            color: colorTextIndoPara,
            paddingTop: 5,
            flex: 1,
          }}>
          {indoPara.length > 30 ? `${indoPara.substring(0, 30)}...` : indoPara}
        </Text>
      </TouchableOpacity>

      {/* CAMPO: TIPO ENCOMENDA */}
      <TouchableOpacity
        onPress={() => {
          setErroTipoEncomenda(false);
          abrirModal('tipoEncomenda');
        }}
        style={[
          styles.input,
          {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: erroTipoEncomenda ? '#ff4d4f' : '#11b9a3', 
          },
        ]}>
        <MaterialIcon
          name="inventory"
          size={22}
          color="#11b9a3"
          style={{marginRight: 7, paddingTop: 3}}
        />
        <Text
          style={{
            fontSize: 14,
            fontFamily: 'Montserrat-Bold',
            color: colorTextTipoEncomenda,
            paddingTop: 5,
            flex: 1,
          }}>
          {tipoEncomenda.length > 29
            ? `${tipoEncomenda.substring(0, 29)}...`
            : tipoEncomenda}
        </Text>
      </TouchableOpacity>

      {/* CAMPO: VALOR SEGURO */}
      <TouchableOpacity
        onPress={() => {
          setErroValorSeguro(false);
          abrirModalValorSeguro();
        }}
        style={[
          styles.input,
          {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: erroValorSeguro ? '#ff4d4f' : '#11b9a3',
          },
        ]}>
        <MaterialIcon
          name="verified-user"
          size={20}
          color="#11b9a3"
          style={{marginRight: 5}}
        />
        <Text
          style={{
            fontSize: 14,
            fontFamily: 'Montserrat-Bold',
            color: colorTextValorSeguro,
            paddingTop: 2,
            flex: 1,
          }}>
          {valorSeguro}
        </Text>
      </TouchableOpacity>

      {/* BOTÃO: PROCURAR MALA */}
      <TouchableOpacity
        onPress={handleProcurarMala}
        disabled={loading}
        activeOpacity={0.8}
        style={[
          styles.button,
          {borderRadius: 999, backgroundColor: '#1a7fe7', overflow: 'hidden'},
        ]}>
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          colors={['#1a7fe7', '#19c4c9']}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 5,
            height: '100%',
            borderRadius: 999,
            width: '100%',
          }}>
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text
                style={[
                  styles.buttonText,
                  {fontFamily: 'Montserrat-Bold', fontSize: 13},
                ]}>
                ENVIAR ENCOMENDA
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* ==================== TODAS AS MODAIS REUNIDAS AQUI ==================== */}

      {/* 1. MODAL SELEÇÃO CIDADES / ENCOMENDA */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
        onShow={() => {
          if (campoSelecionado !== 'tipoEncomenda') {
            setTimeout(() => {
              cityInputRef.current?.focus();
            }, 300);
          }
        }}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalBox}>
                {/* Título da Modal */}
                <Text
                  style={{
                    position: 'absolute',
                    marginTop: 17,
                    fontSize: 15,
                    marginLeft: 20,
                    fontFamily: 'Montserrat-Regular',
                    color: 'rgba(0, 0, 0, 0.6)',
                  }}>
                  {campoSelecionado === 'saindoDe'
                    ? 'Cidade de origem'
                    : campoSelecionado === 'indoPara'
                    ? 'Cidade de destino'
                    : 'Tipo de encomenda'}
                </Text>

                {/* Botão Fechar */}
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={{bottom: 10, alignSelf: 'flex-end'}}>
                  <MaterialIcon
                    name="close"
                    size={33}
                    color="rgba(127, 127, 127, 0.8)"
                  />
                </TouchableOpacity>

                {/* Campo de Entrada (Apenas para Cidades) */}
                {campoSelecionado !== 'tipoEncomenda' && (
                  <TextInput
                    ref={cityInputRef}
                    value={textoTemporario}
                    onChangeText={setTextoTemporario}
                    editable={isEditable}
                    style={[
                      styles.modalInput,
                      {
                        backgroundColor: '#fff',
                        paddingLeft: 15,
                        color: 'rgba(0, 0, 0, 0.5)',
                        borderRadius: 10,
                        height: 45,
                        fontSize: 15,
                        fontFamily: 'Montserrat-Regular',
                        borderWidth: 0,
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 2},
                        shadowOpacity: 0.2,
                        shadowRadius: 3,
                        elevation: 4,
                      },
                    ]}
                    placeholder={placeholderFieldMainCity || 'Digite aqui'}
                  />
                )}

                {/* Busca de Cidades Google Maps */}
                {campoSelecionado !== 'tipoEncomenda' && (
                  <View style={{width: '100%'}}>
                    <SearchAllCityGoogleMaps
                      inputText={textoTemporario}
                      onCitySelect={handleCitySelect}
                    />
                  </View>
                )}

                {/* Lista de Tipos de Encomenda */}
                {campoSelecionado === 'tipoEncomenda' && (
                  <View style={{width: '100%', marginTop: 10}}>
                    {[
                      'Pequeno, estilo envelope',
                      'Caixa de Sapato/Sacola',
                      'Mochila/Mala',
                      'Mala/Caixa',
                    ].map(item => (
                      <TouchableOpacity
                        key={item}
                        onPress={() => saveOrder(item)}
                        activeOpacity={0.7}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: '#ffffff',
                          paddingVertical: 14,
                          paddingHorizontal: 16,
                          borderRadius: 10,
                          marginBottom: 10,
                          shadowColor: '#000',
                          shadowOffset: {width: 0, height: 2},
                          shadowOpacity: 0.15,
                          shadowRadius: 3,
                          elevation: 3,
                        }}>
                        <MaterialIcon name="redeem" size={24} color="#00a8e8" />
                        <Text
                          style={{
                            fontSize: 14,
                            fontFamily: 'Montserrat-Bold',
                            color: '#2d3748',
                            marginLeft: 12,
                          }}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 2. MODAL VALOR DO SEGURO */}
      <Modal
        visible={modalValorSeguro}
        transparent
        animationType="fade"
        onRequestClose={() => setModalValorSeguro(false)}
        onShow={() => seguroInputRef.current?.focus()}>
        <TouchableWithoutFeedback onPress={() => setModalValorSeguro(false)}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  width: '90%',
                  backgroundColor: '#fff',
                  borderRadius: 24,
                  overflow: 'hidden',
                  elevation: 10,
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 4},
                  shadowOpacity: 0.25,
                  shadowRadius: 10,
                }}>
                {/* CABEÇALHO COM DEGRADÊ */}
                <LinearGradient
                  start={{x: 0, y: 0.5}}
                  end={{x: 1, y: 0.5}}
                  colors={['#1a7fe7', '#19c4c9']}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 18,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  {/* ÍCONE DE ESCUDO */}
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12,
                    }}>
                    <MaterialIcon name="verified-user" size={24} color="#fff" />
                  </View>

                  <View style={{flex: 1}}>
                    <Text
                      style={{
                        fontSize: 17,
                        fontFamily: 'Montserrat-Bold',
                        color: '#fff',
                        lineHeight: 22,
                      }}>
                      O que é o Valor do Seguro
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: 'Montserrat-Regular',
                        color: '#ffffff',
                        marginTop: 2,
                      }}>
                      Proteção extra com valor definido por você
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => setModalValorSeguro(false)}
                    style={{padding: 4}}>
                    <MaterialIcon name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                </LinearGradient>

                {/* CORPO DA MODAL */}
                <View style={{paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24}}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: 'Montserrat-Bold',
                      color: 'rgba(0, 0, 0, 0.5)',
                      lineHeight: 23,
                      marginBottom: 20,
                    }}>
                    O valor do seguro é um valor que você atribui a sua encomenda e que receberá em caso de extravio ou danificações. Como este valor será reservado do cartão de crédito do viajante "carteiro", aconselhamos ser justo a fim de não inviabilizar o interesse dele em levar.
                  </Text>

                  {/* CARD DE INPUT (BORDA E FUNDO) */}
                  <View
                    style={{
                      backgroundColor: '#f8fdfd',
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: '#cceeee',
                      padding: 16,
                      marginBottom: 24,
                    }}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: 'Montserrat-Bold',
                        color: '#0e7090',
                        letterSpacing: 0.5,
                        marginBottom: 10,
                      }}>
                      VALOR DO SEGURO
                    </Text>

                    <TextInput
                      ref={seguroInputRef}
                      value={textoValorSeguro ? `R$ ${textoValorSeguro}` : ''}
                      onChangeText={handleChangeValorSeguro}
                      keyboardType="numeric"
                      placeholder="R$ 0,00"
                      placeholderTextColor="#a0aec0"
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: 14,
                        height: 52,
                        paddingHorizontal: 16,
                        fontSize: 16,
                        fontFamily: 'Montserrat-Bold',
                        color: '#2d3748',
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 2},
                        shadowOpacity: 0.05,
                        shadowRadius: 5,
                        elevation: 2,
                      }}
                    />
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <TouchableOpacity
                      style={{
                        width: '46%',
                        height: 48,
                        borderRadius: 999,
                        backgroundColor: '#eaf0f0',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      onPress={() => setModalValorSeguro(false)}>
                      <Text
                        style={{
                          color: '#2d3748',
                          fontSize: 15,
                          fontFamily: 'Montserrat-Bold',
                        }}>
                        Cancelar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={{
                        width: '50%',
                        height: 48,
                        borderRadius: 999,
                        overflow: 'hidden',
                      }}
                      onPress={salvarValorSeguro}>
                      <LinearGradient
                        start={{x: 0, y: 0.5}}
                        end={{x: 1, y: 0.5}}
                        colors={['#1a7fe7', '#19c4c9']}
                        style={{
                          width: '100%',
                          height: '100%',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 15,
                            fontFamily: 'Montserrat-Bold',
                          }}>
                          Assegurar
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 3. MODAL ALERTA ENVELOPE */}
      <Modal
        visible={showWarningEnvelopeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWarningEnvelopeModal(false)}>
        <TouchableWithoutFeedback
          onPress={() => setShowWarningEnvelopeModal(false)}>
          <View
            style={[
              styles.overlay,
              {
                flex: 1,
                justifyContent: 'flex-end',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
              },
            ]}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  backgroundColor: '#fff',
                  width: '100%',
                  padding: 25,
                  borderRadius: 15,
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 16,
                    lineHeight: 24,
                    color: '#353738',
                    fontFamily: 'Montserrat-Regular',
                    textAlign: 'center',
                    marginBottom: 20,
                  }}>
                  Envio de encomendas de documentos, por não ter valor
                  comercial, não terá reembolso em casos raríssimos de extravio.
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#0c9fe3',
                    borderRadius: 8,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                  }}
                  onPress={() => setShowWarningEnvelopeModal(false)}>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 15,
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

      {/* 4. MODAL DE ERRO DE PREENCHIMENTO */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}>
        <TouchableWithoutFeedback onPress={() => setShowErrorModal(false)}>
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
                    fontSize: 19,
                    fontFamily: 'Montserrat-Bold',
                    color: '#353738',
                    marginBottom: 8,
                  }}>
                  Atenção
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: 'Montserrat-Regular',
                    textAlign: 'center',
                    color: '#353738',
                    marginBottom: 20,
                  }}>
                  Preencha todos os campos para encontrar a mala!
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#0c9fe3',
                    borderRadius: 8,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    elevation: 4,
                  }}
                  onPress={() => setShowErrorModal(false)}>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 15,
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
    </View>
  );
};

export default Search;
