import React, {useEffect, useState, useCallback} from 'react';

import {
  Modal,
  TouchableWithoutFeedback,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';

import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import styles from './Header.styles';

import useMenuMainColapse from '../../hooks/menuMainColapse/useMenuMainColapse';
import UseNotificacoesGerais from '../../hooks/UseNotificacoes/UseNotificacoesGerais';

import UseViagensCarteiro from '../../hooks/UseViagens/UseViagensCarteiro';
import UseViagensDisponibilizadas from '../../hooks/UseViagens/UseViagensDisponibilizadas';
import UseViagensNaoEfetivadasCarteiro from '../../hooks/UseViagens/UseViagensNaoEfetivadasCarteiro';

import UseViagensCliente from '../../hooks/UseViagens/UseViagensCliente';
import UseViagensNaoEfetivadasCliente from '../../hooks/UseViagens/UseViagensNaoEfetivadasCliente';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {useAuth} from '../../context/AuthContext';

import {
  getSecureData,
  clearSecureStorage,
} from '../../utils/secureStorage';

import {
  saveToGlobalState,
  clearAppState,
} from '../../utils/storage';

import Config from 'react-native-config';

const URL_MAIN = Config.URL_MAIN;

// Altura aproximada da área visual do menu.
// A Safe Area será adicionada separadamente.
const HEADER_HEIGHT = 68;

const Header = () => {
  const insets = useSafeAreaInsets();

  const {alternarMenuMain} = useMenuMainColapse();

  const navigation = useNavigation();

  const [avatarVersion, setAvatarVersion] = useState(Date.now());
  const [modalPerfilUsuario, setModalPerfilUsuario] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nrNotificacoes, setNrNotificacoes] = useState(0);
  const [loadingNotificacoes, setLoadingNotificacoes] = useState(true);
  const [serieLogdo, setSerieLogdo] = useState('');

  const {user, openLoginModal} = useAuth();

  const {
    notificacoesGerais,
    loadingNotificacoesGerais,
    buscarNotificacoesGerais,
  } = UseNotificacoesGerais();

  const {
    viagensEmNegociacaoCarteiro,
  } = UseViagensCarteiro();

  const {
    viagensDisponibilizadasCarteiro,
  } = UseViagensDisponibilizadas();

  const {
    viagensNaoEfetivadasCarteiro,
  } = UseViagensNaoEfetivadasCarteiro();

  const {
    viagensEmNegociacaoCliente,
  } = UseViagensCliente();

  const {
    viagensNaoEfetivadasCliente,
  } = UseViagensNaoEfetivadasCliente();

  // ============================================================
  // Atualiza avatar quando a tela recebe foco
  // ============================================================

  useFocusEffect(
    useCallback(() => {
      setAvatarVersion(Date.now());
    }, []),
  );

  // ============================================================
  // Verifica login
  // ============================================================

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

  // ============================================================
  // Atualiza quantidade de notificações
  // ============================================================

  useEffect(() => {
    if (isLoggedIn) {
      setNrNotificacoes(
        Array.isArray(notificacoesGerais)
          ? notificacoesGerais.length
          : 0,
      );
    } else {
      setNrNotificacoes(0);
    }
  }, [notificacoesGerais, isLoggedIn]);

  // ============================================================
  // Busca notificações
  // ============================================================

  useEffect(() => {
    let mounted = true;

    const fetchNotificacoesGerais = async () => {
      try {
        if (mounted) {
          setLoadingNotificacoes(true);
        }

        await buscarNotificacoesGerais();
      } catch (error) {
        console.log(
          'Erro ao buscar notificações:',
          error,
        );
      } finally {
        if (mounted) {
          setLoadingNotificacoes(false);
        }
      }
    };

    fetchNotificacoesGerais();

    const intervalId = setInterval(() => {
      fetchNotificacoesGerais();
    }, 3000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // ============================================================
  // Redirecionamentos
  // ============================================================

  const redirectLogin = async typeRedirect => {
    try {
      const refresh_token =
        await getSecureData('refresh_token');

      let type_login = '';

      // --------------------------------------------------------
      // Usuário não está logado
      // --------------------------------------------------------

      if (!refresh_token) {
        if (typeRedirect === 'suas_viagens') {
          type_login = 'VIAJANTE';

          await saveToGlobalState({
            logar_como: 'VIAJANTE',
          });
        } else if (typeRedirect === 'destinatario') {
          type_login = 'DESTINATÁRIO';

          await saveToGlobalState({
            logar_como: 'DESTINATÁRIO',
          });
        } else if (typeRedirect === 'seus_envios') {
          type_login = 'CLIENTE';

          await saveToGlobalState({
            logar_como: 'CLIENTE',
          });
        } else if (typeRedirect === 'perfil') {
          type_login = 'PERFIL';

          await saveToGlobalState({
            logar_como: '',
          });
        } else if (typeRedirect === 'notificacoes') {
          type_login = 'NOTIFICATION';

          await AsyncStorage.setItem(
            'notificacoes',
            '1',
          );

          await saveToGlobalState({
            logar_como: '',
          });
        }

        openLoginModal(type_login);

        return;
      }

      // --------------------------------------------------------
      // Viagens do viajante
      // --------------------------------------------------------

      if (typeRedirect === 'suas_viagens') {
        if (
          viagensEmNegociacaoCarteiro &&
          viagensEmNegociacaoCarteiro.length > 0
        ) {
          navigation.navigate(
            'DashboardTraveler',
          );

          return;
        }

        if (
          viagensEmNegociacaoCarteiro &&
          viagensEmNegociacaoCarteiro.some(
            v => ['8'].includes('8'),
          )
        ) {
          navigation.navigate(
            'TripsConcludedTraveler',
          );

          return;
        }

        if (
          viagensDisponibilizadasCarteiro &&
          viagensDisponibilizadasCarteiro.length > 0
        ) {
          navigation.navigate(
            'DashboardAvailable', 
          );

          return;
        }

        if (
          viagensNaoEfetivadasCarteiro &&
          viagensNaoEfetivadasCarteiro.length > 0
        ) {
          navigation.navigate(
            'TripsNotConcludedTraveler',
          );

          return;
        }

        navigation.navigate(
          'DashboardTraveler',
        );

        return;
      }

      // --------------------------------------------------------
      // Destinatário
      // --------------------------------------------------------

      if (typeRedirect === 'destinatario') {
        navigation.navigate(
          'DashboardReceiver',
        );

        return;
      }

      // --------------------------------------------------------
      // Envios do cliente
      // --------------------------------------------------------

      if (typeRedirect === 'seus_envios') {
        if (
          viagensEmNegociacaoCliente &&
          viagensEmNegociacaoCliente.length > 0
        ) {
          navigation.navigate(
            'DashboardClient',
          );

          return;
        }

        if (
          viagensEmNegociacaoCliente &&
          viagensEmNegociacaoCliente.some(
            v => ['8'].includes('8'),
          )
        ) {
          navigation.navigate(
            'TripsConcludedClient',
          );

          return;
        }

        if (
          viagensNaoEfetivadasCliente &&
          viagensNaoEfetivadasCliente.length > 0
        ) {
          navigation.navigate(
            'TripsNotConcludedClient',
          );

          return;
        }

        navigation.navigate(
          'DashboardClient',
        );

        return;
      }

      // --------------------------------------------------------
      // Notificações
      // --------------------------------------------------------

      if (typeRedirect === 'notificacoes') {
        navigation.navigate(
          'Notificacoes',
        );

        return;
      }

      // --------------------------------------------------------
      // Perfil
      // --------------------------------------------------------

      if (typeRedirect === 'perfil') {
        setModalPerfilUsuario(true);

        return;
      }
    } catch (error) {
      console.log(
        'Erro no redirecionamento:',
        error,
      );
    }
  };

  // ============================================================
  // Logout
  // ============================================================

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();

      await clearSecureStorage();

      await clearAppState();

      setIsLoggedIn(false);

      setSerieLogdo('');

      setModalPerfilUsuario(false);

      setNrNotificacoes(0);
    } catch (error) {
      console.log(
        'Erro ao fazer logout:',
        error,
      );
    }
  };

  // ============================================================
  // Render
  // ============================================================

  return (
    <>
      {/* ======================================================
          MODAL DO PERFIL
          ====================================================== */}

      <Modal
        visible={modalPerfilUsuario}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() =>
          setModalPerfilUsuario(false)
        }
      >
        <TouchableWithoutFeedback
          onPress={() =>
            setModalPerfilUsuario(false)
          }
        >
          <View
            style={[
              styles.overlay,
              {
                paddingBottom:
                  insets.bottom +
                  HEADER_HEIGHT +
                  8,
              },
            ]}
          >
            <TouchableWithoutFeedback
              onPress={() => {}}
            >
              <View style={styles.profileMenu}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setModalPerfilUsuario(false);

                    navigation.navigate(
                      'MeuPerfil',
                    );
                  }}
                  style={styles.profileMenuButton}
                >
                  <Text
                    style={
                      styles.profileMenuText
                    }
                  >
                    Meu Perfil
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleLogout}
                  style={styles.profileMenuButton}
                >
                  <Text
                    style={[
                      styles.profileMenuText,
                      styles.logoutText,
                    ]}
                  >
                    Sair
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ======================================================
          HEADER / MENU INFERIOR
          ====================================================== */}

      <View
        style={[
          styles.headerWrapper,
          {
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <View style={styles.containerHome}>
          {/* ==================================================
              VIAGENS
              ================================================== */}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              redirectLogin(
                'suas_viagens',
              )
            }
            style={styles.button}
          >
            <MaterialIcon
              name="luggage"
              size={24}
              color="rgba(164, 162, 162, 0.5)"
            />

            <Text
              style={styles.text}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Viagens
            </Text>
          </TouchableOpacity>

          {/* ==================================================
              ENVIOS
              ================================================== */}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              redirectLogin(
                'seus_envios',
              )
            }
            style={[styles.button, { marginRight: 15 }]}
          >
            <MaterialIcon
              name="trolley"
              size={24}
              color="rgba(164, 162, 162, 0.5)"
            />

            <Text
              style={styles.text}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Envios
            </Text>
          </TouchableOpacity>

          {/* ==================================================
              DESTINATÁRIO
              ================================================== */}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              redirectLogin(
                'destinatario',
              )
            }
            style={[styles.button, { marginRight: 25 }]}
          >
            <MaterialIcon
              name="card-travel"
              size={24}
              color="rgba(164, 162, 162, 0.5)"
            />

            <Text
              style={styles.text}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Destinatário
            </Text>
          </TouchableOpacity>

          {/* ==================================================
              NOTIFICAÇÕES
              ================================================== */}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              redirectLogin(
                'notificacoes',
              )
            }
            style={[styles.button, { marginTop: 5, marginRight: 6 }]}
          >
            <View style={styles.notificationIconWrapper}>
              <MaterialIcon
                name="forum"
                size={24}
                color="rgba(164, 162, 162, 0.5)"
              />

              {nrNotificacoes > 0 && (
                <View
                  style={
                    styles.notificationBadge
                  }
                >
                  <Text
                    style={
                      styles.notificationBadgeText
                    }
                    numberOfLines={1}
                  >
                    {nrNotificacoes > 99
                      ? '99+'
                      : nrNotificacoes}
                  </Text>
                </View>
              )}
            </View>

            <Text
              style={styles.text}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Notificações
            </Text>
          </TouchableOpacity>

          {/* ==================================================
              PERFIL
              ================================================== */}

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.button}
            onPress={() =>
              redirectLogin('perfil')
            }
          >
            {isLoggedIn ? (
              <Image
                key={avatarVersion}
                source={{
                  uri: `${URL_MAIN}${
                    user?.identificacao || ''
                  }`,
                }}
                style={styles.avatar}
              />
            ) : (
              <MaterialIcon
                name="account-circle"
                size={24}
                color="rgba(164, 162, 162, 0.5)"
              />
            )}

            <Text
              style={styles.text}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {isLoggedIn ? (
              <Text>Saul</Text>
            ) : (
              <Text>Perfil</Text>
            )}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default Header;