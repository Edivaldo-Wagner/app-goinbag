import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Config from 'react-native-config';

const GOOGLE_API_KEY = Config.GOOGLE_API_KEY;

const SearchBuses = ({inputText, onBusStopSelect}) => {
  const [sugestoes, setSugestoes] = useState([]);

  useEffect(() => {
    const fetchBusStations = async () => {
      if (!inputText || inputText.length < 2) {
        setSugestoes([]);
        return;
      }

      const query = encodeURIComponent(`${inputText} rodoviária Brasil`);
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${GOOGLE_API_KEY}&language=pt&region=BR`;

      try {
        const response = await fetch(url);
        const json = await response.json();

        if (json.status === 'OK') {
          const results = json.results.filter(result => {
            const {geometry, types, name} = result;
            const {lat, lng} = geometry.location;

            const isInBrazil =
              lat >= -33.75 && lat <= 5.26 && lng >= -73.99 && lng <= -34.79;

            const isBusStation = types.includes('bus_station');
            const isNotBusStop = !/ponto de ônibus/i.test(name);

            return isInBrazil && isBusStation && isNotBusStop;
          });

          setSugestoes(results);
        } else {
          setSugestoes([]);
        }
      } catch (err) {
        console.error('Erro ao buscar rodoviárias:', err);
      }
    };

    const timeout = setTimeout(fetchBusStations, 300);
    return () => clearTimeout(timeout);
  }, [inputText]);

  const handleSelect = item => {
    if (!item.geometry || !item.geometry.location) {
      Alert.alert('Erro', 'Coordenadas não disponíveis para este local.');
      return;
    }

    onBusStopSelect({
      name: item.name,
      address: item.formatted_address,
      location: item.geometry.location,
    });
  };

  return (
    <View style={{width: '100%'}}>
      {sugestoes.map(item => (
        <TouchableOpacity
          key={item.place_id}
          onPress={() => handleSelect(item)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
            borderBottomWidth: 1,
            borderColor: 'rgba(127, 127, 127, 0.3)',
            backgroundColor: '#fff',
          }}>
          <Text
            style={{
              fontSize: 15,
              fontFamily: 'Montserrat-Regular',
              marginLeft: 5,
              color: 'rgba(0, 0, 0, 0.7)',
            }}>
            {item.name} - {item.formatted_address}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default SearchBuses;
