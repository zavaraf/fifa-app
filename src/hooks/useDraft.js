import { useState, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import API_CONFIG from "../config/apiConfig";

const useDraft = () => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  // Buscar todos los Draft PC
  const fetchDraftsPC = useCallback(async () => {
    setLoading(true);
    setError(null);
    setDrafts([]);
    try {
      const url = `${API_CONFIG.BASE_URL}/draft/pc/findAllPC/${user.idTemporada}`;
      const response = await axios.get(url);
      if (Array.isArray(response.data)) {
        setDrafts(response.data);
      } else {
        setDrafts([]);
      }
    } catch (err) {
      setError("Error al cargar los drafts.");
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  }, [user.idTemporada]);

  // Buscar jugadores para ofertar de un equipo
  const fetchJugadoresParaOfertar = useCallback(
    async (idEquipo) => {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_CONFIG.BASE_URL}/equipo/team/all/1/${user.idTemporada}`;
        
        const response = await axios.get(url);
        // Retorna el array de jugadores o []
        return response.data?.jugadores || [];
      } catch (err) {
        setError("Error al cargar los jugadores para ofertar.");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [user.idTemporada]
  );

  // POST para realizar draft inicial
  const draftInicial = useCallback(
    async ({ idJugador, monto, usuario, nombreEquipo, idEquipo, idTemporada }) => {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_CONFIG.BASE_URL}/draft/pc/initialDraft/${idJugador}/${monto}/${usuario}/${nombreEquipo}/${idEquipo}/${user.idTemporada}`;
        console.log("draftInicial url:", url);
        const response = await axios.post(url);
        console.log("draftInicial response:", response);
        if (response.data?.status === 0) {
          return true;
        } else if (response.data?.status === 1) {
          setError(response.data?.mensaje || "Error al realizar el draft inicial.");
          return response.data?.mensaje || false;
        }
        return false;
      } catch (err) {
        setError("Error al realizar el draft inicial.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // POST para actualizar draft (oferta inicial)
  const updateDraft = useCallback(
    async ({ idJugador, monto, usuario, nombreEquipo, ofertaInicial, idEquipo }) => {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_CONFIG.BASE_URL}/draft/pc/updateDraft/${idJugador}/${monto}/${usuario}/${nombreEquipo}/${ofertaInicial}/${idEquipo}/${user.idTemporada}`;
        console.log("updateDraft url:", url);
        const response = await axios.post(url);

        console.log("updateDraft response:", response);
        if (response.data?.status === 0) {
          return true;
        } else if (response.data?.status === 1) {
          setError(response.data?.mensaje || "Error al actualizar el draft.");
          return response.data?.mensaje || false;
        }
        return false;
      } catch (err) {
        setError("Error al actualizar el draft.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user.idTemporada]
  );

  // POST para actualizar draft como admin
  const updateDraftAdmin = useCallback(
    async ({ idJugador, monto, usuario, nombreEquipo, ofertaInicial, idEquipo }) => {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_CONFIG.BASE_URL}/draft/pc/updateDraftAdmin/${idJugador}/${monto}/${usuario}/${nombreEquipo}/${ofertaInicial}/${idEquipo}/${user.idTemporada}`;
        console.log("updateDraftAdmin url:", url);
        const response = await axios.post(url);

        console.log("updateDraftAdmin response:", response);
        if (response.data?.status === 0) {
          return true;
        } else if (response.data?.status === 1) {
          setError(response.data?.mensaje || "Error al actualizar el draft (admin).");
          return response.data?.mensaje || false;
        }
        return false;
      } catch (err) {
        setError("Error al actualizar el draft (admin).");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user.idTemporada]
  );

  // Obtener histórico de un draft y jugador
  const getHistorico = useCallback(
    async (idDraft, idJugador) => {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_CONFIG.BASE_URL}/draft/pc/getHistorico/${idDraft}/${idJugador}/${user.idTemporada}`;
        const response = await axios.get(url);
        return response.data || [];
      } catch (err) {
        setError("Error al obtener el histórico.");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [user.idTemporada]
  );

  // POST para confirmar draft
  const confirmDraft = useCallback(
    async ({ idJugador, idEquipo }) => {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_CONFIG.BASE_URL}/draft/pc/confirmPlayer/${idJugador}/${idEquipo}/${user.idTemporada}`;
        console.log("confirmDraft url:", url);
        const response = await axios.post(url);

        console.log("confirmDraft response:", response);
        if (response.data?.status === 0) {
          return true;
        } else if (response.data?.status === 1) {
          setError(response.data?.mensaje || "Error al confirmar el draft.");
          return response.data?.mensaje || false;
        }
        return false;
      } catch (err) {
        setError("Error al confirmar el draft.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user.idTemporada]
  );

  return { drafts, loading, error, fetchDraftsPC, fetchJugadoresParaOfertar, draftInicial, updateDraft, getHistorico, updateDraftAdmin, confirmDraft };
};

export default useDraft;
