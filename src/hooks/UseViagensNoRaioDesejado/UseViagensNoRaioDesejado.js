// hooks/useViagensNoRaioDesejado.js
import { useState, useEffect } from 'react';
import fetchViagensNoRaio from '../api/fetchViagensNoRaio';

export default function UseViagensNoRaioDesejado({ saindo_de, indo_para, carga, valor_seguro }) {
  const [viagensNoRaioDesejado, setViagensNoRaioDesejado] = useState([]);
  const [viagensNoRaioNaoDesejado, setViagensNoRaioNaoDesejado] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function buscarViagens() {
      setLoading(true);
      try {
        const response = await fetchViagensNoRaio({ saindo_de, indo_para, carga, valor_seguro });

        if (!response.ok) throw new Error('Erro ao buscar viagens');

        // Pegue o texto bruto primeiro
        const rawText = await response.text();

        // Mostre no console o conteúdo bruto
        //console.log("Resposta bruta do PHP (No Raio Desejado):", rawText);

        //try {
          // Agora tente converter para JSON
          const data = JSON.parse(rawText);
          //console.log(data.viagens)
          //const noRaio = data.filter((item) => item.distancia <= 50);
          //console.log(data.viagens.filter((item) => item.viagens_recomendadas_principal == 1))
          setViagensNoRaioDesejado(data.viagens.filter((item) => item.viagens_recomendadas_principal == 1 || item.viagens_recomendadas_origem == 1 || item.viagens_recomendadas_destino == 1));
          //setViagensNoRaioDesejado(data.viagens.filter((item) => item.viagens_recomendadas_origem == 1));
          //setViagensNoRaioDesejado(data.viagens.filter((item) => item.viagens_recomendadas_destino == 1));

          //const foraRaio = data.filter((item) => item.distancia > 50);
          //console.log(foraRaio)
          setViagensNoRaioNaoDesejado(data.viagens.filter((item) => item.outras_viagens == 1));

      } catch (err) {
        setErro(err.message || 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }

    if (saindo_de && indo_para && carga && valor_seguro) {
      buscarViagens();
    }
  }, [saindo_de, indo_para, carga, valor_seguro]);

  return { viagensNoRaioDesejado, viagensNoRaioNaoDesejado, loading, erro };
}
