import { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Grid, Card, CardContent
} from "@mui/material";
import RouteIcon          from "@mui/icons-material/Route";
import CheckCircleIcon    from "@mui/icons-material/CheckCircle";
import CancelIcon         from "@mui/icons-material/Cancel";
import PeopleIcon         from "@mui/icons-material/People";
import SensorsIcon        from "@mui/icons-material/Sensors";
import MeetingRoomIcon    from "@mui/icons-material/MeetingRoom";
import api from "../../api/axios";

const StatCard = ({ label, value, color, bg, icon }) => (
  <Card sx={{ borderRadius: 2, borderLeft: `5px solid ${color}`, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", height: "100%" }}>
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight="medium" mb={1}>{label}</Typography>
          <Typography variant="h3" fontWeight="bold" color={color} lineHeight={1}>{value}</Typography>
        </Box>
        <Box sx={{
          bgcolor: bg, borderRadius: "50%",
          width: 56, height: 56, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Box sx={{ color, display: "flex", "& svg": { fontSize: 28 } }}>{icon}</Box>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const SectionHeader = ({ icon, title, color }) => (
  <Box display="flex" alignItems="center" gap={1} mb={2}>
    <Box sx={{
      bgcolor: color, borderRadius: 1.5, p: 0.8,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Box sx={{ color: "white", display: "flex", fontSize: 20 }}>{icon}</Box>
    </Box>
    <Typography variant="h6" fontWeight="bold">{title}</Typography>
  </Box>
);

const Patrols = () => {
  const [logs, setLogs]         = useState([]);
  const [visitors, setVisitors] = useState([]);

  useEffect(() => {
    api.get("/patrol/gate-logs")
      .then(({ data }) => {
        setLogs(data.patrolStatus || []);
        setVisitors(data.accessLogs || []);
      })
      .catch(() => { setLogs([]); setVisitors([]); });
  }, []);

  const today        = new Date().toDateString();
  const todayLogs    = logs.filter((l) => new Date(l.LogTime).toDateString() === today);
  const completedToday = todayLogs.filter((l) => l.Status === "Completed").length;
  const skippedToday   = todayLogs.filter((l) => l.Status === "Skipped").length;
  const insideNow      = visitors.filter((v) => !v.CheckOut_Time).length;
  const todayAccess    = visitors.filter((v) => new Date(v.CheckIn_Time).toDateString() === today).length;

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3}>Security Monitoring</Typography>

      {/* ── Summary stats ── */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={6} sm={3}>
          <StatCard label="Completed Today" value={completedToday} color="#2e7d32" bg="#e8f5e9" icon={<CheckCircleIcon />} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Skipped Today"   value={skippedToday}   color="#c62828" bg="#ffebee" icon={<CancelIcon />} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Visitors Inside" value={insideNow}      color="#1565c0" bg="#e3f2fd" icon={<SensorsIcon />} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Gate Access Today" value={todayAccess}  color="#6a1b9a" bg="#f3e5f5" icon={<MeetingRoomIcon />} />
        </Grid>
      </Grid>

      {/* ── Patrol Logs ── */}
      <Card sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 3 }}>
        <CardContent>
          <SectionHeader icon={<RouteIcon />} title="Patrol Checkpoint Logs" color="#4527a0" />
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ bgcolor: "#4527a0" }}>
                <TableRow>
                  {["Guard", "Checkpoint", "Date & Time", "Status"].map((h) => (
                    <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l._id} hover>
                    <TableCell>{l.guard?.Name || "—"}</TableCell>
                    <TableCell>{l.CheckpointName}</TableCell>
                    <TableCell>{new Date(l.LogTime).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={l.Status}
                        size="small"
                        color={l.Status === "Completed" ? "success" : "error"}
                        icon={l.Status === "Completed" ? <CheckCircleIcon /> : <CancelIcon />}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {!logs.length && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4, color: "#aaa" }}>
                      No patrol logs yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* ── Gate Access Logs ── */}
      <Card sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <SectionHeader icon={<PeopleIcon />} title="Recent Gate Access" color="#1a237e" />
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ bgcolor: "#1a237e" }}>
                <TableRow>
                  {["Visitor Name", "Visiting Unit", "Purpose", "Check-In", "Check-Out", "Pre-Approved", "Status"].map((h) => (
                    <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {visitors.slice(0, 20).map((v) => (
                  <TableRow key={v._id} hover>
                    <TableCell>{v.Name}</TableCell>
                    <TableCell>{v.unit?.Unit_Number ? `Unit ${v.unit.Unit_Number}` : "—"}</TableCell>
                    <TableCell>{v.Purpose || "—"}</TableCell>
                    <TableCell>{v.CheckIn_Time ? new Date(v.CheckIn_Time).toLocaleString() : "—"}</TableCell>
                    <TableCell>{v.CheckOut_Time ? new Date(v.CheckOut_Time).toLocaleString() : "—"}</TableCell>
                    <TableCell>
                      <Chip
                        label={v.isPreApproved ? "Yes ✓" : "No"}
                        size="small"
                        color={v.isPreApproved ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={v.CheckOut_Time ? "Left" : "Inside"}
                        size="small"
                        color={v.CheckOut_Time ? "default" : "success"}
                        sx={!v.CheckOut_Time ? { bgcolor: "#2e7d32", color: "white" } : {}}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {!visitors.length && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: "#aaa" }}>
                      No gate access records yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Patrols;
