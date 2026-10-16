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
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LocalizacaoAtual from '../../components/localizacaoAtual/LocalizacaoAtual';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MapView, {Marker, Polyline} from 'react-native-maps';
import Config from 'react-native-config';
import pLimit from 'p-limit';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import RailwayStation from '../../assets/images/railway-station.png';
import {getSecureData} from '../../utils/secureStorage';
import {saveToGlobalState, getStoredData} from '../../utils/storage';

const DIRECTIONS_URL = 'https://maps.googleapis.com/maps/api/directions/json';
const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const PLACES_URL =
  'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const key = Config.GOOGLE_API_KEY;
const limit = pLimit(5);

export default function RotaComCidades() {
  const navigation = useNavigation();
  const mapRef = useRef(null);
  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const [tecladoAtivo, setTecladoAtivo] = useState(false);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [coords, setCoords] = useState([]);
  const [presetCityName, setPresetCityName] = useState(null);
  const [cities, setCities] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
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

  const [dadosArmazenados, setDadosArmazenados] = useState({});

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

  // Carrega rota e horas
  useEffect(() => {
    (async () => {
      const {rota_selecionada: rota, horas_rota_selecionada: horas} =
        await getStoredData();
      setSelectedRoute(rota);
      setHorasRotaSelecionada(parseInt(horas || '0', 10));
    })();
  }, []);

  // Carrega origem/destino
  useEffect(() => {
    (async () => {
      const {
        cidade_origem: cidadeOrigem,
        cidade_destino: cidadeDestino,
        lat_cidade_origem: latO,
        lng_cidade_origem: lngO,
        lat_cidade_destino: latD,
        lng_cidade_destino: lngD,
      } = await getStoredData();

      setDadosArmazenados({
        cidadeOrigem,
        cidadeDestino,
      });

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
      try {
        const res = await fetch(
          `${DIRECTIONS_URL}?origin=${origin.latitude},${origin.longitude}` +
            `&destination=${destination.latitude},${destination.longitude}` +
            `&alternatives=true&mode=driving&key=${key}&language=pt-BR`,
        );
        const json = await res.json();
        if (json.status !== 'OK') {
          console.warn('Directions API:', json.status);
          setLoading(false);
          return;
        }
        const routeObj =
          json.routes.find((r, i) => `opcao-rota-${i}` === selectedRoute) ||
          json.routes[0];

        setRouteData(routeObj);
        setCoords(decodePolyline(routeObj.overview_polyline.points));
      } catch (e) {
        console.error('Erro Directions:', e);
        setLoading(false);
      }
    })();
  }, [origin, destination, selectedRoute]);

  // Geocode cidades ao longo da rota
  useEffect(() => {
    if (!routeData || !origin || !destination || coords.length === 0) return;

    (async () => {
      try {
        const sampledPoints = coords.filter((_, index) => index % 15 === 0);

        const cityPromises = sampledPoints.map(([lat, lng]) =>
          limit(() => geocodeCity({lat, lng})),
        );

        const results = await Promise.all(cityPromises);
        const uniqueCities = Array.from(new Set(results.filter(Boolean)));

        const {
          cidade_origem_main: origemStr,
          cidade_destino_main: destinoStr,
          cidades_trajeto: saved,
        } = await getStoredData();

        const cidadeOrigemMain = origemStr?.split(',')[0] ?? '';
        const cidadeDestinoMain = destinoStr?.split(',')[0] ?? '';

        const cidadesFiltradas = uniqueCities.filter(
          c =>
            c.toLowerCase() !== cidadeOrigemMain.toLowerCase() &&
            c.toLowerCase() !== cidadeDestinoMain.toLowerCase(),
        );

        let savedCitiesNames = [];
        if (saved) {
          try {
            const arr = typeof saved === 'string' ? JSON.parse(saved) : saved;
            setSelectedCities(arr);
            savedCitiesNames = arr.map(e => e.split('#')[0]);
          } catch (e) {
            console.warn('Erro parse cidades_trajeto:', e);
          }
        }

        // Unifica cidades do geocode + salvas anteriormente sem duplicatas
        const finalCityList = Array.from(
          new Set([...savedCitiesNames, ...cidadesFiltradas]),
        );
        setCities(finalCityList);
      } catch (err) {
        console.error('Erro ao processar geocoding do trajeto:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [routeData, origin, destination, coords]);

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

  const addCityToField = async cityName => {
    setManualCityInput(cityName);
    setAutocompleteResults([]);
  };

  const converterData = str => {
    const partes = str.split('/');
    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const ano = 2000 + parseInt(partes[2], 10);
    return new Date(ano, mes, dia);
  };

  // Adiciona cidade (autocomplete ou manual) com data/hora se necessário
  const handleAddCity = async cityNameArg => {
    const cityName = presetCityName || cityNameArg;
    if (!cityName) return;

    if (horasRotaSelecionada >= 14) {
      if (!selectedDate || !selectedTime) return;

      const {
        dia_mes_ano_ida_viagem_para_busca: dataHoraViagem,
        dia_mes_ano_destino_para_busca: dataHoraDestino,
      } = await getStoredData();

      if (dataHoraViagem && dataHoraDestino) {
        let dataSelecionada = new Date(
          selectedDate - selectedDate.getTimezoneOffset() * 60000,
        )
          .toISOString()
          .split('T')[0];
        let dataTransformada = dataSelecionada.split('-').reverse().join('/');

        let dataViagem = converterData(dataHoraViagem);
        let dataCheck = converterData(dataTransformada);
        let dataDestino = converterData(dataHoraDestino);

        if (dataCheck < dataViagem || dataCheck > dataDestino) {
          setShowMsgTravelModal(
            'Data fora do intervalo da viagem! Selecione uma data válida.',
          );
          setShowMissingDateTimeModal(true);
          return;
        }
      }
    }

    if (
      selectedCities.some(
        e => e.split('#')[0].toLowerCase() === cityName.toLowerCase(),
      )
    ) {
      setShowMsgTravelModal('Essa cidade já está na lista.');
      setShowMissingDateTimeModal(true);
      return;
    }

    let entry = cityName;
    if (horasRotaSelecionada >= 14 && selectedDate && selectedTime) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const timeStr = selectedTime.slice(0, 5);
      entry = `${cityName}#${dateStr}$${timeStr}`;
    }

    const updatedSelectedCities = [...selectedCities, entry];
    setSelectedCities(updatedSelectedCities);

    await saveToGlobalState({
      cidades_trajeto: JSON.stringify(updatedSelectedCities),
    });

    setCities(prev => {
      const clean = prev.filter(c => c !== cityName);
      let lastSelectedIndex = -1;

      clean.forEach((city, idx) => {
        if (updatedSelectedCities.some(e => e.split('#')[0] === city)) {
          lastSelectedIndex = idx;
        }
      });

      if (lastSelectedIndex === -1) {
        return [cityName, ...clean];
      }

      return [
        ...clean.slice(0, lastSelectedIndex + 1),
        cityName,
        ...clean.slice(lastSelectedIndex + 1),
      ];
    });

    setManualCityInput('');
    setAutocompleteResults([]);
    setSelectedDate(null);
    setSelectedTime(null);
    setPresetCityName(null);
    setModalVisible(false);
    flatListRef.current?.scrollToOffset({offset: 0, animated: true});
  };

  const toggleCity = async cityName => {
    const exists = selectedCities.some(e => e.split('#')[0] === cityName);

    if (exists) {
      const updatedSelected = selectedCities.filter(
        e => e.split('#')[0] !== cityName,
      );
      setSelectedCities(updatedSelected);
      await saveToGlobalState({
        cidades_trajeto: JSON.stringify(updatedSelected),
      });
      return;
    }

    if (horasRotaSelecionada >= 14) {
      setPresetCityName(cityName);
      setModalVisible(true);
      return;
    }

    handleAddCity(cityName);
    flatListRef.current?.scrollToOffset({offset: 0, animated: true});
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

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirmDate = date => {
    setSelectedDate(date);
    hideDatePicker();
  };
  const showTimePicker = () => setTimePickerVisibility(true);
  const hideTimePicker = () => setTimePickerVisibility(false);
  const handleConfirmTime = time => {
    const hh = String(time.getHours()).padStart(2, '0');
    const mm = String(time.getMinutes()).padStart(2, '0');
    setSelectedTime(`${hh}:${mm}`);
    hideTimePicker();
  };

  if (loading || !origin || !destination) {
    return <ActivityIndicator style={{flex: 1}} size="large" />;
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#0a768f'}} edges={['top', 'left', 'right']}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#0a768f" 
        translucent={false} 
      />
    <View style={{flex: 1}}>
      <LocalizacaoAtual />
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
        {origin && (
          <Marker
            coordinate={origin}
            title={dadosArmazenados?.cidadeOrigem}
            tracksViewChanges={false}>
            <View style={styles.customMarker}>
              <Text style={styles.customMarkerText}>A</Text>
            </View>
          </Marker>
        )}
        {destination && (
          <Marker
            coordinate={destination}
            title={dadosArmazenados?.cidadeDestino}
            tracksViewChanges={false}>
            <View style={styles.customMarker}>
              <Text style={styles.customMarkerText}>B</Text>
            </View>
          </Marker>
        )}
        <Polyline
          coordinates={coords.map(([lat, lng]) => ({
            latitude: lat,
            longitude: lng,
          }))}
          strokeWidth={4}
          strokeColor="#0c9fe3"
        />
      </MapView>

      {/* Lista de cidades no trajeto */}
      <View style={styles.listContainer}>
        <Text style={styles.title}>Cidades no trajeto:</Text>
        <FlatList
          ref={flatListRef}
          data={cities}
          keyExtractor={item => item}
          renderItem={({item}) => {
            const isChecked = selectedCities.some(
              e => e.split('#')[0] === item,
            );
            const entry =
              selectedCities.find(e => e.split('#')[0] === item) || '';
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
            marginTop: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.returnButton, {width: '37%'}]}>
            <Text style={[styles.addButtonText, {color: '#353437'}]}>
              Voltar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setModalVisible(true);
              setPresetCityName(null);
            }}
            style={[
              styles.addButton,
              {width: 60, height: 60, borderRadius: 30, marginRight: 10},
            ]}>
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              colors={['rgb(26, 127, 231)', 'rgb(25, 196, 201)']}
              locations={[0, 0.4]}
              style={{
                flex: 1,
                width: '100%',
                borderRadius: 30,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={[styles.addButtonText, {fontSize: 28}]}>+</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              /*const {
                cidades_trajeto: cidades_trajeto,
              } = await getStoredData();

              console.log(cidades_trajeto)

              //alert('ok')
              return*/

              navigation.navigate('EspacoDisponivelNaMala');
            }}
            style={[
              styles.addButton,
              {width: '40%', height: 55, marginTop: -5},
            ]}>
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              colors={['rgb(26, 127, 231)', 'rgb(25, 196, 201)']}
              locations={[0, 0.4]}
              style={{
                flex: 1,
                width: '100%',
                borderRadius: 25,
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 12,
              }}>
              <Text style={styles.addButtonText}>Próximo</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal Alerta */}
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

      {/* Modal de adição */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
        onShow={() => {
          if (!presetCityName) {
            setTimeout(() => {
              inputRef.current?.focus();
              setTecladoAtivo(true);
            }, 500);
          }
        }}>
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
                  ref={inputRef}
                  caretHidden={!tecladoAtivo}
                  placeholder="Nome da cidade"
                  value={presetCityName || manualCityInput}
                  editable={!presetCityName}
                  onChangeText={text => {
                    setManualCityInput(text);

                    if (debounceRef.current) {
                      clearTimeout(debounceRef.current);
                    }

                    if (!text.trim()) {
                      setAutocompleteResults([]);
                      setManualCityInput('');
                      return;
                    }

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
                      fontSize: 15,
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
                        onPress={() => addCityToField(city)}>
                        <Text style={styles.autocompleteItem}>{city}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                {horasRotaSelecionada >= 14 && (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.pickerButton,
                        {
                          backgroundColor: '#fff',
                          marginTop: 10,
                          paddingLeft: 15,
                          borderRadius: 10,
                          height: 45,
                          justifyContent: 'center',
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
                          marginTop: 10,
                          paddingLeft: 15,
                          borderRadius: 10,
                          height: 45,
                          justifyContent: 'center',
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

                <TouchableOpacity
                  onPress={() => handleAddCity(manualCityInput)}
                  style={{
                    backgroundColor: '#0c9fe3',
                    padding: 11,
                    borderRadius: 25,
                    alignItems: 'center',
                    marginTop: 15,
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: 4,
                  }}>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 16,
                      fontFamily: 'Montserrat-Regular',
                    }}>
                    Adicionar
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

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
    </SafeAreaView>
  );
}

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
    maxHeight: 350,
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 17,
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
  cityText: {fontSize: 15, fontFamily: 'Montserrat-Regular', color: '#333'},
  dateTimeText: {fontSize: 13, fontFamily: 'Montserrat-Regular', color: '#666', marginTop: 4},
  returnButton: {
    flex: 1,
    height: 55,
    backgroundColor: 'rgb(232, 232, 232)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {color: '#fff', fontSize: 16, fontFamily: 'Montserrat-Bold'},

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
    fontSize: 16,
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
    fontSize: 15,
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
  },
  customMarker: {
    backgroundColor: '#3b82f6',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    // Sombra para iOS
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Sombra para Android
    elevation: 5,
  },
  customMarkerText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
