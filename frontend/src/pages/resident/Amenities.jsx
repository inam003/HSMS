import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Grid, Card, CardContent, CardActions, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogContent,
  DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, FormHelperText,
  Alert, Chip, Tabs, Tab, Divider, CircularProgress
} from "@mui/material";
import SpaIcon from "@mui/icons-material/Spa";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
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

const validate = (form) => ({
  Booking_Date: !form.Booking_Date ? "Booking date is required"    : "",
  Time_Slot:    !form.Time_Slot    ? "Please select a time slot"   : "",
});

const timeSlots = ["08:00-10:00", "10:00-12:00", "12:00-14:00", "14:00-16:00", "16:00-18:00", "18:00-20:00"];

const Amenities = () => {
  const [tab, setTab]           = useState(0);
  const [amenities, setAmenities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState({ Booking_Date: "", Time_Slot: "" });
  const [touched, setTouched]   = useState({});
  const [success, setSuccess]   = useState("");
  const [submitError, setSubmitError] = useState("");
  const [booking, setBooking]   = useState(false);
  const [loading, setLoading]   = useState(true);

  const load = async () => {
    try {
      const [a, b] = await Promise.all([api.get("/amenities"), api.get("/amenities/bookings")]);
      setAmenities(a.data); setBookings(b.data);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const errors  = validate(form);
  const isValid = !errors.Booking_Date && !errors.Time_Slot;

  const field = (key) => ({
    error:      !!touched[key] && !!errors[key],
    helperText: touched[key] && errors[key] ? errors[key] : " ",
    onBlur:     () => setTouched((t) => ({ ...t, [key]: true })),
  });

  const openBook = (a) => {
    setSelected(a);
    setForm({ Booking_Date: "", Time_Slot: "" });
    setTouched({}); setSubmitError("");
  };

  const handleBook = async () => {
    setTouched({ Booking_Date: true, Time_Slot: true });
    if (!isValid) return;
    setBooking(true); setSubmitError("");
    try {
      await api.post("/amenities/bookings", { amenityId: selected._id, ...form });
      setSuccess("Booking submitted! Awaiting approval."); setSelected(null); load();
    } catch (e) { setSubmitError(e.response?.data?.message || "Slot not available"); }
    finally { setBooking(false); }
  };

  const handleCancel = async (id) => {
    await api.put(`/amenities/bookings/${id}`, { Status: "Cancelled" }); load();
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress sx={{ color: "#1a237e" }} />
    </Box>
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={2}>Amenity Booking</Typography>
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Available Amenities" />
        <Tab label="My Bookings" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={2}>
          {amenities.map((a) => (
            <Grid item xs={12} sm={6} md={4} key={a._id}>
              <Card sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                height: "100%", display: "flex", flexDirection: "column" }}>
                {/* Blue header */}
                <Box sx={{ bgcolor: "#1a237e", borderRadius: "8px 8px 0 0", px: 2.5, py: 2 }}>
                  <Typography variant="h6" fontWeight="bold" color="white" noWrap>{a.Name}</Typography>
                </Box>
                <CardContent sx={{ flex: 1, pt: 2 }}>
                  {/* Info pills */}
                  <Box display="flex" gap={1} mb={1.5} flexWrap="wrap">
                    <Box sx={{ bgcolor: "#e8eaf6", borderRadius: 1.5, px: 1.5, py: 0.5,
                      display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Typography variant="caption" color="#1a237e" fontWeight="bold">Capacity</Typography>
                      <Typography variant="caption" fontWeight="bold">{a.Capacity} persons</Typography>
                    </Box>
                    <Box sx={{ bgcolor: "#e8f5e9", borderRadius: 1.5, px: 1.5, py: 0.5,
                      display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Typography variant="caption" color="#2e7d32" fontWeight="bold">Fee</Typography>
                      <Typography variant="caption" fontWeight="bold">
                        PKR {Number(a.Booking_Fee).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
                    {a.Description || "No description provided."}
                  </Typography>
                </CardContent>
                <Box sx={{ px: 2, pb: 2 }}>
                  <Button fullWidth variant="contained" onClick={() => openBook(a)}
                    sx={{ bgcolor: "#1a237e", borderRadius: 2, "&:hover": { bgcolor: "#283593" } }}>
                    Book Now
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
          {!amenities.length && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: "center", py: 8 }}>
                <SpaIcon sx={{ fontSize: 56, color: "#ddd", mb: 2 }} />
                <Typography variant="h6" color="text.secondary">No Amenities Available</Typography>
                <Typography variant="body2" color="text.secondary">Check back later</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {tab === 1 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
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
                    {b.Status === "Pending" && <Button size="small" color="error" onClick={() => handleCancel(b._id)} sx={{ borderRadius: 2 }}>Cancel</Button>}
                  </TableCell>
                </TableRow>
              ))}
              {!bookings.length && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: "#aaa" }}>No bookings</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ── Book Amenity Dialog ── */}
      <Dialog open={!!selected} onClose={() => !booking && setSelected(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<EventAvailableIcon />} title={`Book ${selected?.Name}`}
          subtitle={`Fee: PKR ${selected?.Booking_Fee} • Pending admin approval`} />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          {submitError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSubmitError("")}>{submitError}</Alert>}
          <TextField fullWidth label="Booking Date" type="date" required InputLabelProps={{ shrink: true }}
            value={form.Booking_Date} onChange={(e) => setForm({ ...form, Booking_Date: e.target.value })} {...field("Booking_Date")} />
          <FormControl fullWidth required error={!!touched.Time_Slot && !!errors.Time_Slot}>
            <InputLabel>Time Slot</InputLabel>
            <Select value={form.Time_Slot} label="Time Slot"
              onChange={(e) => { setForm({ ...form, Time_Slot: e.target.value }); setTouched((t) => ({ ...t, Time_Slot: true })); }}>
              {timeSlots.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
            <FormHelperText>{touched.Time_Slot && errors.Time_Slot ? errors.Time_Slot : " "}</FormHelperText>
          </FormControl>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setSelected(null)} disabled={booking} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleBook} disabled={!isValid || booking}
            sx={{ bgcolor: "#1a237e", borderRadius: 2, px: 3, minWidth: 140, "&:disabled": { bgcolor: "#c5cae9", color: "#fff" } }}>
            {booking ? <CircularProgress size={18} color="inherit" /> : "Submit Booking"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Amenities;
