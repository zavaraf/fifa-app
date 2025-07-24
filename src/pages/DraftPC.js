import React, { useState, useEffect, useRef, useContext, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Avatar,
  TextField,
  Button,
  Grid,
  Link as MuiLink,
  Snackbar,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import useDraft from "../hooks/useDraft";
import useJugadores from "../hooks/useJugadores";
import { AuthContext } from "../context/AuthContext";
import DrawerOferta from "../components/DrawerOferta";
import EditJugadorDialog from "../components/EditJugadorDialog";
import OfertasRealizadas from "../components/OfertasRealizadas";
import JugadoresParaOfertar from "../components/JugadoresParaOfertar";

export default function DraftPC() {
  const [tab, setTab] = useState(0);
  const [jugadores, setJugadores] = useState([]);
  const [ofertaInput, setOfertaInput] = useState({});
  const [jugadoresLoading, setJugadoresLoading] = useState(false);
  const [jugadoresPage, setJugadoresPage] = useState(0);
  const [jugadoresFilter, setJugadoresFilter] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [mensajeError, setMensajeError] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null);
  const [drawerMonto, setDrawerMonto] = useState("");
  const [ofertasFilter, setOfertasFilter] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  // Estados para agregar jugador
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editJugador, setEditJugador] = useState(null);
  const [form, setForm] = useState({ nombre: "", equipo: "", img: "", rating: "" });
  
  // Estado para el reloj
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const pageSize = 30;
  const jugadoresCache = useRef({}); // cache por idEquipo

  // Usar hook para drafts
  const { user } = useContext(AuthContext);
  
  const { drafts, loading, fetchDraftsPC, fetchJugadoresParaOfertar, draftInicial } = useDraft();
  const { jugadores: allJugadores, updateJugador, createJugador, fetchAllJugadores } = useJugadores();

  // Mejoras sugeridas:

  // 1. Evitar hardcodear idEquipo = 1, usar el del usuario de sesión si existe.
  const idEquipoSesion = user?.idEquipo || 1;

  // 2. Usar useCallback para handlers que no dependan de props/estado local para evitar renders innecesarios.
  const handleActualizarDrafts = useCallback(() => {
    fetchDraftsPC();
  }, [fetchDraftsPC]);

  const handleActualizarJugadores = useCallback(async () => {
    setJugadoresLoading(true);
    const jugadoresData = await fetchJugadoresParaOfertar(idEquipoSesion);
    setJugadores(jugadoresData);
    jugadoresCache.current[idEquipoSesion] = jugadoresData;
    setJugadoresLoading(false);
  }, [fetchJugadoresParaOfertar, idEquipoSesion]);

  // Verificar si el usuario tiene rol de Admin
  const isAdmin = user?.rolesDes?.includes("Admin");

  // Función para abrir el diálogo de agregar jugador
  const handleGoToJugadores = () => {
    setEditJugador(null);
    setForm({ nombre: "", equipo: equipos[0]?.nombre || "", img: "", rating: "" });
    setOpenEditDialog(true);
  };

  // Obtener equipos únicos para el selector
  const equipos = useMemo(() => {
    const equiposUnicos = Array.from(
      new Set(allJugadores.map((j) => j.equipo?.nombre).filter(Boolean))
    ).map((nombre, idx) => ({
      id: idx + 1,
      nombre,
    }));
    return equiposUnicos;
  }, [allJugadores]);

  // Cerrar diálogo
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditJugador(null);
    setForm({ nombre: "", equipo: "", img: "", rating: "" });
  };

  // Guardar jugador (crear nuevo)
  const handleSaveJugador = async (formData) => {
    try {
      if (editJugador) {
        // Editar jugador existente
        await updateJugador({
          ...editJugador,
          ...formData,
          raiting: Number(formData.raiting),
          costo: Number(formData.costo) || 0,
          equipo: editJugador?.equipo
            ? { ...editJugador.equipo, nombre: formData.equipo }
            : { nombre: formData.equipo },
        });
      } else {
        // Crear nuevo jugador
        await createJugador({
          ...formData,
          raiting: Number(formData.raiting),
          costo: Number(formData.costo) || 0,
          equipo: { nombre: formData.equipo },
        });
      }
      
      // Actualizar la lista de jugadores
      await fetchAllJugadores();
      
      // Mostrar mensaje de éxito
      setMensaje("Jugador guardado correctamente.");
      setMensajeError(false);
      setSnackbarOpen(true);
      
      // Cerrar diálogo
      setOpenEditDialog(false);
      setEditJugador(null);
      setForm({ nombre: "", equipo: "", img: "", rating: "" });
    } catch (error) {
      setMensaje("Error al guardar el jugador.");
      setMensajeError(true);
      setSnackbarOpen(true);
    }
  };

  // Cargar todos los jugadores al inicio
  useEffect(() => {
    fetchAllJugadores();
  }, [fetchAllJugadores]);

  // Efecto para actualizar el reloj cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Función para obtener la hora CDMX + 1 hora
  const getDisplayTime = () => {
    const now = new Date();
    // Convertir a CDMX (UTC-6)
    const cdmxTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
    // Agregar 1 hora
    cdmxTime.setHours(cdmxTime.getHours() + 1);
    
    return {
      fecha: cdmxTime.toLocaleDateString("es-MX", {
        weekday: "short",
        day: "numeric",
        month: "short"
      }),
      hora: cdmxTime.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      })
    };
  };

  useEffect(() => {
    fetchDraftsPC();
  }, [fetchDraftsPC]);

  // Cargar jugadores para ofertar cuando se selecciona la pestaña 1
  useEffect(() => {
    const cargarJugadores = async () => {
      if (tab === 1) {
        const idEquipo = 1; // Cambia según tu lógica
        if (jugadoresCache.current[idEquipo]) {
          setJugadores(jugadoresCache.current[idEquipo]);
        } else {
          setJugadoresLoading(true);
          const jugadoresData = await fetchJugadoresParaOfertar(idEquipo);
          setJugadores(jugadoresData);
          jugadoresCache.current[idEquipo] = jugadoresData;
          setJugadoresLoading(false);
        }
      }
    };
    cargarJugadores();
    // eslint-disable-next-line
  }, [tab, fetchJugadoresParaOfertar]);

  // Mascara visual para el input de monto
  const formatCantidad = (value) => {
    if (!value) return "";
    const num = Number(value.toString().replace(/\D/g, ""));
    return num ? num.toLocaleString("es-MX") : "";
  };

  const handleOfertaChange = (jugadorId, value) => {
    const cleanValue = value.replace(/\D/g, "");
    setOfertaInput(prev => ({
      ...prev,
      [jugadorId]: formatCantidad(cleanValue),
    }));
  };

  const getMontoNumber = (montoStr) => {
    if (!montoStr) return "";
    return montoStr.toString().replace(/[^0-9]/g, "");
  };

  const handleOfertar = async (jugador) => {
    const monto = getMontoNumber(ofertaInput[jugador.id || jugador.nombreCompleto]);
    if (!monto) return;
    setJugadoresLoading(true);
    const result = await draftInicial({
      idJugador: jugador.id,
      monto,
      usuario: user?.usuario || user?.nombreUsuario || user?.username || user?.nombre || "usuario",
      nombreEquipo: user?.nombreEquipo || "Equipo",
      idEquipo: user?.idEquipo,
      idTemporada: user?.idTemporada,
    });
    setJugadoresLoading(false);
    setOfertaInput((prev) => ({ ...prev, [jugador.id || jugador.nombreCompleto]: "" }));
    if (result === true) {
      setMensaje("Oferta enviada correctamente.");
      setMensajeError(false);
      setSnackbarOpen(true);
      fetchDraftsPC();
    } else if (typeof result === "string") {
      setMensaje(result);
      setMensajeError(true);
      setSnackbarOpen(true);
      return;
    } else {
      setMensaje("Error al enviar la oferta.");
      setMensajeError(true);
      setSnackbarOpen(true);
      return;
    }
    setTimeout(() => setMensaje(""), 3000);
  };

  // Drawer handlers
  const handleAbrirDrawer = (jugador) => {
    setJugadorSeleccionado(jugador);
    setDrawerMonto(ofertaInput[jugador.id || jugador.nombreCompleto] || "");
    setDrawerOpen(true);
  };

  const handleAbrirDrawerOferta = (oferta) => {
    setJugadorSeleccionado({
      id: oferta.idJugador,
      nombreCompleto: oferta.sobrenombre || oferta.nombre,
      img: oferta.img,
      equipo: oferta.equipo,
      link: oferta.link,
    });
    setDrawerMonto(oferta.montoOferta?.toString() || "");
    setDrawerOpen(true);
  };

  const handleCerrarDrawer = () => {
    setDrawerOpen(false);
    setJugadorSeleccionado(null);
    setDrawerMonto("");
    setMensaje("");
    setMensajeError(false);
  };

  const handleOfertarDrawer = async () => {
    const monto = getMontoNumber(drawerMonto);
    if (!monto) return;
    setJugadoresLoading(true);
    const result = await draftInicial({
      idJugador: jugadorSeleccionado.id,
      monto,
      usuario: user?.usuario || user?.nombreUsuario || user?.username || user?.nombre || "usuario",
      nombreEquipo: user?.nombreEquipo || "Equipo",
      idEquipo: user?.idEquipo,
      idTemporada: user?.idTemporada,
    });
    setJugadoresLoading(false);
    setOfertaInput((prev) => ({
      ...prev,
      [jugadorSeleccionado.id || jugadorSeleccionado.nombreCompleto]: "",
    }));
    setDrawerOpen(false);
    setDrawerMonto("");
    setJugadorSeleccionado(null);
    if (result === true) {
      setMensaje("Oferta enviada correctamente.");
      setMensajeError(false);
      setSnackbarOpen(true);
      fetchDraftsPC();
    } else if (typeof result === "string") {
      setMensaje(result);
      setMensajeError(true);
      setSnackbarOpen(true);
      return;
    } else {
      setMensaje("Error al enviar la oferta.");
      setMensajeError(true);
      setSnackbarOpen(true);
      return;
    }
    setTimeout(() => setMensaje(""), 3000);
  };

  const jugadoresSolo = useMemo(
    () =>
      jugadores.filter(
        j => typeof j === "object" && (j.id || j.nombreCompleto) && !j.jugadores
      ),
    [jugadores]
  );

  const jugadoresFiltrados = useMemo(
    () =>
      jugadoresSolo.filter(j =>
        (j.nombreCompleto?.toLowerCase() || "").includes(jugadoresFilter.toLowerCase()) ||
        (j.idsofifa?.toString() || "").includes(jugadoresFilter) ||
        (j.link?.toLowerCase() || "").includes(jugadoresFilter.toLowerCase())
      ),
    [jugadoresSolo, jugadoresFilter]
  );

  const paginatedJugadores = useMemo(
    () =>
      jugadoresFiltrados.slice(
        jugadoresPage * pageSize,
        (jugadoresPage + 1) * pageSize
      ),
    [jugadoresFiltrados, jugadoresPage, pageSize]
  );

  const ofertasFiltradas = useMemo(() => {
    let arr = Array.isArray(drafts) ? [...drafts] : [];
    if (ofertasFilter.trim()) {
      const filtro = ofertasFilter.trim().toLowerCase();
      arr = arr.filter(oferta =>
        (oferta.sobrenombre || oferta.nombre || "").toLowerCase().includes(filtro) ||
        (oferta.manager || "").toLowerCase().includes(filtro) ||
        (oferta.comentarios || "").toLowerCase().includes(filtro)
      );
    }
    
    // Ordenar por fecha descendente (más recientes primero)
    arr.sort((a, b) => {
      const fechaA = new Date(a.fecha || 0);
      const fechaB = new Date(b.fecha || 0);
      
      return fechaB - fechaA;
    });
    
    return arr;
  }, [drafts, ofertasFilter]);

  const totalPages = Math.ceil(jugadoresFiltrados.length / pageSize);

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Draft PC
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ 
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: 1.5, 
            borderRadius: 2, 
            backgroundColor: "primary.main",
            color: "white",
            minWidth: 120,
            boxShadow: 2
          }}>
            <Typography variant="body2" fontWeight={700} sx={{ fontSize: 16 }}>
              {getDisplayTime().hora}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: 12, opacity: 0.9 }}>
              {getDisplayTime().fecha}
            </Typography>
          </Box>
          {isAdmin && (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={handleGoToJugadores}
            >
              Agregar Jugador
            </Button>
          )}
        </Box>
      </Box>
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
          sx={{
            ".MuiTab-root": { fontWeight: 600, fontSize: 16, textTransform: "none" },
            ".MuiTabs-indicator": { backgroundColor: "primary.main", height: 4, borderRadius: 2 },
          }}
        >
          <Tab label="Ofertas" />
          <Tab label="Jugadores para ofertar" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <OfertasRealizadas
          ofertasFiltradas={ofertasFiltradas}
          loading={loading}
          handleActualizarDrafts={handleActualizarDrafts}
          handleAbrirDrawerOferta={handleAbrirDrawerOferta}
          user={user}
        />
      )}

      {tab === 1 && (
        <JugadoresParaOfertar
          jugadores={jugadores}
          jugadoresLoading={jugadoresLoading}
          jugadoresFiltrados={jugadoresFiltrados}
          paginatedJugadores={paginatedJugadores}
          pageSize={pageSize}
          jugadoresPage={jugadoresPage}
          totalPages={totalPages}
          jugadoresFilter={jugadoresFilter}
          setJugadoresFilter={setJugadoresFilter}
          setJugadoresPage={setJugadoresPage}
          mensaje={mensaje}
          mensajeError={mensajeError}
          draftInicial={draftInicial}
          user={user}
          fetchDraftsPC={fetchDraftsPC}
          setMensaje={setMensaje}
          setMensajeError={setMensajeError}
          setSnackbarOpen={setSnackbarOpen}
        />
      )}

      <EditJugadorDialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        jugador={editJugador}
        equipos={equipos}
        onSave={handleSaveJugador}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={mensaje}
        action={
          <Button color="inherit" onClick={() => setSnackbarOpen(false)}>
            Cerrar
          </Button>
        }
      />
    </Box>
  );
}
