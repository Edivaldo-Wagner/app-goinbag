import { useState } from 'react';
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;

const API_URL = `${URL_MAIN}/controllers/mobile/CadastroUsuarioController.php`;

export default function UseCadastroUsuario() {
  const [loadingCadastroUsuario, setLoadingCadastroUsuario] = useState(false);
  const [error, setError] = useState(null);
  const [cadastramentoUsuario, setCadastramentoUsuario] = useState('');


  const cadastroUsuario = async (
     nome,
     sobreNome,
     email, 
     nascimento,     
     celular, 
     cpf,
     tipochavePix,
     chavePix,
     senha,
     imgPerfil,
     tipoCadastro,
  ) => {
    setLoadingCadastroUsuario(true);
    setError(null);

    const formData = new FormData();

    formData.append('nome', nome);
    formData.append('sobrenome', sobreNome);
    formData.append('email', email);
    formData.append('nascimento', nascimento);
    formData.append('celular', celular);
    formData.append('cpf', cpf);
    formData.append('tipo_chave_pix', tipochavePix);
    formData.append('chave_pix', chavePix);
    formData.append('senha', senha);
    formData.append('img', {
        uri: imgPerfil,
        type: 'image/jpeg',
        name: `img.jpg`,
      });
    formData.append('tipo_cadastro', tipoCadastro);

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
      setCadastramentoUsuario(json);
      return json;
    } catch (err) {
      setError(err.message || 'Erro inesperado');
      return null;
    } finally {
      setLoadingCadastroUsuario(false);
    }
  };




  return { cadastroUsuario, cadastramentoUsuario, loadingCadastroUsuario };
}
