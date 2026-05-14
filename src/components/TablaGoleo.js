import React from "react";
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Avatar, Paper, TableContainer, Tooltip } from "@mui/material";

export default function TablaGoleo({ goleo = [] }) {
  // Ordenar por goles descendente
  const data = [...goleo].sort((a, b) => b.goles - a.goles);

  // Función para acortar el nombre
  const shortName = (name) => {
    if (!name) return "";
    return name.length > 22 ? name.slice(0, 22) + "..." : name;
  };

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, width: 40, textAlign: "center" }}>#</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Jugador</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: "center" }}>Goles</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((jugador, idx) => (
            <TableRow key={jugador.idPersona || idx}>
              <TableCell sx={{ textAlign: "center" }}>{idx + 1}</TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar src={jugador.img} alt={jugador.sobrenombre} sx={{ width: 28, height: 28 }} />
                  <Tooltip title={jugador.sobrenombre} arrow>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {shortName(jugador.sobrenombre)}
                    </Typography>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ textAlign: "center", fontWeight: 700 }}>{jugador.goles}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
