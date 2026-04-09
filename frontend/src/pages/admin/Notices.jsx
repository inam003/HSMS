import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Card, CardContent, CardActions, Grid, Dialog,
  DialogContent, DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel, Alert, Chip, IconButton, Tooltip, Divider, Avatar, CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PublishIcon from "@mui/icons-material/Publish";
import CampaignIcon from "@mui/icons-material/Campaign";
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

const priorityColors = { High: "error", Medium: "warning", Low: "success" };
const typeColors     = { Emergency: "error", Meeting: "info", Maintenance: "warning", General: "default" };

const validate = (form) => ({
  Title:   !form.Title.trim()   ? "Title is required"   : form.Title.trim().length < 3 ? "Title too short (min 3 chars)" : "",
  Content: !form.Content.trim() ? "Content is required" : form.Content.trim().length < 10 ? "Content too short (min 10 chars)" : "",
});

const Notices = () => {
  const [notices, setNotices]       = useState([]);
  const [open, setOpen]             = useState(false);
  const [editId, setEditId]         = useState(null);
  const [form, setForm]             = useState({ Title: "", Content: "", NoticeType: "General", Priority: "Medium", ExpiryDate: "" });
  const [touched, setTouched]       = useState({});
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess]       = useState("");
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading]           = useState(true);

  const load = async () => {
    try { const { data } = await api.get("/notices"); setNotices(data); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const errors  = validate(form);
  const isValid = !errors.Title && !errors.Content;

  const field = (key) => ({
    error:      !!touched[key] && !!errors[key],
    helperText: touched[key] && errors[key] ? errors[key] : " ",
    onBlur:     () => setTouched((t) => ({ ...t, [key]: true })),
  });

  const handleOpen = (n = null) => {
    setEditId(n?._id || null);
    setForm(n
      ? { Title: n.Title, Content: n.Content, NoticeType: n.NoticeType, Priority: n.Priority, ExpiryDate: n.ExpiryDate?.split("T")[0] || "" }
      : { Title: "", Content: "", NoticeType: "General", Priority: "Medium", ExpiryDate: "" });
    setTouched({}); setSubmitError(""); setOpen(true);
  };

  const handleSave = async () => {
    setTouched({ Title: true, Content: true });
    if (!isValid) return;
    setSaving(true); setSubmitError("");
    try {
      if (editId) await api.put(`/notices/${editId}`, form);
      else await api.post("/notices", form);
      setSuccess("Notice saved!"); setOpen(false); load();
    } catch (e) { setSubmitError(e.response?.data?.message || "Error"); }
    finally { setSaving(false); }
  };

  const handlePublish = async (id, emergencyFlag = false) => {
    await api.put(`/notices/${id}/publish`, { emergencyFlag }); load();
  };

  const handleExpire = async (id) => {
    await api.put(`/notices/${id}/expire`); load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/notices/${deleteTarget.id}`);
      setSuccess("Notice deleted."); load();
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
        <Typography variant="h5" fontWeight="bold">Notice Board Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}
          sx={{ bgcolor: "#1a237e", borderRadius: 2 }}>Create Notice</Button>
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      <Grid container spacing={2}>
        {notices.map((n) => (
          <Grid item xs={12} md={6} key={n._id}>
            <Card sx={{ borderLeft: `4px solid ${n.NoticeType === "Emergency" ? "#c62828" : "#1a237e"}`, borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Typography variant="h6">{n.Title}</Typography>
                  <Chip label={n.IsActive ? "Active" : "Draft"} color={n.IsActive ? "success" : "default"} size="small" />
                </Box>
                <Box display="flex" gap={1} mb={1}>
                  <Chip label={n.NoticeType} color={typeColors[n.NoticeType]} size="small" />
                  <Chip label={n.Priority} color={priorityColors[n.Priority]} size="small" />
                </Box>
                <Typography variant="body2" color="text.secondary">{n.Content}</Typography>
                <Typography variant="caption" color="text.secondary" mt={1} display="block">
                  Published: {new Date(n.PublishDate).toLocaleString()}
                </Typography>
              </CardContent>
              <CardActions>
                {!n.IsActive && <Button size="small" startIcon={<PublishIcon />} color="success" onClick={() => handlePublish(n._id)}>Publish</Button>}
                {!n.IsActive && <Button size="small" color="error" onClick={() => handlePublish(n._id, true)}>Publish as Emergency</Button>}
                {n.IsActive && <Button size="small" color="warning" onClick={() => handleExpire(n._id)}>Expire</Button>}
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => handleOpen(n)}><EditIcon /></IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" color="error" onClick={() => setDeleteTarget({ id: n._id, title: n.Title })}><DeleteIcon /></IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
        {!notices.length && <Grid item xs={12}><Typography color="text.secondary" align="center">No notices found</Typography></Grid>}
      </Grid>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<CampaignIcon />} title={editId ? "Edit Notice" : "Create Notice"}
          subtitle={editId ? "Update notice details" : "Fill in the notice information"} />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          {submitError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSubmitError("")}>{submitError}</Alert>}
          <TextField fullWidth label="Title" required value={form.Title}
            onChange={(e) => setForm({ ...form, Title: e.target.value })} {...field("Title")} />
          <TextField fullWidth label="Content" multiline rows={4} required value={form.Content}
            onChange={(e) => setForm({ ...form, Content: e.target.value })} {...field("Content")} />
          <Box display="flex" gap={2} mt={1} mb={1}>
            <FormControl fullWidth>
              <InputLabel>Notice Type</InputLabel>
              <Select value={form.NoticeType} label="Notice Type" onChange={(e) => setForm({ ...form, NoticeType: e.target.value })}>
                {["General", "Emergency", "Meeting", "Maintenance"].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select value={form.Priority} label="Priority" onChange={(e) => setForm({ ...form, Priority: e.target.value })}>
                {["Low", "Medium", "High"].map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <TextField fullWidth label="Expiry Date" type="date" InputLabelProps={{ shrink: true }}
            value={form.ExpiryDate} onChange={(e) => setForm({ ...form, ExpiryDate: e.target.value })} helperText=" " />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!isValid || saving}
            sx={{ bgcolor: "#1a237e", borderRadius: 2, px: 3, minWidth: 130, "&:disabled": { bgcolor: "#c5cae9", color: "#fff" } }}>
            {saving ? <CircularProgress size={18} color="inherit" /> : (editId ? "Save Changes" : "Create Notice")}
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
          <Typography variant="h6" fontWeight="bold" mb={1}>Delete Notice?</Typography>
          <Typography variant="body2" color="text.secondary">You are about to permanently delete</Typography>
          <Typography fontWeight="bold" fontSize={15} mt={0.5} mb={1.5} color="#1a237e">"{deleteTarget?.title}"</Typography>
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

export default Notices;
