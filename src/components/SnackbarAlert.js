import React from 'react';
import { Snackbar, Alert } from '@mui/material';

export default function SnackbarAlert({ open, message, severity, onClose }) {
  // severity puede ser "error", "warning", "info", o "success"

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000} // El mensaje se oculta después de 6 segundos
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      {/* Usamos el componente Alert para que tenga el color y el ícono correctos */}
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}