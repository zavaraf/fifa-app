import React, { useState, useEffect, useContext } from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  Autocomplete,
  InputAdornment,
  IconButton,
  CircularProgress
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useJugadores from "../hooks/useJugadores";
import useEquipos from "../hooks/useEquipos";
import { AuthContext } from "../context/AuthContext";

export default function EditJugadorDialog({ open, onClose, jugador, equipos: equiposProp, onSave }) {
  const [form, setForm] = useState({
    id: "",
    idsofifa: "",
    sobrenombre: "",
    nombreCompleto: "",
    img: "",
    raiting: "",
    link: "",
    equipo: "",
    costo: "",
  });
  const { updateJugador, createJugador, fetchDetallesJugadorSofifa } = useJugadores();
  const [consultandoSofifa, setConsultandoSofifa] = useState(false);
  const [showCosto, setShowCosto] = useState(false);
  const [costoEditable, setCostoEditable] = useState(true);
  const [tipoOperacion, setTipoOperacion] = useState("baja"); // "venta" o "baja"
  // Acción al hacer click en el botón Venta
  const handleOperacion = async () => {
    if (!form.idsofifa) return;
    setConsultandoSofifa(true);
    let errorServicio = false;
    let nuevoCosto = "";
    let nuevoEquipo = form.equipo;
    try {
      const detalles = await fetchDetallesJugadorSofifa(form.idsofifa);
      const data = detalles?.data;
      if (data && data.price) {
        if (tipoOperacion === "baja") {
          // Baja: precio 90% y no editable
          nuevoCosto = Math.round(data.price * 0.9);
          setCostoEditable(false);
          nuevoEquipo = "Agente Libre";
        } else {
          // Venta: precio Sofifa y editable
          nuevoCosto = data.price;
          setCostoEditable(true);
        }
      } else {
        errorServicio = true;
      }
    } catch (e) {
      errorServicio = true;
    }
    if (errorServicio) {
      setCostoEditable(true);
      nuevoCosto = "";
      if (tipoOperacion === "baja") {
        nuevoEquipo = "Agente Libre";
      }
    }
    setForm((prev) => ({
      ...prev,
      costo: nuevoCosto,
      equipo: nuevoEquipo,
    }));
    setShowCosto(true);
    setConsultandoSofifa(false);
  };
  // Consulta Sofifa y mapea los datos al formulario
  const handleConsultarSofifa = async () => {
    if (!form.idsofifa) return;
    setConsultandoSofifa(true);
    const detalles = await fetchDetallesJugadorSofifa(form.idsofifa);
    const data = detalles?.data;
    if (data) {
      setForm((prev) => ({
        ...prev,
        idsofifa: data.id || prev.idsofifa,
        sobrenombre: data.commonName || "",
        nombreCompleto: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
        img: (() => {
          let idStr = String(data.id);
          if (idStr.length === 5) {
            idStr = "0" + idStr;
          }
          if (idStr.length === 6) {
            const part1 = idStr.slice(0, 3);
            const part2 = idStr.slice(3, 6);
            const version = data.version || "26";
            return `https://cdn.sofifa.net/players/${part1}/${part2}/${version}_120.png`;
          }
          return "";
        })(),
        raiting: data.overallRating || "",
       
       
        link: `https://sofifa.com/player/${data.id}`,
      }));
    }
    setConsultandoSofifa(false);
  };
  const { equipos, fetchEquipos } = useEquipos();
  const { user } = useContext(AuthContext);
  const [saving, setSaving] = useState(false);

  // Verificar si el usuario tiene rol de Admin
  const isAdmin = user?.rolesDes?.includes("Admin");
  
  // Verificar si el usuario pertenece al equipo del jugador
  const isUserTeam = parseInt(user?.idEquipo) === jugador?.equipo?.id;
  
  // Determinar si puede guardar (es admin o es su equipo)
  const canSave = isAdmin || isUserTeam;

  // Cargar equipos al abrir el dialog
  useEffect(() => {
    if (open) fetchEquipos();
  }, [open, fetchEquipos]);

  useEffect(() => {
    if (jugador) {
      setForm({
        id: jugador.id || "",
        idsofifa: jugador.idsofifa || "",
        sobrenombre: jugador.sobrenombre || "",
        nombreCompleto: jugador.nombreCompleto || "",
        img: jugador.img || "",
        raiting: jugador.raiting || "",
        link: jugador.link || "",
        equipo: jugador.equipo?.nombre || "",
        costo: jugador.costo || "",
      });
    } else {
      setForm({
        id: null, // <-- Cambia a cero para nuevos jugadores
        idsofifa: "",
        sobrenombre: "",
        nombreCompleto: "",
        img: "",
        raiting: "",
        link: "",
        equipo: (equipos[0]?.nombre || equiposProp[0]?.nombre) || "",
        costo: "",
      });
    }
  }, [jugador, equipos, equiposProp]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEquipoChange = (_, value) => {
    setForm((prev) => ({ ...prev, equipo: value ? value.nombre : "" }));
  };

  // Permite solo números y formatea en tiempo real
  const handleCostoChange = (e) => {
    // Elimina todo excepto dígitos
    const raw = e.target.value.replace(/\D/g, "");
    setForm((prev) => ({ ...prev, costo: raw }));
  };

  // Formatea el valor como moneda con separadores de miles y dos decimales
  const formatCurrency = (value) => {
    if (!value) return "";
    const number = Number(value);
    // Si el usuario está escribiendo, muestra sin decimales, si no, muestra con decimales
    return number.toLocaleString("en-US", { minimumFractionDigits: 0 });
  };

  const handleSave = async () => {
    if (!canSave) return; // No permitir guardar si no puede
    
    setSaving(true);
    const equiposCombo = equipos.length > 0 ? equipos : equiposProp;
    const jugadorEdit = {
      ...jugador,
      id: form.id ? Number(form.id) : 0, // <-- Siempre manda un número, 0 si es nuevo
      idsofifa: form.idsofifa,
      sobrenombre: form.sobrenombre,
      nombreCompleto: form.nombreCompleto,
      img: form.img,
      raiting: Number(form.raiting),
      link: form.link,
      costo: Number(form.costo) || 0,
      equipo: equiposCombo.find((eq) => eq.nombre === form.equipo) || jugador?.equipo,
    };
    let ok = false;
    if (jugador && jugador.id) {
      ok = await updateJugador(jugadorEdit);
    } else {
      ok = await createJugador(jugadorEdit);
    }
    setSaving(false);
    if (ok) {
      onSave(jugadorEdit);
      onClose();
    }
  };

  // Usar equipos de hook si existen, si no, los que vienen por prop
  const equiposCombo = equipos.length > 0 ? equipos : equiposProp;

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
      }}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxWidth: 600,
          mx: "auto",
        }
      }}
    >
      <Box
        sx={{
          p: { xs: 2, sm: 4 },
          bgcolor: "background.paper",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          minHeight: 400,
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            {jugador ? "Editar Jugador" : "Agregar Jugador"}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              label="ID Sofifa"
              name="idsofifa"
              value={form.idsofifa}
              onChange={handleChange}
              fullWidth
              size="small"
            />
            <Button
              variant="outlined"
              size="small"
              onClick={handleConsultarSofifa}
              disabled={!form.idsofifa || consultandoSofifa}
              sx={{ minWidth: 40 }}
            >
              {consultandoSofifa ? <CircularProgress size={18} /> : "Consultar"}
            </Button>
          </Box>
          <TextField
            label="Nombre Corto"
            name="sobrenombre"
            value={form.sobrenombre}
            onChange={handleChange}
            fullWidth
            size="small"
          />
          <TextField
            label="Nombre Completo"
            name="nombreCompleto"
            value={form.nombreCompleto}
            onChange={handleChange}
            fullWidth
            size="small"
          />
          <TextField
            label="Imagen"
            name="img"
            value={form.img}
            onChange={handleChange}
            fullWidth
            size="small"
          />
          <TextField
            label="Rating"
            name="raiting"
            type="number"
            value={form.raiting}
            onChange={handleChange}
            fullWidth
            size="small"
            inputProps={{ min: 0, max: 99 }}
          />
          <TextField
            label="Link Sofifa"
            name="link"
            value={form.link}
            onChange={handleChange}
            fullWidth
            size="small"
          />
          <Autocomplete
            options={equiposCombo}
            getOptionLabel={(option) => option.nombre}
            value={equiposCombo.find((eq) => eq.nombre === form.equipo) || null}
            onChange={handleEquipoChange}
            renderInput={(params) => (
              <TextField {...params} label="Equipo" fullWidth size="small" />
            )}
            isOptionEqualToValue={(option, value) => option.nombre === value.nombre}
          />
          {/* ...existing code... */}
          {/* Selector Venta/Baja */}
          <FormControl fullWidth size="small" sx={{ mb: 1 }}>
            <InputLabel id="tipo-operacion-label">Tipo de operación</InputLabel>
            <Select
              labelId="tipo-operacion-label"
              value={tipoOperacion}
              label="Tipo de operación"
              onChange={e => setTipoOperacion(e.target.value)}
            >
              <MenuItem value="baja">Baja</MenuItem>
              <MenuItem value="venta">Venta</MenuItem>
            </Select>
          </FormControl>
          {/* Botón para ejecutar la operación */}
          <Button
            variant="contained"
            color="warning"
            onClick={handleOperacion}
            disabled={!form.idsofifa || consultandoSofifa}
            sx={{ alignSelf: "flex-start", mb: 1 }}
          >
            {consultandoSofifa ? <CircularProgress size={18} /> : tipoOperacion === "baja" ? "Baja" : "Venta"}
          </Button>
          {(showCosto || !!form.costo) && (
            <TextField
              label="Costo"
              name="costo"
              value={formatCurrency(form.costo)}
              onChange={
                // Solo editable si: ya tiene valor previo, o es venta, o el servicio falló
                (tipoOperacion === "venta" || costoEditable || (!!form.costo && tipoOperacion !== "baja"))
                  ? handleCostoChange
                  : undefined
              }
              fullWidth
              size="small"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                inputMode: "numeric",
                pattern: "[0-9]*",
                readOnly: !((tipoOperacion === "venta" || costoEditable || (!!form.costo && tipoOperacion !== "baja")))
              }}
              helperText={
                tipoOperacion === "baja"
                  ? costoEditable
                    ? "Puedes editar el costo porque el servicio no respondió." 
                    : "Precio de baja calculado automáticamente (90% del valor Sofifa)"
                  : "Puedes editar el precio de venta inicial (valor Sofifa)"
              }
            />
          )}
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button onClick={onClose} disabled={saving} variant="outlined">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !canSave}
            sx={{ 
              fontWeight: 700, 
              letterSpacing: 1,
              opacity: !canSave ? 0.5 : 1
            }}
            title={!canSave ? "No puedes editar jugadores de otros equipos (solo Admin)" : ""}
          >
            Guardar
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
