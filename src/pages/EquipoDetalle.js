import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  Avatar,
  Grid,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  useMediaQuery,
  useTheme,
  TextField,
  Button,
  Drawer,
  IconButton,
  Autocomplete,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Fab,
  Alert,
} from "@mui/material";
import { Add as AddIcon, Close as CloseIcon } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import useEquipos from "../hooks/useEquipos";
import TablaJugadores from "../components/TablaJugadores";
import EditJugadorDialog from "../components/EditJugadorDialog";
import PublicacionesTab from "../components/PublicacionesTab";
import { AuthContext } from "../context/AuthContext";

export default function EquipoDetalle() {
  const { id } = useParams();
  const { fetchEquipoById, actualizarPresupuestoInicial, fetchCatalogoFinanzas, catalogoFinanzas, guardarConceptoFinanciero } = useEquipos();
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Estados principales
  const [equipo, setEquipo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  // Estados para jugadores
  const [editJugador, setEditJugador] = useState(null);
  const [openEditJugador, setOpenEditJugador] = useState(false);
  const [searchJugador, setSearchJugador] = useState("");
  const [jugadoresPage, setJugadoresPage] = useState(0);

  // Estados para presupuesto
  const [nuevoPresupuesto, setNuevoPresupuesto] = useState("");
  const [presupuestoLoading, setPresupuestoLoading] = useState(false);

  // Estados para el drawer de conceptos financieros
  const [openDrawerFinanzas, setOpenDrawerFinanzas] = useState(false);
  const [conceptoFinanciero, setConceptoFinanciero] = useState(null);
  const [montoConcepto, setMontoConcepto] = useState("");
  const [savingConcepto, setSavingConcepto] = useState(false);
  const [mensajeConcepto, setMensajeConcepto] = useState({ tipo: "", mensaje: "" });

  // Verificaciones de permisos
  const isAdmin = user?.rolesDes?.includes("Admin");
  const isUserTeam = parseInt(user?.idEquipo) === parseInt(id);
  const canEditJugadores = isAdmin || isUserTeam;

  // Constantes
  const pageSize = 30;

  // Datos calculados
  const filteredJugadores = (equipo?.jugadores || []).filter(
    (j) =>
      (j.sobrenombre?.toLowerCase() || "").includes(searchJugador.toLowerCase()) ||
      (j.nombreCompleto?.toLowerCase() || "").includes(searchJugador.toLowerCase())
  ).sort((a, b) => (Number(b.raiting) || 0) - (Number(a.raiting) || 0)); // Ordenar por rating descendente

  const totalJugadoresPages = Math.ceil(filteredJugadores.length / pageSize);
  const paginatedJugadores = filteredJugadores.slice(
    jugadoresPage * pageSize,
    jugadoresPage * pageSize + pageSize
  );

  // Funciones utilitarias
  const formatCurrency = (value) => {
    if (!value) return "";
    const number = Number(value.toString().replace(/[^0-9]/g, ""));
    return number.toLocaleString("es-MX");
  };

  // Handlers de eventos
  const handlePresupuestoChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setNuevoPresupuesto(raw);
  };

  const handleActualizarPresupuesto = async () => {
    if (!nuevoPresupuesto || isNaN(Number(nuevoPresupuesto))) return;
    setPresupuestoLoading(true);
    
    try {
      await actualizarPresupuestoInicial(
        Number(nuevoPresupuesto),
        equipo.temporada?.id || equipo.temporadaId || equipo.idTemporada || equipo.temporada_id || id,
        equipo
      );
      const data = await fetchEquipoById(id);
      setEquipo(data);
      setNuevoPresupuesto("");
    } catch (error) {
      console.error("Error al actualizar presupuesto:", error);
    } finally {
      setPresupuestoLoading(false);
    }
  };

  const handleActualizarSumaPresupuesto = async () => {
    const presupuestoActual = equipo?.datosFinancieros?.presupuestoInicial;
    if (!presupuestoActual || isNaN(Number(presupuestoActual))) return;
    setPresupuestoLoading(true);
    
    try {
      await actualizarPresupuestoInicial(
        Number(presupuestoActual),
        equipo.temporada?.id || equipo.temporadaId || equipo.idTemporada || equipo.temporada_id || id,
        equipo
      );
      const data = await fetchEquipoById(id);
      setEquipo(data);
      setNuevoPresupuesto("");
    } catch (error) {
      console.error("Error al actualizar suma presupuesto:", error);
    } finally {
      setPresupuestoLoading(false);
    }
  };

  const handleEditJugador = (jugador) => {
    if (!canEditJugadores) return;
    setEditJugador(jugador);
    setOpenEditJugador(true);
  };

  const handleCloseEditJugador = () => {
    setOpenEditJugador(false);
    setEditJugador(null);
  };

  const handleSearchJugador = (e) => {
    setSearchJugador(e.target.value);
    setJugadoresPage(0);
  };

  // Handlers para el drawer de conceptos financieros
  const handleOpenDrawerFinanzas = () => {
    setOpenDrawerFinanzas(true);
    setMensajeConcepto({ tipo: "", mensaje: "" });
  };

  const handleCloseDrawerFinanzas = () => {
    setOpenDrawerFinanzas(false);
    setConceptoFinanciero(null);
    setMontoConcepto("");
    setMensajeConcepto({ tipo: "", mensaje: "" });
  };

  const handleMontoConceptoChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setMontoConcepto(raw);
  };

  const handleSaveConceptoFinanciero = async () => {
    if (!conceptoFinanciero || !montoConcepto) return;
    
    setSavingConcepto(true);
    setMensajeConcepto({ tipo: "", mensaje: "" });
    
    try {
      const conceptoData = {
        idConcepto: conceptoFinanciero.id,
        monto: Number(montoConcepto),
        equipo: equipo
      };
      
      await guardarConceptoFinanciero(conceptoData);
      
      // Mostrar mensaje de éxito
      setMensajeConcepto({ tipo: "success", mensaje: "Concepto financiero guardado exitosamente" });
      
      // Recargar datos del equipo después de guardar
      const data = await fetchEquipoById(id);
      setEquipo(data);
      
      // Cerrar drawer después de un breve delay para mostrar el mensaje
      setTimeout(() => {
        handleCloseDrawerFinanzas();
      }, 1500);
    } catch (error) {
      console.error("Error al guardar concepto financiero:", error);
      setMensajeConcepto({ tipo: "error", mensaje: "Error al guardar el concepto financiero. Intente nuevamente." });
    } finally {
      setSavingConcepto(false);
    }
  };

  // Effects
  useEffect(() => {
    const loadEquipo = async () => {
      setLoading(true);
      try {
        const data = await fetchEquipoById(id);
        setEquipo(data);
      } catch (error) {
        console.error("Error al cargar equipo:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) loadEquipo();
  }, [id, fetchEquipoById]);

  // Cargar catálogo de finanzas
  useEffect(() => {
    fetchCatalogoFinanzas();
  }, [fetchCatalogoFinanzas]);

  // Estados de carga y error
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (!equipo) {
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <Typography variant="h6" color="error">
          No se encontró el equipo.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", mt: 3, p: { xs: 1, md: 3 } }}>
      {/* Header del equipo */}
      <EquipoHeader equipo={equipo} />

      {/* Navegación por pestañas */}
      <TabNavigation tab={tab} setTab={setTab} isMobile={isMobile} />

      {/* Contenido de las pestañas */}
      <TabContent
        tab={tab}
        equipo={equipo}
        // Props para jugadores
        searchJugador={searchJugador}
        handleSearchJugador={handleSearchJugador}
        paginatedJugadores={paginatedJugadores}
        canEditJugadores={canEditJugadores}
        handleEditJugador={handleEditJugador}
        jugadoresPage={jugadoresPage}
        setJugadoresPage={setJugadoresPage}
        totalJugadoresPages={totalJugadoresPages}
        filteredJugadores={filteredJugadores}
        pageSize={pageSize}
        openEditJugador={openEditJugador}
        handleCloseEditJugador={handleCloseEditJugador}
        editJugador={editJugador}
        // Props para finanzas
        isAdmin={isAdmin}
        nuevoPresupuesto={nuevoPresupuesto}
        formatCurrency={formatCurrency}
        handlePresupuestoChange={handlePresupuestoChange}
        presupuestoLoading={presupuestoLoading}
        handleActualizarPresupuesto={handleActualizarPresupuesto}
        handleActualizarSumaPresupuesto={handleActualizarSumaPresupuesto}
        // Props para drawer finanzas
        openDrawerFinanzas={openDrawerFinanzas}
        handleOpenDrawerFinanzas={handleOpenDrawerFinanzas}
        handleCloseDrawerFinanzas={handleCloseDrawerFinanzas}
        conceptoFinanciero={conceptoFinanciero}
        setConceptoFinanciero={setConceptoFinanciero}
        montoConcepto={montoConcepto}
        handleMontoConceptoChange={handleMontoConceptoChange}
        handleSaveConceptoFinanciero={handleSaveConceptoFinanciero}
        savingConcepto={savingConcepto}
        catalogoFinanzas={catalogoFinanzas}
        mensajeConcepto={mensajeConcepto}
      />
    </Box>
  );
}

// Componentes separados para mejor organización
const EquipoHeader = ({ equipo }) => (
  <Paper
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      p: { xs: 2, md: 3 },
      mb: 3,
      flexDirection: { xs: "column", sm: "row" },
    }}
  >
    <Avatar
      src={equipo.img}
      alt={equipo.nombre}
      sx={{ width: 72, height: 72, bgcolor: "grey.100", border: "2px solid #eee" }}
    />
    <Box sx={{ flex: 1 }}>
      <Typography variant="h4" fontWeight={700}>
        {equipo.nombre}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        {equipo.descripcion}
      </Typography>
      <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body2">
          Ver en SoFIFA:
        </Typography>
        <Typography 
          variant="body2" 
          component="a"
          href={equipo.linksofifa}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: "primary.main",
            textDecoration: "none",
            fontWeight: 600,
            "&:hover": {
              textDecoration: "underline",
              color: "primary.dark"
            }
          }}
        >
          {equipo.linksofifa ? "Ver equipo" : "No disponible"}
        </Typography>
      </Box>
    </Box>
  </Paper>
);

const TabNavigation = ({ tab, setTab, isMobile }) => (
  <Paper sx={{ mb: 2, borderRadius: 2 }}>
    <Tabs
      value={tab}
      onChange={(_, v) => setTab(v)}
      variant={isMobile ? "scrollable" : "standard"}
      scrollButtons={isMobile ? "auto" : false}
      sx={{
        ".MuiTab-root": { fontWeight: 600, fontSize: 16, textTransform: "none" },
        ".MuiTabs-indicator": { backgroundColor: "primary.main", height: 4, borderRadius: 2 },
      }}
    >
      <Tab label="Jugadores" />
      <Tab label="Finanzas" />
      <Tab label="Movimientos" />
      <Tab label="Publicaciones" />
    </Tabs>
  </Paper>
);

const TabContent = ({ tab, ...props }) => {
  switch (tab) {
    case 0:
      return <JugadoresTab {...props} />;
    case 1:
      return <FinanzasTab {...props} />;
    case 2:
      return <MovimientosTab {...props} />;
    case 3:
      return <PublicacionesTab equipo={props.equipo} />;
    default:
      return null;
  }
};

// Componentes de cada pestaña
const JugadoresTab = ({ 
  searchJugador, 
  handleSearchJugador, 
  paginatedJugadores, 
  canEditJugadores, 
  handleEditJugador,
  jugadoresPage,
  setJugadoresPage,
  totalJugadoresPages,
  filteredJugadores,
  pageSize,
  openEditJugador,
  handleCloseEditJugador,
  editJugador
}) => (
  <Paper sx={{ p: { xs: 1, md: 3 }, mb: 2, borderRadius: 2 }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
      <Typography variant="h6" fontWeight={700}>
        Jugadores del equipo
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
        Total: {filteredJugadores.length} jugadores
      </Typography>
    </Box>
    
    {/* Buscador */}
    <Box sx={{ mb: 2 }}>
      <input
        type="text"
        placeholder="Buscar jugador"
        value={searchJugador}
        onChange={handleSearchJugador}
        style={{
          width: "100%",
          padding: "8px 12px",
          borderRadius: 6,
          border: "1px solid #ccc",
          fontSize: 16,
          marginBottom: 8,
          outline: "none",
        }}
      />
    </Box>

    {/* Tabla de jugadores */}
    <TablaJugadores
      jugadores={paginatedJugadores}
      loading={false}
      onEdit={canEditJugadores ? handleEditJugador : () => {}}
    />

    {/* Paginación */}
    {filteredJugadores.length > pageSize && (
      <PaginationControls
        jugadoresPage={jugadoresPage}
        setJugadoresPage={setJugadoresPage}
        totalJugadoresPages={totalJugadoresPages}
      />
    )}

    {/* Dialog de edición */}
    <EditJugadorDialog
      open={openEditJugador}
      onClose={handleCloseEditJugador}
      jugador={editJugador}
      equipos={[]}
      onSave={handleCloseEditJugador}
    />
  </Paper>
);

const PaginationControls = ({ jugadoresPage, setJugadoresPage, totalJugadoresPages }) => (
  <Box sx={{ display: "flex", justifyContent: "center", mt: 2, gap: 2 }}>
    <Button
      variant="outlined"
      size="small"
      disabled={jugadoresPage === 0}
      onClick={() => setJugadoresPage((p) => Math.max(0, p - 1))}
    >
      Anterior
    </Button>
    <Typography sx={{ alignSelf: "center" }}>
      Página {jugadoresPage + 1} de {totalJugadoresPages}
    </Typography>
    <Button
      variant="outlined"
      size="small"
      disabled={jugadoresPage >= totalJugadoresPages - 1}
      onClick={() => setJugadoresPage((p) => Math.min(totalJugadoresPages - 1, p + 1))}
    >
      Siguiente
    </Button>
  </Box>
);

const FinanzasTab = ({ 
  equipo, 
  isAdmin, 
  nuevoPresupuesto, 
  formatCurrency, 
  handlePresupuestoChange, 
  presupuestoLoading, 
  handleActualizarPresupuesto, 
  handleActualizarSumaPresupuesto,
  // Props para drawer finanzas
  openDrawerFinanzas,
  handleOpenDrawerFinanzas,
  handleCloseDrawerFinanzas,
  conceptoFinanciero,
  setConceptoFinanciero,
  montoConcepto,
  handleMontoConceptoChange,
  handleSaveConceptoFinanciero,
  savingConcepto,
  catalogoFinanzas,
  mensajeConcepto
}) => (
  <Box sx={{ position: "relative" }}>
    <Paper sx={{ p: { xs: 1, md: 3 }, mb: 2, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
        Datos Financieros
      </Typography>
    
    {/* Resumen financiero compacto */}
    <Paper 
      elevation={1} 
      sx={{ 
        p: { xs: 1.5, sm: 2 }, 
        mb: 2, 
        borderRadius: 2,
        background: "linear-gradient(135deg, rgba(33, 150, 243, 0.03), rgba(76, 175, 80, 0.03))"
      }}
    >
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, fontSize: { xs: 16, sm: 18 } }}>
        Resumen Financiero
      </Typography>
      
      <Grid container spacing={{ xs: 1, sm: 2 }}>
        <Grid item xs={6} sm={3}>
          <Box sx={{ textAlign: "center", p: 1 }}>
            <Typography variant="caption" color="primary.main" fontWeight={600} sx={{ textTransform: "uppercase", fontSize: { xs: 10, sm: 11 } }}>
              Inicial
            </Typography>
            <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ fontSize: { xs: 14, sm: 16 } }}>
              ${equipo.datosFinancieros?.presupuestoInicial?.toLocaleString() ?? "-"}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Box sx={{ textAlign: "center", p: 1 }}>
            <Typography variant="caption" color="success.main" fontWeight={600} sx={{ textTransform: "uppercase", fontSize: { xs: 10, sm: 11 } }}>
              Actual
            </Typography>
            <Typography variant="h6" fontWeight={700} color="success.main" sx={{ fontSize: { xs: 14, sm: 16 } }}>
              ${equipo.datosFinancieros?.presupuestoFinal?.toLocaleString() ?? "-"}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Box sx={{ textAlign: "center", p: 1 }}>
            <Typography variant="caption" color="warning.main" fontWeight={600} sx={{ textTransform: "uppercase", fontSize: { xs: 10, sm: 11 } }}>
              Nómina
            </Typography>
            <Typography variant="h6" fontWeight={700} color="warning.main" sx={{ fontSize: { xs: 14, sm: 16 } }}>
              ${equipo.salarios?.toLocaleString() ?? "-"}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Box sx={{ textAlign: "center", p: 1 }}>
            <Typography variant="caption" color={(equipo.datosFinancieros?.presupuestoFinal || 0) >= 0 ? "success.main" : "error.main"} fontWeight={600} sx={{ textTransform: "uppercase", fontSize: { xs: 10, sm: 11 } }}>
              Balance
            </Typography>
            <Typography variant="h6" fontWeight={700} color={(equipo.datosFinancieros?.presupuestoFinal || 0) >= 0 ? "success.main" : "error.main"} sx={{ fontSize: { xs: 14, sm: 16 } }}>
              ${((equipo.datosFinancieros?.presupuestoFinal || 0) - (equipo.datosFinancieros?.presupuestoInicial || 0)).toLocaleString()}
            </Typography>
          </Box>
        </Grid>
      </Grid>
      
      {/* Barra de progreso integrada */}
      <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: 11, sm: 12 } }}>
            Estado del Presupuesto
          </Typography>
          <Typography variant="caption" color={(equipo.datosFinancieros?.presupuestoFinal || 0) >= 0 ? "success.main" : "error.main"} fontWeight={600} sx={{ fontSize: { xs: 11, sm: 12 } }}>
            {(equipo.datosFinancieros?.presupuestoFinal || 0) >= 0 ? "Solvente" : "Déficit"}
          </Typography>
        </Box>
        <Box sx={{ position: "relative" }}>
          <Box 
            sx={{ 
              width: "100%", 
              height: 6, 
              borderRadius: 3, 
              bgcolor: (theme) => theme.palette.mode === "dark" ? "grey.800" : "grey.200" 
            }}
          />
          <Box 
            sx={{ 
              position: "absolute",
              top: 0,
              left: 0,
              height: 6, 
              borderRadius: 3, 
              bgcolor: (equipo.datosFinancieros?.presupuestoFinal || 0) >= 0 ? "success.main" : "error.main",
              width: `${Math.min(100, Math.abs((equipo.datosFinancieros?.presupuestoFinal || 0) / (equipo.datosFinancieros?.presupuestoInicial || 1)) * 100)}%`,
              transition: "width 0.3s ease"
            }}
          />
        </Box>
      </Box>
    </Paper>

    {/* Apartado para actualizar presupuesto inicial - Solo para Admin */}
    <Box sx={{ mt: 2, mb: 2, display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "stretch", sm: "center" }, gap: { xs: 1, sm: 2 } }}>
      {isAdmin && (
        <>
          <TextField
            label="Nuevo Presupuesto Inicial"
            type="text"
            size="small"
            value={formatCurrency(nuevoPresupuesto)}
            onChange={handlePresupuestoChange}
            disabled={presupuestoLoading}
            sx={{ flex: { xs: 1, sm: "0 0 auto" }, minWidth: { xs: "100%", sm: 200 } }}
            InputProps={{
              startAdornment: <span style={{ marginRight: 4 }}>$</span>,
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
          />
          <Button
            variant="contained"
            onClick={handleActualizarPresupuesto}
            disabled={presupuestoLoading || !nuevoPresupuesto}
            size="small"
            sx={{ minWidth: { xs: "100%", sm: "auto" } }}
          >
            {presupuestoLoading ? "Actualizando..." : "Actualizar"}
          </Button>
        </>
      )}
      <Button
        variant="outlined"
        color="secondary"
        onClick={handleActualizarSumaPresupuesto}
        disabled={presupuestoLoading || !equipo?.datosFinancieros?.presupuestoInicial}
        size="small"
        sx={{ minWidth: { xs: "100%", sm: "auto" } }}
      >
        {presupuestoLoading ? "Actualizando..." : "Actualizar Suma"}
      </Button>
    </Box>
    <Divider sx={{ my: 3 }} />
    
    {/* Tabla de finanzas mejorada */}
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Historial de Transacciones
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDrawerFinanzas}
            size="small"
            sx={{ minWidth: { xs: "auto", sm: 150 } }}
          >
            Agregar Concepto
          </Button>
        )}
      </Box>
      
      {/* Resumen de ingresos vs egresos compacto */}
      <Box sx={{ mb: 2, display: "flex", gap: { xs: 1, sm: 2 } }}>
        <Paper 
          elevation={1} 
          sx={{ 
            flex: 1, 
            p: { xs: 1, sm: 1.5 }, 
            borderRadius: 2, 
            bgcolor: "rgba(76, 175, 80, 0.05)", 
            border: "1px solid", 
            borderColor: "rgba(76, 175, 80, 0.2)",
            textAlign: "center"
          }}
        >
          <Typography variant="caption" color="success.main" fontWeight={600} sx={{ fontSize: { xs: 10, sm: 11 } }}>
            INGRESOS
          </Typography>
          <Typography variant="h6" color="success.main" fontWeight={700} sx={{ fontSize: { xs: 14, sm: 16 } }}>
            ${equipo.finanzas?.filter(f => f.tipoconcepto?.codigo === "ingreso").reduce((sum, f) => sum + (f.monto || 0), 0).toLocaleString() || "0"}
          </Typography>
        </Paper>
        
        <Paper 
          elevation={1} 
          sx={{ 
            flex: 1, 
            p: { xs: 1, sm: 1.5 }, 
            borderRadius: 2, 
            bgcolor: "rgba(244, 67, 54, 0.05)", 
            border: "1px solid", 
            borderColor: "rgba(244, 67, 54, 0.2)",
            textAlign: "center"
          }}
        >
          <Typography variant="caption" color="error.main" fontWeight={600} sx={{ fontSize: { xs: 10, sm: 11 } }}>
            EGRESOS
          </Typography>
          <Typography variant="h6" color="error.main" fontWeight={700} sx={{ fontSize: { xs: 14, sm: 16 } }}>
            ${equipo.finanzas?.filter(f => f.tipoconcepto?.codigo === "egreso").reduce((sum, f) => sum + (f.monto || 0), 0).toLocaleString() || "0"}
          </Typography>
        </Paper>
      </Box>
    </Box>

    {/* Tabla con mejor diseño */}
    <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
      <Table>
        <TableHead sx={{ bgcolor: (theme) => theme.palette.mode === "dark" ? "grey.900" : "grey.50" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Concepto</TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="right">Monto</TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="center">Tipo</TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="center">Estado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {equipo.finanzas?.map((fin, idx) => (
            <TableRow 
              key={idx}
              sx={{ 
                "&:hover": { bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)" },
                borderLeft: "4px solid",
                borderLeftColor: fin.tipoconcepto?.codigo === "egreso" ? "error.main" : "success.main"
              }}
            >
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {fin.descripcion}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color={fin.tipoconcepto?.codigo === "egreso" ? "error.main" : "success.main"}
                >
                  {fin.tipoconcepto?.codigo === "egreso" ? "-" : "+"}${fin.monto?.toLocaleString()}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Box
                  component="span"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: 12,
                    bgcolor: fin.tipoconcepto?.codigo === "egreso" ? "rgba(244, 67, 54, 0.1)" : "rgba(76, 175, 80, 0.1)",
                    color: fin.tipoconcepto?.codigo === "egreso" ? "error.main" : "success.main",
                    border: "1px solid",
                    borderColor: fin.tipoconcepto?.codigo === "egreso" ? "rgba(244, 67, 54, 0.3)" : "rgba(76, 175, 80, 0.3)"
                  }}
                >
                  {fin.tipoconcepto?.descripcion || ""}
                </Box>
              </TableCell>
              <TableCell align="center">
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "success.main",
                    mx: "auto"
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
          {(!equipo.finanzas || equipo.finanzas.length === 0) && (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No hay transacciones registradas
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>
    
    {/* Drawer para agregar conceptos financieros */}
    <ConceptosFinancierosDrawer
      open={openDrawerFinanzas}
      onClose={handleCloseDrawerFinanzas}
      conceptoFinanciero={conceptoFinanciero}
      setConceptoFinanciero={setConceptoFinanciero}
      montoConcepto={montoConcepto}
      handleMontoConceptoChange={handleMontoConceptoChange}
      handleSave={handleSaveConceptoFinanciero}
      saving={savingConcepto}
      catalogoFinanzas={catalogoFinanzas}
      formatCurrency={formatCurrency}
      mensajeConcepto={mensajeConcepto}
    />
  </Paper>
  </Box>
);

const MovimientosTab = ({ equipo }) => (
  <Paper sx={{ p: { xs: 1, md: 3 }, mb: 2, borderRadius: 2 }}>
    <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
      Movimientos del equipo
    </Typography>
    
    <Grid container spacing={3}>
      {/* Altas */}
      <Grid item xs={12} lg={4}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            borderRadius: 2, 
            bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(76, 175, 80, 0.1)" : "rgba(76, 175, 80, 0.08)",
            border: "1px solid",
            borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(76, 175, 80, 0.3)" : "rgba(76, 175, 80, 0.2)"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2, justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box 
                sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: "50%", 
                  bgcolor: "success.main", 
                  mr: 1 
                }} 
              />
              <Typography variant="h6" fontWeight={600} color="success.main">
                Altas ({equipo.altas?.length || 0})
              </Typography>
            </Box>
            <Typography variant="body2" color="success.main" fontWeight={600}>
              Total: ${equipo.altas?.reduce((sum, j) => sum + (Number(j.costo) || 0), 0).toLocaleString()}
            </Typography>
          </Box>
          
          <Box sx={{ maxHeight: 300, overflow: "auto" }}>
            {equipo.altas?.map((jug) => (
              <Box 
                key={jug.id} 
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  p: 1.5, 
                  mb: 1, 
                  bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "background.paper", 
                  borderRadius: 1,
                  boxShadow: 1,
                  "&:hover": { 
                    boxShadow: 2,
                    bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.02)" 
                  }
                }}
              >
                <Avatar 
                  src={jug.img} 
                  alt={jug.sobrenombre} 
                  sx={{ width: 40, height: 40, mr: 2 }} 
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {jug.sobrenombre}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Rating: {jug.raiting} | {jug.costo ? `$${jug.costo.toLocaleString()}` : "Gratis"}
                  </Typography>
                </Box>
              </Box>
            ))}
            {(!equipo.altas || equipo.altas.length === 0) && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                No hay altas registradas
              </Typography>
            )}
          </Box>
        </Paper>
      </Grid>

      {/* Bajas */}
      <Grid item xs={12} lg={4}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            borderRadius: 2, 
            bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(244, 67, 54, 0.1)" : "rgba(244, 67, 54, 0.08)",
            border: "1px solid",
            borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(244, 67, 54, 0.3)" : "rgba(244, 67, 54, 0.2)"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2, justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box 
                sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: "50%", 
                  bgcolor: "error.main", 
                  mr: 1 
                }} 
              />
              <Typography variant="h6" fontWeight={600} color="error.main">
                Bajas ({equipo.bajas?.length || 0})
              </Typography>
            </Box>
            <Typography variant="body2" color="error.main" fontWeight={600}>
              Total: ${equipo.bajas?.reduce((sum, j) => sum + (Number(j.costo) || 0), 0).toLocaleString()}
            </Typography>
          </Box>
          
          <Box sx={{ maxHeight: 300, overflow: "auto" }}>
            {equipo.bajas?.map((jug) => (
              <Box 
                key={jug.id} 
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  p: 1.5, 
                  mb: 1, 
                  bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "background.paper", 
                  borderRadius: 1,
                  boxShadow: 1,
                  "&:hover": { 
                    boxShadow: 2,
                    bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.02)" 
                  }
                }}
              >
                <Avatar 
                  src={jug.img} 
                  alt={jug.sobrenombre} 
                  sx={{ width: 40, height: 40, mr: 2 }} 
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {jug.sobrenombre}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Rating: {jug.raiting} | {jug.costo ? `$${jug.costo.toLocaleString()}` : "Gratis"}
                  </Typography>
                </Box>
              </Box>
            ))}
            {(!equipo.bajas || equipo.bajas.length === 0) && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                No hay bajas registradas
              </Typography>
            )}
          </Box>
        </Paper>
      </Grid>

      {/* En Draft */}
      <Grid item xs={12} lg={4}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            borderRadius: 2, 
            bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255, 152, 0, 0.1)" : "rgba(255, 152, 0, 0.08)",
            border: "1px solid",
            borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(255, 152, 0, 0.3)" : "rgba(255, 152, 0, 0.2)"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2, justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box 
                sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: "50%", 
                  bgcolor: "warning.main", 
                  mr: 1 
                }} 
              />
              <Typography variant="h6" fontWeight={600} color="warning.main">
                En Draft ({equipo.draftpc?.length || 0})
              </Typography>
            </Box>
            <Typography variant="body2" color="warning.main" fontWeight={600}>
              Total: ${
                equipo.draftpc?.filter(j => j.equipo?.id === Number(equipo.id))
                  .reduce((sum, j) => sum + (Number(j.ofertaFinal) || 0), 0)
                  .toLocaleString()
              }
            </Typography>
          </Box>
          
          <Box sx={{ maxHeight: 300, overflow: "auto" }}>
            {equipo.draftpc?.map((draft) => (
              <Box 
                key={draft.id} 
                sx={{ 
                  p: 1.5, 
                  mb: 1, 
                  bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "background.paper", 
                  borderRadius: 1,
                  boxShadow: 1,
                  "&:hover": { 
                    boxShadow: 2,
                    bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.02)" 
                  }
                }}
              >
                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                  {draft.sobrenombre || draft.nombreCompleto}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="caption" color="text.secondary">
                    Rating: {draft.raiting}
                  </Typography>
                  <Typography variant="caption" fontWeight={600} color="primary.main">
                    ${draft.ofertaFinal?.toLocaleString() || "-"}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Manager: {draft.manager}
                </Typography>
              </Box>
            ))}
            {(!equipo.draftpc || equipo.draftpc.length === 0) && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                No hay jugadores en draft
              </Typography>
            )}
          </Box>
        </Paper>
      </Grid>
    </Grid>

    {/* Resumen de movimientos */}
    <Box sx={{ mt: 3 }}>
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          borderRadius: 2, 
          bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.02)" : "background.default",
          border: "1px solid",
          borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)"
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Resumen de Transferencias
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="success.main" fontWeight={700}>
                {equipo.altas?.length || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Incorporaciones
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="error.main" fontWeight={700}>
                {equipo.bajas?.length || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Salidas
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="warning.main" fontWeight={700}>
                {equipo.draftpc?.length || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                En Negociación
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="primary.main" fontWeight={700}>
                {((equipo.altas?.length || 0) - (equipo.bajas?.length || 0)) > 0 ? '+' : ''}
                {(equipo.altas?.length || 0) - (equipo.bajas?.length || 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Balance Neto
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  </Paper>
);

// Componente ConceptosFinancierosDrawer para agregar conceptos financieros
const ConceptosFinancierosDrawer = ({
  open,
  onClose,
  conceptoFinanciero,
  setConceptoFinanciero,
  montoConcepto,
  handleMontoConceptoChange,
  handleSave,
  saving,
  catalogoFinanzas,
  formatCurrency,
  mensajeConcepto
}) => (
  <Drawer
    anchor="right"
    open={open}
    onClose={onClose}
    PaperProps={{
      sx: {
        width: { xs: "90%", sm: 400 },
        bgcolor: (theme) => theme.palette.mode === "dark" ? "grey.900" : "background.paper"
      }
    }}
  >
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>
          Agregar Concepto Financiero
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Mensaje de éxito o error */}
        {mensajeConcepto.mensaje && (
          <Alert severity={mensajeConcepto.tipo} sx={{ mb: 2 }}>
            {mensajeConcepto.mensaje}
          </Alert>
        )}

        {/* Selector de concepto */}
        <Autocomplete
          options={catalogoFinanzas}
          getOptionLabel={(option) => option.descripcion || ""}
          value={conceptoFinanciero}
          onChange={(event, newValue) => setConceptoFinanciero(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Concepto Financiero"
              variant="outlined"
              fullWidth
              required
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props} sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <Typography variant="body2" fontWeight={600}>
                {option.descripcion}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {option.tipoconcepto?.descripcion} - {option.tipoconcepto?.codigo}
              </Typography>
            </Box>
          )}
          noOptionsText="No hay conceptos disponibles"
        />

        {/* Campo de monto */}
        <TextField
          label="Monto"
          type="text"
          value={formatCurrency(montoConcepto)}
          onChange={handleMontoConceptoChange}
          fullWidth
          required
          InputProps={{
            startAdornment: <span style={{ marginRight: 4 }}>$</span>,
            inputMode: "numeric",
            pattern: "[0-9]*",
          }}
          helperText="Ingrese el monto del concepto"
        />

        {/* Información del concepto seleccionado */}
        {conceptoFinanciero && (
          <Paper 
            elevation={1} 
            sx={{ 
              p: 2, 
              bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)",
              border: "1px solid",
              borderColor: "divider"
            }}
          >
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Información del Concepto
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Tipo:</strong> {conceptoFinanciero.tipoconcepto?.descripcion}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Código:</strong> {conceptoFinanciero.tipoconcepto?.codigo}
            </Typography>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                px: 2,
                py: 0.5,
                mt: 1,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: 12,
                bgcolor: conceptoFinanciero.tipoconcepto?.codigo === "egreso" ? "rgba(244, 67, 54, 0.1)" : "rgba(76, 175, 80, 0.1)",
                color: conceptoFinanciero.tipoconcepto?.codigo === "egreso" ? "error.main" : "success.main",
                border: "1px solid",
                borderColor: conceptoFinanciero.tipoconcepto?.codigo === "egreso" ? "rgba(244, 67, 54, 0.3)" : "rgba(76, 175, 80, 0.3)"
              }}
            >
              {conceptoFinanciero.tipoconcepto?.codigo === "egreso" ? "EGRESO" : "INGRESO"}
            </Box>
          </Paper>
        )}

        {/* Botones de acción */}
        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            fullWidth
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            fullWidth
            disabled={saving || !conceptoFinanciero || !montoConcepto}
          >
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </Box>
      </Box>
    </Box>
  </Drawer>
);
