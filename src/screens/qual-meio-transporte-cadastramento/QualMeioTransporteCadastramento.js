import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, Image, ScrollView, StatusBar} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header/Header';
import SidebarLandingPage from '../../components/sidebarDashboard/SidebarLandingPage';
import {useNavigation} from '@react-navigation/native';
import styles from './QualMeioTransporteCadastramento.styles';

import Airplane from '../../assets/images/airplane.png';
import Bus from '../../assets/images/bus.png';
import Car from '../../assets/images/car.png';
import Motorcycle from '../../assets/images/motorcycle.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getSecureData} from '../../utils/secureStorage';
import {saveToGlobalState, removeSpecificData} from '../../utils/storage';

const transportes = [
  {nome: 'Avião', icon: Airplane, height: 65},
  {nome: 'Ônibus', icon: Bus, height: 50},
  {nome: 'Carro', icon: Car, height: 70},
  {nome: 'Moto', icon: Motorcycle, height: 55},
];

export default function QualMeioTransporteCadastramento() {
  const navigation = useNavigation();
  const [selecionado, setSelecionado] = useState('');

  useEffect(() => {
  const redirectLogin = async () => {
    try {
      const refresh_token = await getSecureData('refresh_token');
      if (!refresh_token) {
        await saveToGlobalState({ logar_como: 'VIAJANTE' });
        navigation.reset({
          index: 1,
          routes: [
            { name: 'Home' },
            { name: 'Login' },
          ],
        });
        return;
      }
    } catch (error) {}
  };
  redirectLogin();
}, []);

  const handleSelectTransport = async nome => {
    setSelecionado(nome);

    await removeSpecificData('cidade_origem');
    await removeSpecificData('cidade_origem_main');
    await removeSpecificData('cidade_destino');
    await removeSpecificData('cidade_destino_main');
    await removeSpecificData('cidades_trajeto');
    await removeSpecificData('lat_cidade_origem');
    await removeSpecificData('lng_cidade_origem');
    await removeSpecificData('lat_cidade_destino');
    await removeSpecificData('lng_cidade_destino');
    await removeSpecificData('dia_mes_ano_ida_viagem');
    await removeSpecificData('dia_mes_ano_ida_viagem_para_busca');
    await removeSpecificData('dia_mes_ano_ida_destino');
    await removeSpecificData('dia_mes_ano_ida_destino_para_busca');
    await removeSpecificData('horas_ida_viagem');
    await removeSpecificData('horas_ida_destino');
    await removeSpecificData('rota_selecionada');
    await removeSpecificData('horas_rota_selecionada');
    await removeSpecificData('editar_trajeto');
    await removeSpecificData('id');
    await removeSpecificData('pais_origem');
    await removeSpecificData('pais_destino');
    await removeSpecificData('select_espaco_mala');
    await removeSpecificData('qual_meio_transporte');
    await removeSpecificData('voltando_trajeto');
    await removeSpecificData('informacao_a_viagem');

    if (nome === 'Avião') {
      await saveToGlobalState({qual_meio_transporte: 'aviao'});
      navigation.navigate('OpcaoAviao');
    } else if (nome === 'Ônibus') {
      await saveToGlobalState({qual_meio_transporte: 'onibus'});
      navigation.navigate('OpcaoOnibus');
    } else if (nome === 'Carro') {
      await saveToGlobalState({qual_meio_transporte: 'carro'});
      navigation.navigate('OpcaoCarro');
    } else if (nome === 'Moto') {
      await saveToGlobalState({qual_meio_transporte: 'moto'});
      navigation.navigate('OpcaoMoto');
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#0a768f'}} edges={['top', 'left', 'right']}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#0a768f" 
        translucent={false} 
      />
    <View style={styles.screenContainer}>
      <SidebarLandingPage backgroundColor="#f0eded" />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text style={styles.titleText}>
            QUAL SERÁ O MEIO DE TRANSPORTE QUE VOCÊ IRÁ VIAJAR?
          </Text>

          <View style={styles.cardsGrid}>
            {transportes.map(item => {
              const ativo = selecionado === item.nome;

              return (
                <TouchableOpacity
                  key={item.nome}
                  activeOpacity={0.7}
                  style={[styles.box, ativo && styles.boxSelecionado]}
                  onPress={() => handleSelectTransport(item.nome)}>
                  <View style={styles.boxInternal}>
                    <View style={styles.label}>
                      <Text style={styles.labelText}>{item.nome}</Text>
                    </View>

                    <View style={styles.imageContainer}>
                      <Image
                        source={item.icon}
                        style={{
                          height: item.height,
                        }}
                        resizeMode="contain"
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <Header />
    </View>
    </SafeAreaView>
  );
}