import { useState } from 'react';
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;

const API_URL = `${URL_MAIN}/controllers/mobile/EditarUsuarioController.php`;

export default function UseEditarUsuario() {
  const [loadingEditarUsuario, setLoadingEditarUsuario] = useState(false);
  const [error, setError] = useState(null);
  const [editUsuario, setEditUsuario] = useState('');


  const editarUsuario = async (
     serieLogado,
     nome,
     sobreNome,  
     nascimento,  
     celular, 
     email, 
     tipochavePix,
     chavePix,
     uploadImgPerfil,
     imgPerfil,
  ) => {
    setLoadingEditarUsuario(true);
    setError(null);

    const formData = new FormData();

    formData.append('serie_logado', serieLogado);
    formData.append('nome', nome);
    formData.append('sobrenome', sobreNome);
    formData.append('nascimento', nascimento);
    formData.append('celular', celular);
    formData.append('email', email);
    formData.append('tipo_chave_pix', tipochavePix);
    formData.append('chave_pix', chavePix);
    formData.append('upload_img', uploadImgPerfil);
    formData.append('img', {
        uri: imgPerfil,
        type: 'image/jpeg',
        name: `img.jpg`,
      });

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Erro ao enviar imagens');
      }

      const json = await response.json();
      setEditUsuario(json);
      return json;
    } catch (err) {
      setError(err.message || 'Erro inesperado');
      return null;
    } finally {
      setLoadingEditarUsuario(false);
    }
  };




  return { editarUsuario };
}
