import { useEffect, useMemo, useState } from "react";
import Config from "react-native-config";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = Config.URL_MAIN;
const SEARCH_STORAGE_KEY = "travel_search";
const NEARBY_RADIUS_KM = 50;

function calcularDistanciaHaversine(lat1, lon1, lat2, lon2) {
  if (
    lat1 === null ||
    lon1 === null ||
    lat2 === null ||
    lon2 === null ||
    !Number.isFinite(lat1) ||
    !Number.isFinite(lon1) ||
    !Number.isFinite(lat2) ||
    !Number.isFinite(lon2)
  ) {
    return Number.POSITIVE_INFINITY;
  }

  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function extractCityName(value) {
  return String(value ?? "")
    .split(",")[0]
    .trim()
    .toLowerCase();
}

function normalizeText(value) {
  if (!value) return "";
  return String(value)
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function parsePriceToNumber(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return Number.POSITIVE_INFINITY;
  }

  if (typeof valor === "number") {
    return Number.isFinite(valor) ? valor : Number.POSITIVE_INFINITY;
  }

  const cleaned = String(valor)
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
}

function formatPrice(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "Preço indisponível";
  }

  try {
    return `R$ ${number.toFixed(2).replace(".", ",")}`;
  } catch (err) {
    return `R$ ${number.toFixed(2)}`;
  }
}

function parseDurationToMinutes(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return Number.POSITIVE_INFINITY;
  }

  if (typeof valor === "number") {
    return Number.isFinite(valor) ? valor : Number.POSITIVE_INFINITY;
  }

  const text = normalizeText(valor);

  const hhmm = text.match(/^(\d+):(\d{2})$/);
  if (hhmm) {
    return Number(hhmm[1]) * 60 + Number(hhmm[2]);
  }

  let total = 0;
  let found = false;

  const daysMatch = text.match(/(\d+)\s*(d|dia|dias)\b/);
  if (daysMatch) {
    total += Number(daysMatch[1]) * 24 * 60;
    found = true;
  }

  const hoursMatch = text.match(/(\d+)\s*(h|hora|horas)\b/);
  if (hoursMatch) {
    total += Number(hoursMatch[1]) * 60;
    found = true;
  }

  const minutesMatch = text.match(/(\d+)\s*(m|min|minuto|minutos)\b/);
  if (minutesMatch) {
    total += Number(minutesMatch[1]);
    found = true;
  }

  if (found) return total;

  const numericOnly = Number(text.replace(/[^\d]/g, ""));
  if (Number.isFinite(numericOnly) && numericOnly > 0) {
    return numericOnly;
  }

  return Number.POSITIVE_INFINITY;
}

function getReferencePoint(searchData, byDestination = false) {
  const lat = Number(
    byDestination ? searchData.destino_lat : searchData.origem_lat
  );
  const lng = Number(
    byDestination ? searchData.destino_lng : searchData.origem_lng
  );
  const city = extractCityName(
    byDestination ? searchData.destino : searchData.origem
  );

  return {
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
    city,
  };
}

function isExactRouteMatch(trip, searchData) {
  const origemBusca = extractCityName(searchData.origem);
  const destinoBusca = extractCityName(searchData.destino);

  const origemTrip = extractCityName(trip.cidade_de_onde_vai_sair);
  const destinoTrip = extractCityName(trip.cidade_para_onde_vai);

  return origemTrip === origemBusca && destinoTrip === destinoBusca;
}

function calcularDistanciaReferencia(trips, searchData, byDestination) {
  const ref = getReferencePoint(searchData, byDestination);

  return trips.map((trip) => {
    const lat = Number(
      byDestination ? trip.lat_cidade_destino : trip.lat_cidade_origem
    );
    const lng = Number(
      byDestination ? trip.lng_cidade_destino : trip.lng_cidade_origem
    );

    const km = calcularDistanciaHaversine(ref.lat, ref.lng, lat, lng);

    return {
      ...trip,
      distancia_ref_km: Number.isFinite(km) ? km : Number.POSITIVE_INFINITY,
    };
  });
}

function enriquecerViagens(trips) {
  return trips.map((trip) => {
    const origemLat = Number(trip.lat_cidade_origem);
    const origemLng = Number(trip.lng_cidade_origem);
    const destinoLat = Number(trip.lat_cidade_destino);
    const destinoLng = Number(trip.lng_cidade_destino);

    const distanciaKm = calcularDistanciaHaversine(
      origemLat,
      origemLng,
      destinoLat,
      destinoLng
    );

    const precoNumerico = parsePriceToNumber(trip.preco_estimado);

    return {
      ...trip,
      distancia_google_km: Number.isFinite(distanciaKm) ? distanciaKm : null,
      preco_estimado_num: Number.isFinite(precoNumerico)
        ? precoNumerico
        : null,
      preco_estimado_formatado: Number.isFinite(precoNumerico)
        ? formatPrice(precoNumerico)
        : "Preço indisponível",
    };
  });
}

function sortTripsByRecommendedMode(trips, mode) {
  if (mode === "cheapest") {
    return [...trips]
      .map((trip, index) => ({
        trip,
        index,
        price: parsePriceToNumber(
          trip.preco_estimado_num ?? trip.preco_estimado
        ),
      }))
      .sort((a, b) => {
        if (a.price !== b.price) return a.price - b.price;
        return a.index - b.index;
      })
      .map((item) => item.trip);
  }

  return [...trips]
    .map((trip, index) => ({
      trip,
      index,
      duration: parseDurationToMinutes(trip.duracao_viagem),
      distance:
        typeof trip.distancia_google_km === "number"
          ? trip.distancia_google_km
          : Number.POSITIVE_INFINITY,
      price: parsePriceToNumber(
        trip.preco_estimado_num ?? trip.preco_estimado
      ),
    }))
    .sort((a, b) => {
      if (a.duration !== b.duration) return a.duration - b.duration;
      if (a.distance !== b.distance) return a.distance - b.distance;
      if (a.price !== b.price) return a.price - b.price;
      return a.index - b.index;
    })
    .map((item) => item.trip);
}

function sortTripsBySearchReference(
  trips,
  searchData,
  byDestination = false
) {
  const ref = getReferencePoint(searchData, byDestination);

  const field = byDestination
    ? "cidade_para_onde_vai"
    : "cidade_de_onde_vai_sair";

  const enriched = calcularDistanciaReferencia(
    trips,
    searchData,
    byDestination
  );

  return enriched
    .map((trip, index) => {
      const origemBusca = extractCityName(searchData.origem);
      const destinoBusca = extractCityName(searchData.destino);

      const origemTrip = extractCityName(trip.cidade_de_onde_vai_sair);
      const destinoTrip = extractCityName(trip.cidade_para_onde_vai);

      const sameOrigin = origemTrip === origemBusca;
      const sameDestination = destinoTrip === destinoBusca;

      const tripCity = extractCityName(trip[field]);
      const exactCityMatch = ref.city && tripCity === ref.city ? 0 : 1;
      const nearby = trip.distancia_ref_km <= NEARBY_RADIUS_KM;

      let locationPriority = 3;

      if (!byDestination) {
        if (sameOrigin && !sameDestination) {
          locationPriority = 0;
        } else if (exactCityMatch === 0 || nearby) {
          locationPriority = 1;
        } else if (!sameOrigin && sameDestination) {
          locationPriority = 2;
        }
      } else {
        if (sameDestination && !sameOrigin) {
          locationPriority = 0;
        } else if (exactCityMatch === 0 || nearby) {
          locationPriority = 1;
        } else if (sameOrigin && !sameDestination) {
          locationPriority = 2;
        }
      }

      return {
        trip,
        index,
        locationPriority,
        distance: trip.distancia_ref_km,
        price: parsePriceToNumber(
          trip.preco_estimado_num ?? trip.preco_estimado
        ),
      };
    })
    .sort((a, b) => {
      if (a.locationPriority !== b.locationPriority) {
        return a.locationPriority - b.locationPriority;
      }

      if (a.distance !== b.distance) {
        return a.distance - b.distance;
      }

      if (a.price !== b.price) {
        return a.price - b.price;
      }

      return a.index - b.index;
    })
    .map((item) => item.trip);
}

export default function useBuscaViagens() {
  const route = useRoute();
  const [asyncSearchData, setAsyncSearchData] = useState(null);
  const [isParamsLoaded, setIsParamsLoaded] = useState(false);

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [recommendedSort, setRecommendedSort] = useState("fastest");
  const [cityMode, setCityMode] = useState(false);

  // 1. Carregamento dos parâmetros de busca
  useEffect(() => {
    let isMounted = true;

    const loadSearchParams = async () => {
      const params = route.params || {};

      if (params.origem && params.destino && params.encomenda && params.seguro) {
        if (isMounted) {
          setAsyncSearchData(params);
          setIsParamsLoaded(true);
        }
        await AsyncStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(params)).catch(() => {});
        return;
      }

      try {
        const saved = await AsyncStorage.getItem(SEARCH_STORAGE_KEY);
        if (saved && isMounted) {
          setAsyncSearchData(JSON.parse(saved));
          setIsParamsLoaded(true);
          return;
        }
      } catch (e) {
        console.error("Erro ao ler AsyncStorage:", e);
      }

      if (isMounted) {
        setAsyncSearchData({
          origem: "",
          destino: "",
          encomenda: "",
          seguro: "",
          origem_lat: "",
          origem_lng: "",
          destino_lat: "",
          destino_lng: "",
        });
        setIsParamsLoaded(true);
      }
    };

    loadSearchParams();

    return () => {
      isMounted = false;
    };
  }, [route.params]);

  const searchData = useMemo(() => {
    return (
      asyncSearchData || {
        origem: "",
        destino: "",
        encomenda: "",
        seguro: "",
        origem_lat: "",
        origem_lng: "",
        destino_lat: "",
        destino_lng: "",
      }
    );
  }, [asyncSearchData]);

  // 2. Requisição à API com Logs de Comparação
  useEffect(() => {
    let active = true;

    const buscar = async () => {
      if (!isParamsLoaded) return;

      const { origem, destino, encomenda, seguro } = searchData;

      console.log("=== [REACT NATIVE] SEARCH DATA RECEBIDO ===", searchData);

      if (!origem || !destino || !encomenda || !seguro) {
        console.warn("=== [REACT NATIVE] Parâmetros de busca incompletos! ===");
        if (active) setTrips([]);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // Substitua o trecho de montagem do queryParams por este:
        const queryParams = new URLSearchParams({
          origem: searchData.origem || "",
          destino: searchData.destino || "",
          encomenda: searchData.encomenda || "",
          seguro: searchData.seguro || "",
          ...(searchData.origem_lat !== undefined && searchData.origem_lat !== null && searchData.origem_lat !== "" && { 
            origem_lat: String(searchData.origem_lat) 
          }),
          ...(searchData.origem_lng !== undefined && searchData.origem_lng !== null && searchData.origem_lng !== "" && { 
            origem_lng: String(searchData.origem_lng) 
          }),
          ...(searchData.destino_lat !== undefined && searchData.destino_lat !== null && searchData.destino_lat !== "" && { 
            destino_lat: String(searchData.destino_lat) 
          }),
          ...(searchData.destino_lng !== undefined && searchData.destino_lng !== null && searchData.destino_lng !== "" && { 
            destino_lng: String(searchData.destino_lng) 
          }),
        }).toString();

        const endpoint = `${API_URL}/api/viagens/buscar/?${queryParams}`;

        console.log("TESTANDO O ENVIO DOS DADOS", endpoint);

        const response = await fetch(endpoint, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json().catch(() => ({}));
        console.log("=== [REACT NATIVE] RESPOSTA DO BACKEND (RAW) ===", data);

        if (!response.ok) {
          throw new Error(data?.detail || "Erro ao buscar viagens.");
        }

        const result = Array.isArray(data.resultados) ? data.resultados : [];
        const enriched = enriquecerViagens(result);

        console.log("=== [REACT NATIVE] VIAGENS ENRIQUECIDAS ===", enriched);

        if (active) setTrips(enriched);
      } catch (err) {
        console.error("=== [REACT NATIVE] ERRO NA BUSCA ===", err);
        if (active) {
          setTrips([]);
          setError(err.message || "Erro inesperado.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    buscar();

    return () => {
      active = false;
    };
  }, [searchData, isParamsLoaded]);

  // Função para atualizar os dados de busca no estado local e no AsyncStorage
  const setSearchData = async (newData) => {
    try {
      const updatedData = typeof newData === "function" ? newData(searchData) : newData;
      setAsyncSearchData(updatedData);
      await AsyncStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(updatedData));
    } catch (e) {
      console.error("Erro ao salvar dados de busca no AsyncStorage:", e);
    }
  };

  // 3. Processamento dos resultados
  const recommendedTrips = useMemo(() => {
    if (!isParamsLoaded || trips.length === 0) return [];
    const base = trips.filter((trip) => isExactRouteMatch(trip, searchData));
    return sortTripsByRecommendedMode(base, recommendedSort);
  }, [trips, recommendedSort, searchData, isParamsLoaded]);

  const otherTrips = useMemo(() => {
    if (!isParamsLoaded || trips.length === 0) return [];
    const base = trips.filter((trip) => !isExactRouteMatch(trip, searchData));
    return sortTripsBySearchReference(base, searchData, cityMode);
  }, [trips, cityMode, searchData, isParamsLoaded]);

  return {
    searchData,
    setSearchData,
    trips,
    recommendedTrips,
    otherTrips,
    loading,
    error,
    recommendedSort,
    setRecommendedSort,
    cityMode,
    setCityMode,
  };
}