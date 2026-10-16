import { useState } from 'react';
import Config from 'react-native-config';
import { useAuth } from '../../context/AuthContext';
import { getStoredData } from '../../utils/storage';

const API_URL = Config.URL_MAIN;
const GOOGLE_MAPS_API_KEY = Config.GOOGLE_API_KEY;

const MONTHS_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const MONTHS_MAP = {
  janeiro: 0,
  fevereiro: 1,
  marco: 2,
  março: 2,
  abril: 3,
  maio: 4,
  junho: 5,
  julho: 6,
  agosto: 7,
  setembro: 8,
  outubro: 9,
  novembro: 10,
  dezembro: 11,
};

const TIPO_ENCOMENDA_MAP = {
  'Pequeno, estilo envelope até 1kg': {
    tipo_encomenda_nr: '1',
    quantidade_maxima_carga: '1',
  },
  'Caixa de Sapato/Sacola – 1 kg a 5 kg': {
    tipo_encomenda_nr: '2',
    quantidade_maxima_carga: '5',
  },
  'Mochila/Mala – 5 kg a 10 kg': {
    tipo_encomenda_nr: '3',
    quantidade_maxima_carga: '10',
  },
  'Mala/Caixa – 10 kg até 23 kg': {
    tipo_encomenda_nr: '4',
    quantidade_maxima_carga: '23',
  },
};

function parseDateFlexible(value) {
  if (!value) return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return value;
  }

  const str = String(value).trim();

  let match = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    const day = Number(match[1]);
    const month = Number(match[2]) - 1;
    const year = Number(match[3]);
    return new Date(Date.UTC(year, month, day));
  }

  match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    return new Date(Date.UTC(year, month, day));
  }

  match = str.match(/^(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s*,\s*(\d{4})$/);
  if (match) {
    const day = Number(match[1]);
    const monthName = match[2]
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const month = MONTHS_MAP[monthName];
    const year = Number(match[3]);

    if (month === undefined) return null;

    return new Date(Date.UTC(year, month, day));
  }

  return null;
}

function formatDateLongBR(value) {
  const date = parseDateFlexible(value);
  if (!date) return '';

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = MONTHS_PT[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  return `${day} ${month}, ${year}`;
}

function formatDateShortBR(value) {
  const date = parseDateFlexible(value);
  if (!date) return '';

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();

  return `${day}/${month}/${year}`;
}

function normalizeDateFields(displayValue, searchValue) {
  const parsed =
    parseDateFlexible(searchValue) || parseDateFlexible(displayValue);

  return {
    data: formatDateLongBR(parsed) || displayValue || '',
    data_para_busca: formatDateShortBR(parsed) || searchValue || '',
  };
}

function calcularDuracaoViagem(diaInicial, diaFinal) {
  const inicio = parseDateFlexible(diaInicial);
  const fim = parseDateFlexible(diaFinal);

  if (!inicio || !fim) return '';

  const diffMs = fim.getTime() - inicio.getTime();
  const diffDias = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));

  return diffDias === 1 ? '1 dia' : `${diffDias} dias`;
}

function getTipoEncomendaMeta(tipoEncomenda) {
  return (
    TIPO_ENCOMENDA_MAP[tipoEncomenda] || {
      tipo_encomenda_nr: '',
      quantidade_maxima_carga: '',
    }
  );
}

function parseTrajetoItem(
  item,
  origemDisplayDate,
  origemSearchDate,
  origemHora,
  destinoDisplayDate,
  destinoSearchDate,
  destinoHora,
) {
  if (!item) return null;

  let cidade = '';
  let metaParte = null;
  let dataObj = null;
  let horaObj = null;

  if (typeof item === 'object') {
    cidade = (item.cidade || item.cidade_main || item.nome || item.label || '').trim();
    dataObj = item.data || item.data_partida || item.dia || null;
    horaObj = item.hora || item.horas || item.horas_partida || null;
  } else if (typeof item === 'string') {
    const [cParte, mParte] = item.split('#');
    cidade = (cParte || '').trim();
    metaParte = mParte;
    if (metaParte) {
      const [dParte, hParte] = metaParte.split('$');
      dataObj = dParte;
      horaObj = hParte;
    }
  }

  if (!cidade) return null;

  if (!dataObj && !metaParte) {
    return {
      cidade,
      data_partida: formatDateLongBR(origemDisplayDate),
      data_partida_para_busca: formatDateShortBR(origemSearchDate),
      horas_partida: origemHora,
      data_chegada: formatDateLongBR(destinoDisplayDate),
      data_chegada_para_busca: formatDateShortBR(destinoSearchDate),
      horas_chegada: destinoHora,
    };
  }

  const normalized = normalizeDateFields(dataObj, dataObj);

  return {
    cidade,
    data_partida: normalized.data,
    data_partida_para_busca: normalized.data_para_busca,
    horas_partida: horaObj || origemHora,
    data_chegada: normalized.data,
    data_chegada_para_busca: normalized.data_para_busca,
    horas_chegada: horaObj || destinoHora,
  };
}

function normalizeTrajetos(cidadesTrajeto, origem, destino) {
  let parsedTrajetos = cidadesTrajeto;

  // Trata casos em que a lista de trajetos veio salva como JSON String
  if (typeof cidadesTrajeto === 'string') {
    try {
      parsedTrajetos = JSON.parse(cidadesTrajeto);
    } catch (e) {
      console.warn('Erro ao converter cidades_trajeto de string para JSON:', e);
      parsedTrajetos = [];
    }
  }

  if (!Array.isArray(parsedTrajetos)) return [];

  return parsedTrajetos
    .map(item =>
      parseTrajetoItem(
        item,
        origem.data,
        origem.data_para_busca,
        origem.horas,
        destino.data,
        destino.data_para_busca,
        destino.horas,
      ),
    )
    .filter(Boolean);
}

function buildNodes(data) {
  const paisBusca = data.pais_origem || data.pais_destino || 'Brasil';

  const origemDates = normalizeDateFields(
    data.dia_mes_ano_ida_viagem,
    data.dia_mes_ano_ida_viagem_para_busca,
  );

  const diaDestinoDisplay = data.dia_mes_ano_ida_destino || data.dia_mes_ano_destino;
  const diaDestinoSearch = data.dia_mes_ano_ida_destino_para_busca || data.dia_mes_ano_destino_para_busca;
  const horasDestino = data.horas_ida_destino || data.horas_destino;

  const destinoDates = normalizeDateFields(
    diaDestinoDisplay,
    diaDestinoSearch,
  );

  const origem = {
    cidade: data.cidade_origem_main,
    local_cidade: data.cidade_origem,
    data: origemDates.data,
    data_para_busca: origemDates.data_para_busca,
    horas: data.horas_ida_viagem,
    pais: paisBusca,
    tipo: 'origem',
  };

  const destino = {
    cidade: data.cidade_destino_main,
    local_cidade: data.cidade_destino,
    data: destinoDates.data,
    data_para_busca: destinoDates.data_para_busca,
    horas: horasDestino,
    pais: paisBusca,
    tipo: 'destino',
  };

  const trajetos = normalizeTrajetos(data.cidades_trajeto, origem, destino).map(
    item => ({
      ...item,
      pais: paisBusca,
      tipo: 'trajeto',
    }),
  );

  return [origem, ...trajetos, destino];
}

async function geocodeCidade(cidade, pais = 'Brasil') {
  if (!cidade) return null;

  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Chave GOOGLE_API_KEY não configurada no Config.');
  }

  const buscarCoordenadas = async (query) => {
    const address = encodeURIComponent(query);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const result = await response.json();

    if (result.status === 'OK' && result.results?.[0]) {
      const location = result.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
        formatted_address: result.results[0].formatted_address,
      };
    }
    
    return null;
  };

  try {
    let coords = await buscarCoordenadas(`${cidade}, ${pais}`);
    if (!coords) {
      coords = await buscarCoordenadas(cidade);
    }
    return coords;
  } catch (err) {
    console.error(`Erro Geocode [${cidade}]:`, err);
    return null;
  }
}

async function calcularDistanciaKm(origem, destino) {
  if (!origem?.lat || !origem?.lng || !destino?.lat || !destino?.lng) {
    return '0 KM';
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origem.lat},${origem.lng}&destinations=${destino.lat},${destino.lng}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const result = await response.json();

    const element = result?.rows?.[0]?.elements?.[0];
    if (result.status === 'OK' && element?.status === 'OK') {
      const distanceMeters = element.distance.value;
      const km = Math.round(distanceMeters / 1000);
      return `${km} KM`;
    }

    return '0 KM';
  } catch (err) {
    console.error('Erro Distance Matrix:', err);
    return '0 KM';
  }
}

async function montarViagens(data) {
  const nodes = buildNodes(data);
  const paisBusca = data.pais_origem || data.pais_destino || 'Brasil';

  const cidadesUnicas = [...new Set(nodes.map(node => node.cidade))];
  const coordenadasPorCidade = {};

  for (const cidade of cidadesUnicas) {
    const coords = await geocodeCidade(cidade, paisBusca);
    if (coords) {
      coordenadasPorCidade[cidade] = coords;
    } else {
      throw new Error(`Não foi possível obter as coordenadas da cidade "${cidade}". Verifique a API Key do Google.`);
    }
  }

  const nodesComCoordenadas = nodes.map(node => ({
    ...node,
    lat: coordenadasPorCidade[node.cidade]?.lat ?? null,
    lng: coordenadasPorCidade[node.cidade]?.lng ?? null,
    formatted_address: coordenadasPorCidade[node.cidade]?.formatted_address || '',
  }));

  const metaTipoEncomenda = getTipoEncomendaMeta(data.select_espaco_mala || '');
  const viagens = [];

  for (let i = 0; i < nodesComCoordenadas.length - 1; i++) {
    for (let j = i + 1; j < nodesComCoordenadas.length; j++) {
      const de = nodesComCoordenadas[i];
      const para = nodesComCoordenadas[j];
      const distanciaViagem = await calcularDistanciaKm(de, para);

      const dataPartidaBusca =
        de.tipo === 'trajeto' ? de.data_partida_para_busca : de.data_para_busca;

      const dataChegadaBusca =
        para.tipo === 'trajeto'
          ? para.data_chegada_para_busca
          : para.data_para_busca;

      const duracaoViagem = calcularDuracaoViagem(
        dataPartidaBusca,
        dataChegadaBusca,
      );

      viagens.push({
        ...(data?.editar_trajeto === 'sim' && { id: data.id }),
        pais_origem: data.pais_origem || 'Brasil',
        cidade_de_onde_vai_sair: de.cidade,
        de: de?.local_cidade ?? de?.cidade ?? '',
        rota_selecionada: data.rota_selecionada || null,

        lat_cidade_origem: de.lat ?? null,
        lng_cidade_origem: de.lng ?? null,

        local_que_vai_receber_encomenda:
          data.local_que_vai_receber_encomenda || null,

        pais_destino: data.pais_destino || 'Brasil',
        cidade_para_onde_vai: para.cidade,
        para: para?.local_cidade ?? para?.cidade ?? '',

        lat_cidade_destino: para.lat ?? null,
        lng_cidade_destino: para.lng ?? null,

        local_que_vai_deixar_encomenda:
          data.local_que_vai_deixar_encomenda || null,

        tipo_encomenda: data.select_espaco_mala || null,
        tipo_encomenda_nr: Number(metaTipoEncomenda.tipo_encomenda_nr) || null,
        quantidade_maxima_carga:
          Number(metaTipoEncomenda.quantidade_maxima_carga) || null,

        meio_transporte: data.qual_meio_transporte || null,

        data_partida: de.tipo === 'trajeto' ? de.data_partida : de.data,
        data_partida_para_busca:
          de.tipo === 'trajeto'
            ? de.data_partida_para_busca
            : de.data_para_busca,
        data_chegada: para.tipo === 'trajeto' ? para.data_chegada : para.data,
        data_chegada_para_busca:
          para.tipo === 'trajeto'
            ? para.data_chegada_para_busca
            : para.data_para_busca,

        horas_partida: de.tipo === 'trajeto' ? de.horas_partida : de.horas,
        horas_chegada:
          para.tipo === 'trajeto' ? para.horas_chegada : para.horas,

        informacao_sobre_trajeto: data.informacao_a_viagem || null,

        distancia_viagem: distanciaViagem,
        duracao_viagem: duracaoViagem,

        viagem_disponibilizada_cancelada: false,
        status: true,
        viagem_principal: i === 0 && j === nodesComCoordenadas.length - 1,
      });
    }
  }

  return viagens;
}

export default function UseFinalizarCadastramentoMala() {
  const { authFetch } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const finalizarCadastramento = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getStoredData();
      if (!data) {
        throw new Error('Nenhum dado encontrado no storage.');
      }

      console.log('Payload carregado do storage:', JSON.stringify(data, null, 2));

      const viagens = await montarViagens(data);

      console.log('Viagens geradas para envio:', JSON.stringify(viagens, null, 2));

      const endpoint =
        data?.editar_trajeto === 'sim'
          ? `${API_URL}/api/viagens/atualizar/`
          : `${API_URL}/api/viagens/finalizar/`;

      const response = await authFetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ viagens }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.detail || 'Erro ao salvar viagens no servidor.');
      }

      return result;
    } catch (err) {
      console.error('Erro na gravação final:', err);
      setError(err.message || 'Erro inesperado.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    finalizarCadastramento,
    loading,
    setLoading,
    error,
  };
}