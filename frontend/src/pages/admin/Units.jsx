import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogContent,
  DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Alert,
  Chip, Tooltip, CircularProgress, Avatar, Divider
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ApartmentIcon from "@mui/icons-material/Apartment";
import PeopleIcon from "@mui/icons-material/People";
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

const Units = () => {
  const [units, setUnits]       = useState([]);
  const [residents, setResidents] = useState([]);
  const [open, setOpen]         = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [assignUnitId, setAssignUnitId] = useState(null);
  const [form, setForm]         = useState({ Unit_Number: "", Floor: "", Block: "", Square_Footage: "" });
  const [assignForm, setAssignForm] = useState({ residentId: "", role: "Owner" });
  const [success, setSuccess]   = useState("");
  const [error, setError]       = useState("");
  const [saving, setSaving]     = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [loading, setLoading]     = useState(true);

  const load = async () => {
    try {
      const [u, r] = await Promise.all([api.get("/units"), api.get("/residents")]);
      setUnits(u.data); setResidents(r.data);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      if (editId) await api.put(`/units/${editId}`, form);
      else await api.post("/units", form);
      setSuccess("Unit saved successfully!"); setOpen(false); load();
    } catch (e) { setError(e.response?.data?.message || "Error saving unit"); }
    finally { setSaving(false); }
  };

  const handleAssign = async () => {
    setAssigning(true);
    try {
      await api.post(`/units/${assignUnitId}/assign`, assignForm);
      setSuccess("Resident assigned successfully!"); setAssignOpen(false); load();
    } catch (e) { setError(e.response?.data?.message || "Error"); }
    finally { setAssigning(false); }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress sx={{ color: "#1a237e" }} />
    </Box>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">Unit Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />}
          onClick={() => { setEditId(null); setForm({ Unit_Number: "", Floor: "", Block: "", Square_Footage: "" }); setError(""); setOpen(true); }}
          sx={{ bgcolor: "#1a237e", borderRadius: 2 }}>
          Add Unit
        </Button>
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#1a237e" }}>
            <TableRow>
              {["Unit No.", "Floor", "Block", "Sq. Ft.", "Status", "Resident", "Role", "Actions"].map((h) => (
                <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {units.map((u) => (
              <TableRow key={u._id} hover>
                <TableCell fontWeight="bold">{u.Unit_Number}</TableCell>
                <TableCell>{u.Floor}</TableCell>
                <TableCell>{u.Block}</TableCell>
                <TableCell>{u.Square_Footage} sqft</TableCell>
                <TableCell><Chip label={u.Status} color={u.Status === "Occupied" ? "success" : "default"} size="small" /></TableCell>
                <TableCell>{u.resident?.Name || "—"}</TableCell>
                <TableCell>{u.residentRole || "—"}</TableCell>
                <TableCell>
                  <Tooltip title="Edit Unit">
                    <IconButton size="small" color="primary"
                      onClick={() => { setEditId(u._id); setForm({ Unit_Number: u.Unit_Number, Floor: u.Floor, Block: u.Block, Square_Footage: u.Square_Footage }); setError(""); setOpen(true); }}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Assign Resident">
                    <IconButton size="small" color="secondary"
                      onClick={() => { setAssignUnitId(u._id); setAssignForm({ residentId: u.resident?._id || "", role: u.residentRole || "Owner" }); setAssignOpen(true); }}>
                      <PersonAddIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!units.length && <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: "#aaa" }}>No units found</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Add / Edit Unit Dialog ── */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<ApartmentIcon />} title={editId ? "Edit Unit" : "Add New Unit"} subtitle={editId ? "Update unit details below" : "Enter the unit information"} />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError("")}>{error}</Alert>}
          <Box display="flex" gap={2} mb={1}>
            <TextField fullWidth label="Unit Number" required value={form.Unit_Number} onChange={(e) => setForm({ ...form, Unit_Number: e.target.value })} helperText=" " />
            <TextField fullWidth label="Floor" value={form.Floor} onChange={(e) => setForm({ ...form, Floor: e.target.value })} helperText=" " />
          </Box>
          <Box display="flex" gap={2} mb={1}>
            <TextField fullWidth label="Block" value={form.Block} onChange={(e) => setForm({ ...form, Block: e.target.value })} helperText=" " />
            <TextField fullWidth label="Square Footage" type="number" value={form.Square_Footage} onChange={(e) => setForm({ ...form, Square_Footage: e.target.value })} helperText=" " />
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.Unit_Number || saving}
            sx={{ bgcolor: "#1a237e", borderRadius: 2, px: 3, minWidth: 110, "&:disabled": { bgcolor: "#c5cae9", color: "#fff" } }}>
            {saving ? <CircularProgress size={18} color="inherit" /> : (editId ? "Save Changes" : "Add Unit")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Assign Resident Dialog ── */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<PeopleIcon />} title="Assign Resident to Unit" subtitle="Select a resident and their role for this unit" color="#2e7d32" />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Resident</InputLabel>
            <Select value={assignForm.residentId} label="Resident" onChange={(e) => setAssignForm({ ...assignForm, residentId: e.target.value })}>
              <MenuItem value=""><em>— Vacate Unit —</em></MenuItem>
              {residents.map((r) => <MenuItem key={r._id} value={r._id}>{r.Name} ({r.Email})</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select value={assignForm.role} label="Role" onChange={(e) => setAssignForm({ ...assignForm, role: e.target.value })}>
              <MenuItem value="Owner">Owner</MenuItem>
              <MenuItem value="Tenant">Tenant</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <Divider sx={{ mt: 2 }} />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setAssignOpen(false)} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleAssign} disabled={assigning}
            sx={{ bgcolor: "#2e7d32", borderRadius: 2, px: 3, minWidth: 110 }}>
            {assigning ? <CircularProgress size={18} color="inherit" /> : "Assign"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Units;
