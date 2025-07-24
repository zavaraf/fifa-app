import { useState } from "react";
import api from "../api/api";

const useSesion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loginUser = async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // Llamada al servicio de login
      const response = await api.post("/api/login", { username, password });
      const { token, user } = response.data;
      
      console.log("Respuesta login:", response.data);
      const { idEquipo, username: usuario, nombreEquipo, rolesDes } = user;

      if (!token) {
        throw new Error("No se recibió un token válido del backend.");
      }

      // Obtener temporada (desde sesión o última disponible)
      const temporadaData = await getTemporadaData();
      
      if (!temporadaData) {
        throw new Error("No se pudo obtener información de temporadas.");
      }

      const idTemporada = temporadaData.id;
      const torneos = Array.isArray(temporadaData.torneos) ? temporadaData.torneos : [];

      console.log("Nombre equipo que se enviará a login:", nombreEquipo);
      console.log("Roles que se enviarán a login:", rolesDes);
      console.log("Torneos que se enviarán:", torneos);

      return {
        success: true,
        userData: { token, idEquipo, usuario, idTemporada, torneos, nombreEquipo, rolesDes }
      };

    } catch (error) {
      console.error("Error en loginUser:", error);
      setError(error.message || "Error al iniciar sesión");
      return {
        success: false,
        error: error.message || "Credenciales incorrectas"
      };
    } finally {
      setLoading(false);
    }
  };

  const getAllTemporadas = async () => {
    try {
      const temporadaResponse = await api.get("/temporada/buscarTemporada");
      const temporadas = temporadaResponse.data;
      
      console.log("Temporadas obtenidas:", temporadas);
      return temporadas || [];
    } catch (error) {
      console.error("Error al obtener todas las temporadas:", error);
      return [];
    }
  };

  const getTemporadaData = async () => {
    try {
      // Primero verificar si hay una temporada guardada en sesión
      const storedTemporada = sessionStorage.getItem("selectedTemporada");
      
      if (storedTemporada) {
        // Si hay temporada en sesión, usarla
        const temporadaData = JSON.parse(storedTemporada);
        console.log("Temporada cargada desde sesión:", temporadaData);
        return temporadaData;
      } else {
        // Si no hay temporada en sesión, buscar la última
        const temporadas = await getAllTemporadas();

        if (temporadas && temporadas.length > 0) {
          const ultimaTemporada = temporadas[temporadas.length - 1];
          console.log("Última temporada obtenida:", ultimaTemporada);
          
          // Guardar en sesión para próximas veces
          sessionStorage.setItem("selectedTemporada", JSON.stringify(ultimaTemporada));
          return ultimaTemporada;
        } else {
          console.error("No se encontraron temporadas.");
          return null;
        }
      }
    } catch (error) {
      console.error("Error al obtener temporada:", error);
      return null;
    }
  };

  const clearTemporadaSession = () => {
    sessionStorage.removeItem("selectedTemporada");
  };

  const setTemporadaSession = (temporada) => {
    sessionStorage.setItem("selectedTemporada", JSON.stringify(temporada));
  };

  const refreshTemporadaData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener todas las temporadas para encontrar la actual
      const temporadas = await getAllTemporadas();
      
      if (temporadas && temporadas.length > 0) {
        // Verificar si hay una temporada guardada en sesión
        const storedTemporada = sessionStorage.getItem("selectedTemporada");
        let temporadaActualizada;
        
        if (storedTemporada) {
          const temporadaGuardada = JSON.parse(storedTemporada);
          // Buscar la temporada guardada en la lista actualizada
          temporadaActualizada = temporadas.find(t => t.id === temporadaGuardada.id);
        }
        
        // Si no se encuentra la temporada guardada, usar la última
        if (!temporadaActualizada) {
          temporadaActualizada = temporadas[temporadas.length - 1];
        }
        
        console.log("Temporada actualizada:", temporadaActualizada);
        
        // Guardar la temporada actualizada en sesión
        sessionStorage.setItem("selectedTemporada", JSON.stringify(temporadaActualizada));
        
        return temporadaActualizada;
      } else {
        console.error("No se encontraron temporadas al actualizar.");
        return null;
      }
    } catch (error) {
      console.error("Error al actualizar temporada:", error);
      setError("Error al actualizar temporada");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Función para forzar actualización manual
  const forceRefreshTemporada = async () => {
    sessionStorage.removeItem("lastTemporadaRefresh");
    return await refreshTemporadaData();
  };

  return {
    loading,
    error,
    loginUser,
    getAllTemporadas,
    getTemporadaData,
    clearTemporadaSession,
    setTemporadaSession,
    refreshTemporadaData,
    forceRefreshTemporada // Nueva función para forzar actualización
  };
};

export default useSesion;
