import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Alert, Chip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import api from "../../api/axios";

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [units, setUnits] = useState([]);
  const [open, setOpen] = useState(false);
  const [genOpen, setGenOpen] = useState(false);
  const [form, setForm] = useState({ unit: "", Amount: "", Due_Date: "", Bill_Type: "Maintenance" });
  const [genForm, setGenForm] = useState({ Amount: "", Due_Date: "", Bill_Type: "Maintenance" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const [b, u] = await Promise.all([api.get("/bills"), api.get("/units")]);
    setBills(b.data); setUnits(u.data.filter((u) => u.Status === "Occupied"));
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    try { await api.post("/bills", form); setSuccess("Bill created!"); setOpen(false); load(); }
    catch (e) { setError(e.response?.data?.message || "Error"); }
  };

  const handleGenerate = async () => {
    try {
      const { data } = await api.post("/bills/generate", genForm);
      setSuccess(data.message); setGenOpen(false); load();
    } catch (e) { setError(e.response?.data?.message || "Error"); }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">Bills Management</Typography>
        <Box display="flex" gap={1}>
          <Button variant="outlined" startIcon={<AutorenewIcon />} onClick={() => setGenOpen(true)}>Generate All Bills</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={{ bgcolor: "#1a237e" }}>Add Single Bill</Button>
        </Box>
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
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
            {!bills.length && <TableRow><TableCell colSpan={6} align="center">No bills found</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Single Bill Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Bill</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <FormControl fullWidth margin="normal">
            <InputLabel>Unit</InputLabel>
            <Select value={form.unit} label="Unit" onChange={(e) => setForm({ ...form, unit: e.target.value })}>
              {units.map((u) => <MenuItem key={u._id} value={u._id}>Unit {u.Unit_Number} - {u.resident?.Name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField fullWidth label="Amount (PKR)" type="number" margin="normal" value={form.Amount} onChange={(e) => setForm({ ...form, Amount: e.target.value })} />
          <TextField fullWidth label="Due Date" type="date" margin="normal" InputLabelProps={{ shrink: true }} value={form.Due_Date} onChange={(e) => setForm({ ...form, Due_Date: e.target.value })} />
          <FormControl fullWidth margin="normal">
            <InputLabel>Bill Type</InputLabel>
            <Select value={form.Bill_Type} label="Bill Type" onChange={(e) => setForm({ ...form, Bill_Type: e.target.value })}>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
              <MenuItem value="Utility">Utility</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: "#1a237e" }}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Generate Bills Dialog */}
      <Dialog open={genOpen} onClose={() => setGenOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Bills for All Occupied Units</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Amount (PKR)" type="number" margin="normal" value={genForm.Amount} onChange={(e) => setGenForm({ ...genForm, Amount: e.target.value })} />
          <TextField fullWidth label="Due Date" type="date" margin="normal" InputLabelProps={{ shrink: true }} value={genForm.Due_Date} onChange={(e) => setGenForm({ ...genForm, Due_Date: e.target.value })} />
          <FormControl fullWidth margin="normal">
            <InputLabel>Bill Type</InputLabel>
            <Select value={genForm.Bill_Type} label="Bill Type" onChange={(e) => setGenForm({ ...genForm, Bill_Type: e.target.value })}>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
              <MenuItem value="Utility">Utility</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleGenerate} sx={{ bgcolor: "#2e7d32" }}>Generate</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Bills;
