import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';

import Config from 'react-native-config';

import {
  saveSecureData,
  getSecureData,
  clearSecureStorage,
} from '../utils/secureStorage';
import { saveToGlobalState } from '../utils/storage';
import LoginModal from '../components/loginModal/LoginModal';

const URL_MAIN = Config.URL_MAIN;

const AuthContext = createContext();

const API_URL = URL_MAIN;

export function AuthProvider({children}) {
  const [user, setUser] = useState(null);

  const [accessToken, setAccessToken] = useState(null);

  const [loading, setLoading] = useState(true);

  const accessTokenRef = useRef(null);

  const [loginModalVisible, setLoginModalVisible] = useState(false);

  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  const openLoginModal = async (tipoUsuario) => {
    if (tipoUsuario) {
      await saveToGlobalState({ logar_como: tipoUsuario });
    }
    setLoginModalVisible(true);
  };

  const closeLoginModal = () => {
    setLoginModalVisible(false);
  };

  const saveRefreshToken = async refresh => {
    await saveSecureData('refresh_token', refresh);
  };

  const getRefreshToken = async () => {
    return await getSecureData('refresh_token');
  };

  /*
    LOGOUT
  */

  const logout = useCallback(async () => {
    try {
      const refresh = await getRefreshToken();

      if (refresh) {
        await fetch(`${API_URL}/api/auth/logout/`, {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            refresh,
          }),
        });
      }
    } catch (e) {
      console.log('Erro logout:', e);
    }

    await clearSecureStorage();

    setUser(null);

    setAccessToken(null);

    accessTokenRef.current = null;
  }, []);

  /*
    FETCH AUTOMÁTICO COM REFRESH TOKEN
  */

  const authFetch = useCallback(
    async (url, options = {}) => {
      console.log('ok44');
      const makeRequest = token => {
        return fetch(url, {
          ...options,

          headers: {
            ...options.headers,

            Authorization: `Bearer ${token}`,
          },
        });
      };

      let response = await makeRequest(accessTokenRef.current);

      if (response.ok) {
        return response;
      }

      if (response.status !== 401) {
        return response;
      }

      const refresh = await getRefreshToken();

      if (!refresh) {
        await logout();

        throw new Error('Sessão expirada');
      }

      const refreshResponse = await fetch(`${API_URL}/api/auth/refresh/`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          refresh,
        }),
      });

      if (!refreshResponse.ok) {
        await logout();

        throw new Error('Sessão expirada');
      }

      const refreshData = await refreshResponse.json();

      if (!refreshData.access) {
        await logout();

        throw new Error('Sessão expirada');
      }

      setAccessToken(refreshData.access);

      accessTokenRef.current = refreshData.access;

      return await makeRequest(refreshData.access);
    },
    [logout],
  );

  /*
    CARREGAR USUÁRIO AO ABRIR APP
  */

  const loadUser = useCallback(async () => {
    try {
      const refresh = await getRefreshToken();

      if (!refresh) {
        setUser(null);

        return;
      }

      const refreshRes = await fetch(`${API_URL}/api/auth/refresh/`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          refresh,
        }),
      });

      if (!refreshRes.ok) {
        await clearSecureStorage();

        setUser(null);

        return;
      }

      const refreshData = await refreshRes.json();

      if (!refreshData.access) {
        await clearSecureStorage();

        setUser(null);

        return;
      }

      setAccessToken(refreshData.access);

      accessTokenRef.current = refreshData.access;

      const meRes = await fetch(`${API_URL}/api/auth/me/`, {
        method: 'GET',

        headers: {
          Authorization: `Bearer ${refreshData.access}`,
        },
      });

      if (meRes.ok) {
        const data = await meRes.json();

        setUser(data);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.log('loadUser error:', e);

      setUser(null);

      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <AuthContext.Provider
      value={{
        loginModalVisible,

        openLoginModal,

        closeLoginModal,
        
        user,

        setUser,

        accessToken,

        setAccessToken,

        loading,

        logout,

        authFetch,

        loadUser,

        saveRefreshToken,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
