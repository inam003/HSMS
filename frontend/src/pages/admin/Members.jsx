import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControlLabel, Switch, Alert, Chip, Tooltip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../api/axios";

const emptyForm = { Name: "", Email: "", Password: "", Contact_No: "", Emergency_Contact: "", Is_Owner: true };

const Members = () => {
  const [residents, setResidents] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    const { data } = await api.get("/residents");
    setResidents(data);
  };

  useEffect(() => { load(); }, []);

  const handleOpen = (r = null) => {
    setEditId(r?._id || null);
    setForm(r ? { Name: r.Name, Email: r.Email, Password: "", Contact_No: r.Contact_No || "", Emergency_Contact: r.Emergency_Contact || "", Is_Owner: r.Is_Owner } : emptyForm);
    setError(""); setSuccess("");
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form };
      if (!payload.Password) delete payload.Password;
      if (editId) await api.put(`/residents/${editId}`, payload);
      else await api.post("/residents", payload);
      setSuccess(editId ? "Resident updated!" : "Resident created!");
      setOpen(false);
      load();
    } catch (e) { setError(e.response?.data?.message || "Error saving resident"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resident?")) return;
    await api.delete(`/residents/${id}`);
    load();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">Residents Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} sx={{ bgcolor: "#1a237e" }}>
          Add Resident
        </Button>
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#1a237e" }}>
            <TableRow>
              {["Name", "Email", "Contact", "Type", "Emergency Contact", "Actions"].map((h) => (
                <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {residents.map((r) => (
              <TableRow key={r._id} hover>
                <TableCell>{r.Name}</TableCell>
                <TableCell>{r.Email}</TableCell>
                <TableCell>{r.Contact_No}</TableCell>
                <TableCell><Chip label={r.Is_Owner ? "Owner" : "Tenant"} color={r.Is_Owner ? "primary" : "default"} size="small" /></TableCell>
                <TableCell>{r.Emergency_Contact}</TableCell>
                <TableCell>
                  <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => handleOpen(r)}><EditIcon /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(r._id)}><DeleteIcon /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!residents.length && <TableRow><TableCell colSpan={6} align="center">No residents found</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit Resident" : "Add New Resident"}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField fullWidth label="Full Name" margin="normal" required value={form.Name} onChange={(e) => setForm({ ...form, Name: e.target.value })} />
          <TextField fullWidth label="Email" type="email" margin="normal" required value={form.Email} onChange={(e) => setForm({ ...form, Email: e.target.value })} />
          <TextField fullWidth label={editId ? "New Password (leave blank to keep)" : "Password"} type="password" margin="normal" required={!editId} value={form.Password} onChange={(e) => setForm({ ...form, Password: e.target.value })} />
          <TextField fullWidth label="Contact Number" margin="normal" value={form.Contact_No} onChange={(e) => setForm({ ...form, Contact_No: e.target.value })} />
          <TextField fullWidth label="Emergency Contact" margin="normal" value={form.Emergency_Contact} onChange={(e) => setForm({ ...form, Emergency_Contact: e.target.value })} />
          <FormControlLabel control={<Switch checked={form.Is_Owner} onChange={(e) => setForm({ ...form, Is_Owner: e.target.checked })} />} label="Is Owner (uncheck for Tenant)" sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: "#1a237e" }}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Members;
