//UseEditarUsuario.js
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Config from 'react-native-config';

const API_URL = Config.URL_MAIN;

export default function UseEditarUsuario() {
  const { authFetch } = useAuth();
  const [loading, setLoading] = useState(false);

  const editarUsuario = async (
    serie,
    nome,
    cpf,
    dataNascimento,
    telefone,
    email,
    tipoPix,
    chavePix,
    uploadAvatar,
    avatarUri
  ) => {
    try {
      setLoading(true);

      // Se houver alteração de imagem de perfil pendente, envia primeiro
      if (uploadAvatar && avatarUri) {
        const formData = new FormData();
        formData.append('imageProfile', {
          uri: avatarUri,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });

        await authFetch(`${API_URL}/api/users/update-image-profile/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });
      }

      // Envio dos dados pessoais
      const response = await authFetch(`${API_URL}/api/users/update-personal-data/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: nome,
          email: email,
          date_birth: dataNascimento,
          phone: telefone,
          cpf: cpf || '',
          type_pix: tipoPix,
          key_pix: chavePix,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar dados pessoais');
      }

      return {
        status: 'sucesso',
        data,
      };
    } catch (error) {
      console.log('Erro ao editar usuário:', error);
      return {
        status: 'erro',
        message: error.message,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    editarUsuario,
    loading,
  };
}