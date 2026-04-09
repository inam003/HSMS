import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogContent, DialogActions,
  TextField, Alert, Chip, Select, MenuItem, FormControl, InputLabel,
  FormHelperText, Divider, CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
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

const validate = (form) => ({
  Name:       !form.Name.trim()       ? "Visitor name is required"    : "",
  Contact_No: !form.Contact_No.trim() ? "Contact number is required"  : "",
  unitId:     !form.unitId            ? "Please select a visiting unit": "",
});

const Visitors = () => {
  const [approvals, setApprovals] = useState([]);
  const [units, setUnits]         = useState([]);
  const [open, setOpen]           = useState(false);
  const [form, setForm]           = useState({ Name: "", Contact_No: "", Vehicle_Number: "", expectedArrival: "", unitId: "" });
  const [touched, setTouched]     = useState({});
  const [success, setSuccess]     = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading]       = useState(true);

  const load = async () => {
    try {
      const [a, u] = await Promise.all([api.get("/visitors/my-pre-approvals"), api.get("/units")]);
      setApprovals(a.data); setUnits(u.data);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const errors  = validate(form);
  const isValid = !errors.Name && !errors.Contact_No && !errors.unitId;

  const field = (key) => ({
    error:      !!touched[key] && !!errors[key],
    helperText: touched[key] && errors[key] ? errors[key] : " ",
    onBlur:     () => setTouched((t) => ({ ...t, [key]: true })),
  });

  const handleOpen = () => {
    setForm({ Name: "", Contact_No: "", Vehicle_Number: "", expectedArrival: "", unitId: "" });
    setTouched({}); setSubmitError(""); setOpen(true);
  };

  const handleSubmit = async () => {
    setTouched({ Name: true, Contact_No: true, unitId: true });
    if (!isValid) return;
    setSubmitting(true); setSubmitError("");
    try {
      await api.post("/visitors/pre-approve", form);
      setSuccess("Visitor pre-approved!"); setOpen(false); load();
    } catch (e) { setSubmitError(e.response?.data?.message || "Error"); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress sx={{ color: "#1a237e" }} />
    </Box>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">Pre-Approve Visitors</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}
          sx={{ bgcolor: "#1a237e", borderRadius: 2 }}>Pre-Approve Guest</Button>
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#1a237e" }}>
            <TableRow>
              {["Visitor Name", "Contact", "Vehicle No.", "Expected Arrival", "Status"].map((h) => (
                <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {approvals.map((v) => (
              <TableRow key={v._id} hover>
                <TableCell>{v.Name}</TableCell>
                <TableCell>{v.Contact_No}</TableCell>
                <TableCell>{v.Vehicle_Number || "—"}</TableCell>
                <TableCell>{v.expectedArrival ? new Date(v.expectedArrival).toLocaleString() : "Anytime"}</TableCell>
                <TableCell><Chip label={v.preApprovalUsed ? "Used" : "Pending"} color={v.preApprovalUsed ? "default" : "success"} size="small" /></TableCell>
              </TableRow>
            ))}
            {!approvals.length && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: "#aaa" }}>No pre-approvals</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Pre-Approve Dialog ── */}
      <Dialog open={open} onClose={() => !submitting && setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<PersonAddIcon />} title="Pre-Approve Visitor" subtitle="Add visitor details for gate verification" />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          {submitError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSubmitError("")}>{submitError}</Alert>}
          <Box display="flex" gap={2} mb={1}>
            <TextField fullWidth label="Visitor Name" required value={form.Name}
              onChange={(e) => setForm({ ...form, Name: e.target.value })} {...field("Name")} />
            <TextField fullWidth label="Contact Number" required value={form.Contact_No}
              onChange={(e) => setForm({ ...form, Contact_No: e.target.value })} {...field("Contact_No")} />
          </Box>
          <Box display="flex" gap={2} mb={1}>
            <TextField fullWidth label="Vehicle Number (optional)" value={form.Vehicle_Number}
              onChange={(e) => setForm({ ...form, Vehicle_Number: e.target.value })} helperText=" " />
            <TextField fullWidth label="Expected Arrival" type="datetime-local" InputLabelProps={{ shrink: true }}
              value={form.expectedArrival} onChange={(e) => setForm({ ...form, expectedArrival: e.target.value })} helperText=" " />
          </Box>
          <FormControl fullWidth required error={!!touched.unitId && !!errors.unitId}>
            <InputLabel>Visiting Unit</InputLabel>
            <Select value={form.unitId} label="Visiting Unit"
              onChange={(e) => { setForm({ ...form, unitId: e.target.value }); setTouched((t) => ({ ...t, unitId: true })); }}>
              {units.map((u) => <MenuItem key={u._id} value={u._id}>Unit {u.Unit_Number} - Block {u.Block}</MenuItem>)}
            </Select>
            <FormHelperText>{touched.unitId && errors.unitId ? errors.unitId : " "}</FormHelperText>
          </FormControl>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setOpen(false)} disabled={submitting} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!isValid || submitting}
            sx={{ bgcolor: "#1a237e", borderRadius: 2, px: 3, minWidth: 130, "&:disabled": { bgcolor: "#c5cae9", color: "#fff" } }}>
            {submitting ? <CircularProgress size={18} color="inherit" /> : "Pre-Approve"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Visitors;
