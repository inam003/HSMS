import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControlLabel, Switch, Alert, Chip, Tooltip,
  Divider, InputAdornment, Avatar
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PhoneIcon from "@mui/icons-material/Phone";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CircularProgress from "@mui/material/CircularProgress";
import api from "../../api/axios";

/* ── Validation ──────────────────────────────────────────────────────── */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (form, editId) => ({
  Name:     !form.Name.trim()                    ? "Full name is required"          : "",
  Email:    !form.Email.trim()                   ? "Email is required"
          : !emailRegex.test(form.Email)         ? "Enter a valid email address"    : "",
  Password: !editId && !form.Password            ? "Password is required"
          : form.Password && form.Password.length < 6 ? "Password must be at least 6 characters" : "",
});

const emptyForm = { Name: "", Email: "", Password: "", Contact_No: "", Emergency_Contact: "", Is_Owner: true };

/* ═══════════════════════════════════════════════════════════════════════ */
const Members = () => {
  const [residents, setResidents] = useState([]);
  const [open, setOpen]           = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [touched, setTouched]     = useState({});
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess]     = useState("");

  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
  const [loading, setLoading]           = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get("/residents");
      setResidents(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  /* ── Field helpers ── */
  const errors  = validate(form, editId);
  const isValid = !errors.Name && !errors.Email && !errors.Password;

  const field = (key) => ({
    error:    !!touched[key] && !!errors[key],
    helperText: touched[key] && errors[key] ? errors[key] : " ",
    onBlur:   () => setTouched((t) => ({ ...t, [key]: true })),
  });

  /* ── Open add / edit ── */
  const handleOpen = (r = null) => {
    setEditId(r?._id || null);
    setForm(r
      ? { Name: r.Name, Email: r.Email, Password: "", Contact_No: r.Contact_No || "", Emergency_Contact: r.Emergency_Contact || "", Is_Owner: r.Is_Owner }
      : emptyForm
    );
    setTouched({});
    setSubmitError("");
    setOpen(true);
  };

  /* ── Save ── */
  const handleSave = async () => {
    setTouched({ Name: true, Email: true, Password: true });
    if (!isValid) return;
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.Password) delete payload.Password;
      if (editId) await api.put(`/residents/${editId}`, payload);
      else        await api.post("/residents", payload);
      setSuccess(editId ? "Resident updated successfully!" : "Resident added successfully!");
      setOpen(false);
      load();
    } catch (e) {
      setSubmitError(e.response?.data?.message || "Something went wrong. Please try again.");
    } finally { setSaving(false); }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/residents/${deleteTarget.id}`);
      setSuccess(`${deleteTarget.name} has been removed.`);
      load();
    } catch { /* ignore */ }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  /* ─────────────────────────────────────────────────────────────────── */
  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress sx={{ color: "#1a237e" }} />
    </Box>
  );

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">Residents Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} sx={{ bgcolor: "#1a237e", borderRadius: 2 }}>
          Add Resident
        </Button>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#1a237e" }}>
            <TableRow>
              {["Name", "Email", "Contact", "Type", "Emergency Contact", "Actions"].map((h) => (
                <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {residents.map((r) => (
              <TableRow key={r._id} hover>
                <TableCell>{r.Name}</TableCell>
                <TableCell>{r.Email}</TableCell>
                <TableCell>{r.Contact_No || "—"}</TableCell>
                <TableCell>
                  <Chip label={r.Is_Owner ? "Owner" : "Tenant"} color={r.Is_Owner ? "primary" : "default"} size="small" />
                </TableCell>
                <TableCell>{r.Emergency_Contact || "—"}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton size="small" color="primary" onClick={() => handleOpen(r)}><EditIcon /></IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget({ id: r._id, name: r.Name })}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!residents.length && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: "#aaa" }}>No residents found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>

        {/* Title */}
        <Box sx={{ bgcolor: "#1a237e", px: 3, py: 2.5, borderRadius: "12px 12px 0 0" }}>
          <Typography variant="h6" fontWeight="bold" color="white">
            {editId ? "Edit Resident" : "Add New Resident"}
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
            {editId ? "Update resident information below" : "Fill in the details to register a new resident"}
          </Typography>
        </Box>

        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSubmitError("")}>
              {submitError}
            </Alert>
          )}

          {/* Name + Email row */}
          <Box display="flex" gap={2} mb={1}>
            <TextField
              fullWidth
              label="Full Name"
              required
              value={form.Name}
              onChange={(e) => setForm({ ...form, Name: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ fontSize: 18, color: "#aaa" }} /></InputAdornment> }}
              {...field("Name")}
            />
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              required
              value={form.Email}
              onChange={(e) => setForm({ ...form, Email: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ fontSize: 18, color: "#aaa" }} /></InputAdornment> }}
              {...field("Email")}
            />
          </Box>

          {/* Password */}
          <TextField
            fullWidth
            label={editId ? "New Password (leave blank to keep current)" : "Password"}
            type="password"
            required={!editId}
            value={form.Password}
            onChange={(e) => setForm({ ...form, Password: e.target.value })}
            InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon sx={{ fontSize: 18, color: "#aaa" }} /></InputAdornment> }}
            sx={{ mt: 1 }}
            {...field("Password")}
          />

          {/* Contact + Emergency */}
          <Box display="flex" gap={2} mt={1} mb={1}>
            <TextField
              fullWidth
              label="Contact Number"
              value={form.Contact_No}
              onChange={(e) => setForm({ ...form, Contact_No: e.target.value })}
              helperText=" "
              InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ fontSize: 18, color: "#aaa" }} /></InputAdornment> }}
            />
            <TextField
              fullWidth
              label="Emergency Contact"
              value={form.Emergency_Contact}
              onChange={(e) => setForm({ ...form, Emergency_Contact: e.target.value })}
              helperText=" "
              InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ fontSize: 18, color: "#aaa" }} /></InputAdornment> }}
            />
          </Box>

          {/* Owner toggle */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: form.Is_Owner ? "#e8eaf6" : "#f5f5f5",
              border: `1px solid ${form.Is_Owner ? "#9fa8da" : "#e0e0e0"}`,
              borderRadius: 2,
              px: 2,
              py: 1.2,
              mb: 1,
            }}
          >
            <Box>
              <Typography variant="body2" fontWeight={600}>{form.Is_Owner ? "Owner" : "Tenant"}</Typography>
              <Typography variant="caption" color="text.secondary">
                {form.Is_Owner ? "This resident owns the unit" : "This resident rents the unit"}
              </Typography>
            </Box>
            <Switch
              checked={form.Is_Owner}
              onChange={(e) => setForm({ ...form, Is_Owner: e.target.checked })}
              sx={{ "& .MuiSwitch-thumb": { bgcolor: form.Is_Owner ? "#1a237e" : "#bbb" } }}
            />
          </Box>
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!isValid || saving}
            sx={{ bgcolor: "#1a237e", borderRadius: 2, px: 3, minWidth: 130, "&:disabled": { bgcolor: "#c5cae9", color: "#fff" } }}
          >
            {saving ? <CircularProgress size={18} color="inherit" /> : (editId ? "Save Changes" : "Add Resident")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
      >
        {/* Red top bar */}
        <Box sx={{ bgcolor: "#c62828", height: 6 }} />

        <DialogContent sx={{ pt: 4, pb: 2, px: 3, textAlign: "center" }}>
          {/* Warning icon */}
          <Avatar sx={{ bgcolor: "#ffebee", width: 64, height: 64, mx: "auto", mb: 2 }}>
            <WarningAmberIcon sx={{ color: "#c62828", fontSize: 36 }} />
          </Avatar>

          <Typography variant="h6" fontWeight="bold" mb={1}>Delete Resident?</Typography>
          <Typography variant="body2" color="text.secondary">
            You are about to permanently delete
          </Typography>
          <Typography fontWeight="bold" fontSize={15} mt={0.5} mb={1.5} color="#1a237e">
            {deleteTarget?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action <strong>cannot be undone</strong>. All associated data will be removed.
          </Typography>
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1, justifyContent: "center" }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setDeleteTarget(null)}
            sx={{ borderRadius: 2, borderColor: "#ccc", color: "#555", py: 1 }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleDelete}
            disabled={deleting}
            sx={{ borderRadius: 2, bgcolor: "#c62828", py: 1, minWidth: 120, "&:hover": { bgcolor: "#b71c1c" } }}
          >
            {deleting ? <CircularProgress size={18} color="inherit" /> : "Yes, Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Members;
