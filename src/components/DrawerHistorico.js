import React, { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  useMediaQuery,
  CircularProgress,
  Tooltip,
  Autocomplete,
  TextField,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useEquipos from "../hooks/useEquipos"; // Asegúrate de tener este hook
import useDraft from "../hooks/useDraft"; // Agrega este import

export default function DrawerHistorico({
  open,
  onClose,
  historico = [],
  loading = false,
  user,
}) {
  const isMobile = useMediaQuery("(max-width:600px)");
  const drawerWidth = isMobile ? "100vw" : 700;

  // Estado para la sección de nueva oferta
  const [showNuevaOferta, setShowNuevaOferta] = useState(false);
  const [equipoOferta, setEquipoOferta] = useState(null);
  const [monto, setMonto] = useState("");
  const [manager, setManager] = useState(user?.usuario || ""); // editable
  const [saving, setSaving] = useState(false);
  
  // Estado local para controlar la limpieza del histórico
  const [historicoLocal, setHistoricoLocal] = useState([]);
  const [loadingLocal, setLoadingLocal] = useState(false);

  // Equipos desde useEquipos
  const { equipos, fetchEquipos } = useEquipos();

  // Efecto para limpiar el histórico cuando se abre el drawer
  useEffect(() => {
    if (open) {
      // Limpiar el histórico al abrir el drawer
      setHistoricoLocal([]);
      setLoadingLocal(true);
      
      // Establecer el histórico después de un breve delay para mostrar loading
      const timer = setTimeout(() => {
        setHistoricoLocal(historico);
        setLoadingLocal(false);
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      // Limpiar todo cuando se cierra el drawer
      setHistoricoLocal([]);
      setLoadingLocal(false);
      setShowNuevaOferta(false);
      setEquipoOferta(null);
      setMonto("");
      setManager(user?.usuario || "");
    }
  }, [open, historico, user?.usuario]);

  // Cargar equipos al abrir el drawer y mostrar la sección de nueva oferta
  useEffect(() => {
    if (open && showNuevaOferta && equipos.length === 0) {
      fetchEquipos();
    }
    // Inicializa el manager con el usuario de sesión cada vez que se abre la sección
    if (open && showNuevaOferta && user?.usuario) {
      setManager(user.usuario);
    }
  }, [open, showNuevaOferta, equipos.length, fetchEquipos, user?.usuario]);

  // Mascara visual para el input de monto
  const formatCantidad = (value) => {
    if (!value) return "";
    const num = Number(value.toString().replace(/\D/g, ""));
    return num ? num.toLocaleString("es-MX") : "";
  };

  // Usa el hook para obtener updateDraft
  const { updateDraftAdmin } = useDraft();

  // Verificar si el usuario tiene rol de Admin
  const isAdmin = user?.rolesDes?.includes("Admin");

  const handleGuardar = async () => {
    // Permitir monto cero (0)
    if (!equipoOferta || monto === "" || !manager) return;
    setSaving(true);
    const result = await updateDraftAdmin({
      idJugador: historicoLocal[0]?.idJugador || historicoLocal[0]?.id,
      monto: monto.replace(/\D/g, ""),
      usuario: manager, // editable
      nombreEquipo: equipoOferta.nombre,
      ofertaInicial: historicoLocal[0]?.montoOferta,
      idEquipo: equipoOferta.id,
    });
    setSaving(false);
    setShowNuevaOferta(false);
    setEquipoOferta(null);
    setMonto("");
    setManager(user?.usuario || "");
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: drawerWidth } }}
      ModalProps={{ keepMounted: true }}
    >
      <Box
        sx={{
          p: { xs: 1, sm: 3 },
          position: "relative",
          width: "100%",
          height: "100vh",
          boxSizing: "border-box",
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8 }}
          aria-label="Cerrar"
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Histórico de Ofertas
        </Typography>
        {/* Sección para nueva oferta */}
        {isAdmin && (
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => setShowNuevaOferta((v) => !v)}
              sx={{ mb: 1 }}
            >
              {showNuevaOferta ? "Ocultar Nueva Oferta" : "Nueva Oferta"}
            </Button>
            {showNuevaOferta && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                  alignItems: "center",
                  mb: 2,
                  mt: 1,
                }}
              >
                <Autocomplete
                  options={equipos}
                  getOptionLabel={(option) => option.nombre || ""}
                  value={equipoOferta}
                  onChange={(_, value) => setEquipoOferta(value)}
                  renderInput={(params) => (
                    <TextField {...params} label="Equipo Oferta" size="small" />
                  )}
                  sx={{ minWidth: 180, flex: 1 }}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  loading={equipos.length === 0}
                />
                <TextField
                  label="Monto"
                  value={monto}
                  onChange={(e) => setMonto(formatCantidad(e.target.value))}
                  size="small"
                  sx={{ minWidth: 120, flex: 1 }}
                  inputProps={{ inputMode: "numeric" }}
                />
                <TextField
                  label="Manager"
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  size="small"
                  sx={{ minWidth: 120, flex: 1 }}
                />
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleGuardar}
                  disabled={saving || !equipoOferta || monto === "" || !user?.usuario}
                >
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
              </Box>
            )}
          </Box>
        )}
        <Box
          sx={{
            overflowX: "auto",
            maxHeight: { xs: "70vh", sm: "80vh" },
          }}
        >
          {(loading || loadingLocal) ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 200,
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Equipo Oferta</TableCell>
                  <TableCell>Manager</TableCell>
                  <TableCell>Oferta</TableCell>
                  <TableCell>Oferta Final</TableCell>
                  <TableCell>Fecha</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historicoLocal.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Sin datos de histórico.
                    </TableCell>
                  </TableRow>
                ) : (
                  historicoLocal.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>
                        <Tooltip
                          title={
                            row.sobrenombre ||
                            row.nombreCompleto ||
                            row.nombre ||
                            ""
                          }
                        >
                          <span
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "block",
                              maxWidth: 120,
                            }}
                          >
                            {row.sobrenombre || row.nombreCompleto || row.nombre}
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip
                          title={
                            row.comentarios || row.equipo?.nombre || ""
                          }
                        >
                          <span
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "block",
                              maxWidth: 120,
                            }}
                          >
                            {row.comentarios || row.equipo?.nombre || ""}
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={row.manager || ""}>
                          <span
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "block",
                              maxWidth: 100,
                            }}
                          >
                            {row.manager}
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        ${row.montoOferta?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        ${row.ofertaFinal?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {row.fecha
                          ? new Date(row.fecha).toLocaleString()
                          : ""}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
