import React, { useState, useContext, useCallback } from "react"; // Importa useCallback
import axios from "axios";
import { AuthContext } from "../context/AuthContext"; // Importa el contexto de autenticación
import API_CONFIG from "../config/apiConfig";

const useJugadores = () => {
  const [jugadores, setJugadores] = useState([]); // Estado para almacenar los jugadores
  const [loading, setLoading] = useState(false); // Estado para el indicador de carga
  const [error, setError] = useState(null); // Estado para manejar errores
  const { user } = useContext(AuthContext); // Obtén el idTemporada desde el contexto

  const fetchJugadores = useCallback(async (idEquipo, idEquipoVisita) => {
    setLoading(true);
    setError(null);
    setJugadores([]); // Limpia el estado antes de cargar nuevos datos
    try {
      const url = `${API_CONFIG.BASE_URL}/user/player/${idEquipo}/${idEquipoVisita}/${user.idTemporada}`;
      const response = await axios.get(url); // Consume el servicio REST
      if (Array.isArray(response.data)) {
        console.log("Jugadores obtenidos:", response.data);
        setJugadores(response.data); // Almacena los jugadores si es un arreglo
      } else {
        console.error("La respuesta no es un arreglo:", response.data);
        setJugadores([]); // Define un arreglo vacío si la respuesta no es válida
      }
    } catch (err) {
      console.error("Error al cargar los jugadores:", err);
      setError("Error al cargar los jugadores.");
      setJugadores([]); // Define un arreglo vacío en caso de error
    } finally {
      setLoading(false); // Finaliza el estado de carga
    }
  }, [user.idTemporada]); // `useCallback` asegura que la función sea estable

  // Nuevo método para buscar todos los jugadores
  const fetchAllJugadores = useCallback(async () => {
    setLoading(true);
    setError(null);
    setJugadores([]);
    try {
      const url = `${API_CONFIG.BASE_URL}/user/findAllPlayers/${user.idTemporada}/0`;
      const response = await axios.get(url);
      if (Array.isArray(response.data)) {
        setJugadores(response.data);
      } else {
        setJugadores([]);
      }
    } catch (err) {
      setError("Error al cargar los jugadores.");
      setJugadores([]);
    } finally {
      setLoading(false);
    }
  }, [user.idTemporada]);

  // PUT para actualizar un jugador
  const updateJugador = useCallback(
    async (jugador) => {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_CONFIG.BASE_URL}/user/playerUpdate/${jugador.id}/${user.idTemporada}`;
        const response = await axios.post(url, jugador);
        console.log("jugador a actualizar:", jugador);
        // Si el response trae los jugadores actualizados, actualiza el estado
        console.log("Jugador actualizado:", response.data);
        if (Array.isArray(response.data)) {
          setJugadores(response.data);
        }
        return true;
      } catch (err) {
        setError("Error al actualizar el jugador.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user.idTemporada]
  );

  // POST para crear un jugador
  const createJugador = useCallback(
    async (jugador) => {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_CONFIG.BASE_URL}/user/player/${user.idTemporada}`;
        const response = await axios.post(url, jugador);
        console.log("jugador a crear:", jugador);
        if (Array.isArray(response.data)) {
          setJugadores(response.data);
        }
        return true;
      } catch (err) {
        setError("Error al crear el jugador.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user.idTemporada]
  );

  return { jugadores, loading, error, fetchJugadores, fetchAllJugadores, updateJugador, createJugador }; // Exporta los datos y funciones
};

export default useJugadores;