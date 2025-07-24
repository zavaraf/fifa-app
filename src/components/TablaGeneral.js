import React from "react";
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
  console.log("Datos de la tabla general:", data);
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
            {/* Nueva columna para el índice */}
            <TableCell
              sx={{
                textAlign: "center",
                width: "5%",
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
              }}
            >
              #
            </TableCell>
            {/* Imagen y nombre del equipo alineados a la izquierda, ocupan el 30% */}
            <TableCell
              sx={{
                textAlign: "left",
                width: "50%",
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
              }}
            >
              Equipo
            </TableCell>
            {/* Columnas de PJ a PTS alineadas a la derecha, ocupan el 65% */}
            <TableCell
              sx={{
                textAlign: "right",
                width: "5%",
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
              }}
            >
              PJ
            </TableCell>
            <TableCell
              sx={{
                textAlign: "right",
                width: "5%",
                display: { xs: "none", sm: "table-cell" },
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
              }}
            >
              PG
            </TableCell>
            <TableCell
              sx={{
                textAlign: "right",
                width: "5%",
                display: { xs: "none", sm: "table-cell" },
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
              }}
            >
              PE
            </TableCell>
            <TableCell
              sx={{
                textAlign: "right",
                width: "5%",
                display: { xs: "none", sm: "table-cell" },
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
              }}
            >
              PP
            </TableCell>
            <TableCell
              sx={{
                textAlign: "right",
                width: "5%",
                display: { xs: "none", sm: "table-cell" },
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
              }}
            >
              GF
            </TableCell>
            <TableCell
              sx={{
                textAlign: "right",
                width: "5%",
                display: { xs: "none", sm: "table-cell" },
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
              }}
            >
              GE
            </TableCell>
            <TableCell
              sx={{
                textAlign: "right",
                width: "5%",
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
              }}
            >
              DIF
            </TableCell>
            <TableCell
              sx={{
                textAlign: "right",
                width: "5%",
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
              }}
            >
              PTS
            </TableCell>
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
              {/* Nueva celda para el índice */}
              <TableCell
                sx={{
                  textAlign: "center",
                  width: "5%",
                  fontWeight: index === 0 ? 700 : 400,
                }}
              >
                {index + 1}
              </TableCell>
              {/* Imagen y nombre del equipo alineados a la izquierda, ocupan el 30% */}
              <TableCell sx={{ textAlign: "left", width: "50%" }}>
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
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: { xs: 60, sm: 110 },
                        color: (theme) => theme.palette.primary.main,
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline", color: (theme) => theme.palette.primary.dark },
                      }}
                    >
                      {window.innerWidth < 600 
                        ? row.nombreEquipo?.substring(0, 6) + (row.nombreEquipo?.length > 6 ? "..." : "")
                        : row.nombreEquipo?.substring(0, 10) + (row.nombreEquipo?.length > 10 ? "..." : "")
                      }
                    </Typography>
                  </Tooltip>
                </Box>
              </TableCell>
              {/* Columnas de PJ a PTS alineadas a la derecha, ocupan el 65% */}
              <TableCell sx={{ textAlign: "right", width: "5%" }}>{row.pj}</TableCell>
              <TableCell sx={{ textAlign: "right", width: "5%", display: { xs: "none", sm: "table-cell" } }}>{row.pg}</TableCell>
              <TableCell sx={{ textAlign: "right", width: "5%", display: { xs: "none", sm: "table-cell" } }}>{row.pe}</TableCell>
              <TableCell sx={{ textAlign: "right", width: "5%", display: { xs: "none", sm: "table-cell" } }}>{row.pp}</TableCell>
              <TableCell sx={{ textAlign: "right", width: "5%", display: { xs: "none", sm: "table-cell" } }}>{row.gf}</TableCell>
              <TableCell sx={{ textAlign: "right", width: "5%", display: { xs: "none", sm: "table-cell" } }}>{row.ge}</TableCell>
              <TableCell sx={{ textAlign: "right", width: "5%" }}>
                {window.innerWidth < 600 ? `${row.gf}:${row.ge}` : row.dif}
              </TableCell>
              <TableCell sx={{ textAlign: "right", width: "5%" }}>{row.pts}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}