import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, FormHelperText,
  Alert, Chip, Divider, CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import ReceiptIcon from "@mui/icons-material/Receipt";
import GroupsIcon from "@mui/icons-material/Groups";
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

const validateSingle = (form) => ({
  unit:     !form.unit                          ? "Please select a unit"            : "",
  Amount:   !form.Amount                        ? "Amount is required"
          : Number(form.Amount) <= 0            ? "Amount must be greater than 0"  : "",
  Due_Date: !form.Due_Date                      ? "Due date is required"            : "",
});

const validateGen = (form) => ({
  Amount:   !form.Amount                        ? "Amount is required"
          : Number(form.Amount) <= 0            ? "Amount must be greater than 0"  : "",
  Due_Date: !form.Due_Date                      ? "Due date is required"            : "",
});

const Bills = () => {
  const [bills, setBills]         = useState([]);
  const [units, setUnits]         = useState([]);
  // Single bill
  const [open, setOpen]           = useState(false);
  const [form, setForm]           = useState({ unit: "", Amount: "", Due_Date: "", Bill_Type: "Maintenance" });
  const [touched, setTouched]     = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving]       = useState(false);
  // Generate all
  const [genOpen, setGenOpen]     = useState(false);
  const [genForm, setGenForm]     = useState({ Amount: "", Due_Date: "", Bill_Type: "Maintenance" });
  const [genTouched, setGenTouched] = useState({});
  const [generating, setGenerating] = useState(false);

  const [success, setSuccess]     = useState("");
  const [loading, setLoading]     = useState(true);

  const load = async () => {
    try {
      const [b, u] = await Promise.all([api.get("/bills"), api.get("/units")]);
      setBills(b.data); setUnits(u.data.filter((u) => u.Status === "Occupied"));
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  // Single bill validation
  const errors  = validateSingle(form);
  const isValid = !errors.unit && !errors.Amount && !errors.Due_Date;

  const field = (key) => ({
    error:      !!touched[key] && !!errors[key],
    helperText: touched[key] && errors[key] ? errors[key] : " ",
    onBlur:     () => setTouched((t) => ({ ...t, [key]: true })),
  });

  // Generate validation
  const genErrors  = validateGen(genForm);
  const genIsValid = !genErrors.Amount && !genErrors.Due_Date;

  const genField = (key) => ({
    error:      !!genTouched[key] && !!genErrors[key],
    helperText: genTouched[key] && genErrors[key] ? genErrors[key] : " ",
    onBlur:     () => setGenTouched((t) => ({ ...t, [key]: true })),
  });

  const handleSave = async () => {
    setTouched({ unit: true, Amount: true, Due_Date: true });
    if (!isValid) return;
    setSaving(true); setSubmitError("");
    try {
      await api.post("/bills", form);
      setSuccess("Bill created!"); setOpen(false); load();
    } catch (e) { setSubmitError(e.response?.data?.message || "Error"); }
    finally { setSaving(false); }
  };

  const handleGenerate = async () => {
    setGenTouched({ Amount: true, Due_Date: true });
    if (!genIsValid) return;
    setGenerating(true);
    try {
      const { data } = await api.post("/bills/generate", genForm);
      setSuccess(data.message); setGenOpen(false); load();
    } catch (e) { setSuccess(""); }
    finally { setGenerating(false); }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress sx={{ color: "#1a237e" }} />
    </Box>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">Bills Management</Typography>
        <Box display="flex" gap={1}>
          <Button variant="outlined" startIcon={<AutorenewIcon />}
            onClick={() => { setGenForm({ Amount: "", Due_Date: "", Bill_Type: "Maintenance" }); setGenTouched({}); setGenOpen(true); }}
            sx={{ borderRadius: 2 }}>Generate All Bills</Button>
          <Button variant="contained" startIcon={<AddIcon />}
            onClick={() => { setForm({ unit: "", Amount: "", Due_Date: "", Bill_Type: "Maintenance" }); setTouched({}); setSubmitError(""); setOpen(true); }}
            sx={{ bgcolor: "#1a237e", borderRadius: 2 }}>Add Single Bill</Button>
        </Box>
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#1a237e" }}>
            <TableRow>
              {["Unit No.", "Resident", "Amount", "Type", "Due Date", "Status"].map((h) => (
                <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {bills.map((b) => (
              <TableRow key={b._id} hover>
                <TableCell>{b.unit?.Unit_Number}</TableCell>
                <TableCell>{b.unit?.resident?.Name || "—"}</TableCell>
                <TableCell>PKR {b.Amount?.toLocaleString()}</TableCell>
                <TableCell><Chip label={b.Bill_Type} size="small" /></TableCell>
                <TableCell>{new Date(b.Due_Date).toLocaleDateString()}</TableCell>
                <TableCell><Chip label={b.Status} color={b.Status === "Paid" ? "success" : "error"} size="small" /></TableCell>
              </TableRow>
            ))}
            {!bills.length && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: "#aaa" }}>No bills found</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Single Bill Dialog ── */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<ReceiptIcon />} title="Create Bill" subtitle="Generate a bill for a specific unit" />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          {submitError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSubmitError("")}>{submitError}</Alert>}
          <FormControl fullWidth required error={!!touched.unit && !!errors.unit} sx={{ mb: 1 }}>
            <InputLabel>Unit</InputLabel>
            <Select value={form.unit} label="Unit"
              onChange={(e) => { setForm({ ...form, unit: e.target.value }); setTouched((t) => ({ ...t, unit: true })); }}>
              {units.map((u) => <MenuItem key={u._id} value={u._id}>Unit {u.Unit_Number} — {u.resident?.Name}</MenuItem>)}
            </Select>
            <FormHelperText>{touched.unit && errors.unit ? errors.unit : " "}</FormHelperText>
          </FormControl>
          <Box display="flex" gap={2} mb={1}>
            <TextField fullWidth label="Amount (PKR)" type="number" required value={form.Amount}
              onChange={(e) => setForm({ ...form, Amount: e.target.value })} {...field("Amount")} />
            <TextField fullWidth label="Due Date" type="date" required InputLabelProps={{ shrink: true }}
              value={form.Due_Date} onChange={(e) => setForm({ ...form, Due_Date: e.target.value })} {...field("Due_Date")} />
          </Box>
          <FormControl fullWidth>
            <InputLabel>Bill Type</InputLabel>
            <Select value={form.Bill_Type} label="Bill Type" onChange={(e) => setForm({ ...form, Bill_Type: e.target.value })}>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
              <MenuItem value="Utility">Utility</MenuItem>
            </Select>
            <FormHelperText> </FormHelperText>
          </FormControl>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!isValid || saving}
            sx={{ bgcolor: "#1a237e", borderRadius: 2, px: 3, minWidth: 120, "&:disabled": { bgcolor: "#c5cae9", color: "#fff" } }}>
            {saving ? <CircularProgress size={18} color="inherit" /> : "Create Bill"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Generate Bills Dialog ── */}
      <Dialog open={genOpen} onClose={() => setGenOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<GroupsIcon />} title="Generate Bills" subtitle="Create bills for all occupied units at once" color="#2e7d32" />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          <Box display="flex" gap={2} mb={1}>
            <TextField fullWidth label="Amount (PKR)" type="number" required value={genForm.Amount}
              onChange={(e) => setGenForm({ ...genForm, Amount: e.target.value })} {...genField("Amount")} />
            <TextField fullWidth label="Due Date" type="date" required InputLabelProps={{ shrink: true }}
              value={genForm.Due_Date} onChange={(e) => setGenForm({ ...genForm, Due_Date: e.target.value })} {...genField("Due_Date")} />
          </Box>
          <FormControl fullWidth>
            <InputLabel>Bill Type</InputLabel>
            <Select value={genForm.Bill_Type} label="Bill Type" onChange={(e) => setGenForm({ ...genForm, Bill_Type: e.target.value })}>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
              <MenuItem value="Utility">Utility</MenuItem>
            </Select>
            <FormHelperText> </FormHelperText>
          </FormControl>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setGenOpen(false)} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleGenerate} disabled={!genIsValid || generating}
            sx={{ bgcolor: "#2e7d32", borderRadius: 2, px: 3, minWidth: 140, "&:disabled": { bgcolor: "#c8e6c9", color: "#fff" } }}>
            {generating ? <CircularProgress size={18} color="inherit" /> : "Generate Bills"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Bills;
