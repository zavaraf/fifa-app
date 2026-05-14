import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Pagination,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import useJugadores from "../hooks/useJugadores";
import EditJugadorDialog from "../components/EditJugadorDialog";
import TablaJugadores from "../components/TablaJugadores";
import { AuthContext } from "../context/AuthContext";

export default function Jugadores() {
  const { jugadores, loading, fetchAllJugadores, updateJugador, createJugador, fetchJugadorSofifaById } = useJugadores();
  const { user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [editJugador, setEditJugador] = useState(null);
  const [form, setForm] = useState({ nombre: "", equipo: "", img: "", rating: "" });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sofifaJugador, setSofifaJugador] = useState(null);
  const [sofifaLoading, setSofifaLoading] = useState(false);
  const rowsPerPage = 50;

  useEffect(() => {
    fetchAllJugadores();
  }, [fetchAllJugadores]);

  // Filtrar jugadores por nombre, equipo o idsofifa y ordenar por rating descendente
  const filteredJugadores = jugadores
    .filter(
      (j) =>
        (j.sobrenombre?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (j.equipo?.nombre?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (j.idsofifa?.toString() || "").includes(search.toLowerCase())
    )
    .sort((a, b) => (Number(b.raiting) || 0) - (Number(a.raiting) || 0));

  // Buscar en Sofifa si el filtro es numérico y no hay resultados
  useEffect(() => {
    const buscarSofifa = async () => {
      setSofifaJugador(null);
      if (/^\d+$/.test(search) && filteredJugadores.length === 0 && search.length > 0) {
        setSofifaLoading(true);
        const jugador = await fetchJugadorSofifaById(search);
        setSofifaJugador(jugador);
        setSofifaLoading(false);
      }
    };
    buscarSofifa();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filteredJugadores.length]);

  // Paginación de jugadores filtrados (incluye Sofifa si aplica)
  let paginatedJugadores = filteredJugadores.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  if (filteredJugadores.length === 0 && sofifaJugador) {
    paginatedJugadores = [sofifaJugador];
  }

  const equipos = [
    ...Array.from(
      new Set(jugadores.map((j) => j.equipo?.nombre).filter(Boolean))
    ).map((nombre, idx) => ({
      id: idx + 1,
      nombre,
    })),
  ];

  const handleOpenAdd = () => {
    setEditJugador(null);
    setForm({ nombre: "", equipo: equipos[0]?.nombre || "", img: "", rating: "" });
    setOpen(true);
  };

  // Verificar si el usuario tiene rol de Admin
  const isAdmin = user?.rolesDes?.includes("Admin");

  const handleOpenEdit = (jugador) => {
    if (!isAdmin) return; // Solo permitir a admins
    setEditJugador(jugador);
    setForm({
      nombre: jugador.sobrenombre,
      equipo: jugador.equipo?.nombre || "",
      img: jugador.img,
      rating: jugador.raiting,
    });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (formData) => {
    if (editJugador) {
      // Editar jugador existente
      await updateJugador({
        ...editJugador,
        ...formData,
        raiting: Number(formData.raiting),
        costo: Number(formData.costo) || 0,
        equipo: editJugador?.equipo
          ? { ...editJugador.equipo, nombre: formData.equipo }
          : { nombre: formData.equipo },
      });
    } else {
      // Crear nuevo jugador
      await createJugador({
        ...formData,
        raiting: Number(formData.raiting),
        costo: Number(formData.costo) || 0,
        equipo: { nombre: formData.equipo },
      });
    }
    await fetchAllJugadores();
    setOpen(false);
  };

  const handleChangePage = (event, value) => {
    setPage(value);
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4" fontWeight={700}>
          Jugadores
        </Typography>
        {isAdmin && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
            Agregar Jugador
          </Button>
        )}
      </Box>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Buscar jugador, equipo o ID FIFA"
          variant="outlined"
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>
      <TablaJugadores
        jugadores={paginatedJugadores}
        loading={loading || sofifaLoading}
        onEdit={isAdmin ? handleOpenEdit : () => {}}
      />
      {filteredJugadores.length > rowsPerPage && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Pagination
            count={Math.ceil(filteredJugadores.length / rowsPerPage)}
            page={page}
            onChange={handleChangePage}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
      <EditJugadorDialog
        open={open}
        onClose={handleClose}
        jugador={editJugador}
        equipos={equipos}
        onSave={handleSave}
      />
    </Box>
  );
}
