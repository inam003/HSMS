import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, Chip, Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import api from "../../api/axios";

const CHECKPOINTS = [
  "Main Gate", "Back Gate", "Parking Area", "Block A Entrance",
  "Block B Entrance", "Swimming Pool", "Garden Area", "Basement"
];

const GuardPatrol = () => {
  const [logs, setLogs] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ CheckpointName: "", Status: "Completed" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    api.get("/patrol/my-logs").then(({ data }) => setLogs(data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleLog = async () => {
    setError("");
    try {
      await api.post("/patrol", form);
      setSuccess(`Checkpoint "${form.CheckpointName}" logged as ${form.Status}!`);
      setOpen(false);
      setForm({ CheckpointName: "", Status: "Completed" });
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to log checkpoint");
    }
  };

  const todayLogs = logs.filter((l) => {
    const logDate = new Date(l.LogTime);
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  });

  const completedToday = todayLogs.filter((l) => l.Status === "Completed").length;
  const skippedToday = todayLogs.filter((l) => l.Status === "Skipped").length;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">Patrol Checkpoint Logging</Typography>
        <Button
          variant="contained"
          startIcon={<CheckCircleIcon />}
          onClick={() => { setForm({ CheckpointName: "", Status: "Completed" }); setError(""); setOpen(true); }}
          sx={{ bgcolor: "#4527a0" }}
        >
          Log Checkpoint
        </Button>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      {/* Today's Summary */}
      <Box display="flex" gap={2} mb={3}>
        <Paper sx={{ p: 2, borderRadius: 2, flex: 1, textAlign: "center", bgcolor: "#e8f5e9" }}>
          <Typography variant="h4" fontWeight="bold" color="#2e7d32">{completedToday}</Typography>
          <Typography variant="body2" color="text.secondary">Completed Today</Typography>
        </Paper>
        <Paper sx={{ p: 2, borderRadius: 2, flex: 1, textAlign: "center", bgcolor: "#ffebee" }}>
          <Typography variant="h4" fontWeight="bold" color="#c62828">{skippedToday}</Typography>
          <Typography variant="body2" color="text.secondary">Skipped Today</Typography>
        </Paper>
        <Paper sx={{ p: 2, borderRadius: 2, flex: 1, textAlign: "center", bgcolor: "#e3f2fd" }}>
          <Typography variant="h4" fontWeight="bold" color="#1565c0">{todayLogs.length}</Typography>
          <Typography variant="body2" color="text.secondary">Total Logs Today</Typography>
        </Paper>
      </Box>

      <Typography variant="h6" fontWeight="bold" mb={1}>Patrol Log History</Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
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
                  <Chip
                    label={l.Status}
                    color={l.Status === "Completed" ? "success" : "error"}
                    size="small"
                    icon={l.Status === "Completed" ? <CheckCircleIcon /> : <CancelIcon />}
                  />
                </TableCell>
              </TableRow>
            ))}
            {!logs.length && (
              <TableRow>
                <TableCell colSpan={4} align="center">No patrol logs yet</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Log Patrol Checkpoint</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <FormControl fullWidth margin="normal">
            <InputLabel>Checkpoint</InputLabel>
            <Select
              value={form.CheckpointName}
              label="Checkpoint"
              onChange={(e) => setForm({ ...form, CheckpointName: e.target.value })}
            >
              {CHECKPOINTS.map((cp) => (
                <MenuItem key={cp} value={cp}>{cp}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={form.Status}
              label="Status"
              onChange={(e) => setForm({ ...form, Status: e.target.value })}
            >
              <MenuItem value="Completed">Completed ✅</MenuItem>
              <MenuItem value="Skipped">Skipped ⚠️</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleLog}
            disabled={!form.CheckpointName}
            sx={{ bgcolor: "#4527a0" }}
          >
            Log Checkpoint
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GuardPatrol;
