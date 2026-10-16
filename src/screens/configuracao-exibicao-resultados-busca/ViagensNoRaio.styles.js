// viagens.styles.js
import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
    marginTop: 20,
    marginBottom: 10,
  },
  switchRowWrap: {flexWrap: 'wrap'},
  editarBusca: {flexDirection: 'row', alignItems: 'center'},
  editarBuscaText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    color: '#79e3ff',
    marginLeft: 6,
  },
  switchGroup: {flexDirection: 'row', alignItems: 'center'},
  switchGroupWrap: {width: '100%', justifyContent: 'flex-end', marginTop: 10},
  switchLabel: {
    fontSize: 15.5,
    marginHorizontal: 8,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  customSwitch: {
    width: 50,
    height: 25,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  switchOn: {backgroundColor: '#79e3ff', alignItems: 'flex-end'},
  switchOff: {backgroundColor: '#d3d3d3', alignItems: 'flex-start'},
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 13,
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    width: '92%',
    maxWidth: 430,
    alignSelf: 'center',
    marginVertical: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },

  /* ORIGEM / DESTINO */
  origemDestino: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  cidade: {
    flex: 1,
    minWidth: 0,
  },

  cidadeTitulo: {
    color: '#0090e8',
    fontSize: 13,
    /*width: 100,*/
    fontFamily: 'Montserrat-Bold',
  },

  cidadeData: {
    marginTop: 4,
    fontSize: 12,
    color: '#8ca0b3',
    fontFamily: 'Montserrat-Regular',
  },

  separador: {
    width: 60,
    marginLeft: -15,
    textAlign: 'center',
    color: '#b0bcc9',
    fontSize: 18,
  },

  /* USUÁRIO */
  usuario: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginVertical: 16,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ccc',
  },

  nomeUsuario: {
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
    color: '#1f2937',
  },

  subUsuario: {
    fontSize: 12,
    color: '#8ca0b3',
    marginTop: 4,
  },

  /* INFO TRANSPORTE */
  infoTransporte: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    backgroundColor: '#fff',
  },

  cardInfo: {
    flex: 1,
    /*borderWidth: 2,
    borderColor: "#f3f4f6",*/
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',

    // Sombra
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },

  cardInfoText: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
  },

  /* DESCRIÇÃO */
  descricao: {
    color: '#6f7b8a',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 18,
    fontFamily: 'Montserrat-Regular',
  },

  /* RODAPÉ */
  rodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  preco: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    color: '#1f2937',
  },

  botao: {
    backgroundColor: '#ff9900',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
  },

  botaoTexto: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Montserrat-Bold',
  },
});
