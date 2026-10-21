//Header.js
import React, {useEffect, useState, useCallback} from 'react';
import {
  Modal,
  TouchableWithoutFeedback,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styles from './Header.styles';
import useMenuMainColapse from '../../hooks/menuMainColapse/useMenuMainColapse';
import NotificationsModal from '../notifications/NotificationsModal';
import UseNotifications from '../../hooks/UseNotifications/UseNotifications';

// Seus hooks de negociações existentes
import UseViagensCarteiro from '../../hooks/UseViagens/UseViagensCarteiro';
import UseViagensDisponibilizadas from '../../hooks/UseViagens/UseViagensDisponibilizadas';
import UseViagensNaoEfetivadasCarteiro from '../../hooks/UseViagens/UseViagensNaoEfetivadasCarteiro';
import UseViagensCliente from '../../hooks/UseViagens/UseViagensCliente';
import UseViagensNaoEfetivadasCliente from '../../hooks/UseViagens/UseViagensNaoEfetivadasCliente';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '../../context/AuthContext';
import {getSecureData, clearSecureStorage} from '../../utils/secureStorage';
import {saveToGlobalState, clearAppState} from '../../utils/storage';
import Config from 'react-native-config';

const URL_MAIN = Config.URL_MAIN;
const HEADER_HEIGHT = 68;

const Header = () => {
  const insets = useSafeAreaInsets();
  const {alternarMenuMain} = useMenuMainColapse();
  const navigation = useNavigation();

  const [avatarVersion, setAvatarVersion] = useState(Date.now());
  const [modalPerfilUsuario, setModalPerfilUsuario] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [serieLogdo, setSerieLogdo] = useState('');

  const {user, openLoginModal} = useAuth();

  // Hook robusto de notificações portado da Web
  const {
    notificationsOpen,
    setNotificationsOpen,
    notifications,
    loadingNotifications,
    confirmDeleteNotifications,
    setConfirmDeleteNotifications,
    handleNotifications,
    removeNotification,
    buscarNotifications,
  } = UseNotifications();

  // Quantidade de notificações não lidas (viewed === false)
  const unreadNotifications = notifications.filter((n) => !n.viewed).length;

  const { viagensEmNegociacaoCarteiro } = UseViagensCarteiro();
  const { viagensDisponibilizadasCarteiro } = UseViagensDisponibilizadas();
  const { viagensNaoEfetivadasCarteiro } = UseViagensNaoEfetivadasCarteiro();
  const { viagensEmNegociacaoCliente } = UseViagensCliente();
  const { viagensNaoEfetivadasCliente } = UseViagensNaoEfetivadasCliente();

  useFocusEffect(
    useCallback(() => {
      setAvatarVersion(Date.now());
    }, []),
  );

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const refresh_token = await getSecureData('refresh_token');
        const serie = await AsyncStorage.getItem('serie_logado');
        if (refresh_token) {
          setIsLoggedIn(true);
          setSerieLogdo(serie || '');
        } else {
          setIsLoggedIn(false);
          setSerieLogdo('');
        }
      } catch (error) {
        console.log('Erro ao verificar login:', error);
        setIsLoggedIn(false);
      }
    };
    checkLoginStatus();
  }, []);

  // Polling periódico para buscar novas notificações tal como na web
  {/*useEffect(() => {
    let mounted = true;
    const intervalId = setInterval(() => {
      if (mounted && isLoggedIn) {
        buscarNotifications();
      }
    }, 10000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [isLoggedIn, buscarNotifications]);*/}

  const redirectLogin = async typeRedirect => {
    try {
      const refresh_token = await getSecureData('refresh_token');
      let type_login = '';

      if (!refresh_token) {
        if (typeRedirect === 'suas_viagens') {
          type_login = 'VIAJANTE';
          await saveToGlobalState({ logar_como: 'VIAJANTE' });
        } else if (typeRedirect === 'destinatario') {
          type_login = 'DESTINATÁRIO';
          await saveToGlobalState({ logar_como: 'DESTINATÁRIO' });
        } else if (typeRedirect === 'seus_envios') {
          type_login = 'CLIENTE';
          await saveToGlobalState({ logar_como: 'CLIENTE' });
        } else if (typeRedirect === 'perfil') {
          type_login = 'PERFIL';
          await saveToGlobalState({ logar_como: '' });
        } else if (typeRedirect === 'notificacoes') {
          if (!isLoggedIn) {
            openLoginModal('NOTIFICATION');
            return;
          }
          handleNotifications(); // Abre o painel e marca como lidas
          return;
        }
        openLoginModal(type_login);
        return;
      }

      if (typeRedirect === 'suas_viagens') {
        if (viagensEmNegociacaoCarteiro?.length > 0) {
          navigation.navigate('DashboardTraveler');
          return;
        }
        navigation.navigate('DashboardTraveler');
        return;
      }

      if (typeRedirect === 'destinatario') {
        navigation.navigate('DashboardReceiver');
        return;
      }

      if (typeRedirect === 'seus_envios') {
        navigation.navigate('DashboardClient');
        return;
      }

      if (typeRedirect === 'notificacoes') {
        handleNotifications(); // Abre o painel elegante de notificações
        return;
      }

      if (typeRedirect === 'perfil') {
        setModalPerfilUsuario(true);
        return;
      }
    } catch (error) {
      console.log('Erro no redirecionamento:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      await clearSecureStorage();
      await clearAppState();
      setIsLoggedIn(false);
      setSerieLogdo('');
      setModalPerfilUsuario(false);
    } catch (error) {
      console.log('Erro ao fazer logout:', error);
    }
  };

  return (
    <>
      {/* MODAL DO PERFIL */}
      <Modal
        visible={modalPerfilUsuario}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setModalPerfilUsuario(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalPerfilUsuario(false)}>
          <View style={[styles.overlay, { paddingBottom: insets.bottom + HEADER_HEIGHT + 8 }]}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.profileMenu}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setModalPerfilUsuario(false);
                    navigation.navigate('MeuPerfil');
                  }}
                  style={styles.profileMenuButton}
                >
                  <Text style={styles.profileMenuText}>Meu Perfil</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleLogout}
                  style={styles.profileMenuButton}
                >
                  <Text style={[styles.profileMenuText, styles.logoutText]}>Sair</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <NotificationsModal
        visible={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        loading={loadingNotifications}
        confirmDeleteNotifications={confirmDeleteNotifications}
        setConfirmDeleteNotifications={setConfirmDeleteNotifications}
        removeNotification={removeNotification}
      />

      {/* HEADER / BARRA INFERIOR */}
      <View style={[styles.headerWrapper, { paddingBottom: insets.bottom }]}>
        <View style={styles.containerHome}>
          {/* VIAGENS */}
          <TouchableOpacity activeOpacity={0.7} onPress={() => redirectLogin('suas_viagens')} style={styles.button}>
            <MaterialIcon name="luggage" size={24} color="rgba(164, 162, 162, 0.5)" />
            <Text style={styles.text} numberOfLines={1}>Viagens</Text>
          </TouchableOpacity>

          {/* ENVIOS */}
          <TouchableOpacity activeOpacity={0.7} onPress={() => redirectLogin('seus_envios')} style={styles.button}>
            <MaterialIcon name="trolley" size={24} color="rgba(164, 162, 162, 0.5)" />
            <Text style={styles.text} numberOfLines={1}>Envios</Text>
          </TouchableOpacity>

          {/* DESTINATÁRIO */}
          <TouchableOpacity activeOpacity={0.7} onPress={() => redirectLogin('destinatario')} style={styles.button}>
            <MaterialIcon name="card-travel" size={24} color="rgba(164, 162, 162, 0.5)" />
            <Text style={styles.text} numberOfLines={1}>Destinatário</Text>
          </TouchableOpacity>

          {/* NOTIFICAÇÕES COM BADGE */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => redirectLogin('notificacoes')}
            style={[styles.button, { marginTop: 5, marginRight: 6 }]}
          >
            <View style={styles.notificationIconWrapper}>
              <MaterialIcon name="forum" size={24} color="rgba(164, 162, 162, 0.5)" />
              {unreadNotifications > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText} numberOfLines={1}>
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.text} numberOfLines={1}>Notificações</Text>
          </TouchableOpacity>

          {/* PERFIL */}
          <TouchableOpacity activeOpacity={0.7} style={styles.button} onPress={() => redirectLogin('perfil')}>
            {isLoggedIn ? (
              <Image
                key={avatarVersion}
                source={{ uri: `${URL_MAIN}${user?.identificacao || ''}` }}
                style={styles.avatar}
              />
            ) : (
              <MaterialIcon name="account-circle" size={24} color="rgba(164, 162, 162, 0.5)" />
            )}
            <Text style={styles.text} numberOfLines={1}>
              {isLoggedIn ? user?.nome?.split(' ')?.[0] || 'Perfil' : 'Perfil'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default Header;

// Estilos nativos inspirados no modal CSS da Web
const nativeStyles = {
  notificationsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 15, 25, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  notificationsModal: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  notificationsHeader: {
    padding: 20,
    backgroundColor: '#1a7fe7', // Base do gradiente do cabeçalho da web
  },
  closeNotifications: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  notificationsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationsTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  notificationsSubtitleText: {
    marginTop: 4,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  notificationsList: {
    padding: 12,
  },
  notificationsEmpty: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationsItem: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#fafbfc',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f2f5',
  },
  notificationsDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1a7fe7',
    marginTop: 6,
  },
  notificationItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#242a35',
    marginBottom: 4,
  },
  notificationItemMessage: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  notificationsTime: {
    marginTop: 6,
    fontSize: 11,
    color: '#9aa6b2',
  },
  notificationActions: {
    marginTop: 10,
  },
  removeBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  removeBtnText: {
    color: '#dc2626',
    fontSize: 11,
    fontWeight: '700',
  },
  confirmRemove: {
    backgroundColor: '#fff6f6',
    borderWidth: 1,
    borderColor: '#ffd2d2',
    padding: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  confirmRemoveText: {
    color: '#7f1d1d',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  confirmBtn: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#eef2f7',
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
  },
};