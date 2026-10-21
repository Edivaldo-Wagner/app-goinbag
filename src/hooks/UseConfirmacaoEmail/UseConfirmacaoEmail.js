//UseConfirmacaoEmail.js
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

const API_URL = Config.URL_MAIN;
const CONFIRMATION_TOKEN_KEY = 'confirmation_token';
const COOLDOWN_KEY = 'confirmacao_email_last_sent';
const COOLDOWN_SECONDS = 60;

export default function UseConfirmacaoEmail({ phoneConfirmation, onVerified }) {
  const [code, setCode] = useState(['', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const checkCooldown = async () => {
      const lastSent = await AsyncStorage.getItem(COOLDOWN_KEY);
      if (!lastSent) return;
      const diff = Math.floor((Date.now() - Number(lastSent)) / 1000);
      const remaining = Math.max(COOLDOWN_SECONDS - diff, 0);
      setTimer(remaining);
    };
    checkCooldown();
  }, []);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          AsyncStorage.removeItem(COOLDOWN_KEY);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem(CONFIRMATION_TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const generateCode = async () => {
    try {
      setError('');
      const headers = await getAuthHeaders();

      const res = await fetch(`${API_URL}/api/confirmacao/gerar/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({
          tipo_validacao: 'email',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.detail || 'Erro ao gerar código');
        return;
      }

      await AsyncStorage.setItem(COOLDOWN_KEY, Date.now().toString());
      setTimer(COOLDOWN_SECONDS);
      setSuccess('Código reenviado com sucesso!');
      setCode(['', '', '', '', '']);
    } catch {
      setError('Erro de conexão');
    }
  };

  const verifyCode = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const fullCode = code.join('');
      const headers = await getAuthHeaders();

      const res = await fetch(`${API_URL}/api/confirmacao/validar/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({
          codigo: fullCode,
          tipo_validacao: 'email',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.detail || 'Código inválido ou expirado');
        return false;
      }

      setSuccess('Email confirmado com sucesso!');

      if (onVerified) {
        await onVerified(data);
      }

      return true;
    } catch {
      setError('Erro de conexão');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    code,
    setCode,
    timer,
    loading,
    error,
    success,
    verifyCode,
    generateCode,
  };
}