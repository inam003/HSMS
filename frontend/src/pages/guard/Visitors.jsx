import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogContent, DialogActions,
  TextField, Alert, Chip, Tabs, Tab, Select, MenuItem, FormControl, InputLabel,
  FormHelperText, Divider, CircularProgress
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import api from "../../api/axios";

const ModalHeader = ({ icon, title, subtitle, color = "#2e7d32" }) => (
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
  Name:    !form.Name.trim()    ? "Visitor name is required"     : "",
  Purpose: !form.Purpose.trim() ? "Purpose of visit is required" : "",
  unitId:  !form.unitId         ? "Please select a visiting unit": "",
});

const GuardVisitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [units, setUnits]       = useState([]);
  const [tab, setTab]           = useState(0);
  const [open, setOpen]         = useState(false);
  const [form, setForm]         = useState({ Name: "", Contact_No: "", Purpose: "", unitId: "", Vehicle_Number: "" });
  const [touched, setTouched]   = useState({});
  const [success, setSuccess]   = useState("");
  const [submitError, setSubmitError] = useState("");
  const [entering, setEntering] = useState(false);

  const load = async () => {
    const [v, u] = await Promise.all([api.get("/visitors"), api.get("/units")]);
    setVisitors(v.data); setUnits(u.data);
  };
  useEffect(() => { load(); }, []);

  const errors  = validate(form);
  const isValid = !errors.Name && !errors.Purpose && !errors.unitId;

  const field = (key) => ({
    error:      !!touched[key] && !!errors[key],
    helperText: touched[key] && errors[key] ? errors[key] : " ",
    onBlur:     () => setTouched((t) => ({ ...t, [key]: true })),
  });

  const handleOpen = () => {
    setForm({ Name: "", Contact_No: "", Purpose: "", unitId: "", Vehicle_Number: "" });
    setTouched({}); setSubmitError(""); setOpen(true);
  };

  const handleEntry = async () => {
    setTouched({ Name: true, Purpose: true, unitId: true });
    if (!isValid) return;
    setEntering(true); setSubmitError("");
    try {
      const { data } = await api.post("/visitors/entry", form);
      setSuccess(`Visitor entry logged${data.isPreApproved ? " (Pre-Approved ✓)" : ""}!`);
      setOpen(false); load();
    } catch (e) { setSubmitError(e.response?.data?.message || "Error"); }
    finally { setEntering(false); }
  };

  const handleExit = async (id) => {
    await api.put(`/visitors/${id}/exit`);
    setSuccess("Exit recorded!"); load();
  };

  const inside = visitors.filter((v) => !v.CheckOut_Time && v.CheckIn_Time);
  const all    = visitors;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">Visitor Entry & Exit</Typography>
        <Button variant="contained" startIcon={<LoginIcon />} onClick={handleOpen}
          sx={{ bgcolor: "#2e7d32", borderRadius: 2 }}>Log Entry</Button>
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`Currently Inside (${inside.length})`} />
        <Tab label="All Logs" />
      </Tabs>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#1a237e" }}>
            <TableRow>
              {["Name", "Contact", "Purpose", "Unit", "Check-In", "Pre-Approved", tab === 0 ? "Action" : "Check-Out"].map((h) => (
                <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {(tab === 0 ? inside : all).map((v) => (
              <TableRow key={v._id} hover>
                <TableCell>{v.Name}</TableCell>
                <TableCell>{v.Contact_No}</TableCell>
                <TableCell>{v.Purpose}</TableCell>
                <TableCell>{v.unit?.Unit_Number || "—"}</TableCell>
                <TableCell>{new Date(v.CheckIn_Time).toLocaleString()}</TableCell>
                <TableCell><Chip label={v.isPreApproved ? "Yes ✓" : "No"} color={v.isPreApproved ? "success" : "default"} size="small" /></TableCell>
                <TableCell>
                  {tab === 0
                    ? <Button size="small" variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={() => handleExit(v._id)} sx={{ borderRadius: 2 }}>Exit</Button>
                    : v.CheckOut_Time ? new Date(v.CheckOut_Time).toLocaleString() : <Chip label="Inside" color="success" size="small" />}
                </TableCell>
              </TableRow>
            ))}
            {!(tab === 0 ? inside : all).length && (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: "#aaa" }}>No records</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Log Entry Dialog ── */}
      <Dialog open={open} onClose={() => !entering && setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<LoginIcon />} title="Log Visitor Entry" subtitle="Fill in visitor details to record entry" />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          {submitError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSubmitError("")}>{submitError}</Alert>}
          <Box display="flex" gap={2} mb={1}>
            <TextField fullWidth label="Visitor Name" required value={form.Name}
              onChange={(e) => setForm({ ...form, Name: e.target.value })} {...field("Name")} />
            <TextField fullWidth label="Contact Number" value={form.Contact_No}
              onChange={(e) => setForm({ ...form, Contact_No: e.target.value })} helperText=" " />
          </Box>
          <Box display="flex" gap={2} mb={1}>
            <TextField fullWidth label="Purpose of Visit" required value={form.Purpose}
              onChange={(e) => setForm({ ...form, Purpose: e.target.value })} {...field("Purpose")} />
            <TextField fullWidth label="Vehicle Number (optional)" value={form.Vehicle_Number}
              onChange={(e) => setForm({ ...form, Vehicle_Number: e.target.value })} helperText=" " />
          </Box>
          <FormControl fullWidth required error={!!touched.unitId && !!errors.unitId}>
            <InputLabel>Visiting Unit</InputLabel>
            <Select value={form.unitId} label="Visiting Unit"
              onChange={(e) => { setForm({ ...form, unitId: e.target.value }); setTouched((t) => ({ ...t, unitId: true })); }}>
              {units.map((u) => <MenuItem key={u._id} value={u._id}>Unit {u.Unit_Number} - {u.Block} | {u.resident?.Name || "Vacant"}</MenuItem>)}
            </Select>
            <FormHelperText>{touched.unitId && errors.unitId ? errors.unitId : " "}</FormHelperText>
          </FormControl>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setOpen(false)} disabled={entering} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleEntry} disabled={!isValid || entering}
            sx={{ bgcolor: "#2e7d32", borderRadius: 2, px: 3, minWidth: 120, "&:disabled": { bgcolor: "#c8e6c9", color: "#fff" } }}>
            {entering ? <CircularProgress size={18} color="inherit" /> : "Log Entry"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GuardVisitors;
