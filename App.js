import React, {useEffect} from 'react';
import {Platform, Text, TextInput, Alert, StatusBar, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AuthProvider, useAuth} from './src/context/AuthContext';
import {getApp} from '@react-native-firebase/app';
import {
  getMessaging,
  getToken,
  onTokenRefresh,
  requestPermission,
  AuthorizationStatus,
  onMessage,
} from '@react-native-firebase/messaging';
import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {v4 as uuidv4} from 'uuid';
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;

import Home from './src/screens/home/Home';
import Cadastro from './src/screens/cadastro/Cadastro';
import ConfirmacaoEmail from './src/screens/confirmacao-email/ConfirmacaoEmail';
import ConfirmacaoTelefone from './src/screens/confirmacao-telefone/ConfirmacaoTelefone';

import ResultadosBusca from './src/screens/resultados-busca/ResultadosBusca';
import RedirectEditarResultadosBusca from './src/screens/resultados-busca/RedirectEditarResultadosBusca';

import QualMeioTransporteCadastramento from './src/screens/qual-meio-transporte-cadastramento/QualMeioTransporteCadastramento';
import OpcaoAviao from './src/screens/cadastro-viagem/OpcaoAviao';
import OpcaoCarro from './src/screens/cadastro-viagem/OpcaoCarro';
import Trajeto from './src/screens/cadastro-viagem/Trajeto';
import CidadesTrajeto from './src/screens/cadastro-viagem/CidadesTrajeto';
import OpcaoMoto from './src/screens/cadastro-viagem/OpcaoMoto';
import OpcaoOnibus from './src/screens/cadastro-viagem/OpcaoOnibus';
import OpcaoTrems from './src/screens/cadastro-viagem/OpcaoTrems';
import DataHoraViagem from './src/screens/cadastro-viagem/DataHoraViagem';
import DataHoraDestino from './src/screens/cadastro-viagem/DataHoraDestino';
import EspacoDisponivelNaMala from './src/screens/cadastro-viagem/EspacoDisponivelNaMala';
import InformacaoAVagem from './src/screens/cadastro-viagem/InformacaoAVagem';
import OferecerEspacoNaVolta from './src/screens/cadastro-viagem/OferecerEspacoNaVolta';

/*import OpcaoAviaoRetorno from './src/screens/opcao-aviao-retorno/OpcaoAviaoRetorno';
import OpcaoCarroRetorno from './src/screens/opcao-carro-retorno/OpcaoCarroRetorno';
import OpcaoMotoRetorno from './src/screens/opcao-moto-retorno/OpcaoMotoRetorno';
import OpcaoOnibusRetorno from './src/screens/opcao-onibus-retorno/OpcaoOnibusRetorno';
import OpcaoTremsRetorno from './src/screens/opcao-trems-retorno/OpcaoTremsRetorno';
import DataHoraRetorno from './src/screens/data-hora-retorno/DataHoraRetorno';
import DataHoraDestinoRetorno from './src/screens/data-hora-destino-retorno/DataHoraDestinoRetorno';
import EspacoDisponivelNaMalaRetorno from './src/screens/espaco-disponivel-na-mala-retorno/EspacoDisponivelNaMalaRetorno';
import InformacaoAVagemRetorno from './src/screens/informacao-a-viagem-retorno/InformacaoAVagemRetorno';*/

import FinalizarCadastramentoMala from './src/screens/finalizar-cadastramento-mala/FinalizarCadastramentoMala';
import FinalizarAtualizarMala from './src/screens/finalizar-atualizar-mala/FinalizarAtualizarMala';

import MeuPerfil from './src/components/meuPerfil/MeuPerfil';
import Chat from './src/screens/chat/Chat';
import AcompanhamentoViagem from './src/screens/acompanhamento-viagem/AcompanhamentoViagem';

/*============ PAINEL DO CARTEIRO ================*/
import HeaderCarteiro from './src/components/headerCarteiro/HeaderCarteiro';
import TripsProgressTraveler from './src/screens/painel-controle-carteiro/TripsProgressTraveler';
import DashboardAvailable from './src/screens/painel-controle-carteiro/DashboardAvailable';
import DashboardTraveler from './src/screens/painel-controle-carteiro/DashboardTraveler';
import TripsConcludedTraveler from './src/screens/painel-controle-carteiro/TripsConcludedTraveler';
import TripsNotConcludedTraveler from './src/screens/painel-controle-carteiro/TripsNotConcludedTraveler';
import {PaymentInsurance} from './src/screens/painel-controle-carteiro/PaymentInsurance';
/*============ /PAINEL DO CARTEIRO ================*/

/*============ PAINEL DO CLIENTE ================*/
import HeaderCliente from './src/components/headerCliente/HeaderCliente';
import TripsProgressClient from './src/screens/painel-controle-cliente/TripsProgressClient';
import DashboardClient from './src/screens/painel-controle-cliente/DashboardClient';
import TripsConcludedClient from './src/screens/painel-controle-cliente/TripsConcludedClient';
import TripsNotConcludedClient from './src/screens/painel-controle-cliente/TripsNotConcludedClient';
import {PaymentService} from './src/screens/painel-controle-cliente/PaymentService';
//import AcompanhamentoViagemCliente from './src/screens/painel-controle-cliente/AcompanhamentoViagem';
/*============ /PAINEL DO CLIENTE ================*/

/*============ PAINEL DO DESTINATARIO ================*/
import HeaderDestinatario from './src/components/headerDestinatario/HeaderDestinatario';
import TripsProgressReceiver from './src/screens/painel-controle-destinatario/TripsProgressReceiver';
import DashboardReceiver from './src/screens/painel-controle-destinatario/DashboardReceiver';
import TripsConcludedReceiver from './src/screens/painel-controle-destinatario/TripsConcludedReceiver';
import TripsNotConcludedReceiver from './src/screens/painel-controle-destinatario/TripsNotConcludedReceiver';
/*============ /PAINEL DO DESTINATARIO ================*/

import LoginModal from './src/components/loginModal/LoginModal';

const Stack = createNativeStackNavigator();

// Helper para gerar/pegar device_id único
async function getDeviceId() {
  let deviceId = await AsyncStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = uuidv4();
    await AsyncStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}

// Função central para registrar/atualizar token FCM
async function registerTokenForUser(serie_estrangeira) {
  if (!serie_estrangeira) return;

  const device_id = await getDeviceId();

  const messagingInstance = getMessaging(getApp());
  const token = await getToken(messagingInstance);

  console.log('Enviando token para backend:', token);

  try {
    await fetch(`${URL_MAIN}/controllers/mobile/SalvarFcmTokenController.php`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        serie_estrangeira,
        fcm_token: token,
        device_id,
        device_type: Platform.OS,
        device_name: `${Platform.OS} ${Platform.Version}`,
      }),
    });
  } catch (err) {
    console.log('Erro ao enviar token:', err);
  }
}

// Componente interno que consome o AuthContext e o Navigation
const AppContent = () => {
  const {loginModalVisible, closeLoginModal} = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={Home}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Cadastro"
          component={Cadastro}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ConfirmacaoEmail"
          component={ConfirmacaoEmail}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ConfirmacaoTelefone"
          component={ConfirmacaoTelefone}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ResultadosBusca"
          component={ResultadosBusca}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="RedirectEditarResultadosBusca"
          component={RedirectEditarResultadosBusca}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="QualMeioTransporteCadastramento"
          component={QualMeioTransporteCadastramento}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="OpcaoAviao"
          component={OpcaoAviao}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="OpcaoCarro"
          component={OpcaoCarro}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Trajeto"
          component={Trajeto}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="CidadesTrajeto"
          component={CidadesTrajeto}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="OpcaoMoto"
          component={OpcaoMoto}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="OpcaoOnibus"
          component={OpcaoOnibus}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="OpcaoTrems"
          component={OpcaoTrems}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="DataHoraViagem"
          component={DataHoraViagem}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="DataHoraDestino"
          component={DataHoraDestino}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="EspacoDisponivelNaMala"
          component={EspacoDisponivelNaMala}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="InformacaoAVagem"
          component={InformacaoAVagem}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="OferecerEspacoNaVolta"
          component={OferecerEspacoNaVolta}
          options={{headerShown: false}}
        />

        {/*<Stack.Screen 
        name="OpcaoAviaoRetorno" 
        component={OpcaoAviaoRetorno} 
        options={{ headerShown: false }}
        /> 
        <Stack.Screen 
        name="OpcaoCarroRetorno" 
        component={OpcaoCarroRetorno} 
        options={{ headerShown: false }}
        /> 
        <Stack.Screen 
        name="OpcaoMotoRetorno" 
        component={OpcaoMotoRetorno} 
        options={{ headerShown: false }}
        /> 
        <Stack.Screen 
        name="OpcaoOnibusRetorno" 
        component={OpcaoOnibusRetorno} 
        options={{ headerShown: false }}
        /> 
        <Stack.Screen 
        name="OpcaoTremsRetorno" 
        component={OpcaoTremsRetorno} 
        options={{ headerShown: false }}
        /> 
        <Stack.Screen 
        name="DataHoraRetorno" 
        component={DataHoraRetorno} 
        options={{ headerShown: false }}
        /> 
        <Stack.Screen 
        name="DataHoraDestinoRetorno" 
        component={DataHoraDestinoRetorno} 
        options={{ headerShown: false }}
        /> 
        <Stack.Screen 
        name="EspacoDisponivelNaMalaRetorno" 
        component={EspacoDisponivelNaMalaRetorno} 
        options={{ headerShown: false }}
        /> 
        <Stack.Screen 
        name="InformacaoAVagemRetorno" 
        component={InformacaoAVagemRetorno} 
        options={{ headerShown: false }}
        /> */}

        <Stack.Screen
          name="FinalizarCadastramentoMala"
          component={FinalizarCadastramentoMala}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="FinalizarAtualizarMala"
          component={FinalizarAtualizarMala}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="MeuPerfil"
          component={MeuPerfil}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="Chat"
          component={Chat}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="AcompanhamentoViagem"
          component={AcompanhamentoViagem}
          options={{headerShown: false}}
        />

        {/* PAINEL DO CARTEIRO */}
        <Stack.Screen
          name="HeaderCarteiro"
          component={HeaderCarteiro}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="TripsProgressTraveler"
          component={TripsProgressTraveler}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="DashboardAvailable"
          component={DashboardAvailable}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="DashboardTraveler"
          component={DashboardTraveler}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="TripsConcludedTraveler"
          component={TripsConcludedTraveler}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="TripsNotConcludedTraveler"
          component={TripsNotConcludedTraveler}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="PaymentInsurance"
          component={PaymentInsurance}
          options={{headerShown: false}}
        />
        {/* /PAINEL DO CARTEIRO */}

        {/* PAINEL DO CLIENTE */}
        <Stack.Screen
          name="HeaderCliente"
          component={HeaderCliente}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="TripsProgressClient"
          component={TripsProgressClient}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="DashboardClient"
          component={DashboardClient}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="TripsConcludedClient"
          component={TripsConcludedClient}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="TripsNotConcludedClient"
          component={TripsNotConcludedClient}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="PaymentService"
          component={PaymentService}
          options={{headerShown: false}}
        />
        {/*<Stack.Screen 
        name="AcompanhamentoViagemCliente" 
        component={AcompanhamentoViagemCliente} 
        options={{ headerShown: false }}
        /> */}
        {/* /PAINEL DO CLIENTE */}

        {/* PAINEL DO DESTINATARIO */}
        <Stack.Screen
          name="HeaderDestinatario"
          component={HeaderDestinatario}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="TripsProgressReceiver"
          component={TripsProgressReceiver}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="DashboardReceiver"
          component={DashboardReceiver}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="TripsConcludedReceiver"
          component={TripsConcludedReceiver}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="TripsNotConcludedReceiver"
          component={TripsNotConcludedReceiver}
          options={{headerShown: false}}
        />
        {/* /PAINEL DO DESTINATARIO */}
      </Stack.Navigator>

      <LoginModal
        visible={loginModalVisible}
        onClose={closeLoginModal}
      />
    </NavigationContainer>
  );
};

const App = () => {
  useEffect(() => {
    // Define fonte padrão para Text
    Text.defaultProps = Text.defaultProps || {};
    Text.defaultProps.style = {fontFamily: 'Montserrat-Regular'};

    // Define fonte padrão para TextInput
    TextInput.defaultProps = TextInput.defaultProps || {};
    TextInput.defaultProps.style = {fontFamily: 'Montserrat-Regular'};
  }, []);

  useEffect(() => {
    (async () => {
      const serie_estrangeira = await AsyncStorage.getItem('serie_logado');
      if (!serie_estrangeira) return;

      const messagingInstance = getMessaging(getApp());

      // pedir permissão
      const authStatus = await requestPermission(messagingInstance);

      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('Permissão negada');
        return;
      }

      // salvar token atual
      await registerTokenForUser(serie_estrangeira);

      // escutar atualização de token
      onTokenRefresh(messagingInstance, async () => {
        console.log('Token atualizado');
        await registerTokenForUser(serie_estrangeira);
      });
    })();
  }, []);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    // pedir permissao
    await messaging().requestPermission();

    // criar canal
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });

    // obter token
    const token = await messaging().getToken();

    console.log('TOKEN FCM:');
    console.log(token);

    // mensagem em foreground
    messaging().onMessage(async remoteMessage => {
      console.log('Foreground:', remoteMessage);

      await notifee.displayNotification({
        title: remoteMessage.data?.title,
        body: remoteMessage.data?.body,
        android: {
          channelId: 'default',
        },
      });
    });
  }

  return (
    <SafeAreaProvider>
      <StatusBar 
        backgroundColor="#FF69B4" 
        barStyle="light-content" 
        translucent={false} 
      />
      <View style={{ flex: 1, backgroundColor: '#FF69B4' }}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </View>
    </SafeAreaProvider>
  );
};

export default App;