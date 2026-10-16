// SearchAllCityGoogleMaps.js
import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, FlatList, Keyboard} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Config from 'react-native-config';

const GOOGLE_API_KEY = Config.GOOGLE_API_KEY;

const SearchAllCityGoogleMaps = ({inputText, onCitySelect}) => {
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
          setSugestoes(json.predictions);
        }
      } catch (err) {
        console.error('Erro ao buscar cidades:', err);
      }
    };

    const timeout = setTimeout(fetchCidades, 300); // debounce
    return () => clearTimeout(timeout);
  }, [inputText]);

  const handleSelect = description => {
    Keyboard.dismiss();
    if (onCitySelect) {
      onCitySelect(description);
    }
  };

  return (
    <FlatList
      data={sugestoes}
      keyExtractor={item => item.place_id}
      keyboardShouldPersistTaps="handled"
      style={{width: '100%'}}
      renderItem={({item}) => (
        <TouchableOpacity
          onPress={() => handleSelect(item.description)}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
            borderBottomWidth: 1,
            borderColor: 'rgba(127, 127, 127, 0.3)',
            backgroundColor: '#fff',
          }}>
          <MaterialIcon name="location-on" size={28} color="#0FB3FF" />
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
      )}
    />
  );
};

export default SearchAllCityGoogleMaps;
