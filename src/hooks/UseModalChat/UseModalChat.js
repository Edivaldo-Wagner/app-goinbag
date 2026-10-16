import { useState, useEffect, useRef, useCallback } from 'react';
import Config from 'react-native-config';
import { useAuth } from '../../context/AuthContext'; // Ajuste o caminho conforme a sua pasta

const URL_MAIN = Config.URL_MAIN;
const WS_URL = Config.WS_URL || URL_MAIN.replace('http', 'ws');

export const EMOJI_LIST = ['😀', '😂', '😍', '🙏', '🔥', '👍', '✅', '🎉', '💬', '😎'];

const useModalChat = () => {
  const { accessToken, setAccessToken, getRefreshToken } = useAuth(); // Importa os valores do AuthContext

  const [isOpenChat, setIsOpenChat] = useState(false);
  const [selectedNegotiationChat, setSelectedNegotiationChat] = useState(null);
  const [currentRoleChat, setCurrentRoleChat] = useState('');
  const [messagesChat, setMessagesChat] = useState([]);
  const [messageChat, setMessageChat] = useState('');
  const [showEmojiPickerChat, setShowEmojiPickerChat] = useState(false);
  const [loadingMessagesChat, setLoadingMessagesChat] = useState(false);
  const [sendingChat, setSendingChat] = useState(false);
  const [errorChat, setErrorChat] = useState('');

  const wsRef = useRef(null);
  const flatListRef = useRef(null);

  // Função para pegar um token válido ou renovar usando o Keychain/Context
  const getValidToken = async () => {
    try {
      // 1. Se já existe um accessToken na memória, tenta usar ele
      if (accessToken) {
        return accessToken;
      }

      // 2. Se não tem accessToken, busca o refresh token guardado no Keychain
      const refreshToken = await getRefreshToken();

      if (!refreshToken) {
        throw new Error('Nenhum refresh token encontrado');
      }

      // 3. Envia o refresh token explicitamente para a API no body
      const res = await fetch(`${URL_MAIN}/api/auth/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Falha ao renovar sessão');
      }

      // 4. Salva o novo access token no contexto global
      setAccessToken(data.access);
      return data.access;
    } catch (err) {
      console.log('CHAT AUTH ERROR:', err);
      throw err;
    }
  };

  const closeChatModal = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsOpenChat(false);
    setSelectedNegotiationChat(null);
    setCurrentRoleChat('');
    setMessagesChat([]);
    setShowEmojiPickerChat(false);
    setMessageChat('');
    setLoadingMessagesChat(false);
    setSendingChat(false);
    setErrorChat('');
  }, []);

  const openChatModal = (negotiation, role) => {
    setSelectedNegotiationChat(negotiation);
    setCurrentRoleChat(role);
    setIsOpenChat(true);
    setMessagesChat([]);
    setMessageChat('');
    setShowEmojiPickerChat(false);
    setErrorChat('');
  };

  useEffect(() => {
    const connect = async () => {
      if (!isOpenChat || !selectedNegotiationChat?.serie_trip_negotiations)
        return;

      setLoadingMessagesChat(true);

      try {
        const token = await getValidToken();

        const ws = new WebSocket(
          `${WS_URL}/ws/chat/${selectedNegotiationChat.serie_trip_negotiations}/?token=${encodeURIComponent(
            token
          )}&role=${encodeURIComponent(currentRoleChat)}`
        );

        wsRef.current = ws;

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);

          if (data.type === 'history') {
            setMessagesChat(data.results || []);
            setLoadingMessagesChat(false);
            return;
          }

          setMessagesChat((prev) => [...prev, data]);
        };

        ws.onerror = (e) => {
          console.log('WS ERROR:', e);
          setErrorChat('Não foi possível conectar ao chat.');
        };

        ws.onclose = () => {
          setLoadingMessagesChat(false);
        };
      } catch (err) {
        setErrorChat('Sessão expirada. Faça login novamente.');
        setLoadingMessagesChat(false);
      }
    };

    connect();

    return () => {
      wsRef.current?.close();
    };
  }, [isOpenChat, selectedNegotiationChat, currentRoleChat]);

  const handleMessageChange = (value) => {
    setMessageChat(value);
  };

  const handleSendMessage = () => {
    const cleanMessage = messageChat.trim();
    if (
      !cleanMessage ||
      !wsRef.current ||
      wsRef.current.readyState !== WebSocket.OPEN
    )
      return;

    setSendingChat(true);
    wsRef.current.send(
      JSON.stringify({
        type: 'message',
        message: cleanMessage,
        sender_role: currentRoleChat,
      })
    );
    setMessageChat('');
    setSendingChat(false);
  };

  const handleEmojiSelect = (emoji) => {
    setMessageChat((prev) => `${prev}${emoji}`);
    setShowEmojiPickerChat(false);
  };

  return {
    isOpenChat,
    selectedNegotiationChat,
    currentRoleChat,
    messagesChat,
    messageChat,
    emojiList: EMOJI_LIST,
    setShowEmojiPickerChat,
    showEmojiPickerChat,
    handleEmojiSelect,
    loadingMessagesChat,
    sendingChat,
    errorChat,
    flatListRef,
    openChatModal,
    closeChatModal,
    handleMessageChange,
    handleSendMessage,
  };
};

export default useModalChat;