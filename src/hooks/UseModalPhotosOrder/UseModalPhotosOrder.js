import { useState } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../../context/AuthContext'; // Ajuste o path do seu AuthContext
import Config from 'react-native-config';

const URL_MAIN = Config.URL_MAIN;

const API_URL = URL_MAIN;

const placeholderImage = 'https://www.kitshouse.org/wp-content/uploads/2019/09/no-image-1.jpg';

const initialPhotos = Array.from({ length: 4 }, () => ({
  file: null,
  preview: placeholderImage,
}));

const useModalPhotosOrder = (refetchTripsNegotiations) => {
  const { authFetch } = useAuth();

  const [isOpenPhotosOrder, setIsOpenPhotosOrder] = useState(false);
  const [selectedNegotiationPhotosOrder, setSelectedNegotiationPhotosOrder] = useState(null);
  const [modePhotosOrder, setModePhotosOrder] = useState('upload'); // 'upload' | 'confirm'
  const [photosPhotosOrder, setPhotosPhotosOrder] = useState(initialPhotos);
  const [showSuccessScreenPhotosOrder, setShowSuccessScreenPhotosOrder] = useState(false);
  const [loadingPhotosOrder, setLoadingPhotosOrder] = useState(false);
  const [errorPhotosOrder, setErrorPhotosOrder] = useState('');
  const [successPhotosOrder, setSuccessPhotosOrder] = useState('');

  const openPhotosOrderModal = (negotiation, mode = 'upload') => {
    setSelectedNegotiationPhotosOrder(negotiation);
    setModePhotosOrder(mode);
    setErrorPhotosOrder('');
    setSuccessPhotosOrder('');
    setShowSuccessScreenPhotosOrder(false);

    const imgs = negotiation?.order_photos || [];

    if (mode === 'confirm' || imgs.length > 0) {
      const filled = Array.from({ length: 4 }, (_, index) => ({
        file: null,
        preview: imgs[index]?.img || placeholderImage,
      }));
      setPhotosPhotosOrder(filled);
    } else {
      setPhotosPhotosOrder(initialPhotos);
    }

    setIsOpenPhotosOrder(true);
  };

  const closePhotosOrderModal = () => {
    setIsOpenPhotosOrder(false);
    setSelectedNegotiationPhotosOrder(null);
    setModePhotosOrder('upload');
    setPhotosPhotosOrder(initialPhotos);
    setShowSuccessScreenPhotosOrder(false);
    setErrorPhotosOrder('');
    setSuccessPhotosOrder('');
  };

  const handleChangePhotoOrder = (index) => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.errorCode) return;

      const asset = response.assets?.[0];
      if (!asset) return;

      const file = {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `photo_${index + 1}.jpg`,
      };

      setErrorPhotosOrder('');
      setPhotosPhotosOrder((prev) =>
        prev.map((item, i) => (i === index ? { file, preview: asset.uri } : item))
      );
    });
  };

  const handleSubmitPhotosOrder = async () => {
    if (!selectedNegotiationPhotosOrder?.serie_trip_negotiations) {
      setErrorPhotosOrder('Nenhuma negociação selecionada.');
      return;
    }

    try {
      setLoadingPhotosOrder(true);
      setErrorPhotosOrder('');
      setSuccessPhotosOrder('');

      const negotiationId = selectedNegotiationPhotosOrder.serie_trip_negotiations;

      if (modePhotosOrder === 'upload') {
        const files = photosPhotosOrder
          .filter((item) => item.file)
          .map((item) => item.file);

        if (files.length !== 4) {
          throw new Error('Você deve selecionar exatamente 4 imagens.');
        }

        const formData = new FormData();
        files.forEach((file) => {
          formData.append('images', file);
        });

        const response = await authFetch(
          `${API_URL}/api/trip-negotiations/${negotiationId}/order-photos/upload/`,
          {
            method: 'POST',
            body: formData,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.detail || 'Não foi possível enviar as fotografias.');
        }

        setSuccessPhotosOrder(data?.detail || 'Fotografias enviadas com sucesso.');
        setShowSuccessScreenPhotosOrder(true);
      } else {
        const response = await authFetch(
          `${API_URL}/api/trip-negotiations/${negotiationId}/order-photos/confirm/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.detail || 'Não foi possível confirmar as fotografias.');
        }

        setSuccessPhotosOrder(data?.detail || 'Fotografias confirmadas com sucesso.');
        setShowSuccessScreenPhotosOrder(true);
      }

      if (typeof refetchTripsNegotiations === 'function') {
        await refetchTripsNegotiations();
      }
    } catch (err) {
      setErrorPhotosOrder(err.message || 'Erro inesperado.');
    } finally {
      setLoadingPhotosOrder(false);
    }
  };

  return {
    isOpenPhotosOrder,
    selectedNegotiationPhotosOrder,
    modePhotosOrder,
    photosPhotosOrder,
    showSuccessScreenPhotosOrder,
    loadingPhotosOrder,
    errorPhotosOrder,
    successPhotosOrder,
    openPhotosOrderModal,
    closePhotosOrderModal,
    handleChangePhotoOrder,
    handleSubmitPhotosOrder,
  };
};

export default useModalPhotosOrder;