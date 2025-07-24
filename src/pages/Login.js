import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.token) {
      console.log("Usuario ya autenticado, redirigiendo...");
      navigate("/torneos"); // Redirige si ya está autenticado
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/api/login", { username, password });
      const { token, user } = response.data;
      // Asegúrate de que user.nombreEquipo exista aquí
      console.log("Respuesta login:", response.data);
      const { idEquipo, username: usuario, nombreEquipo, rolesDes } = user;

      if (token) {
        const temporadaResponse = await api.get("/temporada/buscarTemporada");
        const temporadas = temporadaResponse.data;

        console.log("Temporadas obtenidas:", temporadas);

        if (temporadas && temporadas.length > 0) {
          const ultimaTemporada = temporadas[temporadas.length - 1];
          console.log("Última temporada obtenida:", ultimaTemporada);
          const idTemporada = ultimaTemporada.id;
          const torneos = ultimaTemporada.torneos || [];

          // Imprime el nombre equipo antes de guardar
          console.log("Nombre equipo que se enviará a login:", nombreEquipo);
          console.log("Roles que se enviarán a login:", rolesDes);

          login({ token, idEquipo, usuario, idTemporada, torneos, nombreEquipo, rolesDes });
          navigate("/torneos");
        } else {
          console.error("No se encontraron temporadas.");
          alert("Error al obtener las temporadas. Intenta nuevamente.");
        }
      } else {
        console.error("No se recibió un token válido del backend.");
        alert("Error al iniciar sesión. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Credenciales incorrectas");
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
        <form onSubmit={handleSubmit}>
          <TextField
            label="Usuario"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Contraseña"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Iniciar sesión
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;