import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { Box, TextField, Button, Typography, Paper, Alert } from "@mui/material";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Detectar sessionid y phone en la URL
  const getUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      sessionid: params.get("sessionid"),
      phone: params.get("phone")
    };
  };
  const { sessionid, phone } = getUrlParams();

  useEffect(() => {
    if (!sessionid && user && user.token) {
      // Solo redirige si es login normal
      navigate("/torneos");
    }
  }, [user, navigate, sessionid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSuccess(false);
    if (sessionid) {
      // Modo solo validación
      try {
        const response = await api.post("/api/login/validate", { username, password, sessionid, phone }, {
          responseType: 'text'
        });
        // El servicio responde con HTML cuando es válido
        if (response.data) {
          document.open();
          document.write(response.data);
          document.close();
        } else {
          setError("Credenciales incorrectas o usuario inválido.");
        }
      } catch (err) {
        setError("Credenciales incorrectas o error de validación.");
      }
    } else {
      // Modo login normal
      try {
        const response = await api.post("/api/login", { username, password });
        const { token, user } = response.data;
        const { idEquipo, username: usuario, nombreEquipo, rolesDes } = user;
        if (token) {
          const temporadaResponse = await api.get("/temporada/buscarTemporada");
          const temporadas = temporadaResponse.data;
          if (temporadas && temporadas.length > 0) {
            const ultimaTemporada = temporadas[temporadas.length - 1];
            const idTemporada = ultimaTemporada.id;
            const torneos = ultimaTemporada.torneos || [];
            login({ token, idEquipo, usuario, idTemporada, torneos, nombreEquipo, rolesDes });
            navigate("/torneos");
          } else {
            setError("Error al obtener las temporadas. Intenta nuevamente.");
          }
        } else {
          setError("Error al iniciar sesión. Intenta nuevamente.");
        }
      } catch (error) {
        setError("Credenciales incorrectas");
      }
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "background.default",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          width: { xs: "90%", sm: "400px" },
          textAlign: "center",
          backgroundColor: "background.paper",
        }}
      >
        <Typography variant="h5" sx={{ mb: 3 }}>
          Iniciar Sesión
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Usuario"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
            disabled={success}
          />
          <TextField
            label="Contraseña"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
            disabled={success}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={success}>
            Iniciar sesión
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;