import { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem,
  FormControl, InputLabel, TextField, Alert, Chip
} from "@mui/material";
import api from "../../api/axios";

const statusColors = { Pending: "warning", "In Progress": "info", Resolved: "success" };

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [staff, setStaff] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ Status: "", assignedTo: "" });
  const [success, setSuccess] = useState("");

  const load = async () => {
    const [c, s] = await Promise.all([api.get("/complaints"), api.get("/staff")]);
    setComplaints(c.data); setStaff(s.data);
  };
  useEffect(() => { load(); }, []);

  const handleOpen = (c) => {
    setSelected(c);
    setForm({ Status: c.Status, assignedTo: c.assignedTo?._id || "" });
    setOpen(true);
  };

  const handleUpdate = async () => {
    await api.put(`/complaints/${selected._id}`, form);
    setSuccess("Complaint updated!"); setOpen(false); load();
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={2}>Complaints Management</Typography>
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
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
                <TableCell><Button size="small" variant="outlined" onClick={() => handleOpen(c)}>Manage</Button></TableCell>
              </TableRow>
            ))}
            {!complaints.length && <TableRow><TableCell colSpan={7} align="center">No complaints</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Manage Complaint</DialogTitle>
        <DialogContent>
          <Typography variant="body2" mb={2} color="text.secondary">{selected?.Description}</Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select value={form.Status} label="Status" onChange={(e) => setForm({ ...form, Status: e.target.value })}>
              {["Pending", "In Progress", "Resolved"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Assign to Staff/Vendor</InputLabel>
            <Select value={form.assignedTo} label="Assign to Staff/Vendor" onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
              <MenuItem value="">— Not Assigned —</MenuItem>
              {staff.map((s) => <MenuItem key={s._id} value={s._id}>{s.Name} ({s.Type})</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate} sx={{ bgcolor: "#1a237e" }}>Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Complaints;
