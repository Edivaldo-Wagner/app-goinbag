import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  /*===============================================MODAL BUSCA VIAGENS MAIN==================================================================*/
  
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',   
    alignItems: 'center'
  },
  modalBox: {
    width: '95%',
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 30,
    borderRadius: 10,
    elevation: 10
  },
  modalInput: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 15
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  
  /*===============================================/MODAL BUSCA VIAGENS MAIN==================================================================*/
  

  /*containerHome: {
    position: 'absolute',
    height: 100,
    width: '90%',
    padding: 20,
    top: 35,
    borderRadius: 20,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 13,
    elevation: 7,
    },*/
  containerBuscaViagensMain: {               
    height: 250,
    width: '100%',
    marginTop: 10,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },

  input: {
    height: 45,
    backgroundColor: 'rgb(51, 158, 201)', // azul claro
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    
    // Sombra
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    color: '#fff', // texto branco
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputHalf: {
    width: '48%',
  },
  button: {
    width: '48%',
    height: 45,
    marginTop: -15,
    backgroundColor: '#f4A30B',
    borderRadius: 10, 
    justifyContent: 'center',
    alignItems: 'center',

    // Sombra
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  /*===============================================SLIDER CONTAINER-DESC==================================================================*/
  /*
  containerDesc: {
    flex: 1,
    marginTop: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'pnk'
  },
  sliderWrapperDesc: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'gren'
  },
  arrowButtonDesc: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  arrowTextDesc: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  slideDesc: {
    top: -20,
    marginTop: 60,
    alignItems: 'center',
    backgroundColor: 'rgba(240, 240, 240, 0.2)',
    borderRadius: 10,
    shadowColor: 'rgba(240, 240, 240, 0.1)',
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 13,
    elevation: 6,
  },
  slideTextDesc: {
    color: 'rgba(53,53,53,1)',
    fontSize: 24,
  },
*/
  /*===============================================/SLIDER CONTAINER-DESC==================================================================*/

  /*===============================================CONTAINER STEP===========================================================================*/
/*
  containerSteps: {
    flex: 1,
    padding: 20,
    marginTop: 20,
    backgroundColor: '#fff',
    position: 'relative', 
  },
  stepContainerSteps: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconCircleSteps: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    zIndex: 2,
  },
  textContainerSteps: {
    flex: 1,
  },
  titleSteps: {
    fontWeight: 'bold',
    fontSize: 19,
    marginBottom: 5,
    color: '#333',
  },
  descriptionSteps: {
    fontSize: 18,
    color: 'rgba(53,53,53,1)', 
    lineHeight: 28
  },
  verticalLineSteps: {
    position: 'absolute',
    left: 35, 
    width: 8,
    zIndex: 0,
  },
  circle1Steps: {
    backgroundColor: '#009fd9',
  },
  circle2Steps: {
    backgroundColor: '#7ebca0',
  },
  circle3Steps: {
    backgroundColor: '#e1c24e',
  },
  circle4Steps: {
    backgroundColor: '#f7921e',
  },
*/
  /*===============================================/CONTAINER STEP=======================================================================*/



  /*===============================================CONTAINER SLIDER PRECO==================================================================*/
/*
  containerSliderPreco: {
    width: '100%',
    height: 300,
    overflow: 'hidden',
    backgroundColor: '#0C9FE3'
  }
*/
  /*===============================================/CONTAINER SLIDER PRECO==================================================================*/

});
