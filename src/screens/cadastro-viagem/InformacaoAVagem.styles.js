import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  container: {
    height: 250,
    width: '90%',
    marginTop: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingTop: 15,
    fontSize: 22,
    fontFamily: 'Montserrat-Regular',
    color: '#353738',
  },
  botoes: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botaoVoltar: {
    flex: 1,
    width: '100%',
    border: 'none',
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
    fontSize: 17.5,
    fontFamily: 'Montserrat-Bold',
  },
});
