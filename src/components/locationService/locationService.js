import Config from 'react-native-config'; 

const GOOGLE_API_KEY = Config.GOOGLE_API_KEY;

export const getCoordinatesFromAddress = async (address) => {
  if (!address || address.trim() === '') {
    return { latitude: null, longitude: null };
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_API_KEY}`
    );
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { latitude: lat, longitude: lng };
    }

    console.warn('Geocoding sem resultados para:', address);
    return { latitude: null, longitude: null };
  } catch (error) {
    console.error('Erro na requisição da Google API:', error);
    return { latitude: null, longitude: null };
  }
};