import React, { useState, useEffect, useContext } from "react";
import { Box, Typography, Drawer, Button, IconButton, Autocomplete, TextField, CircularProgress, Tooltip } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import HealingIcon from "@mui/icons-material/Healing";
import WarningIcon from "@mui/icons-material/Warning";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import useJugadores from "../hooks/useJugadores";
import useMatchDetails from "../hooks/useMatchDetails";
import { AuthContext } from "../context/AuthContext";

// Tarjeta roja SVG como componente
const RedCardIcon = (props) => (
  <svg width={18} height={18} viewBox="0 0 24 24" {...props}>
    <rect x="6" y="4" width="12" height="16" rx="2" fill="#e53935" stroke="#b71c1c" strokeWidth="1.5"/>
  </svg>
);

const ResumenPartidoModal = ({ open, onClose, jornada, matchDetails, updateMatchDetails, updateGlobalData }) => {
  const { jugadores, loading: jugadoresLoading, fetchJugadores } = useJugadores();
  const [loading, setLoading] = useState(false);
  const { getMatchDetails, saveMatchDetails } = useMatchDetails();
  const { user } = useContext(AuthContext);
  const [selectedJugador, setSelectedJugador] = useState(null);
  const [showCombo, setShowCombo] = useState(false);
  const [golesJornada, setGolesJornada] = useState([]); // Array para registrar los goles
  const [lesionesJornada, setLesionesJornada] = useState([]); // Array para registrar las lesiones
  const [tarjetasJornada, setTarjetasJornada] = useState([]); // Array para registrar las tarjetas
  const [selectedAction, setSelectedAction] = useState(null); // Puede ser "gol", "lesion", "tarjeta" o "imagen"
  const [imagenesJornada, setImagenesJornada] = useState([]); // Array para registrar las imágenes
  const [newImageUrl, setNewImageUrl] = useState(""); // Para agregar nueva imagen
  const [showImagenes, setShowImagenes] = useState(false); // Para mostrar/ocultar sección de imágenes

  useEffect(() => {
    const fetchMatchDetails = async () => {
      if (!jornada) {
        console.error("No se proporcionó jornada.");
        return;
      }
      setLoading(true);
      try {
        const details = await getMatchDetails(jornada);
        console.log("Detalles del partido:", details);
        updateMatchDetails(details); // Actualiza los detalles en el componente padre
        
      } catch (error) {
        console.error("Error al cargar los detalles del partido:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchMatchDetails();
  }, [jornada, getMatchDetails]);

  
// Nuevo useEffect para sincronizar golesJornada
useEffect(() => {
  if (matchDetails && matchDetails.golesJornada) {
    setGolesJornada(matchDetails.golesJornada); // Sincroniza golesJornada con matchDetails.golesJornada
    console.log("Estado golesJornada sincronizado:", matchDetails.golesJornada); // Depuración
  }
}, [matchDetails]);

// Nuevo useEffect para sincronizar imagenesJornada
useEffect(() => {
  if (matchDetails && matchDetails.imagenes) {
    setImagenesJornada(matchDetails.imagenes); // Sincroniza imagenesJornada con matchDetails.imagenes
    console.log("Estado imagenesJornada sincronizado:", matchDetails.imagenes);
  }
}, [matchDetails]);

  useEffect(() => {
    if (jornada) {
      fetchJugadores(jornada.idEquipoLocal, jornada.idEquipoVisita);
    }
  }, [jornada, fetchJugadores]);

  useEffect(() => {
    if (!open) {
      updateMatchDetails(null);
      setShowCombo(false);
      setSelectedJugador(null);
      setGolesJornada([]);
    }
  }, [open]);

  // Verificar si el usuario tiene rol de Admin
  const isAdmin = user?.rolesDes?.includes("Admin");
 
  // Verificar si el usuario pertenece a alguno de los equipos que juegan en esta jornada
  const isUserTeamInMatch = parseInt(user?.idEquipo) === jornada?.idEquipoLocal || parseInt(user?.idEquipo) === jornada?.idEquipoVisita;
  
  // Determinar si se puede guardar (no está cerrada la jornada o es admin) Y (es admin o su equipo participa)
  const canSave = (jornada?.cerrada !== 1 &&  isUserTeamInMatch) || isAdmin;

  const toggleCombo = () => {
    setShowCombo((prev) => !prev); // Alterna la visibilidad del combo
  };

  const handleAddPlayer = (team, isAutogol = 0) => {
    if (!canSave || !selectedJugador) return; // Verificar si se puede editar
    
    const gol = {
      idEquipo: team === "local" ? jornada?.idEquipoLocal : jornada?.idEquipoVisita,
      idPersona: selectedJugador.id,
      isAutogol,
      nombreCompleto: selectedJugador.nombreCompleto,
      sobrenombre: selectedJugador.sobrenombre || "",
      deleted: 0,
    };
  
    // Actualiza golesJornada
    setGolesJornada((prev) => [...prev, gol]);
  
    // Actualiza matchDetails.golesJornada
    updateMatchDetails((prev) => {
      if (!prev) return prev;
  
      const updatedMatchDetails = { ...prev };
      updatedMatchDetails.golesJornada = [...(updatedMatchDetails.golesJornada || []), gol];
  
      if (team === "local") {
        updatedMatchDetails.golesLocal = (updatedMatchDetails.golesLocal || 0) + 1;
      } else if (team === "visit") {
        updatedMatchDetails.golesVisita = (updatedMatchDetails.golesVisita || 0) + 1;
      }
  
      return updatedMatchDetails;
    });
  
    console.log("Gol agregado:", gol);
  };

  const handleDeleteGol = (index) => {
    updateMatchDetails((prev) => {
      if (!prev || !prev.golesJornada) return prev;
  
      const updatedMatchDetails = { ...prev };
      const gol = updatedMatchDetails.golesJornada[index];
  
      // Restar el gol del marcador correspondiente
      if (gol.idEquipo === jornada?.idEquipoLocal) {
        updatedMatchDetails.golesLocal = Math.max((updatedMatchDetails.golesLocal || 0) - 1, 0);
      } else if (gol.idEquipo === jornada?.idEquipoVisita) {
        updatedMatchDetails.golesVisita = Math.max((updatedMatchDetails.golesVisita || 0) - 1, 0);
      }
  
      // Eliminar el gol del arreglo golesJornada
      updatedMatchDetails.golesJornada = updatedMatchDetails.golesJornada.filter((_, i) => i !== index);
  
      return updatedMatchDetails;
    });
  
    // Actualiza golesJornada para mantener consistencia
    setGolesJornada((prev) => prev.filter((_, i) => i !== index));
  
    console.log(`Gol eliminado en índice ${index}`);
  };

  const handleEditGol = (index, updatedGol) => {
    const updatedGoles = [...matchDetails?.golesJornada];
    updatedGoles[index] = { ...updatedGoles[index], ...updatedGol };
    setGolesJornada(updatedGoles);
  
    updateMatchDetails((prev) => {
      if (!prev) return prev;
  
      const updatedMatchDetails = { ...prev };
      updatedMatchDetails.golesJornada = updatedGoles;
  
      return updatedMatchDetails;
    });
  
    console.log("Gol editado:", updatedGol);
  };

  const handleAddLesion = (team) => {
    if (!canSave || !selectedJugador) return; // Verificar si se puede editar
    
    const lesion = {
      idEquipo: team === "local" ? jornada?.idEquipoLocal : jornada?.idEquipoVisita,
      idPersona: selectedJugador.id,
      nombreCompleto: selectedJugador.nombreCompleto,
      sobrenombre: selectedJugador.sobrenombre || "",
      deleted: 0,
    };
  
    setLesionesJornada((prev) => [...prev, lesion]);
  
    updateMatchDetails((prev) => {
      if (!prev) return prev;
  
      const updatedMatchDetails = { ...prev };
      updatedMatchDetails.lesionesJornada = [...(updatedMatchDetails.lesionesJornada || []), lesion];
  
      return updatedMatchDetails;
    });
  
    console.log("Lesión agregada:", lesion);
  };
  
  const handleAddTarjeta = (team, tipo) => {
    if (!canSave || !selectedJugador) return; // Verificar si se puede editar
    
    const tarjeta = {
      idEquipo: team === "local" ? jornada?.idEquipoLocal : jornada?.idEquipoVisita,
      idPersona: selectedJugador.id,
      tipo, // 1 para amarilla, 2 para roja
      nombreCompleto: selectedJugador.nombreCompleto,
      sobrenombre: selectedJugador.sobrenombre || "",
      deleted: 0,
    };
  
    setTarjetasJornada((prev) => [...prev, tarjeta]);
  
    updateMatchDetails((prev) => {
      if (!prev) return prev;
  
      const updatedMatchDetails = { ...prev };
      updatedMatchDetails.tarjetasJornada = [...(updatedMatchDetails.tarjetasJornada || []), tarjeta];
  
      return updatedMatchDetails;
    });
  
    console.log("Tarjeta agregada:", tarjeta);
  };
  
  const handleDeleteDetalle = (index, tipo) => {
    if (!canSave) return; // Verificar si se puede editar
    
    if (tipo === "gol") {
      handleDeleteGol(index);
    } else if (tipo === "lesion") {
      setLesionesJornada((prev) => prev.filter((_, i) => i !== index));
      console.log(`Lesión eliminada en índice ${index}`);
    } else if (tipo === "tarjeta") {
      setTarjetasJornada((prev) => prev.filter((_, i) => i !== index));
      console.log(`Tarjeta eliminada en índice ${index}`);
    }
  };

  const handleAddImagen = () => {
    if (!canSave || !newImageUrl.trim()) return;
    
    const imagen = {
      img: newImageUrl.trim(),
      deleted: 0,
    };

    setImagenesJornada((prev) => [...prev, imagen]);

    updateMatchDetails((prev) => {
      if (!prev) return prev;

      const updatedMatchDetails = { ...prev };
      updatedMatchDetails.imagenes = [...(updatedMatchDetails.imagenes || []), imagen];

      return updatedMatchDetails;
    });

    setNewImageUrl(""); // Limpiar el campo
    console.log("Imagen agregada:", imagen);
  };

  const handleDeleteImagen = (index) => {
    if (!canSave) return;
    
    setImagenesJornada((prev) => prev.filter((_, i) => i !== index));

    updateMatchDetails((prev) => {
      if (!prev) return prev;

      const updatedMatchDetails = { ...prev };
      updatedMatchDetails.imagenes = (updatedMatchDetails.imagenes || []).filter((_, i) => i !== index);

      return updatedMatchDetails;
    });

    console.log(`Imagen eliminada en índice ${index}`);
  };

  const handleSave = async () => {
    if (!canSave) return; // No permitir guardar si no se puede
    
    if (!matchDetails || !jornada) {
      console.error("No hay detalles de la jornada para guardar.");
      return;
    }
  
    try {
      const result = await saveMatchDetails(matchDetails); // Llama a saveMatchDetails con los parámetros correctos
      
      console.log("------>Cambios guardados exitosamente:",updateGlobalData);
      // Llama a la función para actualizar los datos globales
      if (updateGlobalData) {
        updateGlobalData(result.data); // Actualiza la tabla general y las jornadas con los nuevos datos
      }
      alert("Cambios guardados exitosamente.");
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
      alert("Ocurrió un error al guardar los cambios.");
    }
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
      }}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxWidth: 600,
          mx: "auto",
        }
      }}
    >
      <Box
        sx={{
          p: { xs: 2, sm: 4 },
          bgcolor: "background.paper",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          minHeight: 400,
        }}
        inert={!open ? "true" : undefined}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
            <CircularProgress />
          </Box>
        ) : matchDetails ? (
          <>
            <Typography variant="h6" sx={{ mb: 2, textAlign: "center", fontWeight: 700 }}>
              Resumen del Partido
            </Typography>
            <Box sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 3,
              gap: 2,
              flexWrap: "wrap"
            }}>
              <Box sx={{ textAlign: "center", flex: 1, minWidth: 120 }}>
                <img
                  src={matchDetails?.imgLocal || ""}
                  alt={matchDetails?.nombreEquipoLocal || "Equipo Local"}
                  style={{ width: 48, height: 48, objectFit: "contain", marginBottom: 5, cursor: "pointer" }}
                  onClick={() => {
                    setSelectedAction("gol");
                    toggleCombo();
                    setSelectedJugador(null);
                  }}
                  title="Agregar gol, lesión o tarjeta a jugador local"
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {matchDetails?.nombreEquipoLocal || "Equipo Local"}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "primary.main" }}>
                  {matchDetails?.golesLocal || 0}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 1 }}>
                  <Tooltip title="Agregar Gol">
                    <IconButton 
                      onClick={() => { setSelectedAction("gol"); toggleCombo(); setSelectedJugador(null); }} 
                      color="primary"
                      disabled={!canSave}
                    >
                      <SportsSoccerIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Agregar Lesión">
                    <IconButton 
                      onClick={() => { setSelectedAction("lesion"); toggleCombo(); setSelectedJugador(null); }} 
                      color="secondary"
                      disabled={!canSave}
                    >
                      <HealingIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Agregar Tarjeta Roja">
                    <IconButton 
                      onClick={() => { setSelectedAction("tarjeta"); toggleCombo(); setSelectedJugador(null); }} 
                      color="error"
                      disabled={!canSave}
                    >
                      <RedCardIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Agregar Imágenes">
                    <IconButton 
                      onClick={() => setShowImagenes((prev) => !prev)} 
                      color="info"
                      disabled={!canSave}
                    >
                      <PhotoCameraIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Box sx={{ textAlign: "center", flex: 1, minWidth: 120 }}>
                <img
                  src={matchDetails?.imgVisita}
                  alt={matchDetails?.nombreEquipoVisita}
                  style={{ width: 48, height: 48, objectFit: "contain", marginBottom: 5, cursor: "pointer" }}
                  onClick={() => {
                    if (canSave) {
                      setSelectedAction("gol");
                      toggleCombo();
                      setSelectedJugador(null);
                    }
                  }}
                  title="Agregar gol, lesión o tarjeta a jugador visita"
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {matchDetails?.nombreEquipoVisita || ""}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "primary.main" }}>
                  {matchDetails?.golesVisita || 0}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 1 }}>
                  <Tooltip title="Agregar Gol">
                    <IconButton 
                      onClick={() => { setSelectedAction("gol"); toggleCombo(); setSelectedJugador(null); }} 
                      color="primary"
                      disabled={!canSave}
                    >
                      <SportsSoccerIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Agregar Lesión">
                    <IconButton 
                      onClick={() => { setSelectedAction("lesion"); toggleCombo(); setSelectedJugador(null); }} 
                      color="secondary"
                      disabled={!canSave}
                    >
                      <HealingIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Agregar Tarjeta Roja">
                    <IconButton 
                      onClick={() => { setSelectedAction("tarjeta"); toggleCombo(); setSelectedJugador(null); }} 
                      color="error"
                      disabled={!canSave}
                    >
                      <RedCardIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Agregar Imágenes">
                    <IconButton 
                      onClick={() => setShowImagenes((prev) => !prev)} 
                      color="info"
                      disabled={!canSave}
                    >
                      <PhotoCameraIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>

            {showCombo && (
              <Box sx={{ mt: 3 }}>
                {jugadoresLoading ? (
                  <CircularProgress sx={{ display: "block", margin: "0 auto" }} />
                ) : (
                  <Autocomplete
                    options={jugadores}
                    getOptionLabel={(jugador) => `${jugador.nombreCompleto} - ${jugador.equipo.nombre}`}
                    renderInput={(params) => (
                      <TextField {...params} label="Buscar jugador" variant="outlined" fullWidth />
                    )}
                    onChange={(event, value) => setSelectedJugador(value)}
                    isOptionEqualToValue={(option, value) =>
                      option.nombreCompleto === value.nombreCompleto && option.equipo.id === value.equipo.id
                    }
                  />
                )}
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2, flexWrap: "wrap", gap: 1 }}>
                  {selectedAction === "gol" && (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddCircleIcon />}
                        onClick={() => handleAddPlayer("local")}
                        sx={{ flex: 1, minWidth: 120 }}
                        disabled={!canSave}
                      >
                        Gol Local
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddCircleIcon />}
                        onClick={() => handleAddPlayer("visit")}
                        sx={{ flex: 1, minWidth: 120 }}
                        disabled={!canSave}
                      >
                        Gol Visita
                      </Button>
                    </>
                  )}
                  {selectedAction === "lesion" && (
                    <>
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<HealingIcon />}
                        onClick={() => handleAddLesion("local")}
                        sx={{ flex: 1, minWidth: 120 }}
                        disabled={!canSave}
                      >
                        Lesión Local
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<HealingIcon />}
                        onClick={() => handleAddLesion("visit")}
                        sx={{ flex: 1, minWidth: 120 }}
                        disabled={!canSave}
                      >
                        Lesión Visita
                      </Button>
                    </>
                  )}
                  {selectedAction === "tarjeta" && (
                    <>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<WarningIcon />}
                        onClick={() => handleAddTarjeta("local", 2)}
                        sx={{ flex: 1, minWidth: 120 }}
                        disabled={!canSave}
                      >
                        Roja Local
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<WarningIcon />}
                        onClick={() => handleAddTarjeta("visit", 2)}
                        sx={{ flex: 1, minWidth: 120 }}
                        disabled={!canSave}
                      >
                        Roja Visita
                      </Button>
                    </>
                  )}
                </Box>
              </Box>
            )}

            {/* Contenedor principal para Detalles Local y Detalles Visita */}
            <Box sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 3,
              gap: 2,
              flexWrap: "wrap"
            }}>
              {/* Detalles Local */}
              <Box sx={{
                flex: 1,
                textAlign: "left",
                pr: 2,
                minWidth: 140,
                bgcolor: (theme) => theme.palette.action.hover,
                borderRadius: 2,
                p: 2,
              }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
                  Detalles Local
                </Typography>
                {[...matchDetails?.golesJornada || [], ...lesionesJornada, ...tarjetasJornada]
                  .filter((detalle) => detalle.idEquipo === jornada?.idEquipoLocal && !detalle.deleted)
                  .map((detalle, index) => {
                    let icon = null;
                    let tipo = "";
                    let tooltip = "";

                    if (detalle.isAutogol !== undefined) {
                      icon = <Tooltip title="Gol"><SportsSoccerIcon color="primary" fontSize="small" /></Tooltip>;
                      tipo = "gol";
                      tooltip = "Gol";
                    } else if (detalle.tipo !== undefined) {
                      if (detalle.tipo === 1) {
                        icon = <Tooltip title="Tarjeta Amarilla"><WarningIcon color="warning" fontSize="small" /></Tooltip>;
                        tooltip = "Tarjeta Amarilla";
                      } else {
                        icon = <Tooltip title="Tarjeta Roja"><RedCardIcon style={{ verticalAlign: "middle" }} /></Tooltip>;
                        tooltip = "Tarjeta Roja";
                      }
                      tipo = "tarjeta";
                    } else {
                      icon = <Tooltip title="Lesión"><HealingIcon color="secondary" fontSize="small" /></Tooltip>;
                      tipo = "lesion";
                      tooltip = "Lesión";
                    }

                    return (
                      <Box key={index} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <Typography sx={{ fontSize: 14, display: "flex", alignItems: "center", gap: 1 }}>
                          {icon} {detalle.nombreCompleto}
                        </Typography>
                        <IconButton 
                          onClick={() => handleDeleteDetalle(index, tipo)} 
                          color="error" 
                          size="small"
                          disabled={!canSave}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    );
                  })}
              </Box>

              {/* Detalles Visita */}
              <Box sx={{
                flex: 1,
                textAlign: "right",
                pl: 2,
                minWidth: 140,
                bgcolor: (theme) => theme.palette.action.hover,
                borderRadius: 2,
                p: 2,
              }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, textAlign: "right" }}>
                  Detalles Visita
                </Typography>
                {[...matchDetails?.golesJornada || [], ...lesionesJornada, ...tarjetasJornada]
                  .filter((detalle) => detalle.idEquipo === jornada?.idEquipoVisita && !detalle.deleted)
                  .map((detalle, index) => {
                    let icon = null;
                    let tipo = "";
                    let tooltip = "";

                    if (detalle.isAutogol !== undefined) {
                      icon = <Tooltip title="Gol"><SportsSoccerIcon color="primary" fontSize="small" /></Tooltip>;
                      tipo = "gol";
                      tooltip = "Gol";
                    } else if (detalle.tipo !== undefined) {
                      if (detalle.tipo === 1) {
                        icon = <Tooltip title="Tarjeta Amarilla"><WarningIcon color="warning" fontSize="small" /></Tooltip>;
                        tooltip = "Tarjeta Amarilla";
                      } else {
                        icon = <Tooltip title="Tarjeta Roja"><RedCardIcon style={{ verticalAlign: "middle" }} /></Tooltip>;
                        tooltip = "Tarjeta Roja";
                      }
                      tipo = "tarjeta";
                    } else {
                      icon = <Tooltip title="Lesión"><HealingIcon color="secondary" fontSize="small" /></Tooltip>;
                      tipo = "lesion";
                      tooltip = "Lesión";
                    }

                    return (
                      <Box key={index} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <Typography sx={{ fontSize: 14, display: "flex", alignItems: "center", gap: 1 }}>
                          {icon} {detalle.nombreCompleto}
                        </Typography>
                        <IconButton 
                          onClick={() => handleDeleteDetalle(index, tipo)} 
                          color="error" 
                          size="small"
                          disabled={!canSave}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    );
                  })}
              </Box>
            </Box>

            {/* Sección de Imágenes */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700, textAlign: "center" }}>
                Imágenes del Partido
              </Typography>
              
              {/* Campo para agregar nueva imagen - solo visible cuando showImagenes es true */}
              {showImagenes && canSave && (
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <TextField
                    label="URL de la imagen"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddImagen}
                    disabled={!newImageUrl.trim()}
                    sx={{ minWidth: 100 }}
                  >
                    Agregar
                  </Button>
                </Box>
              )}

              {/* Mostrar imágenes existentes - siempre visible si hay imágenes */}
              {imagenesJornada.length > 0 && (
                <Box sx={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", 
                  gap: 2 
                }}>
                  {imagenesJornada.map((imagen, index) => (
                    <Box key={index} sx={{ position: "relative", textAlign: "center" }}>
                      <img
                        src={imagen.img}
                        alt={`Imagen ${index + 1}`}
                        style={{
                          width: "100%",
                          height: 120,
                          objectFit: "cover",
                          borderRadius: 8,
                          border: "1px solid #ddd",
                          cursor: "pointer"
                        }}
                        onClick={() => window.open(imagen.img, '_blank')}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      {canSave && (
                        <IconButton
                          onClick={() => handleDeleteImagen(index)}
                          color="error"
                          size="small"
                          sx={{
                            position: "absolute",
                            top: -8,
                            right: -8,
                            bgcolor: "white",
                            boxShadow: 1,
                            "&:hover": { bgcolor: "error.light", color: "white" }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                </Box>
              )}

              {imagenesJornada.length === 0 && (
                <Typography variant="body2" sx={{ textAlign: "center", color: "text.secondary", py: 2 }}>
                  No hay imágenes para mostrar
                </Typography>
              )}
            </Box>

            <Button
              variant="contained"
              color="success"
              fullWidth
              onClick={handleSave}
              disabled={!canSave}
              sx={{ 
                mt: 2, 
                fontWeight: 700, 
                letterSpacing: 1,
                opacity: !canSave ? 0.5 : 1
              }}
              title={!canSave ? "No se puede editar: jornada cerrada o no es tu equipo (solo Admin puede editar)" : ""}
            >
              Guardar Cambios
            </Button>
            <Button
              variant="contained"
              color="error"
              fullWidth
              onClick={onClose}
              sx={{ mt: 1, fontWeight: 700, letterSpacing: 1 }}
            >
              Cerrar
            </Button>
          </>
        ) : (
          <Typography variant="body2" sx={{ textAlign: "center", color: "red" }}>
            No se encontraron detalles del partido o ocurrió un error.
          </Typography>
        )}
      </Box>
    </Drawer>
  );
};

export default ResumenPartidoModal;