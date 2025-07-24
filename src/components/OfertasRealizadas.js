import React, { useState } from "react";
import {
  Grid,
  Paper,
  Avatar,
  Typography,
  Button,
  Box,
  Link as MuiLink,
  Snackbar,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { CheckCircle } from "@mui/icons-material";
import DrawerOferta from "./DrawerOferta";
import useDraft from "../hooks/useDraft";
import DrawerHistorico from "./DrawerHistorico"; // <-- Importa el DrawerHistorico

export default function OfertasRealizadas({
  ofertasFiltradas,
  loading,
  handleActualizarDrafts,
  user,
  fetchDraftsPC,
  setMensaje,
  setMensajeError,
  mensaje,
  mensajeError,
}) {
  const { updateDraft, getHistorico, confirmDraft } = useDraft();

  // Estado local para el drawer y la oferta seleccionada
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState(null);
  const [drawerMonto, setDrawerMonto] = useState("");
  const [loadingDrawer, setLoadingDrawer] = useState(false);

  // Estado local para Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarErr, setSnackbarErr] = useState(false);

  // Filtro local para ofertas
  const [ofertasFilter, setOfertasFilter] = useState("");

  // DrawerHistorico state
  const [drawerHistoricoOpen, setDrawerHistoricoOpen] = useState(false);
  const [historicoData, setHistoricoData] = useState([]);
  const [historicoLoading, setHistoricoLoading] = useState(false);

  // Filtrar las ofertas según el filtro local
  const ofertasFiltradasLocal = ofertasFiltradas.filter(oferta =>
    (oferta.sobrenombre || oferta.nombre || "").toLowerCase().includes(ofertasFilter.toLowerCase()) ||
    (oferta.manager || "").toLowerCase().includes(ofertasFilter.toLowerCase()) ||
    (oferta.comentarios || "").toLowerCase().includes(ofertasFilter.toLowerCase())
  );

  // Abrir Drawer con la oferta seleccionada
  const handleAbrirDrawerOferta = (oferta) => {
    setOfertaSeleccionada(oferta);
    setDrawerMonto(oferta.montoOferta?.toString() || "");
    setDrawerOpen(true);
  };

  // Abrir DrawerHistorico y consumir getHistorico
  const handleAbrirDrawerHistorico = async (oferta) => {
    setHistoricoLoading(true);
    setDrawerHistoricoOpen(true);
    try {
      const historico = await getHistorico(oferta.id, oferta.idJugador || oferta.idJugador || oferta.id);
      setHistoricoData(Array.isArray(historico) ? historico : []);
    } catch {
      setHistoricoData([]);
    }
    setHistoricoLoading(false);
  };

  // Cerrar Drawer
  const handleCerrarDrawer = () => {
    setDrawerOpen(false);
    setOfertaSeleccionada(null);
    setDrawerMonto("");
  };

  // Lógica para contraofertar desde el Drawer
  const handleOfertarDrawer = async () => {
    if (!ofertaSeleccionada) return;
    const monto = drawerMonto.replace(/[^0-9]/g, "");
    if (!monto) return;
    setLoadingDrawer(true);
    const result = await updateDraft({
      idJugador: ofertaSeleccionada.id,
      monto,
      usuario: user?.usuario || user?.nombreUsuario || user?.username || user?.nombre || user?.name || "usuario",
      nombreEquipo: user?.nombreEquipo || "Equipo",
      ofertaInicial: ofertaSeleccionada.ofertaFinal,
      idEquipo: user?.idEquipo,
    });
    setLoadingDrawer(false);
    setDrawerOpen(false);
    setOfertaSeleccionada(null);
    setDrawerMonto("");
    // Mostrar mensaje en Snackbar local
    if (result === true) {
      setSnackbarMsg("Contraoferta enviada correctamente.");
      setSnackbarErr(false);
      setSnackbarOpen(true);
      fetchDraftsPC && fetchDraftsPC();
      setMensaje && setMensaje("Contraoferta enviada correctamente.");
      setMensajeError && setMensajeError(false);
    } else if (typeof result === "string" && result) {
      setSnackbarMsg(result);
      setSnackbarErr(true);
      setSnackbarOpen(true);
      setMensaje && setMensaje(result);
      setMensajeError && setMensajeError(true);
    } else {
      setSnackbarMsg("Error al enviar la contraoferta.");
      setSnackbarErr(true);
      setSnackbarOpen(true);
      setMensaje && setMensaje("Error al enviar la contraoferta.");
      setMensajeError && setMensajeError(true);
    }
    setTimeout(() => setMensaje && setMensaje(""), 3000);
  };

  // Lógica para confirmar jugador
  const handleConfirmarJugador = async (oferta) => {
    if (!oferta) return;
    setLoadingDrawer(true);
    
    // Si es administrador, usar el equipo de la oferta, sino usar el equipo del usuario
    const esAdministrador = user?.rolesDes?.includes("Admin");
    const idEquipoParaConfirmar = esAdministrador ? oferta.idEquipoOferta : user?.idEquipo;
    
    const result = await confirmDraft({
      idJugador: oferta.idJugador || oferta.id,
      idEquipo: idEquipoParaConfirmar,
    });
    setLoadingDrawer(false);
    
    // Mostrar mensaje en Snackbar local
    if (result === true) {
      setSnackbarMsg("Jugador confirmado correctamente.");
      setSnackbarErr(false);
      setSnackbarOpen(true);
      fetchDraftsPC && fetchDraftsPC();
      setMensaje && setMensaje("Jugador confirmado correctamente.");
      setMensajeError && setMensajeError(false);
    } else if (typeof result === "string" && result) {
      setSnackbarMsg(result);
      setSnackbarErr(true);
      setSnackbarOpen(true);
      setMensaje && setMensaje(result);
      setMensajeError && setMensajeError(true);
    } else {
      setSnackbarMsg("Error al confirmar el jugador.");
      setSnackbarErr(true);
      setSnackbarOpen(true);
      setMensaje && setMensaje("Error al confirmar el jugador.");
      setMensajeError && setMensajeError(true);
    }
    setTimeout(() => setMensaje && setMensaje(""), 3000);
  };

  // Función para verificar si han pasado 2 horas desde la oferta
  const puedeConfirmar = (fechaOferta) => {
    if (!fechaOferta) return false;
    
    const ahora = new Date();
    const fechaOfertaDate = new Date(fechaOferta);
    
    // Convertir a zona horaria de Ciudad de México (UTC-6)
    const ahoraMexico = new Date(ahora.toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
    const fechaOfertaMexico = new Date(fechaOfertaDate.toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
    
    // Calcular diferencia en milisegundos
    const diferencia = ahoraMexico.getTime() - fechaOfertaMexico.getTime();
    const dosHorasEnMs = 2 * 60 * 60 * 1000; // 2 horas en milisegundos
    
    return diferencia >= dosHorasEnMs;
  };

  // Función para verificar si el usuario puede confirmar la oferta
  const puedeConfirmarOferta = (oferta) => {
    if (!oferta) return false;
    
    // Verificar si ya está confirmado
    const yaConfirmado = oferta.equipo?.id && oferta.idEquipoOferta && 
                        parseInt(oferta.equipo.id) === parseInt(oferta.idEquipoOferta);
    if (yaConfirmado) return false;
    
    // Verificar si es administrador o si es el equipo que hizo la oferta
    const esAdministrador = user?.rolesDes?.includes("Admin");
    const esEquipoOfertante = user?.idEquipo && oferta.idEquipoOferta && 
                             parseInt(user.idEquipo) === parseInt(oferta.idEquipoOferta);
    
    return esAdministrador || esEquipoOfertante;
  };

  // Función para verificar si la oferta ya está confirmada
  const estaConfirmado = (oferta) => {
    return oferta.equipo?.id && oferta.idEquipoOferta && 
           parseInt(oferta.equipo.id) === parseInt(oferta.idEquipoOferta);
  };

  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant="outlined" size="small" onClick={handleActualizarDrafts}>
          Actualizar Ofertas
        </Button>
      </Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Ofertas realizadas
      </Typography>
      {/* Filtro de ofertas */}
      <Box sx={{ mb: 2 }}>
        <input
          type="text"
          placeholder="Filtrar por jugador, manager o comentario"
          value={ofertasFilter}
          onChange={e => setOfertasFilter(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: 4,
            border: "1px solid #ccc",
            fontSize: 16,
            boxSizing: "border-box"
          }}
        />
      </Box>
      {/* Mostrar mensaje de éxito o error */}
      {(typeof mensaje === "string" && mensaje) && (
        <Box sx={{ mb: 2 }}>
          <Typography color={mensajeError ? "error" : "success.main"}>
            {mensaje}
          </Typography>
        </Box>
      )}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: { xs: "center", md: "flex-start" },
          maxWidth: 1200,
          mx: "auto",
        }}
      >
        {loading ? (
          <Typography sx={{ m: 2 }}>Cargando...</Typography>
        ) : ofertasFiltradasLocal.length === 0 ? (
          <Typography sx={{ m: 2 }}>No hay ofertas registradas.</Typography>
        ) : (
          <Grid container spacing={2} sx={{ width: "100%", m: 0 }}>
            {ofertasFiltradasLocal.map((oferta) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={oferta.id} sx={{ display: "flex" }}>
                <Paper
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    width: "100%",
                    minWidth: 0,
                    boxShadow: 3,
                    backgroundColor: theme => theme.palette.mode === "dark" ? theme.palette.background.paper : "#f9f9f9",
                    border: theme => theme.palette.mode === "dark" ? "1px solid #333" : "1px solid #e0e0e0",
                    transition: "box-shadow 0.2s",
                    "&:hover": {
                      boxShadow: 8,
                      backgroundColor: theme => theme.palette.mode === "dark" ? "#23292f" : "#f1f8e9"
                    },
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  <Avatar
                    src={oferta.img}
                    alt={oferta.nombre}
                    sx={{
                      width: 64,
                      height: 64,
                      border: "2px solid #1976d2",
                      mr: { sm: 2 },
                      mb: { xs: 1, sm: 0 }
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={700} fontSize={18} noWrap title={oferta.sobrenombre || oferta.nombre}>
                      {(oferta.sobrenombre || oferta.nombre)?.length > 18
                        ? (oferta.sobrenombre || oferta.nombre).slice(0, 18) + "…"
                        : oferta.sobrenombre || oferta.nombre}
                    </Typography>
                    <MuiLink
                      href={oferta.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                      fontSize={14}
                      sx={{ display: "block", color: "primary.main", mb: 0.5, wordBreak: "break-all" }}
                    >
                      Ver Sofifa
                    </MuiLink>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      Usuario: <b>{oferta.manager}</b>
                    </Typography>
                    <Typography variant="body2" color="success.main" fontWeight={700}>
                      Oferta inicial: ${oferta.montoOferta?.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="info.main" fontWeight={700}>
                      Oferta final: ${oferta.ofertaFinal?.toLocaleString()}
                    </Typography>
                    {estaConfirmado(oferta) && (
                      <Typography variant="body2" color="success.main" fontWeight={700} sx={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 0.5,
                        mt: 0.5 
                      }}>
                        <CheckCircle sx={{ fontSize: 16 }} />
                        Confirmado
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ textAlign: "center", minWidth: 110, display: "flex", flexDirection: "column", gap: 1 }}>
                    <MuiLink
                      component={RouterLink}
                      to={`/equipo/${oferta.idEquipoOferta}`}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        color: "primary.main",
                        fontWeight: 600,
                        textDecoration: "none",
                        maxWidth: 120,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        "&:hover": { textDecoration: "underline", color: "primary.dark" },
                        mb: 1
                      }}
                    >
                      <Avatar src={oferta.equipo?.img} alt={oferta.comentarios} sx={{ width: 32, height: 32 }} />
                      <span style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "inline-block",
                        maxWidth: 80
                      }}>
                        {oferta.comentarios}
                      </span>
                    </MuiLink>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        borderRadius: 2,
                        fontWeight: 700,
                        color: "secondary.main",
                        borderColor: "secondary.main",
                        "&:hover": { borderColor: "secondary.dark", color: "secondary.dark" }
                      }}
                      onClick={() => handleAbrirDrawerOferta(oferta)}
                    >
                      Contraofertar
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        borderRadius: 2,
                        fontWeight: 700,
                        color: "primary.main",
                        borderColor: "primary.main",
                        "&:hover": { borderColor: "primary.dark", color: "primary.dark" }
                      }}
                      onClick={() => handleAbrirDrawerHistorico(oferta)}
                    >
                      Ver Histórico
                    </Button>
                    {!estaConfirmado(oferta) && puedeConfirmarOferta(oferta) && (
                      <Tooltip title="Confirmar jugador">
                        <IconButton
                          color="success"
                          onClick={() => handleConfirmarJugador(oferta)}
                          disabled={loadingDrawer}
                          sx={{
                            "&:hover": { 
                              backgroundColor: "success.light",
                              transform: "scale(1.1)"
                            },
                            transition: "all 0.2s"
                          }}
                        >
                          <CheckCircle />
                        </IconButton>
                      </Tooltip>
                    )}
                    {estaConfirmado(oferta) && (
                      <Box sx={{ 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        gap: 0.5,
                        color: "success.main",
                        fontWeight: 600,
                        fontSize: 14
                      }}>
                        <CheckCircle sx={{ fontSize: 20 }} />
                        Confirmado
                      </Box>
                    )}
                  </Box>
                  <Box
                    sx={{
                      width: "100%",
                      mt: 2,
                      pt: 1,
                      borderTop: "1px solid",
                      borderColor: "divider",
                      textAlign: "right",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {oferta.fechaOferta
                        ? new Date(oferta.fechaOferta).toLocaleString()
                        : oferta.fecha
                        ? new Date(oferta.fecha).toLocaleString()
                        : ""}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      {/* Drawer para contraofertar */}
      <DrawerOferta
        open={drawerOpen}
        onClose={handleCerrarDrawer}
        monto={drawerMonto}
        setMonto={setDrawerMonto}
        equipo={ofertaSeleccionada?.equipo || {}}
        manager={user?.usuario || user?.nombreUsuario || user?.username || user?.nombre || "usuario"}
        onOfertar={handleOfertarDrawer}
        loading={loadingDrawer}
        ofertaInicial={ofertaSeleccionada?.ofertaFinal}
      />
      {/* Drawer para histórico */}
      <DrawerHistorico
        open={drawerHistoricoOpen}
        onClose={() => setDrawerHistoricoOpen(false)}
        historico={historicoData}
        user={user}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMsg}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        ContentProps={{
          sx: { backgroundColor: snackbarErr ? "#d32f2f" : "#388e3c", color: "#fff", fontWeight: 600 }
        }}
      />
    </Paper>
  );
}