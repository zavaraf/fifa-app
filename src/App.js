import React, { useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { lightTheme, darkTheme } from "./theme"; // Importa los temas
import { BrowserRouter } from "react-router-dom"; // Solo importa BrowserRouter
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";

function App() {
  const [themeMode, setThemeMode] = useState("dark"); // Estado para manejar el tema

  const toggleTheme = () => {
    setThemeMode((prevMode) => (prevMode === "dark" ? "light" : "dark"));
  };

  const currentTheme = themeMode === "dark" ? darkTheme : lightTheme;

  return (
    <AuthProvider>
      <ThemeProvider theme={currentTheme}>
        <CssBaseline /> {/* Aplica estilos globales */}
        <BrowserRouter basename="/fifa-app">
          <Navbar toggleTheme={toggleTheme} themeMode={themeMode} />
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;