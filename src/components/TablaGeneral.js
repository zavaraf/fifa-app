import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Tooltip,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function TablaGeneral({ data }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //console.log("Datos de la tabla general:", data);
  return (
    <TableContainer
      component={Paper}
      sx={{
        // Elimina el maxHeight y stickyHeader para quitar el scroll
        bgcolor: (theme) => theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            {/* Columna combinada para índice y equipo */}
            <TableCell
              sx={{
                textAlign: "center",
                width: { xs: 24, sm: 28, md: 32 },
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? theme.palette.grey[900]
                    : "#e3e3e3",
                color: (theme) => theme.palette.text.primary,
                fontWeight: 700,
                fontSize: 15,
                position: "sticky",
                top: 0,
                zIndex: 1,
                p: 0.25,
              }}
            >
              #
            </TableCell>
            <TableCell
              sx={{
                textAlign: "left",
                width: { xs: "80%", sm: "68%", md: "72%", lg: "75%" },
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? theme.palette.grey[900]
                    : "#e3e3e3",
                color: (theme) => theme.palette.text.primary,
                fontWeight: 700,
                fontSize: 15,
                position: "sticky",
                top: 0,
                zIndex: 1,
                pr: { xs: 2, sm: 8, md: 16, lg: 22 },
              }}
            >
              Equipo
            </TableCell>
            {/* Columnas de PJ a PTS alineadas a la derecha, ocupan el 65% */}
            <TableCell sx={{ textAlign: "right", width: "1%", minWidth: 28, bgcolor: (theme) => theme.palette.mode === "dark" ? theme.palette.grey[900] : "#e3e3e3", color: (theme) => theme.palette.text.primary, fontWeight: 400, fontSize: 13, position: "sticky", top: 0, zIndex: 1, p: 0.5 }}>PJ</TableCell>
            <TableCell sx={{ textAlign: "right", width: "1%", minWidth: 28, display: { xs: "none", sm: "table-cell" }, bgcolor: (theme) => theme.palette.mode === "dark" ? theme.palette.grey[900] : "#e3e3e3", color: (theme) => theme.palette.text.primary, fontWeight: 400, fontSize: 13, position: "sticky", top: 0, zIndex: 1, p: 0.5 }}>PG</TableCell>
            <TableCell sx={{ textAlign: "right", width: "1%", minWidth: 28, display: { xs: "none", sm: "table-cell" }, bgcolor: (theme) => theme.palette.mode === "dark" ? theme.palette.grey[900] : "#e3e3e3", color: (theme) => theme.palette.text.primary, fontWeight: 400, fontSize: 13, position: "sticky", top: 0, zIndex: 1, p: 0.5 }}>PE</TableCell>
            <TableCell sx={{ textAlign: "right", width: "1%", minWidth: 28, display: { xs: "none", sm: "table-cell" }, bgcolor: (theme) => theme.palette.mode === "dark" ? theme.palette.grey[900] : "#e3e3e3", color: (theme) => theme.palette.text.primary, fontWeight: 400, fontSize: 13, position: "sticky", top: 0, zIndex: 1, p: 0.5 }}>PP</TableCell>
            <TableCell sx={{ textAlign: "right", width: "1%", minWidth: 28, display: { xs: "none", sm: "table-cell" }, bgcolor: (theme) => theme.palette.mode === "dark" ? theme.palette.grey[900] : "#e3e3e3", color: (theme) => theme.palette.text.primary, fontWeight: 400, fontSize: 13, position: "sticky", top: 0, zIndex: 1, p: 0.5 }}>GF</TableCell>
            <TableCell sx={{ textAlign: "right", width: "1%", minWidth: 28, bgcolor: (theme) => theme.palette.mode === "dark" ? theme.palette.grey[900] : "#e3e3e3", color: (theme) => theme.palette.text.primary, fontWeight: 400, fontSize: 13, position: "sticky", top: 0, zIndex: 1, p: 0.5 }}> {window.innerWidth < 600 ? 'Goles' : 'GE'}</TableCell>
            <TableCell sx={{ textAlign: "right", width: "1%", minWidth: 28, bgcolor: (theme) => theme.palette.mode === "dark" ? theme.palette.grey[900] : "#e3e3e3", color: (theme) => theme.palette.text.primary, fontWeight: 400, fontSize: 13, position: "sticky", top: 0, zIndex: 1, p: 0.5 }}>DIF</TableCell>
            <TableCell sx={{ textAlign: "right", width: "1%", minWidth: 28, bgcolor: (theme) => theme.palette.mode === "dark" ? theme.palette.grey[900] : "#e3e3e3", color: (theme) => theme.palette.text.primary, fontWeight: 400, fontSize: 13, position: "sticky", top: 0, zIndex: 1, p: 0.5, pr: 2 }}>PTS</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={index}
              sx={{
                backgroundColor: (theme) =>
                  index === 0
                    ? theme.palette.success.light // líder resaltado
                    : index % 2 === 0
                    ? theme.palette.action.hover // zebra striping
                    : "inherit",
                transition: "background 0.2s",
                "&:hover": {
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark" ? "#333" : "#e0e0e0",
                  color: (theme) => theme.palette.text.primary,
                },
              }}
            >
              {/* Celda para índice */}
              <TableCell sx={{ textAlign: "center", width: { xs: 24, sm: 28, md: 32 }, p: 0.25 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: index === 0 ? 700 : 400 }}
                >
                  {index + 1}
                </Typography>
              </TableCell>
              {/* Celda para nombre del equipo */}
              <TableCell sx={{ textAlign: "left", width: { xs: "80%", sm: "68%", md: "72%", lg: "75%" }, pr: { xs: 2, sm: 8, md: 16, lg: 22 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <img
                    src={row.img}
                    alt={row.nombreEquipo}
                    style={{ width: 22, height: 22, objectFit: "contain" }}
                  />
                  <Tooltip title={row.nombreEquipo} arrow>
                    <Typography
                      component={RouterLink}
                      to={`/equipo/${row.idEquipo || row.id || row.idequipo}`}
                      variant="body2"
                      sx={{
                        fontWeight: index === 0 ? 700 : 400,
                        color: (theme) => theme.palette.primary.main,
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline", color: (theme) => theme.palette.primary.dark },
                        
                        // --- LÍNEAS A AGREGAR ---
                        whiteSpace: 'nowrap',       // Evita que el texto salte a la siguiente línea.
                        overflow: 'hidden',         // Oculta el texto que se desborde del contenedor.
                        textOverflow: 'ellipsis',   // Muestra "..." en el texto que fue ocultado.
                      }}
                    >
                      {row.nombreEquipo}
                    </Typography>
                  </Tooltip>
                </Box>
              </TableCell>
              {/* Columnas de PJ a PTS alineadas a la derecha, ocupan el 65% */}
              <TableCell sx={{ textAlign: "right", width: "1%", minWidth: 28, p: 0.5 }}>{row.pj}</TableCell>
              <TableCell sx={{ textAlign: "right", width: "1%", minWidth: 28, display: { xs: "none", sm: "table-cell" }, p: 0.5 }}>{row.pg}</TableCell>
              <TableCell sx={{ textAlign: "right", width: "1%", minWidth: 28, display: { xs: "none", sm: "table-cell" }, p: 0.5 }}>{row.pe}</TableCell>
              <TableCell sx={{ textAlign: "right", width: "1%", minWidth: 28, display: { xs: "none", sm: "table-cell" }, p: 0.5 }}>{row.pp}</TableCell>
              <TableCell sx={{ textAlign: "right", width: "1%", minWidth: 28, display: { xs: "none", sm: "table-cell" }, p: 0.5 }}>{row.gf}</TableCell>
              <TableCell sx={{ textAlign: "right", width: "1%", minWidth: 28, p: 0.5 }}>
                {window.innerWidth < 600 ? `${row.gf}:${row.ge}` : row.ge}
              </TableCell>
              <TableCell sx={{ textAlign: "right", width: "1%", minWidth: 28, p: 0.5 }}>
                {row.dif}
              </TableCell>
              <TableCell sx={{ textAlign: "right", width: "1%", minWidth: 28, p: 0.5, pr: 2 }}>{row.pts}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}