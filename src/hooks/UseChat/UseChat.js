// hooks/UseChat.js
import { useState, useEffect } from 'react';
import fetchChat from '../api/fetchChat';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UseChat() {
  const [chat, setChat] = useState([]);
  const [loadingChat, setLoadingChat] = useState(true);
  const [erroChat, setErroChat] = useState(null);

  const buscarChat = async () => {
    setLoadingChat(true);
    try {
      const responseChat = await fetchChat();

      if (!responseChat.ok) throw new Error('Erro ao buscar Chat');

      const rawTextChat = await responseChat.text();
      const dataChat = JSON.parse(rawTextChat);

      setChat(dataChat);
    } catch (err) {
      setErroChat(err.message || 'Erro desconhecido');
    } finally {
      setLoadingChat(false);
    }
  };

  useEffect(() => {
    buscarChat();
  }, []);

  return {
    chat,
    loadingChat,
    buscarChat
  };
}
