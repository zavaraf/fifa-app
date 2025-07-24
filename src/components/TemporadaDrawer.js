import React, { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert
} from "@mui/material";
import useSesion from "../hooks/useSesion";

const TemporadaDrawer = ({ open, onClose, onTemporadaChanged }) => {
  const { getAllTemporadas, setTemporadaSession, clearTemporadaSession } = useSesion();
  const [temporadas, setTemporadas] = useState([]);
  const [selectedTemporada, setSelectedTemporada] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      fetchTemporadas();
      // Cargar temporada actual de sesión
      const storedTemporada = sessionStorage.getItem("selectedTemporada");
      if (storedTemporada) {
        const temporadaData = JSON.parse(storedTemporada);
        setSelectedTemporada(temporadaData.id);
      }
    }
  }, [open]);

  const fetchTemporadas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllTemporadas();
      setTemporadas(data);
    } catch (err) {
      setError("Error al cargar las temporadas");
      console.error("Error fetching temporadas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTemporadaChange = (event) => {
    setSelectedTemporada(event.target.value);
  };

  const handleSave = () => {
    const temporadaSeleccionada = temporadas.find(t => t.id === selectedTemporada);
    if (temporadaSeleccionada) {
      // Limpiar torneo seleccionado
      sessionStorage.removeItem("selectedTorneo");
      
      // Guardar nueva temporada
      setTemporadaSession(temporadaSeleccionada);
      
      console.log("Temporada cambiada:", temporadaSeleccionada);
      
      // Notificar cambio al componente padre
      if (onTemporadaChanged) {
        onTemporadaChanged(temporadaSeleccionada);
      }
      
      onClose();
    }
  };

  const handleCancel = () => {
    // Restaurar selección original
    const storedTemporada = sessionStorage.getItem("selectedTemporada");
    if (storedTemporada) {
      const temporadaData = JSON.parse(storedTemporada);
      setSelectedTemporada(temporadaData.id);
    }
    onClose();
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={handleCancel}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxWidth: 500,
          mx: "auto",
        }
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, textAlign: "center", fontWeight: 700 }}>
          Seleccionar Temporada
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Temporada</InputLabel>
            <Select
              value={selectedTemporada}
              onChange={handleTemporadaChange}
              label="Temporada"
            >
              {temporadas.map((temporada) => (
                <MenuItem key={temporada.id} value={temporada.id}>
                  {temporada.descripcion}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleCancel}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSave}
            disabled={!selectedTemporada || loading}
          >
            Guardar
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default TemporadaDrawer;
