// hooks/useViagensNoRaioNaoDesejado.js
import { useState, useEffect } from 'react';
import fetchViagensNoRaio from '../api/fetchViagensNoRaio';

export default function UseViagensNoRaioNaoDesejado({ saindo_de, indo_para, carga, valor_seguro }) {
  const [viagensNoRaioNaoDesejado, setViagensNoRaioNaoDesejado] = useState([]);
  const [loadingNoRaioNaoDesejado, setLoadingNoRaioNaoDesejado] = useState(true);
  const [erroNoRaioNaoDesejado, setErroNoRaioNaoDesejado] = useState(null);

  useEffect(() => {
    async function buscarViagens() {
      setLoadingNoRaioNaoDesejado(true);
      try {
        const response = await fetchViagensNoRaio({ saindo_de, indo_para, carga, valor_seguro });

        if (!response.ok) throw new Error('Erro ao buscar viagens');

        // Pegue o texto bruto primeiro
        const rawText = await response.text();

        // Mostre no console o conteúdo bruto
        //console.log("Resposta bruta do PHP (No Raio Nao Desejado):", rawText);

        //try {
          // Agora tente converter para JSON
          const data = JSON.parse(rawText);
          //console.log(data)
          const foraDoRaio = data.filter((item) => item.tipo_resultado === 'fora do raio');
          //console.log(foraDoRaio)
          //if(data[0].tipo_resultado == 'fora do raio'){
            setViagensNoRaioNaoDesejado(foraDoRaio);
          //}          
        /*} catch (jsonErr) {
          console.error("Erro ao fazer parse do JSON:", jsonErr);
          setErroNoRaioNaoDesejado("Erro ao processar resposta do servidor");
        }*/

      } catch (err) {
        setErroNoRaioNaoDesejado(err.message || 'Erro desconhecido');
      } finally {
        setLoadingNoRaioNaoDesejado(false);
      }
    }

    if (saindo_de && indo_para && carga && valor_seguro) {
      buscarViagens();
    }
  }, [saindo_de, indo_para, carga, valor_seguro]);

  return { viagensNoRaioNaoDesejado, loadingNoRaioNaoDesejado, erroNoRaioNaoDesejado };
}
