import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, Chip, Tooltip, Rating
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyIcon from "@mui/icons-material/Key";
import api from "../../api/axios";

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ Name: "", Email: "", Password: "", Type: "", Aadhar_CNIC_No: "", Rating: 0 });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const load = async () => { const { data } = await api.get("/staff"); setStaff(data); };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setError("");
    try {
      if (editId) {
        // Don't send empty password on edit
        const payload = { ...form };
        if (!payload.Password) delete payload.Password;
        await api.put(`/staff/${editId}`, payload);
      } else {
        await api.post("/staff", form);
      }
      setSuccess("Staff saved!"); setOpen(false); load();
    } catch (e) { setError(e.response?.data?.message || "Error"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this staff/vendor?")) return;
    await api.delete(`/staff/${id}`); load();
  };

  const openEdit = (s) => {
    setEditId(s._id);
    setForm({ Name: s.Name, Email: s.Email || "", Password: "", Type: s.Type, Aadhar_CNIC_No: s.Aadhar_CNIC_No || "", Rating: s.Rating || 0 });
    setError(""); setOpen(true);
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ Name: "", Email: "", Password: "", Type: "", Aadhar_CNIC_No: "", Rating: 0 });
    setError(""); setOpen(true);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">Staff & Vendor Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} sx={{ bgcolor: "#1a237e" }}>
          Add Staff/Vendor
        </Button>
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#1a237e" }}>
            <TableRow>
              {["Name", "Type", "Email", "CNIC/Aadhar", "Entry Code", "Rating", "Actions"].map((h) => (
                <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {staff.map((s) => (
              <TableRow key={s._id} hover>
                <TableCell>{s.Name}</TableCell>
                <TableCell><Chip label={s.Type} size="small" color="primary" /></TableCell>
                <TableCell>{s.Email}</TableCell>
                <TableCell>{s.Aadhar_CNIC_No || "—"}</TableCell>
                <TableCell>
                  <Chip icon={<KeyIcon />} label={s.Entry_Code} color="success" size="small" sx={{ fontFamily: "monospace", fontWeight: "bold" }} />
                </TableCell>
                <TableCell><Rating value={s.Rating} readOnly size="small" /></TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton size="small" color="primary" onClick={() => openEdit(s)}><EditIcon /></IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => handleDelete(s._id)}><DeleteIcon /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!staff.length && <TableRow><TableCell colSpan={7} align="center">No staff/vendors found</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? "Edit Staff/Vendor" : "Add Staff/Vendor"}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField fullWidth label="Full Name" margin="normal" value={form.Name} onChange={(e) => setForm({ ...form, Name: e.target.value })} />
          <TextField fullWidth label="Email Address" type="email" margin="normal" value={form.Email} onChange={(e) => setForm({ ...form, Email: e.target.value })} />
          <TextField
            fullWidth
            label={editId ? "New Password (leave blank to keep unchanged)" : "Password"}
            type="password"
            margin="normal"
            value={form.Password}
            onChange={(e) => setForm({ ...form, Password: e.target.value })}
          />
          <TextField fullWidth label="Type (e.g. Maid, Driver, Plumber)" margin="normal" value={form.Type} onChange={(e) => setForm({ ...form, Type: e.target.value })} />
          <TextField fullWidth label="CNIC / Aadhar Number" margin="normal" value={form.Aadhar_CNIC_No} onChange={(e) => setForm({ ...form, Aadhar_CNIC_No: e.target.value })} />
          <Box mt={2}>
            <Typography variant="body2">Rating</Typography>
            <Rating value={form.Rating} onChange={(_, v) => setForm({ ...form, Rating: v })} />
          </Box>
          {!editId && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
              Entry Code will be auto-generated. Staff can log in using their Email + Password.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: "#1a237e" }}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Staff;
