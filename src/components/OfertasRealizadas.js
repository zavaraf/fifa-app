import React, { useState } from "react";
import { Grid, Paper, Typography, Button, Box, TextField, CircularProgress } from "@mui/material";

import DrawerOferta from "./DrawerOferta";
import DrawerHistorico from "./DrawerHistorico";
import OfertaCard from "./OfertaCard"; // <-- El nuevo componente para la tarjeta
import SnackbarAlert from "./SnackbarAlert"; // <-- Componente para el Snackbar
import useDraft from "../hooks/useDraft";

// Función auxiliar para manejar llamadas a la API
const handleApiCall = async (apiCall, setLoading, setSnackbar) => {
  setLoading(true);
  try {
    const result = await apiCall();
    if (result === true) {
      setSnackbar({ open: true, message: "Operación realizada con éxito.", severity: "success" });
      return true;
    }
    // Si el API devuelve un string de error
    if (typeof result === "string" && result) {
      setSnackbar({ open: true, message: result, severity: "error" });
      return false;
    }
    // Caso de error genérico
    throw new Error("Error desconocido en la operación.");
  } catch (error) {
    setSnackbar({ open: true, message: error.message || "Ocurrió un error.", severity: "error" });
    return false;
  } finally {
    setLoading(false);
  }
};

export default function OfertasRealizadas({ ofertasFiltradas, loading, fetchDraftsPC, user }) {
  const { updateDraft, getHistorico, confirmDraft } = useDraft();

  // Estado agrupado para el Drawer de Oferta
  const [drawerOferta, setDrawerOferta] = useState({
    open: false,
    oferta: null,
    monto: "",
  });

  // Estado agrupado para el Drawer de Histórico
  const [drawerHistorico, setDrawerHistorico] = useState({
    open: false,
    data: [],
    loading: false,
  });

  // Estado agrupado para el Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [ofertasFilter, setOfertasFilter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdminOrManager = user?.rolesDes?.includes("Admin") || user?.rolesDes?.includes("Manager");
  
  // Lógica de filtrado
  const ofertasFiltradasLocal = ofertasFiltradas.filter(oferta =>
    (oferta.sobrenombre || oferta.nombre || "").toLowerCase().includes(ofertasFilter.toLowerCase()) ||
    (oferta.manager || "").toLowerCase().includes(ofertasFilter.toLowerCase())
  );

  const handleAbrirDrawerOferta = (oferta) => {
    setDrawerOferta({
      open: true,
      oferta,
      monto: oferta.montoOferta?.toString() || "",
    });
  };
  
  const handleAbrirDrawerHistorico = async (oferta) => {
    setDrawerHistorico(prev => ({ ...prev, open: true, loading: true }));
    try {
      const historico = await getHistorico(oferta.id, oferta.idJugador || oferta.id);
      setDrawerHistorico(prev => ({ ...prev, data: Array.isArray(historico) ? historico : [] }));
    } catch {
      setDrawerHistorico(prev => ({ ...prev, data: [] }));
    } finally {
      setDrawerHistorico(prev => ({ ...prev, loading: false }));
    }
  };

  const handleCerrarDrawers = () => {
    setDrawerOferta({ open: false, oferta: null, monto: "" });
    setDrawerHistorico(prev => ({ ...prev, open: false }));
  };

  const handleOfertarDrawer = async () => {
    const { oferta, monto } = drawerOferta;
    if (!oferta || !monto) return;
    
    const apiCall = () => updateDraft({
      idJugador: oferta.id,
      monto: monto.replace(/[^0-9]/g, ""),
      usuario: user?.usuario,
      nombreEquipo: user?.nombreEquipo,
      ofertaInicial: oferta.ofertaFinal,
      idEquipo: user?.idEquipo,
    });

    const success = await handleApiCall(apiCall, setIsSubmitting, setSnackbar);
    if (success) {
      fetchDraftsPC?.();
      handleCerrarDrawers();
    }
  };
  
  const handleConfirmarJugador = async (oferta) => {
    if (!oferta) return;

    const esAdmin = user?.rolesDes?.includes("Admin");
    const idEquipoParaConfirmar = esAdmin ? oferta.idEquipoOferta : user?.idEquipo;

    const apiCall = () => confirmDraft({
      idJugador: oferta.idJugador || oferta.id,
      idEquipo: idEquipoParaConfirmar,
    });

    const success = await handleApiCall(apiCall, setIsSubmitting, setSnackbar);
    if (success) {
      fetchDraftsPC?.();
    }
  };
  
  const renderContent = () => {
    if (loading) {
      return <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />;
    }
    if (ofertasFiltradasLocal.length === 0) {
      return <Typography sx={{ m: 2 }}>No hay ofertas registradas.</Typography>;
    }
    return (
      <Grid container spacing={2} sx={{ width: "100%", m: 0 }}>
        {ofertasFiltradasLocal.map((oferta) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={oferta.id} sx={{ display: "flex" }}>
            <OfertaCard
              oferta={oferta}
              user={user}
              isAdminOrManager={isAdminOrManager}
              onContraofertar={handleAbrirDrawerOferta}
              onVerHistorico={handleAbrirDrawerHistorico}
              onConfirmar={handleConfirmarJugador}
              isSubmitting={isSubmitting}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>Ofertas realizadas</Typography>
        <Button variant="outlined" size="small" onClick={fetchDraftsPC}>Actualizar</Button>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Filtrar por jugador, manager o equipo..."
        value={ofertasFilter}
        onChange={e => setOfertasFilter(e.target.value)}
        sx={{ mb: 2 }}
      />
      
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: { xs: "center", md: "flex-start" } }}>
        {renderContent()}
      </Box>

      <DrawerOferta
        open={drawerOferta.open}
        onClose={handleCerrarDrawers}
        monto={drawerOferta.monto}
        setMonto={(m) => setDrawerOferta(prev => ({ ...prev, monto: m }))}
        ofertaInicial={drawerOferta.oferta?.ofertaFinal}
        onOfertar={handleOfertarDrawer}
        loading={isSubmitting}
      />
      
      <DrawerHistorico
        open={drawerHistorico.open}
        onClose={handleCerrarDrawers}
        historico={drawerHistorico.data}
        loading={drawerHistorico.loading}
        user={user}
      />

      <SnackbarAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      />
    </Paper>
  );
}