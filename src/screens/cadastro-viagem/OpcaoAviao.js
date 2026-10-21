import React, {useState, useRef, useEffect} from 'react';
import {
  Modal,
  TextInput,
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LocalizacaoAtual from '../../components/localizacaoAtual/LocalizacaoAtual';
import Header from '../../components/header/Header';
import SidebarLandingPage from '../../components/sidebarDashboard/SidebarLandingPage';
import SearchAirports from '../../components/searchAirports/SearchAirports';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import MapView, {Marker, Polyline} from 'react-native-maps';
import styles from './CadastroViagem.styles';
import Config from 'react-native-config';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getSecureData} from '../../utils/secureStorage';
import {
  saveToGlobalState,
  getStoredData,
  removeSpecificData,
  clearAppState,
} from '../../utils/storage';

// Dicionário de mapeamento de aeroportos para as cidades principais corretas
const AIRPORT_CITY_MAP = [
  { match: ["nat", "natal", "sao goncalo do amarante"], city: "Natal" },
  { match: ["jpa", "joao pessoa", "bayeux"], city: "João Pessoa" },
  { match: ["gru", "guarulhos"], city: "São Paulo" },
  { match: ["cgh", "congonhas"], city: "São Paulo" },
  { match: ["vcp", "viracopos", "campinas"], city: "Campinas" },
  { match: ["gig", "galeao"], city: "Rio de Janeiro" },
  { match: ["sdu", "santos dumont"], city: "Rio de Janeiro" },
  { match: ["cnf", "confins", "pampulha"], city: "Belo Horizonte" },
  { match: ["poa", "porto alegre"], city: "Porto Alegre" },
  { match: ["cwb", "curitiba"], city: "Curitiba" },
  { match: ["fln", "florianopolis"], city: "Florianópolis" },
  { match: ["bsb", "brasilia"], city: "Brasília" },
  { match: ["gyn", "goiania"], city: "Goiânia" },
  { match: ["rec", "recife"], city: "Recife" },
  { match: ["ssa", "salvador"], city: "Salvador" },
  { match: ["for", "fortaleza"], city: "Fortaleza" },
  { match: ["mcz", "maceio"], city: "Maceió" },
  { match: ["aju", "aracaju"], city: "Aracaju" },
  { match: ["slz", "sao luis"], city: "São Luís" },
  { match: ["mao", "manaus"], city: "Manaus" },
  { match: ["bel", "belem"], city: "Belém" },
];

function normalizeText(text = "") {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Tenta descobrir a cidade através do nome do aeroporto, morada ou termos mapeados
function getCityFromMap(name = "", address = "") {
  const text = ` ${normalizeText(name)} ${normalizeText(address)} `;

  for (const item of AIRPORT_CITY_MAP) {
    if (
      item.match.some((term) => {
        const t = ` ${normalizeText(term)} `;
        return text.includes(t);
      })
    ) {
      return item.city;
    }
  }
  return null;
}

// Extrai a cidade correta dos address_components do Google Geocoding
function getCityFromAddressComponents(components = []) {
  const locality = components.find((c) => c.types?.includes("locality"));
  const admin2 = components.find((c) => c.types?.includes("administrative_area_level_2"));
  const admin1 = components.find((c) => c.types?.includes("administrative_area_level_1"));

  return locality?.long_name || admin2?.long_name || admin1?.long_name || "";
}

const OpcaoAviao = () => {
  const navigation = useNavigation();
  const [tecladoAtivo, setTecladoAtivo] = useState(false);
  const [showAlertTravelModal, setShowAlertTravelModal] = useState(false);
  const [showMsgTravelModal, setShowMsgTravelModal] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitleMain, setModalTitleMain] = useState('');
  const [campoSelecionado, setCampoSelecionado] = useState(null);
  const [textoTemporario, setTextoTemporario] = useState('');
  const [saindoDe, setSaindoDe] = useState('Qual aeroporto você irá sair:');
  const [indoPara, setIndoPara] = useState('Qual aeroporto será o destino:');
  const [origemCoords, setOrigemCoords] = useState(null);
  const [destinoCoords, setDestinoCoords] = useState(null);
  const [dadosArmazenados, setDadosArmazenados] = useState(null);
  const mapRef = useRef(null);
  const inputRef = useRef(null);

  const handleCitySelect = async item => {
    if (!item.geometry?.location) {
      Alert.alert('Erro', 'Coordenadas não encontradas.');
      return;
    }

    const nomeAeroporto = item.name; // Ex: "Aeroporto Internacional de João Pessoa"
    const enderecoAeroporto = item.formatted_address || '';
    const {lat, lng} = item.geometry.location;

    let cidadeMain = 'Cidade não encontrada';
    let YOUR_API_KEY = Config.GOOGLE_API_KEY;

    try {
      const resp = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${YOUR_API_KEY}&language=pt`,
      );
      const json = await resp.json();

      if (json.status === 'OK' && json.results.length > 0) {
        // 1. Procura primeiro no mapa personalizado de aeroportos (Resolve João Pessoa/Bayeux e Natal/São Gonçalo)
        let mappedCity = null;
        for (const result of json.results) {
          mappedCity = getCityFromMap(nomeAeroporto, result.formatted_address);
          if (mappedCity) break;
        }

        if (mappedCity) {
          cidadeMain = `${mappedCity}, Brasil`;
        } else {
          // 2. Fallback para os componentes padrão do Google se não estiver no mapa manual
          for (const result of json.results) {
            const extractedCity = getCityFromAddressComponents(result.address_components);
            if (extractedCity) {
              cidadeMain = `${extractedCity}, Brasil`;
              break;
            }
          }
        }
      }
    } catch (err) {
      console.error('Erro no fetch de geocoding:', err);
      // Fallback de emergência baseado apenas no nome do aeroporto
      const emergencyCity = getCityFromMap(nomeAeroporto, enderecoAeroporto);
      if (emergencyCity) {
        cidadeMain = `${emergencyCity}, Brasil`;
      }
    }

    const tipoDestino = campoSelecionado === 'saindoDe' ? 'origem' : 'destino';

    // Salva a cidade principal tratada no estado global
    await saveToGlobalState({
      [`cidade_${tipoDestino}_main`]: cidadeMain,
    });

    if (campoSelecionado === 'saindoDe') {
      setSaindoDe(nomeAeroporto);
      setOrigemCoords({lat, lng});

      await saveToGlobalState({
        cidade_origem: nomeAeroporto,
        lat_cidade_origem: lat.toFixed(7),
        lng_cidade_origem: lng.toFixed(7),
        pais_origem: 'Brasil',
      });
    } else if (campoSelecionado === 'indoPara') {
      setIndoPara(nomeAeroporto);
      setDestinoCoords({lat, lng});

      await saveToGlobalState({
        cidade_destino: nomeAeroporto,
        lat_cidade_destino: lat.toFixed(7),
        lng_cidade_destino: lng.toFixed(7),
        pais_destino: 'Brasil',
      });
    }

    setTextoTemporario('');
    setModalVisible(false);
  };

  const abrirModal = campo => {
    setCampoSelecionado(campo);
    setTextoTemporario('');
    setModalTitleMain(
      campo === 'saindoDe'
        ? 'Qual Aeroporto você irá sair:'
        : 'Qual aeroporto será o destino:',
    );
    setModalVisible(true);
  };

  const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
  const maxWidth = 600;
  const [currentStep, setCurrentStep] = useState(1);
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
    const resetarCityInTraject = async () => {
      await saveToGlobalState({
        cidades_trajeto: [],
      });
    };

    resetarCityInTraject();
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
    if (origemCoords && destinoCoords && mapRef.current) {
      mapRef.current.fitToCoordinates(
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

  /*const voltar = async () => {
    if ((await AsyncStorage.getItem('editando_viagem')) == 'sim') {
      navigation.navigate('TravelerTripsAvailableNegotiations');
      return;
    }

    if ((await AsyncStorage.getItem('voltando_trajeto')) == 'sim') {
      navigation.navigate('TravelerTripsAvailableNegotiations');
    } else {
      navigation.navigate('QualMeioTransporteCadastramento');
    }
  };*/

  const voltar = async () => {
    const {editando_viagem, voltando_trajeto} = await getStoredData();

    if (editando_viagem === 'sim') {
      navigation.navigate('TravelerTripsAvailableNegotiations');
      return;
    }

    if (voltando_trajeto === 'sim') {
      navigation.navigate('TravelerTripsAvailableNegotiations');
    } else {
      navigation.navigate('QualMeioTransporteCadastramento');
    }
  };

  /*const atualizarDadosArmazenados = async () => {
    try {
      const cidadeOrigem = await AsyncStorage.getItem('cidade_origem');
      const latOrigem = await AsyncStorage.getItem('lat_cidade_origem');
      const lngOrigem = await AsyncStorage.getItem('lng_cidade_origem');
      const cidadeOrigemMain = await AsyncStorage.getItem('cidade_origem_main');
      const paisOrigem = await AsyncStorage.getItem('pais_origem');

      const cidadeDestino = await AsyncStorage.getItem('cidade_destino');
      const latDestino = await AsyncStorage.getItem('lat_cidade_destino');
      const lngDestino = await AsyncStorage.getItem('lng_cidade_destino');
      const cidadeDestinoMain = await AsyncStorage.getItem(
        'cidade_destino_main',
      );
      const paisDestino = await AsyncStorage.getItem('pais_destino');

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
      console.error('Erro ao ler dados do AsyncStorage:', error);
    }
  };*/

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
      console.error('Erro ao ler dados do estado global:', error);
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
              QUAL AEROPORTO VOCÊ IRÁ SAIR?
            </Text>
            <TouchableOpacity
              onPress={() => abrirModal('saindoDe')}
              style={[styles.input, {marginTop: 8, paddingLeft: 15}]}>
              <Text
                style={{
                  marginTop: 12,
                  fontSize: 14,
                  fontFamily: 'Montserrat-Regular',
                  color: '#353738',
                }}>
                {saindoDe}
              </Text>
            </TouchableOpacity>

            <MapView
              key={`${origemCoords?.lat}-${origemCoords?.lng}`}
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
              }}
              zoomEnabled={true}
              zoomControlEnabled={true}
              scrollEnabled={true}
              showsUserLocation={false}
              showsMyLocationButton={false}>
              {origemCoords && (
                <Marker
                  coordinate={{
                    latitude: origemCoords.lat,
                    longitude: origemCoords.lng,
                  }}
                  title={saindoDe.replace('Qual Aeroporto você irá sair: ', '')}
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
              QUAL AEROPORTO SERÁ O DESTINO?
            </Text>
            <TouchableOpacity
              onPress={() => abrirModal('indoPara')}
              style={[styles.input, {marginTop: 8, paddingLeft: 15}]}>
              <Text
                style={{
                  marginTop: 12,
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
              initialRegion={getDestinoRegion()}
              zoomEnabled={true}
              zoomControlEnabled={true}
              scrollEnabled={true}
              showsUserLocation={false}
              showsMyLocationButton={false}>
              {origemCoords && (
                <Marker
                  coordinate={{
                    latitude: origemCoords.lat,
                    longitude: origemCoords.lng,
                  }}
                  title={saindoDe.replace('Qual Aeroporto você irá sair: ', '')}
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
                  title={indoPara.replace(
                    'Qual aeroporto será o destino: ',
                    '',
                  )}
                  tracksViewChanges={false}>
                  <View style={styles.customMarker}>
                    <Text style={styles.customMarkerText}>B</Text>
                  </View>
                </Marker>
              )}
              {origemCoords && destinoCoords && (
                <Polyline
                  coordinates={[
                    {latitude: origemCoords.lat, longitude: origemCoords.lng},
                    {latitude: destinoCoords.lat, longitude: destinoCoords.lng},
                  ]}
                  strokeColor="#0c9fe3"
                  strokeWidth={3}
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
                      marginTop: 22,
                      fontSize: 16,
                      marginLeft: 20,
                      fontFamily: 'Montserrat-Regular',
                      color: 'rgba(0, 0, 0, 0.6)',
                    }}>
                    {modalTitleMain}
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
                  <View style={{width: '100%'}}>
                    <SearchAirports
                      inputText={textoTemporario}
                      onCitySelect={handleCitySelect}
                    />
                  </View>
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
          <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Montserrat-Bold' }}>Atualizar Dados Salvos</Text>
        </TouchableOpacity>

        {dadosArmazenados && (
          <View style={{ marginTop: 15 }}>
            <Text style={{ color: '#000', fontSize: 16, fontFamily: 'Montserrat-Bold' }}>Origem:</Text>
            <Text style={{ color: '#000', fontSize: 16, fontFamily: 'Montserrat-Bold' }}>Cidade: {dadosArmazenados.cidadeOrigem}</Text>
            <Text style={{ color: '#000', fontSize: 16, fontFamily: 'Montserrat-Bold' }}>Latitude: {dadosArmazenados.latOrigem}</Text>
            <Text style={{ color: '#000', fontSize: 16, fontFamily: 'Montserrat-Bold' }}>Longitude: {dadosArmazenados.lngOrigem}</Text>
            <Text style={{ color: '#000', fontSize: 16, fontFamily: 'Montserrat-Bold' }}>Cidade Main: {dadosArmazenados.cidadeOrigemMain}</Text>
            <Text style={{ color: '#000', fontSize: 16, fontFamily: 'Montserrat-Bold' }}>País: {dadosArmazenados.paisOrigem}</Text>

            <Text style={{ color: '#000', fontSize: 16, fontFamily: 'Montserrat-Bold' }}>Destino:</Text>
            <Text style={{ color: '#000', fontSize: 16, fontFamily: 'Montserrat-Bold' }}>Cidade: {dadosArmazenados.cidadeDestino}</Text>
            <Text style={{ color: '#000', fontSize: 16, fontFamily: 'Montserrat-Bold' }}>Latitude: {dadosArmazenados.latDestino}</Text>
            <Text style={{ color: '#000', fontSize: 16, fontFamily: 'Montserrat-Bold' }}>Longitude: {dadosArmazenados.lngDestino}</Text>
            <Text style={{ color: '#000', fontSize: 16, fontFamily: 'Montserrat-Bold' }}>Cidade Main: {dadosArmazenados.cidadeDestinoMain}</Text>
            <Text style={{ color: '#000', fontSize: 16, fontFamily: 'Montserrat-Bold' }}>País: {dadosArmazenados.paisDestino}</Text>
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
                    {
                      width: '48%',
                      marginLeft: 10,
                      padding: 0,
                      overflow: 'hidden',
                    },
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
      <View style={{marginTop: -40}}>
        <Header />
      </View>
      </SafeAreaView>
    </>
  );
};

export default OpcaoAviao;
