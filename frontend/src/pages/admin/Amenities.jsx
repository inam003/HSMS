import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Grid, Card, CardContent, CardActions, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogContent,
  DialogActions, TextField, Alert, Chip, Tabs, Tab, IconButton, Tooltip,
  Divider, Avatar, CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SpaIcon from "@mui/icons-material/Spa";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
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
  Name:        !form.Name.trim()                   ? "Amenity name is required"          : "",
  Capacity:    !form.Capacity                      ? "Capacity is required"
             : Number(form.Capacity) <= 0          ? "Capacity must be greater than 0"   : "",
  Booking_Fee: form.Booking_Fee === ""             ? "Booking fee is required"
             : Number(form.Booking_Fee) < 0        ? "Booking fee cannot be negative"    : "",
});

const Amenities = () => {
  const [tab, setTab]                   = useState(0);
  const [amenities, setAmenities]       = useState([]);
  const [bookings, setBookings]         = useState([]);
  const [open, setOpen]                 = useState(false);
  const [editId, setEditId]             = useState(null);
  const [form, setForm]                 = useState({ Name: "", Capacity: "", Booking_Fee: "", Description: "" });
  const [touched, setTouched]           = useState({});
  const [submitError, setSubmitError]   = useState("");
  const [success, setSuccess]           = useState("");
  const [saving, setSaving]             = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading]           = useState(true);

  const load = async () => {
    try {
      const [a, b] = await Promise.all([api.get("/amenities"), api.get("/amenities/bookings")]);
      setAmenities(a.data); setBookings(b.data);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const errors  = validate(form);
  const isValid = !errors.Name && !errors.Capacity && !errors.Booking_Fee;

  const field = (key) => ({
    error:      !!touched[key] && !!errors[key],
    helperText: touched[key] && errors[key] ? errors[key] : " ",
    onBlur:     () => setTouched((t) => ({ ...t, [key]: true })),
  });

  const handleOpen = (a = null) => {
    setEditId(a?._id || null);
    setForm(a
      ? { Name: a.Name, Capacity: a.Capacity, Booking_Fee: a.Booking_Fee, Description: a.Description || "" }
      : { Name: "", Capacity: "", Booking_Fee: "", Description: "" });
    setTouched({}); setSubmitError(""); setOpen(true);
  };

  const handleSave = async () => {
    setTouched({ Name: true, Capacity: true, Booking_Fee: true });
    if (!isValid) return;
    setSaving(true); setSubmitError("");
    try {
      if (editId) await api.put(`/amenities/${editId}`, form);
      else await api.post("/amenities", form);
      setSuccess("Amenity saved!"); setOpen(false); load();
    } catch (e) { setSubmitError(e.response?.data?.message || "Error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/amenities/${deleteTarget.id}`);
      setSuccess("Amenity deleted."); load();
    } catch { /* ignore */ }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const handleBookingAction = async (id, status) => {
    await api.put(`/amenities/bookings/${id}`, { Status: status }); load();
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress sx={{ color: "#1a237e" }} />
    </Box>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">Amenity Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}
          sx={{ bgcolor: "#1a237e", borderRadius: 2 }}>Add Amenity</Button>
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Amenities" />
        <Tab label={`Bookings (${bookings.filter((b) => b.Status === "Pending").length} Pending)`} />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={2}>
          {amenities.map((a) => (
            <Grid item xs={12} sm={6} md={4} key={a._id}>
              <Card sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", height: "100%", display: "flex", flexDirection: "column" }}>
                {/* coloured header bar */}
                <Box sx={{ bgcolor: "#1a237e", borderRadius: "8px 8px 0 0", px: 2.5, py: 2 }}>
                  <Typography variant="h6" fontWeight="bold" color="white" noWrap>{a.Name}</Typography>
                </Box>

                <CardContent sx={{ flex: 1, pt: 2 }}>
                  <Box display="flex" gap={1} mb={1.5}>
                    <Box sx={{ bgcolor: "#e8eaf6", borderRadius: 1.5, px: 1.5, py: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Typography variant="caption" color="#1a237e" fontWeight="bold">Capacity</Typography>
                      <Typography variant="caption" fontWeight="bold">{a.Capacity} persons</Typography>
                    </Box>
                    <Box sx={{ bgcolor: "#e8f5e9", borderRadius: 1.5, px: 1.5, py: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Typography variant="caption" color="#2e7d32" fontWeight="bold">Fee</Typography>
                      <Typography variant="caption" fontWeight="bold">PKR {Number(a.Booking_Fee).toLocaleString()}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ minHeight: 36 }}>
                    {a.Description || "No description provided."}
                  </Typography>
                </CardContent>

                <Box sx={{ px: 2, pb: 1.5, display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => handleOpen(a)}
                      sx={{ bgcolor: "#e8eaf6", "&:hover": { bgcolor: "#c5cae9" } }}>
                      <EditIcon fontSize="small" sx={{ color: "#1a237e" }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => setDeleteTarget({ id: a._id, name: a.Name })}
                      sx={{ bgcolor: "#ffebee", "&:hover": { bgcolor: "#ffcdd2" } }}>
                      <DeleteIcon fontSize="small" sx={{ color: "#c62828" }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Card>
            </Grid>
          ))}
          {!amenities.length && (
            <Grid item xs={12}>
              <Typography align="center" color="text.secondary" sx={{ py: 4 }}>No amenities added yet</Typography>
            </Grid>
          )}
        </Grid>
      )}

      {tab === 1 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
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
              {!bookings.length && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: "#aaa" }}>No bookings found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<SpaIcon />} title={editId ? "Edit Amenity" : "Add Amenity"}
          subtitle={editId ? "Update amenity details" : "Enter amenity information"} />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          {submitError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSubmitError("")}>{submitError}</Alert>}
          <TextField fullWidth label="Amenity Name" required value={form.Name}
            onChange={(e) => setForm({ ...form, Name: e.target.value })} {...field("Name")} />
          <Box display="flex" gap={2} mb={1}>
            <TextField fullWidth label="Capacity" type="number" required value={form.Capacity}
              onChange={(e) => setForm({ ...form, Capacity: e.target.value })} {...field("Capacity")} />
            <TextField fullWidth label="Booking Fee (PKR)" type="number" required value={form.Booking_Fee}
              onChange={(e) => setForm({ ...form, Booking_Fee: e.target.value })} {...field("Booking_Fee")} />
          </Box>
          <TextField fullWidth label="Description" multiline rows={2} value={form.Description}
            onChange={(e) => setForm({ ...form, Description: e.target.value })} helperText=" " />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!isValid || saving}
            sx={{ bgcolor: "#1a237e", borderRadius: 2, px: 3, minWidth: 120, "&:disabled": { bgcolor: "#c5cae9", color: "#fff" } }}>
            {saving ? <CircularProgress size={18} color="inherit" /> : (editId ? "Save Changes" : "Add Amenity")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Dialog ── */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}>
        <Box sx={{ bgcolor: "#c62828", height: 6 }} />
        <DialogContent sx={{ pt: 4, pb: 2, px: 3, textAlign: "center" }}>
          <Avatar sx={{ bgcolor: "#ffebee", width: 64, height: 64, mx: "auto", mb: 2 }}>
            <WarningAmberIcon sx={{ color: "#c62828", fontSize: 36 }} />
          </Avatar>
          <Typography variant="h6" fontWeight="bold" mb={1}>Delete Amenity?</Typography>
          <Typography variant="body2" color="text.secondary">You are about to permanently delete</Typography>
          <Typography fontWeight="bold" fontSize={15} mt={0.5} mb={1.5} color="#1a237e">{deleteTarget?.name}</Typography>
          <Typography variant="body2" color="text.secondary">This action <strong>cannot be undone</strong>.</Typography>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1, justifyContent: "center" }}>
          <Button fullWidth variant="outlined" onClick={() => setDeleteTarget(null)} sx={{ borderRadius: 2, borderColor: "#ccc", color: "#555", py: 1 }}>Cancel</Button>
          <Button fullWidth variant="contained" onClick={handleDelete} disabled={deleting}
            sx={{ borderRadius: 2, bgcolor: "#c62828", py: 1, "&:hover": { bgcolor: "#b71c1c" } }}>
            {deleting ? <CircularProgress size={18} color="inherit" /> : "Yes, Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Amenities;
