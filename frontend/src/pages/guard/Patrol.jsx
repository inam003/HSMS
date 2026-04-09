import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogContent, DialogActions,
  Alert, Chip, Select, MenuItem, FormControl, InputLabel, FormHelperText,
  Divider, CircularProgress, Card, CardContent, Grid
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon      from "@mui/icons-material/Cancel";
import RouteIcon       from "@mui/icons-material/Route";
import SensorsIcon     from "@mui/icons-material/Sensors";
import api from "../../api/axios";

const CHECKPOINTS = [
  "Main Gate", "Back Gate", "Parking Area", "Block A Entrance",
  "Block B Entrance", "Swimming Pool", "Garden Area", "Basement"
];

const ModalHeader = ({ icon, title, subtitle, color = "#4527a0" }) => (
  <Box sx={{ bgcolor: color, px: 3, py: 2.5, borderRadius: "12px 12px 0 0" }}>
    <Box display="flex" alignItems="center" gap={1.5}>
      <Box sx={{ color: "rgba(255,255,255,0.85)", display: "flex" }}>{icon}</Box>
      <Box>
        <Typography variant="h6" fontWeight="bold" color="white">{title}</Typography>
        {subtitle && <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>{subtitle}</Typography>}
      </Box>
    </Box>
  </Box>
);

const validate = (form) => ({
  CheckpointName: !form.CheckpointName ? "Please select a checkpoint" : "",
  Status:         !form.Status         ? "Please select a status"     : "",
});

const GuardPatrol = () => {
  const [logs, setLogs]       = useState([]);
  const [open, setOpen]       = useState(false);
  const [form, setForm]       = useState({ CheckpointName: "", Status: "Completed" });
  const [touched, setTouched] = useState({});
  const [success, setSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [logging, setLogging] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get("/patrol/my-logs")
      .then(({ data }) => setLogs(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const errors  = validate(form);
  const isValid = !errors.CheckpointName && !errors.Status;

  const handleOpen = () => {
    setForm({ CheckpointName: "", Status: "Completed" });
    setTouched({}); setSubmitError(""); setOpen(true);
  };

  const handleLog = async () => {
    setTouched({ CheckpointName: true, Status: true });
    if (!isValid) return;
    setLogging(true); setSubmitError("");
    try {
      await api.post("/patrol", form);
      setSuccess(`Checkpoint "${form.CheckpointName}" logged as ${form.Status}!`);
      setOpen(false); load();
    } catch (e) { setSubmitError(e.response?.data?.message || "Failed to log checkpoint"); }
    finally { setLogging(false); }
  };

  const todayLogs      = logs.filter((l) => new Date(l.LogTime).toDateString() === new Date().toDateString());
  const completedToday = todayLogs.filter((l) => l.Status === "Completed").length;
  const skippedToday   = todayLogs.filter((l) => l.Status === "Skipped").length;

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress sx={{ color: "#4527a0" }} />
    </Box>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">Patrol Checkpoint Logging</Typography>
        <Button variant="contained" startIcon={<CheckCircleIcon />} onClick={handleOpen}
          sx={{ bgcolor: "#4527a0", borderRadius: 2 }}>Log Checkpoint</Button>
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      <Grid container spacing={2} mb={3}>
        {[
          { label: "Completed Today", value: completedToday,   color: "#2e7d32", bg: "#e8f5e9", icon: <CheckCircleIcon /> },
          { label: "Skipped Today",   value: skippedToday,     color: "#c62828", bg: "#ffebee", icon: <CancelIcon /> },
          { label: "Total Logs",      value: todayLogs.length, color: "#1565c0", bg: "#e3f2fd", icon: <SensorsIcon /> },
        ].map(({ label, value, color, bg, icon }) => (
          <Grid item xs={4} key={label}>
            <Card sx={{ borderRadius: 2, borderLeft: `5px solid ${color}`,
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="medium" mb={0.5}>{label}</Typography>
                    <Typography variant="h3" fontWeight="bold" color={color} lineHeight={1}>{value}</Typography>
                  </Box>
                  <Box sx={{ bgcolor: bg, borderRadius: "50%", width: 48, height: 48, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Box sx={{ color, display: "flex", "& svg": { fontSize: 24 } }}>{icon}</Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" fontWeight="bold" mb={1}>Patrol Log History</Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#4527a0" }}>
            <TableRow>
              {["Checkpoint", "Guard", "Log Time", "Status"].map((h) => (
                <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.slice(0, 50).map((l) => (
              <TableRow key={l._id} hover>
                <TableCell>{l.CheckpointName}</TableCell>
                <TableCell>{l.guard?.Name || "—"}</TableCell>
                <TableCell>{new Date(l.LogTime).toLocaleString()}</TableCell>
                <TableCell>
                  <Chip label={l.Status} color={l.Status === "Completed" ? "success" : "error"} size="small"
                    icon={l.Status === "Completed" ? <CheckCircleIcon /> : <CancelIcon />} />
                </TableCell>
              </TableRow>
            ))}
            {!logs.length && <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: "#aaa" }}>No patrol logs yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Log Checkpoint Dialog ── */}
      <Dialog open={open} onClose={() => !logging && setOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<RouteIcon />} title="Log Patrol Checkpoint" subtitle="Record the checkpoint status" />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          {submitError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSubmitError("")}>{submitError}</Alert>}
          <FormControl fullWidth required error={!!touched.CheckpointName && !!errors.CheckpointName} sx={{ mb: 1 }}>
            <InputLabel>Checkpoint</InputLabel>
            <Select value={form.CheckpointName} label="Checkpoint"
              onChange={(e) => { setForm({ ...form, CheckpointName: e.target.value }); setTouched((t) => ({ ...t, CheckpointName: true })); }}>
              {CHECKPOINTS.map((cp) => <MenuItem key={cp} value={cp}>{cp}</MenuItem>)}
            </Select>
            <FormHelperText>{touched.CheckpointName && errors.CheckpointName ? errors.CheckpointName : " "}</FormHelperText>
          </FormControl>
          <FormControl fullWidth required error={!!touched.Status && !!errors.Status}>
            <InputLabel>Status</InputLabel>
            <Select value={form.Status} label="Status"
              onChange={(e) => { setForm({ ...form, Status: e.target.value }); setTouched((t) => ({ ...t, Status: true })); }}>
              <MenuItem value="Completed">Completed ✅</MenuItem>
              <MenuItem value="Skipped">Skipped ⚠️</MenuItem>
            </Select>
            <FormHelperText>{touched.Status && errors.Status ? errors.Status : " "}</FormHelperText>
          </FormControl>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setOpen(false)} disabled={logging} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleLog} disabled={!isValid || logging}
            sx={{ bgcolor: "#4527a0", borderRadius: 2, px: 3, minWidth: 140, "&:disabled": { bgcolor: "#d1c4e9", color: "#fff" } }}>
            {logging ? <CircularProgress size={18} color="inherit" /> : "Log Checkpoint"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GuardPatrol;
