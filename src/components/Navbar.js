import React, { useContext } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar({ toggleTheme, themeMode }) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const { user, logout } = useContext(AuthContext);
  const isMobile = useMediaQuery("(max-width:600px)");

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  // Verificar si el usuario es administrador
  const isAdmin = user?.rolesDes?.includes("Admin");

  // Menú de navegación base
  const baseNavLinks = [
    { to: "/torneos", label: "Torneos" },
    { to: "/jugadores", label: "Jugadores" },
    { to: "/equipos", label: "Equipos" },
    { to: "/draft-pc", label: "Draft PC" },
  ];

  // Agregar Admin Torneo solo si es administrador
  const navLinks = isAdmin
    ? [...baseNavLinks, { to: "/admin-torneo", label: "Admin Torneo" }]
    : baseNavLinks;

  return (
    <>
      <AppBar
        position="static"
        sx={{ borderRadius: "0 0 10px 10px", boxShadow: 3 }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}
          >
            <img
              src="https://fifa-xgamers.com/ext/planetstyles/flightdeck/store/2a01bbb.png"
              alt="Logo"
              style={{
                width: 40,
                marginRight: 8,
                borderRadius: 4,
                background: "#fff",
              }}
            />
            FIFA XGamers
          </Typography>
          {/* Menú de navegación solo en desktop */}
          {!isMobile && user && (
            <>
              {navLinks.map((link) => (
                <Button
                  key={link.to}
                  color="inherit"
                  component={Link}
                  to={link.to}
                  sx={{
                    fontWeight: 500,
                    fontFamily: "Roboto, Arial, sans-serif",
                  }}
                >
                  {link.label}
                </Button>
              ))}
              {/* Mostrar nombre y usuario a la derecha en desktop */}
              <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
                <Box sx={{ textAlign: "right", mr: 2 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: themeMode === "dark" ? "#fff" : "#222",
                      fontFamily: "Roboto, Arial, sans-serif",
                      letterSpacing: 0.5,
                      lineHeight: 1.1,
                    }}
                  >
                    {user.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: themeMode === "dark" ? "#bbb" : "#555",
                      fontFamily: "Roboto, Arial, sans-serif",
                      display: "block",
                    }}
                  >
                    {user.usuario}
                  </Typography>
                </Box>
              </Box>
            </>
          )}
          {/* Botón de tema y logout siempre a la derecha */}
          <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
            <IconButton
              color="inherit"
              onClick={toggleTheme}
              title="Cambiar tema"
            >
              {themeMode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            {user ? (
              <Button color="inherit" onClick={logout} sx={{ ml: 1 }}>
                Logout
              </Button>
            ) : (
              <Button
                color="inherit"
                component={Link}
                to="/login"
                sx={{ ml: 1 }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{
            width: 250,
            bgcolor: themeMode === "dark" ? "grey.900" : "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start", // <-- Asegura alineación a la izquierda
            pl: 0,
          }}
        >
          {user && (
            <Box
              sx={{
                padding: 2,
                display: "flex",
                alignItems: "center",
                width: "100%",
              }}
            >
              <img
                src="https://fifa-xgamers.com/ext/planetstyles/flightdeck/store/2a01bbb.png"
                alt="Avatar"
                style={{
                  width: 40,
                  borderRadius: "50%",
                  marginRight: 8,
                  background: "#fff",
                }}
              />
              <Box sx={{ width: "100%" }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: themeMode === "dark" ? "#fff" : "#222",
                    fontFamily: "Roboto, Arial, sans-serif",
                    letterSpacing: 0.5,
                    textAlign: "left",
                  }}
                >
                  {user.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: themeMode === "dark" ? "#bbb" : "#555",
                    fontFamily: "Roboto, Arial, sans-serif",
                    textAlign: "left",
                    display: "block",
                  }}
                >
                  {user.usuario}
                </Typography>
              </Box>
            </Box>
          )}
          <List sx={{ width: "100%", p: 0 }}>
            {user &&
              navLinks.map((link) => (
                <ListItem
                  button
                  component={Link}
                  to={link.to}
                  onClick={toggleDrawer(false)}
                  key={link.to}
                  sx={{
                    justifyContent: "flex-start", // <-- Alinea el ListItem a la izquierda
                    pl: 2,
                    textAlign: "left", // <-- Alinea el texto a la izquierda
                  }}
                >
                  <ListItemText
                    primary={link.label}
                    primaryTypographyProps={{
                      sx: {
                        fontWeight: 500,
                        color: themeMode === "dark" ? "#fff" : "#222",
                        fontFamily: "Roboto, Arial, sans-serif",
                        textAlign: "left", // <-- Alinea el texto a la izquierda
                      },
                    }}
                  />
                </ListItem>
              ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}