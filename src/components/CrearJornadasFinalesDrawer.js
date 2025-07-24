import React, { useState, useEffect, useContext } from "react";
import {
  Drawer,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Avatar,
  Chip
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import useTorneos from "../hooks/useTorneos";
import useEquipos from "../hooks/useEquipos";
import { AuthContext } from "../context/AuthContext";

const CrearJornadasFinalesDrawer = ({ open, onClose, onJornadasFinalesCreated }) => {
  const { addJuegosLiguilla } = useTorneos();
  const { equipos, fetchEquipos } = useEquipos();
  const { user } = useContext(AuthContext);
  
  const [torneos, setTorneos] = useState([]);
  const [selectedTorneo, setSelectedTorneo] = useState("");
  const [selectedEstancia, setSelectedEstancia] = useState("");
  const [tipoPartidos, setTipoPartidos] = useState("ida");
  const [equiposSeleccionados, setEquiposSeleccionados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEquipos, setLoadingEquipos] = useState(false);
  const [error, setError] = useState("");
  const [jornadasGeneradas, setJornadasGeneradas] = useState(null);
  const [creandoJornadas, setCreandoJornadas] = useState(false);

  // Catálogo de estancias finales
  const CatLiguilla = [
    { id: 1, nombre: "Final" },
    { id: 2, nombre: "Semifinal" },
    { id: 3, nombre: "Cuartos" },
    { id: 4, nombre: "Octavos" }
  ];

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Cargar torneos desde el contexto del usuario
      if (user?.torneos && Array.isArray(user.torneos)) {
        setTorneos(user.torneos);
      }

      setLoadingEquipos(true);
      await fetchEquipos();
      setLoadingEquipos(false);
    } catch (err) {
      setError("Error al cargar los datos. Intenta nuevamente.");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Función para generar partidos finales
  const generarPartidosFinales = (equipos, nombreJor, idFase, confLiguilla) => {
    const jornadasL = [];

    // Primera jornada (ida)
    const jornada = {
      activa: 1,
      cerrada: 0,
      idJornda: 0,
      nombreJornada: nombreJor,
      numeroJornada: 0,
      tipoJornada: idFase,
      jornada: []
    };

    const juegos = [];

    for (let i = 0; i < equipos.length; i += 2) {
      if (i + 1 < equipos.length) {
        const juego = {
          idEquipoLocal: equipos[i].id,
          nombreEquipoLocal: equipos[i].nombre,
          imgLocal: equipos[i].img,
          idEquipoVisita: equipos[i + 1].id,
          nombreEquipoVisita: equipos[i + 1].nombre,
          imgVisita: equipos[i + 1].img
        };

        juegos.push(juego);
      }
    }

    jornada.jornada = juegos;
    jornadasL.push(jornada);

    // Segunda jornada (vuelta) si es ida y vuelta
    if (confLiguilla === 2) {
      const jornadaVuelta = {
        activa: 1,
        cerrada: 0,
        idJornda: 0,
        nombreJornada: nombreJor + ' Vuelta',
        numeroJornada: 0,
        tipoJornada: idFase,
        jornada: []
      };

      const juegosVuelta = [];

      for (let i = 0; i < equipos.length; i += 2) {
        if (i + 1 < equipos.length) {
          const juego = {
            idEquipoLocal: equipos[i + 1].id,
            nombreEquipoLocal: equipos[i + 1].nombre,
            imgLocal: equipos[i + 1].img,
            idEquipoVisita: equipos[i].id,
            nombreEquipoVisita: equipos[i].nombre,
            imgVisita: equipos[i].img
          };

          juegosVuelta.push(juego);
        }
      }

      jornadaVuelta.jornada = juegosVuelta;
      jornadasL.push(jornadaVuelta);
    }

    console.log("Jornadas generadas:", jornadasL);
    console.log("Jornadas generadas JSON:", JSON.stringify(jornadasL));
    
    return jornadasL;
  };

  const handleEquipoToggle = (equipo) => {
    setEquiposSeleccionados(prev => {
      const isSelected = prev.some(e => e.id === equipo.id);
      if (isSelected) {
        return prev.filter(e => e.id !== equipo.id);
      } else {
        return [...prev, equipo];
      }
    });
  };

  const handleArmarJornadas = () => {
    if (!selectedTorneo) {
      setError("Selecciona un torneo");
      return;
    }
    
    if (!selectedEstancia) {
      setError("Selecciona una estancia final");
      return;
    }

    if (equiposSeleccionados.length < 2) {
      setError("Selecciona al menos 2 equipos");
      return;
    }

    const estanciaSeleccionada = CatLiguilla.find(e => e.id === selectedEstancia);
    const equiposRequeridos = getEquiposRequeridos(selectedEstancia);
    
    if (equiposSeleccionados.length !== equiposRequeridos) {
      setError(`Para ${estanciaSeleccionada?.nombre} necesitas exactamente ${equiposRequeridos} equipos`);
      return;
    }

    const confLiguilla = tipoPartidos === "ida-vuelta" ? 2 : 1;
    const jornadas = generarPartidosFinales(
      equiposSeleccionados,
      estanciaSeleccionada.nombre,
      selectedEstancia,
      confLiguilla
    );

    setJornadasGeneradas(jornadas);
    setError("");
  };

  const handleCrearJornadasFinales = async () => {
    if (!jornadasGeneradas) {
      setError("Debes armar las jornadas antes de crearlas");
      return;
    }

    setCreandoJornadas(true);
    setError("");

    try {
      const success = await addJuegosLiguilla(selectedTorneo, jornadasGeneradas);

      if (success) {
        alert("Jornadas finales creadas exitosamente");
        
        const estanciaSeleccionada = CatLiguilla.find(e => e.id === selectedEstancia);
        
        if (onJornadasFinalesCreated) {
          const jornadasFinalesData = {
            torneoId: selectedTorneo,
            estanciaId: selectedEstancia,
            estanciaNombre: estanciaSeleccionada?.nombre,
            tipoPartidos,
            equipos: equiposSeleccionados,
            jornadasGeneradas
          };
          onJornadasFinalesCreated(jornadasFinalesData);
        }
        
        handleClose();
      } else {
        setError("Error al crear las jornadas finales. Intenta nuevamente.");
      }
    } catch (err) {
      console.error("Error al crear jornadas finales:", err);
      setError("Error al crear las jornadas finales. Intenta nuevamente.");
    } finally {
      setCreandoJornadas(false);
    }
  };

  const handleClose = () => {
    setSelectedTorneo("");
    setSelectedEstancia("");
    setTipoPartidos("ida");
    setEquiposSeleccionados([]);
    setJornadasGeneradas(null);
    setError("");
    onClose();
  };

  const getEquiposRequeridos = (estanciaId) => {
    switch (estanciaId) {
      case 1: return 2;  // Final
      case 2: return 4;  // Semifinal
      case 3: return 8;  // Cuartos
      case 4: return 16; // Octavos
      default: return 2;
    }
  };

  const equiposRequeridos = selectedEstancia ? getEquiposRequeridos(selectedEstancia) : 0;
  const estanciaSeleccionada = CatLiguilla.find(e => e.id === selectedEstancia);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 600, md: 700 },
          maxWidth: "100%"
        }
      }}
    >
      <Box sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: "50%", 
            background: "linear-gradient(45deg, #FFD700, #FFA500)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mr: 2
          }}>
            <EmojiEventsIcon sx={{ color: "white" }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Crear Jornadas Finales
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ flex: 1, overflowY: "auto" }}>
            {/* Selección de torneo */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Seleccionar Torneo</InputLabel>
              <Select
                value={selectedTorneo}
                onChange={(e) => setSelectedTorneo(e.target.value)}
                label="Seleccionar Torneo"
              >
                {torneos.map((torneo) => (
                  <MenuItem key={torneo.id} value={torneo.id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar src={torneo.img} sx={{ width: 32, height: 32 }} />
                      <Typography>{torneo.nombre}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        (Tipo: {torneo.tipoTorneo === 0 ? "Liga" : torneo.tipoTorneo === 1 ? "Copa" : "Grupos"})
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Selección de estancia final */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Estancia Final</InputLabel>
              <Select
                value={selectedEstancia}
                onChange={(e) => setSelectedEstancia(e.target.value)}
                label="Estancia Final"
              >
                {CatLiguilla.map((estancia) => (
                  <MenuItem key={estancia.id} value={estancia.id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <EmojiEventsIcon color="warning" />
                      <Typography>{estancia.nombre}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({getEquiposRequeridos(estancia.id)} equipos)
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Tipo de partidos */}
            <FormControl sx={{ mb: 3 }}>
              <FormLabel>Tipo de Partidos</FormLabel>
              <RadioGroup
                value={tipoPartidos}
                onChange={(e) => setTipoPartidos(e.target.value)}
                row
              >
                <FormControlLabel value="ida" control={<Radio />} label="Solo Ida" />
                <FormControlLabel value="ida-vuelta" control={<Radio />} label="Ida y Vuelta" />
              </RadioGroup>
            </FormControl>

            <Divider sx={{ my: 3 }} />

            {/* Mostrar jornadas generadas o selección de equipos */}
            {jornadasGeneradas ? (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "warning.main" }}>
                    ✅ Jornadas Generadas ({jornadasGeneradas.length} jornadas)
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setJornadasGeneradas(null)}
                    color="warning"
                  >
                    Modificar
                  </Button>
                </Box>

                <Box sx={{ 
                  border: "1px solid",
                  borderColor: "warning.main",
                  borderRadius: 2,
                  maxHeight: 400,
                  overflowY: "auto",
                  bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255,215,0,0.1)" : "rgba(255,215,0,0.05)"
                }}>
                  {jornadasGeneradas.map((jornada, jornadaIndex) => (
                    <Box key={jornadaIndex} sx={{ p: 2, borderBottom: jornadaIndex < jornadasGeneradas.length - 1 ? "1px solid" : "none", borderBottomColor: "divider" }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "warning.main" }}>
                        {jornada.nombreJornada}
                      </Typography>
                      
                      {jornada.jornada && jornada.jornada.map((partido, partidoIndex) => (
                        <Box key={partidoIndex} sx={{ 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "space-between",
                          p: 2,
                          mb: 1,
                          borderRadius: 1,
                          bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                          border: "1px solid",
                          borderColor: "divider"
                        }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar src={partido.imgLocal} sx={{ width: 24, height: 24, mr: 1 }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {partido.nombreEquipoLocal}
                            </Typography>
                          </Box>
                          <Typography variant="body1" sx={{ mx: 2, fontWeight: 700, color: "warning.main" }}>
                            VS
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {partido.nombreEquipoVisita}
                            </Typography>
                            <Avatar src={partido.imgVisita} sx={{ width: 24, height: 24, ml: 1 }} />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <>
                {/* Información de equipos requeridos */}
                {selectedEstancia && (
                  <Box sx={{ 
                    mb: 3, 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255,215,0,0.1)" : "rgba(255,215,0,0.1)",
                    border: "1px solid",
                    borderColor: "warning.main"
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "warning.main" }}>
                      {estanciaSeleccionada?.nombre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Equipos requeridos: {equiposRequeridos} | Seleccionados: {equiposSeleccionados.length}
                    </Typography>
                  </Box>
                )}

                {/* Selección de equipos */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Equipos Participantes ({equiposSeleccionados.length}/{equiposRequeridos || 0})
                  </Typography>

                  {loadingEquipos ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <Box sx={{ 
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      maxHeight: 300,
                      overflowY: "auto",
                      bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"
                    }}>
                      {equipos
                        .sort((a, b) => a.nombre.localeCompare(b.nombre))
                        .map((equipo, index) => (
                        <Box
                          key={equipo.id}
                          onClick={() => handleEquipoToggle(equipo)}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 2,
                            cursor: "pointer",
                            borderBottom: index < equipos.length - 1 ? "1px solid" : "none",
                            borderBottomColor: "divider",
                            bgcolor: equiposSeleccionados.some(e => e.id === equipo.id) 
                              ? "warning.light" 
                              : "transparent",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              bgcolor: equiposSeleccionados.some(e => e.id === equipo.id)
                                ? "warning.main"
                                : "action.hover",
                              transform: "translateX(4px)"
                            }
                          }}
                        >
                          <Avatar 
                            src={equipo.img} 
                            sx={{ width: 36, height: 36, mr: 2 }}
                            alt={equipo.nombre}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {equipo.nombre}
                            </Typography>
                            {equipo.descripcion && (
                              <Typography variant="caption" color="text.secondary">
                                {equipo.descripcion}
                              </Typography>
                            )}
                          </Box>
                          {equiposSeleccionados.some(e => e.id === equipo.id) && (
                            <EmojiEventsIcon color="warning" />
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Equipos seleccionados */}
                  {equiposSeleccionados.length > 0 && (
                    <Box sx={{ 
                      mt: 2, 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255,215,0,0.1)" : "rgba(255,215,0,0.1)",
                      border: "1px solid",
                      borderColor: "warning.main"
                    }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: "warning.main" }}>
                        Equipos Seleccionados ({equiposSeleccionados.length})
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {equiposSeleccionados.map((equipo) => (
                          <Chip
                            key={equipo.id}
                            label={equipo.nombre}
                            size="small"
                            onDelete={() => handleEquipoToggle(equipo)}
                            color="warning"
                            variant="outlined"
                            avatar={<Avatar src={equipo.img} sx={{ width: 20, height: 20 }} />}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </>
            )}
          </Box>
        )}

        {/* Botones de acción */}
        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleClose}
          >
            Cancelar
          </Button>
          
          {!jornadasGeneradas ? (
            <Button
              variant="contained"
              color="warning"
              fullWidth
              onClick={handleArmarJornadas}
              disabled={loading || !selectedTorneo || !selectedEstancia || equiposSeleccionados.length !== equiposRequeridos}
            >
              Armar Jornadas
            </Button>
          ) : (
            <Button
              variant="contained"
              fullWidth
              onClick={handleCrearJornadasFinales}
              disabled={loading || creandoJornadas}
              sx={{
                background: "linear-gradient(45deg, #FFD700, #FFA500)",
                color: "white",
                "&:hover": {
                  background: "linear-gradient(45deg, #FFC107, #FF9800)"
                }
              }}
            >
              {creandoJornadas ? "Creando..." : "Crear Jornadas Finales"}
            </Button>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default CrearJornadasFinalesDrawer;
