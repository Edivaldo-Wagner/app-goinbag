import React, {useState, useEffect} from 'react';
import {View, Text, ActivityIndicator, ScrollView, StatusBar} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './PainelDestinatario.styles';
import EncomendasNaoEfetivadas from './EncomendasNaoEfetivadas';
import UseViagensNaoEfetivadasDestinatario from '../../hooks/UseViagens/UseViagensNaoEfetivadasDestinatario';
import HeaderDestinatario from '../../components/headerDestinatario/HeaderDestinatario';

export default function TripsNotConcludedReceiver() {
  const {
    viagensNaoEfetivadasDestinatario,
    loadingViagensNaoEfetivadasDestinatario,
  } = UseViagensNaoEfetivadasDestinatario();

  if (loadingViagensNaoEfetivadasDestinatario) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#007ACC" />
      </View>
    );
  }

  return (
    <>
      <SafeAreaView style={{flex: 1, backgroundColor: '#0a768f'}} edges={['top', 'left', 'right']}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#0a768f" 
        translucent={false} 
      />
      <HeaderDestinatario />

      <ScrollView style={styles.container}>
        <View style={{marginTop: 0}}>
          <View
            style={{
              paddingHorizontal: 20,
              marginBottom: -16,
              backgroundColor: '#e8eef6bd',
            }}>
            <Text
              style={{
                fontSize: 20,
                fontFamily: 'Montserrat-Bold',
                color: '#007aff',
              }}>
              Dashboard do Destinatário
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: '#666',
                fontFamily: 'Montserrat-Regular',
                marginTop: 4,
              }}>
              Início / Encomendas não Efetivadas
            </Text>
          </View>
          <View style={styles.viagensWrapper}>
            <EncomendasNaoEfetivadas
              viagensNaoEfetivadasDestinatario={
                viagensNaoEfetivadasDestinatario
              }
              loadingViagensNaoEfetivadasDestinatario={
                loadingViagensNaoEfetivadasDestinatario
              }
            />
          </View>
        </View>
      </ScrollView>
      </SafeAreaView>
    </>
  );
}
