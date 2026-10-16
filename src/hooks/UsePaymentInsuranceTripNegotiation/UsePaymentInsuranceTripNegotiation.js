import { useRef, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import Config from 'react-native-config';

const API_URL = Config.URL_MAIN;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const UsePaymentInsuranceTripNegotiation = (onSuccessPayment) => {
  const { authFetch } = useAuth();

  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [errorPayment, setErrorPayment] = useState('');
  const [pixData, setPixData] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState('');

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchPaymentStatusOnce = async (serieTripNegotiations, paymentMethod) => {
  const response = await authFetch(
    `${API_URL}/api/trip-negotiations/${serieTripNegotiations}/payment-insurance/status/`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const responseText = await response.text();
  let data = {};
  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Erro no parsing da resposta (${response.status}).`);
    }
  }

  // LOGS DE DEBUG
  console.log("=== STATUS DA RESPOSTA DO POLLING ===", response.status);
  console.log("=== DADOS DO STATUS RECEBIDOS ===", JSON.stringify(data, null, 2));

  if (!response.ok) {
    throw new Error(data?.detail || 'Erro ao consultar pagamento.');
  }

  if (paymentMethod === 'pix') {
      if (data.insurance_payment_pix_qrcode) {
        return {
          qrcode: data.insurance_payment_pix_qrcode,
          copyPaste: data.insurance_payment_pix_copy_paste,
          paymentId: data.insurance_payment_id,
        };
      }
      return null;
    }

  if (paymentMethod === 'credit_card') {
    // Compara tratando conversões para string/número com segurança
    const tripStatusValid = String(data?.trip_status) === '2' || Number(data?.trip_status) === 2;
    const paymentIdValid = data?.insurance_payment_id !== null && data?.insurance_payment_id !== undefined;

    console.log(`Validação Cartão -> tripStatusValid: ${tripStatusValid}, paymentIdValid: ${paymentIdValid}`);

    if (tripStatusValid || paymentIdValid) {
      return data;
    }
    return null;
  }

  return null;
};

  const startPolling = async (serieTripNegotiations, paymentMethod) => {
    setPaymentProcessing(true);
    setPaymentMessage(
      paymentMethod === 'pix'
        ? 'Gerando QR Code do PIX...'
        : 'Processando pagamento no cartão...'
    );

    const startedAt = Date.now();
    const maxWait = 180000;

    while (isMounted.current) {
      try {
        if (Date.now() - startedAt > maxWait) {
          if (isMounted.current) {
            setPaymentProcessing(false);
            setPaymentMessage('');
          }
          throw new Error('Pagamento demorou mais que o esperado.');
        }

        const result = await fetchPaymentStatusOnce(serieTripNegotiations, paymentMethod);

        if (result && isMounted.current) {
          if (paymentMethod === 'pix') {
            setPixData(result);
            setPaymentMessage('QR Code PIX gerado com sucesso.');
          } else {
            setPaymentMessage('Pagamento confirmado com sucesso.');
            await AsyncStorage.setItem('payment_insurance', '1');
            onSuccessPayment?.(result);
          }
          setPaymentProcessing(false);
          return result;
        }

        await sleep(2000);
      } catch (err) {
        if (isMounted.current) {
          setPaymentProcessing(false);
          setPaymentMessage('');
        }
        throw err;
      }
    }
  };

  // Ajustado para aceitar tanto a estrutura do React JS (negotiation.state.item) quanto um objeto direto
  const paymentInsurance = async (negotiationOrItem, paymentMethod, payload = {}) => {
    try {
      setLoadingPayment(true);
      setErrorPayment('');
      setPixData(null);
      setPaymentMessage('');

      // Garante que pega a série independentemente de como o parâmetro foi passado
      const serie =
        negotiationOrItem?.state?.item?.serie_trip_negotiations ||
        negotiationOrItem?.serie_trip_negotiations ||
        negotiationOrItem?.serie_viagem;

      if (!serie) {
        throw new Error('Negociação inválida. Nenhuma série encontrada.');
      }

      const bodyData = {
        payment_method: paymentMethod,
        ...payload,
      };

      console.log("=== ENVIANDO REQUISIÇÃO DE PAGAMENTO ===");
    console.log("URL:", `${API_URL}/api/trip-negotiations/${serie}/payment-insurance/`);
    console.log("BODY ENVIADO AO BACKEND:", JSON.stringify(bodyData, null, 2));

      const response = await authFetch(
        `${API_URL}/api/trip-negotiations/${serie}/payment-insurance/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bodyData),
        }
      );

      const responseText = await response.text();
      let data = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.log('Aviso: resposta não é um JSON válido.');
        }
      }

      if (!response.ok && response.status !== 202) {
        throw new Error(data?.detail || 'Erro ao efetuar pagamento.');
      }

      setLoadingPayment(false);
      await startPolling(serie, paymentMethod);
    } catch (err) {
      if (isMounted.current) {
        setErrorPayment(err.message || 'Erro inesperado.');
        setLoadingPayment(false);
        setPaymentProcessing(false);
        setPaymentMessage('');
      }
    }
  };

  return {
    loadingPayment,
    paymentProcessing,
    paymentMessage,
    errorPayment,
    pixData,
    paymentInsurance,
  };
};

export default UsePaymentInsuranceTripNegotiation;