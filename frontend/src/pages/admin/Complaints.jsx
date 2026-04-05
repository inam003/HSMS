import { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Dialog, DialogContent, DialogActions, Button, Select, MenuItem,
  FormControl, InputLabel, FormHelperText, Alert, Chip, Divider, CircularProgress
} from "@mui/material";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import api from "../../api/axios";

const ModalHeader = ({ icon, title, subtitle, color = "#1a237e" }) => (
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

const statusColors = { Pending: "warning", "In Progress": "info", Resolved: "success" };

const validate = (form) => ({
  Status: !form.Status ? "Please select a status" : "",
});

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [staff, setStaff]           = useState([]);
  const [open, setOpen]             = useState(false);
  const [selected, setSelected]     = useState(null);
  const [form, setForm]             = useState({ Status: "", assignedTo: "" });
  const [touched, setTouched]       = useState({});
  const [success, setSuccess]       = useState("");
  const [saving, setSaving]         = useState(false);

  const load = async () => {
    const [c, s] = await Promise.all([api.get("/complaints"), api.get("/staff")]);
    setComplaints(c.data); setStaff(s.data);
  };
  useEffect(() => { load(); }, []);

  const errors  = validate(form);
  const isValid = !errors.Status;

  const handleOpen = (c) => {
    setSelected(c);
    setForm({ Status: c.Status, assignedTo: c.assignedTo?._id || "" });
    setTouched({}); setOpen(true);
  };

  const handleUpdate = async () => {
    setTouched({ Status: true });
    if (!isValid) return;
    setSaving(true);
    try {
      await api.put(`/complaints/${selected._id}`, form);
      setSuccess("Complaint updated!"); setOpen(false); load();
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={2}>Complaints Management</Typography>
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#1a237e" }}>
            <TableRow>
              {["Resident", "Category", "Description", "Status", "Assigned To", "Date", "Actions"].map((h) => (
                <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {complaints.map((c) => (
              <TableRow key={c._id} hover>
                <TableCell>{c.resident?.Name}</TableCell>
                <TableCell>{c.Category}</TableCell>
                <TableCell sx={{ maxWidth: 200 }}>{c.Description?.substring(0, 60)}...</TableCell>
                <TableCell><Chip label={c.Status} color={statusColors[c.Status]} size="small" /></TableCell>
                <TableCell>{c.assignedTo?.Name || "—"}</TableCell>
                <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" onClick={() => handleOpen(c)} sx={{ borderRadius: 2 }}>Manage</Button>
                </TableCell>
              </TableRow>
            ))}
            {!complaints.length && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: "#aaa" }}>No complaints</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Manage Complaint Dialog ── */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<ReportProblemIcon />} title="Manage Complaint"
          subtitle={selected ? `Category: ${selected.Category}` : ""} />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          <Box sx={{ bgcolor: "#f5f5f5", borderRadius: 2, p: 2, mb: 3 }}>
            <Typography variant="body2" color="text.secondary">{selected?.Description}</Typography>
          </Box>
          <FormControl fullWidth required error={!!touched.Status && !!errors.Status} sx={{ mb: 1 }}>
            <InputLabel>Status</InputLabel>
            <Select value={form.Status} label="Status"
              onChange={(e) => { setForm({ ...form, Status: e.target.value }); setTouched((t) => ({ ...t, Status: true })); }}>
              {["Pending", "In Progress", "Resolved"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
            <FormHelperText>{touched.Status && errors.Status ? errors.Status : " "}</FormHelperText>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 1 }}>
            <InputLabel>Assign to Staff/Vendor</InputLabel>
            <Select value={form.assignedTo} label="Assign to Staff/Vendor"
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
              <MenuItem value="">— Not Assigned —</MenuItem>
              {staff.map((s) => <MenuItem key={s._id} value={s._id}>{s.Name} ({s.Type})</MenuItem>)}
            </Select>
            <FormHelperText> </FormHelperText>
          </FormControl>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate} disabled={!isValid || saving}
            sx={{ bgcolor: "#1a237e", borderRadius: 2, px: 3, minWidth: 150, "&:disabled": { bgcolor: "#c5cae9", color: "#fff" } }}>
            {saving ? <CircularProgress size={18} color="inherit" /> : "Update Complaint"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Complaints;
