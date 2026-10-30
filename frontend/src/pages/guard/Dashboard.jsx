import { PortalPageTitle, PortalStatCard as StatCard, PortalSectionTitle as SectionHeader } from "../../components/common/PortalUI";
import { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Alert, CircularProgress
} from "@mui/material";
import PeopleIcon        from "@mui/icons-material/People";
import MeetingRoomIcon   from "@mui/icons-material/MeetingRoom";
import CheckCircleIcon   from "@mui/icons-material/CheckCircle";
import WarningAmberIcon  from "@mui/icons-material/WarningAmber";
import SensorsIcon       from "@mui/icons-material/Sensors";
import RouteIcon         from "@mui/icons-material/Route";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";


const GuardDashboard = () => {
  const { user } = useAuth();
  const [data, setData]     = useState({ accessLogs: [], patrolStatus: [] });
  const [sos, setSOS]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/patrol/gate-logs"), api.get("/notices")])
      .then(([d, n]) => {
        setData(d.data);
        setSOS(n.data.filter((x) => x.NoticeType === "Emergency" && x.IsActive));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const today            = new Date().toDateString();
  const insideNow        = (data.accessLogs || []).filter((v) => !v.CheckOut_Time).length;
  const todayAccess      = (data.accessLogs || []).filter((v) => new Date(v.CheckIn_Time).toDateString() === today).length;
  const completedToday   = (data.patrolStatus || []).filter((l) => new Date(l.LogTime).toDateString() === today && l.Status === "Completed").length;
  const totalPatrolToday = (data.patrolStatus || []).filter((l) => new Date(l.LogTime).toDateString() === today).length;

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress sx={{ color: "#0854ed" }} />
    </Box>
  );

  return (
    <Box className="hs-portal-page hs-portal-guard-Dashboard">
      <PortalPageTitle subtitle="Your gate activity, patrols, and security updates at a glance.">Guard Dashboard</PortalPageTitle>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Gate: <strong>{user?.Assigned_Gate || "Main Gate"}</strong> &nbsp;|&nbsp; Shift: <strong>{user?.Shift_Timing || "—"}</strong>
      </Typography>

      {sos.map((s) => (
        <Alert severity="error" key={s._id}
          sx={{ mb: 2, fontWeight: "bold", borderRadius: 2 }}>
          🚨 SOS ALERT: {s.Title} — {s.Content}
        </Alert>
      ))}

      {/* ── Stat Cards ── */}
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 6, sm: 3 }}   >
          <StatCard label="Visitors Inside" value={insideNow}
            color="#1565c0" bg="#e3f2fd" icon={<PeopleIcon />} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}   >
          <StatCard label="Gate Access Today" value={todayAccess}
            color="#6a1b9a" bg="#f3e5f5" icon={<MeetingRoomIcon />} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}   >
          <StatCard label="Patrols Completed" value={completedToday}
            color="#2e7d32" bg="#e8f5e9" icon={<CheckCircleIcon />} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}   >
          <StatCard label="Total Patrol Logs" value={totalPatrolToday}
            color="#0854ed" bg="#e9f1ff" icon={<SensorsIcon />} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* ── Recent Gate Access ── */}
        <Grid size={{ xs: 12, md: 6 }}   >
          <Card sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <SectionHeader icon={<MeetingRoomIcon />} title="Recent Gate Access" color="#1565c0" />
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: "#0854ed" }}>
                    <TableRow>
                      {["Name", "Unit", "Check-In", "Status"].map((h) => (
                        <TableCell key={h} sx={{ color: "white", fontWeight: "bold", py: 1 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(data.accessLogs || []).slice(0, 8).map((v) => (
                      <TableRow key={v._id} hover>
                        <TableCell>{v.Name}</TableCell>
                        <TableCell>{v.unit?.Unit_Number || "—"}</TableCell>
                        <TableCell>{new Date(v.CheckIn_Time).toLocaleTimeString()}</TableCell>
                        <TableCell>
                          <Chip label={v.CheckOut_Time ? "Left" : "Inside"}
                            color={v.CheckOut_Time ? "default" : "success"} size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                    {!(data.accessLogs || []).length && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3, color: "#aaa" }}>
                          No access logs today
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Recent Patrol Logs ── */}
        <Grid size={{ xs: 12, md: 6 }}   >
          <Card sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <SectionHeader icon={<RouteIcon />} title="Recent Patrol Logs" color="#0854ed" />
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: "#0854ed" }}>
                    <TableRow>
                      {["Guard", "Checkpoint", "Time", "Status"].map((h) => (
                        <TableCell key={h} sx={{ color: "white", fontWeight: "bold", py: 1 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(data.patrolStatus || []).slice(0, 8).map((l) => (
                      <TableRow key={l._id} hover>
                        <TableCell>{l.guard?.Name || "—"}</TableCell>
                        <TableCell>{l.CheckpointName}</TableCell>
                        <TableCell>{new Date(l.LogTime).toLocaleTimeString()}</TableCell>
                        <TableCell>
                          <Chip label={l.Status}
                            color={l.Status === "Completed" ? "success" : "error"} size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                    {!(data.patrolStatus || []).length && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3, color: "#aaa" }}>
                          No patrol logs today
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GuardDashboard;
