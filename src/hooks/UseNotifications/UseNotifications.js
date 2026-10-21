// hooks/UseNotifications/UseNotifications.js
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import Config from 'react-native-config';

const API_URL = Config.URL_MAIN;

export default function UseNotifications() {
  const { authFetch } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [confirmDeleteNotifications, setConfirmDeleteNotifications] = useState(null);
  const [erroNotifications, setErroNotifications] = useState(null);

  const formatRelativeTime = (date) => {
    const created = new Date(date);
    const now = new Date();
    const diffMs = now - created;
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);

    if (minutes < 1) return 'agora';
    if (minutes < 60) return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    if (hours < 24) return `há ${hours} hora${hours > 1 ? 's' : ''}`;
    if (days === 1) return 'ontem';
    if (days < 30) return `há ${days} dia${days > 1 ? 's' : ''}`;
    const months = Math.floor(days / 30);
    if (months < 12) return `há ${months} mês${months > 1 ? 'es' : ''}`;
    const years = Math.floor(months / 12);
    return `há ${years} ano${years > 1 ? 's' : ''}`;
  };

  const buscarNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true);
      const response = await authFetch(`${API_URL}/api/notifications/`);
      
      if (!response.ok) throw new Error('Erro ao buscar notificações');
      
      const data = await response.json();
      const rawList = data.resultados || data; // Compatibilidade com a estrutura da API

      const formatted = rawList.map((item) => ({
        ...item,
        time: formatRelativeTime(item.created_at),
      }));

      setNotifications(formatted);
    } catch (err) {
      setErroNotifications(err.message || 'Erro desconhecido');
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  }, [authFetch]);

  const handleNotifications = async () => {
    setNotificationsOpen(true);

    // Atualiza as notificações ao abrir a modal
    await buscarNotifications();

    try {
      const response = await authFetch(
        `${API_URL}/api/notifications/viewed/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => ({
            ...n,
            viewed: true,
          })),
        );
      }
    } catch (err) {
      console.log('Erro ao marcar notificações como vistas:', err);
    }
  };

  const removeNotification = async (id) => {
    try {
      await authFetch(`${API_URL}/api/notifications/${id}/`, {
        method: 'DELETE',
      });
      setNotifications((prev) => prev.filter((item) => item.id !== id));
      setConfirmDeleteNotifications(null);
    } catch (err) {
      console.log('Erro ao remover notificação:', err);
    }
  };

  useEffect(() => {
    buscarNotifications();
  }, [buscarNotifications]);

  return {
    notificationsOpen,
    setNotificationsOpen,
    notifications,
    loadingNotifications,
    confirmDeleteNotifications,
    setConfirmDeleteNotifications,
    handleNotifications,
    removeNotification,
    buscarNotifications,
  };
}