import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Grid, Card, CardContent, CardActions, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel,
  Alert, Chip, Tabs, Tab
} from "@mui/material";
import SpaIcon from "@mui/icons-material/Spa";
import api from "../../api/axios";

const Amenities = () => {
  const [tab, setTab] = useState(0);
  const [amenities, setAmenities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ Booking_Date: "", Time_Slot: "" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const [a, b] = await Promise.all([api.get("/amenities"), api.get("/amenities/bookings")]);
    setAmenities(a.data); setBookings(b.data);
  };
  useEffect(() => { load(); }, []);

  const handleBook = async () => {
    try {
      await api.post("/amenities/bookings", { amenityId: selected._id, ...form });
      setSuccess("Booking submitted! Awaiting approval."); setSelected(null); load();
    } catch (e) { setError(e.response?.data?.message || "Slot not available"); }
  };

  const handleCancel = async (id) => {
    await api.put(`/amenities/bookings/${id}`, { Status: "Cancelled" }); load();
  };

  const timeSlots = ["08:00-10:00", "10:00-12:00", "12:00-14:00", "14:00-16:00", "16:00-18:00", "18:00-20:00"];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={2}>Amenity Booking</Typography>
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Available Amenities" />
        <Tab label="My Bookings" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={2}>
          {amenities.map((a) => (
            <Grid item xs={12} sm={6} md={4} key={a._id}>
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <SpaIcon color="primary" />
                    <Typography variant="h6">{a.Name}</Typography>
                  </Box>
                  <Typography variant="body2">Capacity: {a.Capacity} persons</Typography>
                  <Typography variant="body2">Booking Fee: PKR {a.Booking_Fee}</Typography>
                  <Typography variant="body2" color="text.secondary">{a.Description}</Typography>
                </CardContent>
                <CardActions>
                  <Button variant="contained" size="small" onClick={() => { setSelected(a); setForm({ Booking_Date: "", Time_Slot: "" }); setError(""); }} sx={{ bgcolor: "#1a237e" }}>
                    Book Now
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {tab === 1 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: "#1a237e" }}>
              <TableRow>
                {["Amenity", "Date", "Time Slot", "Status", "Actions"].map((h) => (
                  <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b._id}>
                  <TableCell>{b.amenity?.Name}</TableCell>
                  <TableCell>{new Date(b.Booking_Date).toLocaleDateString()}</TableCell>
                  <TableCell>{b.Time_Slot}</TableCell>
                  <TableCell><Chip label={b.Status} color={b.Status === "Confirmed" ? "success" : b.Status === "Cancelled" ? "error" : "warning"} size="small" /></TableCell>
                  <TableCell>
                    {b.Status === "Pending" && <Button size="small" color="error" onClick={() => handleCancel(b._id)}>Cancel</Button>}
                  </TableCell>
                </TableRow>
              ))}
              {!bookings.length && <TableRow><TableCell colSpan={5} align="center">No bookings</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Book {selected?.Name}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Booking Date" type="date" margin="normal" InputLabelProps={{ shrink: true }} value={form.Booking_Date} onChange={(e) => setForm({ ...form, Booking_Date: e.target.value })} />
          <FormControl fullWidth margin="normal">
            <InputLabel>Time Slot</InputLabel>
            <Select value={form.Time_Slot} label="Time Slot" onChange={(e) => setForm({ ...form, Time_Slot: e.target.value })}>
              {timeSlots.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          <Typography variant="caption">Fee: PKR {selected?.Booking_Fee}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleBook} sx={{ bgcolor: "#1a237e" }}>Submit Booking</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Amenities;
