import { useState, useContext } from "react";
import axios from "axios";
import API_CONFIG from "../config/apiConfig";
import { AuthContext } from "../context/AuthContext";

export default function useTorneos() {
  const [tablaGeneral, setTablaGeneral] = useState([]);
  const [jornadas, setJornadas] = useState([]);
  const [grupos, setGrupos] = useState([]); // Estado para almacenar los grupos del torneo
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext); // Obtén el idTemporada y idEquipo desde el contexto
  const [golesTorneo, setGolesTorneo] = useState([]);
  const [golesTorneoEquipo, setGolesTorneoEquipo] = useState([]);

  // Función para obtener la tabla general
  const fetchTorneoGeneral = async () => {
    try {
      const selectedTorneo = JSON.parse(sessionStorage.getItem("selectedTorneo"));
      if (!selectedTorneo || !user?.idTemporada || !user?.idEquipo) {
        console.error("Faltan datos para construir la URL.");
        setError("No se pudo obtener la tabla general debido a datos faltantes.");
        return;
      }

      const url = `${API_CONFIG.BASE_URL}/temporada/lm/getTorneoGeneral/${user.idTemporada}/${selectedTorneo.id}/${user.idEquipo}`;
      console.log("URL construida para obtener la tabla general:", url);

      const response = await axios.get(url);
      console.log("Respuesta de tabla general:", response.data);
      
      // Verificar si la respuesta es HTML (sesión expirada)
      if (typeof response.data === 'string' && 
          (response.data.includes('<!DOCTYPE HTML') || 
           response.data.includes('Sesión no válida') || 
           response.data.includes('Inactividad de Sesión'))) {
        console.error("Sesión expirada detectada en fetchTorneoGeneral");
        sessionStorage.clear();
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
        window.location.href = '/fifa-app/login';
        return;
      }
      
      setTablaGeneral(response.data.tablaGeneral || []);
      setJornadas(response.data.jornadas || []);
      setGolesTorneo(response.data.golesTorneo || []); // Asegúrate de manejar el caso donde no haya goles
      setGolesTorneoEquipo(response.data.golesTorneoEquipo || []); // Agregar goles del equipo del usuario
    } catch (error) {
      console.error("Error al cargar la tabla general:", error);
      
      // Verificar si el error contiene HTML de sesión expirada
      if (error.response && typeof error.response.data === 'string' && 
          (error.response.data.includes('<!DOCTYPE HTML') || 
           error.response.data.includes('Sesión no válida'))) {
        console.error("Sesión expirada detectada en error response de tabla general");
        sessionStorage.clear();
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
        window.location.href = '/fifa-app/login';
        return;
      }
      
      setError("Error al cargar la tabla general.");
    }
  };

  // Función para obtener los grupos del torneo
  const fetchGruposTorneo = async (torneoId) => {
    try {
      const url = `${API_CONFIG.BASE_URL}/temporada/lm/getGruposTorneo/${user.idTemporada}/${torneoId}`;
      console.log("URL para obtener grupos del torneo:", url);

      const response = await axios.get(url);
      console.log("Respuesta completa:", response);
      console.log("Datos de respuesta:", response.data);
      
      // Verificar si la respuesta es HTML (sesión expirada)
      if (typeof response.data === 'string' && 
          (response.data.includes('<!DOCTYPE HTML') || 
           response.data.includes('Sesión no válida') || 
           response.data.includes('Inactividad de Sesión'))) {
        console.error("Sesión expirada detectada en fetchGruposTorneo");
        sessionStorage.clear();
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
        window.location.href = '/fifa-app/login';
        return;
      }
      
      const grupos = response.data || [];
      setGrupos(grupos); // Actualiza el estado con los grupos obtenidos
      sessionStorage.setItem("gruposTorneo", JSON.stringify(grupos)); // Guarda los grupos en sesión
    } catch (error) {
      console.error("Error al obtener los grupos del torneo:", error);
      
      // Verificar si el error contiene HTML de sesión expirada
      if (error.response && typeof error.response.data === 'string' && 
          (error.response.data.includes('<!DOCTYPE HTML') || 
           error.response.data.includes('Sesión no válida'))) {
        console.error("Sesión expirada detectada en error response");
        sessionStorage.clear();
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
        window.location.href = '/fifa-app/login';
        return;
      }
      
      setError("Error al obtener los grupos del torneo.");
    }
  };

  // Función para obtener las jornadas
  const fetchJornadas = async (torneoId) => {
    try {
      if (!torneoId || !user?.idTemporada) {
        console.error("Faltan datos para obtener las jornadas.");
        setError("No se pudo obtener las jornadas debido a datos faltantes.");
        return;
      }

      const url = `${API_CONFIG.BASE_URL}/temporada/lm/getJornadas/${user.idTemporada}/${torneoId}/0`;
      console.log("URL para obtener jornadas:", url);

      const response = await axios.get(url);
      console.log("Jornadas obtenidas:", response.data);
      setJornadas(response.data || []);
    } catch (error) {
      console.error("Error al obtener las jornadas:", error);
      setError("Error al obtener las jornadas.");
    }
  };

  // Función para editar jornadas
  const editarJornadas = async (torneoId, tipoTorneo, jornadasData) => {
    try {
      if (!torneoId || !user?.idTemporada || tipoTorneo === undefined) {
        console.error("Faltan datos para editar las jornadas.");
        setError("No se pudo editar las jornadas debido a datos faltantes.");
        return false;
      }

      const url = `${API_CONFIG.BASE_URL}/temporada/lm/addJornadas/${user.idTemporada}/${torneoId}/${tipoTorneo}`;
      console.log("URL para editar jornadas:", url);
      console.log("Datos a enviar:", jornadasData);

      const response = await axios.post(url, jornadasData);
      console.log("Jornadas editadas exitosamente:", response.data);
      
      // No actualizar automáticamente el estado aquí
      // Dejar que el componente decida si recargar los datos
      
      return true;
    } catch (error) {
      console.error("Error al editar las jornadas:", error);
      setError("Error al editar las jornadas.");
      return false;
    }
  };

  // Función para obtener el catálogo de torneos
  const getCatTorneos = async () => {
    try {
      const url = `${API_CONFIG.BASE_URL}/temporada/lm/getCatTorneo`;
      console.log("URL para obtener catálogo de torneos:", url);

      const response = await axios.get(url);
      console.log("Catálogo de torneos obtenido:", response.data);
      
      return response.data || [];
    } catch (error) {
      console.error("Error al obtener el catálogo de torneos:", error);
      setError("Error al obtener el catálogo de torneos.");
      return [];
    }
  };

  // Función para armar jornadas por grupos
  const getArmarJornadasGrupos = async (idTorneo, numGrupos, confJor, conAle, equipos) => {
    try {
      if (!idTorneo || !user?.idTemporada || numGrupos === undefined || confJor === undefined || conAle === undefined || !equipos) {
        console.error("Faltan datos para armar jornadas por grupos.");
        setError("No se pudo armar las jornadas debido a datos faltantes.");
        return null;
      }

      const url = `${API_CONFIG.BASE_URL}/temporada/lm/getArmarJornadasGrupos/${user.idTemporada}/${idTorneo}/${numGrupos}/${confJor}/${conAle}`;
      console.log("URL para armar jornadas por grupos:", url);
      console.log("Equipos a enviar:", equipos);

      const response = await axios.post(url, equipos);
      console.log("Jornadas por grupos armadas exitosamente:", response.data);
      
      return response.data || null;
    } catch (error) {
      console.error("Error al armar jornadas por grupos:", error);
      setError("Error al armar jornadas por grupos.");
      return null;
    }
  };

  // Función para crear torneo con jornadas por grupos
  const addJornadasGrupos = async (torneoNombre, torneoId, jornadasData) => {
    try {
      if (!torneoNombre || !torneoId || !user?.idTemporada || !jornadasData) {
        console.error("Faltan datos para crear el torneo.");
        setError("No se pudo crear el torneo debido a datos faltantes.");
        return false;
      }

      const url = `${API_CONFIG.BASE_URL}/temporada/lm/addJornadasGrupos/${user.idTemporada}/${torneoNombre}/2/${torneoId}`;
      console.log("URL para crear torneo:", url);
      console.log("Datos del torneo a enviar:", jornadasData);

      const response = await axios.post(url, jornadasData);
      console.log("Torneo creado exitosamente:", response.data);
      
      return true;
    } catch (error) {
      console.error("Error al crear el torneo:", error);
      setError("Error al crear el torneo.");
      return false;
    }
  };

  // Función para agregar jornadas de liguilla
  const addJuegosLiguilla = async (idTorneo, jornadasData) => {
    try {
      if (!idTorneo || !user?.idTemporada || !jornadasData) {
        console.error("Faltan datos para agregar jornadas de liguilla.");
        setError("No se pudo agregar las jornadas de liguilla debido a datos faltantes.");
        return false;
      }

      const url = `${API_CONFIG.BASE_URL}/temporada/lm/addJuegosLiguilla/${user.idTemporada}/${idTorneo}`;
      console.log("URL para agregar jornadas de liguilla:", url);
      console.log("Datos de jornadas de liguilla a enviar:", jornadasData);

      const response = await axios.post(url, jornadasData);
      console.log("Jornadas de liguilla agregadas exitosamente:", response.data);
      
      return true;
    } catch (error) {
      console.error("Error al agregar jornadas de liguilla:", error);
      setError("Error al agregar jornadas de liguilla.");
      return false;
    }
  };

  return { 
    tablaGeneral, 
    jornadas, 
    golesTorneo, 
    golesTorneoEquipo, 
    error, 
    fetchTorneoGeneral, 
    fetchGruposTorneo, 
    fetchJornadas,
    editarJornadas,
    getCatTorneos,
    getArmarJornadasGrupos,
    addJornadasGrupos,
    addJuegosLiguilla, // Agregar el nuevo método
    setGrupos, 
    setTablaGeneral, 
    setJornadas 
  };
}