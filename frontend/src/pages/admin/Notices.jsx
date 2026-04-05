import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Card, CardContent, CardActions, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel,
  Alert, Chip, IconButton, Tooltip, Switch, FormControlLabel
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PublishIcon from "@mui/icons-material/Publish";
import api from "../../api/axios";

const priorityColors = { High: "error", Medium: "warning", Low: "success" };
const typeColors = { Emergency: "error", Meeting: "info", Maintenance: "warning", General: "default" };

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ Title: "", Content: "", NoticeType: "General", Priority: "Medium", ExpiryDate: "" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const load = async () => { const { data } = await api.get("/notices"); setNotices(data); };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    try {
      if (editId) await api.put(`/notices/${editId}`, form);
      else await api.post("/notices", form);
      setSuccess("Notice saved!"); setOpen(false); load();
    } catch (e) { setError(e.response?.data?.message || "Error"); }
  };

  const handlePublish = async (id, emergencyFlag = false) => {
    await api.put(`/notices/${id}/publish`, { emergencyFlag }); load();
  };

  const handleExpire = async (id) => {
    await api.put(`/notices/${id}/expire`); load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete notice?")) return;
    await api.delete(`/notices/${id}`); load();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">Notice Board Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditId(null); setForm({ Title: "", Content: "", NoticeType: "General", Priority: "Medium", ExpiryDate: "" }); setError(""); setOpen(true); }} sx={{ bgcolor: "#1a237e" }}>
          Create Notice
        </Button>
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}
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
                <Tooltip title="Edit"><IconButton size="small" onClick={() => { setEditId(n._id); setForm({ Title: n.Title, Content: n.Content, NoticeType: n.NoticeType, Priority: n.Priority, ExpiryDate: n.ExpiryDate?.split("T")[0] || "" }); setOpen(true); }}><EditIcon /></IconButton></Tooltip>
                <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(n._id)}><DeleteIcon /></IconButton></Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
        {!notices.length && <Grid item xs={12}><Typography color="text.secondary" align="center">No notices found</Typography></Grid>}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? "Edit Notice" : "Create Notice"}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField fullWidth label="Title" margin="normal" value={form.Title} onChange={(e) => setForm({ ...form, Title: e.target.value })} />
          <TextField fullWidth label="Content" margin="normal" multiline rows={4} value={form.Content} onChange={(e) => setForm({ ...form, Content: e.target.value })} />
          <FormControl fullWidth margin="normal">
            <InputLabel>Notice Type</InputLabel>
            <Select value={form.NoticeType} label="Notice Type" onChange={(e) => setForm({ ...form, NoticeType: e.target.value })}>
              {["General", "Emergency", "Meeting", "Maintenance"].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Priority</InputLabel>
            <Select value={form.Priority} label="Priority" onChange={(e) => setForm({ ...form, Priority: e.target.value })}>
              {["Low", "Medium", "High"].map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField fullWidth label="Expiry Date" type="date" margin="normal" InputLabelProps={{ shrink: true }} value={form.ExpiryDate} onChange={(e) => setForm({ ...form, ExpiryDate: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: "#1a237e" }}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Notices;
