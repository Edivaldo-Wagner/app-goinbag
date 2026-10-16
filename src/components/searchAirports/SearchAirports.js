import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Config from 'react-native-config'; 

const GOOGLE_API_KEY = Config.GOOGLE_API_KEY;

const SearchAirports = ({ inputText, onCitySelect }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAirports = async () => {
      if (!inputText || inputText.length < 3) {
        setResults([]);
        return;
      }

      setLoading(true);
      const query = encodeURIComponent(`${inputText} aeroporto Brasil`);
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${GOOGLE_API_KEY}&language=pt&region=BR`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK') {
          const filtered = data.results.filter((result) => {
            const name = result.name || '';
            const address = result.formatted_address || '';
            const location = result.geometry?.location;
            const types = result.types || [];

            const lat = location?.lat;
            const lng = location?.lng;

            // Filtros manuais para garantir que o resultado esteja no Brasil e seja um aeroporto válido
            const isInBrazil = lat >= -33.75 && lat <= 5.26 && lng >= -73.99 && lng <= -34.79;
            const isAirport = types.includes('airport');
            const isNotHeliport = !name.toLowerCase().includes('heliponto') && !name.toLowerCase().includes('heliporto');

            return isInBrazil && isAirport && isNotHeliport;
          });

          setResults(filtered);
        } else {
          console.warn('Erro na busca Google Places:', data.status);
          setResults([]);
        }
      } catch (err) {
        console.error('Erro ao buscar aeroportos:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchAirports, 500); // debounce
    return () => clearTimeout(timeout);
  }, [inputText]);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 10 }} size="large" color="#0c9fe3" />;
  }

  return (
    <View style={{ width: '100%' }}>
      {results.length === 0 && inputText.length >= 3 && (
        <Text style={{ marginTop: 10, textAlign: 'center', color: '#777' }}>
          Nenhum aeroporto encontrado no Brasil.
        </Text>
      )}

      {results.map((item) => (
        <TouchableOpacity
          key={item.place_id}
          style={{ padding: 12, borderBottomWidth: 1, borderColor: '#ddd' }}
          onPress={() => onCitySelect(item)}
        >
          <Text style={{ fontSize: 16, color: '#000' }}>{item.name}</Text>
          {item.formatted_address && (
            <Text style={{ fontSize: 14, color: '#666' }}>{item.formatted_address}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default SearchAirports;
