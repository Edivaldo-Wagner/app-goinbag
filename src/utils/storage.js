import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@goinbag:app_state';

export const saveToGlobalState = async newData => {
  const rawState = await AsyncStorage.getItem(STORAGE_KEY);
  const currentState = rawState ? JSON.parse(rawState) : {};

  const updatedState = {
    ...currentState,
    ...newData,
  };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
};

export const getStoredData = async () => {
  const rawState = await AsyncStorage.getItem(STORAGE_KEY);
  return rawState ? JSON.parse(rawState) : {};
};

export const removeSpecificData = async keyToRemove => {
  const rawState = await AsyncStorage.getItem(STORAGE_KEY);

  if (!rawState) return;

  const currentState = JSON.parse(rawState);

  delete currentState[keyToRemove];

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
};

export const clearAppState = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};
