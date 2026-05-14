import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  Button,
  Box,
  Link as MuiLink,
  Chip,
  Divider,
  Stack,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { CheckCircle, History, CompareArrows, VerifiedUser } from "@mui/icons-material";

// --- Funciones de Ayuda (Helpers) ---
// Es recomendable mover estas funciones a un archivo separado, ej: 'src/utils/ofertasHelpers.js'

const estaConfirmado = (oferta) =>
  oferta.equipo?.id &&
  oferta.idEquipoOferta &&
  parseInt(oferta.equipo.id) === parseInt(oferta.idEquipoOferta);

const puedeConfirmarOferta = (oferta, user) => {
  if (!oferta || estaConfirmado(oferta)) return false;
  const esAdmin = user?.rolesDes?.includes("Admin");
  const esEquipoOfertante =
    user?.idEquipo &&
    oferta.idEquipoOferta &&
    parseInt(user.idEquipo) === parseInt(oferta.idEquipoOferta);
  return esAdmin || esEquipoOfertante;
};

// --- Componente Principal de la Tarjeta ---

export default function OfertaCard({
  oferta,
  user,
  isAdminOrManager,
  onContraofertar,
  onVerHistorico,
  onConfirmar,
  isSubmitting,
}) {
  const confirmado = estaConfirmado(oferta);
  const ofertaCambio = oferta.montoOferta !== oferta.ofertaFinal;

  return (
    <Card
      sx={{
        // ¡AÑADE ESTA LÍNEA!
        height: "100%", 
        
        // El resto de tus estilos
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        borderRadius: 4,
        boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
        transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "rgba(0, 0, 0, 0.2) 0px 8px 24px",
        },
      }}
    >
      <CardHeader
        avatar={<Avatar src={oferta.img} alt={oferta.nombre} sx={{ width: 56, height: 56 }} />}
        title={
          <Typography fontWeight={700} variant="h6" component="div" noWrap>
            {oferta.sobrenombre || oferta.nombre}
          </Typography>
        }
        subheader={
          <MuiLink href={oferta.link} target="_blank" rel="noopener noreferrer" underline="hover">
            Ver en Sofifa
          </MuiLink>
        }
        action={
          confirmado && (
            <Chip
              icon={<CheckCircle />}
              
              color="success"
              size="small"
              sx={{ mt: 1, mr: 1, fontWeight: 600 }}
            />
          )
        }
      />

      <CardContent sx={{ pt: 0 }}>
        {/* Sección de Monto */}
        <Box sx={{ my: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Oferta Final
          </Typography>
          <Typography
            variant="h4"
            component="p"
            fontWeight={800}
            color="primary.main"
            sx={{ lineHeight: 1.1 }}
          >
            ${oferta.ofertaFinal?.toLocaleString()}
          </Typography>
          {ofertaCambio && (
            <Typography variant="body2" color="text.secondary">
              (Inicial: ${oferta.montoOferta?.toLocaleString()})
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Sección de Equipo y Manager */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
           <MuiLink
            component={RouterLink}
            to={`/equipo/${oferta.idEquipoOferta}`}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit', flexShrink: 1, minWidth: 0 }}
          >
            <Avatar src={oferta.equipo?.img} sx={{ width: 32, height: 32 }} />
            <Typography variant="body2" fontWeight={600} noWrap>
              {oferta.comentarios}
            </Typography>
          </MuiLink>
           <Typography variant="body2" color="text.secondary" noWrap>
            Por: <b>{oferta.manager}</b>
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Stack spacing={1} sx={{ width: '100%' }}>
          <Button
            variant="outlined"
            size="medium"
            fullWidth
            onClick={() => onVerHistorico(oferta)}
            startIcon={<History />}
          >
            Ver Histórico
          </Button>
          {isAdminOrManager && !confirmado && (
            <Button
              variant="contained"
              color="secondary"
              size="medium"
              fullWidth
              onClick={() => onContraofertar(oferta)}
              startIcon={<CompareArrows />}
            >
              Contraofertar
            </Button>
          )}
          {!confirmado && puedeConfirmarOferta(oferta, user) && (
             <Button
              variant="contained"
              color="success"
              size="medium"
              fullWidth
              onClick={() => onConfirmar(oferta)}
              disabled={isSubmitting}
              startIcon={<VerifiedUser />}
            >
              Confirmar Jugador
            </Button>
          )}
        </Stack>
      </CardActions>

       <Typography
        variant="caption"
        color="text.secondary"
        sx={{ p: 1, textAlign: "center" }}
      >
        {new Date(oferta.fechaOferta || oferta.fecha).toLocaleString('es-MX', {
          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })}
      </Typography>
    </Card>
  );
}