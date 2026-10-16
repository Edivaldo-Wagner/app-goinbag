import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

const bagOptions = [
  'Pequeno, estilo envelope até 1kg',
  'Caixa de Sapato/Sacola – 1 kg a 5 kg',
  'Mochila/Mala – 5 kg a 10 kg',
  'Mala/Caixa – 10 kg até 23 kg',
];

const EspacoDisponivelNaMala = ({navigation}) => {
  const nav = useNavigation();
  const [selectedBagOption, setSelectedBagOption] = useState(bagOptions[0]);
  const [showBagList, setShowBagList] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const bagSaved = await AsyncStorage.getItem('select-espaco-mala-retorno');

      if (bagSaved && bagOptions.includes(bagSaved)) {
        setSelectedBagOption(bagSaved);
      } else {
        await AsyncStorage.setItem('select-espaco-mala-retorno', bagOptions[0]);
      }
    };

    loadData();
  }, []);

  const salvarData = async dateString => {
    const [year, month, day] = dateString.split('-');
    const formatted = `${day}/${month}/${year}`;
    await AsyncStorage.setItem(
      'dia-mes-ano-ida-viagem-para-busca-retorno',
      formatted,
    );
  };

  const salvarBagOption = async option => {
    try {
      await AsyncStorage.setItem('select-espaco-mala-retorno', option);
    } catch (e) {
      console.error('Erro ao salvar opção de bagagem', e);
    }
  };

  const handleBagSelect = option => {
    setSelectedBagOption(option);
    salvarBagOption(option);
    setShowBagList(false);
  };

  return (
    <TouchableWithoutFeedback onPress={() => setShowBagList(false)}>
      <View style={styles.container}>
        <Text
          style={[
            styles.label,
            {marginTop: 0, fontSize: 25.5, lineHeight: 32},
          ]}>
          Qual será o espaço disponível na sua mala no retorno?
        </Text>

        <View style={{position: 'relative'}}>
          <TouchableOpacity
            onPress={() => setShowBagList(!showBagList)}
            activeOpacity={0.8}
            style={styles.input}>
            <Text style={styles.inputText}>{selectedBagOption}</Text>
          </TouchableOpacity>

          {showBagList && (
            <View style={styles.hourList}>
              <FlatList
                data={bagOptions}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => (
                  <TouchableOpacity
                    onPress={() => handleBagSelect(item)}
                    style={[styles.hourItem, item === selectedBagOption]}>
                    <Text
                      style={[styles.hourItemText, item === selectedBagOption]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>

        {selectedBagOption && (
          <View style={styles.infoContainer}>
            <Text
              style={{
                color: 'rgb(244, 163, 11)',
                fontFamily: 'Montserrat-Bold',
                fontSize: 20,
              }}>
              O espaço definido na sua mala será:
            </Text>

            <Text
              style={{
                marginTop: 5,
                fontFamily: 'Montserrat-Bold',
                fontSize: 20,
              }}>
              {selectedBagOption}
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
              navigation.navigate('InformacaoAVagemRetorno');
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
    fontSize: 18,
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
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  hourItem: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  hourItemText: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Montserrat-Regular',
  },
  infoContainer: {
    marginTop: 15,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    // Sombra
    shadowColor: 'rgba(127, 127, 127, 0.1)',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  infoText: {
    color: '#353738',
    fontSize: 18,
    padding: 10,
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

export default EspacoDisponivelNaMala;
