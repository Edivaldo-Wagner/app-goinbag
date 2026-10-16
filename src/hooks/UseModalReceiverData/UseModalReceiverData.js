import { useState } from 'react';
import {useAuth} from '../../context/AuthContext';
import Config from 'react-native-config';

const URL_MAIN = Config.URL_MAIN;

const API_URL = URL_MAIN;

const initialForm = {
  name: '',
  email: '',
  phone: '',
};

const useModalReceiverData = (refetchTripsNegotiations) => {
  const [showSuccessScreenReceiverData, setShowSuccessScreenReceiverData] = useState(false);
  const [isOpenReceiverData, setIsOpenReceiverData] = useState(false);
  const [selectedNegotiationReceiverData, setSelectedNegotiationReceiverData] = useState(null);
  const [formDataReceiverData, setFormDataReceiverData] = useState(initialForm);
  const [errorsReceiverData, setErrorsReceiverData] = useState({});
  const [loadingReceiverData, setLoadingReceiverData] = useState(false);
  const [errorReceiverData, setErrorReceiverData] = useState('');
  const [successReceiverData, setSuccessReceiverData] = useState('');

  const { authFetch } = useAuth();

  const validateName = (name) => {
    const value = (name || '').trim();
    if (!value) return 'Nome é obrigatório';
    return '';
  };

  const validateEmail = (email) => {
    const value = (email || '').trim();
    if (!value) return 'Email é obrigatório';
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(value)) return 'Email inválido';
    return '';
  };

  const handlePhoneChange = (value) => {
    let raw = value.replace(/\D/g, '');

    if (raw.length > 11) {
      raw = raw.slice(0, 11);
    }

    raw = raw.replace(/^(\d{2})(\d)/, '($1) $2');
    raw = raw.replace(/(\d{5})(\d)/, '$1-$2');

    setFormDataReceiverData((prev) => ({
      ...prev,
      phone: raw,
    }));

    setErrorsReceiverData((prev) => ({
      ...prev,
      phone: '',
    }));
  };

  const validatePhone = (phone) => {
    const digits = (phone || '').replace(/\D/g, '');
    if (!digits) return 'Telefone é obrigatório';
    if (digits.length < 10 || digits.length > 11) {
      return 'Telefone inválido';
    }
    return '';
  };

  const validateForm = () => {
    const newErrors = {};

    const nameError = validateName(formDataReceiverData.name);
    const emailError = validateEmail(formDataReceiverData.email);
    const phoneError = validatePhone(formDataReceiverData.phone);

    if (nameError) newErrors.name = nameError;
    if (emailError) newErrors.email = emailError;
    if (phoneError) newErrors.phone = phoneError;

    setErrorsReceiverData(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const openModalReceiverData = (negotiation, status) => {
 
    setSelectedNegotiationReceiverData(negotiation);

    setFormDataReceiverData({
      img: negotiation?.receiver?.imagem || '',
      name: negotiation?.receiver?.nome || '',
      email: negotiation?.receiver?.email || '',
      phone: negotiation?.receiver?.phone || '',
      temporary_receiver: negotiation?.receiver_data || '',
      is_confirmed: negotiation?.is_receiver_data_confirmed || '',
      is_receiver_readded: status,
    });

    setErrorsReceiverData({});
    setErrorReceiverData('');
    setSuccessReceiverData('');
    setShowSuccessScreenReceiverData(false);
    setIsOpenReceiverData(true);
  };

  const closeModalReceiverData = () => {
    setIsOpenReceiverData(false);
    setSelectedNegotiationReceiverData(null);
    setFormDataReceiverData(initialForm);
    setErrorsReceiverData({});
    setErrorReceiverData('');
    setShowSuccessScreenReceiverData(false);
    setSuccessReceiverData('');
  };

  const handleChange = (field, value) => {
    setFormDataReceiverData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrorsReceiverData((prev) => ({
      ...prev,
      [field]: '',
    }));
  };

  const handleBlur = (field) => {
    const value = formDataReceiverData[field] || '';
    let errorMessage = '';

    if (field === 'name') errorMessage = validateName(value);
    if (field === 'email') errorMessage = validateEmail(value);
    if (field === 'phone') errorMessage = validatePhone(value);

    setErrorsReceiverData((prev) => ({
      ...prev,
      [field]: errorMessage,
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!selectedNegotiationReceiverData?.serie_trip_negotiations) {
      setErrorReceiverData('Nenhuma negociação selecionada.');
      return;
    }

    try {
      setLoadingReceiverData(true);
      setErrorReceiverData('');
      setSuccessReceiverData('');

      const response = await authFetch(
        `${API_URL}/api/trip-negotiations/${selectedNegotiationReceiverData.serie_trip_negotiations}/receiver-data/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formDataReceiverData),
        }
      );

      let data = {};
      try {
        data = await response.json();
      } catch (err) {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data?.detail || data?.message || 'Não foi possível enviar os dados.'
        );
      }

      setSuccessReceiverData(
        data?.detail || data?.message || 'Dados enviados com sucesso.'
      );
      setShowSuccessScreenReceiverData(true);
      if (refetchTripsNegotiations) await refetchTripsNegotiations();
    } catch (err) {
      setErrorReceiverData(err.message || 'Não foi possível enviar os dados.');
      setTimeout(() => {
        setErrorReceiverData('');
      }, 3000);
    } finally {
      setLoadingReceiverData(false);
    }
  };

  return {
    isOpenReceiverData,
    showSuccessScreenReceiverData,
    openModalReceiverData,
    closeModalReceiverData,
    selectedNegotiationReceiverData,
    formDataReceiverData,
    handleChange,
    handlePhoneChange,
    handleBlur,
    handleSubmit,
    loadingReceiverData,
    errorReceiverData,
    successReceiverData,
    errorsReceiverData,
  };
};

export default useModalReceiverData;