import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Alert} from 'react-native';
import Config from 'react-native-config';

const GOOGLE_API_KEY = Config.GOOGLE_API_KEY;

const SearchTrens = ({inputText, onTremStopSelect}) => {
  const [sugestoes, setSugestoes] = useState([]);

  useEffect(() => {
    const fetchTrainStations = async () => {
      if (!inputText || inputText.length < 2) {
        setSugestoes([]);
        return;
      }

      const query = encodeURIComponent(`estação de trem ${inputText} Brasil`);
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${GOOGLE_API_KEY}&language=pt&region=BR`;

      try {
        const response = await fetch(url);
        const json = await response.json();

        if (json.status === 'OK') {
          const results = json.results.filter(result => {
            const isTrainStation =
              result.types?.includes('train_station') ||
              result.types?.includes('transit_station');

            return result.place_id && isTrainStation;
          });

          setSugestoes(results);
        } else {
          console.warn('Erro na busca de estações:', json.status);
          setSugestoes([]);
        }
      } catch (err) {
        console.error('Erro ao buscar estações de trem:', err);
      }
    };

    const timeout = setTimeout(fetchTrainStations, 300);
    return () => clearTimeout(timeout);
  }, [inputText]);

  const buscarDetalhesDoLugar = async placeId => {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY}&language=pt`;
    try {
      const response = await fetch(url);
      const json = await response.json();

      if (json.status === 'OK') {
        const {name, formatted_address, geometry} = json.result;
        if (!geometry || !geometry.location) {
          Alert.alert('Erro', 'Local sem coordenadas disponíveis.');
          return null;
        }

        return {
          name,
          formatted_address,
          location: geometry.location,
        };
      } else {
        console.warn('Erro na busca de detalhes:', json.status);
        return null;
      }
    } catch (err) {
      console.error('Erro ao buscar detalhes do lugar:', err);
      return null;
    }
  };

  const handleSelect = async item => {
    const placeDetails = await buscarDetalhesDoLugar(item.place_id);
    if (!placeDetails) {
      Alert.alert('Erro', 'Falha ao obter detalhes do local.');
      return;
    }

    onTremStopSelect(placeDetails);
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
              fontSize: 17,
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

export default SearchTrens;
