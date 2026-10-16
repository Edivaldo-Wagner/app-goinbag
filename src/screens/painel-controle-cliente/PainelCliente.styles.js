import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  container: {
    backgroundColor: '#f0eded',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    width: '95%',
    minWidth: 230,
    alignSelf: 'center',
    marginVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 10,
  },

  containerMain: {
    width: '100%',
    paddingHorizontal: 6,
    backgroundColor: '#f0eded',
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    width: '100%',
  },
  cardMain: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 8,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'space-between',
    // Sombras para iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    // Sombra para Android
    elevation: 4,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconStyle: {
    width: 26,
    height: 26,
    tintColor: '#FFFFFF',
    resizeMode: 'contain',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 15,
    fontFamily: 'Montserrat-Regular'
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    fontFamily: 'Montserrat-Regular'
  },

  /* PERFIL + ROTA */
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  avatarPlaceholder: {
    backgroundColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontFamily: 'Montserrat-Bold',
    color: '#10b7d8',
    marginBottom: 2,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  routeCity: {
    fontSize: 13,
    fontFamily: 'Montserrat-Bold',
    color: '#1E293B',
    flexShrink: 1, // Permite encolher e colocar os reticências (...) se o nome for grande
  },
  arrowCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E0F7FC',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    flexShrink: 0, // Garante que a seta não seja esmagada
  },
  routeIcon: {
    marginHorizontal: 6,
  },

  /* CHIPS / BADGES */
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: '#10b7d8',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipText: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    fontSize: 12,
  },

  /* DATAS DE SAÍDA E CHEGADA */
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  dateBlock: {
    flex: 1,
  },
  dateBlockRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  dateBadge: {
    backgroundColor: '#0072FF',
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 10,
    marginBottom: 4,
  },
  dateBadgeLeftAlign: {
    alignSelf: 'flex-start',
  },
  dateBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Bold',
    color: '#003B7A',
    marginLeft: 4,
  },

  /* CAIXA DE TEXTO CINZA */
  descriptionBox: {
    backgroundColor: '#F2F2F2',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
  },

  /* CONTAINER DO STATUS E AÇÕES */
  statusSectionContainer: {
    backgroundColor: '#F9FAFC',
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  statusBannerGradient: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  statusDotWrapper: {
    position: 'absolute',
    top: 10,
    left: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00FF66',
  },
  statusBannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
  },

  /* BOTÕES DE AÇÃO */
  actionButtonsContainer: {
    gap: 8,
  },
  actionBtn: {
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnPrimary: {
    backgroundColor: '#EBF5FF',
  },
  actionBtnDanger: {
    backgroundColor: '#FDE8E8',
  },
  actionBtnText: {
    fontSize: 13,
    fontFamily: 'Montserrat-Bold',
  },
  actionBtnTextPrimary: {
    color: '#0072FF',
  },
  actionBtnTextDanger: {
    color: '#A91D1D',
  },
});
