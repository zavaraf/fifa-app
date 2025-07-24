import React, { useState, useContext } from "react";
import {
  Box,
  Typography,
  Avatar,
  Grid,
  Paper,
  TextField,
  Button,
} from "@mui/material";
import { AuthContext } from "../context/AuthContext";

const PublicacionesTab = ({ equipo }) => {
  // Obtener usuario de la sesión
  const { user } = useContext(AuthContext);
  
  // Estados para BBCode
  const [bbCode, setBbCode] = useState("");
  const [bbcodeOptions, setBbcodeOptions] = useState({
    includePlayerList: true,
    includeMovements: true,
    includeFinances: true,
    includeStats: false,
    includeDraftPC: true,
    includeLinksoFIFA: true,
    groupByPosition: false,
    includeImages: true,
    customMessage: ""
  });
  const [bbcodeStyle, setBbcodeStyle] = useState("full");

  // Función para generar BBCode
  const generateBBCode = () => {
    if (!equipo) return;
    
    const jugadoresOrdenados = (equipo.jugadores || [])
      .sort((a, b) => (b.raiting || 0) - (a.raiting || 0));
    
    const totalRating = jugadoresOrdenados.reduce((sum, j) => sum + (j.raiting || 0), 0);
    const promedioRating = jugadoresOrdenados.length > 0 ? (totalRating / jugadoresOrdenados.length).toFixed(1) : 0;
    
    const totalIngresos = equipo.finanzas?.filter(f => f.tipoconcepto?.codigo === "ingreso")
      .reduce((sum, f) => sum + (f.monto || 0), 0) || 0;
    const totalEgresos = equipo.finanzas?.filter(f => f.tipoconcepto?.codigo === "egreso")
      .reduce((sum, f) => sum + (f.monto || 0), 0) || 0;

    // Construcción del BBCode con opciones personalizables
    let bbcode = generateBBCodeHeader();
    
    if (bbcodeOptions.includePlayerList) {
      bbcode += generateBBCodePlayerList(jugadoresOrdenados, promedioRating);
    }
    
    if (bbcodeOptions.includeMovements) {
      bbcode += generateBBCodeMovements();
    }
    
    if (bbcodeOptions.includeFinances) {
      bbcode += generateBBCodeFinances(totalIngresos, totalEgresos, totalRating);
    }
    
    if (bbcodeOptions.includeStats) {
      bbcode += generateBBCodeStats(jugadoresOrdenados);
    }

    if (bbcodeOptions.includeDraftPC) {
      bbcode += generateBBCodeDraftPC();
    }

    if (bbcodeOptions.includeLinksoFIFA && equipo.linksofifa) {
      bbcode += generateBBCodeLinksoFIFA();
    }

    // Agregar footer elegante
    bbcode += generateBBCodeFooter();

    setBbCode(bbcode);
  };

  // Nueva función para footer elegante
  const generateBBCodeFooter = () => {
    const fechaGeneracion = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return `\n\n[align=center]════════════════════════════════════════════[/align]
[align=center][size=90][i][color=#868e96]Generado automáticamente el ${fechaGeneracion}[/color][/i][/size][/align]
[align=center][size=110][b]🏆 DRAFT FIFA - SISTEMA DE GESTIÓN 🏆[/b][/size][/align]
[align=center]════════════════════════════════════════════[/align]`;
  };

  // Función mejorada para header con validaciones y mejor formato
  const generateBBCodeHeader = () => {
    const imgUrl = equipo.img && bbcodeOptions.includeImages ? equipo.img : "";
    const teamName = equipo.nombre?.toUpperCase() || "EQUIPO";
    const division = equipo.division?.nombre ? ` - ${equipo.division.nombre}` : "";
    const season = equipo.temporada?.nombre ? ` | Temporada: ${equipo.temporada.nombre}` : "";
    const totalJugadores = equipo.jugadores?.length || 0;
    const promedioRating = equipo.jugadores?.length > 0 
      ? (equipo.jugadores.reduce((sum, j) => sum + (j.raiting || 0), 0) / equipo.jugadores.length).toFixed(1) 
      : 0;
    
    return `[align=center]════════════════════════════════════════════[/align]
${imgUrl ? `[align=center][img]${imgUrl}[/img][/align]` : `[align=center]🏆 DRAFT FIFA 🏆[/align]`}
[align=center][size=160][b]${teamName}[/b][/size][/align]
[align=center][size=130][color=#34a853][b]${division}${season}[/b][/color][/size][/align]
[align=center][size=120]👥 [b]${totalJugadores} Jugadores[/b] | ⭐ [b]Promedio: ${promedioRating}[/b][/size][/align]
${bbcodeOptions.customMessage ? `[align=center][size=110][i][color=#666666]${bbcodeOptions.customMessage}[/color][/i][/size][/align]\n` : ""}[align=center]════════════════════════════════════════════[/align]`;
  };

  // Función simplificada para lista de jugadores
  const generateBBCodePlayerList = (jugadoresOrdenados, promedioRating) => {
    let playerList = `\n\n[align=center][size=150][b]📋 PLANTILLA DE JUGADORES[/b][/size][/align]
[align=center]════════════════════════════════════════════[/align]\n`;
    
    if (bbcodeOptions.groupByPosition) {
      const posiciones = [
        { code: 'POR', name: '🥅 PORTEROS', color: '#ff6b35' },
        { code: 'DEF', name: '🛡️ DEFENSAS', color: '#4dabf7' },
        { code: 'MED', name: '⚙️ MEDIOCAMPISTAS', color: '#51cf66' },
        { code: 'DEL', name: '⚽ DELANTEROS', color: '#ff8cc8' }
      ];
      
      posiciones.forEach(pos => {
        const jugadoresPosicion = jugadoresOrdenados.filter(j => j.posicion === pos.code);
        if (jugadoresPosicion.length > 0) {
          playerList += `\n[align=center][size=130][color=${pos.color}][b]${pos.name}[/b][/color][/size][/align]`;
          
          jugadoresPosicion.forEach((jugador, index) => {
            const rating = jugador.raiting || 0;
            const ratingColor = rating >= 85 ? '#ffd43b' : rating >= 75 ? '#51cf66' : rating >= 65 ? '#74c0fc' : '#868e96';
            playerList += `\n[align=center][size=110][b]${jugador.nombreCompleto || jugador.sobrenombre}[/b] - [color=${ratingColor}][b]${rating}[/b][/color][/size][/align]`;
          });
          
          playerList += `\n`;
        }
      });
    } else {
      playerList += `[align=center][size=130][b]🏆 RANKING POR CALIDAD[/b][/size][/align]\n`;
      
      jugadoresOrdenados.forEach((jugador, index) => {
        const posicion = jugador.posicion ? ` [${jugador.posicion}]` : "";
        const rating = jugador.raiting || 0;
        const ratingColor = rating >= 85 ? '#ffd43b' : rating >= 75 ? '#51cf66' : rating >= 65 ? '#74c0fc' : '#868e96';
        const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : '';
        
        playerList += `[align=center][size=110]${medal} [b]${index + 1}.[/b] [b]${jugador.nombreCompleto || jugador.sobrenombre}[/b]${posicion} - [color=${ratingColor}][b]${rating}[/b][/color][/size][/align]\n`;
      });
    }
    
    // Resumen simplificado
    const topRating = jugadoresOrdenados[0]?.raiting || 0;
    const lowRating = jugadoresOrdenados[jugadoresOrdenados.length - 1]?.raiting || 0;
    
    playerList += `\n[align=center][size=120][b]📊 RESUMEN[/b][/size][/align]
[align=center][size=110]👥 [b]Total:[/b] ${jugadoresOrdenados.length} | 📈 [b]Promedio:[/b] ${promedioRating} | ⭐ [b]Mejor:[/b] ${topRating} | 📉 [b]Menor:[/b] ${lowRating}[/size][/align]`;
    
    return playerList;
  };

  // Función simplificada para movimientos
  const generateBBCodeMovements = () => {
    let movements = `\n\n[align=center][size=140][b]🔄 MOVIMIENTOS DE MERCADO[/b][/size][/align]
[align=center]════════════════════════════════════════════[/align]`;
    
    // Obtener IDs de jugadores en draft para excluirlos de las incorporaciones
    const jugadoresEnDraft = (equipo.draftpc || []).map(draft => draft.id);
    
    // Altas simplificadas - excluir jugadores que están en draft
    const altasConCosto = equipo.altas?.filter(j => j.costo > 0 && !jugadoresEnDraft.includes(j.id)) || [];
    const altasGratis = equipo.altas?.filter(j => (!j.costo || j.costo === 0) && !jugadoresEnDraft.includes(j.id)) || [];
    const totalCostoAltas = altasConCosto.reduce((sum, j) => sum + (j.costo || 0), 0);
    
    if (altasConCosto.length > 0 || altasGratis.length > 0) {
      movements += `\n\n[align=center][size=120][b]📈 INCORPORACIONES[/b][/size][/align]`;
      
      if (altasConCosto.length > 0) {
        movements += `\n[align=center][size=110][color=#40c057][b]💰 FICHAJES PAGADOS[/b][/color][/size][/align]`;
        altasConCosto.forEach((jugador, index) => {
          const costo = (jugador.costo || 0).toLocaleString();
          movements += `\n[align=center][size=100][b]${jugador.sobrenombre}[/b] - $${costo}[/size][/align]`;
        });
        movements += `\n[align=center][size=110][b]💳 TOTAL: $${totalCostoAltas.toLocaleString()}[/b][/size][/align]`;
      }
      
      if (altasGratis.length > 0) {
        movements += `\n[align=center][size=110][color=#22b8cf][b]🆓 FICHAJES GRATUITOS[/b][/color][/size][/align]`;
        altasGratis.forEach((jugador, index) => {
          movements += `\n[align=center][size=100][b]${jugador.sobrenombre}[/b][/size][/align]`;
        });
      }
    }

    // Bajas simplificadas con costo
    const bajasConPrecio = equipo.bajas?.filter(j => j.precio > 0) || [];
    const bajasGratis = equipo.bajas?.filter(j => !j.precio || j.precio === 0) || [];
    const totalIngresoBajas = bajasConPrecio.reduce((sum, j) => sum + (j.precio || 0), 0);

    if (bajasConPrecio.length > 0 || bajasGratis.length > 0) {
      movements += `\n\n[align=center][size=120][b]📉 SALIDAS[/b][/size][/align]`;
      
      if (bajasConPrecio.length > 0) {
        movements += `\n[align=center][size=110][color=#f03e3e][b]💸 VENTAS[/b][/color][/size][/align]`;
        bajasConPrecio.forEach((jugador, index) => {
          const precio = (jugador.precio || 0).toLocaleString();
          const costoOriginal = jugador.costo ? ` (Costo: $${jugador.costo.toLocaleString()})` : '';
          movements += `\n[align=center][size=100][b]${jugador.sobrenombre}[/b] - $${precio}${costoOriginal}[/size][/align]`;
        });
        movements += `\n[align=center][size=110][b]💹 TOTAL: $${totalIngresoBajas.toLocaleString()}[/b][/size][/align]`;
      }
      
      if (bajasGratis.length > 0) {
        movements += `\n[align=center][size=110][color=#868e96][b]🔓 LIBERACIONES[/b][/color][/size][/align]`;
        bajasGratis.forEach((jugador, index) => {
          const costoOriginal = jugador.costo ? ` (Costo: $${jugador.costo.toLocaleString()})` : ' (Gratis)';
          movements += `\n[align=center][size=100][b]${jugador.sobrenombre}[/b]${costoOriginal}[/size][/align]`;
        });
      }
    }

    // Balance simplificado
    const balanceTransferencias = totalIngresoBajas - totalCostoAltas;
    const balanceColor = balanceTransferencias >= 0 ? '#51cf66' : '#e03131';
    const balanceText = balanceTransferencias >= 0 ? '+' : '';
    
    movements += `\n\n[align=center][size=110][b]💼 BALANCE: [color=${balanceColor}]${balanceText}$${balanceTransferencias.toLocaleString()}[/color][/b][/size][/align]`;

    return movements;
  };

  // Función simplificada para finanzas
  const generateBBCodeFinances = (totalIngresos, totalEgresos, totalRating) => {
    const presupuestoInicial = equipo.datosFinancieros?.presupuestoInicial || 0;
    const presupuestoFinal = equipo.datosFinancieros?.presupuestoFinal || 0;
    const salarios = equipo.salarios || 0;
    
    return `\n\n[align=center][size=140][b]💰 BALANCE FINANCIERO[/b][/size][/align]
[align=center]════════════════════════════════════════════[/align]
[align=center][size=120][b]💎 PRESUPUESTO INICIAL: $${presupuestoInicial.toLocaleString()}[/b][/size][/align]
[align=center][size=110]📈 Ingresos: $${totalIngresos.toLocaleString()} | 📉 Egresos: $${totalEgresos.toLocaleString()}[/size][/align]
[align=center][size=110]💼 Salarios: $${salarios.toLocaleString()}[/size][/align]
[align=center][size=120][b]🏆 PRESUPUESTO FINAL: $${presupuestoFinal.toLocaleString()}[/b][/size][/align]`;
  };

  // Nueva función para Draft PC con validación de manager
  const generateBBCodeDraftPC = () => {
    // Filtrar solo los jugadores del manager actual
    const draftPlayers = (equipo.draftpc || []).filter(draft => 
      draft.manager === user?.usuario
    );
    
    if (draftPlayers.length === 0) {
      return `\n\n[align=center][size=140][b]📝 DRAFT PC[/b][/size][/align]
[align=center]════════════════════════════════════════════[/align]
[align=center][size=110]No hay jugadores en proceso de draft[/size][/align]`;
    }

    let draftSection = `\n\n[align=center][size=140][b]📝 DRAFT PC[/b][/size][/align]
[align=center]════════════════════════════════════════════[/align]
[align=center][size=120][b]Jugadores en Negociación: ${draftPlayers.length}[/b][/size][/align]\n`;

    draftPlayers.forEach((draft, index) => {
      const rating = draft.raiting || 0;
      const ratingColor = rating >= 85 ? '#ffd43b' : rating >= 75 ? '#51cf66' : rating >= 65 ? '#74c0fc' : '#868e96';
      const oferta = draft.ofertaFinal ? `$${draft.ofertaFinal.toLocaleString()}` : 'S/Oferta';
      
      draftSection += `\n[align=center][size=110][b]${index + 1}. ${draft.sobrenombre || draft.nombreCompleto}[/b] - [color=${ratingColor}][b]${rating}[/b][/color] - [color=#1a73e8][b]${oferta}[/b][/color][/size][/align]`;
    });

    const totalOferta = draftPlayers.reduce((sum, draft) => sum + (draft.ofertaFinal || 0), 0);
    if (totalOferta > 0) {
      draftSection += `\n\n[align=center][size=120][b]💰 TOTAL EN OFERTAS: $${totalOferta.toLocaleString()}[/b][/size][/align]`;
    }

    return draftSection;
  };

  // Función modificada para LinksoFIFA
  const generateBBCodeLinksoFIFA = () => {
    const linkSofifa = equipo.linksofifa;
    
    return `\n\n[align=center][size=140][b]⚡ VER EN SOFIFA[/b][/size][/align]
[align=center]════════════════════════════════════════════[/align]
[align=center][size=120][b]Consulta el equipo completo en SoFIFA[/b][/size][/align]
[align=center][size=110]📊 Estadísticas detalladas de cada jugador[/size][/align]
[align=center][size=110]⚽ Formaciones y tácticas recomendadas[/size][/align]
[align=center][size=110]📈 Análisis de rendimiento del equipo[/size][/align]
[align=center][size=120][color=#51cf66][b]🔗 ${linkSofifa}[/b][/color][/size][/align]`;
  };

  // Función simplificada para estadísticas (solo lo básico)
  const generateBBCodeStats = (jugadoresOrdenados) => {
    const porPosicion = {
      POR: jugadoresOrdenados.filter(j => j.posicion === 'POR').length,
      DEF: jugadoresOrdenados.filter(j => j.posicion === 'DEF').length,
      MED: jugadoresOrdenados.filter(j => j.posicion === 'MED').length,
      DEL: jugadoresOrdenados.filter(j => j.posicion === 'DEL').length
    };
    
    return `\n\n[align=center][size=140][b]📊 DISTRIBUCIÓN POR POSICIÓN[/b][/size][/align]
[align=center]════════════════════════════════════════════[/align]
[align=center][size=110]🥅 Porteros: ${porPosicion.POR} | 🛡️ Defensas: ${porPosicion.DEF} | ⚙️ Mediocampo: ${porPosicion.MED} | ⚽ Delanteros: ${porPosicion.DEL}[/size][/align]`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(bbCode);
      alert("BBCode copiado al portapapeles");
    } catch (err) {
      console.error("Error al copiar:", err);
      alert("Error al copiar al portapapeles");
    }
  };

  return (
    <Paper sx={{ p: { xs: 1, md: 3 }, mb: 2, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
        Generador de BBCode Avanzado
      </Typography>

      {/* Panel de opciones */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: "background.default" }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Opciones de Personalización
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Secciones a incluir:</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {[
                {
                  key: "includePlayerList",
                  label: "Lista de Jugadores"
                },
                {
                  key: "includeMovements",
                  label: "Movimientos"
                },
                {
                  key: "includeFinances",
                  label: "Balance Financiero"
                },
                {
                  key: "includeDraftPC",
                  label: "Draft PC"
                },
                ...(equipo?.linksofifa ? [{
                  key: "includeLinksoFIFA",
                  label: "Link SoFIFA"
                }] : [])
              ].map(option => (
                <Box key={option.key} sx={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={bbcodeOptions[option.key]}
                    onChange={(e) => setBbcodeOptions(prev => ({
                      ...prev,
                      [option.key]: e.target.checked
                    }))}
                    style={{ marginRight: 8 }}
                  />
                  <Typography variant="body2">{option.label}</Typography>
                </Box>
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Opciones de formato:</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={bbcodeOptions.groupByPosition}
                  onChange={(e) => setBbcodeOptions(prev => ({
                    ...prev,
                    groupByPosition: e.target.checked
                  }))}
                  style={{ marginRight: 8 }}
                />
                <Typography variant="body2">Agrupar jugadores por posición</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={bbcodeOptions.includeImages}
                  onChange={(e) => setBbcodeOptions(prev => ({
                    ...prev,
                    includeImages: e.target.checked
                  }))}
                  style={{ marginRight: 8 }}
                />
                <Typography variant="body2">Incluir imágenes</Typography>
              </Box>
            </Box>
            
            <TextField
              fullWidth
              label="Mensaje personalizado"
              variant="outlined"
              size="small"
              value={bbcodeOptions.customMessage}
              onChange={(e) => setBbcodeOptions(prev => ({
                ...prev,
                customMessage: e.target.value
              }))}
              sx={{ mt: 2 }}
              placeholder="Agrega un mensaje personalizado..."
            />
          </Grid>
        </Grid>

        {/* Selector de estilo */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Estilo de formato:</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            {[
              {
                value: "full",
                label: "Completo"
              },
              {
                value: "simple",
                label: "Simple"
              },
              {
                value: "compact",
                label: "Compacto"
              }
            ].map(style => (
              <Button
                key={style.value}
                variant={bbcodeStyle === style.value ? "contained" : "outlined"}
                size="small"
                onClick={() => setBbcodeStyle(style.value)}
              >
                {style.label}
              </Button>
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Botones de acción */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Genera código BBCode personalizado para publicar en foros
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            onClick={generateBBCode}
            sx={{ fontWeight: 600 }}
            disabled={!equipo}
          >
            Generar BBCode
          </Button>
          {bbCode && (
            <>
              <Button
                variant="outlined"
                onClick={copyToClipboard}
                sx={{ fontWeight: 600 }}
              >
                Copiar
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setBbCode("")}
                sx={{ fontWeight: 600 }}
              >
                Limpiar
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Preview del BBCode */}
      {bbCode && (
        <>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 2, 
              mb: 2,
              bgcolor: (theme) => theme.palette.mode === "dark" ? "grey.900" : "grey.50",
              border: "1px solid",
              borderColor: (theme) => theme.palette.mode === "dark" ? "grey.700" : "grey.300",
              borderRadius: 2,
              maxHeight: 400,
              overflow: "auto"
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                BBCode generado ({bbCode.length} caracteres):
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button size="small" variant="outlined" onClick={() => {
                  const element = document.createElement('a');
                  const file = new Blob([bbCode], {type: 'text/plain'});
                  element.href = URL.createObjectURL(file);
                  element.download = `bbcode_${equipo.nombre?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                }}>
                  Descargar
                </Button>
              </Box>
            </Box>
            <Box
              component="pre"
              sx={{
                fontFamily: "monospace",
                fontSize: "0.875rem",
                lineHeight: 1.4,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                margin: 0,
                color: (theme) => theme.palette.mode === "dark" ? "grey.300" : "grey.800"
              }}
            >
              {bbCode}
            </Box>
          </Paper>

          {/* Vista previa renderizada (simulación) */}
          <Paper 
            elevation={1} 
            sx={{ 
              p: 2,
              bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.02)" : "background.default",
              border: "1px solid",
              borderColor: (theme) => theme.palette.mode === "dark" ? "grey.600" : "grey.300",
              borderRadius: 2
            }}
          >
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
              Vista previa (aproximada):
            </Typography>
            <BBCodePreview bbCode={bbCode} equipo={equipo} />
          </Paper>
        </>
      )}

      {!bbCode && (
        <Paper 
          elevation={1} 
          sx={{ 
            p: 4, 
            textAlign: "center",
            bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.02)" : "background.default",
            border: "1px dashed",
            borderColor: (theme) => theme.palette.mode === "dark" ? "grey.600" : "grey.400"
          }}
        >
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            Configura las opciones y haz clic en "Generar BBCode"
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Personaliza el contenido y formato antes de generar
          </Typography>
        </Paper>
      )}
    </Paper>
  );
};

// Componente para vista previa del BBCode
const BBCodePreview = ({ bbCode, equipo }) => {
  // Simulación básica de renderizado BBCode
  const renderPreview = () => {
    if (!bbCode) return null;
    
    return (
      <Box sx={{ 
        textAlign: "center", 
        "& .team-name": { 
          fontSize: "1.5rem", 
          fontWeight: "bold", 
          color: "primary.main",
          textShadow: "1px 1px 2px rgba(0,0,0,0.3)"
        },
        "& .section-title": {
          fontSize: "1.2rem",
          fontWeight: "bold",
          margin: "16px 0 8px 0",
          textDecoration: "underline"
        },
        "& .player-line": {
          margin: "4px 0",
          fontFamily: "monospace"
        }
      }}>
        {equipo.img && (
          <Avatar 
            src={equipo.img} 
            alt={equipo.nombre}
            sx={{ width: 80, height: 80, mx: "auto", mb: 2 }}
          />
        )}
        <Typography className="team-name">
          {equipo.nombre?.toUpperCase()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Vista previa simplificada del BBCode generado
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ 
      maxHeight: 300, 
      overflow: "auto",
      p: 2,
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 1,
      bgcolor: "background.paper"
    }}>
      {renderPreview()}
    </Box>
  );
};

export default PublicacionesTab;
