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
import SearchCities from '../../components/searchCities/SearchCities';
import Config from 'react-native-config';
import styles from './OpcaoMoto.styles';
import {useNavigation} from '@react-navigation/native';

const OpcaoCarro = () => {
  const navigation = useNavigation();
  const mapRef = useRef(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [campoSelecionado, setCampoSelecionado] = useState(null);
  const [textoTemporario, setTextoTemporario] = useState('');
  const [saindoDe, setSaindoDe] = useState('Saindo de:');
  const [indoPara, setIndoPara] = useState('Indo para:');
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
      Alert.alert('Erro', 'Coordenadas não encontradas.');
      return;
    }

    try {
      if (campoSelecionado === 'saindoDe') {
        setRouteCoords([]);
        setSaindoDe(cidadeSelecionada);
        setOrigemCoords(location);

        await AsyncStorage.setItem('cidade_origem', cidadeSelecionada);
        await AsyncStorage.setItem(
          'lat_cidade_origem',
          location.lat.toFixed(7),
        );
        await AsyncStorage.setItem(
          'lng_cidade_origem',
          location.lng.toFixed(7),
        );
        await AsyncStorage.setItem(
          'cidade_origem_main',
          `${cidadeMain}, Brasil`,
        );
        await AsyncStorage.setItem('pais_origem', 'Brasil');
      } else if (campoSelecionado === 'indoPara') {
        setRouteCoords([]);
        setIndoPara(cidadeSelecionada);
        setDestinoCoords(location);

        await AsyncStorage.setItem('cidade_destino', cidadeSelecionada);
        await AsyncStorage.setItem(
          'lat_cidade_destino',
          location.lat.toFixed(7),
        );
        await AsyncStorage.setItem(
          'lng_cidade_destino',
          location.lng.toFixed(7),
        );
        await AsyncStorage.setItem(
          'cidade_destino_main',
          `${cidadeMain}, Brasil`,
        );
        await AsyncStorage.setItem('pais_destino', 'Brasil');
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
        const latOrigem = await AsyncStorage.getItem('lat_cidade_origem');
        const lngOrigem = await AsyncStorage.getItem('lng_cidade_origem');
        const cidadeOrigem = await AsyncStorage.getItem('cidade_origem');

        if (latOrigem && lngOrigem && cidadeOrigem) {
          setOrigemCoords({
            lat: parseFloat(latOrigem),
            lng: parseFloat(lngOrigem),
          });
          setSaindoDe(cidadeOrigem);
        }

        const latDestino = await AsyncStorage.getItem('lat_cidade_destino');
        const lngDestino = await AsyncStorage.getItem('lng_cidade_destino');
        const cidadeDestino = await AsyncStorage.getItem('cidade_destino');

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
              QUAL CIDADE IRÁ SAIR?
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
                  title={saindoDe.replace('Saindo de: ', '')}
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
              QUAL CIDADE SERÁ O DESTINO?
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
                  title={saindoDe.replace('Saindo de: ', '')}
                />
              )}
              {destinoCoords && (
                <Marker
                  coordinate={{
                    latitude: destinoCoords.lat,
                    longitude: destinoCoords.lng,
                  }}
                  title={indoPara.replace('Indo para: ', '')}
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
        onRequestClose={() => setModalVisible(false)}>
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
                    ? 'Saindo de:'
                    : 'Indo para:'}
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
                  autoFocus
                  placeholder="Digite aqui"
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
            marginTop: 15,
          }}>
          {currentStep > 1 && (
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
          )}
          <TouchableOpacity
            style={[styles.button, {width: currentStep > 1 ? '48%' : '100%'}]}
            onPress={
              currentStep < 2
                ? nextStep
                : () => alert('Próximas etapas em andamento')
            }>
            <Text
              style={[
                styles.buttonText,
                {fontFamily: 'Montserrat-Regular', fontSize: 18},
              ]}>
              Próximo
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default OpcaoCarro;
