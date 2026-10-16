import * as Keychain from 'react-native-keychain';

export const saveSecureData = async (key, value) => {
  await Keychain.setGenericPassword(key, JSON.stringify(value), {
    service: key,
  });
};

export const getSecureData = async key => {
  const credentials = await Keychain.getGenericPassword({
    service: key,
  });

  if (!credentials) {
    return null;
  }

  try {
    return JSON.parse(credentials.password);
  } catch {
    return credentials.password;
  }
};

export const removeSecureData = async key => {
  await Keychain.resetGenericPassword({
    service: key,
  });
};

export const clearSecureStorage = async () => {
  await Keychain.resetGenericPassword({
    service: 'refresh_token',
  });
};
