import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogContent,
  DialogActions, TextField, Alert, Chip, Tooltip, Rating, Divider, Avatar, CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyIcon from "@mui/icons-material/Key";
import BadgeIcon from "@mui/icons-material/Badge";
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

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (form, editId) => ({
  Name:     !form.Name.trim()                          ? "Full name is required"          : "",
  Email:    !form.Email.trim()                         ? "Email is required"
          : !emailRegex.test(form.Email)               ? "Enter a valid email address"    : "",
  Type:     !form.Type.trim()                          ? "Staff type is required"          : "",
  Password: !editId && !form.Password                  ? "Password is required"
          : form.Password && form.Password.length < 6  ? "At least 6 characters required" : "",
});

const Staff = () => {
  const [staff, setStaff]               = useState([]);
  const [open, setOpen]                 = useState(false);
  const [editId, setEditId]             = useState(null);
  const [form, setForm]                 = useState({ Name: "", Email: "", Password: "", Type: "", Aadhar_CNIC_No: "", Rating: 0 });
  const [touched, setTouched]           = useState({});
  const [submitError, setSubmitError]   = useState("");
  const [success, setSuccess]           = useState("");
  const [saving, setSaving]             = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading]           = useState(true);

  const load = async () => {
    try { const { data } = await api.get("/staff"); setStaff(data); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const errors  = validate(form, editId);
  const isValid = !errors.Name && !errors.Email && !errors.Type && !errors.Password;

  const field = (key) => ({
    error:      !!touched[key] && !!errors[key],
    helperText: touched[key] && errors[key] ? errors[key] : " ",
    onBlur:     () => setTouched((t) => ({ ...t, [key]: true })),
  });

  const openAdd = () => {
    setEditId(null);
    setForm({ Name: "", Email: "", Password: "", Type: "", Aadhar_CNIC_No: "", Rating: 0 });
    setTouched({}); setSubmitError(""); setOpen(true);
  };

  const openEdit = (s) => {
    setEditId(s._id);
    setForm({ Name: s.Name, Email: s.Email || "", Password: "", Type: s.Type, Aadhar_CNIC_No: s.Aadhar_CNIC_No || "", Rating: s.Rating || 0 });
    setTouched({}); setSubmitError(""); setOpen(true);
  };

  const handleSave = async () => {
    setTouched({ Name: true, Email: true, Type: true, Password: true });
    if (!isValid) return;
    setSaving(true); setSubmitError("");
    try {
      if (editId) {
        const payload = { ...form };
        if (!payload.Password) delete payload.Password;
        await api.put(`/staff/${editId}`, payload);
      } else {
        await api.post("/staff", form);
      }
      setSuccess("Staff saved!"); setOpen(false); load();
    } catch (e) { setSubmitError(e.response?.data?.message || "Error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/staff/${deleteTarget.id}`);
      setSuccess(`${deleteTarget.name} has been removed.`); load();
    } catch { /* ignore */ }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress sx={{ color: "#1a237e" }} />
    </Box>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">Staff & Vendor Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} sx={{ bgcolor: "#1a237e", borderRadius: 2 }}>
          Add Staff/Vendor
        </Button>
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#1a237e" }}>
            <TableRow>
              {["Name", "Type", "Email", "CNIC", "Entry Code", "Rating", "Actions"].map((h) => (
                <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {staff.map((s) => (
              <TableRow key={s._id} hover>
                <TableCell>{s.Name}</TableCell>
                <TableCell><Chip label={s.Type} size="small" color="primary" /></TableCell>
                <TableCell>{s.Email}</TableCell>
                <TableCell>{s.Aadhar_CNIC_No || "—"}</TableCell>
                <TableCell>
                  <Chip icon={<KeyIcon />} label={s.Entry_Code} color="success" size="small" sx={{ fontFamily: "monospace", fontWeight: "bold" }} />
                </TableCell>
                <TableCell><Rating value={s.Rating} readOnly size="small" /></TableCell>
                <TableCell>
                  <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => openEdit(s)}><EditIcon /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteTarget({ id: s._id, name: s.Name })}><DeleteIcon /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!staff.length && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: "#aaa" }}>No staff/vendors found</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<BadgeIcon />} title={editId ? "Edit Staff/Vendor" : "Add Staff/Vendor"}
          subtitle={editId ? "Update staff member details" : "Enter the staff/vendor information"} />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          {submitError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSubmitError("")}>{submitError}</Alert>}
          <Box display="flex" gap={2} mb={1}>
            <TextField fullWidth label="Full Name" required value={form.Name}
              onChange={(e) => setForm({ ...form, Name: e.target.value })} {...field("Name")} />
            <TextField fullWidth label="Email Address" type="email" required value={form.Email}
              onChange={(e) => setForm({ ...form, Email: e.target.value })} {...field("Email")} />
          </Box>
          <TextField fullWidth label={editId ? "New Password (leave blank to keep current)" : "Password"}
            type="password" required={!editId} value={form.Password}
            onChange={(e) => setForm({ ...form, Password: e.target.value })} {...field("Password")} />
          <Box display="flex" gap={2} mb={1}>
            <TextField fullWidth label="Type (e.g. Maid, Driver, Plumber)" required value={form.Type}
              onChange={(e) => setForm({ ...form, Type: e.target.value })} {...field("Type")} />
            <TextField fullWidth label="CNIC Number" value={form.Aadhar_CNIC_No}
              onChange={(e) => setForm({ ...form, Aadhar_CNIC_No: e.target.value })} helperText=" " />
          </Box>
          <Box mb={1}>
            <Typography variant="body2" mb={0.5}>Rating</Typography>
            <Rating value={form.Rating} onChange={(_, v) => setForm({ ...form, Rating: v })} />
          </Box>
          {!editId && (
            <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
              Entry Code will be auto-generated. Staff can log in using their Email + Password.
            </Typography>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!isValid || saving}
            sx={{ bgcolor: "#1a237e", borderRadius: 2, px: 3, minWidth: 120, "&:disabled": { bgcolor: "#c5cae9", color: "#fff" } }}>
            {saving ? <CircularProgress size={18} color="inherit" /> : (editId ? "Save Changes" : "Add Staff")}
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
          <Typography variant="h6" fontWeight="bold" mb={1}>Delete Staff/Vendor?</Typography>
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

export default Staff;
