import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Config from 'react-native-config';

const GOOGLE_API_KEY = Config.GOOGLE_API_KEY;

const SearchCities = ({inputText, onCitySelect}) => {
  const [sugestoes, setSugestoes] = useState([]);

  useEffect(() => {
    const fetchCidades = async () => {
      if (!inputText || inputText.length < 2) {
        setSugestoes([]);
        return;
      }

      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${inputText}&types=(cities)&language=pt_BR&key=${GOOGLE_API_KEY}`;
      try {
        const response = await fetch(url);
        const json = await response.json();
        if (json.predictions) {
          // Filtra apenas cidades que estão no Brasil
          const cidadesBrasil = json.predictions.filter(pred =>
            pred.description.toLowerCase().includes(', brasil'),
          );
          setSugestoes(cidadesBrasil);
        }
      } catch (err) {
        console.error('Erro ao buscar cidades:', err);
      }
    };

    const timeout = setTimeout(fetchCidades, 300); // debounce
    return () => clearTimeout(timeout);
  }, [inputText]);

  const handleSelect = async (placeId, description) => {
    try {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,address_components&language=pt_BR&key=${GOOGLE_API_KEY}`;
      const response = await fetch(detailsUrl);
      const json = await response.json();

      const location = json.result?.geometry?.location;
      const components = json.result?.address_components || [];

      const cityComponent =
        components.find(c => c.types.includes('administrative_area_level_2')) ||
        {};
      const cidadeMain = cityComponent.long_name || description.split(',')[0];

      if (location) {
        onCitySelect({
          name: description,
          geometry: {location},
          city: cidadeMain,
        });
      } else {
        console.warn('Localização não encontrada');
      }
    } catch (err) {
      console.error('Erro ao buscar detalhes do local:', err);
    }
  };

  return (
    <View style={{width: '100%'}}>
      {sugestoes.map(item => (
        <TouchableOpacity
          key={item.place_id}
          onPress={() => handleSelect(item.place_id, item.description)}
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
            {item.description}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default SearchCities;
