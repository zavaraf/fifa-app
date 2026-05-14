import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Typography,
  Switch,
  Avatar,
  Collapse,
  IconButton,
  Tooltip
} from "@mui/material";
import {
  Schedule as ScheduleIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  EmojiEvents as EmojiEventsIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon
} from "@mui/icons-material";

export default function TablaJornadas({ 
  jornadas, 
  handleActivaChange, 
  handleCerradaChange, 
  expandedJornadas, 
  toggleExpandJornada 
}) {
  // Función para verificar si es una instancia final
  const esInstanciaFinal = (jornada) => {
    const instanciasFinales = ["Final", "Semifinal", "Cuartos", "Octavos"];
    if (!jornada.nombreJornada) return false;
    
    return instanciasFinales.some(instancia => 
      jornada.nombreJornada.includes(instancia)
    );
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

  const getInstanciaFinalChip = (jornada) => {
    if (esInstanciaFinal(jornada)) {
      return (
        <Chip 
          label="Final" 
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



  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        borderRadius: 3,
        background: (theme) => theme.palette.mode === "dark" 
          ? "linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%)"
          : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        border: "1px solid",
        borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
      }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow sx={{ 
            "& .MuiTableCell-head": {
              background: (theme) => theme.palette.mode === "dark" 
                ? "linear-gradient(45deg, #FF6B6B, #4ECDC4)"
                : "linear-gradient(45deg, #FF6B6B, #4ECDC4)",
              color: "white",
              fontWeight: 700,
              fontSize: "0.875rem"
            }
          }}>
            <TableCell width="5%">
              <IconButton size="small" disabled>
                <KeyboardArrowDownIcon sx={{ color: "white" }} />
              </IconButton>
            </TableCell>
            <TableCell width="30%">Jornada</TableCell>
            <TableCell width="25%">Estados</TableCell>
            <TableCell width="15%">Fechas</TableCell>
            <TableCell width="10%">Partidos</TableCell>
            <TableCell width="15%">Controles</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {jornadas
            .sort((a, b) => b.idJornda - a.idJornda)
            .map((jornadaGroup) => (
            <React.Fragment key={jornadaGroup.idJornda}>
              <TableRow 
                sx={{ 
                  '&:nth-of-type(odd)': { 
                    backgroundColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" 
                  },
                  "&:hover": {
                    backgroundColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"
                  }
                }}
              >
                <TableCell>
                  {jornadaGroup.jornada && jornadaGroup.jornada.length > 0 && (
                    <Tooltip title={expandedJornadas.has(jornadaGroup.idJornda) ? "Ocultar partidos" : "Ver partidos"}>
                      <IconButton
                        size="small"
                        onClick={() => toggleExpandJornada(jornadaGroup.idJornda)}
                        sx={{ color: "primary.main" }}
                      >
                        {expandedJornadas.has(jornadaGroup.idJornda) ? 
                          <KeyboardArrowUpIcon /> : 
                          <KeyboardArrowDownIcon />
                        }
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
                
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {jornadaGroup.nombreJornada && jornadaGroup.nombreJornada !== "" 
                        ? jornadaGroup.nombreJornada 
                        : `Jornada ${jornadaGroup.numeroJornada}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {jornadaGroup.idJornda}
                      {!esInstanciaFinal(jornadaGroup) && ` | Nº: ${jornadaGroup.numeroJornada}`}
                    </Typography>
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {getStatusChip(jornadaGroup)}
                    {getClosedChip(jornadaGroup)}
                    {getInstanciaFinalChip(jornadaGroup)}
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Box sx={{ fontSize: "0.75rem" }}>
                    {jornadaGroup.fechaInicioString && (
                      <Typography variant="caption" display="block" sx={{ mb: 0.25 }}>
                        📅 {jornadaGroup.fechaInicioString}
                      </Typography>
                    )}
                    {jornadaGroup.fechaFinString && (
                      <Typography variant="caption" display="block">
                        🏁 {jornadaGroup.fechaFinString}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                
                <TableCell>
                  {jornadaGroup.jornada && (
                    <Chip 
                      label={jornadaGroup.jornada.length} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  )}
                </TableCell>
                
                <TableCell>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="caption" sx={{ fontSize: "0.7rem", minWidth: 35 }}>
                        Activa
                      </Typography>
                      <Switch
                        checked={jornadaGroup.activa === 1}
                        onChange={(e) => handleActivaChange(jornadaGroup, e)}
                        color="success"
                        size="small"
                      />
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="caption" sx={{ fontSize: "0.7rem", minWidth: 35 }}>
                        Cerrada
                      </Typography>
                      <Switch
                        checked={jornadaGroup.cerrada === 1}
                        onChange={(e) => handleCerradaChange(jornadaGroup, e)}
                        color="error"
                        size="small"
                      />
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
              
              {/* Fila expandible para mostrar partidos */}
              {jornadaGroup.jornada && jornadaGroup.jornada.length > 0 && (
                <TableRow>
                  <TableCell 
                    style={{ paddingBottom: 0, paddingTop: 0 }} 
                    colSpan={6}
                  >
                    <Collapse 
                      in={expandedJornadas.has(jornadaGroup.idJornda)} 
                      timeout="auto" 
                      unmountOnExit
                    >
                      <Box sx={{ 
                        margin: 2,
                        borderRadius: 2,
                        background: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                        border: "1px solid",
                        borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
                      }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, p: 2, fontWeight: 600, color: "primary.main" }}>
                          Partidos de la Jornada ({jornadaGroup.jornada.length})
                        </Typography>
                        
                        {/* Tabla de partidos */}
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ 
                              "& .MuiTableCell-head": {
                                background: (theme) => theme.palette.mode === "dark" 
                                  ? "rgba(255,255,255,0.08)"
                                  : "rgba(0,0,0,0.08)",
                                fontWeight: 600,
                                fontSize: "0.75rem",
                                py: 1
                              }
                            }}>
                              <TableCell width="35%">Equipo Local</TableCell>
                              <TableCell width="30%" align="center">Resultado</TableCell>
                              <TableCell width="35%" align="right">Equipo Visitante</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {jornadaGroup.jornada.map((partido, partidoIndex) => (
                              <TableRow 
                                key={partidoIndex}
                                sx={{ 
                                  '&:nth-of-type(odd)': { 
                                    backgroundColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" 
                                  },
                                  "&:hover": {
                                    backgroundColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"
                                  }
                                }}
                              >
                                <TableCell>
                                  <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <Avatar
                                      src={partido.imgLocal}
                                      alt={partido.nombreEquipoLocal}
                                      sx={{
                                        width: 20,
                                        height: 20,
                                        mr: 1,
                                        bgcolor: 'primary.main',
                                        fontSize: 8,
                                        fontWeight: 600
                                      }}
                                    >
                                      {!partido.imgLocal && (partido.nombreEquipoLocal || "?").charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        fontSize: "0.8rem", 
                                        fontWeight: 500,
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis"
                                      }}
                                      title={partido.nombreEquipoLocal}
                                    >
                                      {partido.nombreEquipoLocal}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                
                                <TableCell align="center">
                                  <Box sx={{ 
                                    display: "inline-flex", 
                                    alignItems: "center", 
                                    px: 2, 
                                    py: 0.5, 
                                    borderRadius: 1,
                                    background: (theme) => theme.palette.mode === "dark" 
                                      ? "linear-gradient(45deg, rgba(255,107,107,0.2), rgba(78,205,196,0.2))"
                                      : "linear-gradient(45deg, rgba(255,107,107,0.1), rgba(78,205,196,0.1))",
                                    border: "1px solid",
                                    borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                                    minWidth: 60,
                                    justifyContent: "center"
                                  }}>
                                    <Typography variant="body2" sx={{ fontSize: "0.85rem", fontWeight: 700 }}>
                                      {partido.golesLocal ?? "-"} - {partido.golesVisita ?? "-"}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                
                                <TableCell align="right">
                                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        fontSize: "0.8rem", 
                                        fontWeight: 500,
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        textAlign: "right",
                                        mr: 1
                                      }}
                                      title={partido.nombreEquipoVisita}
                                    >
                                      {partido.nombreEquipoVisita}
                                    </Typography>
                                    <Avatar
                                      src={partido.imgVisita}
                                      alt={partido.nombreEquipoVisita}
                                      sx={{
                                        width: 20,
                                        height: 20,
                                        bgcolor: 'secondary.main',
                                        fontSize: 8,
                                        fontWeight: 600
                                      }}
                                    >
                                      {!partido.imgVisita && (partido.nombreEquipoVisita || "?").charAt(0).toUpperCase()}
                                    </Avatar>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}