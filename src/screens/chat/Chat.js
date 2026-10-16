import {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import logo from '../../assets/logo/mini-logo.png';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import Config from 'react-native-config';
import UseChat from '../../hooks/UseChat/UseChat';
import UseInserirChat from '../../hooks/UseInserirChat/UseInserirChat';

const URL_MAIN = Config.URL_MAIN;

function formatarTempoRelativo(dataString) {
  const agora = new Date();
  const dataMensagem = new Date(dataString.replace(' ', 'T'));
  const diffMs = agora - dataMensagem;
  const diffSegundos = Math.floor(diffMs / 1000);
  const diffMinutos = Math.floor(diffSegundos / 60);
  const diffHoras = Math.floor(diffMinutos / 60);
  const diffDias = Math.floor(diffHoras / 24);
  const diffSemanas = Math.floor(diffDias / 7);
  const diffMeses = Math.floor(diffDias / 30);
  const diffAnos = Math.floor(diffDias / 365);

  if (diffSegundos < 60)
    return diffSegundos <= 1 ? 'Há 1 segundo' : `Há ${diffSegundos} segundos`;
  if (diffMinutos < 60)
    return diffMinutos === 1 ? 'Há 1 minuto' : `Há ${diffMinutos} minutos`;
  if (diffHoras < 24)
    return diffHoras === 1 ? 'Há 1 hora' : `Há ${diffHoras} horas`;
  if (diffDias < 7) return diffDias === 1 ? 'Há 1 dia' : `Há ${diffDias} dias`;
  if (diffSemanas < 5)
    return diffSemanas === 1 ? 'Há 1 semana' : `Há ${diffSemanas} semanas`;
  if (diffMeses < 12)
    return diffMeses === 1 ? 'Há 1 mês' : `Há ${diffMeses} meses`;
  return diffAnos === 1 ? 'Há 1 ano' : `Há ${diffAnos} anos`;
}

export default function ChatScreen() {
  const navigation = useNavigation();
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [dadosEnvolvidosNoChat, setDadosEnvolvidosNoChat] = useState(null);
  const flatListRef = useRef(null);
  const isAtBottomRef = useRef(true);

  const {inserirChat} = UseInserirChat();
  const {chat, buscarChat} = UseChat();

  useEffect(() => {
    (async () => {
      const valores = await Promise.all(
        [
          'serie_viagem_negociacao_chat',
          'serie_carteiro_chat',
          'nome_carteiro_chat',
          'email_carteiro_chat',
          'serie_cliente_chat',
          'nome_cliente_chat',
          'email_cliente_chat',
          'serie_destinatario_chat',
          'nome_destinatario_chat',
          'email_destinatario_chat',
        ].map(key => AsyncStorage.getItem(key)),
      );

      let tipo_usuario_atual_chat = await AsyncStorage.getItem(
        'tipo_usuario_chat',
      );

      setDadosEnvolvidosNoChat({
        tipo_usuario_atual_chat,
        serie_viagem_negociacao_chat: valores[0],
        serie_carteiro_chat: valores[1],
        nome_carteiro_chat: valores[2],
        email_carteiro_chat: valores[3],
        serie_cliente_chat: valores[4],
        nome_cliente_chat: valores[5],
        email_cliente_chat: valores[6],
        serie_destinatario_chat: valores[7],
        nome_destinatario_chat: valores[8],
        email_destinatario_chat: valores[9],
      });
    })();
  }, []);

  const chatAnteriorRef = useRef([]);

  useEffect(() => {
    const fetchChatComScroll = async () => {
      await buscarChat();

      // Aguarda um pequeno delay para garantir atualização do estado `chat`
      setTimeout(() => {
        const novoUltimoChat = chat[chat.length - 1];
        const ultimoChatAnterior =
          chatAnteriorRef.current[chatAnteriorRef.current.length - 1];

        const novaMensagemChegou =
          !ultimoChatAnterior || // primeira vez
          (novoUltimoChat && ultimoChatAnterior?.data !== novoUltimoChat?.data);

        chatAnteriorRef.current = [...chat];

        if (novaMensagemChegou && isAtBottomRef.current) {
          flatListRef.current?.scrollToEnd({animated: true});
        }
      }, 100); // espera o chat ser atualizado pelo hook
    };

    fetchChatComScroll();

    const intervalId = setInterval(() => {
      fetchChatComScroll();
    }, 3000);

    return () => clearInterval(intervalId);
  }, []); // <- sem dependência

  const enviarChat = async () => {
    if (!mensagem.trim()) return;

    const serie_logado = await AsyncStorage.getItem('serie_logado');
    const tipo_usuario_chat = await AsyncStorage.getItem('tipo_usuario_chat');

    await inserirChat(
      tipo_usuario_chat,
      mensagem,
      serie_logado,
      dadosEnvolvidosNoChat.serie_viagem_negociacao_chat,
      dadosEnvolvidosNoChat.serie_cliente_chat,
      dadosEnvolvidosNoChat.nome_cliente_chat,
      dadosEnvolvidosNoChat.email_cliente_chat,
      dadosEnvolvidosNoChat.serie_carteiro_chat,
      dadosEnvolvidosNoChat.nome_carteiro_chat,
      dadosEnvolvidosNoChat.email_carteiro_chat,
      dadosEnvolvidosNoChat.serie_destinatario_chat,
      dadosEnvolvidosNoChat.nome_destinatario_chat,
      dadosEnvolvidosNoChat.email_destinatario_chat,
    );

    setMensagem('');
    await buscarChat();
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({animated: true});
    }, 100);
  };

  const messages = chat
    .filter(
      item =>
        item.serie_viagem_negociacao ===
        dadosEnvolvidosNoChat?.serie_viagem_negociacao_chat,
    )
    .map((dataChat, index) => {
      let nome = 'Desconhecido';
      let serie_usuario = '';
      if (dataChat.quem_mandou_msg === 'Carteiro')
        nome = `${dadosEnvolvidosNoChat.nome_carteiro_chat} (Carteiro)`;
      else if (dataChat.quem_mandou_msg === 'Cliente')
        nome = `${dadosEnvolvidosNoChat.nome_cliente_chat} (Cliente)`;
      else if (dataChat.quem_mandou_msg === 'Destinatario')
        nome = `${dadosEnvolvidosNoChat.nome_destinatario_chat} (Destinatário)`;

      if (dataChat.quem_mandou_msg === 'Carteiro')
        serie_usuario = dadosEnvolvidosNoChat.serie_carteiro_chat;
      if (dataChat.quem_mandou_msg === 'Cliente')
        serie_usuario = dadosEnvolvidosNoChat.serie_cliente_chat;
      if (dataChat.quem_mandou_msg === 'Destinatario')
        serie_usuario = dadosEnvolvidosNoChat.serie_destinatario_chat;

      return {
        id: String(index + 1),
        serie: serie_usuario,
        name: nome,
        time: formatarTempoRelativo(dataChat.data),
        text: dataChat.mensagem,
        fromUser:
          dataChat.quem_mandou_msg ===
          dadosEnvolvidosNoChat.tipo_usuario_atual_chat,
      };
    });

  useEffect(() => {
    if (isAtBottomRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);
    }
  }, [messages]);

  const renderItem = ({item}) => {
    const isUser = item.fromUser;
    return (
      <View
        style={[
          styles.messageRow,
          {justifyContent: isUser ? 'flex-end' : 'flex-start'},
        ]}>
        {!isUser && (
          <Image
            source={{
              uri: `${URL_MAIN}/views/painel-controle-carteiro/img-carteiro/${item.serie}/img.png`,
            }}
            style={styles.avatar}
          />
        )}
        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleUser : styles.bubbleOther,
            isUser ? {marginLeft: 50} : {marginRight: 50},
          ]}>
          <Text style={styles.nameTime}>{item.name}</Text>
          <Text style={styles.message}>{item.text}</Text>
          <Text
            style={[
              styles.nameTime,
              {
                fontSize: 12,
                fontFamily: 'Montserrat-Regular',
                marginTop: 6,
                color: 'rgba(0, 0, 0, 0.4)',
                textAlign: 'right',
              },
            ]}>
            {item.time}
          </Text>
        </View>
        {isUser && (
          <Image
            source={{
              uri: `${URL_MAIN}/views/painel-controle-carteiro/img-carteiro/${item.serie}/img.png`,
            }}
            style={styles.avatar}
          />
        )}
      </View>
    );
  };

  if (!dadosEnvolvidosNoChat) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#007ACC" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Modal
        visible={showMenuModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenuModal(false)}>
        <TouchableWithoutFeedback onPress={() => setShowMenuModal(false)}>
          <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  backgroundColor: '#fff',
                  width: '100%',
                  padding: 0,
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 4},
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                  elevation: 10,
                }}>
                <View
                  style={{
                    backgroundColor: '#4CAF50',
                    width: '100%',
                    height: 60,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 10,
                    shadowColor: '#000',
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                    elevation: 8,
                  }}>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 20,
                      fontFamily: 'Montserrat-Bold',
                    }}>
                    Integrantes
                  </Text>
                </View>

                {/* Lista de opções */}
                <ScrollView
                  contentContainerStyle={{marginBottom: -15}}
                  style={{marginTop: 0, padding: 20}}>
                  {(dadosEnvolvidosNoChat.tipo_usuario_atual_chat ==
                    'Carteiro' ||
                    dadosEnvolvidosNoChat.tipo_usuario_atual_chat ==
                      'Destinatario') && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 15,
                        borderBottomWidth:
                          dadosEnvolvidosNoChat.serie_destinatario_chat !== null
                            ? 1
                            : 0,
                        borderColor:
                          dadosEnvolvidosNoChat.serie_destinatario_chat !== null
                            ? 'rgba(127, 127, 127, 0.3)'
                            : '',
                      }}>
                      <Image
                        source={{
                          uri: `${URL_MAIN}/views/painel-controle-carteiro/img-carteiro/${dadosEnvolvidosNoChat.serie_cliente_chat}/img.png`,
                        }}
                        style={{
                          position: 'absolute',
                          marginTop: 0,
                          marginLeft: 0,
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                        }}
                      />
                      <Text
                        style={{
                          fontSize: 18,
                          marginLeft: 65,
                          fontFamily: 'Montserrat-Bold',
                          textAlign: 'center',
                          lineHeight: 22,
                          color: '#012970',
                        }}>
                        {dadosEnvolvidosNoChat.nome_cliente_chat} {'\n'}{' '}
                        <Text
                          style={{
                            fontSize: 17,
                            width: '100%',
                            color: 'rgba(0, 0, 0, 0.7)',
                          }}>
                          (Cliente)
                        </Text>{' '}
                      </Text>
                    </View>
                  )}

                  {(dadosEnvolvidosNoChat.tipo_usuario_atual_chat ==
                    'Cliente' ||
                    dadosEnvolvidosNoChat.tipo_usuario_atual_chat ==
                      'Destinatario') && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 15,
                        borderBottomWidth:
                          dadosEnvolvidosNoChat.serie_destinatario_chat !==
                            null &&
                          dadosEnvolvidosNoChat.tipo_usuario_atual_chat !==
                            'Destinatario'
                            ? 1
                            : 0,
                        borderColor:
                          dadosEnvolvidosNoChat.serie_destinatario_chat !==
                            null &&
                          dadosEnvolvidosNoChat.tipo_usuario_atual_chat !==
                            'Destinatario'
                            ? 'rgba(127, 127, 127, 0.3)'
                            : '',
                      }}>
                      <Image
                        source={{
                          uri: `${URL_MAIN}/views/painel-controle-carteiro/img-carteiro/${dadosEnvolvidosNoChat.serie_carteiro_chat}/img.png`,
                        }}
                        style={{
                          position: 'absolute',
                          marginTop: 0,
                          marginLeft: 0,
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                        }}
                      />
                      <Text
                        style={{
                          fontSize: 18,
                          marginLeft: 65,
                          fontFamily: 'Montserrat-Bold',
                          textAlign: 'center',
                          lineHeight: 22,
                          color: '#012970',
                        }}>
                        {dadosEnvolvidosNoChat.nome_carteiro_chat} {'\n'}{' '}
                        <Text
                          style={{
                            fontSize: 17,
                            width: '100%',
                            color: 'rgba(0, 0, 0, 0.7)',
                          }}>
                          (Carteiro)
                        </Text>{' '}
                      </Text>
                    </View>
                  )}

                  {dadosEnvolvidosNoChat.serie_destinatario_chat !== null &&
                    dadosEnvolvidosNoChat.tipo_usuario_atual_chat !==
                      'Destinatario' && (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: 15,
                        }}>
                        <Image
                          source={{
                            uri: `${URL_MAIN}/views/painel-controle-carteiro/img-carteiro/${dadosEnvolvidosNoChat.serie_destinatario_chat}/img.png`,
                          }}
                          style={{
                            position: 'absolute',
                            marginTop: 0,
                            marginLeft: 0,
                            width: 50,
                            height: 50,
                            borderRadius: 25,
                          }}
                        />
                        <Text
                          style={{
                            fontSize: 18,
                            marginLeft: 65,
                            fontFamily: 'Montserrat-Bold',
                            textAlign: 'center',
                            lineHeight: 22,
                            color: '#012970',
                          }}>
                          {dadosEnvolvidosNoChat.nome_destinatario_chat} {'\n'}{' '}
                          <Text
                            style={{
                              fontSize: 17,
                              width: '100%',
                              color: 'rgba(0, 0, 0, 0.7)',
                            }}>
                            (Destinatário)
                          </Text>{' '}
                        </Text>
                      </View>
                    )}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <View
        style={{
          backgroundColor: '#4CAF50',
          width: '100%',
          height: 60,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 10,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 6,
          elevation: 8,
        }}>
        {/* Ícone à esquerda */}
        <TouchableOpacity
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            width: 60,
            height: '100%',
            marginLeft: -10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => navigation.goBack()}>
          <MaterialIcons name="keyboard-arrow-left" size={39} color="#fff" />
        </TouchableOpacity>

        {/* Espaço central (opcional - pode colocar um título aqui) */}
        <View style={{flex: 1}} />

        {/* Ícone à direita */}
        <TouchableOpacity
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            width: 60,
            height: '100%',
            marginRight: -10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setShowMenuModal(true)}>
          <MaterialIcons name="people" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={{flex: 1}}
        contentContainerStyle={{padding: 16}}
        onScroll={event => {
          const {layoutMeasurement, contentOffset, contentSize} =
            event.nativeEvent;
          const isAtBottom =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 20;
          isAtBottomRef.current = isAtBottom;
        }}
        scrollEventThrottle={100}
      />
      <View style={styles.inputContainer}>
        <TextInput
          autoFocus
          placeholder="Digite sua mensagem"
          placeholderTextColor="#999"
          value={mensagem}
          onChangeText={setMensagem}
          style={styles.input}
        />
        <TouchableOpacity onPress={enviarChat} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const PRIMARY = '#F5C242';
const USER_BUBBLE = '#F5C242';
const OTHER_BUBBLE = '#f5f5f5';
const BACKGROUND = '#fff';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleUser: {
    backgroundColor: '#DCF8C6',
  },
  bubbleOther: {
    backgroundColor: '#FFFFFF',
  },
  nameTime: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#777',
    marginBottom: 6,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Montserrat-Regular',
    color: '#212121',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
  },
});
