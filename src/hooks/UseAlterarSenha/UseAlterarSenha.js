import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Config from 'react-native-config';

const API_URL = Config.URL_MAIN;

export default function UseAlterarSenha() {
  const { authFetch } = useAuth();
  const [loading, setLoading] = useState(false);

  const alterarSenha = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      const response = await authFetch(`${API_URL}/api/users/update-password/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao alterar senha');
      }

      return { status: 'sucesso', data };
    } catch (error) {
      console.log('Erro ao alterar senha:', error);
      return { status: 'erro', message: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    alterarSenha,
    loading,
  };
}