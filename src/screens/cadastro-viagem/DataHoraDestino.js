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

const DataHoraDestino = ({navigation}) => {
  const nav = useNavigation();
  const today = new Date().toISOString().split('T')[0];

  const [selected, setSelected] = useState(null);
  const [selectedHour, setSelectedHour] = useState('00:00');
  const [minSelectableDate, setMinSelectableDate] = useState(null);
  const [maxSelectableDate, setMaxSelectableDate] = useState(null);
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
      try {
        const stored = await getStoredData();

        const idaShort = stored?.['dia_mes_ano_ida_viagem_para_busca'];
        const destinoShort = stored?.['dia_mes_ano_destino_para_busca'];
        const editandoViagem = stored?.['editando_viagem'];
        const horaIda = stored?.['horas_ida_viagem'];

        if (idaShort && typeof idaShort === 'string') {
          const [day, month, year] = idaShort.split('/');
          const idaDate = new Date(
            `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
          );
          const formattedIda = idaDate.toISOString().split('T')[0];

          setMinSelectableDate(formattedIda);

          const maxDate = new Date(idaDate);
          maxDate.setDate(maxDate.getDate() + 6);
          setMaxSelectableDate(maxDate.toISOString().split('T')[0]);

          if (
            editandoViagem === 'sim' &&
            destinoShort &&
            typeof destinoShort === 'string'
          ) {
            const [dayDestino, monthDestino, yearDestino] =
              destinoShort.split('/');
            const destinoDate = new Date(
              `${yearDestino}-${monthDestino.padStart(
                2,
                '0',
              )}-${dayDestino.padStart(2, '0')}`,
            );
            const formattedDestino = destinoDate.toISOString().split('T')[0];

            setSelected(formattedDestino);
            await salvarData(formattedDestino);
          } else {
            setSelected(formattedIda);
            await salvarData(formattedIda);
          }
        }

        let horaPadraoDestino = '00:00';
        if (horaIda && typeof horaIda === 'string') {
          const [h, m] = horaIda.split(':').map(Number);
          const idaDate = new Date();
          idaDate.setHours(h);
          idaDate.setMinutes(m);
          idaDate.setSeconds(0);

          const destinoMin = new Date(idaDate.getTime() + 2 * 60 * 60 * 1000);
          const hDestino = destinoMin.getHours().toString().padStart(2, '0');
          const mDestino = destinoMin.getMinutes().toString().padStart(2, '0');
          horaPadraoDestino = `${hDestino}:${mDestino}`;
        }

        setSelectedHour(horaPadraoDestino);
        await saveToGlobalState({horas_destino: horaPadraoDestino});

      } catch (e) {
        console.error('Erro ao carregar dados:', e);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const filtrarHorarios = async () => {
      if (!selected) return;

      const stored = await getStoredData();
      const horaIda = stored?.['horas_ida_viagem'];
      const dataIdaShort = stored?.['dia_mes_ano_ida_viagem_para_busca'];

      let minHour = 0;
      let minMinute = 0;

      const now = new Date();

      if (dataIdaShort && typeof dataIdaShort === 'string') {
        const [day, month, year] = dataIdaShort.split('/');
        const dataIdaISO = `${year}-${month.padStart(2, '0')}-${day.padStart(
          2,
          '0',
        )}`;

        // Só aplica a restrição de horário mínimo se for exatamente o mesmo dia da ida
        if (selected === dataIdaISO && horaIda) {
          const [h, m] = horaIda.split(':').map(Number);

          const idaDate = new Date();
          idaDate.setHours(h);
          idaDate.setMinutes(m);
          idaDate.setSeconds(0);

          const destinoMin = new Date(idaDate.getTime() + 2 * 60 * 60 * 1000);

          minHour = destinoMin.getHours();
          minMinute = destinoMin.getMinutes();
        } else if (selected === today) {
          // Se for hoje (e não for o dia da ida com restrição maior)
          const minTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
          minHour = minTime.getHours();
          minMinute = minTime.getMinutes();
        }
      }

      const availableTimes = times.filter(t => {
        const [h, m] = t.split(':').map(Number);
        return h > minHour || (h === minHour && m >= minMinute);
      });

      setFilteredTimes(availableTimes);

      if (availableTimes.length > 0) {
        const firstAvailable = availableTimes[0];
        setSelectedHour(firstAvailable);
        await salvarHora(firstAvailable);
      } else {
        setSelectedHour('00:00');
        await salvarHora('00:00');
      }
    };

    filtrarHorarios();
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
      } else if (filteredTimes.length > 0) {
        listRef.current.scrollToIndex({
          index: 0,
          animated: true,
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [showHourList, filteredTimes, selectedHour]);

  const salvarData = async dateStr => {
    try {
      const longFormat = formatDateLong(dateStr);
      const shortFormat = formatDateShort(dateStr);
      await saveToGlobalState({
        dia_mes_ano_destino: longFormat,
        dia_mes_ano_destino_para_busca: shortFormat,
      });
    } catch (e) {
      console.error('Erro ao salvar data:', e);
    }
  };

  const salvarHora = async hora => {
    try {
      await saveToGlobalState({horas_destino: hora});
    } catch (e) {
      console.error('Erro ao salvar hora:', e);
    }
  };

  const onDayPress = async day => {
    if (minSelectableDate && day.dateString < minSelectableDate) {
      Alert.alert(
        'Data inválida',
        'A data de chegada não pode ser anterior à data de ida.',
      );
      return;
    }

    if (maxSelectableDate && day.dateString > maxSelectableDate) {
      Alert.alert(
        'Data inválida',
        'Por favor, selecione até 7 dias após a data de ida.',
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

  const redirectPage = async () => {
    if (selected) await salvarData(selected);
    if (selectedHour) await salvarHora(selectedHour);

    //await saveToGlobalState({ voltando_trajeto: 'sim' });
    //await removeSpecificData('voltando_trajeto');

    const stored = await getStoredData();
    await saveToGlobalState({horas_destino: '00:00'});
    const qual_meio_transporte = stored?.['qual_meio_transporte'];
    const editandoViagem = stored?.['editando_viagem'];

    if (editandoViagem === 'sim') {
      navigation.navigate('EspacoDisponivelNaMala');
      return;
    }

    if (
      qual_meio_transporte === 'aviao' ||
      qual_meio_transporte === 'onibus' ||
      qual_meio_transporte === 'trem'
    ) {
      navigation.navigate('EspacoDisponivelNaMala');
    }

    if (qual_meio_transporte === 'carro' || qual_meio_transporte === 'moto') {
      navigation.navigate('Trajeto');
    }
  };

  const isTodayDisabled = minSelectableDate && today < minSelectableDate;

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
              Data e hora de destino
            </Text>
            <Text
              style={{
                marginTop: 0,
                marginBottom: 10,
                color: '#555656',
                fontSize: 16,
                lineHeight: 32,
              }}>
              Seleciona a data e a hora de chegada.
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
              Dia de chegada
            </Text>

            <View style={styles.calendarContainer}>
              <Calendar
                key={minSelectableDate}
                current={selected || minSelectableDate}
                style={{
                  borderRadius: 20,
                  paddingBottom: 5,
                }}
                minDate={minSelectableDate}
                maxDate={maxSelectableDate}
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
                markedDates={{
                  ...(isTodayDisabled
                    ? {
                        [today]: {
                          disabled: true,
                          disableTouchEvent: true,
                        },
                      }
                    : {}),
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
                  todayTextColor: isTodayDisabled ? '#d9e1e8' : '#353437',
                  textDisabledColor: '#d9e1e8',
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
              Hora de destino
            </Text>

            <View style={styles.shadow}>
              <TouchableOpacity
                onPress={() => setShowHourList(true)}
                activeOpacity={0.8}
                style={styles.input}>
                <Text style={styles.inputText}>{selectedHour}</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Transparente para isolar o scroll e evitar conflito de renderização */}
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
                onPress={redirectPage}>
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
                    justifyContent: 'center',
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

  /* Estilos do Modal Transparente */
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

export default DataHoraDestino;
