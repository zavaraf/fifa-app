import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user?.rolesDes?.includes("Admin");

  if (!isAdmin) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "50vh",
        flexDirection: "column" 
      }}>
        <Typography variant="h4" color="error" gutterBottom>
          Acceso Denegado
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No tienes permisos de administrador para acceder a esta página.
        </Typography>
      </Box>
    );
  }

  return children;
};

export default AdminRoute;
