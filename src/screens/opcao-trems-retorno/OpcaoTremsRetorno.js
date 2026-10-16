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
} from 'react-native';
import MapView, {Marker, Polyline} from 'react-native-maps';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SearchTrens from '../../components/searchTrens/SearchTrens';
import Config from 'react-native-config';
import styles from './OpcaoTremsRetorno.styles';
import {useNavigation} from '@react-navigation/native';

const OpcaoTremsRetorno = () => {
  const navigation = useNavigation();
  const [tecladoAtivo, setTecladoAtivo] = useState(false);
  const mapRef = useRef(null);
  const inputRef = useRef(null);

  const [showAlertTravelModal, setShowAlertTravelModal] = useState(false);
  const [showMsgTravelModal, setShowMsgTravelModal] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [campoSelecionado, setCampoSelecionado] = useState(null);
  const [textoTemporario, setTextoTemporario] = useState('');
  const [saindoDe, setSaindoDe] = useState('Qual estação você irá sair:');
  const [indoPara, setIndoPara] = useState('Qual estação será o destino:');
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
    const location = item.location;

    // Verificar se temos coordenadas válidas
    if (!location) {
      Alert.alert('Erro', 'Coordenadas não encontradas.');
      return;
    }

    try {
      const {lat, lng} = location;

      // Geocodificação reversa para obter o nome da cidade
      const apiKey = Config.GOOGLE_API_KEY; // Certifique-se de que a chave da API está configurada corretamente.
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=pt`;

      const response = await fetch(geocodeUrl);
      const data = await response.json();

      if (data.status === 'OK') {
        let cidadeNome = null;
        let paisNome = null;

        for (const result of data.results) {
          for (const component of result.address_components) {
            if (
              !cidadeNome &&
              (component.types.includes('locality') ||
                component.types.includes('administrative_area_level_2') ||
                component.types.includes('administrative_area_level_1'))
            ) {
              cidadeNome = component.long_name;
            }
            if (!paisNome && component.types.includes('country')) {
              paisNome = component.long_name;
            }
          }
          if (cidadeNome && paisNome) break;
        }

        // Se não conseguir encontrar cidade ou país, usa defaults
        cidadeNome = cidadeNome || 'Cidade desconhecida';
        paisNome = paisNome || 'País desconhecido';

        const cidadeMain = `${cidadeNome}, ${paisNome}`;

        // Armazenar as informações de origem ou destino
        if (campoSelecionado === 'saindoDe') {
          setSaindoDe(cidadeSelecionada);
          setOrigemCoords(location);
          await AsyncStorage.setItem(
            'cidade_origem_retorno',
            cidadeSelecionada,
          );
          await AsyncStorage.setItem(
            'lat_cidade_origem_retorno',
            lat.toFixed(7),
          );
          await AsyncStorage.setItem(
            'lng_cidade_origem_retorno',
            lng.toFixed(7),
          );
          await AsyncStorage.setItem('cidade_origem_main_retorno', cidadeMain);
          await AsyncStorage.setItem('pais_origem_retorno', paisNome);
        } else if (campoSelecionado === 'indoPara') {
          setIndoPara(cidadeSelecionada);
          setDestinoCoords(location);
          await AsyncStorage.setItem(
            'cidade_destino_retorno',
            cidadeSelecionada,
          );
          await AsyncStorage.setItem(
            'lat_cidade_destino_retorno',
            lat.toFixed(7),
          );
          await AsyncStorage.setItem(
            'lng_cidade_destino_retorno',
            lng.toFixed(7),
          );
          await AsyncStorage.setItem('cidade_destino_main_retorno', cidadeMain);
          await AsyncStorage.setItem('pais_destino_retorno', paisNome);
        }
      } else {
        Alert.alert('Erro', 'Não foi possível localizar a cidade.');
      }
    } catch (error) {
      console.error('Erro ao buscar cidade com geocodificação reversa:', error);
    }

    setTextoTemporario('');
    setModalVisible(false);
  };

  const abrirModal = campo => {
    setCampoSelecionado(campo);
    setTextoTemporario('');
    setModalVisible(true);
  };

  const screenWidth = Dimensions.get('window').width;
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
    const carregarSessao = async () => {
      try {
        const latOrigem = await AsyncStorage.getItem(
          'lat_cidade_origem_retorno',
        );
        const lngOrigem = await AsyncStorage.getItem(
          'lng_cidade_origem_retorno',
        );
        const cidadeOrigem = await AsyncStorage.getItem(
          'cidade_origem_retorno',
        );

        if (latOrigem && lngOrigem && cidadeOrigem) {
          setOrigemCoords({
            lat: parseFloat(latOrigem),
            lng: parseFloat(lngOrigem),
          });
          setSaindoDe(cidadeOrigem);
        }

        const latDestino = await AsyncStorage.getItem(
          'lat_cidade_destino_retorno',
        );
        const lngDestino = await AsyncStorage.getItem(
          'lng_cidade_destino_retorno',
        );
        const cidadeDestino = await AsyncStorage.getItem(
          'cidade_destino_retorno',
        );

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

  const atualizarDadosArmazenados = async () => {
    try {
      const cidadeOrigem = await AsyncStorage.getItem('cidade_origem_retorno');
      const latOrigem = await AsyncStorage.getItem('lat_cidade_origem_retorno');
      const lngOrigem = await AsyncStorage.getItem('lng_cidade_origem_retorno');
      const cidadeOrigemMain = await AsyncStorage.getItem(
        'cidade_origem_main_retorno',
      );
      const paisOrigem = await AsyncStorage.getItem('pais_origem_retorno');

      const cidadeDestino = await AsyncStorage.getItem(
        'cidade_destino_retorno',
      );
      const latDestino = await AsyncStorage.getItem(
        'lat_cidade_destino_retorno',
      );
      const lngDestino = await AsyncStorage.getItem(
        'lng_cidade_destino_retorno',
      );
      const cidadeDestinoMain = await AsyncStorage.getItem(
        'cidade_destino_main_retorno',
      );
      const paisDestino = await AsyncStorage.getItem('pais_destino_retorno');

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
                fontSize: 17,
              }}>
              QUAL ESTAÇÃO VOCÊ IRÁ SAIR?
            </Text>
            <TouchableOpacity
              onPress={() => abrirModal('saindoDe')}
              style={[styles.input, {marginTop: 8, paddingLeft: 15}]}>
              <Text
                style={{
                  marginTop: 12,
                  fontSize: 17,
                  fontFamily: 'Montserrat-Regular',
                  color: '#353738',
                }}>
                {saindoDe}
              </Text>
            </TouchableOpacity>
            <MapView
              style={{height: 400, marginTop: 10, borderRadius: 10}}
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
                  title={saindoDe.replace('Qual estação você irá sair: ', '')}
                />
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
                fontSize: 17,
              }}>
              QUAL ESTAÇÃO SERÁ O DESTINO?
            </Text>
            <TouchableOpacity
              onPress={() => abrirModal('indoPara')}
              style={[styles.input, {marginTop: 8, paddingLeft: 15}]}>
              <Text
                style={{
                  marginTop: 12,
                  fontSize: 17,
                  fontFamily: 'Montserrat-Regular',
                  color: '#353738',
                }}>
                {indoPara}
              </Text>
            </TouchableOpacity>
            <MapView
              ref={mapRef}
              style={{height: 400, marginTop: 10, borderRadius: 10}}
              region={getDestinoRegion()}>
              {origemCoords && (
                <Marker
                  coordinate={{
                    latitude: origemCoords.lat,
                    longitude: origemCoords.lng,
                  }}
                  title={saindoDe.replace('Qual estação você irá sair: ', '')}
                />
              )}
              {destinoCoords && (
                <Marker
                  coordinate={{
                    latitude: destinoCoords.lat,
                    longitude: destinoCoords.lng,
                  }}
                  title={indoPara.replace('Qual estação será o destino: ', '')}
                />
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
    <View style={{flex: 1, alignItems: 'center', backgroundColor: '#fff'}}>
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
                    fontSize: 18,
                    marginLeft: 20,
                    fontFamily: 'Montserrat-Regular',
                    color: 'rgba(0, 0, 0, 0.6)',
                  }}>
                  {campoSelecionado === 'saindoDe'
                    ? 'Qual estação você irá sair:'
                    : 'Qual estação será o destino:'}
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
                  placeholder="Digite aqui"
                  caretHidden={!tecladoAtivo}
                />
                <SearchTrens
                  inputText={textoTemporario}
                  onTremStopSelect={handleCitySelect}
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
          {width: screenWidth * 0.9 > maxWidth ? maxWidth : screenWidth * 0.9},
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
                onPress={() => navigation.goBack()}>
                <Text style={styles.textoBotaoVoltar}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.botaoContinuar, {width: '48%', marginLeft: 10}]}
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
                <Text style={styles.buttonText}>Continuar</Text>
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
                style={[styles.botaoContinuar, {width: '48%', marginLeft: 10}]}
                onPress={() => {
                  if (!destinoCoords) {
                    setShowMsgTravelModal(
                      'Por favor, selecione a cidade de destino antes de continuar.',
                    );
                    setShowAlertTravelModal(true);
                    return;
                  }
                  navigation.navigate('DataHoraRetorno');
                }}>
                <Text style={styles.buttonText}>Continuar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default OpcaoTremsRetorno;
