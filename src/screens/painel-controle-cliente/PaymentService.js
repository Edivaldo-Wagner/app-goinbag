import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  ActivityIndicator,
  StyleSheet,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';
import MapView, { Marker, Polyline } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {
  ArrowDownRight,
  Plane,
  Calendar,
  Luggage,
  CheckCircle2,
  CreditCard,
  QrCode,
} from 'lucide-react-native';
import Config from 'react-native-config';
import HeaderCliente from '../../components/headerCliente/HeaderCliente';
import { UsePaymentServiceTripNegotiation } from '../../hooks/UsePaymentServiceTripNegotiation/UsePaymentServiceTripNegotiation';
import { KycVerification } from '../../components/KycVerification/KycVerification';

export const PaymentService = ({ route, navigation }) => {
  const GOOGLE_MAPS_APIKEY = Config.GOOGLE_API_KEY;
  const item = route?.params?.item;
  const storedTrip = item?.trip || route?.params?.storedTrip;
  const servicePaymentId = route.params?.item?.service_payment_id;

  //console.log(storedTrip)

  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [kycVerified, setKycVerified] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [showPix, setShowPix] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);

  const [cardData, setCardData] = useState({
    number: '',
    holderName: '',
    expiry: '',
    cvv: '',
  });

  const [cardHolderDifferent, setCardHolderDifferent] = useState(false);
  const [friendCardData, setFriendCardData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
  });

  const handleSuccess = (result) => {
    setPaymentCompleted(true);
  };

  const {
    loadingPayment,
    paymentProcessing,
    paymentMessage,
    errorPayment,
    pixData,
    paymentService,
  } = UsePaymentServiceTripNegotiation(handleSuccess);

  //console.log('kk', pixData)

  const qrcode = pixData?.qrcode || pixData?.service_payment_pix_qrcode;
const copyPaste = pixData?.copyPaste || pixData?.service_payment_pix_copy_paste;

//console.log('qrcode', qrcode)
//console.log('copyPaste', copyPaste)

  const handleCardChange = (field, value) => {
    setCardData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFriendCardDataChange = (field, value) => {
    setFriendCardData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreditCardPayment = () => {
    // Separa "MM/AA" em mês e ano
    const [month, yearShort] = cardData.expiry ? cardData.expiry.split('/') : ['', ''];
    const fullYear = yearShort ? (yearShort.length === 2 ? `20${yearShort}` : yearShort) : '';

    const payload = {
      card_number: cardData.number?.replace(/\s+/g, ''), // Remove espaços do número
      holder_name: cardData.holderName,
      expiration_month: month?.trim(),
      expiration_year: fullYear?.trim(),
      security_code: cardData.cvv,
      ...(cardHolderDifferent ? { friend_card_data: friendCardData } : {}),
    };

    paymentService(item, 'credit_card', payload);
  };

  const handlePixPayment = async () => {
  // 1. Muda o estado imediatamente para renderizar a caixa do PIX
  setShowPix(true);
  
  // 2. Chama o serviço de pagamento (verifique se o primeiro parâmetro é 'item' ou 'location')
  await paymentService(item, 'pix');
};

  const handleCopyPix = () => {
    if (pixData?.copyPaste) {
      Clipboard.setString(pixData.copyPaste);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 3000);
    }
  };

  useEffect(() => {
    const checkPaymentCompleted = async () => {
      // Busca o valor salvo no armazenamento local do dispositivo
      const paymentService = await AsyncStorage.getItem("payment_service");

      // Aplica a mesma regra de verificação do React JS
      if (servicePaymentId || paymentService === "1") {
        setPaymentCompleted(true);
      }
    };

    checkPaymentCompleted();
  }, [servicePaymentId]);

  return (
    <>
      <SafeAreaView style={{flex: 1, backgroundColor: '#0a768f'}} edges={['top', 'left', 'right']}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#0a768f" 
        translucent={false} 
      />
      <HeaderCliente />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        
        {/* Breadcrumb Header */}
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Dashboard do Cliente</Text>
          <Text style={styles.headerSubTitle}>
            Início / <Text style={{ color: '#94a3b8' }}>Pagamento do Serviço</Text>
          </Text>
        </View>

        {/* Card 1: Informações da Rota e Viagem */}
        <View style={styles.whiteCard}>
          <View style={styles.routeHeaderRow}>
            <Text style={styles.cityName}>{storedTrip?.cidade_origem}</Text>
            <View style={styles.arrowCircle}>
              <ArrowDownRight size={16} color="#06b6d4" strokeWidth={3} />
            </View>
            <Text style={styles.cityName}>{storedTrip?.cidade_destino}</Text>
          </View>

          {/* Badges de Informações */}
          <View style={styles.badgeRow}>
            <View style={styles.pillBadge}>
              <Plane size={14} color="#ffffff" style={styles.badgeIcon} />
              <Text style={styles.pillBadgeText}>{storedTrip?.meio_transporte}</Text>
            </View>

            <View style={styles.pillBadge}>
              <Calendar size={14} color="#ffffff" style={styles.badgeIcon} />
              <Text style={styles.pillBadgeText}>{storedTrip?.duracao_viagem}</Text>
            </View>

            <View style={styles.pillBadge}>
              <Luggage size={14} color="#ffffff" style={styles.badgeIcon} />
              <Text style={styles.pillBadgeText}>{item?.client_order_type}</Text>
            </View>
          </View>

          {/* Datas de Saída e Chegada */}
          <View style={styles.datesRow}>
            <View style={styles.dateBlock}>
              <View style={styles.statusTagBlue}>
                <Text style={styles.statusTagText}>SAÍDA</Text>
              </View>
              <View style={styles.dateInline}>
                <Calendar size={14} color="#0070f3" style={{ marginRight: 6 }} />
                <Text style={styles.dateText}>
                  {storedTrip?.data_partida} às {storedTrip?.horas_partida}
                </Text>
              </View>
            </View>

            <View style={styles.dateBlock}>
              <View style={styles.statusTagBlue}>
                <Text style={styles.statusTagText}>CHEGADA</Text>
              </View>
              <View style={styles.dateInline}>
                <Calendar size={14} color="#0070f3" style={{ marginRight: 6 }} />
                <Text style={styles.dateText}>
                  {storedTrip?.data_chegada} às {storedTrip?.horas_chegada}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Card 2: Valores do Serviço e Seguro */}
        <View style={styles.whiteCard}>
          <View style={styles.valueRowGreen}>
            <Text style={styles.valueLabel}>Valor do serviço</Text>
            <View style={styles.priceBadgeGreen}>
              <Text style={styles.priceBadgeGreenText}>{item?.order_value}</Text>
            </View>
          </View>

          <View style={styles.valueRowBordered}>
            <Text style={styles.valueLabel}>Valor do seguro</Text>
            <Text style={styles.priceTextBlue}>{item?.insurance_amount}</Text>
          </View>
        </View>

        {/* Seção Principal: KYC vs Form de Pagamento */}
        {kycVerified ? (
          <View style={styles.whiteCard}>
            <KycVerification onVerify={() => setKycVerified(true)} />
          </View>
        ) : paymentCompleted ? (
          <View style={[styles.whiteCard, styles.alignCenter]}>
            <Text style={styles.successTitle}>Pagamento realizado com sucesso!</Text>
            <Text style={styles.subtitle}>Recebemos o pagamento do serviço da sua encomenda.</Text>
          </View>
        ) : (
          <View style={styles.whiteCard}>
            <Text style={styles.title}>Pagamento do Serviço</Text>

            {errorPayment ? <Text style={styles.errorText}>{errorPayment}</Text> : null}

            {(loadingPayment || paymentProcessing) && (
              <View style={styles.processingBox}>
                <ActivityIndicator color="#1d4ed8" style={{ marginRight: 8 }} />
                <Text style={styles.processingText}>
                  {paymentMessage || 'Processando pagamento...'}
                </Text>
              </View>
            )}

            {/* Selector de Métodos (Tabs) */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, paymentMethod === 'credit_card' && styles.tabActive]}
                onPress={() => setPaymentMethod('credit_card')}
              >
                <CreditCard size={16} color={paymentMethod === 'credit_card' ? '#0f172a' : '#64748b'} style={{ marginRight: 6 }} />
                <Text style={[styles.tabText, paymentMethod === 'credit_card' && styles.tabTextActive]}>
                  Cartão de Crédito
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabButton, paymentMethod === 'pix' && styles.tabActive]}
                onPress={() => setPaymentMethod('pix')}
              >
                <QrCode size={16} color={paymentMethod === 'pix' ? '#0f172a' : '#64748b'} style={{ marginRight: 6 }} />
                <Text style={[styles.tabText, paymentMethod === 'pix' && styles.tabTextActive]}>
                  PIX
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form Cartão de Crédito */}
            {paymentMethod === 'credit_card' && (
              <View style={styles.formStack}>
                <Text style={styles.inputLabel}>Número do Cartão</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0000 0000 0000 0000"
                  keyboardType="numeric"
                  value={cardData.number}
                  onChangeText={(val) => handleCardChange('number', val)}
                />

                <Text style={styles.inputLabel}>Nome do Titular</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nome impresso no cartão"
                  value={cardData.holderName}
                  onChangeText={(val) => handleCardChange('holderName', val)}
                />

                <View style={styles.row}>
                  <View style={[styles.flex1, { marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>Expiração</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="MM/AA"
                      value={cardData.expiry}
                      onChangeText={(val) => handleCardChange('expiry', val)}
                    />
                  </View>
                  <View style={styles.flex1}>
                    <Text style={styles.inputLabel}>CVV</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="CVV"
                      secureTextEntry
                      keyboardType="numeric"
                      value={cardData.cvv}
                      onChangeText={(val) => handleCardChange('cvv', val)}
                    />
                  </View>
                </View>

                <View style={styles.switchRow}>
                  <Switch
                    value={cardHolderDifferent}
                    onValueChange={setCardHolderDifferent}
                  />
                  <Text style={styles.switchLabel}>Titular do cartão é diferente da conta</Text>
                </View>

                {cardHolderDifferent && (
                  <View style={styles.formStack}>
                    <TextInput
                      style={styles.input}
                      placeholder="Nome Completo do Titular"
                      value={friendCardData.nome}
                      onChangeText={(val) => handleFriendCardDataChange('nome', val)}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="CPF do Titular"
                      keyboardType="numeric"
                      value={friendCardData.cpf}
                      onChangeText={(val) => handleFriendCardDataChange('cpf', val)}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Telefone do Titular"
                      keyboardType="phone-pad"
                      value={friendCardData.telefone}
                      onChangeText={(val) => handleFriendCardDataChange('telefone', val)}
                    />
                  </View>
                )}

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleCreditCardPayment}
                  disabled={loadingPayment || paymentProcessing}
                >
                  <Text style={styles.primaryButtonText}>
                    {loadingPayment ? 'Processando...' : 'Pagar'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Fluxo PIX */}
            {paymentMethod === 'pix' && (
              <View style={styles.alignCenter}>
                {!showPix ? (
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handlePixPayment}
                    disabled={loadingPayment || paymentProcessing}
                  >
                    <Text style={styles.primaryButtonText}>
                      {loadingPayment ? 'Gerando...' : 'Gerar QR CODE'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.pixBox}>
                    {qrcode ? (
                      <Image
                        source={{ uri: `data:image/png;base64,${qrcode}` }}
                        style={{ width: 200, height: 200 }}
                        resizeMode="contain"
                      />
                    ) : (
                      <ActivityIndicator size="large" color="#0070f3" />
                    )}

                    <Text style={styles.pixCodeText}>
                      {copyPaste || 'Aguardando chave do PIX...'}
                    </Text>

                    <TouchableOpacity 
                      style={styles.darkButton} 
                      onPress={() => {
                        if (copyPaste) {
                          Clipboard.setString(copyPaste);
                          setPixCopied(true);
                          setTimeout(() => setPixCopied(false), 3000);
                        }
                      }}
                    >
                      <Text style={styles.darkButtonText}>Copiar código PIX</Text>
                    </TouchableOpacity>

                    {pixCopied && (
                      <Text style={styles.successText}>Código copiado com sucesso!</Text>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Mapa */}
        <View style={styles.mapContainer}>
          {(() => {
            const originLat = parseFloat(storedTrip?.lat_cidade_origem);
            const originLng = parseFloat(storedTrip?.lng_cidade_origem);
            const destLat = parseFloat(storedTrip?.lat_cidade_destino);
            const destLng = parseFloat(storedTrip?.lng_cidade_destino);

            const hasValidCoordinates =
              !isNaN(originLat) &&
              !isNaN(originLng) &&
              !isNaN(destLat) &&
              !isNaN(destLng);

            if (!hasValidCoordinates) {
              return (
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: -25.9692,
                    longitude: 32.5732,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}
                />
              );
            }

            const origin = { latitude: originLat, longitude: originLng };
            const destination = { latitude: destLat, longitude: destLng };

            const meioTransporte = storedTrip?.meio_transporte
              ?.toString()
              ?.toLowerCase()
              ?.normalize('NFD')
              ?.replace(/[\u0300-\u036f]/g, '');

            const isAviao = meioTransporte === 'aviao';

            const getDirectionsMode = (transport) => {
              if (transport?.includes('caminhada') || transport?.includes('pe')) return 'WALKING';
              if (transport?.includes('bicicleta') || transport?.includes('bike')) return 'BICYCLING';
              return 'DRIVING'; 
            };

            // Calcula região central e deltas para enquadrar ambos os pontos
            const minLat = Math.min(originLat, destLat);
            const maxLat = Math.max(originLat, destLat);
            const minLng = Math.min(originLng, destLng);
            const maxLng = Math.max(originLng, destLng);

            const initialRegion = {
              latitude: (minLat + maxLat) / 2,
              longitude: (minLng + maxLng) / 2,
              latitudeDelta: Math.max(maxLat - minLat, 0.05) * 1.5,
              longitudeDelta: Math.max(maxLng - minLng, 0.05) * 1.5,
            };

            return (
                <MapView style={styles.map} initialRegion={initialRegion}>
                  <Marker coordinate={origin} title={storedTrip?.cidade_origem || 'Origem'}>
                    <View style={styles.customMarker}>
                      <Text style={styles.customMarkerText}>A</Text>
                    </View>
                  </Marker>
                  <Marker coordinate={destination} title={storedTrip?.cidade_destino || 'Destino'}>
                    <View style={styles.customMarker}>
                      <Text style={styles.customMarkerText}>B</Text>
                    </View>
                  </Marker>

                  {isAviao ? (
                    <Polyline
                      coordinates={[origin, destination]}
                      strokeColor="#0070f3"
                      strokeWidth={3}
                      geodesic={true} // Linha geodésica para voos
                    />
                  ) : (
                    <MapViewDirections
                      origin={origin}
                      destination={destination}
                      apikey={GOOGLE_MAPS_APIKEY}
                      strokeWidth={4}
                      strokeColor="#0070f3"
                      mode={getDirectionsMode(meioTransporte)}
                      onError={(errorMessage) => {
                        console.log('Erro ao carregar rota:', errorMessage);
                      }}
                    />
                  )}
                </MapView>
              );
          })()}
        </View>
      </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0eded' },
  contentContainer: { padding: 16, marginTop: -20 },

  headerTitleContainer: { marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0070f3' },
  headerSubTitle: { fontSize: 13, color: '#64748b', fontWeight: '500', marginTop: 2 },

  whiteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  routeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cityName: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  arrowCircle: {
    width: 22,
    height: 22,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#06b6d4',
    backgroundColor: '#ecfeff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },

  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  pillBadge: {
    backgroundColor: '#00a3e0',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeIcon: { marginRight: 6 },
  pillBadgeText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },

  datesRow: {
    flexDirection: 'row',
    justify: 'space-between',
    marginTop: 4,
  },
  dateBlock: { flex: 1 },
  statusTagBlue: {
    backgroundColor: '#0070f3',
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  statusTagText: { color: '#ffffff', fontSize: 10, fontWeight: '800' },
  dateInline: { flexDirection: 'row', alignItems: 'center' },
  dateText: { color: '#0070f3', fontWeight: '700', fontSize: 13 },

  valueRowGreen: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f0fdf4',
    width: '100%',
  },
  valueRowBordered: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 18,
    padding: 16,
    width: '100%',
  },
  valueLabel: { 
    fontSize: 14, 
    color: '#1e293b', 
    fontWeight: '700',
    flex: 1,
  },
  priceBadgeGreen: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignSelf: 'flex-end',
  },
  priceBadgeGreenText: { color: '#ffffff', fontWeight: '800', fontSize: 14 },
  priceTextBlue: { 
    color: '#0070f3', 
    fontWeight: '800', 
    fontSize: 14,
    textAlign: 'right',
  },

  title: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 16 },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 8, flexDirection: 'row' },
  tabActive: { backgroundColor: '#fff' },
  tabText: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  tabTextActive: { color: '#0f172a', fontWeight: 'bold' },
  formStack: { gap: 10 },
  inputLabel: { fontSize: 12, color: '#475569', fontWeight: '600', marginBottom: 2 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 12, fontSize: 14 },
  row: { flexDirection: 'row' },
  flex1: { flex: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, gap: 8 },
  switchLabel: { fontSize: 12, color: '#475569', flex: 1 },
  primaryButton: { backgroundColor: '#10b981', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 10, width: '100%' },
  primaryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  darkButton: { backgroundColor: '#111827', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 10, width: '100%' },
  darkButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  alignCenter: { alignItems: 'center' },
  processingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eef6ff', padding: 12, borderRadius: 8, marginBottom: 12 },
  processingText: { color: '#1d4ed8', fontSize: 13 },
  errorText: { color: '#b91c1c', backgroundColor: '#fef2f2', padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 13 },
  pixBox: { alignItems: 'center', width: '100%', gap: 10 },
  pixCodeText: { fontSize: 11, color: '#334155', backgroundColor: '#f8fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', width: '100%', textAlign: 'center' },
  successText: { color: '#166534', fontWeight: 'bold', fontSize: 13 },
  successTitle: { fontSize: 18, fontWeight: 'bold', color: '#166534', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#64748b' },
  mapContainer: { height: 200, borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  map: { width: '100%', height: '100%' },
  customMarker: {
    backgroundColor: '#3b82f6', 
    width: 32,
    height: 32,
    borderRadius: 16, 
    borderWidth: 2,
    borderColor: '#ffffff', 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  customMarkerText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default PaymentService;