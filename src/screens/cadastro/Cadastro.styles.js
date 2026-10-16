import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  container: {
    height: 250,
    width: '90%',
    marginTop: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  alertModal: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  alertTitle: {
    fontSize: 22,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 19,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  alertButton: {
    backgroundColor: '#0c9fe3',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    // Sombra
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  alertButtonText: {
    width: 100,
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'Montserrat-Regular',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // fundo escuro semi-transparente

    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 15,

    // Sombra (iOS)
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 3.5,

    // Sombra (Android)
    elevation: 4,
  },
  dddContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    paddingHorizontal: 6,
    backgroundColor: '#e1e6eb',
    borderRadius: 8,
    height: 45,
  },
  ddd: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#333',
  },
  input: {
    height: 45,
    fontSize: 18,
    fontFamily: 'Montserrat-Regular',
    backgroundColor: '#fff', // azul claro
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,

    // Sombra
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    color: '#353738', // texto branco
  },
  label: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    marginBottom: 5,
    color: '#444',
  },
  info: {
    marginTop: 8,
    color: '#666',
    fontSize: 13,
  },
  row: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  opcaoLogin: {
    width: '33.3%',
    height: 40,
    borderWidth: 1,
    borderColor: 'rgba(12, 159, 227, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    marginHorizontal: 0.5,
  },
  textLogin: {
    fontSize: 19,
    fontFamily: 'Montserrat-Regular',
    color: 'rgba(8, 77, 110, 0.6)',
  },
  button: {
    width: '100%',
    height: 45,
    marginTop: 10,
    backgroundColor: 'rgba(12, 159, 227, 1)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',

    // Sombra
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
