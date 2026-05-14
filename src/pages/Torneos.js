import React, { useState, useEffect, useContext } from "react";
import { Container, Typography, Tabs, Tab, AppBar, Toolbar, Box, CircularProgress } from "@mui/material";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Grid,
} from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import useTorneos from "../hooks/useTorneos";
import TabPanel from "../components/TabPanel";
import TablaGeneral from "../components/TablaGeneral";
import Jornadas from "../components/Jornadas";
import JornadasPendientes from "../components/JornadasPendientes";
import TablaGoleo from "../components/TablaGoleo"; // <-- Agrega la importación
import TemporadaDrawer from "../components/TemporadaDrawer";

export default function Torneos() {
  const { user, login } = useContext(AuthContext); // Agregar login para actualizar el contexto
  const { tablaGeneral, jornadas,golesTorneo, golesTorneoEquipo, error, fetchTorneoGeneral, fetchGruposTorneo, setGrupos, setTablaGeneral, setJornadas } = useTorneos();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTorneo, setSelectedTorneo] = useState(null);
  const [loadingTorneo, setLoadingTorneo] = useState(false);
  const [showAllGoleo, setShowAllGoleo] = useState(false);
  const [showAllGoleoEquipo, setShowAllGoleoEquipo] = useState(false);
  const [showTemporadaDrawer, setShowTemporadaDrawer] = useState(false);
  const [currentTemporada, setCurrentTemporada] = useState(null);

  useEffect(() => {
    // Cargar temporada actual de sesión
    const storedTemporada = sessionStorage.getItem("selectedTemporada");
    if (storedTemporada) {
      const temporadaData = JSON.parse(storedTemporada);
      setCurrentTemporada(temporadaData);
    }
  }, []);

  useEffect(() => {
    if (user?.torneos && Array.isArray(user.torneos) && user.torneos.length > 0) {
      console.log("Torneos cargados desde user.torneos:", user.torneos);
      const storedTorneo = JSON.parse(sessionStorage.getItem("selectedTorneo"));
      if (storedTorneo) {
        console.log("Torneo cargado desde sesión:", storedTorneo);
        setSelectedTorneo(storedTorneo);
        handleTorneoSelect(storedTorneo);
      } else {
        const firstTorneo = user.torneos[0];
        console.log("Primer torneo seleccionado:", firstTorneo);
        sessionStorage.setItem("selectedTorneo", JSON.stringify(firstTorneo));
        setSelectedTorneo(firstTorneo);
        handleTorneoSelect(firstTorneo);
      }
    } else {
      console.error("No se encontraron torneos en user.torneos o no es un array válido:", user?.torneos);
    }
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleTorneoSelect = async (torneo) => {
    setLoadingTorneo(true);
    sessionStorage.setItem("selectedTorneo", JSON.stringify(torneo));
    setSelectedTorneo(torneo);

    try {
      if (torneo.tipoTorneo === 2) {
        await fetchGruposTorneo(torneo.id);
        
        // Validar que los grupos se obtuvieron correctamente
        const gruposTorneoRaw = sessionStorage.getItem("gruposTorneo");
        console.log("Datos raw obtenidos:", gruposTorneoRaw);
        
        // Verificar si la respuesta es HTML (sesión expirada)
        if (typeof gruposTorneoRaw === 'string' && 
            (gruposTorneoRaw.includes('<!DOCTYPE HTML') || 
             gruposTorneoRaw.includes('Sesión no válida') || 
             gruposTorneoRaw.includes('Inactividad de Sesión'))) {
          console.error("Sesión expirada detectada en handleTorneoSelect");
          sessionStorage.clear();
          window.location.href = '/fifa-app/login'; // Redirigir al login
          return;
        }
        
        try {
          const gruposTorneo = JSON.parse(gruposTorneoRaw || "[]");
          if (Array.isArray(gruposTorneo)) {
            setGrupos(gruposTorneo);
          } else {
            console.error("Datos de grupos inválidos:", gruposTorneo);
            setGrupos([]);
          }
        } catch (parseError) {
          console.error("Error al parsear grupos:", parseError);
          sessionStorage.removeItem("gruposTorneo");
          setGrupos([]);
        }
      }
      await fetchTorneoGeneral();
    } catch (error) {
      console.error("Error al seleccionar torneo:", error);
      // Si hay error, limpiar datos posiblemente corruptos
      sessionStorage.removeItem("gruposTorneo");
      setGrupos([]);
    } finally {
      setLoadingTorneo(false);
    }
  };

  const updateGlobalData = (data) => {
    try {
      // Actualiza los estados globales con los datos proporcionados
      setTablaGeneral(data.tablaGeneral || []);
      setJornadas(data.jornadas || []);
      console.log("Datos globales actualizados:", data);
    } catch (error) {
      console.error("Error al actualizar los datos globales:", error);
    }
  };

  const renderTablasPorGrupos = () => {
    try {
      const gruposTorneoRaw = sessionStorage.getItem("gruposTorneo");
      console.log("Datos raw de gruposTorneo:", gruposTorneoRaw);
      
      // Verificar si la respuesta es HTML (sesión expirada) antes de parsear
      if (typeof gruposTorneoRaw === 'string' && 
          (gruposTorneoRaw.includes('<!DOCTYPE HTML') || 
           gruposTorneoRaw.includes('Sesión no válida') || 
           gruposTorneoRaw.includes('Inactividad de Sesión'))) {
        console.error("Sesión expirada detectada en renderTablasPorGrupos");
        sessionStorage.clear();
        return (
          <Typography variant="body2" color="error">
            Sesión expirada. Por favor, inicia sesión nuevamente.
          </Typography>
        );
      }
      
      const gruposTorneo = JSON.parse(gruposTorneoRaw || "[]");
      console.log("Grupos del torneo:", gruposTorneo, tablaGeneral);
      
      // Validar que gruposTorneo sea un array válido
      if (!Array.isArray(gruposTorneo)) {
        console.error("gruposTorneo no es un array válido:", gruposTorneo);
        sessionStorage.removeItem("gruposTorneo");
        return (
          <Typography variant="body2" color="error">
            Error: Datos de grupos corruptos. Por favor, refresca la página.
          </Typography>
        );
      }
      
      if (gruposTorneo.length > 0) {
        return gruposTorneo.map((grupo, index) => (
          <Box key={index} sx={{ marginBottom: 4 }}>
            <Typography variant="h5" gutterBottom>
              Grupo {grupo.numero}
            </Typography>
            <TablaGeneral
              data={Array.isArray(tablaGeneral) ? 
                tablaGeneral.filter((equipo) => 
                  Array.isArray(grupo.equipos) ? 
                    grupo.equipos.some((e) => e.id === equipo.idEquipo) : 
                    []
                ) : []
              }
            />
          </Box>
        ));
      }
    } catch (error) {
      console.error("Error al procesar grupos del torneo:", error);
      sessionStorage.removeItem("gruposTorneo");
      return (
        <Typography variant="body2" color="error">
          Error al cargar los grupos. Por favor, inicia sesión nuevamente.
        </Typography>
      );
    }
  
    return (
      <Typography variant="body2" color="textSecondary">
        No hay grupos disponibles para este torneo.
      </Typography>
    );
  };

  const getJornadasPendientes = () => {
    if (!Array.isArray(jornadas)) {
      console.error("jornadas no es un array válido:", jornadas);
      return [];
    }
    
    const pendientes = jornadas
      .flatMap((item) => Array.isArray(item.jornada) ? item.jornada : [])
      .filter(
        (jor) =>
          (jor.idEquipoLocal === Number(user.idEquipo) || jor.idEquipoVisita === Number(user.idEquipo)) &&
          jor.golesLocal === null
      );
    return pendientes.slice(0, 3); // Devuelve solo las últimas 3 jornadas
  };

  const getFilteredJornadas = () => {
    if (!Array.isArray(jornadas)) {
      console.error("jornadas no es un array válido en getFilteredJornadas:", jornadas);
      return [];
    }
    
    if (activeTab === 1) {
      // Todas las jornadas
      return jornadas.flatMap((item) => Array.isArray(item.jornada) ? item.jornada : []);
    }
    if (activeTab === 2) {
      // Jornadas pendientes
      return jornadas.flatMap((item) => Array.isArray(item.jornada) ? item.jornada : []).filter((jor) => jor.golesLocal === null);
    }
    if (activeTab === 3) {
      // Jornadas jugadas
      return jornadas.flatMap((item) => Array.isArray(item.jornada) ? item.jornada : []).filter((jor) => jor.golesLocal !== null);
    }
    return [];
  };

  const handleTemporadaChanged = (nuevaTemporada) => {
    console.log("Nueva temporada seleccionada:", nuevaTemporada);
    setCurrentTemporada(nuevaTemporada);
    
    // Actualizar los torneos del usuario con los de la nueva temporada
    if (nuevaTemporada.torneos && Array.isArray(nuevaTemporada.torneos)) {
      const updatedUser = {
        ...user,
        torneos: nuevaTemporada.torneos,
        idTemporada: nuevaTemporada.id
      };
      
      // Actualizar el contexto con los nuevos datos
      login(updatedUser);
      
      console.log("Torneos actualizados:", nuevaTemporada.torneos);
    }
    
    // Limpiar torneo seleccionado ya que cambió la temporada
    setSelectedTorneo(null);
    sessionStorage.removeItem("selectedTorneo");
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        bgcolor: (theme) => theme.palette.mode === "dark" ? "#181a1b" : "#f5f6fa",
        minHeight: "100vh",
        py: 2,
      }}
    >
      {/* Navbar para mostrar los torneos */}
      <AppBar position="static" color="default" elevation={1} sx={{ mb: 2, borderRadius: 2 }}>
        <Toolbar sx={{ px: { xs: 1, sm: 3 } }}>
          <Box 
            sx={{ 
              display: "flex", 
              gap: 2,
              overflowX: "auto",
              width: "100%",
              pb: { xs: 1, sm: 0 },
              "&::-webkit-scrollbar": {
                height: 6,
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(0,0,0,0.2)",
                borderRadius: 3,
              },
            }}
          >
            {/* Botón para cambiar temporada */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                px: { xs: 1.5, sm: 2 },
                py: 0.5,
                borderRadius: 2,
                bgcolor: "secondary.main",
                color: "#fff",
                fontWeight: 700,
                transition: "background 0.2s, color 0.2s",
                flexShrink: 0,
                minWidth: "fit-content",
                "&:hover": {
                  opacity: 0.85,
                  bgcolor: "secondary.dark",
                },
              }}
              onClick={() => setShowTemporadaDrawer(true)}
            >
              <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                {currentTemporada ? `${currentTemporada.descripcion}` : "Cambiar Temporada"}
              </Typography>
            </Box>

            {Array.isArray(user?.torneos) && user.torneos.map((torneo) => (
              <Box
                key={torneo.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  px: { xs: 1.5, sm: 2 },
                  py: 0.5,
                  borderRadius: 2,
                  bgcolor: selectedTorneo?.id === torneo.id ? "primary.main" : "transparent",
                  color: selectedTorneo?.id === torneo.id ? "#fff" : "text.primary",
                  fontWeight: selectedTorneo?.id === torneo.id ? 700 : 400,
                  transition: "background 0.2s, color 0.2s",
                  flexShrink: 0, // Evita que se compriman
                  minWidth: "fit-content", // Asegura que mantengan su tamaño
                  "&:hover": {
                    opacity: 0.85,
                    bgcolor: "primary.light",
                    color: "#fff",
                  },
                }}
                onClick={() => handleTorneoSelect(torneo)}
              >
                <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                  {torneo.nombre}
                </Typography>
              </Box>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Loading al cambiar de torneo */}
      {loadingTorneo ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
          <CircularProgress size={48} color="primary" />
        </Box>
      ) : (
        <>
          {/* Resumen del torneo seleccionado */}
          {selectedTorneo && (
            <Box
              sx={{
                mb: 2,
                p: 2,
                bgcolor: (theme) => theme.palette.mode === "dark" ? "#23272b" : "#fff",
                borderRadius: 2,
                boxShadow: 1,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>
                Torneo: {selectedTorneo.nombre}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tipo: {selectedTorneo.tipoTorneo === 2 ? "Por Grupos" : "General"}
              </Typography>
              {/* Puedes agregar más datos del torneo aquí */}
            </Box>
          )}
          {error && <Typography color="error">{error}</Typography>}

          {/* Renderizar pestañas */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              mb: 2,
              ".MuiTab-root": { 
                fontWeight: 600, 
                fontSize: { xs: 14, sm: 16 }, 
                textTransform: "none",
                minWidth: { xs: "auto", sm: 120 },
                px: { xs: 1, sm: 2 }
              },
              ".MuiTabs-indicator": { backgroundColor: "primary.main", height: 4, borderRadius: 2 },
              ".MuiTabs-scrollButtons": {
                "&.Mui-disabled": { opacity: 0.3 }
              }
            }}
          >
            <Tab label="Tabla General" />
            <Tab label="Jornadas Activas" />
            <Tab label="Pendientes" />
            <Tab label="Jugados" />
          </Tabs>

          {/* Mostrar contenido condicionalmente */}
          {activeTab === 0 && (
            <Grid
              container
              spacing={4}
              sx={{
                height: "100%",
                overflow: "auto",
                alignItems: "flex-start",
                mt: 1,
              }}
            >
              {/* Tabla por grupos */}
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    flex: 1,
                    width: "100%",
                    bgcolor: (theme) => theme.palette.background.paper,
                    borderRadius: 2,
                    boxShadow: 2,
                    p: { xs: 1, md: 2 },
                    minHeight: 350,
                    transition: "box-shadow 0.2s, background 0.2s",
                    "&:hover": { boxShadow: 4 },
                  }}
                >
                  {renderTablasPorGrupos()}
                </Box>
              </Grid>

              {/* Jornadas Pendientes */}
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflowX: "auto",
                    width: "100%",
                    bgcolor: (theme) => theme.palette.background.paper,
                    borderRadius: 2,
                    boxShadow: 2,
                    p: { xs: 1, md: 2 },
                    minHeight: 350,
                    transition: "box-shadow 0.2s, background 0.2s",
                    "&:hover": { boxShadow: 4 },
                  }}
                >
                  <JornadasPendientes
                    jornadas={getJornadasPendientes()}
                    updateGlobalData={updateGlobalData}
                    onViewMore={() => setActiveTab(2)}
                  />
                  {/* Tabla de goleo debajo de JornadasPendientes */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                      Tabla de Goleo
                    </Typography>
                    <TablaGoleo goleo={Array.isArray(golesTorneo) ? (showAllGoleo ? golesTorneo : golesTorneo.slice(0, 6)) : []} />
                    {(Array.isArray(golesTorneo) && golesTorneo.length > 6) && (
                      <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => setShowAllGoleo((prev) => !prev)}
                        >
                          {showAllGoleo ? "Mostrar menos" : `Mostrar todos (${golesTorneo.length})`}
                        </Button>
                      </Box>
                    )}
                  </Box>

                  {/* Tabla de goleo del equipo del usuario */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                      Goleadores de tu Equipo
                    </Typography>
                    <TablaGoleo goleo={Array.isArray(golesTorneoEquipo) ? (showAllGoleoEquipo ? golesTorneoEquipo : golesTorneoEquipo.slice(0, 6)) : []} />
                    {(Array.isArray(golesTorneoEquipo) && golesTorneoEquipo.length > 6) && (
                      <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => setShowAllGoleoEquipo((prev) => !prev)}
                        >
                          {showAllGoleoEquipo ? "Mostrar menos" : `Mostrar todos (${golesTorneoEquipo.length})`}
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <TabPanel value={activeTab} index={1}>
              <Jornadas data={getFilteredJornadas()} updateGlobalData={updateGlobalData} />
            </TabPanel>
          )}

          {activeTab === 2 && (
            <TabPanel value={activeTab} index={2}>
              <Jornadas data={getFilteredJornadas()} updateGlobalData={updateGlobalData} />
            </TabPanel>
          )}

          {activeTab === 3 && (
            <TabPanel value={activeTab} index={3}>
              <Jornadas data={getFilteredJornadas()} updateGlobalData={updateGlobalData} />
            </TabPanel>
          )}
        </>
      )}

      {/* Drawer para seleccionar temporada */}
      <TemporadaDrawer
        open={showTemporadaDrawer}
        onClose={() => setShowTemporadaDrawer(false)}
        onTemporadaChanged={handleTemporadaChanged}
      />
    </Container>
  );
}