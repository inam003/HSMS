import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, Chip, Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import api from "../../api/axios";

const Visitors = () => {
  const [approvals, setApprovals] = useState([]);
  const [units, setUnits] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ Name: "", Contact_No: "", Vehicle_Number: "", expectedArrival: "", unitId: "" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const [a, u] = await Promise.all([api.get("/visitors/my-pre-approvals"), api.get("/units")]);
    setApprovals(a.data); setUnits(u.data);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    try {
      await api.post("/visitors/pre-approve", form);
      setSuccess("Visitor pre-approved!"); setOpen(false); load();
    } catch (e) { setError(e.response?.data?.message || "Error"); }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">Pre-Approve Visitors</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm({ Name: "", Contact_No: "", Vehicle_Number: "", expectedArrival: "", unitId: "" }); setError(""); setOpen(true); }} sx={{ bgcolor: "#1a237e" }}>
          Pre-Approve Guest
        </Button>
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
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
            {!approvals.length && <TableRow><TableCell colSpan={5} align="center">No pre-approvals</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Pre-Approve Visitor</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField fullWidth label="Visitor Name" margin="normal" value={form.Name} onChange={(e) => setForm({ ...form, Name: e.target.value })} />
          <TextField fullWidth label="Contact Number" margin="normal" value={form.Contact_No} onChange={(e) => setForm({ ...form, Contact_No: e.target.value })} />
          <TextField fullWidth label="Vehicle Number (optional)" margin="normal" value={form.Vehicle_Number} onChange={(e) => setForm({ ...form, Vehicle_Number: e.target.value })} />
          <TextField fullWidth label="Expected Arrival" type="datetime-local" margin="normal" InputLabelProps={{ shrink: true }} value={form.expectedArrival} onChange={(e) => setForm({ ...form, expectedArrival: e.target.value })} />
          <FormControl fullWidth margin="normal">
            <InputLabel>Visiting Unit</InputLabel>
            <Select value={form.unitId} label="Visiting Unit" onChange={(e) => setForm({ ...form, unitId: e.target.value })}>
              {units.map((u) => <MenuItem key={u._id} value={u._id}>Unit {u.Unit_Number} - Block {u.Block}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: "#1a237e" }}>Pre-Approve</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Visitors;
