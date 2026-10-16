import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
  Modal,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LocalizacaoAtual from '../../components/localizacaoAtual/LocalizacaoAtual';
import Header from '../../components/header/Header';
import SidebarLandingPage from '../../components/sidebarDashboard/SidebarLandingPage';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {getSecureData} from '../../utils/secureStorage';
import {
  saveToGlobalState,
  getStoredData,
  removeSpecificData,
  clearAppState,
} from '../../utils/storage';

LocaleConfig.locales['pt-br'] = {
  monthNames: [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ],
  monthNamesShort: [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ],
  dayNames: [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje',
};
LocaleConfig.defaultLocale = 'pt-br';

// 📌 Formatadores
const formatDateLong = dateStr => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  return `${parseInt(day)} ${monthNames[parseInt(month) - 1]}, ${year}`;
};

const formatDateShort = dateStr => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

const generateTimeOptions = () => {
  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      times.push(`${hour}:${minute}`);
    }
  }
  return times;
};

const DataHoraViagem = ({navigation}) => {
  const nav = useNavigation();
  const today = new Date().toISOString().split('T')[0];
  const [selected, setSelected] = useState(null);
  const [selectedHour, setSelectedHour] = useState('00:00');
  const [showHourList, setShowHourList] = useState(false);
  const [filteredTimes, setFilteredTimes] = useState([]);

  const times = generateTimeOptions();
  const listRef = useRef(null);

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

  useEffect(() => {
    const loadData = async () => {
      const stored = await getStoredData();
      const dateShort = stored?.['dia_mes_ano_ida_viagem_para_busca'];
      const horaSalva = stored?.['horas_ida_viagem'];

      if (dateShort) {
        const [day, month, year] = dateShort.split('/');
        const formatted = `${year}-${month.padStart(2, '0')}-${day.padStart(
          2,
          '0',
        )}`;
        setSelected(formatted);
      } else {
        setSelected(today);
        await salvarData(today);
      }

      if (horaSalva) {
        setSelectedHour(horaSalva);
      } else {
        const now = new Date();
        const minTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        const h = minTime.getHours().toString().padStart(2, '0');
        const m = minTime.getMinutes() < 30 ? '00' : '30'; 
        const horaPadrao = `${h}:${m}`;

        setSelectedHour(horaPadrao);
        await saveToGlobalState({horas_ida_viagem: horaPadrao});
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!selected) return;

    const now = new Date();
    let availableTimes = times;

    if (selected === today) {
      const minTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const minHour = minTime.getHours();
      const minMinute = minTime.getMinutes();

      availableTimes = times.filter(t => {
        const [h, m] = t.split(':').map(Number);
        return h > minHour || (h === minHour && m >= minMinute);
      });
    }

    setFilteredTimes(availableTimes);
    if (availableTimes.length > 0) {
      setSelectedHour(availableTimes[0]);
    } else {
      setSelectedHour('00:00');
    }
  }, [selected]);

  useEffect(() => {
    if (!showHourList) return;

    const timer = setTimeout(() => {
      if (!listRef.current) return;

      const index = filteredTimes.findIndex(h => h === selectedHour);

      if (index >= 0) {
        listRef.current.scrollToIndex({
          index,
          animated: true,
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [showHourList, filteredTimes]);

  const salvarData = async dateStr => {
    const longFormat = formatDateLong(dateStr);
    const shortFormat = formatDateShort(dateStr);

    try {
      await saveToGlobalState({
        dia_mes_ano_ida_viagem: longFormat,
        dia_mes_ano_ida_viagem_para_busca: shortFormat,
      });
    } catch (e) {
      console.error('Erro ao salvar datas', e);
    }
  };

  const salvarHora = async hora => {
    try {
      await saveToGlobalState({horas_ida_viagem: hora});
    } catch (e) {
      console.error('Erro ao salvar hora', e);
    }
  };

  const onDayPress = async day => {
    if (day.dateString < today) {
      Alert.alert(
        'Data inválida',
        'Por favor, selecione uma data a partir de hoje.',
      );
      return;
    }

    setSelected(day.dateString);
    await salvarData(day.dateString);
  };

  const handleHourSelect = async hora => {
    setSelectedHour(hora);
    await salvarHora(hora);
    setShowHourList(false);
  };

  const handleContinuar = async () => {
    const dateToSave = selected || today;
    await salvarData(dateToSave);
    await salvarHora(selectedHour);
    navigation.navigate('DataHoraDestino');
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#0a768f'}} edges={['top', 'left', 'right']}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#0a768f" 
        translucent={false} 
      />
    <View style={{flex: 1, backgroundColor: '#f0eded'}}>
      <SidebarLandingPage backgroundColor="#f0eded" />
      <TouchableWithoutFeedback onPress={() => setShowHourList(false)}>
        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={{flexGrow: 1, paddingBottom: 20}}
          showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <LocalizacaoAtual />
            <Text
              style={{
                marginTop: 0,
                fontFamily: 'Montserrat-Bold',
                color: '#353437',
                fontSize: 22,
                lineHeight: 32,
              }}>
              Data e hora da ida
            </Text>
            <Text
              style={{
                marginTop: 0,
                marginBottom: 10,
                color: '#555656',
                fontSize: 16,
                lineHeight: 32,
              }}>
              Seleciona a data e a hora de saída.
            </Text>
            <Text
              style={{
                marginTop: 0,
                marginBottom: 10,
                fontFamily: 'Montserrat-Bold',
                color: '#353437',
                fontSize: 17,
                lineHeight: 32,
              }}>
              Dia da ida
            </Text>

            <View style={styles.calendarContainer}>
              <Calendar
                key={selected}
                current={selected || today}
                style={{
                  borderRadius: 20,
                  paddingBottom: 5,
                }}
                customHeader={props => (
                  <View style={styles.calendarHeader}>
                    <Text style={styles.calendarTitle}>
                      {props.month.toString('MMMM yyyy')}
                    </Text>

                    <View style={styles.calendarArrows}>
                      <TouchableOpacity
                        style={styles.calendarFirstArrow}
                        onPress={props.addMonth.bind(null, -1)}>
                        <Text style={styles.arrow}>‹</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.calendarSecondArrow}
                        onPress={props.addMonth.bind(null, 1)}>
                        <Text style={styles.arrow}>›</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                onDayPress={onDayPress}
                minDate={today}
                markedDates={{
                  ...(selected
                    ? {
                        [selected]: {
                          selected: true,
                          selectedColor: '#0ed079',
                        },
                      }
                    : {}),
                }}
                theme={{
                  calendarBackground: '#fff',
                  selectedDayBackgroundColor: '#0ed079',
                  selectedDayTextColor: '#fff',
                  todayTextColor: '#353437',
                  arrowColor: '#353437',
                  textDayFontWeight: '500',
                  textMonthFontWeight: 'bold',
                  textDayFontFamily: 'Montserrat-Regular',
                  textMonthFontFamily: 'Montserrat-Bold',
                  textDayHeaderFontFamily: 'Montserrat-Regular',
                  'stylesheet.calendar.header': {
                    week: {
                      marginTop: 2,
                      marginBottom: 2,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    },
                  },
                  'stylesheet.day.basic': {
                    base: {
                      width: 28,
                      height: 26,
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                  },
                }}
              />
            </View>

            <Text
              style={{
                marginTop: 25,
                marginBottom: 0,
                fontFamily: 'Montserrat-Bold',
                color: '#353437',
                fontSize: 17,
                lineHeight: 32,
              }}>
              Hora da ida
            </Text>

            <View style={styles.shadow}>
              <TouchableOpacity
                onPress={() => setShowHourList(true)}
                activeOpacity={0.8}
                style={styles.input}>
                <Text style={styles.inputText}>{selectedHour}</Text>
              </TouchableOpacity>
            </View>

            {/* MODAL TRANSPARENTE: Corrige o bug do botão invisível e mantém o Scroll intacto */}
            <Modal
              visible={showHourList}
              transparent={true}
              animationType="none"
              onRequestClose={() => setShowHourList(false)}>
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowHourList(false)}>
                <View style={styles.modalContent}>
                  <FlatList
                    ref={listRef}
                    data={filteredTimes}
                    keyExtractor={item => item}
                    style={styles.hourList}
                    getItemLayout={(data, index) => ({
                      length: 40,
                      offset: 40 * index,
                      index,
                    })}
                    renderItem={({item}) => (
                      <TouchableOpacity
                        onPress={() => handleHourSelect(item)}
                        style={[
                          styles.hourItem,
                          item === selectedHour && styles.hourItemSelected,
                        ]}>
                        <Text
                          style={[
                            styles.hourItemText,
                            item === selectedHour &&
                              styles.hourItemTextSelected,
                          ]}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableOpacity>
            </Modal>

            <View style={styles.botoes}>
              <TouchableOpacity
                style={styles.botaoVoltar}
                onPress={() => nav.goBack()}>
                <Text style={styles.textoBotaoVoltar}>Voltar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  width: '48%',
                  marginLeft: 10,
                  padding: 0,
                  overflow: 'hidden',
                }}
                onPress={handleContinuar}>
                <LinearGradient
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  colors={['rgb(26, 127, 231)', 'rgb(25, 196, 201)']}
                  locations={[0, 0.4]}
                  style={{
                    flex: 1,
                    width: '100%',
                    height: '100%',
                    borderRadius: 25,
                    justify: 'center',
                    alignItems: 'center',
                    paddingVertical: 12,
                  }}>
                  <Text style={styles.textoBotaoContinuar}>Continuar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
      <Header />
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    paddingHorizontal: 16,
    backgroundColor: '#f0eded',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  calendarTitle: {
    fontSize: 17,
    fontFamily: 'Montserrat-Bold',
    color: '#555656',
  },
  calendarArrows: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  calendarFirstArrow: {
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  calendarSecondArrow: {
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  arrow: {
    fontSize: 27,
    color: '#555656',
    marginBottom: 5,
    paddingHorizontal: 8,
  },
  shadow: {
    position: 'relative',
    borderRadius: 20,
    zIndex: 1,
    backgroundColor: '#fff',
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 4,
  },
  input: {
    height: 55,
    borderRadius: 20,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  inputText: {fontSize: 17, fontFamily: 'Montserrat-Regular', color: '#333'},

  /* Estilos do Modal transparente */
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 90, 
  },
  modalContent: {
    maxHeight: 220,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    overflow: 'hidden',
  },
  hourList: {
    maxHeight: 220,
    backgroundColor: '#fff',
  },
  hourItem: {height: 40, justifyContent: 'center', paddingHorizontal: 20},
  hourItemSelected: {backgroundColor: '#989898'},
  hourItemText: {fontSize: 18, color: '#333', fontFamily: 'Montserrat-Regular'},
  hourItemTextSelected: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
  },

  botoes: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botaoVoltar: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgb(232, 232, 232)',
    borderColor: 'rgb(232, 232, 232)',
    borderWidth: 2,
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  textoBotaoVoltar: {color: '#353437', fontSize: 16, fontWeight: 'bold'},
  textoBotaoContinuar: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
});

export default DataHoraViagem;
