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
} from 'react-native';
import SearchAirports from '../../components/searchAirports/SearchAirports';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import MapView, {Marker, Polyline} from 'react-native-maps';
import styles from './OpcaoAviaoRetorno.styles';
import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OpcaoAviaoRetorno = () => {
  const navigation = useNavigation();
  const [tecladoAtivo, setTecladoAtivo] = useState(false);
  const [showAlertTravelModal, setShowAlertTravelModal] = useState(false);
  const [showMsgTravelModal, setShowMsgTravelModal] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitleMain, setModalTitleMain] = useState('');
  const [campoSelecionado, setCampoSelecionado] = useState(null);
  const [textoTemporario, setTextoTemporario] = useState('');
  const [saindoDe, setSaindoDe] = useState('Qual aeroporto você irá retornar:');
  const [indoPara, setIndoPara] = useState('Qual aeroporto será o destino:');
  const [origemCoords, setOrigemCoords] = useState(null);
  const [destinoCoords, setDestinoCoords] = useState(null);
  const [dadosArmazenados, setDadosArmazenados] = useState(null);
  const mapRef = useRef(null);
  const inputRef = useRef(null);

  const ativarTeclado = () => {
    setTecladoAtivo(true);
    inputRef.current?.focus();
  };

  const handleCitySelect = async item => {
    if (!item.geometry?.location) {
      Alert.alert('Erro', 'Coordenadas não encontradas.');
      return;
    }

    const reverseGeocode = async (lat, lon, tipo) => {
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'ReactNativeApp/1.0',
          },
        });

        const data = await response.json();
        const addr = data.address;

        let city = addr.city || addr.town || addr.village || '';
        let muni = addr.municipality || '';
        let cityMain = '';

        const match =
          muni.match(/Região Geográfica Imediata d[eo] (.+)/i) ||
          muni.match(/Região Imediata d[eo] (.+)/i);
        if (match) {
          cityMain = match[1].trim();
        }

        const cidadeFinal = cityMain || city;

        await AsyncStorage.setItem(
          `cidade_${tipo}_main_retorno`,
          `${cidadeFinal}, Brasil`,
        );
        //console.log(`Cidade ${tipo} main:`, cidadeFinal);
      } catch (error) {
        console.error(`Erro no reverse geocoding de ${tipo}:`, error);
      }
    };

    const nomeAeroporto = item.name; // Ex: "Aeroporto Santos Dumont"
    const {lat, lng} = item.geometry.location; // coords do aeroporto

    // 1) Faz reverse geocoding pra extrair o nome da cidade
    let cidadeMain = 'Cidade não encontrada';
    let YOUR_API_KEY = Config.GOOGLE_API_KEY;
    try {
      const resp = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${YOUR_API_KEY}&language=pt`,
      );
      const json = await resp.json();
      if (json.status === 'OK') {
        for (const result of json.results) {
          for (const comp of result.address_components) {
            if (comp.types.includes('locality')) {
              cidadeMain = `${comp.long_name}, Brasil`;
              break;
            }
            if (
              comp.types.includes('administrative_area_level_2') &&
              cidadeMain === 'Cidade não encontrada'
            ) {
              cidadeMain = `${comp.long_name}, Brasil`;
            }
          }
          if (cidadeMain !== 'Cidade não encontrada') break;
        }
      } else {
        console.warn('Geocoding error:', json.status);
      }
    } catch (err) {
      console.error('Erro no fetch de geocoding:', err);
    }

    await reverseGeocode(
      lat,
      lng,
      campoSelecionado === 'saindoDe' ? 'origem' : 'destino',
    );

    // 2) Atualiza estado para exibir no mapa e no Touchable
    if (campoSelecionado === 'saindoDe') {
      setSaindoDe(nomeAeroporto); // mostra o aeroporto no Touchable
      setOrigemCoords({lat, lng}); // reposiciona o marker

      // 3) Salva tudo no AsyncStorage
      await AsyncStorage.setItem('cidade_origem_retorno', nomeAeroporto);
      await AsyncStorage.setItem('lat_cidade_origem_retorno', lat.toFixed(7));
      await AsyncStorage.setItem('lng_cidade_origem_retorno', lng.toFixed(7));
      //await AsyncStorage.setItem('cidade_origem_main_retorno', cidadeMain);
      await AsyncStorage.setItem('pais_origem_retorno', 'Brasil');
    } else if (campoSelecionado === 'indoPara') {
      setIndoPara(nomeAeroporto);
      setDestinoCoords({lat, lng});

      await AsyncStorage.setItem('cidade_destino_retorno', nomeAeroporto);
      await AsyncStorage.setItem('lat_cidade_destino_retorno', lat.toFixed(7));
      await AsyncStorage.setItem('lng_cidade_destino_retorno', lng.toFixed(7));
      //await AsyncStorage.setItem('cidade_destino_main_retorno', cidadeMain);
      await AsyncStorage.setItem('pais_destino_retorno', 'Brasil');
    }

    // 4) Fecha a modal e limpa o input
    setTextoTemporario('');
    setModalVisible(false);
  };

  const abrirModal = campo => {
    setCampoSelecionado(campo);
    setTextoTemporario('');
    setModalTitleMain(
      campo === 'saindoDe'
        ? 'Qual aeroporto você irá retornar:'
        : 'Qual aeroporto será o destino:',
    );
    setModalVisible(true);
  };

  const screenWidth = Dimensions.get('window').width;
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
              QUAL AEROPORTO VOCÊ IRÁ RETORNAR?
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
              key={`${origemCoords?.lat}-${origemCoords?.lng}`}
              style={{height: 400, marginTop: 10, borderRadius: 10}}
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
                  title={saindoDe.replace(
                    'Qual aeroporto você irá retornar: ',
                    '',
                  )}
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
              QUAL AEROPORTO SERÁ O DESTINO?
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
                  title={saindoDe.replace(
                    'Qual aeroporto você irá retornar: ',
                    '',
                  )}
                />
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
                />
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

export default OpcaoAviaoRetorno;
