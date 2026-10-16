import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Config from 'react-native-config';

const URL_MAIN = Config.URL_MAIN;

const API_URL = URL_MAIN;

const UseModalReceiverConfirmData = (onSuccessReceiverConfirmData) => {
  const { authFetch } = useAuth();

  const [isOpenReceiverConfirmData, setIsOpenReceiverConfirmData] =
    useState(false);
  const [
    selectedNegotiationReceiverConfirmData,
    setSelectedNegotiationReceiverConfirmData,
  ] = useState(null);
  const [actionTypeReceiverConfirmData, setActionTypeReceiverConfirmData] =
    useState('confirm');
  const [
    showSuccessScreenReceiverConfirmData,
    setShowSuccessScreenReceiverConfirmData,
  ] = useState(false);
  const [loadingReceiverConfirmData, setLoadingReceiverConfirmData] =
    useState(false);
  const [errorReceiverConfirmData, setErrorReceiverConfirmData] = useState('');
  const [successReceiverConfirmData, setSuccessReceiverConfirmData] =
    useState('');

  const openModalReceiverConfirmData = (negotiation, actionType) => {
    setSelectedNegotiationReceiverConfirmData(negotiation);
    setActionTypeReceiverConfirmData(actionType);
    setShowSuccessScreenReceiverConfirmData(false);
    setErrorReceiverConfirmData('');
    setSuccessReceiverConfirmData('');
    setIsOpenReceiverConfirmData(true);
  };

  const closeModalReceiverConfirmData = () => {
    setIsOpenReceiverConfirmData(false);
    setSelectedNegotiationReceiverConfirmData(null);
    setActionTypeReceiverConfirmData('confirm');
    setShowSuccessScreenReceiverConfirmData(false);
    setErrorReceiverConfirmData('');
    setSuccessReceiverConfirmData('');
  };

  const handleSubmit = async () => {
    if (!selectedNegotiationReceiverConfirmData?.serie_trip_negotiations) {
      setErrorReceiverConfirmData('Nenhuma negociação selecionada.');
      return;
    }

    try {
      setLoadingReceiverConfirmData(true);
      setErrorReceiverConfirmData('');
      setSuccessReceiverConfirmData('');

      const response = await authFetch(
        `${API_URL}/api/trip-negotiations/${selectedNegotiationReceiverConfirmData.serie_trip_negotiations}/receiver-decision/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: actionTypeReceiverConfirmData,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || 'Não foi possível processar a ação.');
      }

      setSuccessReceiverConfirmData(
        data?.detail || 'Ação executada com sucesso.'
      );
      setShowSuccessScreenReceiverConfirmData(true);

      if (onSuccessReceiverConfirmData) {
        onSuccessReceiverConfirmData(data);
      }
    } catch (err) {
      setErrorReceiverConfirmData(
        err.message || 'Não foi possível processar a ação.'
      );
    } finally {
      setLoadingReceiverConfirmData(false);
    }
  };

  return {
    isOpenReceiverConfirmData,
    showSuccessScreenReceiverConfirmData,
    openModalReceiverConfirmData,
    closeModalReceiverConfirmData,
    selectedNegotiationReceiverConfirmData,
    actionTypeReceiverConfirmData,
    loadingReceiverConfirmData,
    errorReceiverConfirmData,
    successReceiverConfirmData,
    handleSubmit,
  };
};

export default UseModalReceiverConfirmData;