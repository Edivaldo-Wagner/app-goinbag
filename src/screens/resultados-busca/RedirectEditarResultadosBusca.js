import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

export default function RedirectEditarResultadosBusca() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.navigate('ResultadosBusca');
  }, []); // <- Executa apenas uma vez, após montagem

  return null; // ou um <View /> vazio, se quiser evitar uma tela branca
}
