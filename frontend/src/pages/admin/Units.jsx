import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Alert,
  Chip, Tooltip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import api from "../../api/axios";

const Units = () => {
  const [units, setUnits] = useState([]);
  const [residents, setResidents] = useState([]);
  const [open, setOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [assignUnitId, setAssignUnitId] = useState(null);
  const [form, setForm] = useState({ Unit_Number: "", Floor: "", Block: "", Square_Footage: "" });
  const [assignForm, setAssignForm] = useState({ residentId: "", role: "Owner" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const [u, r] = await Promise.all([api.get("/units"), api.get("/residents")]);
    setUnits(u.data); setResidents(r.data);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    try {
      if (editId) await api.put(`/units/${editId}`, form);
      else await api.post("/units", form);
      setSuccess("Unit saved!"); setOpen(false); load();
    } catch (e) { setError(e.response?.data?.message || "Error"); }
  };

  const handleAssign = async () => {
    try {
      await api.post(`/units/${assignUnitId}/assign`, assignForm);
      setSuccess("Resident assigned!"); setAssignOpen(false); load();
    } catch (e) { setError(e.response?.data?.message || "Error"); }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">Unit Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditId(null); setForm({ Unit_Number: "", Floor: "", Block: "", Square_Footage: "" }); setOpen(true); }} sx={{ bgcolor: "#1a237e" }}>
          Add Unit
        </Button>
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
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
                <TableCell>{u.Unit_Number}</TableCell>
                <TableCell>{u.Floor}</TableCell>
                <TableCell>{u.Block}</TableCell>
                <TableCell>{u.Square_Footage}</TableCell>
                <TableCell><Chip label={u.Status} color={u.Status === "Occupied" ? "success" : "default"} size="small" /></TableCell>
                <TableCell>{u.resident?.Name || "—"}</TableCell>
                <TableCell>{u.residentRole || "—"}</TableCell>
                <TableCell>
                  <Tooltip title="Edit Unit"><IconButton size="small" color="primary" onClick={() => { setEditId(u._id); setForm({ Unit_Number: u.Unit_Number, Floor: u.Floor, Block: u.Block, Square_Footage: u.Square_Footage }); setOpen(true); }}><EditIcon /></IconButton></Tooltip>
                  <Tooltip title="Assign Resident"><IconButton size="small" color="secondary" onClick={() => { setAssignUnitId(u._id); setAssignForm({ residentId: u.resident?._id || "", role: u.residentRole || "Owner" }); setAssignOpen(true); }}><PersonAddIcon /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Unit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? "Edit Unit" : "Add Unit"}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField fullWidth label="Unit Number" margin="normal" value={form.Unit_Number} onChange={(e) => setForm({ ...form, Unit_Number: e.target.value })} />
          <TextField fullWidth label="Floor" margin="normal" value={form.Floor} onChange={(e) => setForm({ ...form, Floor: e.target.value })} />
          <TextField fullWidth label="Block" margin="normal" value={form.Block} onChange={(e) => setForm({ ...form, Block: e.target.value })} />
          <TextField fullWidth label="Square Footage" type="number" margin="normal" value={form.Square_Footage} onChange={(e) => setForm({ ...form, Square_Footage: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: "#1a237e" }}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Resident to Unit</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Resident</InputLabel>
            <Select value={assignForm.residentId} label="Resident" onChange={(e) => setAssignForm({ ...assignForm, residentId: e.target.value })}>
              <MenuItem value="">— Vacate Unit —</MenuItem>
              {residents.map((r) => <MenuItem key={r._id} value={r._id}>{r.Name} ({r.Email})</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select value={assignForm.role} label="Role" onChange={(e) => setAssignForm({ ...assignForm, role: e.target.value })}>
              <MenuItem value="Owner">Owner</MenuItem>
              <MenuItem value="Tenant">Tenant</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssign} sx={{ bgcolor: "#1a237e" }}>Assign</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Units;
