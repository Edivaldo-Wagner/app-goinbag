import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MapView, {Marker, Polyline} from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import pLimit from 'p-limit';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {useNavigation} from '@react-navigation/native';

const DIRECTIONS_URL = 'https://maps.googleapis.com/maps/api/directions/json';
const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const PLACES_URL =
  'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const key = Config.GOOGLE_API_KEY;
const limit = pLimit(5);
const MIN_DISTANCE_KM = 10;

// Gera opções de tempo a cada 10 minutos
const TIME_OPTIONS = Array.from({length: 24 * 6}, (_, i) => {
  const h = String(Math.floor(i / 6)).padStart(2, '0');
  const m = String((i % 6) * 10).padStart(2, '0');
  return `${h}:${m}`;
});

export default function CidadesTrajetoMotoRetorno() {
  const navigation = useNavigation();
  const mapRef = useRef(null);
  const debounceRef = useRef(null);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [coords, setCoords] = useState([]);
  const [presetCityName, setPresetCityName] = useState(null); // nova cidade clicada na lista
  const [cities, setCities] = useState([]); // todas as cidades descobertas + manuais
  const [selectedCities, setSelectedCities] = useState([]); // array de strings: ['Rio', 'SP#2025-05-22$10:30', ...]
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [horasRotaSelecionada, setHorasRotaSelecionada] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [manualCityInput, setManualCityInput] = useState('');
  const [autocompleteResults, setAutocompleteResults] = useState([]);

  // Date/Time pickers
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [showMissingDateTimeModal, setShowMissingDateTimeModal] =
    useState(false);
  const [showMsgTravelModal, setShowMsgTravelModal] = useState('');

  const [dadosArmazenados, setDadosArmazenados] = useState(null);

  // Carrega rota e horas
  useEffect(() => {
    (async () => {
      const rota = await AsyncStorage.getItem('rota-selecionada-retorno');
      const horas = await AsyncStorage.getItem(
        'horas-rota-selecionada-retorno',
      );
      setSelectedRoute(rota);
      setHorasRotaSelecionada(parseInt(horas || '0', 10));
    })();
  }, []);

  // Carrega origem/destino
  useEffect(() => {
    (async () => {
      const cidadeOrigem = await AsyncStorage.getItem('cidade_origem_retorno');
      const cidadeDestino = await AsyncStorage.getItem(
        'cidade_destino_retorno',
      );
      setDadosArmazenados({
        cidadeOrigem,
        cidadeDestino,
      });

      const [latO, lngO, latD, lngD] = await Promise.all([
        AsyncStorage.getItem('lat_cidade_origem_retorno'),
        AsyncStorage.getItem('lng_cidade_origem_retorno'),
        AsyncStorage.getItem('lat_cidade_destino_retorno'),
        AsyncStorage.getItem('lng_cidade_destino_retorno'),
      ]);
      if (latO && lngO && latD && lngD) {
        setOrigin({latitude: +latO, longitude: +lngO});
        setDestination({latitude: +latD, longitude: +lngD});
      } else {
        console.warn('Coordenadas não encontradas');
        setLoading(false);
      }
    })();
  }, []);

  // Busca rota no Google Directions
  useEffect(() => {
    if (!origin || !destination || !selectedRoute) return;
    (async () => {
      const res = await fetch(
        `${DIRECTIONS_URL}?origin=${origin.latitude},${origin.longitude}` +
          `&destination=${destination.latitude},${destination.longitude}` +
          `&alternatives=true&mode=driving&key=${key}&language=pt-BR`,
      );
      const json = await res.json();
      if (json.status !== 'OK') {
        console.warn('Directions API:', json.status);
        return;
      }
      const routeObj = json.routes.find(
        (r, i) => `opcao-rota-${i + 1}` === selectedRoute,
      );
      if (!routeObj) {
        console.warn('Rota selecionada não encontrada');
        return;
      }
      setRouteData(routeObj);
      setCoords(decodePolyline(routeObj.overview_polyline.points));
    })();
  }, [origin, destination, selectedRoute]);

  // Geocode cidades ao longo da rota
  useEffect(() => {
    if (!routeData || !origin || !destination) return;

    (async () => {
      const sampledPoints = coords.filter((_, index) => index % 15 === 0); // reduz chamadas

      const cityPromises = sampledPoints.map(([lat, lng]) =>
        limit(() => geocodeCity({lat, lng})),
      );

      const results = await Promise.all(cityPromises);
      const uniqueCities = Array.from(new Set(results.filter(Boolean)));

      const origemStr = await AsyncStorage.getItem(
        'cidade_origem_main_retorno',
      );
      const destinoStr = await AsyncStorage.getItem(
        'cidade_destino_main_retorno',
      );

      const cidadeOrigemMain = origemStr?.split(',')[0] ?? '';
      const cidadeDestinoMain = destinoStr?.split(',')[0] ?? '';

      const cidadesFiltradas = uniqueCities.filter(
        c =>
          c.toLowerCase() !== cidadeOrigemMain.toLowerCase() &&
          c.toLowerCase() !== cidadeDestinoMain.toLowerCase(),
      );

      setCities(prev => Array.from(new Set([...prev, ...cidadesFiltradas])));

      const saved = await AsyncStorage.getItem('cidades_trajeto_retorno');
      if (saved) {
        const arr = JSON.parse(saved);
        setSelectedCities(arr);
        const nomes = arr.map(e => e.split('#')[0]);
        setCities(prev => Array.from(new Set([...prev, ...nomes])));
      }

      setLoading(false);
    })();
  }, [routeData, origin, destination]);

  // Função para geocodificar lat/lng -> nome da cidade
  const geocodeCity = async ({lat, lng}) => {
    try {
      const res = await fetch(
        `${GEOCODE_URL}?latlng=${lat},${lng}&key=${key}&language=pt-BR`,
      );
      const j = await res.json();
      if (j.status !== 'OK' || !j.results.length) return null;
      const comps = j.results[0].address_components;
      const country = comps.find(c => c.types.includes('country'));
      if (country?.short_name !== 'BR') return null;
      const comp = comps.find(c =>
        [
          'locality',
          'administrative_area_level_2',
          'administrative_area_level_3',
        ].some(t => c.types.includes(t)),
      );
      return comp?.long_name || null;
    } catch (e) {
      console.warn('Erro geocode:', e.message);
      return null;
    }
  };

  // Autocomplete no TextInput
  const fetchAutocomplete = async text => {
    if (!text) return setAutocompleteResults([]);
    try {
      const res = await fetch(
        `${PLACES_URL}?input=${encodeURIComponent(
          text,
        )}&types=(cities)&components=country:br&language=pt-BR&key=${key}`,
      );
      const j = await res.json();
      if (j.status === 'OK') {
        const citiesOnly = j.predictions.map(
          p => p.structured_formatting.main_text,
        );
        const uniqueCities = [...new Set(citiesOnly)];
        setAutocompleteResults(uniqueCities);
      }
    } catch (err) {
      console.warn('Autocomplete erro:', err.message);
    }
  };

  // Adiciona cidade (autocomplete ou manual) com data/hora se necessário
  const handleAddCity = async cityNameArg => {
    const cityName = presetCityName || cityNameArg;
    if (!cityName) return;

    if (
      selectedCities.some(
        e => e.split('#')[0].toLowerCase() === cityName.toLowerCase(),
      )
    ) {
      //alert('Essa cidade já está na lista.');
      setShowMsgTravelModal('Essa cidade já está na lista.');
      setShowMissingDateTimeModal(true);
      return;
    }

    let entry = cityName;
    if (horasRotaSelecionada >= 14) {
      if (!selectedDate || !selectedTime) {
        setShowMsgTravelModal('Selecione data e hora antes de adicionar.');
        setShowMissingDateTimeModal(true);
        return;
      }
      const dateStr = selectedDate.toISOString().split('T')[0];
      const timeStr = selectedTime.slice(0, 5);
      entry = `${cityName}#${dateStr}$${timeStr}`;
    }

    const updated = [...selectedCities, entry];
    setSelectedCities(updated);
    await AsyncStorage.setItem(
      'cidades_trajeto_retorno',
      JSON.stringify(updated),
    );
    setCities(prev => Array.from(new Set([...prev, cityName])));

    // Limpa tudo
    setManualCityInput('');
    setAutocompleteResults([]);
    setSelectedDate(null);
    setSelectedTime(null);
    setPresetCityName(null); // limpa a cidade clicada
    setModalVisible(false);
  };

  // Toggle city by name (sem data/hora)
  const toggleCity = async cityName => {
    const exists = selectedCities.some(e => e.split('#')[0] === cityName);

    if (exists) {
      const updated = selectedCities.filter(e => e.split('#')[0] !== cityName);
      setSelectedCities(updated);
      await AsyncStorage.setItem(
        'cidades_trajeto_retorno',
        JSON.stringify(updated),
      );
    } else {
      if (horasRotaSelecionada >= 14) {
        setPresetCityName(cityName);
        setModalVisible(true);
      } else {
        const updated = [...selectedCities, cityName];
        setSelectedCities(updated);
        await AsyncStorage.setItem(
          'cidades_trajeto_retorno',
          JSON.stringify(updated),
        );
      }
    }
  };

  useEffect(() => {
    if (mapReady && coords.length > 0 && mapRef.current) {
      const formattedCoords = coords.map(([lat, lng]) => ({
        latitude: lat,
        longitude: lng,
      }));

      mapRef.current.fitToCoordinates(formattedCoords, {
        edgePadding: {top: 100, right: 100, bottom: 400, left: 100},
        animated: true,
      });
    }
  }, [mapReady, coords]);

  // Date/Time pickers handlers
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirmDate = date => {
    setSelectedDate(date);
    hideDatePicker();
  };
  const showTimePicker = () => setTimePickerVisibility(true);
  const hideTimePicker = () => setTimePickerVisibility(false);
  const handleConfirmTime = time => {
    // time é objeto Date; só precisamos de "HH:MM"
    const hh = String(time.getHours()).padStart(2, '0');
    const mm = String(time.getMinutes()).padStart(2, '0');
    setSelectedTime(`${hh}:${mm}`);
    hideTimePicker();
  };

  if (loading || !origin || !destination || !selectedRoute) {
    return <ActivityIndicator style={{flex: 1}} size="large" />;
  }

  return (
    <View style={{flex: 1}}>
      <MapView
        ref={mapRef}
        style={{flex: 1}}
        onMapReady={() => setMapReady(true)}
        initialRegion={{
          latitude: origin.latitude,
          longitude: origin.longitude,
          latitudeDelta: 1,
          longitudeDelta: 1,
        }}>
        <Marker coordinate={origin} title={dadosArmazenados.cidadeOrigem} />
        <Marker
          coordinate={destination}
          title={dadosArmazenados.cidadeDestino}
        />
        <Polyline
          coordinates={coords.map(([lat, lng]) => ({
            latitude: lat,
            longitude: lng,
          }))}
          strokeWidth={4}
          strokeColor="#0c9fe3"
        />
      </MapView>

      {/* Lista de cidades com checkbox */}
      <View style={styles.listContainer}>
        <Text style={styles.title}>Cidades no trajeto:</Text>
        <FlatList
          data={cities}
          keyExtractor={item => item}
          renderItem={({item}) => {
            const isChecked = selectedCities.some(
              e => e.split('#')[0] === item,
            );
            const entry =
              selectedCities.find(e => e.split('#')[0] === item) || '';
            // se tiver "#", exibe data/hora
            const dt = entry.includes('#')
              ? entry.split('#')[1].replace('$', ' às ')
              : '';
            return (
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => toggleCity(item)}>
                <View style={styles.checkbox}>
                  {isChecked && <View style={styles.checked} />}
                </View>
                <View>
                  <Text style={styles.cityText}>{item}</Text>
                  {!!dt && <Text style={styles.dateTimeText}>{dt}</Text>}
                </View>
              </TouchableOpacity>
            );
          }}
        />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={() => {
              setModalVisible(true);
              setPresetCityName(null);
            }}
            style={[styles.addButton, {width: '56%'}]}>
            <Text style={styles.addButtonText}>+ Adicionar Cidades</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              navigation.navigate('DataHoraRetorno');
            }}
            style={[styles.addButton, {width: '40%'}]}>
            <Text style={styles.addButtonText}>Próximo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de adição (manual ou autocomplete) */}
      <Modal
        visible={showMissingDateTimeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMissingDateTimeModal(false)}>
        <TouchableWithoutFeedback
          onPress={() => setShowMissingDateTimeModal(false)}>
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
                  onPress={() => setShowMissingDateTimeModal(false)}>
                  <Text style={styles.alertButtonText}>Entendi</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Adicionar Cidade</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={{bottom: 44, alignSelf: 'flex-end'}}>
                  <MaterialIcon
                    name="close"
                    size={33}
                    color="rgba(127,127,127,0.8)"
                  />
                </TouchableOpacity>

                <TextInput
                  placeholder="Nome da cidade"
                  value={presetCityName || manualCityInput}
                  editable={!presetCityName}
                  onChangeText={text => {
                    setManualCityInput(text);

                    // Limpa chamadas pendentes
                    if (debounceRef.current) {
                      clearTimeout(debounceRef.current);
                    }

                    // Se o campo estiver vazio, limpa sugestões
                    if (!text.trim()) {
                      setAutocompleteResults([]);
                      setManualCityInput('');
                      return;
                    }

                    setManualCityInput(text);

                    // Aguarda 300ms após a última tecla, então busca
                    debounceRef.current = setTimeout(() => {
                      fetchAutocomplete(text);
                    }, 300);
                  }}
                  style={[
                    styles.input,
                    {
                      backgroundColor: presetCityName ? '#eee' : '#fff',
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
                      marginTop: -32,
                    },
                  ]}
                />

                {autocompleteResults.length > 0 && (
                  <ScrollView
                    keyboardShouldPersistTaps="handled"
                    style={{maxHeight: 200, width: '97%', marginLeft: 10}}>
                    {autocompleteResults.slice(0, 4).map((city, i) => (
                      <TouchableOpacity
                        key={i}
                        onPress={() => handleAddCity(city)}>
                        <Text style={styles.autocompleteItem}>{city}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                {/* Campos adicionais quando horas ≥ 14 */}
                {horasRotaSelecionada >= 14 && (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.pickerButton,
                        {
                          backgroundColor: '#fff',
                          marginTop: -2,
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
                      onPress={showDatePicker}>
                      <Text style={styles.pickerButtonText}>
                        {selectedDate
                          ? selectedDate.toLocaleDateString()
                          : 'Selecionar Data'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.pickerButton,
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
                      onPress={showTimePicker}>
                      <Text style={styles.pickerButtonText}>
                        {selectedTime ? selectedTime : 'Selecionar Hora'}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                {presetCityName && (
                  <>
                    <TouchableOpacity
                      onPress={() => handleAddCity(manualCityInput)}
                      style={{
                        backgroundColor: '#0c9fe3',
                        padding: 11,
                        borderRadius: 8,
                        alignItems: 'center',
                        marginTop: 5,
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 2},
                        shadowOpacity: 0.2,
                        shadowRadius: 3,
                        elevation: 4,
                      }}>
                      <Text
                        style={{
                          color: '#fff',
                          fontSize: 17,
                          fontWeight: 'Montserrat-Regular',
                        }}>
                        Adicionar
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Date & Time pickers */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
      />
      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleConfirmTime}
        onCancel={hideTimePicker}
      />
    </View>
  );
}

// Função utilitária para decodificar polyline
function decodePolyline(encoded) {
  let points = [],
    index = 0,
    lat = 0,
    lng = 0;
  while (index < encoded.length) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

const styles = StyleSheet.create({
  listContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '40%',
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Montserrat-Regular',
    color: '#333',
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#0c9fe3',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {width: 12, height: 12, backgroundColor: '#0c9fe3', borderRadius: 3},
  cityText: {fontSize: 16, color: '#333'},
  dateTimeText: {fontSize: 14, color: '#666', marginTop: 4},

  addButton: {
    backgroundColor: '#00aaff',
    paddingVertical: 12,
    width: '50%',
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {color: '#fff', fontSize: 17, fontFamily: 'Montserrat-Bold'},

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
    fontFamily: 'Montserrat-Bold',
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 19,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  alertButton: {
    backgroundColor: '#0c9fe3',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    // Sombra
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  alertButtonText: {
    width: 100,
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'Montserrat-Regular',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    width: '90%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-Regular',
    color: 'rgba(0, 0, 0, 0.6)',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  autocompleteItem: {
    paddingVertical: 8,
    paddingLeft: 5,
    borderBottomWidth: 1,
    borderColor: '#eee',
    fontSize: 18,
    color: 'rgba(0, 0, 0, 0.7)',
    fontFamily: 'Montserrat-Regular',
  },
  pickerButton: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  pickerButtonText: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.5)',
    marginTop: 3,
  },
  nextButton: {
    //position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#0c9fe3',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },

  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
