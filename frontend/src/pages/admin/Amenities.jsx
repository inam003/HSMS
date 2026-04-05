import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Grid, Card, CardContent, CardActions, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, Chip, Tabs, Tab, IconButton, Tooltip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../api/axios";

const Amenities = () => {
  const [tab, setTab] = useState(0);
  const [amenities, setAmenities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ Name: "", Capacity: "", Booking_Fee: "", Description: "" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const [a, b] = await Promise.all([api.get("/amenities"), api.get("/amenities/bookings")]);
    setAmenities(a.data); setBookings(b.data);
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    try {
      if (editId) await api.put(`/amenities/${editId}`, form);
      else await api.post("/amenities", form);
      setSuccess("Amenity saved!"); setOpen(false); load();
    } catch (e) { setError(e.response?.data?.message || "Error"); }
  };

  const handleBookingAction = async (id, status) => {
    await api.put(`/amenities/bookings/${id}`, { Status: status }); load();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">Amenity Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditId(null); setForm({ Name: "", Capacity: "", Booking_Fee: "", Description: "" }); setError(""); setOpen(true); }} sx={{ bgcolor: "#1a237e" }}>
          Add Amenity
        </Button>
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Amenities" />
        <Tab label={`Bookings (${bookings.filter((b) => b.Status === "Pending").length} Pending)`} />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={2}>
          {amenities.map((a) => (
            <Grid item xs={12} sm={6} md={4} key={a._id}>
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6">{a.Name}</Typography>
                  <Typography variant="body2">Capacity: {a.Capacity}</Typography>
                  <Typography variant="body2">Fee: PKR {a.Booking_Fee}</Typography>
                  <Typography variant="body2" color="text.secondary">{a.Description}</Typography>
                </CardContent>
                <CardActions>
                  <IconButton size="small" color="primary" onClick={() => { setEditId(a._id); setForm({ Name: a.Name, Capacity: a.Capacity, Booking_Fee: a.Booking_Fee, Description: a.Description || "" }); setOpen(true); }}><EditIcon /></IconButton>
                  <IconButton size="small" color="error" onClick={async () => { if (window.confirm("Delete?")) { await api.delete(`/amenities/${a._id}`); load(); } }}><DeleteIcon /></IconButton>
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
                {["Amenity", "Resident", "Date", "Time Slot", "Status", "Actions"].map((h) => (
                  <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b._id} hover>
                  <TableCell>{b.amenity?.Name}</TableCell>
                  <TableCell>{b.resident?.Name}</TableCell>
                  <TableCell>{new Date(b.Booking_Date).toLocaleDateString()}</TableCell>
                  <TableCell>{b.Time_Slot}</TableCell>
                  <TableCell><Chip label={b.Status} color={b.Status === "Confirmed" ? "success" : b.Status === "Cancelled" ? "error" : "warning"} size="small" /></TableCell>
                  <TableCell>
                    {b.Status === "Pending" && (
                      <>
                        <Button size="small" color="success" onClick={() => handleBookingAction(b._id, "Confirmed")}>Approve</Button>
                        <Button size="small" color="error" onClick={() => handleBookingAction(b._id, "Cancelled")}>Reject</Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? "Edit Amenity" : "Add Amenity"}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField fullWidth label="Name" margin="normal" value={form.Name} onChange={(e) => setForm({ ...form, Name: e.target.value })} />
          <TextField fullWidth label="Capacity" type="number" margin="normal" value={form.Capacity} onChange={(e) => setForm({ ...form, Capacity: e.target.value })} />
          <TextField fullWidth label="Booking Fee (PKR)" type="number" margin="normal" value={form.Booking_Fee} onChange={(e) => setForm({ ...form, Booking_Fee: e.target.value })} />
          <TextField fullWidth label="Description" margin="normal" multiline rows={2} value={form.Description} onChange={(e) => setForm({ ...form, Description: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: "#1a237e" }}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Amenities;
