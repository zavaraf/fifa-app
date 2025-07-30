import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Card,
  CardContent,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Checkbox,
  FormControlLabel,
  Switch,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  Button
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ScheduleIcon from "@mui/icons-material/Schedule";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { AuthContext } from "../context/AuthContext";
import useTorneos from "../hooks/useTorneos";
import useSesion from "../hooks/useSesion";
import CrearTorneoDrawer from "../components/CrearTorneoDrawer";
import CrearJornadasFinalesDrawer from "../components/CrearJornadasFinalesDrawer";
import CrearWoDrawer from "../components/CrearWoDrawer"; // nuevo import

export default function AdminTorneo() {
  const { user, setUser } = useContext(AuthContext);
  const { jornadas, fetchJornadas, editarJornadas, setJornadas, error } = useTorneos();
  const { forceRefreshTemporada } = useSesion();
  const [selectedTorneoId, setSelectedTorneoId] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedJornadas, setExpandedJornadas] = useState(new Set());
  const [jornadasModificadas, setJornadasModificadas] = useState([]);
  const [savingChanges, setSavingChanges] = useState(false);
  const [showCrearTorneo, setShowCrearTorneo] = useState(false);
  const [showJornadasFinales, setShowJornadasFinales] = useState(false);
  const [showWoDrawer, setShowWoDrawer] = useState(false);

  useEffect(() => {
    // Seleccionar automáticamente el primer torneo cuando cargue la página
    if (user?.torneos && Array.isArray(user.torneos) && user.torneos.length > 0) {
      const firstTorneo = user.torneos[0];
      setSelectedTorneoId(firstTorneo.id);
      handleFetchJornadas(firstTorneo.id);
    }
  }, [user]);

  const handleTorneoChange = (event) => {
    const torneoId = event.target.value;
    setSelectedTorneoId(torneoId);
    handleFetchJornadas(torneoId);
  };

  const handleFetchJornadas = async (torneoId) => {
    if (!fetchJornadas) {
      console.error("fetchJornadas no está disponible en el hook useTorneos");
      return;
    }
    
    setLoading(true);
    try {
      await fetchJornadas(torneoId);
    } catch (err) {
      console.error("Error al cargar jornadas:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (jornada) => {
    if (jornada.activa === 1) {
      return <Chip label="Activa" color="success" size="small" variant="filled" icon={<ScheduleIcon />} />;
    }
    return <Chip label="Inactiva" color="default" size="small" variant="outlined" />;
  };

  const getClosedChip = (jornada) => {
    if (jornada.cerrada === 1) {
      return <Chip label="Cerrada" color="error" size="small" variant="filled" icon={<LockIcon />} />;
    }
    return <Chip label="Abierta" color="primary" size="small" variant="outlined" icon={<LockOpenIcon />} />;
  };

  // Función para verificar si es una instancia final
  const esInstanciaFinal = (jornada) => {
    const instanciasFinales = ["Final", "Semifinal", "Cuartos", "Octavos"];
    if (!jornada.nombreJornada) return false;
    
    // Verificar si el nombre contiene alguna instancia final (incluyendo variantes con "Vuelta")
    return instanciasFinales.some(instancia => 
      jornada.nombreJornada.includes(instancia)
    );
  };

  // Función para obtener chip de instancia final
  const getInstanciaFinalChip = (jornada) => {
    if (esInstanciaFinal(jornada)) {
      return (
        <Chip 
          label="Instancia Final" 
          color="warning" 
          size="small" 
          variant="filled" 
          icon={<EmojiEventsIcon />}
          sx={{
            background: "linear-gradient(45deg, #FFD700, #FFA500)",
            color: "white",
            fontWeight: 600
          }}
        />
      );
    }
    return null;
  };

  const handleActivaChange = (jornadaGroup, event) => {
    event.stopPropagation();
    const nuevoEstado = event.target.checked ? 1 : 0;
    
    console.log("Cambiar estado activa para jornada:", jornadaGroup.idJornda, nuevoEstado);
    
    // Actualizar el estado local de jornadas
    const jornadasActualizadas = jornadas.map(jornada => {
      if (jornada.idJornda === jornadaGroup.idJornda) {
        return { ...jornada, activa: nuevoEstado };
      }
      return jornada;
    });
    
    // Crear jornada modificada completa con todos los datos
    const jornadaModificada = {
      ...jornadaGroup, // Incluir toda la jornada original
      activa: nuevoEstado // Solo cambiar el estado activo
    };
    
    actualizarJornadaModificada(jornadaModificada);
    setJornadas(jornadasActualizadas);
  };

  const handleCerradaChange = (jornadaGroup, event) => {
    event.stopPropagation();
    const nuevoEstado = event.target.checked ? 1 : 0;
    
    console.log("Cambiar estado cerrada para jornada:", jornadaGroup.idJornda, nuevoEstado);
    
    // Actualizar el estado local de jornadas
    const jornadasActualizadas = jornadas.map(jornada => {
      if (jornada.idJornda === jornadaGroup.idJornda) {
        return { ...jornada, cerrada: nuevoEstado };
      }
      return jornada;
    });
    
    // Crear jornada modificada completa con todos los datos
    const jornadaModificada = {
      ...jornadaGroup, // Incluir toda la jornada original
      cerrada: nuevoEstado // Solo cambiar el estado cerrado
    };
    
    actualizarJornadaModificada(jornadaModificada);
    setJornadas(jornadasActualizadas);
  };

  const actualizarJornadaModificada = (jornadaModificada) => {
    setJornadasModificadas(prev => {
      const index = prev.findIndex(j => j.idJornda === jornadaModificada.idJornda);
      if (index >= 0) {
        // Actualizar jornada existente
        const updated = [...prev];
        updated[index] = jornadaModificada;
        return updated;
      } else {
        // Agregar nueva jornada modificada
        return [...prev, jornadaModificada];
      }
    });
  };

  const guardarCambios = async () => {
    if (jornadasModificadas.length === 0) {
      alert("No hay cambios para guardar.");
      return;
    }

    setSavingChanges(true);
    
    try {
      const torneoSeleccionado = getTorneoSeleccionado();
      if (!torneoSeleccionado) {
        alert("Error: No se pudo obtener el torneo seleccionado.");
        return;
      }

      const success = await editarJornadas(
        torneoSeleccionado.id,
        torneoSeleccionado.tipoTorneo,
        jornadasModificadas
      );

      if (success) {
        alert(`Se guardaron ${jornadasModificadas.length} cambios exitosamente.`);
        setJornadasModificadas([]); // Limpiar cambios pendientes
        // Opcional: recargar jornadas para obtener datos actualizados del servidor
        await handleFetchJornadas(selectedTorneoId);
      } else {
        alert("Error al guardar los cambios. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      alert("Error al guardar los cambios. Intenta nuevamente.");
    } finally {
      setSavingChanges(false);
    }
  };

  const getTorneoSeleccionado = () => {
    return user?.torneos?.find(t => t.id === selectedTorneoId);
  };

  const toggleExpandJornada = (jornadaId) => {
    setExpandedJornadas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jornadaId)) {
        newSet.delete(jornadaId);
      } else {
        newSet.add(jornadaId);
      }
      return newSet;
    });
  };

  const handleTorneoCreated = async (torneoData) => {
    console.log("Torneo creado:", torneoData);
    
    try {
      // Forzar actualización de temporada y torneos después de crear el torneo
      const temporadaActualizada = await forceRefreshTemporada();
      
      if (temporadaActualizada && temporadaActualizada.torneos) {
        // Actualizar el usuario con los nuevos torneos
        const userActualizado = {
          ...user,
          torneos: temporadaActualizada.torneos
        };
        
        setUser(userActualizado);
        localStorage.setItem("user", JSON.stringify(userActualizado));
        
        console.log("Torneos actualizados después de crear:", temporadaActualizada.torneos);
        alert("Torneo creado exitosamente. La lista de torneos se ha actualizado.");
      } else {
        alert("Torneo creado, pero no se pudieron actualizar los torneos automáticamente.");
      }
    } catch (error) {
      console.error("Error al actualizar torneos después de crear:", error);
      alert("Torneo creado, pero hubo un error al actualizar la lista de torneos.");
    }
  };

  const handleJornadasFinalesCreated = async (jornadasFinalesData) => {
    console.log("Jornadas finales creadas:", jornadasFinalesData);
    
    try {
      // Actualizar temporada y torneos después de crear jornadas finales
      const temporadaActualizada = await forceRefreshTemporada();
      
      if (temporadaActualizada && temporadaActualizada.torneos) {
        const userActualizado = {
          ...user,
          torneos: temporadaActualizada.torneos
        };
        
        setUser(userActualizado);
        localStorage.setItem("user", JSON.stringify(userActualizado));
        
        console.log("Torneos actualizados después de crear jornadas finales:", temporadaActualizada.torneos);
        alert("Jornadas finales creadas exitosamente. La lista de torneos se ha actualizado.");
      } else {
        alert("Jornadas finales creadas, pero no se pudieron actualizar los torneos automáticamente.");
      }
    } catch (error) {
      console.error("Error al actualizar torneos después de crear jornadas finales:", error);
      alert("Jornadas finales creadas, pero hubo un error al actualizar la lista de torneos.");
    }
  };

  return (
    <Box sx={{ 
      maxWidth: 1400, 
      mx: "auto", 
      mt: 4, 
      p: 2,
      background: (theme) => theme.palette.mode === "dark" 
        ? "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)"
        : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      minHeight: "100vh",
      borderRadius: 2
    }}>
      <Box sx={{ 
        display: "flex", 
        alignItems: "center", 
        mb: 4,
        background: (theme) => theme.palette.mode === "dark" ? "#232323" : "#ffffff",
        p: 3,
        borderRadius: 3,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
      }}>
        <Box sx={{ 
          width: 50, 
          height: 50, 
          borderRadius: "50%", 
          background: "linear-gradient(45deg, #FF6B6B, #4ECDC4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mr: 2
        }}>
          <EditIcon sx={{ color: "white", fontSize: 24 }} />
        </Box>
        <Typography variant="h3" fontWeight={800} sx={{ 
          background: "linear-gradient(45deg, #FF6B6B, #4ECDC4)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent"
        }}>
          Administración de Torneo
        </Typography>
      </Box>

      {/* Selector de Torneo mejorado */}
      <Paper sx={{ 
        p: 4, 
        mb: 4, 
        borderRadius: 3,
        background: (theme) => theme.palette.mode === "dark" 
          ? "linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%)"
          : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        border: "1px solid",
        borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
      }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <FormControl fullWidth sx={{ mr: 2 }}>
            <InputLabel sx={{ fontWeight: 600 }}>Seleccionar Torneo</InputLabel>
            <Select
              value={selectedTorneoId}
              onChange={handleTorneoChange}
              label="Seleccionar Torneo"
              sx={{
                borderRadius: 2,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                  borderWidth: 2
                }
              }}
            >
              {user?.torneos?.map((torneo) => (
                <MenuItem key={torneo.id} value={torneo.id} sx={{ py: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Chip 
                      label={torneo.tipoTorneo === 2 ? "Grupos" : "General"} 
                      size="small" 
                      color={torneo.tipoTorneo === 2 ? "secondary" : "primary"}
                      variant="outlined"
                    />
                    <Typography variant="body1" fontWeight={500}>
                      {torneo.nombre}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setShowCrearTorneo(true)}
              sx={{
                minWidth: 140,
                height: 56,
                background: "linear-gradient(45deg, #FF6B6B, #4ECDC4)",
                "&:hover": {
                  background: "linear-gradient(45deg, #FF5252, #26C6DA)"
                }
              }}
            >
              Crear Torneo
            </Button>
            
            <Button
              variant="contained"
              startIcon={<EmojiEventsIcon />}
              onClick={() => setShowJornadasFinales(true)}
              sx={{
                minWidth: 140,
                height: 56,
                background: "linear-gradient(45deg, #FFD700, #FFA500)",
                color: "white",
                "&:hover": {
                  background: "linear-gradient(45deg, #FFC107, #FF9800)"
                }
              }}
            >
              Jornadas Finales
            </Button>

            {/* Nuevo botón para WO */}
            <Button
              variant="contained"
              startIcon={<LockIcon />}
              onClick={() => setShowWoDrawer(true)}
              sx={{
                minWidth: 140,
                height: 56,
                background: "linear-gradient(45deg, #FF9800, #FF6B6B)",
                color: "white",
                "&:hover": {
                  background: "linear-gradient(45deg, #FFB74D, #FF5252)"
                }
              }}
            >
              Analizar WO
            </Button>
          </Box>
        </Box>

        {getTorneoSeleccionado() && (
          <Box sx={{ 
            mt: 3, 
            p: 3, 
            borderRadius: 2, 
            background: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
            border: "1px solid",
            borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
          }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              {getTorneoSeleccionado().nombre}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Tipo: {getTorneoSeleccionado().tipoTorneo === 2 ? "Torneo por Grupos" : "Torneo General"}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Lista de Jornadas mejorada */}
      {!loading && jornadas && jornadas.length > 0 && (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mr: 2 }}>
              Jornadas del Torneo
            </Typography>
            <Badge badgeContent={jornadas.length} color="primary" sx={{ ml: 1 }}>
              <ScheduleIcon color="action" />
            </Badge>
          </Box>
          
          <Grid container spacing={3}>
            {jornadas
              .sort((a, b) => b.idJornda - a.idJornda) // Ordenar por ID descendente
              .map((jornadaGroup, index) => (
              <Grid item xs={12} md={6} lg={4} key={jornadaGroup.idJornda}>
                <Card sx={{ 
                  height: "100%",
                  borderRadius: 3,
                  background: (theme) => theme.palette.mode === "dark" 
                    ? "linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%)"
                    : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                  border: "1px solid",
                  borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.15)"
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>
                        {jornadaGroup.nombreJornada && jornadaGroup.nombreJornada !== "" 
                          ? jornadaGroup.nombreJornada 
                          : `Jornada ${jornadaGroup.numeroJornada}`}
                      </Typography>
                      <Tooltip title="Ver detalles">
                        <IconButton size="small" color="primary">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                      {getStatusChip(jornadaGroup)}
                      {getClosedChip(jornadaGroup)}
                      {getInstanciaFinalChip(jornadaGroup)}
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {esInstanciaFinal(jornadaGroup) 
                        ? `Instancia: ${jornadaGroup.nombreJornada} | ID: ${jornadaGroup.idJornda}`
                        : `Número: ${jornadaGroup.numeroJornada} | ID: ${jornadaGroup.idJornda}`
                      }
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    {/* Controles de estado modernos */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                        Control de Estados
                      </Typography>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Box sx={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center",
                          p: 2,
                          borderRadius: 2,
                          background: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)"
                        }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Estado Activo
                          </Typography>
                          <Switch
                            checked={jornadaGroup.activa === 1}
                            onChange={(e) => handleActivaChange(jornadaGroup, e)}
                            color="success"
                            size="small"
                          />
                        </Box>
                        <Box sx={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center",
                          p: 2,
                          borderRadius: 2,
                          background: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)"
                        }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Estado Cerrado
                          </Typography>
                          <Switch
                            checked={jornadaGroup.cerrada === 1}
                            onChange={(e) => handleCerradaChange(jornadaGroup, e)}
                            color="error"
                            size="small"
                          />
                        </Box>
                      </Box>
                    </Box>

                    {/* Información de fechas mejorada */}
                    {(jornadaGroup.fechaInicioString || jornadaGroup.fechaFinString) && (
                      <Box sx={{ 
                        mb: 3, 
                        p: 2, 
                        borderRadius: 2, 
                        background: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                        border: "1px solid",
                        borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
                      }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: "primary.main" }}>
                          Fechas
                        </Typography>
                        {jornadaGroup.fechaInicioString && (
                          <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                            📅 Inicio: {jornadaGroup.fechaInicioString}
                          </Typography>
                        )}
                        {jornadaGroup.fechaFinString && (
                          <Typography variant="caption" display="block">
                            📅 Fin: {jornadaGroup.fechaFinString}
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* Partidos mejorados */}
                    {jornadaGroup.jornada && jornadaGroup.jornada.length > 0 && (
                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "primary.main" }}>
                            Partidos
                          </Typography>
                          <Chip 
                            label={jornadaGroup.jornada.length} 
                            size="small" 
                            color="primary" 
                            sx={{ ml: 1 }}
                          />
                        </Box>
                        
                        {(expandedJornadas.has(jornadaGroup.idJornda) 
                          ? jornadaGroup.jornada 
                          : jornadaGroup.jornada.slice(0, 3)
                        ).map((partido, partidoIndex) => (
                          <Box key={partidoIndex} sx={{ 
                            mb: 1.5,
                            p: 2,
                            borderRadius: 2,
                            background: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                            border: "1px solid",
                            borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              background: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"
                            }
                          }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                                <img
                                  src={partido.imgLocal}
                                  alt={partido.nombreEquipoLocal}
                                  style={{
                                    width: 20,
                                    height: 20,
                                    objectFit: "contain",
                                    marginRight: 6,
                                    borderRadius: "50%",
                                    border: "1px solid rgba(0,0,0,0.1)"
                                  }}
                                />
                                <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 500 }}>
                                  {partido.nombreEquipoLocal?.substring(0, 10)}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ 
                                display: "flex", 
                                alignItems: "center", 
                                px: 2, 
                                py: 0.5, 
                                borderRadius: 1,
                                background: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                              }}>
                                <Typography variant="caption" sx={{ fontSize: "0.8rem", fontWeight: 700 }}>
                                  {partido.golesLocal ?? "-"} - {partido.golesVisita ?? "-"}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: "flex", alignItems: "center", flex: 1, justifyContent: "flex-end" }}>
                                <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 500 }}>
                                  {partido.nombreEquipoVisita?.substring(0, 10)}
                                </Typography>
                                <img
                                  src={partido.imgVisita}
                                  alt={partido.nombreEquipoVisita}
                                  style={{
                                    width: 20,
                                    height: 20,
                                    objectFit: "contain",
                                    marginLeft: 6,
                                    borderRadius: "50%",
                                    border: "1px solid rgba(0,0,0,0.1)"
                                  }}
                                />
                              </Box>
                            </Box>
                          </Box>
                        ))}
                        
                        {jornadaGroup.jornada.length > 3 && (
                          <Box
                            onClick={() => toggleExpandJornada(jornadaGroup.idJornda)}
                            sx={{ 
                              display: "block", 
                              textAlign: "center", 
                              mt: 1,
                              p: 1.5,
                              borderRadius: 1,
                              background: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                background: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                                transform: "scale(1.02)"
                              }
                            }}
                          >
                            <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
                              {expandedJornadas.has(jornadaGroup.idJornda) 
                                ? "Mostrar menos" 
                                : `+${jornadaGroup.jornada.length - 3} partidos más`}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Sin datos */}
      {!loading && (!jornadas || jornadas.length === 0) && !error && selectedTorneoId && (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            No se encontraron jornadas para este torneo.
          </Typography>
        </Paper>
      )}

      {/* Botón para guardar cambios */}
      {jornadasModificadas.length > 0 && (
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 3,
          background: "linear-gradient(45deg, #FF6B6B, #4ECDC4)",
          color: "white"
        }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Cambios Pendientes
              </Typography>
              <Typography variant="body2">
                {jornadasModificadas.length} jornada{jornadasModificadas.length !== 1 ? 's' : ''} modificada{jornadasModificadas.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={guardarCambios}
              disabled={savingChanges}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                fontWeight: 700,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.3)"
                }
              }}
            >
              {savingChanges ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Drawer para crear torneo */}
      <CrearTorneoDrawer
        open={showCrearTorneo}
        onClose={() => setShowCrearTorneo(false)}
        onTorneoCreated={handleTorneoCreated}
      />

      {/* Drawer para crear jornadas finales */}
      <CrearJornadasFinalesDrawer
        open={showJornadasFinales}
        onClose={() => setShowJornadasFinales(false)}
        onJornadasFinalesCreated={handleJornadasFinalesCreated}
      />

      {/* Drawer para analizar WO */}
      <CrearWoDrawer
        open={showWoDrawer}
        onClose={() => setShowWoDrawer(false)}
        jornadas={jornadas}
      />
    </Box>
  );
}
