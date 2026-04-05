import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, IconButton, Tooltip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../api/axios";

const emptyForm = { Name: "", Email: "", Password: "", Contact_No: "", Shift_Timing: "", Assigned_Gate: "" };

const Guards = () => {
  const [guards, setGuards] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const load = async () => { const { data } = await api.get("/guards"); setGuards(data); };
  useEffect(() => { load(); }, []);

  const handleOpen = (g = null) => {
    setEditId(g?._id || null);
    setForm(g ? { Name: g.Name, Email: g.Email, Password: "", Contact_No: g.Contact_No || "", Shift_Timing: g.Shift_Timing || "", Assigned_Gate: g.Assigned_Gate || "" } : emptyForm);
    setError(""); setOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form };
      if (!payload.Password) delete payload.Password;
      if (editId) await api.put(`/guards/${editId}`, payload);
      else await api.post("/guards", payload);
      setSuccess("Guard saved!"); setOpen(false); load();
    } catch (e) { setError(e.response?.data?.message || "Error"); }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">Security Guard Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} sx={{ bgcolor: "#1a237e" }}>Add Guard</Button>
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#1a237e" }}>
            <TableRow>
              {["Name", "Email", "Contact", "Shift Timing", "Assigned Gate", "Actions"].map((h) => (
                <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {guards.map((g) => (
              <TableRow key={g._id} hover>
                <TableCell>{g.Name}</TableCell>
                <TableCell>{g.Email}</TableCell>
                <TableCell>{g.Contact_No}</TableCell>
                <TableCell>{g.Shift_Timing}</TableCell>
                <TableCell>{g.Assigned_Gate}</TableCell>
                <TableCell>
                  <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => handleOpen(g)}><EditIcon /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" color="error" onClick={async () => { if (window.confirm("Delete?")) { await api.delete(`/guards/${g._id}`); load(); } }}><DeleteIcon /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? "Edit Guard" : "Add Security Guard"}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {["Name", "Email", "Contact_No", "Shift_Timing", "Assigned_Gate"].map((f) => (
            <TextField key={f} fullWidth label={f.replace("_", " ")} margin="normal" value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
          ))}
          <TextField fullWidth label={editId ? "New Password (leave blank)" : "Password"} type="password" margin="normal" required={!editId} value={form.Password} onChange={(e) => setForm({ ...form, Password: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: "#1a237e" }}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Guards;
