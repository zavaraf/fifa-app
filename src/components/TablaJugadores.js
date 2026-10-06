import React from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  Link as MuiLink,
  CircularProgress,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

export default function TablaJugadores({ jugadores, loading, onEdit }) {
  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 3,
        boxShadow: 3,
        bgcolor: (theme) => theme.palette.background.paper,
        overflow: "hidden",
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: (theme) => theme.palette.action.hover }}>
            <TableCell sx={{ fontWeight: 700, width: 60, textAlign: "center" }}>
              Imagen
            </TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
            <TableCell sx={{ fontWeight: 700, display: { xs: "none", md: "table-cell" } }}>Equipo</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: "center" }}>Rating</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <CircularProgress size={28} />
              </TableCell>
            </TableRow>
          ) : jugadores.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Box sx={{ color: "text.secondary", py: 2 }}>
                  No hay jugadores para mostrar.
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            jugadores.map((jugador, idx) => (
              <TableRow
                key={jugador.id}
                sx={{
                  bgcolor: idx % 2 === 0 ? "background.default" : "action.hover",
                  "&:hover": { bgcolor: "action.selected" },
                  transition: "background 0.2s",
                }}
              >
                <TableCell sx={{ textAlign: "center" }}>
                  <Avatar
                    src={jugador.img}
                    alt={jugador.sobrenombre}
                    imgProps={{ referrerPolicy: "no-referrer" }}
                    sx={{
                      width: { xs: 32, md: 36 },
                      height: { xs: 32, md: 36 },
                      mx: "auto",
                      border: "2px solid #eee",
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    <MuiLink
                      href={jugador.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                      sx={{
                        fontWeight: 500,
                        color: "primary.main",
                        "&:hover": {
                          textDecoration: "underline",
                          color: "primary.dark",
                        },
                        fontSize: { xs: "0.875rem", md: "1rem" },
                      }}
                      title={jugador.sobrenombre}
                    >
                      {jugador.sobrenombre}
                    </MuiLink>
                    {/* Mostrar equipo debajo del nombre en móviles */}
                    <Box sx={{ display: { xs: "block", md: "none" }, fontSize: "0.75rem", color: "text.secondary", mt: 0.5 }}>
                      {jugador.equipo?.nombre || ""}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {/* Si tienes imagen de equipo, puedes agregar aquí */}
                    <span style={{ fontWeight: 500 }}>{jugador.equipo?.nombre || ""}</span>
                  </Box>
                </TableCell>
                <TableCell sx={{ textAlign: "center", fontWeight: 700 }}>
                  {jugador.raiting}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Editar">
                    <IconButton 
                      color="primary" 
                      onClick={() => onEdit(jugador)}
                      size={ window.innerWidth < 768 ? "small" : "medium" }
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
