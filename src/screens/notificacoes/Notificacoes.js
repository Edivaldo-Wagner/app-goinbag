import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  ActivityIndicator,
  useWindowDimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {Swipeable, GestureHandlerRootView} from 'react-native-gesture-handler';
import HeaderCarteiro from '../../components/headerCarteiro/HeaderCarteiro';
import HeaderCliente from '../../components/headerCliente/HeaderCliente';
import HeaderDestinatario from '../../components/headerDestinatario/HeaderDestinatario';
import UseNotificacoesGerais from '../../hooks/UseNotificacoes/UseNotificacoesGerais';
import UseRemoverNotificacoesGerais from '../../hooks/UseRemoverNotificacoesGerais/UseRemoverNotificacoesGerais';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';

dayjs.extend(relativeTime);
dayjs.locale('pt-br');

const URL_MAIN = Config.URL_MAIN;

export default function Notificacoes() {
  const navigation = useNavigation();
  const {width} = useWindowDimensions();
  const screenWidth = Dimensions.get('window').width;

  const [sendingData, setsendingData] = useState(false);
  const [logadoComo, setLogadoComo] = useState(null);
  const [notificacoes, setNotificacoes] = useState([]);

  const {
    notificacoesGerais,
    loadingNotificacoesGerais,
    buscarNotificacoesGerais,
  } = UseNotificacoesGerais();

  const {removendoNotificacoesGerais, loadingRemoverNotificacoesGerais} =
    UseRemoverNotificacoesGerais();

  const swipeableRefs = useRef({}); // ✅ refs por ID

  useEffect(() => {
    const buscarTipoUsuario = async () => {
      const tipo = await AsyncStorage.getItem('logar_como');
      setLogadoComo(tipo);
    };

    buscarTipoUsuario();
  }, []);

  useEffect(() => {
    setNotificacoes(notificacoesGerais);
  }, [notificacoesGerais]);

  const formatarDataNotificacao = dataString => {
    return dayjs(dataString).fromNow();
  };

  const removerNotificacao = async idNotificacao => {
    setsendingData(true);
    const notificacaoRemovida = await removendoNotificacoesGerais(
      idNotificacao,
    );
    if (notificacaoRemovida.status === 'sucesso') {
      setTimeout(async () => {
        await buscarNotificacoesGerais();
        setsendingData(false);
      }, 1000);
    }
  };

  const renderRightActions = id => (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 20,
      }}>
      <TouchableOpacity
        disabled={sendingData}
        onPress={() => removerNotificacao(id)}
        style={{
          backgroundColor: '#b20d26',
          paddingVertical: 10,
          paddingHorizontal: 15,
          marginLeft: 20,
          borderRadius: 6,
        }}>
        {!sendingData ? (
          <Text
            style={{
              color: '#fff',
              fontFamily: 'Montserrat-Bold',
              fontSize: 15,
            }}>
            Remover
          </Text>
        ) : (
          <ActivityIndicator size="small" color="#e3e3e3" />
        )}
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => {
    if (logadoComo === 'Viajante') return <HeaderCarteiro />;
    if (logadoComo === 'Cliente') return <HeaderCliente />;
    if (logadoComo === 'Destinatario' || logadoComo === 'Destinatário')
      return <HeaderDestinatario />;
    return null;
  };

  if (loadingNotificacoesGerais || logadoComo === null) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#007ACC" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      {renderHeader()}
      <ScrollView style={{flex: 1, backgroundColor: '#F4F6FA'}}>
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 16,
            backgroundColor: '#f5f5f5',
            borderBottomWidth: 1,
            borderBottomColor: '#ddd',
          }}>
          <Text
            style={{
              fontSize: 22,
              fontFamily: 'Montserrat-Bold',
              color: '#353738',
            }}>
            {logadoComo === 'Viajante' && 'Dashboard do Carteiro'}
            {logadoComo === 'Cliente' && 'Dashboard do Cliente'}
            {(logadoComo === 'Destinatario' || logadoComo === 'Destinatário') &&
              'Dashboard do Destinatário'}
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: '#666',
              fontFamily: 'Montserrat-Regular',
              marginTop: 4,
            }}>
            Início / Notificações
          </Text>
        </View>

        <View style={{marginTop: 20}}>
          <View style={{width: '95%', alignSelf: 'center'}}>
            {notificacoes.map(notificacao => (
              <Swipeable
                key={notificacao.id}
                ref={ref => {
                  if (ref) swipeableRefs.current[notificacao.id] = ref;
                }}
                onSwipeableWillOpen={() => {
                  // ✅ Fecha os outros Swipeables com leve delay para evitar conflito
                  setTimeout(() => {
                    Object.entries(swipeableRefs.current).forEach(
                      ([id, ref]) => {
                        if (id !== notificacao.id.toString() && ref?.close) {
                          ref.close();
                        }
                      },
                    );
                  }, 10);
                }}
                renderRightActions={() => renderRightActions(notificacao.id)}>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    marginBottom: 15,
                    backgroundColor: '#fff',
                    padding: 10,
                    borderRadius: 10,
                  }}>
                  <Image
                    source={{
                      uri: `${URL_MAIN}/views/painel-controle-carteiro/img-carteiro/${notificacao.serie_quem_notificou}/img.png`,
                    }}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      marginRight: 10,
                    }}
                  />
                  <View style={{flex: 1}}>
                    <Text
                      style={{
                        color: '#00AEEF',
                        fontSize: 17,
                        fontFamily: 'Montserrat-Bold',
                        marginBottom: 4,
                      }}>
                      Nova Notificação
                    </Text>
                    <Text
                      numberOfLines={2}
                      style={{
                        color: '#555',
                        fontSize: 16,
                        fontFamily: 'Montserrat-Regular',
                      }}>
                      {notificacao.notificacao}
                    </Text>
                    <Text style={{fontSize: 12, color: '#888', marginTop: 5}}>
                      {formatarDataNotificacao(notificacao.data)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Swipeable>
            ))}
          </View>
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
}
