import Config from 'react-native-config';

const URL_MAIN = Config.URL_MAIN;

export default async function fetchViagensEmNegociacao(authFetch) {
  console.log('=== fetchViagensEmNegociacao ===');
  console.log('URL_MAIN:', URL_MAIN);
  console.log('authFetch:', authFetch);

  const response = await authFetch(
    `${URL_MAIN}/api/client-trip-negotiations/`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  console.log('status:', response.status);
  console.log('ok:', response.ok);

  return response;
}
