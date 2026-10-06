import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Collapse,
  Container,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  EmojiEvents as TrophyIcon,
  ExpandMore as ExpandMoreIcon,
  Groups as GroupsIcon,
  Search as SearchIcon,
  SportsSoccer as SoccerIcon,
  WorkspacePremium as PremiumIcon,
} from "@mui/icons-material";
import useSalonFama from "../hooks/useSalonFama";

// Colores que no cambian con el tema (medallas, acentos)
const ACCENT_COLORS = {
  gold: "#f5c518",
  silver: "#b8c1cf",
  bronze: "#cf7c32",
  blue: "#59a8ff",
  green: "#43c987",
  purple: "#b169f7",
};

const MEDALS = {
  1: { color: ACCENT_COLORS.gold, soft: "rgba(245,197,24,.13)" },
  2: { color: ACCENT_COLORS.silver, soft: "rgba(184,193,207,.11)" },
  3: { color: ACCENT_COLORS.bronze, soft: "rgba(207,124,50,.12)" },
};

const TOURNAMENTS = [
  { label: "Todos", idTipo: null },
  { label: "Primera", idTipo: 1 },
  { label: "Superliga", idTipo: 5 },
  { label: "Champions", idTipo: 4 },
  { label: "Europa League", idTipo: 6 },
  { label: "Copa", idTipo: 9 },
  { label: "Juveniles", idTipo: 7 },
  { label: "Super Copa", idTipo: 3 },
  { label: "Mundial FX", idTipo: 8 },
];

const TOURNAMENT_PRIORITY = {
  1: 1,
  5: 2,
  4: 3,
  6: 4,
  9: 5,
  7: 6,
  3: 7,
  8: 8,
};

const normalize = (value = "") =>
  String(value).trim().toLocaleLowerCase("es");

const initials = (value = "") =>
  String(value)
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function SafeAvatar({ src, name, size = 44, sx = {} }) {
  const [failed, setFailed] = useState(false);
  const theme = useTheme();

  return (
    <Avatar
      src={!failed && src ? src : undefined}
      alt={name}
      imgProps={{ onError: () => setFailed(true), referrerPolicy: "no-referrer" }}
      sx={{
        width: size,
        height: size,
        bgcolor: theme.palette.action.hover,
        color: theme.palette.text.primary,
        fontWeight: 900,
        ...sx,
      }}
    >
      {initials(name)}
    </Avatar>
  );
}

function MetricCard({ icon, value, label, helper, accent }) {
  const theme = useTheme();
  
  return (
    <Paper
      variant="outlined"
      sx={{
        height: "100%",
        p: { xs: 1.35, sm: 1.6 },
        borderRadius: 2.5,
      }}
    >
      <Stack direction="row" spacing={1.2} alignItems="center">
        <Box
          sx={{
            width: { xs: 38, sm: 44 },
            height: { xs: 38, sm: 44 },
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: `${accent}18`,
            color: accent,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box minWidth={0}>
          <Typography
            sx={{ fontSize: { xs: 18, sm: 23 }, fontWeight: 950, lineHeight: 1.05 }}
            noWrap
          >
            {value}
          </Typography>
          <Typography sx={{ fontSize: { xs: 11, sm: 13 }, fontWeight: 850 }} noWrap>
            {label}
          </Typography>
          <Typography sx={{ fontSize: 11 }} color="text.secondary" noWrap>
            {helper}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

function LatestSeason({ season, champions }) {
  const theme = useTheme();
  
  if (!season || !champions.length) return null;

  const main = champions[0];

  return (
    <Paper
      variant="outlined"
      sx={{
        overflow: "hidden",
        borderRadius: 3,
        borderColor: "rgba(245,197,24,.55)",
        background: theme.palette.mode === 'dark'
          ? "linear-gradient(125deg, rgba(245,197,24,.14), rgba(89,168,255,.05) 60%, rgba(255,255,255,.025))"
          : "linear-gradient(125deg, rgba(245,197,24,.20), rgba(89,168,255,.08) 60%, rgba(0,0,0,.02))",
      }}
    >
      <Grid container>
        <Grid item xs={12} md={5}>
          <Stack
            direction={{ xs: "row", sm: "row" }}
            spacing={{ xs: 1.4, sm: 2 }}
            alignItems="center"
            sx={{ p: { xs: 1.7, sm: 2.3 } }}
          >
            <SafeAvatar
              src={main.img}
              name={main.usuario}
              size={72}
              sx={{ border: `3px solid ${ACCENT_COLORS.gold}`, bgcolor: ACCENT_COLORS.gold }}
            />
            <Box minWidth={0}>
              <Stack direction="row" spacing={0.7} alignItems="center" mb={0.5}>
                <TrophyIcon sx={{ color: ACCENT_COLORS.gold, fontSize: 18 }} />
                <Typography sx={{ color: ACCENT_COLORS.gold, fontWeight: 900, fontSize: 12 }}>
                  ÚLTIMA TEMPORADA
                </Typography>
              </Stack>
              <Typography
                sx={{ fontSize: { xs: 23, sm: 31 }, fontWeight: 950, lineHeight: 1.08 }}
                noWrap
              >
                {main.usuario}
              </Typography>
              <Typography color="text.secondary" sx={{ fontWeight: 750 }} noWrap>
                {main.nombreEquipo}
              </Typography>
              <Stack direction="row" spacing={0.8} alignItems="center" mt={1} flexWrap="wrap" useFlexGap>
                <Chip label={main.nombreTorneo} size="small" color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Temporada {season}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Grid>

        <Grid item xs={12} md={7}>
          <Box
            sx={{
              p: { xs: 1.6, sm: 2.2 },
              borderTop: { xs: 1, md: 0 },
              borderLeft: { md: 1 },
              borderColor: 'divider',
              height: "100%",
            }}
          >
            <Typography fontWeight={900} mb={1.1}>
              Campeones de la temporada {season}
            </Typography>
            <Stack spacing={0.85}>
              {champions.map((item, index) => (
                <Stack
                  key={`${item.idTorneo}-${item.usuario}-${index}`}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <Box
                    sx={{
                      width: 25,
                      height: 25,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      bgcolor: index < 3 ? MEDALS[index + 1].color : "rgba(255,255,255,.08)",
                      color: index < 3 ? "#111" : "#fff",
                      fontSize: 12,
                      fontWeight: 950,
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </Box>
                  <SafeAvatar src={item.imgTorneo} name={item.nombreTorneo} size={27} />
                  <Typography variant="body2" fontWeight={800} flex={1} noWrap>
                    {item.nombreTorneo}
                  </Typography>
                  <Typography variant="body2" sx={{ color: ACCENT_COLORS.gold, fontWeight: 900 }} noWrap>
                    {item.usuario}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

function PodiumCard({ player, position }) {
  const theme = useTheme();
  const medal = MEDALS[position];
  const team = player.equiposInfo?.[0];

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.25, sm: 1.5 },
        minHeight: { xs: 96, sm: 132 },
        borderRadius: 2.5,
        borderColor: medal.color,
        bgcolor: medal.soft,
        boxShadow: position === 1 ? `0 10px 28px ${medal.color}18` : "none",
      }}
    >
      <Stack
        direction={{ xs: "row", md: "column" }}
        spacing={{ xs: 1.3, md: 0.7 }}
        alignItems={{ xs: "center", md: "center" }}
        textAlign={{ xs: "left", md: "center" }}
      >
        <Box sx={{ position: "relative", flexShrink: 0 }}>
          <SafeAvatar
            src={team?.img}
            name={player.usuario}
            size={50}
            sx={{ border: `2px solid ${medal.color}` }}
          />
          <Box
            sx={{
              position: "absolute",
              right: -7,
              bottom: -5,
              width: 24,
              height: 24,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              bgcolor: medal.color,
              color: "#111",
              fontWeight: 950,
              fontSize: 12,
              border: `2px solid ${theme.palette.background.paper}`,
            }}
          >
            {position}
          </Box>
        </Box>

        <Box minWidth={0} flex={1}>
          <Typography fontWeight={950} noWrap>
            {player.usuario}
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: 11 }} noWrap>
            {team?.nombreEquipo || "Equipo no disponible"}
          </Typography>
          <Stack
            direction="row"
            spacing={0.65}
            alignItems="center"
            justifyContent={{ xs: "flex-start", md: "center" }}
            mt={0.65}
          >
            <TrophyIcon sx={{ color: medal.color, fontSize: 18 }} />
            <Typography sx={{ fontSize: 22, fontWeight: 950, color: medal.color }}>
              {player.total}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: 11 }}>títulos</Typography>
          </Stack>
          <Typography color="text.secondary" sx={{ fontSize: 11 }} noWrap>
            {player.torneos?.length || 0} categorías
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

function TournamentBreakdown({ detail }) {
  const groups = useMemo(() => {
    const map = new Map();
    detail.forEach((item) => {
      const key = item.idTipoTorneo ?? normalize(item.nombreTorneo);
      if (!map.has(key)) {
        map.set(key, {
          nombre: item.nombreTorneo,
          img: item.imgTorneo,
          count: 0,
        });
      }
      map.get(key).count += 1;
    });
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [detail]);

  return (
    <Stack spacing={0.7}>
      {groups.map((group) => (
        <Stack
          key={normalize(group.nombre)}
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ p: 1, borderRadius: 2, bgcolor: "rgba(255,255,255,.035)" }}
        >
          <SafeAvatar src={group.img} name={group.nombre} size={28} />
          <Typography variant="body2" fontWeight={800} flex={1} noWrap>
            {group.nombre}
          </Typography>
          <Chip label={group.count} size="small" color="primary" />
        </Stack>
      ))}
    </Stack>
  );
}

function ChampionRow({ player, position, detail }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const medal = MEDALS[position];
  const team = player.equiposInfo?.[0];
  const lastTitle = [...detail].sort(
    (a, b) => Number(b.nombreTemporada) - Number(a.nombreTemporada)
  )[0];

  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: 2.2, overflow: "hidden" }}
    >
      <Box
        onClick={() => setOpen((value) => !value)}
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "34px 38px minmax(0,1fr) auto 28px",
            md: "45px 46px minmax(150px,1.3fr) minmax(140px,1fr) 95px 120px 28px",
          },
          gap: { xs: 0.8, md: 1.2 },
          alignItems: "center",
          p: { xs: 1.05, md: 1.3 },
          cursor: "pointer",
          bgcolor: medal?.soft || "transparent",
          "&:hover": { bgcolor: medal?.soft || theme.palette.action.hover },
        }}
      >
        <Typography fontWeight={950} color={medal?.color || 'text.secondary'}>
          #{position}
        </Typography>
        <SafeAvatar
          src={team?.img}
          name={player.usuario}
          size={38}
          sx={{ border: medal ? `2px solid ${medal.color}` : 1, borderColor: medal ? medal.color : 'divider' }}
        />
        <Box minWidth={0}>
          <Typography fontWeight={900} noWrap>
            {player.usuario}
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: 11 }} noWrap>
            {team?.nombreEquipo || "Sin equipo"}
          </Typography>
        </Box>
        <Typography
          sx={{ display: { xs: "none", md: "block" } }}
          color="text.secondary"
          noWrap
        >
          {team?.nombreEquipo || "—"}
        </Typography>
        <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
          <TrophyIcon sx={{ color: ACCENT_COLORS.gold, fontSize: 19 }} />
          <Typography fontWeight={950}>{player.total}</Typography>
        </Stack>
        <Box sx={{ display: { xs: "none", md: "block" }, textAlign: "right" }}>
          <Typography variant="caption" fontWeight={800} noWrap display="block">
            {lastTitle?.nombreTorneo || "—"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            T{lastTitle?.nombreTemporada || "—"}
          </Typography>
        </Box>
        <IconButton
          size="small"
          sx={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform .2s ease",
          }}
        >
          <ExpandMoreIcon fontSize="small" />
        </IconButton>
      </Box>

      <Collapse in={open} unmountOnExit>
        <Divider />
        <Grid container spacing={1.6} sx={{ p: 1.6, bgcolor: theme.palette.action.hover }}>
          <Grid item xs={12} md={5}>
            <Typography fontWeight={900} mb={1}>
              Títulos por competición
            </Typography>
            <TournamentBreakdown detail={detail} />
          </Grid>
          <Grid item xs={12} md={7}>
            <Typography fontWeight={900} mb={1}>
              Historial ({detail.length})
            </Typography>
            <Box sx={{ maxHeight: 240, overflowY: "auto", pr: 0.5 }}>
              <Stack spacing={0.6}>
                {[...detail]
                  .sort((a, b) => Number(b.nombreTemporada) - Number(a.nombreTemporada))
                  .map((item, index) => (
                    <Stack
                      key={`${item.idTorneo}-${index}`}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ p: 0.9, borderRadius: 1.5, bgcolor: "rgba(255,255,255,.035)" }}
                    >
                      <SafeAvatar src={item.imgTorneo} name={item.nombreTorneo} size={26} />
                      <Typography variant="body2" fontWeight={800} flex={1} noWrap>
                        {item.nombreTorneo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Temporada {item.nombreTemporada}
                      </Typography>
                    </Stack>
                  ))}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Collapse>
    </Paper>
  );
}

export default function SalonFama() {
  const {
    loading,
    error,
    fetchSalonFama,
    getUsuariosResumen,
    getEstadisticas,
    getDetalleSoloCampeonatos,
  } = useSalonFama();

  const [tab, setTab] = useState(0);
  const [query, setQuery] = useState("");
  const [season, setSeason] = useState("all");

  useEffect(() => {
    fetchSalonFama();
  }, [fetchSalonFama]);

  const users = getUsuariosResumen();
  const stats = getEstadisticas();
  // Usar solo campeonatos (sin subcampeonatos)
  const detail = getDetalleSoloCampeonatos();

  const seasons = useMemo(() => {
    return [...new Set(detail.map((item) => Number(item.nombreTemporada)).filter(Number.isFinite))]
      .sort((a, b) => b - a);
  }, [detail]);

  const latestSeason = seasons[0] || null;

  const latestChampions = useMemo(() => {
    if (!latestSeason) return [];
    return detail
      .filter((item) => Number(item.nombreTemporada) === latestSeason)
      .sort((a, b) => {
        const priorityA = TOURNAMENT_PRIORITY[a.idTipoTorneo] ?? 99;
        const priorityB = TOURNAMENT_PRIORITY[b.idTipoTorneo] ?? 99;
        return priorityA - priorityB || a.nombreTorneo.localeCompare(b.nombreTorneo);
      });
  }, [detail, latestSeason]);

  const enhancedUsers = useMemo(() => {
    return users.map((user) => {
      const key = normalize(user.usuario);
      const allDetail = detail.filter((item) => normalize(item.usuario) === key);
      const teams = new Map();

      [...(user.torneos || []), ...allDetail].forEach((item) => {
        const teamKey = `${normalize(item.nombreEquipo)}-${item.idEquipo}`;
        if (!teams.has(teamKey)) {
          teams.set(teamKey, {
            nombreEquipo: item.nombreEquipo,
            idEquipo: item.idEquipo,
            img: item.img,
          });
        }
      });

      return {
        ...user,
        allDetail,
        equiposInfo: [...teams.values()],
      };
    });
  }, [users, detail]);

  const filteredUsers = useMemo(() => {
    const idTipo = TOURNAMENTS[tab]?.idTipo;
    const search = normalize(query);

    return enhancedUsers
      .map((user) => {
        let filteredDetail = user.allDetail;

        if (season !== "all") {
          filteredDetail = filteredDetail.filter(
            (item) => Number(item.nombreTemporada) === Number(season)
          );
        }

        if (idTipo != null) {
          filteredDetail = filteredDetail.filter(
            (item) => Number(item.idTipoTorneo) === Number(idTipo)
          );
        }

        const total = season === "all" && idTipo == null
          ? Number(user.total) || filteredDetail.length
          : filteredDetail.length;

        return { ...user, total, filteredDetail };
      })
      .filter((user) => user.total > 0)
      .filter((user) => {
        if (!search) return true;
        const haystack = [
          user.usuario,
          ...user.equiposInfo.map((team) => team.nombreEquipo),
        ]
          .map(normalize)
          .join(" ");
        return haystack.includes(search);
      })
      .sort((a, b) => b.total - a.total || a.usuario.localeCompare(b.usuario));
  }, [enhancedUsers, query, season, tab]);

  const top3 = [...enhancedUsers]
    .sort((a, b) => Number(b.total) - Number(a.total))
    .slice(0, 3);

  const totalTitles = useMemo(
    () => detail.length,
    [detail]
  );

  if (loading) {
    return (
      <Box sx={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
        <Stack alignItems="center" spacing={1.5}>
          <CircularProgress />
          <Typography color="text.secondary">Cargando Salón de la Fama...</Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 5 }}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Typography color="error" fontWeight={900}>
            No se pudo cargar el Salón de la Fama
          </Typography>
          <Typography color="text.secondary">{error}</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", pb: 6 }}>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          background: (theme) => theme.palette.mode === 'dark'
            ? "linear-gradient(100deg, #0d1420, #102b50)"
            : "linear-gradient(100deg, #e3f2fd, #bbdefb)",
        }}
      >
        <Container maxWidth="xl" sx={{ py: { xs: 1.8, md: 2.4 } }}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                display: "grid",
                placeItems: "center",
                borderRadius: 2,
                bgcolor: "rgba(245,197,24,.13)",
              }}
            >
              <TrophyIcon sx={{ color: ACCENT_COLORS.gold }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: { xs: 23, md: 31 }, fontWeight: 950 }}>
                Salón de la Fama
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: { xs: 11, sm: 13 } }}>
                Campeones históricos, títulos y trayectoria de cada jugador.
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <LatestSeason season={latestSeason} champions={latestChampions} />

        <Grid container spacing={1.2} sx={{ mt: 1.4 }}>
          <Grid item xs={6} md={3}>
            <MetricCard
              icon={<GroupsIcon fontSize="small" />}
              value={stats.totalUsuarios || enhancedUsers.length}
              label="Campeones"
              helper="Jugadores con títulos"
              accent={ACCENT_COLORS.green}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <MetricCard
              icon={<TrophyIcon fontSize="small" />}
              value={totalTitles}
              label="Títulos registrados"
              helper="Campeonatos históricos"
              accent={ACCENT_COLORS.gold}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <MetricCard
              icon={<SoccerIcon fontSize="small" />}
              value={stats.equiposUnicos || 0}
              label="Equipos campeones"
              helper="Clubes distintos"
              accent={ACCENT_COLORS.blue}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <MetricCard
              icon={<PremiumIcon fontSize="small" />}
              value={stats.topUsuario?.usuario || top3[0]?.usuario || "—"}
              label="Máximo campeón"
              helper={`${stats.topUsuario?.total || top3[0]?.total || 0} títulos`}
              accent={ACCENT_COLORS.purple}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" fontWeight={950} mb={1.2}>
            Podio histórico
          </Typography>
          <Grid container spacing={1.2}>
            {top3.map((player, index) => (
              <Grid item xs={12} md={4} key={normalize(player.usuario)}>
                <PodiumCard player={player} position={index + 1} />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            mt: 3,
            overflow: "hidden",
            borderRadius: 3,
          }}
        >
          <Box sx={{ p: { xs: 1.4, md: 2 } }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.2}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", md: "center" }}
            >
              <Box>
                <Typography variant="h5" fontWeight={950}>
                  Ranking de campeones
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Busca por jugador o equipo y filtra por temporada.
                </Typography>
              </Box>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <TextField
                  size="small"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar jugador o equipo"
                  sx={{ minWidth: { sm: 260 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControl size="small" sx={{ minWidth: { sm: 190 } }}>
                  <Select
                    value={season}
                    onChange={(event) => setSeason(event.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="all">Todas las temporadas</MenuItem>
                    {seasons.map((item) => (
                      <MenuItem key={item} value={item}>
                        Temporada {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
          </Box>

          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{ px: 1, borderTop: 1, borderBottom: 1, borderColor: 'divider' }}
          >
            {TOURNAMENTS.map((item) => (
              <Tab
                key={item.label}
                label={item.label}
                sx={{ textTransform: "none", fontWeight: 850, minWidth: "auto", px: 2 }}
              />
            ))}
          </Tabs>

          <Box sx={{ p: { xs: 1, md: 1.5 } }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
              px={0.4}
            >
              <Typography variant="body2" color="text.secondary">
                {filteredUsers.length} campeones encontrados
              </Typography>
              <Chip
                size="small"
                variant="outlined"
                color="primary"
                label={season === "all" ? TOURNAMENTS[tab].label : `T${season}`}
              />
            </Stack>

            <Stack spacing={0.8}>
              {filteredUsers.map((player, index) => (
                <ChampionRow
                  key={`${normalize(player.usuario)}-${index}`}
                  player={player}
                  position={index + 1}
                  detail={player.filteredDetail}
                />
              ))}
            </Stack>

            {!filteredUsers.length && (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <TrophyIcon sx={{ fontSize: 40, color: "text.disabled" }} />
                <Typography fontWeight={900} mt={1}>
                  No encontramos campeones
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cambia el nombre, la temporada o el tipo de torneo.
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}