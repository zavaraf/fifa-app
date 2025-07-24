import { useCallback, useContext } from "react";
import axios from "axios";
import API_CONFIG from "../config/apiConfig";
import { AuthContext } from "../context/AuthContext"; // Importa el contexto de autenticación

export default function useMatchDetails() {
  const { user } = useContext(AuthContext); // Obtén el idTemporada desde el contexto

  const getMatchDetails = useCallback(
    async (jornada) => {
      if (!jornada || !user?.idTemporada) {
        console.error("Datos insuficientes para obtener los detalles del partido.");
        return null;
      }

      try {
        const url = `${API_CONFIG.BASE_URL}/temporada/lm/getJornada/${jornada.idJornada}/${jornada.id}/${jornada.idEquipoLocal}/${jornada.idEquipoVisita}/${user.idTemporada}`;
        const response = await axios.get(url); // Consume el servicio REST
        return response.data; // Devuelve los detalles del partido
      } catch (error) {
        console.error("Error al obtener los detalles del partido:", error);
        return null;
      }
    },
    [user?.idTemporada] // Memoriza la función en base al idTemporada
  );

  const saveMatchDetails = useCallback(
    async (matchDetails) => {
      const temporadaId = user?.idTemporada; // Obtén temporadaId desde el contexto
      const idEquipo = user?.idEquipo; // Obtén idEquipo desde el contexto
      const usuario = user?.usuario; // Obtén el usuario desde el contexto
      const selectedTorneo = JSON.parse(sessionStorage.getItem("selectedTorneo")); // Obtén el torneo seleccionado desde la sesión
  
      if (!selectedTorneo?.id || !temporadaId || !idEquipo || !usuario || !matchDetails) {
        console.error("Datos insuficientes para guardar los detalles del partido.");
        return null;
      }
  
      const url = `${API_CONFIG.BASE_URL}/temporada/lm/addResultJornada/${selectedTorneo.id}/${temporadaId}/${idEquipo}/${usuario}`;
      try {
        const response = await axios.post(url, matchDetails, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("Request enviada:", JSON.stringify(matchDetails, null, 2));
        console.log("Detalles guardados exitosamente:", response.data);
        return response.data; // Devuelve la respuesta del servidor
      } catch (error) {
        console.error("Error al guardar los detalles del partido:", error);
        throw error; // Lanza el error para manejarlo en el componente
      }
    },
    [user?.idTemporada, user?.idEquipo] // Memoriza la función en base a temporadaId y idEquipo
  );

  return { getMatchDetails, saveMatchDetails };
}