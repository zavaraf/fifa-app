import React, { useState } from "react";
import { Box, Typography, Paper, TextField, Chip } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ResumenPartidoModal from "./ResumenPartidoModal"; // Importa el componente modal

const Jornadas = ({
  data,
  updateGlobalData,
  showJornadaNumber = true,
  showSearch = true,
  itemWidth = { xs: "100%", sm: "30%" }
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [matchDetails, setMatchDetails] = useState(null);

    // Función para verificar si es una instancia final
    const esInstanciaFinal = (nombreJornada) => {
      const instanciasFinales = ["Final", "Semifinal", "Cuartos", "Octavos"];
      if (!nombreJornada) return false;
      
      return instanciasFinales.some(instancia => 
        nombreJornada.includes(instancia)
      );
    };

    // Filtrar los datos según el término de búsqueda
    const filteredData = data.filter(
      (jor) =>
        (jor.nombreEquipoLocal?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (jor.nombreEquipoVisita?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    ).sort((a, b) => parseInt(b.numeroJornada || 0) - parseInt(a.numeroJornada || 0));
  
    // Agrupar los partidos por número de jornada
    const groupedByJornada = filteredData.reduce((acc, partido) => {
      const numeroJornada = partido.numeroJornada || "Sin número";
      if (!acc[numeroJornada]) {
        acc[numeroJornada] = [];
      }
      acc[numeroJornada].push(partido);
      return acc;
    }, {});
  
    const handleOpenModal = (match) => {
      setSelectedMatch(match);
      setOpenModal(true);
    };
  
    const handleCloseModal = () => {
      setOpenModal(false);
      setSelectedMatch(null);
    };
  
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
          width: "100%",
          padding: 2,
          bgcolor: (theme) => theme.palette.background.paper,
        }}
      >
        <Paper
          sx={{
            p: 2,
            flex: 1,
            width: "100%",
            bgcolor: (theme) => theme.palette.background.paper,
            borderRadius: 2,
            boxShadow: 2,
          }}
        >
          {/* Mostrar el buscador si showSearch es true */}
          {showSearch && (
            <Box sx={{ mb: 3 }}>
              <TextField
                label="Buscar equipo"
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
              />
            </Box>
          )}
  
          {/* Renderiza los partidos agrupados por jornada */}
          {searchTerm === "" ? (
            Object.keys(groupedByJornada)
              .sort((a, b) => parseInt(b) - parseInt(a))
              .map((numeroJornada) => (
                <Box key={numeroJornada} sx={{ mb: 3, width: "100%" }}>
                  {/* Mostrar el número de la jornada si showJornadaNumber es true */}
                  {showJornadaNumber && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          color: (theme) => theme.palette.text.primary,
                        }}
                      >
                        {groupedByJornada[numeroJornada][0]?.nombreJornada && 
                         groupedByJornada[numeroJornada][0].nombreJornada !== "" 
                          ? groupedByJornada[numeroJornada][0].nombreJornada 
                          : `Jornada ${numeroJornada}`}
                      </Typography>
                      {esInstanciaFinal(groupedByJornada[numeroJornada][0]?.nombreJornada) && (
                        <Chip 
                          label="Instancia Final" 
                          color="warning" 
                          size="small" 
                          variant="filled" 
                          icon={<EmojiEventsIcon />}
                          sx={{
                            background: "linear-gradient(45deg, #FFD700, #FFA500)",
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.7rem"
                          }}
                        />
                      )}
                    </Box>
                  )}
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 2,
                      justifyContent: { xs: "center", md: "flex-start" },
                      width: "100%",
                      maxWidth: 900,
                      mx: "auto",
                    }}
                  >
                    {groupedByJornada[numeroJornada].map((jor, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          width: { xs: "100%", sm: "48%", md: "32%" },
                          minWidth: 220,
                          maxWidth: 300,
                          border: "1px solid",
                          borderColor: (theme) => theme.palette.divider,
                          borderRadius: 2,
                          padding: 2,
                          boxShadow: 1,
                          cursor: "pointer",
                          bgcolor: (theme) =>
                            index % 2 === 0
                              ? theme.palette.mode === "dark"
                                ? theme.palette.action.selected
                                : "#f9f9f9"
                              : theme.palette.background.paper,
                          transition: "box-shadow 0.2s, background 0.2s, color 0.2s",
                          "&:hover": {
                            backgroundColor: (theme) =>
                              theme.palette.mode === "dark"
                                ? theme.palette.action.hover
                                : "#e3e3e3",
                            color: (theme) => theme.palette.text.primary,
                            boxShadow: 3,
                          },
                          minHeight: 70,
                          position: "relative", // Para posicionar el icono
                        }}
                        onClick={() => handleOpenModal(jor)}
                      >
                        {/* Distintivo de instancia final en el partido */}
                        {esInstanciaFinal(jor.nombreJornada) && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              zIndex: 1,
                            }}
                          >
                            <EmojiEventsIcon
                              sx={{
                                color: "#FFD700",
                                fontSize: 16,
                                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                              }}
                            />
                          </Box>
                        )}

                        <Box
                          sx={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                            width: "100%",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <img
                                src={jor.imgLocal}
                                alt={jor.nombreEquipoLocal}
                                style={{
                                  width: 18,
                                  height: 18,
                                  objectFit: "contain",
                                  marginRight: 5,
                                }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 500,
                                  maxWidth: { xs: 80, md: "none" }, // Limita en móvil, muestra completo en desktop
                                  whiteSpace: { xs: "nowrap", md: "normal" },
                                  overflow: { xs: "hidden", md: "visible" },
                                  textOverflow: { xs: "ellipsis", md: "unset" },
                                }}
                                title={jor.nombreEquipoLocal}
                              >
                                {jor.nombreEquipoLocal}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {jor.golesLocal ?? "-"}
                            </Typography>
                          </Box>
  
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <img
                                src={jor.imgVisita}
                                alt={jor.nombreEquipoVisita}
                                style={{
                                  width: 18,
                                  height: 18,
                                  objectFit: "contain",
                                  marginRight: 5,
                                }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 500,
                                  maxWidth: { xs: 80, md: "none" }, // Limita en móvil, muestra completo en desktop
                                  whiteSpace: { xs: "nowrap", md: "normal" },
                                  overflow: { xs: "hidden", md: "visible" },
                                  textOverflow: { xs: "ellipsis", md: "unset" },
                                }}
                                title={jor.nombreEquipoVisita}
                              >
                                {jor.nombreEquipoVisita}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {jor.golesVisita ?? "-"}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))
          ) : (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                justifyContent: { xs: "center", md: "flex-start" },
                width: "100%",
                maxWidth: 900,
                mx: "auto",
              }}
            >
              {filteredData.map((jor, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: { xs: "100%", sm: "48%", md: "32%" },
                    minWidth: 220,
                    maxWidth: 300,
                    border: "1px solid",
                    borderColor: (theme) => theme.palette.divider,
                    borderRadius: 2,
                    padding: 2,
                    boxShadow: 1,
                    cursor: "pointer",
                    bgcolor: (theme) =>
                      index % 2 === 0
                        ? theme.palette.mode === "dark"
                          ? theme.palette.action.selected
                          : "#f9f9f9"
                        : theme.palette.background.paper,
                    transition: "box-shadow 0.2s, background 0.2s, color 0.2s",
                    "&:hover": {
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? theme.palette.action.hover
                          : "#e3e3e3",
                      color: (theme) => theme.palette.text.primary,
                      boxShadow: 3,
                    },
                    minHeight: 70,
                    position: "relative", // Para posicionar el icono
                  }}
                  onClick={() => handleOpenModal(jor)}
                >
                  {/* Distintivo de instancia final en el partido filtrado */}
                  {esInstanciaFinal(jor.nombreJornada) && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        zIndex: 1,
                      }}
                    >
                      <EmojiEventsIcon
                        sx={{
                          color: "#FFD700",
                          fontSize: 16,
                          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                        }}
                      />
                    </Box>
                  )}

                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      width: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <img
                          src={jor.imgLocal}
                          alt={jor.nombreEquipoLocal}
                          style={{
                            width: 18,
                            height: 18,
                            objectFit: "contain",
                            marginRight: 5,
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 500,
                            maxWidth: { xs: 80, md: "none" }, // Limita en móvil, muestra completo en desktop
                            whiteSpace: { xs: "nowrap", md: "normal" },
                            overflow: { xs: "hidden", md: "visible" },
                            textOverflow: { xs: "ellipsis", md: "unset" },
                          }}
                          title={jor.nombreEquipoLocal}
                        >
                          {jor.nombreEquipoLocal}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {jor.golesLocal ?? "-"}
                      </Typography>
                    </Box>
  
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <img
                          src={jor.imgVisita}
                          alt={jor.nombreEquipoVisita}
                          style={{
                            width: 18,
                            height: 18,
                            objectFit: "contain",
                            marginRight: 5,
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 500,
                            maxWidth: { xs: 80, md: "none" }, // Limita en móvil, muestra completo en desktop
                            whiteSpace: { xs: "nowrap", md: "normal" },
                            overflow: { xs: "hidden", md: "visible" },
                            textOverflow: { xs: "ellipsis", md: "unset" },
                          }}
                          title={jor.nombreEquipoVisita}
                        >
                          {jor.nombreEquipoVisita}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {jor.golesVisita ?? "-"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
  
        {/* Usa el nuevo componente ResumenPartidoModal */}
        <ResumenPartidoModal
          open={openModal}
          onClose={handleCloseModal}
          jornada={selectedMatch}
          matchDetails={matchDetails}
          updateMatchDetails={setMatchDetails}
          updateGlobalData={updateGlobalData}
        />
      </Box>
    );
  };
  
  export default Jornadas;