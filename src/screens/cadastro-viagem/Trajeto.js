import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LocalizacaoAtual from '../../components/localizacaoAtual/LocalizacaoAtual';
import MapView, {Marker, Polyline} from 'react-native-maps';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import Config from 'react-native-config';
import LinearGradient from 'react-native-linear-gradient';
import {getSecureData} from '../../utils/secureStorage';
import {
  saveToGlobalState,
  getStoredData,
  removeSpecificData,
  clearAppState,
} from '../../utils/storage';

const {width} = Dimensions.get('window');

const TrajetoCarro = () => {
  const navigation = useNavigation();
  const mapRef = useRef(null);
  const [origemCoords, setOrigemCoords] = useState(null);
  const [destinoCoords, setDestinoCoords] = useState(null);
  const [rotas, setRotas] = useState([]);
  const [rotaSelecionada, setRotaSelecionada] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [dadosArmazenados, setDadosArmazenados] = useState(null);

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

  // Busca coordenadas de origem/destino
  useEffect(() => {
    (async () => {
      await removeSpecificData('cidades_trajeto');

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

      if (latO && lngO) {
        setOrigemCoords({lat: parseFloat(latO), lng: parseFloat(lngO)});
      }
      if (latD && lngD) {
        setDestinoCoords({lat: parseFloat(latD), lng: parseFloat(lngD)});
      }
    })();
  }, []);

  // Quando tivermos origem e destino, já chama o Directions API
  useEffect(() => {
    if (origemCoords && destinoCoords) {
      buscarRotasAlternativas();
    }
  }, [origemCoords, destinoCoords]);

  // Ajusta zoom sempre que a rota muda
  useEffect(() => {
    if (rotaSelecionada) {
      ajustarZoomParaRota(rotaSelecionada.coordenadas);
    }
  }, [rotaSelecionada]);

  const ajustarZoomParaRota = coordenadas => {
    if (mapRef.current && coordenadas.length) {
      mapRef.current.fitToCoordinates(coordenadas, {
        edgePadding: {top: 80, right: 80, bottom: 80, left: 80},
        animated: true,
      });
    }
  };

  const buscarRotasAlternativas = async () => {
    const origin = `${origemCoords.lat},${origemCoords.lng}`;
    const destination = `${destinoCoords.lat},${destinoCoords.lng}`;
    const apiKey = Config.GOOGLE_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&alternatives=true&key=${apiKey}&mode=driving&language=pt-BR`;

    try {
      const resp = await fetch(url);
      const data = await resp.json();

      if (!data.routes.length) {
        console.warn('Nenhuma rota encontrada');
        return;
      }

      // Decodifica e formata cada rota
      const rotasDecodificadas = data.routes.map((rota, idx) => {
        const pontos = decodePolyline(rota.overview_polyline.points);
        const coords = pontos.map(([lat, lng]) => ({
          latitude: lat,
          longitude: lng,
        }));
        const durSec = rota.legs[0].duration.value;
        const h = Math.floor(durSec / 3600);
        const m = Math.floor((durSec % 3600) / 60);
        return {
          id: idx.toString(),
          coordenadas: coords,
          resumo: rota.summary,
          distancia: rota.legs[0].distance.text,
          duracao: `${h} horas ${m} minutos`,
          horas: h,
        };
      });

      setRotas(rotasDecodificadas);

      // Carrega rota salva ou usa a primeira
      const state = await getStoredData();
      const saved = state['rota_selecionada'];

      let inicial = rotasDecodificadas[0];
      if (saved) {
        const idxSalvo = parseInt(saved.replace('opcao-rota-', ''), 10) - 1;
        if (rotasDecodificadas[idxSalvo]) {
          inicial = rotasDecodificadas[idxSalvo];
        }
      }
      await selecionarRota(inicial);
    } catch (err) {
      console.error('Erro ao buscar rotas:', err);
    }
  };

  const decodePolyline = encoded => {
    let points = [];
    let index = 0,
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
      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;
      points.push([lat / 1e5, lng / 1e5]);
    }
    return points;
  };

  const selecionarRota = async rota => {
    setRotaSelecionada(rota);
    await saveToGlobalState({
      'rota_selecionada': `opcao-rota-${parseInt(rota.id, 10)}`,
      'horas_rota_selecionada': rota.horas.toString(),
    });
  };

  const redirecionarCidadesTrajeto = async () => {
    await removeSpecificData('cidades_trajeto');
    navigation.navigate('CidadesTrajeto');
  };

  const renderItem = ({item}) => {
    const isSel = rotaSelecionada?.id === item.id;
    return (
      <View
        style={[styles.rotaItemContainer, isSel && styles.rotaItemSelecionado]}>
        <TouchableOpacity
          style={styles.rotaInfo}
          onPress={async () => {
            await selecionarRota(item);
            setModalVisible(false);
          }}>
          <Text style={styles.rotaTexto}>{item.resumo}</Text>
          <Text style={styles.rotaTexto}>
            {item.distancia} – {item.duracao}
          </Text>
        </TouchableOpacity>
        {isSel && (
          <TouchableOpacity
            style={styles.botaoProximo}
            onPress={redirecionarCidadesTrajeto}>
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
              <Text style={styles.botaoTexto}>Próximo</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#0a768f'}} edges={['top', 'left', 'right']}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#0a768f" 
        translucent={false} 
      />
    <View style={{flex: 1}}>
      <LocalizacaoAtual />
      <TouchableOpacity
        style={styles.botaoVoltar}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}>
        <MaterialIcon
          name="arrow-back-ios"
          size={30}
          color="#808080"
          style={{marginLeft: 10}}
        />
      </TouchableOpacity>

      <MapView
        ref={mapRef}
        style={{flex: 1}}
        initialRegion={{
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
            title={dadosArmazenados?.cidadeOrigem}
            // tracksViewChanges={false} // Ative se houver lentidão no Android
          >
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
            title={dadosArmazenados?.cidadeDestino}
            // tracksViewChanges={false} // Ative se houver lentidão no Android
          >
            <View style={styles.customMarker}>
              <Text style={styles.customMarkerText}>B</Text>
            </View>
          </Marker>
        )}
        {rotaSelecionada && (
          <Polyline
            coordinates={rotaSelecionada.coordenadas}
            strokeColor="#0c9fe3"
            strokeWidth={4}
          />
        )}
      </MapView>

      <FlatList
        data={rotas}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        style={styles.listaRotas}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Todas as rotas</Text>
            <ScrollView>
              {rotas.map(r => (
                <TouchableOpacity
                  key={r.id}
                  style={[
                    styles.rotaItemContainer,
                    rotaSelecionada?.id === r.id && styles.rotaItemSelecionado,
                  ]}
                  onPress={async () => {
                    await selecionarRota(r);
                    setModalVisible(false);
                  }}>
                  <Text style={styles.rotaTexto}>{r.resumo}</Text>
                  <Text style={styles.rotaTexto}>
                    {r.distancia} – {r.duracao}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.botaoFechar}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.rotaTexto}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  botaoVoltar: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
  },
  botaoVoltarTexto: {
    fontSize: 18,
    color: '#000',
  },

  listaRotas: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    zIndex: 1,
  },
  rotaItemContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  rotaItemSelecionado: {
    backgroundColor: '#d0ebff',
  },
  rotaInfo: {
    flex: 1,
    marginRight: 10,
  },
  rotaTexto: {
    color: '#000',
  },
  botaoProximo: {
    width: '25%',
    marginLeft: 10,
    padding: 0,
    overflow: 'hidden',
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    maxHeight: '80%',
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  botaoFechar: {
    marginTop: 20,
    alignItems: 'center',
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
    shadowOffset: { width: 0, height: 2 },
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

export default TrajetoCarro;