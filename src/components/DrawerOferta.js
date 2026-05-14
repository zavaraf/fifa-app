import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
} from "@mui/material";
import React, { useCallback, useEffect } from "react";

export default function DrawerOferta(props) {
  const {
    open,
    onClose,
    monto,
    setMonto,
    equipo,
    manager,
    onOfertar,
    loading,
    ofertaInicial,
    precioSofifa
  } = props;
  
  // Formatea el monto solo para mostrarlo, pero el valor real en el estado es solo números
  const formatCantidad = (value) => {
    if (!value) return "";
    const num = Number(value.toString().replace(/\D/g, ""));
    return num ? num.toLocaleString("es-MX") : "";
  };

  // Cambia el valor del input, solo números (el estado guarda solo números)
  const handleChangeMonto = useCallback(
    e => {
      const cleanValue = e.target.value.replace(/\D/g, "");
      setMonto(cleanValue);
    },
    [setMonto]
  );

  // Si el precioSofifa cambia y el Drawer está abierto, inicializa el monto
  useEffect(() => {
    if (open) {
      setMonto(precioSofifa ? precioSofifa.toString() : "0");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [precioSofifa, open]);

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxWidth: 400,
          mx: "auto",
        },
      }}
    >
      <Box
        sx={{
          p: 3,
          bgcolor: "background.paper",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          minHeight: 220,
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Realizar Oferta
        </Typography>
        {/* Mostrar oferta inicial si aplica */}
        {ofertaInicial !== undefined && ofertaInicial !== null && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Oferta final:{" "}
            <b>
              {Number(ofertaInicial).toLocaleString("es-MX", {
                style: "currency",
                currency: "MXN",
                minimumFractionDigits: 0,
              })}
            </b>
          </Typography>
        )}
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Monto a ofertar"
            type="text"
            value={formatCantidad(monto)}
            onChange={handleChangeMonto}
            fullWidth
            InputProps={{
              startAdornment: <span style={{ marginRight: 4 }}>$</span>,
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            disabled={loading}
            placeholder="$0"
          />
        </Box>
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar
            src={equipo?.img}
            alt={equipo?.nombre}
            sx={{ width: 32, height: 32 }}
          />
          <Typography variant="body2" fontWeight={600}>
            {equipo?.nombre || "Equipo"}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Manager: <b>{manager}</b>
        </Typography>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={onOfertar}
          disabled={loading || !monto}
        >
          {loading ? "Ofertando..." : "Ofertar"}
        </Button>
        <Button
          variant="outlined"
          color="error"
          fullWidth
          sx={{ mt: 1 }}
          onClick={onClose}
        >
          Cancelar
        </Button>
      </Box>
    </Drawer>
  );
}
