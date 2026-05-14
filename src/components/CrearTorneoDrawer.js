import React, { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Checkbox,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Avatar,
  Chip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import useTorneos from "../hooks/useTorneos";
import useEquipos from "../hooks/useEquipos";

const CrearTorneoDrawer = ({ open, onClose, onTorneoCreated }) => {
  const { getCatTorneos, getArmarJornadasGrupos, addJornadasGrupos } = useTorneos();
  const { equipos, fetchEquipos } = useEquipos();
  
  const [catTorneos, setCatTorneos] = useState([]);
  const [selectedCatTorneo, setSelectedCatTorneo] = useState("");
  const [equiposPorGrupo, setEquiposPorGrupo] = useState(4);
  const [tipoPartidos, setTipoPartidos] = useState("ida");
  const [tipoSorteo, setTipoSorteo] = useState("aleatorio");
  const [equiposSeleccionados, setEquiposSeleccionados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEquipos, setLoadingEquipos] = useState(false);
  const [error, setError] = useState("");
  const [searchEquipos, setSearchEquipos] = useState("");
  const [armandoJornadas, setArmandoJornadas] = useState(false);
  const [jornadasArmadas, setJornadasArmadas] = useState(null);
  const [creandoTorneo, setCreandoTorneo] = useState(false);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const catTorneosData = await getCatTorneos();
      if (catTorneosData?.data?.catTorneo) {
        setCatTorneos(catTorneosData.data.catTorneo);
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

  const handleSelectAll = () => {
    if (equiposSeleccionados.length === equipos.length) {
      setEquiposSeleccionados([]);
    } else {
      setEquiposSeleccionados([...equipos]);
    }
  };

  const handleClose = () => {
    setSelectedCatTorneo("");
    setEquiposPorGrupo(4);
    setTipoPartidos("ida");
    setTipoSorteo("aleatorio");
    setEquiposSeleccionados([]);
    setSearchEquipos("");
    setJornadasArmadas(null);
    setError("");
    onClose();
  };

  const handleCrearTorneo = async () => {
    if (!selectedCatTorneo) {
      setError("Selecciona un tipo de torneo");
      return;
    }
    
    if (!jornadasArmadas) {
      setError("Debes armar las jornadas antes de crear el torneo");
      return;
    }

    setCreandoTorneo(true);
    setError("");

    try {
      const torneoSeleccionado = catTorneos.find(cat => cat.id === selectedCatTorneo);
      
      if (!torneoSeleccionado) {
        setError("No se pudo encontrar el torneo seleccionado");
        return;
      }

      const success = await addJornadasGrupos(
        torneoSeleccionado.nombre,
        selectedCatTorneo,
        jornadasArmadas
      );

      if (success) {
        alert("Torneo creado exitosamente");
        
        if (onTorneoCreated) {
          const torneoData = {
            catTorneoId: selectedCatTorneo,
            nombre: torneoSeleccionado.nombre,
            equiposPorGrupo,
            tipoPartidos,
            tipoSorteo,
            equipos: equiposSeleccionados,
            jornadasArmadas
          };
          onTorneoCreated(torneoData);
        }
        
        handleClose();
      } else {
        setError("Error al crear el torneo. Intenta nuevamente.");
      }
    } catch (err) {
      console.error("Error al crear torneo:", err);
      setError("Error al crear el torneo. Intenta nuevamente.");
    } finally {
      setCreandoTorneo(false);
    }
  };

  const handleArmarJornadas = async () => {
    if (!selectedCatTorneo) {
      setError("Selecciona un tipo de torneo");
      return;
    }
    
    if (equiposSeleccionados.length < 2) {
      setError("Selecciona al menos 2 equipos");
      return;
    }

    setArmandoJornadas(true);
    setError("");

    try {
      const confJor = tipoPartidos === "ida-vuelta" ? 2 : 1;
      const conAle = tipoSorteo === "aleatorio" ? 1 : 2; // 1 = aleatorio, 2 = por posición

      const result = await getArmarJornadasGrupos(
        selectedCatTorneo,
        equiposPorGrupo,
        confJor,
        conAle,
        equiposSeleccionados
      );

      if (result) {
        console.log("Jornadas armadas exitosamente:", result);
        setJornadasArmadas(result);
      } else {
        setError("Error al armar las jornadas. Intenta nuevamente.");
      }
    } catch (err) {
      console.error("Error al armar jornadas:", err);
      setError("Error al armar las jornadas. Intenta nuevamente.");
    } finally {
      setArmandoJornadas(false);
    }
  };

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
            background: "linear-gradient(45deg, #FF6B6B, #4ECDC4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mr: 2
          }}>
            <AddIcon sx={{ color: "white" }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Crear Nuevo Torneo
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
            {/* Selección de tipo de torneo */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Tipo de Torneo</InputLabel>
              <Select
                value={selectedCatTorneo}
                onChange={(e) => setSelectedCatTorneo(e.target.value)}
                label="Tipo de Torneo"
              >
                {catTorneos.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar src={cat.img} sx={{ width: 32, height: 32 }} />
                      <Typography>{cat.nombre}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        (Tipo: {cat.tipoTorneo === 0 ? "Liga" : cat.tipoTorneo === 1 ? "Copa" : "Grupos"})
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Equipos por grupo */}
            <TextField
              fullWidth
              label="Número de Equipos por Grupo"
              type="number"
              value={equiposPorGrupo}
              onChange={(e) => setEquiposPorGrupo(parseInt(e.target.value) || 4)}
              inputProps={{ min: 2, max: 8 }}
              sx={{ mb: 3 }}
            />

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

            {/* Tipo de sorteo */}
            <FormControl sx={{ mb: 3 }}>
              <FormLabel>Método de Sorteo</FormLabel>
              <RadioGroup
                value={tipoSorteo}
                onChange={(e) => setTipoSorteo(e.target.value)}
                row
              >
                <FormControlLabel value="aleatorio" control={<Radio />} label="Aleatorio" />
                <FormControlLabel value="posicion" control={<Radio />} label="Por Posición" />
              </RadioGroup>
            </FormControl>

            <Divider sx={{ my: 3 }} />

            {/* Mostrar jornadas armadas o selección de equipos */}
            {jornadasArmadas ? (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "success.main" }}>
                    ✅ Jornadas Armadas ({jornadasArmadas.length} grupos)
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setJornadasArmadas(null)}
                    color="secondary"
                  >
                    Modificar
                  </Button>
                </Box>

                <Box sx={{ 
                  border: "1px solid",
                  borderColor: "success.main",
                  borderRadius: 2,
                  maxHeight: 400,
                  overflowY: "auto",
                  bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(76, 175, 80, 0.1)" : "rgba(76, 175, 80, 0.05)"
                }}>
                  {jornadasArmadas.map((grupo, grupoIndex) => (
                    <Box key={grupoIndex} sx={{ p: 2, borderBottom: grupoIndex < jornadasArmadas.length - 1 ? "1px solid" : "none", borderBottomColor: "divider" }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}>
                        Grupo {grupoIndex + 1} ({grupo.equipos?.length || 0} equipos)
                      </Typography>
                      
                      {/* Equipos del grupo */}
                      {grupo.equipos && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 1, display: "block" }}>
                            Equipos:
                          </Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {grupo.equipos.map((equipo) => (
                              <Chip
                                key={equipo.id}
                                label={equipo.nombre}
                                size="small"
                                color="primary"
                                variant="outlined"
                                avatar={<Avatar src={equipo.img} sx={{ width: 20, height: 20 }} />}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}

                      {/* Jornadas del grupo */}
                      {grupo.jornadas && grupo.jornadas.length > 0 && (
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 1, display: "block" }}>
                            Jornadas ({grupo.jornadas.length}):
                          </Typography>
                          {grupo.jornadas.map((jornada, jornadaIndex) => (
                            <Box key={jornadaIndex} sx={{ mb: 1 }}>
                              <Typography variant="caption" sx={{ fontWeight: 600, color: "secondary.main" }}>
                                Jornada {jornada.numeroJornada}:
                              </Typography>
                              {jornada.jornada && jornada.jornada.map((partido, partidoIndex) => (
                                <Box key={partidoIndex} sx={{ 
                                  display: "flex", 
                                  alignItems: "center", 
                                  justifyContent: "space-between",
                                  p: 1,
                                  mt: 0.5,
                                  borderRadius: 1,
                                  bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)"
                                }}>
                                  <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <Avatar src={partido.imgLocal} sx={{ width: 20, height: 20, mr: 1 }} />
                                    <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                                      {partido.nombreEquipoLocal}
                                    </Typography>
                                  </Box>
                                  <Typography variant="caption" sx={{ mx: 2, fontWeight: 600 }}>
                                    VS
                                  </Typography>
                                  <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                                      {partido.nombreEquipoVisita}
                                    </Typography>
                                    <Avatar src={partido.imgVisita} sx={{ width: 20, height: 20, ml: 1 }} />
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Equipos Participantes ({equiposSeleccionados.length})
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleSelectAll}
                    disabled={loadingEquipos}
                  >
                    {equiposSeleccionados.length === equipos.length ? "Deseleccionar Todos" : "Seleccionar Todos"}
                  </Button>
                </Box>

                <TextField
                  fullWidth
                  placeholder="Buscar equipos..."
                  value={searchEquipos}
                  onChange={(e) => setSearchEquipos(e.target.value)}
                  size="small"
                  sx={{ mb: 2 }}
                />

                {loadingEquipos ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <Box sx={{ 
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    maxHeight: 350,
                    overflowY: "auto",
                    bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"
                  }}>
                    {equipos
                      .filter(equipo => 
                        (equipo.nombre || "").toLowerCase().includes((searchEquipos || "").toLowerCase())
                      )
                      .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""))
                      .map((equipo, index, filteredArray) => (
                      <Box
                        key={equipo.id}
                        onClick={() => handleEquipoToggle(equipo)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          p: 2,
                          cursor: "pointer",
                          borderBottom: index < filteredArray.length - 1 ? "1px solid" : "none",
                          borderBottomColor: "divider",
                          bgcolor: equiposSeleccionados.some(e => e.id === equipo.id) 
                            ? "primary.light" 
                            : "transparent",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: equiposSeleccionados.some(e => e.id === equipo.id)
                              ? "primary.main"
                              : "action.hover",
                            transform: "translateX(4px)"
                          }
                        }}
                      >
                        <Checkbox
                          checked={equiposSeleccionados.some(e => e.id === equipo.id)}
                          sx={{ mr: 2 }}
                          color="primary"
                        />
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
                        {equipo.totalJugadores && (
                          <Chip 
                            label={`${equipo.totalJugadores} jugadores`}
                            size="small"
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    ))}
                    
                    {equipos.filter(equipo => 
                      (equipo.nombre || "").toLowerCase().includes((searchEquipos || "").toLowerCase())
                    ).length === 0 && (
                      <Box sx={{ p: 4, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          {searchEquipos ? "No se encontraron equipos" : "No hay equipos disponibles"}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {equiposSeleccionados.length > 0 && (
                  <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                    border: "1px solid",
                    borderColor: "primary.main"
                  }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: "primary.main" }}>
                      Equipos Seleccionados ({equiposSeleccionados.length})
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {equiposSeleccionados.map((equipo) => (
                        <Chip
                          key={equipo.id}
                          label={equipo.nombre}
                          size="small"
                          onDelete={() => handleEquipoToggle(equipo)}
                          color="primary"
                          variant="outlined"
                          avatar={<Avatar src={equipo.img} sx={{ width: 20, height: 20 }} />}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}

        {/* Botones de acción */}
        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleClose}
            disabled={armandoJornadas}
          >
            Cancelar
          </Button>
          
          {!jornadasArmadas ? (
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={handleArmarJornadas}
              disabled={loading || !selectedCatTorneo || equiposSeleccionados.length < 2 || armandoJornadas}
            >
              {armandoJornadas ? "Armando..." : "Armar Jornadas"}
            </Button>
          ) : (
            <Button
              variant="contained"
              fullWidth
              onClick={handleCrearTorneo}
              disabled={loading || creandoTorneo}
              sx={{
                background: "linear-gradient(45deg, #4CAF50, #8BC34A)",
                "&:hover": {
                  background: "linear-gradient(45deg, #388E3C, #689F38)"
                }
              }}
            >
              {creandoTorneo ? "Creando..." : "Crear Torneo"}
            </Button>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default CrearTorneoDrawer;
