import { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Alert
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

const GuardDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ accessLogs: [], patrolStatus: [] });
  const [sos, setSOS] = useState([]);

  useEffect(() => {
    api.get("/patrol/gate-logs").then(({ data }) => setData(data)).catch(() => {});
    api.get("/notices").then(({ data }) => setSOS(data.filter((n) => n.NoticeType === "Emergency" && n.IsActive))).catch(() => {});
  }, []);

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={1}>Guard Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>Gate: {user?.Assigned_Gate || "Main Gate"} | Shift: {user?.Shift_Timing || "—"}</Typography>

      {sos.map((s) => (
        <Alert severity="error" key={s._id} sx={{ mb: 2, fontWeight: "bold" }}>
          🚨 SOS ALERT: {s.Title} — {s.Content}
        </Alert>
      ))}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" fontWeight="bold" mb={1}>Recent Gate Access</Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#1a237e" }}>
                <TableRow>
                  {["Name", "Unit", "Check-In", "Status"].map((h) => (
                    <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.accessLogs.slice(0, 10).map((v) => (
                  <TableRow key={v._id}>
                    <TableCell>{v.Name}</TableCell>
                    <TableCell>{v.unit?.Unit_Number || "—"}</TableCell>
                    <TableCell>{new Date(v.CheckIn_Time).toLocaleTimeString()}</TableCell>
                    <TableCell><Chip label={v.CheckOut_Time ? "Left" : "Inside"} color={v.CheckOut_Time ? "default" : "success"} size="small" /></TableCell>
                  </TableRow>
                ))}
                {!data.accessLogs.length && <TableRow><TableCell colSpan={4} align="center">No access logs</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" fontWeight="bold" mb={1}>Recent Patrol Logs</Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#4527a0" }}>
                <TableRow>
                  {["Guard", "Checkpoint", "Time", "Status"].map((h) => (
                    <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.patrolStatus.slice(0, 10).map((l) => (
                  <TableRow key={l._id}>
                    <TableCell>{l.guard?.Name}</TableCell>
                    <TableCell>{l.CheckpointName}</TableCell>
                    <TableCell>{new Date(l.LogTime).toLocaleTimeString()}</TableCell>
                    <TableCell><Chip label={l.Status} color={l.Status === "Completed" ? "success" : "error"} size="small" /></TableCell>
                  </TableRow>
                ))}
                {!data.patrolStatus.length && <TableRow><TableCell colSpan={4} align="center">No patrol logs</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GuardDashboard;
