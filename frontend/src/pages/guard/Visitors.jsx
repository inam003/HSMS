import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, Chip, Tabs, Tab, Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import api from "../../api/axios";

const GuardVisitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [units, setUnits] = useState([]);
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ Name: "", Contact_No: "", Purpose: "", unitId: "", Vehicle_Number: "" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const [v, u] = await Promise.all([api.get("/visitors"), api.get("/units")]);
    setVisitors(v.data); setUnits(u.data);
  };
  useEffect(() => { load(); }, []);

  const handleEntry = async () => {
    try {
      const { data } = await api.post("/visitors/entry", form);
      setSuccess(`Visitor entry logged${data.isPreApproved ? " (Pre-Approved ✓)" : ""}!`);
      setOpen(false); load();
    } catch (e) { setError(e.response?.data?.message || "Error"); }
  };

  const handleExit = async (id) => {
    await api.put(`/visitors/${id}/exit`);
    setSuccess("Exit recorded!"); load();
  };

  const inside = visitors.filter((v) => !v.CheckOut_Time && v.CheckIn_Time);
  const all = visitors;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">Visitor Entry & Exit</Typography>
        <Button variant="contained" startIcon={<LoginIcon />} onClick={() => { setForm({ Name: "", Contact_No: "", Purpose: "", unitId: "", Vehicle_Number: "" }); setError(""); setOpen(true); }} sx={{ bgcolor: "#2e7d32" }}>
          Log Entry
        </Button>
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`Currently Inside (${inside.length})`} />
        <Tab label="All Logs" />
      </Tabs>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
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
                  {tab === 0 ? (
                    <Button size="small" variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={() => handleExit(v._id)}>Exit</Button>
                  ) : (
                    v.CheckOut_Time ? new Date(v.CheckOut_Time).toLocaleString() : <Chip label="Inside" color="success" size="small" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Log Visitor Entry</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField fullWidth label="Visitor Name" margin="normal" value={form.Name} onChange={(e) => setForm({ ...form, Name: e.target.value })} />
          <TextField fullWidth label="Contact Number" margin="normal" value={form.Contact_No} onChange={(e) => setForm({ ...form, Contact_No: e.target.value })} />
          <TextField fullWidth label="Purpose of Visit" margin="normal" value={form.Purpose} onChange={(e) => setForm({ ...form, Purpose: e.target.value })} />
          <TextField fullWidth label="Vehicle Number (optional)" margin="normal" value={form.Vehicle_Number} onChange={(e) => setForm({ ...form, Vehicle_Number: e.target.value })} />
          <FormControl fullWidth margin="normal">
            <InputLabel>Visiting Unit</InputLabel>
            <Select value={form.unitId} label="Visiting Unit" onChange={(e) => setForm({ ...form, unitId: e.target.value })}>
              {units.map((u) => <MenuItem key={u._id} value={u._id}>Unit {u.Unit_Number} - {u.Block} | {u.resident?.Name || "Vacant"}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEntry} sx={{ bgcolor: "#2e7d32" }}>Log Entry</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GuardVisitors;
