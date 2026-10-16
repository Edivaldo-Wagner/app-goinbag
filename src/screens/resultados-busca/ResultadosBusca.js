import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  TouchableOpacity,
  TextInput,
  Modal,
  Switch,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from "../../components/header/Header";
import Search from "../../components/search/Search";
import ResultadosBuscaSessionStore from "../resultados-busca/ResultadosBuscaSessionStore";
import SidebarLandingPage from "../../components/sidebarDashboard/SidebarLandingPage";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { useAuth } from "../../context/AuthContext";
import useBuscaViagens from "../../hooks/UseBuscaViagens/UseBuscaViagens";
import useCreateTripNegotiations from "../../hooks/UseTripsNegotiations/UseCreateTripNegotiations";

import styles from "../painel-controle-cliente/PainelCliente.styles";

// Formatação segura de milhares sem depender de suporte ao Intl no Android
function formatMilhar(numero) {
  if (numero === null || numero === undefined || numero === "") return "0";
  const n = String(numero).replace(/\D/g, "");
  return n.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatPrice(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return { inteiro: "0", centavos: "00" };

  const [inteiro, centavos] = number.toFixed(2).split(".");
  return {
    inteiro: formatMilhar(inteiro),
    centavos: centavos || "00",
  };
}

function getTransportIcon(meio) {
  const m = String(meio || "").toLowerCase();
  if (m.includes("aviao") || m.includes("flight")) {
    return { name: "flight", label: "Avião" };
  }
  if (m.includes("autocarro") || m.includes("bus")) {
    return { name: "directions-bus", label: "Autocarro" };
  }
  if (m.includes("moto")) {
    return { name: "two-wheeler", label: "Moto" };
  }
  return { name: "directions-car", label: meio || "Carro" };
}

function renderCard(item, onBuyTrip, loadingId, searchData, index) {
  const rawPrice =
    item.preco_estimado_num ?? String(item.preco_estimado || 0).replace(",", ".");
  const price = formatPrice(rawPrice);

  // Garantia de chave única combinando ID/Série com o índice
  const cardId = item.id || item.serie_viagem || `trip-${index}`;
  const keyCard = `card-${cardId}-${index}`;

  const isBuying = loadingId === cardId;
  const transporte = getTransportIcon(item.meio_transporte);

  return (
    <View style={[styles.cardContainer, { width: "100%" }]} key={keyCard}>
      {/* TOPO: PERFIL + ORIGEM/DESTINO */}
      <View style={styles.headerProfile}>
        {item.imagem_usuario ? (
          <Image
            source={{ uri: item.imagem_usuario }}
            style={styles.avatarImage}
          />
        ) : (
          <View style={[styles.avatarImage, styles.avatarPlaceholder]}>
            <MaterialIcons name="person" size={36} color="#999" />
          </View>
        )}

        <View style={styles.profileDetails}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.nome_usuario || "Sem nome"}
          </Text>
          <View style={styles.routeContainer}>
            <Text style={styles.routeCity} numberOfLines={1}>
              {item.cidade_de_onde_vai_sair || "-"}
            </Text>

            <View style={styles.arrowCircle}>
              <MaterialIcons
                name="arrow-outward"
                size={14}
                color="#00AEEF"
                style={{ transform: [{ rotate: "90deg" }] }}
              />
            </View>

            <Text style={styles.routeCity} numberOfLines={1}>
              {item.cidade_para_onde_vai || "-"}
            </Text>
          </View>
        </View>
      </View>

      {/* CHIPS DE INFORMAÇÃO */}
      <View style={styles.chipsContainer}>
        <View style={styles.chip}>
          <MaterialIcons
            name={transporte.name}
            size={15}
            color="#FFF"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.chipText}>{transporte.label}</Text>
        </View>

        {!!item.duracao_viagem && (
          <View style={styles.chip}>
            <MaterialIcons
              name="event"
              size={15}
              color="#FFF"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.chipText}>{item.duracao_viagem}</Text>
          </View>
        )}
      </View>

      {/* DATAS SAÍDA E CHEGADA */}
      <View style={styles.datesContainer}>
        <View style={styles.dateBlock}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>SAÍDA</Text>
          </View>
          <View style={styles.dateTimeRow}>
            <MaterialIcons name="event" size={16} color="#0072FF" />
            <Text style={styles.dateTimeText}>
              {item.data_partida_para_busca || "-"} às {item.horas_partida || "-"}
            </Text>
          </View>
        </View>

        <View style={styles.dateBlockRight}>
          <View style={{ alignItems: "flex-start" }}>
            <View style={styles.dateBadge}>
              <Text style={styles.dateBadgeText}>CHEGADA</Text>
            </View>
            <View style={styles.dateTimeRow}>
              <MaterialIcons name="event" size={16} color="#0072FF" />
              <Text style={styles.dateTimeText}>
                {item.data_chegada_para_busca || "-"} às {item.horas_chegada || "-"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* DESCRIÇÃO */}
      <View style={styles.descriptionBox}>
        <Text style={styles.descriptionText}>
          {item.informacao_sobre_trajeto || "Sem descrição informada."}
        </Text>
      </View>

      {/* CARD DE PREÇO E AÇÃO */}
      <View style={localStyles.encomendaCardWrapper}>
        <View style={localStyles.encomendaBanner}>
          <Text style={localStyles.encomendaBannerText}>
            {searchData?.encomenda || item.tipo_encomenda || "Pequeno, estilo envelope"}
          </Text>
        </View>

        <View style={localStyles.priceActionRow}>
          <View style={localStyles.priceDisplay}>
            <Text style={localStyles.currencySymbol}>R$ </Text>
            <Text style={localStyles.priceInteger}>{price.inteiro}</Text>
            <Text style={localStyles.priceCents}>,{price.centavos}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              localStyles.buyButton,
              {
                backgroundColor: pressed ? '#005ecc' : '#0075FF',               
              },
            ]}
            onPress={() => onBuyTrip(item)}
            disabled={isBuying}
          >
            <Text style={localStyles.buyButtonText}>
              {isBuying ? "Processando..." : "Comprar"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function ResultadosBusca({ navigation }) {
  const lastModalSearchKeyRef = useRef(null);

  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showNoTravelerModal, setShowNoTravelerModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const [notificationChoice, setNotificationChoice] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  const { user } = useAuth();

  const {
    searchData,
    setSearchData,
    recommendedTrips,
    otherTrips,
    loading,
    error,
    recommendedSort,
    setRecommendedSort,
    cityMode,
    setCityMode,
    refetch,
  } = useBuscaViagens();

  const { buyTrip, loadingId } = useCreateTripNegotiations();

  const hasRecommended = recommendedTrips && recommendedTrips.length > 0;
  const hasOther = otherTrips && otherTrips.length > 0;

  const searchKey = JSON.stringify({
    origem: searchData?.origem || "",
    destino: searchData?.destino || "",
    data: searchData?.data || "",
    encomenda: searchData?.encomenda || "",
    seguro: searchData?.seguro || "",
  });

  const handleNovabusca = (payloadBusca) => {
    setSearchData(payloadBusca);
    setIsSearchModalVisible(false);
  };

  const handleOpenSearchModal = () => {
    setIsSearchModalVisible(true);
  };

  useEffect(() => {
    setShowNoTravelerModal(false);
    setShowNotificationModal(false);
    setShowSuccessModal(false);
    setNotificationChoice("");
  }, [searchKey]);

  useEffect(() => {
    if (loading || error) return;

    const shouldShowModal =
      recommendedTrips?.length === 0 && otherTrips?.length > 0;

    if (!shouldShowModal) return;
    if (lastModalSearchKeyRef.current === searchKey) return;

    lastModalSearchKeyRef.current = searchKey;

    const timer = setTimeout(() => {
      setShowNoTravelerModal(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [loading, error, recommendedTrips, otherTrips, searchKey]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#11b9a3" />
        <Text style={{ marginTop: 10 }}>Buscando viagens...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );
  }

  return (
    <>
      <SafeAreaView style={{flex: 1, backgroundColor: '#0a768f'}} edges={['top', 'left', 'right']}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#0a768f" 
        translucent={false} 
      />
      <SidebarLandingPage backgroundColor="#fff" />
      <ScrollView
        style={localStyles.mainContainer}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {/* SUMÁRIO DA BUSCA */}
        <TouchableOpacity onPress={handleOpenSearchModal} style={localStyles.searchSummary}>
          <View style={localStyles.summaryRoute}>
            <Text style={localStyles.summaryRouteText}>
              {searchData?.origem ? searchData.origem.split(",")[0] : "Origem"}
            </Text>
            <View style={localStyles.routeArrowBadge}>
              <MaterialIcons name="arrow-forward" size={14} color="#00AEEF" />
            </View>
            <Text style={localStyles.summaryRouteText}>
              {searchData?.destino ? searchData.destino.split(",")[0] : "Destino"}
            </Text>
          </View>

          <View style={localStyles.summaryInfo}>
            {!!searchData?.encomenda && (
              <View style={localStyles.summaryPill}>
                <Text style={localStyles.summaryPillText}>
                  📦  {searchData.encomenda}
                </Text>
              </View>
            )}
            {!!searchData?.seguro && (
              <View style={localStyles.summaryPill}>
                <MaterialIcons
                  name="security"
                  size={15}
                  color="#102A43"
                  style={{ marginRight: 4 }}
                />
                <Text style={localStyles.summaryPillText}>{searchData.seguro}</Text>
              </View>
            )}
          </View>

          <View style={localStyles.summaryEditBtn}>
            <Text style={localStyles.summaryEditText}>✏️ Alterar pesquisa</Text>
          </View>
        </TouchableOpacity>

        <View style={localStyles.searchPage}>
          {hasRecommended && (
            <View style={localStyles.searchTop}>
              <View style={localStyles.topFilters}>
                <Text style={localStyles.recommendedTitle}>
                  Recomendado
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={
                      recommendedSort === "fastest"
                        ? localStyles.filterActive
                        : localStyles.filterInactive
                    }
                  >
                    Mais rápido
                  </Text>

                  <Switch
                    value={recommendedSort === "cheapest"}
                    onValueChange={(value) =>
                      setRecommendedSort(value ? "cheapest" : "fastest")
                    }
                    trackColor={{ false: "#cbd5e1", true: "#cbd5e1" }}
                    thumbColor="#fff"
                    style={{
                      marginHorizontal: 6,
                      transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
                    }}
                  />

                  <Text
                    style={
                      recommendedSort === "cheapest"
                        ? localStyles.filterActive
                        : localStyles.filterInactive
                    }
                  >
                    Menos preço
                  </Text>
                </View>
              </View>

              <View style={localStyles.dividerLineDashed} />
            </View>
          )}

          {hasRecommended && (
            <View style={localStyles.cardsList}>
              {recommendedTrips.map((item, index) =>
                renderCard(item, buyTrip, loadingId, searchData, index)
              )}
            </View>
          )}

          {hasOther && (
            <View style={localStyles.searchFooter}>
              <View style={localStyles.topFilters}>
                <Text style={localStyles.titleOtherTravels}>
                  Outras viagens
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={
                      !cityMode
                        ? localStyles.filterActive
                        : localStyles.filterInactive
                    }
                  >
                    Origem
                  </Text>

                  <Switch
                    value={cityMode}
                    onValueChange={(value) => setCityMode(value)}
                    trackColor={{ false: "#cbd5e1", true: "#cbd5e1" }}
                    thumbColor="#fff"
                    style={{
                      marginHorizontal: 6,
                      transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
                    }}
                  />

                  <Text
                    style={
                      cityMode
                        ? localStyles.filterActive
                        : localStyles.filterInactive
                    }
                  >
                    Destino
                  </Text>
                </View>
              </View>

              <View style={localStyles.dividerLineDashed} />
            </View>
          )}

          {hasOther && (
            <View style={localStyles.cardsList}>
              {otherTrips.map((item, index) =>
                renderCard(item, buyTrip, loadingId, searchData, index)
              )}
            </View>
          )}

          {!loading && !error && !hasRecommended && !hasOther && (
            <Text style={localStyles.emptyText}>
              Nenhuma viagem encontrada 😕
            </Text>
          )}
        </View>

        {/* MODAL: SEM VIAJANTES */}
        <Modal visible={showNoTravelerModal} transparent animationType="fade">
          <View style={localStyles.modalOverlay}>
            <View style={localStyles.customModal}>
              <Text style={localStyles.modalHeaderTitle}>
                Sem viajantes no seu itinerário
              </Text>
              <Text style={localStyles.modalDescription}>
                Lamentamos, mas no momento não temos viajantes no seu itinerário.
              </Text>

              <View style={localStyles.radioGroup}>
                <TouchableOpacity
                  style={localStyles.radioCard}
                  onPress={() => {
                    setNotificationChoice("sim");
                    setShowNoTravelerModal(false);
                    if (!user) {
                      setShowNotificationModal(true);
                    } else {
                      setShowSuccessModal(true);
                      setTimeout(() => setShowSuccessModal(false), 3000);
                    }
                  }}
                >
                  <Text style={localStyles.radioText}>
                    {notificationChoice === "sim" ? "◉ " : "◯ "}Sim, quero ser notificado
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={localStyles.radioCard}
                  onPress={() => {
                    setNotificationChoice("nao");
                    setShowNoTravelerModal(false);
                  }}
                >
                  <Text style={localStyles.radioText}>
                    {notificationChoice === "nao" ? "◉ " : "◯ "}Não, obrigado
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL: NOTIFICAÇÃO DE CONTATO */}
        <Modal visible={showNotificationModal} transparent animationType="fade">
          <View style={localStyles.modalOverlay}>
            <View style={localStyles.customModal}>
              <Text style={localStyles.modalHeaderTitle}>
                Contato para Receber Notificações
              </Text>

              <View style={localStyles.formGroup}>
                <Text style={localStyles.inputLabel}>Email</Text>
                <TextInput
                  style={localStyles.inputField}
                  placeholder="Digite seu email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={localStyles.formGroup}>
                <Text style={localStyles.inputLabel}>Telefone</Text>
                <TextInput
                  style={localStyles.inputField}
                  placeholder="Digite seu telefone"
                  value={telefone}
                  onChangeText={setTelefone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={localStyles.modalActions}>
                <TouchableOpacity
                  style={localStyles.btnSecondary}
                  onPress={() => setShowNotificationModal(false)}
                >
                  <Text style={localStyles.btnSecondaryText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={localStyles.btnPrimary}
                  onPress={() => {
                    if (!email || !telefone) return;
                    setShowNotificationModal(false);
                    setShowSuccessModal(true);
                    setTimeout(() => setShowSuccessModal(false), 3000);
                  }}
                >
                  <Text style={localStyles.btnPrimaryText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL: SUCESSO */}
        <Modal visible={showSuccessModal} transparent animationType="fade">
          <View style={localStyles.modalOverlay}>
            <View style={[localStyles.customModal, localStyles.successModalContent]}>
              <View style={localStyles.successIconBadge}>
                <Text style={localStyles.successIconText}>✓</Text>
              </View>
              <Text style={localStyles.successTitle}>Sucesso!</Text>
              <Text style={localStyles.successDescription}>
                Vamos te avisar assim que surgir um viajante compatível com o seu itinerário.
              </Text>
              <TouchableOpacity
                style={localStyles.btnSuccessClose}
                onPress={() => setShowSuccessModal(false)}
              >
                <Text style={localStyles.btnSuccessCloseText}>Entendi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>

      {/* MODAL PRINCIPAL: FORMULÁRIO DE PESQUISA (POSICIONADO FORA DO SCROLLVIEW) */}
      <Modal
        visible={isSearchModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsSearchModalVisible(false)}
      >
        <View style={localStyles.searchModalOverlay}>
          <TouchableOpacity
            style={localStyles.searchModalBackdrop}
            activeOpacity={1}
            onPress={() => setIsSearchModalVisible(false)}
          />

          <View style={{ width: '100%' }}>
            <Search
              saindoDe={searchData?.origem || ResultadosBuscaSessionStore.getOrigem() || ""}
              indoPara={searchData?.destino || ResultadosBuscaSessionStore.getDestino() || ""}
              tipoEncomenda={searchData?.encomenda || ResultadosBuscaSessionStore.getCarga() || ""}
              valorSeguro={searchData?.seguro || ResultadosBuscaSessionStore.getSeguro() || ""}
              colorTextSaindoDe={(searchData?.origem || ResultadosBuscaSessionStore.getOrigem()) ? "#1E293B" : "#6e6e6e"}
              colorTextIndoPara={(searchData?.destino || ResultadosBuscaSessionStore.getDestino()) ? "#1E293B" : "#6e6e6e"}
              colorTextTipoEncomenda={(searchData?.encomenda || ResultadosBuscaSessionStore.getCarga()) ? "#1E293B" : "#6e6e6e"}
              colorTextValorSeguro={(searchData?.seguro || ResultadosBuscaSessionStore.getSeguro()) ? "#1E293B" : "#6e6e6e"}
              onSearch={(data) => {
                setIsSearchModalVisible(false);
                handleNovabusca(data);
              }}
            />
          </View>
        </View>
      </Modal>

      <Header />
      </SafeAreaView>
    </>
  );
}

const localStyles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#f0eded" },
  searchSummary: {
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 2,
    marginBottom: 8,
    marginTop: -20,
    backgroundColor: "#fff",
  },
  summaryRoute: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  summaryRouteText: { fontSize: 20, fontFamily: 'Montserrat-Bold', fontWeight: "800", color: "#0f172a" },
  routeArrowBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#E0F7FC",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  summaryInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  summaryPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  summaryPillText: { fontSize: 14, fontFamily: 'Montserrat-Bold', fontWeight: "700", color: "#1E293B" },
  summaryEditBtn: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  summaryEditText: { color: "#18b7c6", fontSize: 13, fontFamily: 'Montserrat-Bold', fontWeight: "600" },
  searchPage: { padding: 16 },
  encomendaCardWrapper: {
    borderWidth: 1,
    borderColor: "#00C8DD",
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 12,
  },
  encomendaBanner: {
    backgroundColor: "#00C8DD",
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  encomendaBannerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  priceActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  priceDisplay: { flexDirection: "row", alignItems: "baseline" },
  currencySymbol: { fontSize: 15, fontWeight: "bold", color: "#0072FF" },
  priceInteger: { fontSize: 32, fontWeight: "800", color: "#0072FF", lineHeight: 36 },
  priceCents: { fontSize: 15, fontWeight: "bold", color: "#0072FF" },
  buyButton: {
    backgroundColor: "#0075FF",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  buyButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "bold" },
  searchTop: { marginBottom: 16, marginBottom: -5 },
  recommendedTitle: { fontSize: 15, fontFamily: 'Montserrat-Bold', fontWeight: "bold", color: "#0072FF" },
  dividerLineDashed: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderStyle: "dashed",
    marginVertical: 10,
  },
  topFilters: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterActive: { fontWeight: "600", color: "#334155", fontSize: 13 },
  filterInactive: { color: "#64748B", fontSize: 13 },
  searchFooter: { marginVertical: 16, marginBottom: -5 },
  titleOtherTravels: { fontSize: 15, fontFamily: 'Montserrat-Bold', fontWeight: "bold", color: "#0f172a" },
  cardsList: { marginBottom: 16 },
  emptyText: { textAlign: "center", color: "#64748b", marginVertical: 20, fontSize: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  customModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalHeaderTitle: { fontSize: 18, fontWeight: "bold", color: "#0f172a", marginBottom: 10 },
  modalDescription: { fontSize: 14, color: "#475569", marginBottom: 12, lineHeight: 20 },
  radioGroup: { marginTop: 8 },
  radioCard: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  radioText: { fontSize: 15, color: "#1e293b" },
  formGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 13, color: "#475569", marginBottom: 6, fontWeight: "500" },
  inputField: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0f172a",
  },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 10 },
  btnPrimary: {
    backgroundColor: "#0075FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  btnPrimaryText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  btnSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  btnSecondaryText: { color: "#64748b", fontSize: 14, fontWeight: "500" },
  successModalContent: { alignItems: "center", textAlign: "center" },
  successIconBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  successIconText: { fontSize: 24, color: "#16A34A", fontWeight: "bold" },
  successTitle: { fontSize: 20, fontWeight: "bold", color: "#0F172A", marginBottom: 8 },
  successDescription: { fontSize: 14, color: "#475569", textAlign: "center", marginBottom: 16 },
  btnSuccessClose: {
    backgroundColor: "#16A34A",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  btnSuccessCloseText: { color: "#fff", fontWeight: "bold" },

  /* ESTILOS DA MODAL DE PESQUISA */
  searchModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  searchModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
});