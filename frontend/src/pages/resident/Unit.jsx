import { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent, Grid, Chip, CircularProgress, Alert,
  Divider, Button, Dialog, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import AddIcon          from "@mui/icons-material/Add";
import HomeIcon         from "@mui/icons-material/Home";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
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

const InfoRow = ({ label, value, chip }) => (
  <Box display="flex" justifyContent="space-between" alignItems="center"
    sx={{ py: 1.2, borderBottom: "1px solid #f5f5f5" }}>
    <Typography variant="body2" color="text.secondary" fontWeight="medium">{label}</Typography>
    {chip || <Typography variant="body2" fontWeight="bold">{value}</Typography>}
  </Box>
);

const Unit = () => {
  const [unit, setUnit]       = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen]       = useState(false);
  const [form, setForm]       = useState({ Vehicle_Number: "", Type: "4-wheeler" });
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

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress sx={{ color: "#1a237e" }} />
    </Box>
  );
  if (!unit) return (
    <Alert severity="info" sx={{ borderRadius: 2 }}>
      No unit assigned to your account yet. Contact the admin.
    </Alert>
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={2}>My Unit & Membership</Typography>
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      <Grid container spacing={3}>
        {/* ── Unit Details ── */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <Box sx={{ bgcolor: "#1a237e", px: 2.5, py: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ bgcolor: "rgba(255,255,255,0.15)", borderRadius: "50%", p: 1, display: "flex" }}>
                <HomeIcon sx={{ color: "white", fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="white">Unit Details</Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                  Your registered unit information
                </Typography>
              </Box>
            </Box>
            <CardContent sx={{ p: 2.5 }}>
              <InfoRow label="Unit Number"    value={unit.Unit_Number} />
              <InfoRow label="Floor"          value={unit.Floor} />
              <InfoRow label="Block"          value={unit.Block || "—"} />
              <InfoRow label="Square Footage" value={`${unit.Square_Footage} sq ft`} />
              <InfoRow label="Tenancy Type"   value={unit.residentRole} />
              <InfoRow label="Status"         chip={
                <Chip label={unit.Status} color={unit.Status === "Occupied" ? "success" : "default"} size="small" />
              } />
            </CardContent>
          </Card>
        </Grid>

        {/* ── My Vehicles ── */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <Box sx={{ bgcolor: "#2e7d32", px: 2.5, py: 2,
              display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box sx={{ bgcolor: "rgba(255,255,255,0.15)", borderRadius: "50%", p: 1, display: "flex" }}>
                  <DirectionsCarIcon sx={{ color: "white", fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="white">My Vehicles</Typography>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                    {vehicles.length} vehicle(s) registered
                  </Typography>
                </Box>
              </Box>
              <Button size="small" startIcon={<AddIcon />} onClick={() => setOpen(true)}
                sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", borderRadius: 2, fontSize: 12,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.3)" } }}>
                Add
              </Button>
            </Box>
            <CardContent sx={{ p: 2.5 }}>
              {vehicles.length ? vehicles.map((v) => (
                <Box key={v._id} display="flex" justifyContent="space-between" alignItems="center"
                  sx={{ py: 1.2, borderBottom: "1px solid #f5f5f5" }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <DirectionsCarIcon sx={{ color: "#2e7d32", fontSize: 18 }} />
                    <Typography variant="body2" fontWeight="bold">{v.Vehicle_Number}</Typography>
                  </Box>
                  <Chip label={v.Type} size="small"
                    sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: "bold" }} />
                </Box>
              )) : (
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <DirectionsCarIcon sx={{ color: "#ccc", fontSize: 48, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" fontWeight="medium">No vehicles registered</Typography>
                  <Typography variant="caption" color="text.secondary">Click "Add" to register your vehicle</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Add Vehicle Dialog ── */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<DirectionsCarIcon />} title="Add Vehicle"
          subtitle="Register your vehicle details" color="#2e7d32" />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          <TextField fullWidth label="Vehicle Number" required value={form.Vehicle_Number}
            onChange={(e) => setForm({ ...form, Vehicle_Number: e.target.value })} helperText=" " />
          <FormControl fullWidth>
            <InputLabel>Vehicle Type</InputLabel>
            <Select value={form.Type} label="Vehicle Type"
              onChange={(e) => setForm({ ...form, Type: e.target.value })}>
              <MenuItem value="2-wheeler">2-Wheeler</MenuItem>
              <MenuItem value="4-wheeler">4-Wheeler</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddVehicle}
            sx={{ bgcolor: "#2e7d32", borderRadius: 2, px: 3 }}>Add Vehicle</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Unit;
