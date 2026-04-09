import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Card, CardContent, CardActions, Grid, Dialog,
  DialogContent, DialogActions, TextField, Select, MenuItem,
  FormControl, InputLabel, Alert, Chip, LinearProgress, Divider, CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LockIcon from "@mui/icons-material/Lock";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import AssessmentIcon from "@mui/icons-material/Assessment";
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
  Title:     !form.Title.trim()   ? "Poll title is required"       : "",
  StartDate: !form.StartDate      ? "Start date is required"        : "",
  EndDate:   !form.EndDate        ? "End date is required"
           : form.StartDate && form.EndDate && form.EndDate <= form.StartDate
                                  ? "End date must be after start date" : "",
});

const Polls = () => {
  const [polls, setPolls]               = useState([]);
  const [open, setOpen]                 = useState(false);
  const [form, setForm]                 = useState({ Title: "", Description: "", StartDate: "", EndDate: "", PollType: "General", ResultsVisible: false, options: ["", ""] });
  const [touched, setTouched]           = useState({});
  const [submitError, setSubmitError]   = useState("");
  const [success, setSuccess]           = useState("");
  const [saving, setSaving]             = useState(false);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [pollDetails, setPollDetails]   = useState(null);
  const [loading, setLoading]           = useState(true);

  const load = async () => {
    try { const { data } = await api.get("/polls"); setPolls(data); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const loadDetails = async (id) => {
    const { data } = await api.get(`/polls/${id}`);
    setPollDetails(data); setSelectedPoll(id);
  };

  const errors  = validate(form);
  const isValid = !errors.Title && !errors.StartDate && !errors.EndDate;

  const field = (key) => ({
    error:      !!touched[key] && !!errors[key],
    helperText: touched[key] && errors[key] ? errors[key] : " ",
    onBlur:     () => setTouched((t) => ({ ...t, [key]: true })),
  });

  const handleOpen = () => {
    setForm({ Title: "", Description: "", StartDate: "", EndDate: "", PollType: "General", ResultsVisible: false, options: ["", ""] });
    setTouched({}); setSubmitError(""); setOpen(true);
  };

  const handleSave = async () => {
    setTouched({ Title: true, StartDate: true, EndDate: true });
    if (!isValid) return;
    const filtered = form.options.filter((o) => o.trim());
    if (filtered.length < 2) { setSubmitError("At least 2 non-empty options are required."); return; }
    setSaving(true); setSubmitError("");
    try {
      await api.post("/polls", { ...form, options: filtered });
      setSuccess("Poll created!"); setOpen(false); load();
    } catch (e) { setSubmitError(e.response?.data?.message || "Error"); }
    finally { setSaving(false); }
  };

  const handleClose = async (id) => {
    await api.put(`/polls/${id}/close`); load(); setPollDetails(null); setSelectedPoll(null);
  };

  const totalVotes = pollDetails?.options?.reduce((s, o) => s + o.VoteCount, 0) || 0;

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress sx={{ color: "#1a237e" }} />
    </Box>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">Polls Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}
          sx={{ bgcolor: "#1a237e", borderRadius: 2 }}>Create Poll</Button>
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      <Grid container spacing={2}>
        {polls.map((p) => (
          <Grid item xs={12} md={6} key={p._id}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6">{p.Title}</Typography>
                  <Chip label={p.IsActive ? "Active" : "Closed"} color={p.IsActive ? "success" : "default"} size="small" />
                </Box>
                <Chip label={p.PollType} size="small" sx={{ mt: 1 }} />
                <Typography variant="body2" color="text.secondary" mt={1}>{p.Description}</Typography>
                <Typography variant="caption">Ends: {new Date(p.EndDate).toLocaleDateString()} | Votes: {p.voters?.length || 0}</Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => loadDetails(p._id)}>View Results</Button>
                {p.IsActive && <Button size="small" color="error" startIcon={<LockIcon />} onClick={() => handleClose(p._id)}>Close Poll</Button>}
              </CardActions>
            </Card>
          </Grid>
        ))}
        {!polls.length && <Grid item xs={12}><Typography color="text.secondary" align="center" sx={{ py: 4 }}>No polls created yet</Typography></Grid>}
      </Grid>

      {/* ── Poll Results Dialog ── */}
      {pollDetails && (
        <Dialog open={!!selectedPoll} onClose={() => { setSelectedPoll(null); setPollDetails(null); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <ModalHeader icon={<AssessmentIcon />} title={pollDetails.poll?.Title} subtitle={`Total Votes: ${totalVotes}`} color="#4527a0" />
          <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
            {pollDetails.options?.map((opt) => (
              <Box key={opt._id} mb={2.5}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2" fontWeight="medium">{opt.OptionText}</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {opt.VoteCount} votes ({totalVotes ? Math.round((opt.VoteCount / totalVotes) * 100) : 0}%)
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={totalVotes ? (opt.VoteCount / totalVotes) * 100 : 0}
                  sx={{ height: 10, borderRadius: 5 }} />
              </Box>
            ))}
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => { setSelectedPoll(null); setPollDetails(null); }} sx={{ color: "#555", borderRadius: 2 }}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* ── Create Poll Dialog ── */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<HowToVoteIcon />} title="Create New Poll" subtitle="Set up a community poll for residents" />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          {submitError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSubmitError("")}>{submitError}</Alert>}
          <TextField fullWidth label="Poll Title" required value={form.Title}
            onChange={(e) => setForm({ ...form, Title: e.target.value })} {...field("Title")} />
          <TextField fullWidth label="Description" multiline rows={2} value={form.Description}
            onChange={(e) => setForm({ ...form, Description: e.target.value })} helperText=" " />
          <FormControl fullWidth sx={{ mb: 1 }}>
            <InputLabel>Poll Type</InputLabel>
            <Select value={form.PollType} label="Poll Type" onChange={(e) => setForm({ ...form, PollType: e.target.value })}>
              <MenuItem value="General">General</MenuItem>
              <MenuItem value="Election">Election</MenuItem>
            </Select>
          </FormControl>
          <Box display="flex" gap={2} mb={1}>
            <TextField fullWidth label="Start Date" type="date" required InputLabelProps={{ shrink: true }}
              value={form.StartDate} onChange={(e) => setForm({ ...form, StartDate: e.target.value })} {...field("StartDate")} />
            <TextField fullWidth label="End Date" type="date" required InputLabelProps={{ shrink: true }}
              value={form.EndDate} onChange={(e) => setForm({ ...form, EndDate: e.target.value })} {...field("EndDate")} />
          </Box>
          <Typography variant="subtitle2" mt={1} mb={0.5} fontWeight="bold">Options (min. 2):</Typography>
          {form.options.map((opt, i) => (
            <TextField key={i} fullWidth label={`Option ${i + 1}`} margin="dense" value={opt}
              helperText={i === form.options.length - 1 ? " " : undefined}
              onChange={(e) => { const opts = [...form.options]; opts[i] = e.target.value; setForm({ ...form, options: opts }); }} />
          ))}
          <Button size="small" onClick={() => setForm({ ...form, options: [...form.options, ""] })} sx={{ mt: 0.5 }}>+ Add Option</Button>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!isValid || saving}
            sx={{ bgcolor: "#1a237e", borderRadius: 2, px: 3, minWidth: 120, "&:disabled": { bgcolor: "#c5cae9", color: "#fff" } }}>
            {saving ? <CircularProgress size={18} color="inherit" /> : "Create Poll"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Polls;
