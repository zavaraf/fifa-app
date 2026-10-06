import React from "react";
import { Routes, Route } from "react-router-dom";
import Torneos from "../pages/Torneos";
import Login from "../pages/Login";
import PrivateRoute from "../components/PrivateRoute";
import AdminRoute from "../components/AdminRoute"; // Nuevo componente para rutas de admin
import Jugadores from "../pages/Jugadores";
import Equipos from "../pages/Equipos";
import EquipoDetalle from "../pages/EquipoDetalle";
import AdminTorneo from "../pages/AdminTorneo";
import DraftPC from "../pages/DraftPC";
import SalonFama from "../pages/SalonFama";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Ruta pública para Login */}
      <Route path="/login" element={<Login />} />

      {/* Ruta protegida para Torneos */}
      <Route
        path="/torneos"
        element={
          <PrivateRoute>
            <Torneos />
          </PrivateRoute>
        }
      />

      {/* Ruta protegida para Jugadores */}
      <Route
        path="/jugadores"
        element={
          <PrivateRoute>
            <Jugadores />
          </PrivateRoute>
        }
      />

      {/* Ruta protegida para Equipos */}
      <Route
        path="/equipos"
        element={
          <PrivateRoute>
            <Equipos />
          </PrivateRoute>
        }
      />

      {/* Ruta protegida para detalle de equipo */}
      <Route
        path="/equipo/:id"
        element={
          <PrivateRoute>
            <EquipoDetalle />
          </PrivateRoute>
        }
      />

      {/* Ruta protegida para Admin Torneo - Solo para administradores */}
      <Route
        path="/admin-torneo"
        element={
          <PrivateRoute>
            <AdminRoute>
              <AdminTorneo />
            </AdminRoute>
          </PrivateRoute>
        }
      />

      {/* Ruta protegida para DraftPC */}
      <Route
        path="/draft-pc"
        element={
          <PrivateRoute>
            <DraftPC />
          </PrivateRoute>
        }
      />

      {/* Ruta protegida para Salón de la Fama */}
      <Route
        path="/salon-fama"
        element={
          <PrivateRoute>
            <SalonFama />
          </PrivateRoute>
        }
      />

      {/* Puedes agregar más rutas protegidas según sea necesario */}
      {/* <Route
        path="/tabla-general"
        element={
          <PrivateRoute>
            <TablaGeneral />
          </PrivateRoute>
        }
      />
      <Route
        path="/jornadas"
        element={
          <PrivateRoute>
            <Jornadas />
          </PrivateRoute>
        }
      /> */}
    </Routes>
  );
}