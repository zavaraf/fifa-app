import { useState, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import API_CONFIG from "../config/apiConfig";

const useEquipos = () => {
  const [equipos, setEquipos] = useState([]);
  const [catalogoFinanzas, setCatalogoFinanzas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  const fetchEquipos = useCallback(async () => {
    setLoading(true);
    setError(null);
    setEquipos([]);
    try {
      const url = `${API_CONFIG.BASE_URL}/equipo/buscarTodos/${user.idTemporada}`;
      const response = await axios.get(url);

      if (Array.isArray(response.data)) {
        setEquipos(response.data);
      } else {
        setEquipos([]);
      }
      console.log("Equipos obtenidos:", response.data);
    } catch (err) {
      setError("Error al cargar los equipos.");
      setEquipos([]);
    } finally {
      setLoading(false);
    }
  }, [user.idTemporada]);

  // Buscar equipo por ID
  const fetchEquipoById = useCallback(
    async (equipoId) => {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_CONFIG.BASE_URL}/equipo/team/${equipoId}/${user.idTemporada}`;
        const response = await axios.get(url);
        console.log("Equipo obtenido:", response.data);
        return response.data || null;
      } catch (err) {
        setError("Error al buscar el equipo.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user.idTemporada]
  );

  // PUT para modificar un equipo
  const modificarEquipo = useCallback(
    async (equipo) => {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_CONFIG.BASE_URL}/equipo/${equipo.id}/${user.idTemporada}`;
        await axios.put(url, equipo);
        return true;
      } catch (err) {
        setError("Error al modificar el equipo.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user.idTemporada]
  );

  // POST para actualizar presupuestoInicial
  const actualizarPresupuestoInicial = useCallback(
    async (presupuesto, idTemporada, equipo) => {
      setLoading(true);
      setError(null);
      try {
        console.log("Equipo a actualizar:", equipo);
        const url = `${API_CONFIG.BASE_URL}/sponsor/finanzas/presupuestoId/${presupuesto}/${equipo.id}/${user.idTemporada}`;
        await axios.put(url);
        return true;
      } catch (err) {
        setError("Error al actualizar el presupuesto inicial.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // GET para obtener el catálogo de finanzas
  const fetchCatalogoFinanzas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${API_CONFIG.BASE_URL}/sponsor/catalogoFinanzas`;
      const response = await axios.get(url);
      
      if (Array.isArray(response.data)) {
        setCatalogoFinanzas(response.data);
        console.log("Catálogo de finanzas obtenido:", response.data);
        return response.data;
      } else {
        setCatalogoFinanzas([]);
        return [];
      }
    } catch (err) {
      setError("Error al cargar el catálogo de finanzas.");
      setCatalogoFinanzas([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // POST para guardar un concepto financiero
  const guardarConceptoFinanciero = useCallback(async (conceptoData) => {
    setLoading(true);
    setError(null);
    try {
      const { idConcepto, monto, equipo } = conceptoData;
      const url = `${API_CONFIG.BASE_URL}/sponsor/finanzas/${idConcepto}/${monto}/${user.idTemporada}`;
            
      const response = await axios.post(url, equipo);
      console.log("Concepto financiero guardado:", response.data);
      return response.data;
    } catch (err) {
      setError("Error al guardar el concepto financiero.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user.idTemporada]);

  return {
    equipos,
    catalogoFinanzas,
    loading,
    error,
    fetchEquipos,
    fetchEquipoById,
    modificarEquipo,
    actualizarPresupuestoInicial,
    fetchCatalogoFinanzas,
    guardarConceptoFinanciero,
  };
};

export default useEquipos;
