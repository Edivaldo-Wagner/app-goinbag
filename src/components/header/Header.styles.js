import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  // ==========================================================
  // CONTAINER PRINCIPAL DO HEADER
  // ==========================================================

  headerWrapper: {
    position: 'absolute',

    left: 0,
    right: 0,
    bottom: 0,

    width: '100%',

    backgroundColor: '#FFFFFF',

    zIndex: 9999,

    elevation: 9999,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: -2,
    },

    shadowOpacity: 0.12,

    shadowRadius: 4,
  },

  // ==========================================================
  // MENU
  // ==========================================================

  containerHome: {
    width: '100%',

    minHeight: 45,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    backgroundColor: '#FFFFFF',

    paddingHorizontal: 4,
  },

  // ==========================================================
  // BOTÃO
  // ==========================================================

  button: {
    flex: 1,

    minWidth: 0,

    height: 45,

    alignItems: 'center',

    justifyContent: 'center',

    paddingHorizontal: 2,

    marginTop: 10
  },

  // ==========================================================
  // TEXTO
  // ==========================================================

  text: {
    marginTop: 3,

    fontSize: 10,

    lineHeight: 14,

    textAlign: 'center',

    color: '#6F6F6F',

    fontFamily: 'Montserrat-Regular',

    includeFontPadding: false,

    maxWidth: '100%',
  },

  // ==========================================================
  // ÍCONE DE NOTIFICAÇÃO
  // ==========================================================

  notificationIconWrapper: {
    width: 30,

    height: 30,

    alignItems: 'center',

    justifyContent: 'center',

    position: 'relative',
  },

  // ==========================================================
  // BADGE DE NOTIFICAÇÃO
  // ==========================================================

  notificationBadge: {
    position: 'absolute',

    top: -5,

    right: -8,

    minWidth: 20,

    height: 20,

    paddingHorizontal: 4,

    borderRadius: 10,

    backgroundColor: 'rgba(12,159,227,1)',

    alignItems: 'center',

    justifyContent: 'center',

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.25,

    shadowRadius: 3,

    elevation: 5,
  },

  notificationBadgeText: {
    color: '#FFFFFF',

    fontSize: 10,

    lineHeight: 12,

    fontFamily: 'Montserrat-Bold',

    textAlign: 'center',

    includeFontPadding: false,
  },

  // ==========================================================
  // AVATAR
  // ==========================================================

  avatar: {
    width: 24,

    height: 24,

    borderRadius: 12,
  },

  // ==========================================================
  // OVERLAY DO MODAL
  // ==========================================================

  overlay: {
    flex: 1,

    width: '100%',

    justifyContent: 'flex-end',

    alignItems: 'flex-end',

    backgroundColor: 'rgba(0,0,0,0.10)',

    paddingRight: 4,
  },

  // ==========================================================
  // MENU DO PERFIL
  // ==========================================================

  profileMenu: {
    width: '40%',

    maxWidth: 200,

    minWidth: 150,

    backgroundColor: '#FFFFFF',

    paddingVertical: 16,

    paddingHorizontal: 15,

    borderRadius: 15,

    alignItems: 'flex-start',

    shadowColor: '#000',

    shadowOffset: {
      width: 0,

      height: 4,
    },

    shadowOpacity: 0.3,

    shadowRadius: 5,

    elevation: 10,
  },

  profileMenuButton: {
    width: '100%',

    paddingVertical: 7,
  },

  profileMenuText: {
    fontSize: 15,

    lineHeight: 22,

    fontFamily: 'Montserrat-Regular',

    color: '#333333',
  },

  logoutText: {
    color: '#9C0E23',

    fontSize: 16,
  },
});

export default styles;