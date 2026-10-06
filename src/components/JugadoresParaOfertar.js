import React, { useState } from "react";
import useJugadores from "../hooks/useJugadores";
import {
  Grid,
  Paper,
  Avatar,
  Typography,
  Button,
  Box,
  Link as MuiLink,
  TextField,
} from "@mui/material";
import DrawerOferta from "./DrawerOferta";

export default function JugadoresParaOfertar({
  jugadores,
  jugadoresLoading,
  jugadoresFiltrados,
  paginatedJugadores,
  pageSize,
  jugadoresPage,
  totalPages,
  jugadoresFilter,
  setJugadoresFilter,
  setJugadoresPage,
  mensaje,
  mensajeError,
  draftInicial,
  user,
  fetchDraftsPC,
  setMensaje,
  setMensajeError,
  setSnackbarOpen,
}) {
  // Estado local para el jugador seleccionado y el drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null);
  const [precioSofifa, setPrecioSofifa] = useState(0);
  const { fetchDetallesJugadorSofifa } = useJugadores();

  // Estado local para el monto de la oferta
  const [ofertaInput, setOfertaInput] = useState({});

  // Estado local para el loading del drawer
  const [loadingDrawer, setLoadingDrawer] = useState(false);

  // Mascara visual para el input de monto
  const formatCantidad = (value) => {
    if (!value) return "";
    const num = Number(value.toString().replace(/\D/g, ""));
    return num ? num.toLocaleString("es-MX") : "";
  };

  // Cambia el monto de la oferta para un jugador
  const handleOfertaChange = (jugadorId, value) => {
    const cleanValue = value.replace(/\D/g, "");
    setOfertaInput((prev) => ({
      ...prev,
      [jugadorId]: formatCantidad(cleanValue),
    }));
  };

  // Abre el drawer para ofertar por un jugador
  const handleAbrirDrawer = async (jugador) => {
    setJugadorSeleccionado(jugador);
    let precio = 0;
    if (jugador.idsofifa) {
      try {
        const detalles = await fetchDetallesJugadorSofifa(jugador.idsofifa);
        precio = detalles?.data?.price ? Number(detalles.data.price) : 0;
      } catch (e) {
        precio = 0;
      }
    }
    setPrecioSofifa(precio);
    setOfertaInput((prev) => ({
      ...prev,
      [jugador.id || jugador.nombreCompleto]: precio ? precio.toLocaleString("es-MX") : "0",
    }));
    setDrawerOpen(true);
  };

  // Cierra el drawer
  const handleCerrarDrawer = () => {
    setDrawerOpen(false);
    setJugadorSeleccionado(null);
  };

  // Lógica para ofertar desde el Drawer
  const handleOfertarDrawer = async () => {
    if (!jugadorSeleccionado) return;
    const monto = (ofertaInput[jugadorSeleccionado.id || jugadorSeleccionado.nombreCompleto] || "").replace(/[^0-9]/g, "");
    if (!monto) return;
    setLoadingDrawer(true);
    const result = await draftInicial({
      idJugador: jugadorSeleccionado.id,
      monto,
      usuario: user?.usuario || user?.nombreUsuario || user?.username || user?.nombre || "usuario",
      nombreEquipo: user?.nombreEquipo || "Equipo",
      idEquipo: user?.idEquipo,
      idTemporada: user?.idTemporada,
    });
    setLoadingDrawer(false);
    setOfertaInput((prev) => ({
      ...prev,
      [jugadorSeleccionado.id || jugadorSeleccionado.nombreCompleto]: "",
    }));
    setDrawerOpen(false);
    setJugadorSeleccionado(null);
    if (result === true) {
      setMensaje && setMensaje("Oferta enviada correctamente.");
      setMensajeError && setMensajeError(false);
      setSnackbarOpen && setSnackbarOpen(true);
      fetchDraftsPC && fetchDraftsPC();
    } else if (typeof result === "string") {
      setMensaje && setMensaje(result);
      setMensajeError && setMensajeError(true);
      setSnackbarOpen && setSnackbarOpen(true);
      return;
    } else {
      setMensaje && setMensaje("Error al enviar la oferta.");
      setMensajeError && setMensajeError(true);
      setSnackbarOpen && setSnackbarOpen(true);
      return;
    }
    setTimeout(() => setMensaje && setMensaje(""), 3000);
  };

  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Jugadores disponibles para ofertar
      </Typography>
      {mensaje && (
        <Box sx={{ mb: 2 }}>
          <Typography color={mensajeError ? "error" : "success.main"}>{mensaje}</Typography>
        </Box>
      )}
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Buscar por nombre, idsofifa o link"
          value={jugadoresFilter}
          onChange={e => {
            setJugadoresFilter(e.target.value);
            setJugadoresPage(0);
          }}
          size="small"
          fullWidth
        />
      </Box>
      <Box component="form">
        {jugadoresLoading ? (
          <Typography sx={{ m: 2 }}>Cargando jugadores...</Typography>
        ) : jugadoresFiltrados.length === 0 ? (
          <Typography sx={{ m: 2 }}>No hay jugadores disponibles.</Typography>
        ) : (
          <Grid container spacing={2}>
            {paginatedJugadores.map((jugador) => (
              <Grid item xs={12} md={12} key={jugador.id || jugador.nombreCompleto}>
                <Paper
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    borderRadius: 2,
                    boxShadow: 2,
                    transition: "box-shadow 0.2s",
                    height: "100%",
                    justifyContent: "space-between",
                    "&:hover": {
                      boxShadow: 6,
                      backgroundColor: "rgba(0,0,0,0.03)"
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <Avatar
                        src={jugador.img}
                        alt={jugador.nombreCompleto}
                        imgProps={{ referrerPolicy: "no-referrer" }}
                        sx={{
                          width: 56,
                          height: 56,
                          border: "2px solid #1976d2",
                          mr: 2,
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: "success.main",
                          fontWeight: 700,
                          textAlign: "center",
                          display: "block",
                          mt: 0.5,
                          fontSize: 13,
                        }}
                      >
                        {jugador.raiting ? `★ ${jugador.raiting}` : ""}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                      <Typography
                        fontWeight={700}
                        fontSize={18}
                        noWrap
                        title={jugador.nombreCompleto}
                        sx={{ maxWidth: 220, display: "inline-block" }}
                      >
                        {jugador.nombreCompleto.length > 15
                          ? jugador.nombreCompleto.slice(0, 15) + "…"
                          : jugador.nombreCompleto}
                      </Typography>
                      <MuiLink
                        href={jugador.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                        fontSize={14}
                        sx={{ display: "block", color: "primary.main", mb: 0.5, wordBreak: "break-all" }}
                      >
                        Ver Sofifa
                      </MuiLink>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        Equipo: <b>{jugador.equipo?.nombre}</b>
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
                      {(user?.rolesDes?.includes("Admin") || user?.rolesDes?.includes("Manager")) && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleAbrirDrawer(jugador)}
                          sx={{
                            fontWeight: 700,
                            borderRadius: 2,
                            minWidth: 100,
                            ml: 2,
                          }}
                        >
                          Ofertar
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
        {jugadoresFiltrados.length > pageSize && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 2 }}>
            <Button
              variant="outlined"
              size="small"
              disabled={jugadoresPage === 0}
              onClick={() => setJugadoresPage((p) => Math.max(0, p - 1))}
            >
              Anterior
            </Button>
            <Typography sx={{ alignSelf: "center" }}>
              Página {jugadoresPage + 1} de {totalPages}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              disabled={jugadoresPage >= totalPages - 1}
              onClick={() => setJugadoresPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              Siguiente
            </Button>
          </Box>
        )}
      </Box>
      {/* Renderiza el DrawerOferta */}
      <DrawerOferta
        open={drawerOpen}
        onClose={handleCerrarDrawer}
        monto={ofertaInput[jugadorSeleccionado?.id || jugadorSeleccionado?.nombreCompleto] || ""}
        setMonto={valor => setOfertaInput(prev => ({
          ...prev,
          [jugadorSeleccionado?.id || jugadorSeleccionado?.nombreCompleto]: valor
        }))}
        equipo={jugadorSeleccionado?.equipo || {}}
        manager={user?.usuario || user?.nombreUsuario || user?.username || user?.nombre || "usuario"}
        onOfertar={handleOfertarDrawer}
        loading={loadingDrawer}
        precioSofifa={precioSofifa}
      />
    </Paper>
  );
}
