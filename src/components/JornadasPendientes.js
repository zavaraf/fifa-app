import React, { useState } from "react";
import { Box, Typography, Button, Card, Avatar, Divider, Chip } from "@mui/material";
import ResumenPartidoModal from "./ResumenPartidoModal";

const JornadasPendientes = ({ jornadas, updateGlobalData, onViewMore }) => {
  const [selectedJornada, setSelectedJornada] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [matchDetails, setMatchDetails] = useState(null);

  const handleOpenModal = (jornada) => {
    setSelectedJornada(jornada);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedJornada(null);
  };

  // Función para acortar el nombre
  const shortName = (name) => {
    if (!name) return "";
    return name.length > 13 ? name.slice(0, 10) + "..." : name;
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        width: "100%",
        minWidth: 0,
        p: { xs: 1, sm: 2 },
        bgcolor: (theme) => theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: 2,
        maxHeight: { xs: "none", md: 500 },
        overflowY: "auto",
        height: "100%",
      }}
    >
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          fontWeight: 600,
          fontSize: { xs: 16, sm: 18 },
          color: (theme) => theme.palette.text.primary,
        }}
      >
        Jornadas Pendientes
      </Typography>
      {jornadas.length > 0 ? (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            justifyContent: "flex-start",
            alignItems: "center",
            mt: 0, // elimina margen superior extra
          }}
        >
          {jornadas.map((jor, index) => (
            <Card
              key={index}
              sx={{
                width: 170,
                minWidth: 120,
                maxWidth: 200,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                p: 1.2,
                borderRadius: 2,
                boxShadow: 1,
                cursor: "pointer",
                transition: "box-shadow 0.2s, background 0.2s, transform 0.2s",
                "&:hover": {
                  backgroundColor: "#f0f4ff",
                  boxShadow: 4,
                  transform: "scale(1.04)",
                },
                position: "relative",
                bgcolor: (theme) =>
                  index % 2 === 0
                    ? theme.palette.mode === "dark"
                      ? theme.palette.action.selected
                      : "#f9f9f9"
                    : theme.palette.background.paper,
                mt: 0.5, // acerca las tarjetas a la parte superior
              }}
              onClick={() => handleOpenModal(jor)}
            >
              <Avatar
                src={jor.imgLocal}
                alt={jor.nombreEquipoLocal}
                sx={{ 
                  width: 28, 
                  height: 28, 
                  mx: 1,
                  bgcolor: 'primary.main',
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                {!jor.imgLocal && (jor.nombreEquipoLocal || "?").charAt(0).toUpperCase()}
              </Avatar>
              <Typography
                variant="body2"
                sx={{
                  color: (theme) => theme.palette.text.secondary,
                  fontWeight: 700,
                  mx: 1,
                }}
              >
                vs
              </Typography>
              <Avatar
                src={jor.imgVisita}
                alt={jor.nombreEquipoVisita}
                sx={{ 
                  width: 28, 
                  height: 28, 
                  mx: 1,
                  bgcolor: 'secondary.main',
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                {!jor.imgVisita && (jor.nombreEquipoVisita || "?").charAt(0).toUpperCase()}
              </Avatar>
              <Chip
                label="Pendiente"
                color="warning"
                size="small"
                sx={{
                  position: "absolute",
                  top: 4, // más arriba
                  right: 8,
                  fontSize: 9,
                  fontWeight: 600,
                  height: 16,
                  "& .MuiChip-label": { p: 0.5, fontSize: 9 },
                }}
              />
            </Card>
          ))}
        </Box>
      ) : (
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ mt: 2, color: (theme) => theme.palette.text.secondary }}
        >
          No hay jornadas pendientes de capturar.
        </Typography>
      )}
      <Button
        variant="outlined"
        color="primary"
        sx={{
          mt: 2,
          alignSelf: "center",
          fontSize: 13,
          px: 2,
          py: 0.5,
          minWidth: 0,
        }}
        onClick={onViewMore}
      >
        Ver más
      </Button>

      <ResumenPartidoModal
        open={openModal}
        onClose={handleCloseModal}
        jornada={selectedJornada}
        matchDetails={matchDetails}
        updateMatchDetails={setMatchDetails}
        updateGlobalData={updateGlobalData}
      />
    </Box>
  );
};

export default JornadasPendientes;