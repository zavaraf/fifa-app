import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2", // Color principal
    },
    secondary: {
      main: "#f50057", // Color secundario
    },
    background: {
      default: "#f5f5f5", // Fondo principal
      paper: "#ffffff", // Fondo de elementos como tarjetas
    },
    text: {
      primary: "#000000", // Texto principal
      secondary: "#555555", // Texto secundario
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9", // Color principal
    },
    secondary: {
      main: "#f48fb1", // Color secundario
    },
    background: {
      default: "#121212", // Fondo principal
      paper: "#1e1e1e", // Fondo de elementos como tarjetas
    },
    text: {
      primary: "#ffffff", // Texto principal
      secondary: "#b0bec5", // Texto secundario
    },
  },
});