import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  FlatList,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

// 📌 Localização em português
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

// 📌 Gera array com horários de 10 em 10 minutos
const generateTimeOptions = () => {
  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 10) {
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

  const times = generateTimeOptions();
  const listRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      const dateShort = await AsyncStorage.getItem(
        'dia-mes-ano-ida-viagem-para-busca-retorno',
      );
      const horaSalva = await AsyncStorage.getItem('hora-ida-viagem-retorno');

      if (dateShort) {
        const [day, month, year] = dateShort.split('/');
        const formatted = `${year}-${month.padStart(2, '0')}-${day.padStart(
          2,
          '0',
        )}`;
        setSelected(formatted);
      } else {
        setSelected(today);
        salvarData(today);
      }

      if (horaSalva) {
        setSelectedHour(horaSalva);
      } else {
        setSelectedHour('00:00');
        await AsyncStorage.setItem('hora-ida-viagem-retorno', '00:00');
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (showHourList && listRef.current) {
      const index = times.findIndex(h => h === selectedHour);
      setTimeout(() => {
        if (index >= 0) {
          listRef.current.scrollToIndex({index, animated: true});
        }
      }, 100);
    }
  }, [showHourList]);

  const salvarData = async dateStr => {
    const longFormat = formatDateLong(dateStr);
    const shortFormat = formatDateShort(dateStr);

    try {
      await AsyncStorage.removeItem('hora-destino-retorno');
      await AsyncStorage.removeItem('dia-mes-ano-destino-retorno');
      await AsyncStorage.removeItem('dia-mes-ano-destino-para-busca-retorno');
      await AsyncStorage.setItem('dia-mes-ano-ida-viagem-retorno', longFormat);
      await AsyncStorage.setItem(
        'dia-mes-ano-ida-viagem-para-busca-retorno',
        shortFormat,
      );
    } catch (e) {
      console.error('Erro ao salvar datas', e);
    }
  };

  const salvarHora = async hora => {
    try {
      await AsyncStorage.setItem('hora-ida-viagem-retorno', hora);
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
    salvarData(day.dateString);
  };

  const handleHourSelect = hora => {
    setSelectedHour(hora);
    salvarHora(hora);
    setShowHourList(false);
  };

  return (
    <TouchableWithoutFeedback onPress={() => setShowHourList(false)}>
      <View style={styles.container}>
        <Text
          style={[
            styles.label,
            {marginTop: 0, fontSize: 25.5, lineHeight: 32},
          ]}>
          Qual dia você irá fazer sua viagem
        </Text>

        <Calendar
          onDayPress={onDayPress}
          minDate={today}
          markedDates={{
            [selected]: {
              selected: true,
              selectedColor: '#00adf5',
            },
          }}
          theme={{
            selectedDayBackgroundColor: '#00adf5',
            selectedDayTextColor: '#fff',
            todayTextColor: '#00adf5',
            arrowColor: '#00adf5',
            textDayFontWeight: '500',
            textMonthFontWeight: 'bold',
            textDayFontFamily: 'Montserrat-Regular',
            textMonthFontFamily: 'Montserrat-Bold',
            textDayHeaderFontFamily: 'Montserrat-Regular',
          }}
        />

        {/*<Text style={[styles.label, { marginTop: 15, }]}>A que horas você irá viajar</Text>*/}

        <View style={{position: 'relative'}}>
          <TouchableOpacity
            onPress={() => setShowHourList(!showHourList)}
            activeOpacity={0.8}
            style={styles.input}>
            <Text style={styles.inputText}>{selectedHour}</Text>
          </TouchableOpacity>

          {showHourList && (
            <FlatList
              ref={listRef}
              data={times}
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
                      item === selectedHour && styles.hourItemTextSelected,
                    ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {selected && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText} numberOfLines={2}>
              O horário será definido para as {selectedHour} do{'\n'}dia{' '}
              {formatDateLong(selected)}.
            </Text>
          </View>
        )}

        <View style={styles.botoes}>
          <TouchableOpacity
            style={styles.botaoVoltar}
            onPress={() => nav.goBack()}>
            <Text style={styles.textoBotaoVoltar}>Voltar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoContinuar}
            onPress={() => {
              navigation.navigate('DataHoraDestinoRetorno');
            }}>
            <Text style={styles.textoBotaoContinuar}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    flex: 1,
  },
  label: {
    marginTop: 30,
    fontSize: 24,
    textAlign: 'center',
    fontFamily: 'Montserrat-Bold',
    color: '#0C9FE3',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgb(244, 163, 11)',
    borderRadius: 50,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 15,
  },
  inputText: {
    fontSize: 21,
    fontFamily: 'Montserrat-Regular',
    color: '#333',
  },
  hourList: {
    position: 'absolute',
    top: 65,
    width: '100%',
    maxHeight: 200,
    borderWidth: 1,
    borderColor: 'rgb(244, 163, 11)',
    borderRadius: 10,
    backgroundColor: '#fff',
    zIndex: 10,
    elevation: 10, // para Android
    shadowColor: '#000', // para iOS
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  hourItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hourItemSelected: {
    backgroundColor: 'rgb(244, 163, 11)',
  },
  hourItemText: {
    fontSize: 21,
    color: '#333',
    fontFamily: 'Montserrat-Regular',
  },
  hourItemTextSelected: {
    color: '#fff',
    fontSize: 21,
    fontFamily: 'Montserrat-Bold',
  },
  infoContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: 'rgb(244, 163, 11)',
    borderRadius: 35,
  },
  infoText: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 25,
    textAlign: 'center',
    fontFamily: 'Montserrat-Regular',
  },
  botoes: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botaoVoltar: {
    flex: 1,
    borderColor: '#00aaff',
    borderWidth: 2,
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  textoBotaoVoltar: {
    color: '#00aaff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoContinuar: {
    flex: 1,
    backgroundColor: '#00aaff',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 10,

    // Sombra
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  textoBotaoContinuar: {
    color: '#fff',
    fontSize: 17.5,
    fontFamily: 'Montserrat-Bold',
  },
});

export default DataHoraViagem;
