import { useState, useCallback } from "react";
import axios from "axios";
import API_CONFIG from "../config/apiConfig";

// Importar el JSON local para pruebas
//import salonFamaData from "../pages/json_Salonfama.json";

export default function useSalonFama() {
  const [salonFama, setSalonFama] = useState({ resumen: [], detalle: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSalonFama = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TEMPORAL: Usar JSON local para pruebas
      console.log("Usando JSON local para Salón de la Fama");
      
     /* if (salonFamaData && salonFamaData.status === 1) {
        setSalonFama(salonFamaData.data || { resumen: [], detalle: [] });
      } else {
        setError("Error al obtener datos del Salón de la Fama");
      }*/
      
      // ORIGINAL: Descomentar para usar el servicio real
      const url = `${API_CONFIG.BASE_URL}/temporada/lm/getSalonFama`;
      console.log("URL construida para obtener Salón de la Fama:", url);
      
      const response = await axios.get(url);
      console.log("Respuesta de Salón de la Fama:", response.data);
      
      // Verificar si la respuesta es HTML (sesión expirada)
      if (typeof response.data === 'string' && 
          (response.data.includes('<!DOCTYPE HTML') || 
           response.data.includes('Sesión no válida') || 
           response.data.includes('Inactividad de Sesión'))) {
        console.error("Sesión expirada detectada en fetchSalonFama");
        sessionStorage.clear();
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
        window.location.href = '/fifa-app/login';
        return;
      }
      
      if (response.data && response.data.status === 1) {
        setSalonFama(response.data.data || { resumen: [], detalle: [] });
      } else {
        setError(response.data?.mensaje || "Error al obtener datos del Salón de la Fama");
      }
      
    } catch (err) {
      console.error("Error fetching Salón de la Fama:", err);
      setError("Error de conexión al cargar el Salón de la Fama");
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtrar subcampeonatos del detalle (los que tienen imagen de medalla)
  const getDetalleSoloCampeonatos = useCallback(() => {
    return salonFama.detalle.filter(
      (item) => !item.imgTorneo?.includes("medalla.png")
    );
  }, [salonFama.detalle]);

  // Agrupar resumen por usuario para obtener totales únicos (RECALCULANDO sin subcampeonatos)
  const getUsuariosResumen = useCallback(() => {
    const detalleFiltrado = salonFama.detalle.filter(
      (item) => !item.imgTorneo?.includes("medalla.png")
    );
    
    const usuariosMap = new Map();
    
    // Primero procesar el detalle filtrado para obtener totales correctos
    detalleFiltrado.forEach((item) => {
      const key = item.usuario?.toLowerCase().trim();
      if (!usuariosMap.has(key)) {
        usuariosMap.set(key, {
          usuario: item.usuario,
          total: 0,
          equipos: new Set(),
          torneos: [],
        });
      }
      const userData = usuariosMap.get(key);
      userData.total += 1; // Contar cada campeonato real
      userData.equipos.add(item.nombreEquipo);
      userData.torneos.push({
        nombreTorneo: item.nombreTorneo,
        imgTorneo: item.imgTorneo,
        idTipoTorneo: item.idTipoTorneo,
        totalxTemporada: item.totalxTemporada,
        img: item.img,
        nombreEquipo: item.nombreEquipo,
      });
    });

    return Array.from(usuariosMap.values())
      .map((u) => ({
        ...u,
        equipos: Array.from(u.equipos),
      }))
      .sort((a, b) => b.total - a.total);
  }, [salonFama.detalle]);

  // Obtener detalle de campeonatos de un usuario específico (sin subcampeonatos)
  const getDetalleUsuario = useCallback((usuario) => {
    return salonFama.detalle.filter(
      (item) => 
        item.usuario?.toLowerCase().trim() === usuario?.toLowerCase().trim() &&
        !item.imgTorneo?.includes("medalla.png")
    );
  }, [salonFama.detalle]);

  // Agrupar por tipo de torneo (usando solo campeonatos, sin subcampeonatos)
  const getTorneosPorTipo = useCallback(() => {
    const detalleFiltrado = salonFama.detalle.filter(
      (item) => !item.imgTorneo?.includes("medalla.png")
    );
    const tiposMap = new Map();
    
    detalleFiltrado.forEach((item) => {
      const tipoKey = item.idTipoTorneo;
      if (!tiposMap.has(tipoKey)) {
        tiposMap.set(tipoKey, {
          idTipoTorneo: item.idTipoTorneo,
          nombreTorneo: item.nombreTorneo,
          imgTorneo: item.imgTorneo,
          campeones: [],
        });
      }
      tiposMap.get(tipoKey).campeones.push(item);
    });

    return Array.from(tiposMap.values());
  }, [salonFama.detalle]);

  // Estadísticas generales (usando solo campeonatos, sin subcampeonatos)
  const getEstadisticas = useCallback(() => {
    const usuarios = getUsuariosResumen();
    const detalleFiltrado = salonFama.detalle.filter(
      (item) => !item.imgTorneo?.includes("medalla.png")
    );
    const totalCampeonatos = detalleFiltrado.length;
    const equiposUnicos = new Set(detalleFiltrado.map((item) => item.nombreEquipo)).size;
    
    return {
      totalUsuarios: usuarios.length,
      totalCampeonatos,
      equiposUnicos,
      topUsuario: usuarios[0] || null,
    };
  }, [salonFama.detalle, getUsuariosResumen]);

  return {
    salonFama,
    loading,
    error,
    fetchSalonFama,
    getUsuariosResumen,
    getDetalleUsuario,
    getTorneosPorTipo,
    getEstadisticas,
    getDetalleSoloCampeonatos,
  };
}
