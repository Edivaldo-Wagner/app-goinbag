import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  screenBackground: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  container: {
    paddingHorizontal: 10,
    borderRadius: 30,
    backgroundColor: '#f1f3f5',
    marginHorizontal: 15,
  },
  headerTitle: {
    textAlign: 'center',
    color: '#00bbe6',
    fontSize: 26,
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    marginBottom: 20,
  },

  /* Estilos das Abas */
  tabsContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 48,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#00bcd4', // Borda universal ao redor de tudo
    backgroundColor: '#ffffff',
    overflow: 'hidden', // Garante que nada saia da pílula principal
    alignItems: 'center',
  },
  tabButtonActiveWrapper: {
    flex: 1,
    height: '100%',
  },
  gradientTab: {
    flex: 1,
    // Arredonda o canto direito da aba ativa para fazer o arco da pílula
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
    // Se for a primeira aba, mantém a esquerda perfeitamente alinhada
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonInactive: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabWithRightCurve: {
    borderRightWidth: 1,
    borderRightColor: '#00bcd4',
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
  },
  textTabActive: {
    fontSize: 13,
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  textTabInactive: {
    fontSize: 13,
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    color: '#00bcd4',
  },

  /* Labels e Inputs */
  inputLabel: {
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    color: '#00bbe6',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 6,
  },
  input: {
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#333333',
    shadowColor: 'rgba(127, 127, 127, 1)',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 6,
  },

  /* Links e Botão Principal */
  forgotPasswordText: {
    textAlign: 'center',
    color: '#8e9aa8',
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
  },
  button: {
    width: '100%',
    height: 52,
    marginTop: 20,
    backgroundColor: '#007bff',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007bff',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
  },
  redirectCadastroText: {
    marginTop: 15,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    color: '#8e9aa8',
    textDecorationLine: 'underline',
  },

  /* Secção de Contas Sociais */
  sectionTitle: {
    textAlign: 'center',
    color: '#111111',
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  socialButtonGoogle: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    width: '100%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: 'rgba(127, 127, 127, 1)',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 6,
  },
  socialButtonFacebook: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    width: '100%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(127, 127, 127, 1)',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 6,
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  socialTextGoogle: {
    fontFamily: 'Montserrat-Bold',
    fontWeight: '600',
    fontSize: 16,
    color: '#444444',
  },
  socialTextFacebook: {
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333333',
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 40,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    color: '#353437',
    fontFamily: 'Montserrat-Bold',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: '#353437',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#0c9fe3',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 4,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
  },
});
