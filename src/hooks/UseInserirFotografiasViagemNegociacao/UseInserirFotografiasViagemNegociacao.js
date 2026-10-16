import { useState } from 'react';
import Config from 'react-native-config';
const URL_MAIN = Config.URL_MAIN;

const API_URL = `${URL_MAIN}/controllers/mobile/InserirFotografiasCargaController.php`;

export default function UseInserirFotografiasViagemNegociacao() {
  const [loadingInserirFotografiasViagemNegociacao, setLoadingInserirFotografiasViagemNegociacao] = useState(false);
  const [error, setError] = useState(null);
  const [insercaoFotografiasViagemNegociacao, setInsercaoFotografiasViagemNegociacao] = useState('');


  const inserirFotografiasViagemNegociacao = async (
    serieViagemNegociacao,
    serieLogado,
    nomeCliente,
    imagens
  ) => {
    setLoadingInserirFotografiasViagemNegociacao(true);
    setError(null);

    const formData = new FormData();

    formData.append('url', URL_MAIN);
    formData.append('serie_trajeto', serieViagemNegociacao);
    formData.append('serie_logado', serieLogado);
    formData.append('nome_cliente', nomeCliente);

    imagens.forEach((foto, index) => {
      formData.append('img[]', {
        uri: foto.uri,
        type: 'image/jpeg',
        name: `foto${index}.jpg`,
      });
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
      setInsercaoFotografiasViagemNegociacao(json);
      return json;
    } catch (err) {
      setError(err.message || 'Erro inesperado');
      return null;
    } finally {
      setLoadingInserirFotografiasViagemNegociacao(false);
    }
  };




  return { inserirFotografiasViagemNegociacao, insercaoFotografiasViagemNegociacao, loadingInserirFotografiasViagemNegociacao };
}
