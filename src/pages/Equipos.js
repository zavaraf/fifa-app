import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Popover,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import useEquipos from "../hooks/useEquipos";
import { useTheme, useMediaQuery } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Agrega este import

export default function Equipos() {
  const { equipos, loading, fetchEquipos, modificarEquipo } = useEquipos();
  const { user } = useContext(AuthContext); // Obtén el usuario desde AuthContext
  const isAdmin = user?.rolesDes?.includes("Admin");

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedEquipo, setSelectedEquipo] = useState(null);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchEquipos();
  }, [fetchEquipos]);

  // Filtrar equipos por nombre
  const filteredEquipos = equipos.filter(
    (eq) => (eq.nombre?.toLowerCase() || "").includes(search.toLowerCase())
  );

  // Función para formatear moneda
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "";
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleEdit = (equipo) => {
    setSelectedEquipo(equipo);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEquipo(null);
  };

  const handleSave = async () => {
    if (selectedEquipo) {
      await modificarEquipo(selectedEquipo);
      await fetchEquipos();
    }
    handleClose();
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 4, p: 2 }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
        Equipos
      </Typography>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Buscar equipo"
          variant="outlined"
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Imagen</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Jugadores</TableCell>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Manager</TableCell>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>P. Inicial</TableCell>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>P. Final</TableCell>
              <TableCell align="center">WhatsApp</TableCell>
              <TableCell align="center">Editar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : filteredEquipos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No hay equipos para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              filteredEquipos.map((equipo) => (
                <TableRow key={equipo.id}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        src={equipo.img}
                        alt={equipo.nombre}
                        component={RouterLink}
                        to={`/equipo/${equipo.id}`}
                        sx={{ cursor: "pointer" }}
                      />
                      {equipo.postfifa && (
                        <IconButton
                          component="a"
                          href={equipo.postfifa}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          sx={{ ml: 1, color: "success.main" }}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography
                      component={RouterLink}
                      to={`/equipo/${equipo.id}`}
                      sx={{
                        color: "primary.main",
                        textDecoration: "none",
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        "&:hover": { textDecoration: "underline", color: "primary.dark" },
                      }}
                    >
                      {equipo.nombre}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{equipo.totalJugadores ?? ""}</TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{equipo.manager ?? ""}</TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{formatCurrency(equipo.presupuestoInicial)}</TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{formatCurrency(equipo.presupuestoFinal)}</TableCell>
                  <TableCell align="center">
                    {equipo.whatsapp && (
                      <Tooltip title="Contactar por WhatsApp">
                        <IconButton
                          color="success"
                          component="a"
                          href={`https://wa.me/${equipo.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <WhatsAppIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {isAdmin && (
                      <Tooltip title="Editar">
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(equipo)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para editar equipo */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen={fullScreen}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Editar Equipo</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Nombre"
            name="nombre"
            value={selectedEquipo?.nombre || ""}
            onChange={e =>
              setSelectedEquipo(eq => ({ ...eq, nombre: e.target.value }))
            }
            fullWidth
            size="small"
            sx={{ mb: 1 }}
          />
          <TextField
            label="Descripción"
            name="descripcion"
            value={selectedEquipo?.descripcion || ""}
            onChange={e =>
              setSelectedEquipo(eq => ({ ...eq, descripcion: e.target.value }))
            }
            fullWidth
            size="small"
            sx={{ mb: 1 }}
          />
          <TextField
            label="Imagen"
            name="img"
            value={selectedEquipo?.img || ""}
            onChange={e =>
              setSelectedEquipo(eq => ({ ...eq, img: e.target.value }))
            }
            fullWidth
            size="small"
            sx={{ mb: 1 }}
          />
          <TextField
            label="Imagen 2"
            name="img2"
            value={selectedEquipo?.img2 || ""}
            onChange={e =>
              setSelectedEquipo(eq => ({ ...eq, img2: e.target.value }))
            }
            fullWidth
            size="small"
            sx={{ mb: 1 }}
          />
          <TextField
            label="Link Sofifa"
            name="linksofifa"
            value={selectedEquipo?.linksofifa || ""}
            onChange={e =>
              setSelectedEquipo(eq => ({ ...eq, linksofifa: e.target.value }))
            }
            fullWidth
            size="small"
            sx={{ mb: 1 }}
          />
          {/* Solo mostrar PostFifa si es admin */}
          {isAdmin && (
            <TextField
              label="PostFifa"
              name="postfifa"
              value={selectedEquipo?.postfifa || ""}
              onChange={e =>
                setSelectedEquipo(eq => ({ ...eq, postfifa: e.target.value }))
              }
              placeholder="URL al post"
              fullWidth
              size="small"
              sx={{ mb: 1 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          {isAdmin && (
            <Button variant="contained" onClick={handleSave}>
              Guardar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

