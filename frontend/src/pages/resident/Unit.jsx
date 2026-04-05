import { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent, Grid, Chip, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import api from "../../api/axios";

const Unit = () => {
  const [unit, setUnit] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ Vehicle_Number: "", Type: "4-wheeler" });
  const [success, setSuccess] = useState("");

  const load = async () => {
    try {
      const [u, v] = await Promise.all([api.get("/units/my-unit"), api.get("/vehicles/my-vehicles")]);
      setUnit(u.data); setVehicles(v.data);
    } catch { setUnit(null); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAddVehicle = async () => {
    await api.post("/vehicles", form);
    setSuccess("Vehicle added!"); setOpen(false); load();
  };

  if (loading) return <CircularProgress />;
  if (!unit) return <Alert severity="info">No unit assigned to your account yet. Contact admin.</Alert>;

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={2}>My Unit & Membership</Typography>
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, borderLeft: "4px solid #1a237e" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>Unit Details</Typography>
              {[
                ["Unit Number", unit.Unit_Number],
                ["Floor", unit.Floor],
                ["Block", unit.Block],
                ["Square Footage", `${unit.Square_Footage} sq ft`],
                ["Status", null],
                ["Tenancy Type", unit.residentRole],
              ].map(([label, val]) => (
                <Box display="flex" justifyContent="space-between" py={0.5} key={label} borderBottom="1px solid #f0f0f0">
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  {label === "Status" ? <Chip label={unit.Status} color={unit.Status === "Occupied" ? "success" : "default"} size="small" /> : <Typography variant="body2" fontWeight="bold">{val}</Typography>}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, borderLeft: "4px solid #2e7d32" }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">My Vehicles</Typography>
                <Button size="small" startIcon={<AddIcon />} variant="outlined" onClick={() => setOpen(true)}>Add</Button>
              </Box>
              {vehicles.length ? vehicles.map((v) => (
                <Box key={v._id} display="flex" justifyContent="space-between" py={0.5} borderBottom="1px solid #f0f0f0">
                  <Typography variant="body2">{v.Vehicle_Number}</Typography>
                  <Chip label={v.Type} size="small" />
                </Box>
              )) : <Typography variant="body2" color="text.secondary">No vehicles registered</Typography>}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Vehicle</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Vehicle Number" margin="normal" value={form.Vehicle_Number} onChange={(e) => setForm({ ...form, Vehicle_Number: e.target.value })} />
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select value={form.Type} label="Type" onChange={(e) => setForm({ ...form, Type: e.target.value })}>
              <MenuItem value="2-wheeler">2-Wheeler</MenuItem>
              <MenuItem value="4-wheeler">4-Wheeler</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddVehicle} sx={{ bgcolor: "#1a237e" }}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Unit;
