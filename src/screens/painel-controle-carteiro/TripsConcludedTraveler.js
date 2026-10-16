import React, {useState, useEffect} from 'react';
import {View, Text, ScrollView, ActivityIndicator, StatusBar} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './PainelCarteiro.styles';
import TravelerTripsConcludedNegotiations from './TravelerTripsConcludedNegotiations';
import UseViagensCarteiro from '../../hooks/UseViagens/UseViagensCarteiro';
import HeaderCarteiro from '../../components/headerCarteiro/HeaderCarteiro';

export default function TripsConcludedTraveler() {
  const {viagensEmNegociacaoCarteiro, loadingViagensEmNegociacaoCarteiro} =
    UseViagensCarteiro();

  if (loadingViagensEmNegociacaoCarteiro) {
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
      <HeaderCarteiro />
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
              Dashboard do Viajante
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: '#666',
                fontFamily: 'Montserrat-Regular',
                marginTop: 4,
              }}>
              Início / Viagens Realizadas
            </Text>
          </View>
          <View style={styles.viagensWrapper}>
            <TravelerTripsConcludedNegotiations
              viagensEmNegociacaoCarteiro={viagensEmNegociacaoCarteiro}
            />
          </View>
        </View>
      </ScrollView>
      </SafeAreaView>
    </>
  );
}
