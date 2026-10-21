import React, {useState, useEffect, useCallback} from 'react';
import {
  Modal,
  View,
  Text,
  ActivityIndicator,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import LocalizacaoAtual from '../localizacaoAtual/LocalizacaoAtual';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {UserRoundPlus, UserRoundCheck} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';
import NotificationsModal from '../notifications/NotificationsModal';
import UseNotifications from '../../hooks/UseNotifications/UseNotifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getSecureData, clearSecureStorage} from '../../utils/secureStorage';
import Config from 'react-native-config';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';

import logo from '../../assets/logo/logo.png';

import home from '../../assets/images/home.png';
import cancel from '../../assets/images/cancel.png';
import travelAgency from '../../assets/images/travel-agency.png';
import inProgress from '../../assets/images/in-progress.png';

dayjs.extend(relativeTime);
dayjs.locale('pt-br');

const {width} = Dimensions.get('window');

export default function SidebarLandingPage({backgroundColor = '#fff'}) {
  const navigationHeader = useNavigation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatarVersion, setAvatarVersion] = useState(Date.now());
  const [modalPerfilUsuario, setModalPerfilUsuario] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);

  const {user, openLoginModal} = useAuth();

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

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const refresh_token = await getSecureData('refresh_token');

        if (refresh_token) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.log('Erro ao verificar login:', error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleNotificacoes = async () => {
    handleNotifications();
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    await clearSecureStorage();
    setModalPerfilUsuario(false);
    navigationHeader.navigate('Home');
  };

  useFocusEffect(
    useCallback(() => {
      setAvatarVersion(Date.now());
    }, []),
  );

  return (
    <View style={styles.mainWrapper}>
      <Modal
        visible={modalPerfilUsuario}
        transparent
        animationType="fade"
        onRequestClose={() => setModalPerfilUsuario(false)}>
        <TouchableWithoutFeedback onPress={() => setModalPerfilUsuario(false)}>
          <View
            style={[
              styles.modalOverlay,
              {justifyContent: 'flex-start', alignItems: 'flex-end'},
            ]}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.userProfileModal}>
                <TouchableOpacity
                  onPress={() => {
                    setModalPerfilUsuario(false);
                    navigationHeader.navigate('MeuPerfil');
                  }}
                  style={styles.modalOption}>
                  <MaterialIcons
                    name="person"
                    size={20}
                    color="#555"
                    style={styles.modalOptionIcon}
                  />
                  <Text style={styles.modalOptionText}>Meu Perfil</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleNotificacoes()}
                  style={styles.modalOption}>
                  <MaterialIcons
                    name="notifications"
                    size={20}
                    color="#555"
                    style={styles.modalOptionIcon}
                  />
                  {unreadNotifications > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationBadgeText} numberOfLines={1}>
                        {unreadNotifications > 99 ? '99+' : unreadNotifications}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.modalOptionText}>Notificações</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setModalPerfilUsuario(false);
                    handleLogout();
                  }}
                  style={[styles.modalOption, {marginBottom: 0}]}>
                  <MaterialIcons
                    name="exit-to-app"
                    size={20}
                    color="#9c0e23"
                    style={styles.modalOptionIcon}
                  />
                  <Text style={[styles.modalOptionText, {color: '#9c0e23'}]}>
                    Logout
                  </Text>
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

      <Modal
        visible={showMenuModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenuModal(false)}>
        <TouchableWithoutFeedback onPress={() => setShowMenuModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.menuContainer}>
                <TouchableOpacity
                  onPress={() => setShowMenuModal(false)}
                  style={styles.closeIconButton}>
                  <MaterialIcons
                    name="keyboard-arrow-left"
                    size={32}
                    color="#fff"
                  />
                </TouchableOpacity>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                  contentContainerStyle={styles.menuContentContainer}>
                  {/* 
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setShowMenuModal(false);
                      navigationHeader.navigate('DashboardReceiver');
                    }}>                    
                    <Image
                      source={home}
                      style={styles.menuIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.menuItemText}>Início</Text>
                  </TouchableOpacity>
                  */}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <View style={[styles.headerMainContainer, {backgroundColor}]}>
        <TouchableOpacity
          onPress={() => {
            setShowMenuModal(false);
            navigationHeader.navigate('Home');
          }}
          style={styles.logoTouchArea}>
          <Image
            source={logo}
            style={styles.logoImageStyle}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <View style={styles.rightActionsWrapper}>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            colors={['#1a7fe7', '#19c4c9']}
            style={styles.profileInfiniteBarGradient}>
            <TouchableOpacity
              onPress={() => {
                if (isLoggedIn) {
                  setModalPerfilUsuario(true);
                } else {
                  openLoginModal('ANYWAY');
                }
              }}
              style={styles.profileBarTouch}>
              <View style={styles.avatarBarFrame}>
                {isLoggedIn ? (
                  <Image
                    key={avatarVersion}
                    source={{
                      uri: `${Config.URL_MAIN}${user.identificacao}`,
                      cache: 'reload',
                    }}
                    style={styles.avatarBarImage}
                  />
                ) : (
                  <MaterialIcons
                    name="account-circle"
                    size={32}
                    color="#fff"
                  />
                )}
              </View>
              
                <MaterialIcons
                  name="keyboard-arrow-down"
                  size={18}
                  color="#fff"
                  style={styles.arrowBarIcon}
                /> 

                {unreadNotifications > 0 && (
                    <View style={[styles.notificationBadge, { top: -5, right: 50 }]}>
                      <Text style={styles.notificationBadgeText} numberOfLines={1}>
                        {unreadNotifications > 99 ? '99+' : unreadNotifications}
                      </Text>
                    </View>
                  )}             

              <View style={{width: 15}} />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>

      <LocalizacaoAtual />
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    backgroundColor: '#F3F6FD',
    overflow: 'hidden',
  },
  headerMainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: -15,
    marginTop: -10,
    position: 'relative',
    zIndex: 1,
  },
  logoTouchArea: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImageStyle: {
    width: 190,
    height: 130,
  },
  rightActionsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    marginRight: -20,
  },
  menuSquareGradient: {
    width: 50,
    height: 50,
    borderRadius: 15,
    marginRight: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  menuSquareTouch: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 120,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: '#ae0b42',
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
  profileInfiniteBarGradient: {
    height: 54,
    paddingLeft: 6,
    borderTopLeftRadius: 27,
    borderBottomLeftRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  profileBarTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  avatarBarFrame: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBarImage: {
    width: '100%',
    height: '100%',
  },
  arrowBarIcon: {
    marginLeft: 10,
    marginRight: 15,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  userProfileModal: {
    backgroundColor: '#fff',
    width: 180,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginTop: 85,
    marginRight: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 5,
  },
  modalOptionIcon: {
    marginRight: 10,
  },
  modalOptionText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#333',
  },
  menuContainer: {
    backgroundColor: '#007BFF',
    width: '78%',
    maxWidth: 320,
    paddingVertical: 25,
    paddingHorizontal: 40,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
    elevation: 10,
    alignSelf: 'flex-start',
  },
  menuContentContainer: {
    paddingTop: 20,
  },
  closeIconButton: {
    position: 'absolute',
    right: -20,
    top: '50%',
    marginTop: -20,
    backgroundColor: '#1a7fe7',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    zIndex: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 8,
  },
  menuIcon: {
    width: 32,
    height: 32,
  },
  menuItemText: {
    fontSize: 17,
    marginLeft: 15,
    fontFamily: 'Montserrat-Bold',
    color: '#ffffff',
    lineHeight: 20,
  },
  sectionHeader: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    marginTop: 5,
    marginBottom: 12,
    letterSpacing: 1,
  },
  panelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  panelIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  panelButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
    marginLeft: 15,
    lineHeight: 19,
  },
});
