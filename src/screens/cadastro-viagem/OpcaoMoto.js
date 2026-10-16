import React, {useState, useEffect, useRef} from 'react';
import {
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LocalizacaoAtual from '../../components/localizacaoAtual/LocalizacaoAtual';
import Header from '../../components/header/Header';
import SidebarLandingPage from '../../components/sidebarDashboard/SidebarLandingPage';
import MapView, {Marker, Polyline} from 'react-native-maps';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import SearchCities from '../../components/searchCities/SearchCities';
import Config from 'react-native-config';
import styles from './CadastroViagem.styles';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getSecureData} from '../../utils/secureStorage';
import {
  saveToGlobalState,
  getStoredData,
  removeSpecificData,
  clearAppState,
} from '../../utils/storage';

const OpcaoMoto = () => {
  const navigation = useNavigation();
  const [tecladoAtivo, setTecladoAtivo] = useState(false);
  const mapRef = useRef(null);
  const inputRef = useRef(null);

  const [showAlertTravelModal, setShowAlertTravelModal] = useState(false);
  const [showMsgTravelModal, setShowMsgTravelModal] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [campoSelecionado, setCampoSelecionado] = useState(null);
  const [textoTemporario, setTextoTemporario] = useState('');
  const [saindoDe, setSaindoDe] = useState('Qual cidade você irá retornar:');
  const [indoPara, setIndoPara] = useState('Qual cidade será o destino:');
  const [origemCoords, setOrigemCoords] = useState(null);
  const [destinoCoords, setDestinoCoords] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [dadosArmazenados, setDadosArmazenados] = useState(null);

  const buscarRotaGoogle = async () => {
    if (!origemCoords || !destinoCoords) return;

    const origin = `${origemCoords.lat},${origemCoords.lng}`;
    const destination = `${destinoCoords.lat},${destinoCoords.lng}`;
    const apiKey = Config.GOOGLE_API_KEY;

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}&mode=driving`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes.length) {
        const points = decodePolyline(data.routes[0].overview_polyline.points);
        const coords = points.map(([lat, lng]) => ({
          latitude: lat,
          longitude: lng,
        }));
        setRouteCoords(coords);
      } else {
        console.warn('Nenhuma rota encontrada');
      }
    } catch (error) {
      console.error('Erro ao buscar rota:', error);
    }
  };

  const decodePolyline = encoded => {
    let polyline = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      polyline.push([lat / 1e5, lng / 1e5]);
    }
    return polyline;
  };

  const handleCitySelect = async item => {
    const cidadeSelecionada = item.name;
    const location = item.geometry?.location;
    const cidadeMain = item.city || cidadeSelecionada.split(',')[0];
    if (!location) {
      //Alert.alert('Erro', 'Coordenadas não encontradas.');
      return;
    }

    try {
      if (campoSelecionado === 'saindoDe') {
        setRouteCoords([]);
        setSaindoDe(cidadeSelecionada);
        setOrigemCoords(location);

        await saveToGlobalState({
          cidade_origem: cidadeSelecionada,
          lat_cidade_origem: location.lat.toFixed(7),
          lng_cidade_origem: location.lng.toFixed(7),
          cidade_origem_main: `${cidadeMain}, Brasil`,
          pais_origem: 'Brasil',
        });
      } else if (campoSelecionado === 'indoPara') {
        setRouteCoords([]);
        setIndoPara(cidadeSelecionada);
        setDestinoCoords(location);

        await saveToGlobalState({
          cidade_destino: cidadeSelecionada,
          lat_cidade_destino: location.lat.toFixed(7),
          lng_cidade_destino: location.lng.toFixed(7),
          cidade_destino_main: `${cidadeMain}, Brasil`,
          pais_destino: 'Brasil',
        });
      }
    } catch (error) {
      console.error('Erro ao salvar dados na sessão:', error);
    }

    setTextoTemporario('');
    setModalVisible(false);
  };

  const abrirModal = campo => {
    setCampoSelecionado(campo);
    setTextoTemporario('');
    setModalVisible(true);
  };

  const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
  const maxWidth = 600;
  const nextStep = () => currentStep < 2 && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const getDestinoRegion = () => {
    if (origemCoords && destinoCoords) {
      return {
        latitude: (origemCoords.lat + destinoCoords.lat) / 2,
        longitude: (origemCoords.lng + destinoCoords.lng) / 2,
        latitudeDelta: Math.abs(origemCoords.lat - destinoCoords.lat) + 2,
        longitudeDelta: Math.abs(origemCoords.lng - destinoCoords.lng) + 2,
      };
    } else if (origemCoords) {
      return {
        latitude: origemCoords.lat,
        longitude: origemCoords.lng,
        latitudeDelta: 1,
        longitudeDelta: 1,
      };
    }
    return {
      latitude: -23.55052,
      longitude: -46.633308,
      latitudeDelta: 5,
      longitudeDelta: 5,
    };
  };

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
    const carregarSessao = async () => {
      try {
        const {
          lat_cidade_origem: latOrigem,
          lng_cidade_origem: lngOrigem,
          cidade_origem: cidadeOrigem,

          lat_cidade_destino: latDestino,
          lng_cidade_destino: lngDestino,
          cidade_destino: cidadeDestino,
        } = await getStoredData();

        if (latOrigem && lngOrigem && cidadeOrigem) {
          setOrigemCoords({
            lat: parseFloat(latOrigem),
            lng: parseFloat(lngOrigem),
          });
          setSaindoDe(cidadeOrigem);
        }

        if (latDestino && lngDestino && cidadeDestino) {
          setDestinoCoords({
            lat: parseFloat(latDestino),
            lng: parseFloat(lngDestino),
          });
          setIndoPara(cidadeDestino);
        }
      } catch (error) {
        console.error('Erro ao carregar dados da sessão:', error);
      }
    };

    carregarSessao();
  }, []);

  useEffect(() => {
    if (origemCoords && destinoCoords) {
      mapRef.current?.fitToCoordinates(
        [
          {latitude: origemCoords.lat, longitude: origemCoords.lng},
          {latitude: destinoCoords.lat, longitude: destinoCoords.lng},
        ],
        {
          edgePadding: {top: 100, right: 100, bottom: 100, left: 100},
          animated: true,
        },
      );
    }
  }, [origemCoords, destinoCoords]);

  useEffect(() => {
    if (origemCoords && destinoCoords) {
      buscarRotaGoogle();
    }
  }, [origemCoords, destinoCoords]);

  const voltar = async () => {
    const {editando_viagem, voltando_trajeto} = await getStoredData();

    if (editando_viagem === 'sim') {
      navigation.navigate('DashboardAvailable');
      return;
    }

    if (voltando_trajeto === 'sim') {
      navigation.navigate('DashboardAvailable');
    } else {
      navigation.navigate('QualMeioTransporteCadastramento');
    }
  };

  const atualizarDadosArmazenados = async () => {
    try {
      const {
        cidade_origem: cidadeOrigem,
        lat_cidade_origem: latOrigem,
        lng_cidade_origem: lngOrigem,
        cidade_origem_main: cidadeOrigemMain,
        pais_origem: paisOrigem,

        cidade_destino: cidadeDestino,
        lat_cidade_destino: latDestino,
        lng_cidade_destino: lngDestino,
        cidade_destino_main: cidadeDestinoMain,
        pais_destino: paisDestino,
      } = await getStoredData();

      setDadosArmazenados({
        cidadeOrigem,
        latOrigem,
        lngOrigem,
        cidadeOrigemMain,
        paisOrigem,
        cidadeDestino,
        latDestino,
        lngDestino,
        cidadeDestinoMain,
        paisDestino,
      });
    } catch (error) {
      console.error('Erro ao ler dados do estado armazenado:', error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <Text
              style={{
                fontFamily: 'Montserrat-Bold',
                color: 'rgba(8, 77, 110, 1)',
                fontSize: 14,
              }}>
              QUAL CIDADE IRÁ SAIR?
            </Text>
            <TouchableOpacity
              onPress={() => abrirModal('saindoDe')}
              style={[styles.input, {marginTop: 8, paddingLeft: 15}]}>
              <Text
                style={{
                  marginTop: 14,
                  fontSize: 14,
                  fontFamily: 'Montserrat-Regular',
                  color: '#353738',
                }}>
                {saindoDe}
              </Text>
            </TouchableOpacity>
            <MapView
              style={{
                height: screenHeight * 0.45,
                marginTop: 10,
                borderRadius: 10,
              }}
              region={{
                latitude: origemCoords?.lat || -23.55052,
                longitude: origemCoords?.lng || -46.633308,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              }}>
              {origemCoords && (
                <Marker
                  coordinate={{
                    latitude: origemCoords.lat,
                    longitude: origemCoords.lng,
                  }}
                  title={saindoDe.replace(
                    'Qual cidade você irá retornar: ',
                    '',
                  )}
                  tracksViewChanges={false}>
                  <View style={styles.customMarker}>
                    <Text style={styles.customMarkerText}>A</Text>
                  </View>
                </Marker>
              )}
            </MapView>
          </>
        );

      case 2:
        return (
          <>
            <Text
              style={{
                fontFamily: 'Montserrat-Bold',
                color: 'rgba(8, 77, 110, 1)',
                fontSize: 14,
              }}>
              QUAL CIDADE SERÁ O DESTINO?
            </Text>
            <TouchableOpacity
              onPress={() => abrirModal('indoPara')}
              style={[styles.input, {marginTop: 8, paddingLeft: 15}]}>
              <Text
                style={{
                  marginTop: 14,
                  fontSize: 14,
                  fontFamily: 'Montserrat-Regular',
                  color: '#353738',
                }}>
                {indoPara}
              </Text>
            </TouchableOpacity>
            <MapView
              ref={mapRef}
              style={{
                height: screenHeight * 0.45,
                marginTop: 10,
                borderRadius: 10,
              }}
              region={getDestinoRegion()}>
              {origemCoords && (
                <Marker
                  coordinate={{
                    latitude: origemCoords.lat,
                    longitude: origemCoords.lng,
                  }}
                  title={saindoDe.replace(
                    'Qual cidade você irá retornar: ',
                    '',
                  )}
                  tracksViewChanges={false}>
                  <View style={styles.customMarker}>
                    <Text style={styles.customMarkerText}>A</Text>
                  </View>
                </Marker>
              )}
              {destinoCoords && (
                <Marker
                  coordinate={{
                    latitude: destinoCoords.lat,
                    longitude: destinoCoords.lng,
                  }}
                  title={indoPara.replace('Qual cidade será o destino: ', '')}
                  tracksViewChanges={false}>
                  <View style={styles.customMarker}>
                    <Text style={styles.customMarkerText}>B</Text>
                  </View>
                </Marker>
              )}
              {routeCoords.length >= 2 && (
                <Polyline
                  coordinates={routeCoords}
                  strokeColor="#0c9fe3"
                  strokeWidth={4}
                />
              )}
            </MapView>
          </>
        );

      default:
        return null;
    }
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
      <View
        style={{flex: 1, alignItems: 'center', backgroundColor: '#f0eded'}}>
        <LocalizacaoAtual />
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
          onShow={() => {
            setTimeout(() => {
              inputRef.current?.focus();
              setTecladoAtivo(true);
            }, 1000);
          }}>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.overlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalBox}>
                  <Text
                    style={{
                      position: 'absolute',
                      marginTop: 17,
                      fontSize: 16,
                      marginLeft: 20,
                      fontFamily: 'Montserrat-Regular',
                      color: 'rgba(0, 0, 0, 0.6)',
                    }}>
                    {campoSelecionado === 'saindoDe'
                      ? 'Qual cidade você irá retornar:'
                      : 'Qual cidade será o destino:'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={{bottom: 10, alignSelf: 'flex-end'}}>
                    <MaterialIcon
                      name="close"
                      size={33}
                      color="rgba(127, 127, 127, 0.8)"
                    />
                  </TouchableOpacity>
                  <TextInput
                    ref={inputRef}
                    value={textoTemporario}
                    onChangeText={setTextoTemporario}
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
                    placeholder="Digite aqui"
                    caretHidden={!tecladoAtivo}
                  />
                  <SearchCities
                    inputText={textoTemporario}
                    onCitySelect={handleCitySelect}
                  />
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

        {/*<TouchableOpacity
          onPress={atualizarDadosArmazenados}
          style={{
            marginTop: 20,
            backgroundColor: '#0c9fe3',
            padding: 10,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontFamily: 'Montserrat-Bold' }}>Atualizar Dados Salvos</Text>
        </TouchableOpacity>

        {dadosArmazenados && (
          <View style={{ marginTop: 15 }}>
            <Text style={{ fontWeight: 'bold' }}>Origem:</Text>
            <Text>Cidade: {dadosArmazenados.cidadeOrigem}</Text>
            <Text>Latitude: {dadosArmazenados.latOrigem}</Text>
            <Text>Longitude: {dadosArmazenados.lngOrigem}</Text>
            <Text>Cidade Main: {dadosArmazenados.cidadeOrigemMain}</Text>
            <Text>País: {dadosArmazenados.paisOrigem}</Text>

            <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Destino:</Text>
            <Text>Cidade: {dadosArmazenados.cidadeDestino}</Text>
            <Text>Latitude: {dadosArmazenados.latDestino}</Text>
            <Text>Longitude: {dadosArmazenados.lngDestino}</Text>
            <Text>Cidade Main: {dadosArmazenados.cidadeDestinoMain}</Text>
            <Text>País: {dadosArmazenados.paisDestino}</Text>
          </View>
        )}*/}

        <View
          style={[
            styles.container,
            {
              width:
                screenWidth * 0.9 > maxWidth ? maxWidth : screenWidth * 0.9,
            },
          ]}>
          <View style={{marginTop: 10}}>{renderStepContent()}</View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 20,
            }}>
            {currentStep === 1 ? (
              // Etapa 1: Botão "Voltar" leva para tela anterior
              <>
                <TouchableOpacity
                  style={[styles.botaoVoltar, {width: '48%'}]}
                  onPress={voltar}>
                  <Text style={styles.textoBotaoVoltar}>Voltar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.botaoContinuar,
                    {width: '48%', marginLeft: 10},
                  ]}
                  onPress={() => {
                    if (!origemCoords) {
                      setShowMsgTravelModal(
                        'Por favor, selecione a cidade de origem antes de continuar.',
                      );
                      setShowAlertTravelModal(true);
                      return;
                    }
                    nextStep();
                  }}>
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
                    <Text style={styles.buttonText}>Continuar</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              // Etapa 2: Botões normais
              <>
                <TouchableOpacity
                  style={[styles.botaoVoltar, {width: '48%'}]}
                  onPress={prevStep}>
                  <Text style={styles.textoBotaoVoltar}>Voltar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.botaoContinuar,
                    {width: '48%', marginLeft: 10},
                  ]}
                  onPress={() => {
                    if (!destinoCoords) {
                      setShowMsgTravelModal(
                        'Por favor, selecione a cidade de destino antes de continuar.',
                      );
                      setShowAlertTravelModal(true);
                      return;
                    }
                    navigation.navigate('DataHoraViagem');
                  }}>
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
                    <Text style={styles.buttonText}>Continuar</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
      <View style={{marginTop: -10}}>
        <Header />
      </View>
      </SafeAreaView>
    </>
  );
};

export default OpcaoMoto;
