//Home
import React from 'react';
import {
  View,
  Text,
  useWindowDimensions,
  Image,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';

import Header from '../../components/header/Header';
import Search from '../../components/search/Search';
import {saveToGlobalState} from '../../utils/storage';
import {getSecureData, clearSecureStorage} from '../../utils/secureStorage';
import LocalizacaoAtual from '../../components/localizacaoAtual/LocalizacaoAtual';
import {useAuth} from '../../context/AuthContext';
import logo from '../../assets/logo/logo.png';
import styles from './Home.styles';

const Home = () => {
  const navigation = useNavigation();
  const {width, height} = useWindowDimensions();

  const {openLoginModal} = useAuth(); 

  const oferecerMala = async () => { 
    try {
      const refresh_token = await getSecureData('refresh_token');
      if (!refresh_token) {
          await saveToGlobalState({ logar_como: 'VIAJANTE' });
          openLoginModal("VIAJANTE") 
          return;
        }
      navigation.navigate('QualMeioTransporteCadastramento');
    } catch (error) {
      console.log('Erro ao consultar sessão:', error);
    }
  };

  const isLandscape = width > height;
  const fontSizeEnvioEncomendasResponsiva = isLandscape
    ? width * 0.6
    : width * 0.090;
  const lineHeightEnvioEncomendasResponsiva = isLandscape ? 52 : 35;
  const fontSizeGanheDinheiroExtra = isLandscape ? width * 0.047 : width * 0.046;

  const handleSearchNavigation = dadosBusca => {
   navigation.navigate('ResultadosBusca', dadosBusca);
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#0a768f'}} edges={['top', 'left', 'right']}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#0a768f" 
        translucent={false} 
      />
      <View style={{flex: 1, backgroundColor: '#f0eded'}}>
        <ScrollView 
          contentContainerStyle={{flexGrow: 1, paddingBottom: 90}}
          showsVerticalScrollIndicator={false}>
          <LinearGradient colors={['#f0eded', '#f0eded']}>
            <View style={{alignItems: 'center'}}>
              <Image
                source={logo}
                style={{marginTop: -25, height: 130}}
                resizeMode="contain"
              />

              <View style={{width: '90%', marginTop: -25}}>
                <Text
                  style={{
                    fontSize: fontSizeEnvioEncomendasResponsiva,
                    lineHeight: lineHeightEnvioEncomendasResponsiva,
                    fontFamily: 'Montserrat-Bold',
                    color: '#12304a', 
                    width: '98%',
                  }}>
                  O envio de{'\n'}encomendas de {'\n'}longa distância {'\n'}evoluiu!
                </Text>

                <Text
                  style={{
                    fontSize: fontSizeGanheDinheiroExtra,
                    color: 'rgba(106, 115, 132, 0.7)',
                    fontFamily: 'Montserrat-Bold',
                    lineHeight: 28,
                    marginTop: 10,
                    marginLeft: -25,
                    width: '90%',
                    alignSelf: 'center',
                  }}>
                  Ganhe dinheiro extra levando encomendas ao viajar.
                </Text>

                <TouchableOpacity
                  onPress={oferecerMala}
                  activeOpacity={0.8}
                  style={{
                    width: '80%',
                    marginTop: 10,
                    borderRadius: 999,
                    backgroundColor: '#1a7fe7',
                    shadowColor: '#1576e9',
                    shadowOffset: {width: 0, height: 16},
                    shadowOpacity: 0.12,
                    shadowRadius: 15,
                    elevation: 4,
                  }}>
                  <LinearGradient
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    colors={['#1a7fe7', '#19c4c9']}
                    style={{
                      padding: 8,
                      borderRadius: 999,
                      width: '100%',
                    }}>
                    <Text
                      style={{
                        color: '#fff',
                        textAlign: 'center',
                        fontSize: 17,
                        fontFamily: 'Montserrat-Bold',
                      }}>
                      Ofereça sua mala
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <View style={{marginTop: 15}}>
                  <Search onSearch={handleSearchNavigation} />
                </View>
              </View>
            </View>
          </LinearGradient>
        </ScrollView>

        <LocalizacaoAtual />
        <Header />
      </View>
    </SafeAreaView>
  );
};

export default Home;