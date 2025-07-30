import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip
} from "@mui/material";

export default function CrearWoDrawer({ open, onClose, jornadas }) {
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [resultados, setResultados] = useState([]);

  const analizarWo = () => {
    if (!inicio || !fin) return;

    // Filtra jornadas en el rango seleccionado
    const jornadasFiltradas = jornadas.filter(j =>
      j.numeroJornada >= Number(inicio) && j.numeroJornada <= Number(fin)
    );

    // Contadores de partidos pendientes por equipo
    const pendientesPorEquipo = {};

    // Recorre partidos sin marcador y cuenta pendientes por equipo
    jornadasFiltradas.forEach(jornada => {
      (jornada.jornada || []).forEach(partido => {
        const sinMarcador = partido.golesLocal == null && partido.golesVisita == null;
        if (sinMarcador) {
          pendientesPorEquipo[partido.idEquipoLocal] = (pendientesPorEquipo[partido.idEquipoLocal] || 0) + 1;
          pendientesPorEquipo[partido.idEquipoVisita] = (pendientesPorEquipo[partido.idEquipoVisita] || 0) + 1;
        }
      });
    });

    // Analiza cada partido pendiente y decide el WO
    const resultadosWO = [];
    jornadasFiltradas.forEach(jornada => {
      (jornada.jornada || []).forEach(partido => {
        const sinMarcador = partido.golesLocal == null && partido.golesVisita == null;
        if (sinMarcador) {
          const pendientesLocal = pendientesPorEquipo[partido.idEquipoLocal] || 0;
          const pendientesVisita = pendientesPorEquipo[partido.idEquipoVisita] || 0;
          let ganadorWO = null;
          let perdedorWO = null;
          if (pendientesLocal > pendientesVisita) {
            ganadorWO = partido.idEquipoVisita;
            perdedorWO = partido.idEquipoLocal;
          } else if (pendientesVisita > pendientesLocal) {
            ganadorWO = partido.idEquipoLocal;
            perdedorWO = partido.idEquipoVisita;
          }
          resultadosWO.push({
            jornada: jornada.numeroJornada,
            partido,
            ganadorWO,
            perdedorWO,
            pendientesLocal,
            pendientesVisita
          });
        }
      });
    });

    setResultados(resultadosWO);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 400, p: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
          Analizar Partidos por WO
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Jornada inicio"
            type="number"
            value={inicio}
            onChange={e => setInicio(e.target.value)}
            size="small"
          />
          <TextField
            label="Jornada fin"
            type="number"
            value={fin}
            onChange={e => setFin(e.target.value)}
            size="small"
          />
          <Button variant="contained" onClick={analizarWo}>
            Analizar
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Resultados WO:
        </Typography>
        <List>
          {resultados.length === 0 && (
            <ListItem>
              <ListItemText primary="No hay partidos pendientes en el rango seleccionado." />
            </ListItem>
          )}
          {resultados.map((res, idx) => (
            <ListItem key={idx}>
              <ListItemText
                primary={`Jornada ${res.jornada}: ${res.partido.nombreEquipoLocal} vs ${res.partido.nombreEquipoVisita}`}
                secondary={
                  res.ganadorWO
                    ? `WO para ${res.ganadorWO === res.partido.idEquipoLocal ? res.partido.nombreEquipoLocal : res.partido.nombreEquipoVisita} (pendientes: ${res.pendientesLocal} vs ${res.pendientesVisita})`
                    : `No se puede decidir WO (pendientes: ${res.pendientesLocal} vs ${res.pendientesVisita})`
                }
              />
              <ListItemSecondaryAction>
                {res.ganadorWO ? (
                  <Chip label="WO" color="warning" />
                ) : (
                  <Chip label="Sin decisión" color="default" />
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}
