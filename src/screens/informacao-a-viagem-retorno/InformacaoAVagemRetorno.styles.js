import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  container: {
    height: 250,
    width: '90%',
    marginTop: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingTop: 15,
    fontSize: 22,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    color: '#353738',
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
