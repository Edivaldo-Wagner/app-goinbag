// hooks/UseUsuarios.js
import { useState, useEffect } from 'react';
import fetchUsuarios from '../api/fetchUsuarios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UseUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [erroUsuarios, setErroUsuarios] = useState(null);

  const buscarUsuarios = async () => {
    setLoadingUsuarios(true);
    try {
      const responseUsuarios = await fetchUsuarios();

      if (!responseUsuarios.ok) throw new Error('Erro ao buscar usuarios');

      const rawTextUsuarios = await responseUsuarios.text();
      const dataUsuarios = JSON.parse(rawTextUsuarios);

      setUsuarios(dataUsuarios);
    } catch (err) {
      setErroUsuarios(err.message || 'Erro desconhecido');
    } finally {
      setLoadingUsuarios(false);
    }
  };

  useEffect(() => {
    buscarUsuarios();
  }, []);

  return {
    usuarios,
    loadingUsuarios,
    erroUsuarios,
    buscarUsuarios
  };
}
