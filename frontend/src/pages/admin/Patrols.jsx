import { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Grid, Card, CardContent
} from "@mui/material";
import api from "../../api/axios";

const Patrols = () => {
  const [logs, setLogs] = useState([]);
  const [visitors, setVisitors] = useState([]);

  useEffect(() => {
    api.get("/patrol/gate-logs")
      .then(({ data }) => {
        setLogs(data.patrolStatus || []);
        setVisitors(data.accessLogs || []);
      })
      .catch(() => {
        setLogs([]);
        setVisitors([]);
      });
  }, []);

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3}>Security Monitoring</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" fontWeight="bold" mb={1}>Patrol Logs</Typography>
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
                {logs.map((l) => (
                  <TableRow key={l._id} hover>
                    <TableCell>{l.guard?.Name}</TableCell>
                    <TableCell>{l.CheckpointName}</TableCell>
                    <TableCell>{new Date(l.LogTime).toLocaleString()}</TableCell>
                    <TableCell><Chip label={l.Status} color={l.Status === "Completed" ? "success" : "error"} size="small" /></TableCell>
                  </TableRow>
                ))}
                {!logs.length && <TableRow><TableCell colSpan={4} align="center">No patrol logs</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
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
                {visitors.slice(0, 15).map((v) => (
                  <TableRow key={v._id} hover>
                    <TableCell>{v.Name}</TableCell>
                    <TableCell>{v.unit?.Unit_Number || "—"}</TableCell>
                    <TableCell>{v.CheckIn_Time ? new Date(v.CheckIn_Time).toLocaleTimeString() : "—"}</TableCell>
                    <TableCell><Chip label={v.CheckOut_Time ? "Left" : "Inside"} color={v.CheckOut_Time ? "default" : "success"} size="small" /></TableCell>
                  </TableRow>
                ))}
                {!visitors.length && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No gate access records yet</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Patrols;
