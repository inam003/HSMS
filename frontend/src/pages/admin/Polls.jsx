import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Card, CardContent, CardActions, Grid, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem,
  FormControl, InputLabel, Alert, Chip, LinearProgress, IconButton, Tooltip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LockIcon from "@mui/icons-material/Lock";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../api/axios";

const Polls = () => {
  const [polls, setPolls] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ Title: "", Description: "", StartDate: "", EndDate: "", PollType: "General", ResultsVisible: false, options: ["", ""] });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [pollDetails, setPollDetails] = useState(null);

  const load = async () => { const { data } = await api.get("/polls"); setPolls(data); };
  useEffect(() => { load(); }, []);

  const loadDetails = async (id) => {
    const { data } = await api.get(`/polls/${id}`);
    setPollDetails(data); setSelectedPoll(id);
  };

  const handleSave = async () => {
    try {
      const filtered = form.options.filter((o) => o.trim());
      if (filtered.length < 2) return setError("At least 2 options required");
      await api.post("/polls", { ...form, options: filtered });
      setSuccess("Poll created!"); setOpen(false); load();
    } catch (e) { setError(e.response?.data?.message || "Error"); }
  };

  const handleClose = async (id) => {
    await api.put(`/polls/${id}/close`); load(); setPollDetails(null);
  };

  const totalVotes = pollDetails?.options?.reduce((s, o) => s + o.VoteCount, 0) || 0;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">Polls Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setError(""); setForm({ Title: "", Description: "", StartDate: "", EndDate: "", PollType: "General", ResultsVisible: false, options: ["", ""] }); setOpen(true); }} sx={{ bgcolor: "#1a237e" }}>
          Create Poll
        </Button>
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}
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
      </Grid>

      {/* Poll Results Dialog */}
      {pollDetails && (
        <Dialog open={!!selectedPoll} onClose={() => { setSelectedPoll(null); setPollDetails(null); }} maxWidth="sm" fullWidth>
          <DialogTitle>{pollDetails.poll?.Title} — Results</DialogTitle>
          <DialogContent>
            {pollDetails.options?.map((opt) => (
              <Box key={opt._id} mb={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">{opt.OptionText}</Typography>
                  <Typography variant="body2" fontWeight="bold">{opt.VoteCount} votes ({totalVotes ? Math.round((opt.VoteCount / totalVotes) * 100) : 0}%)</Typography>
                </Box>
                <LinearProgress variant="determinate" value={totalVotes ? (opt.VoteCount / totalVotes) * 100 : 0} sx={{ height: 8, borderRadius: 4, mt: 0.5 }} />
              </Box>
            ))}
            <Typography variant="caption">Total Votes: {totalVotes}</Typography>
          </DialogContent>
          <DialogActions><Button onClick={() => { setSelectedPoll(null); setPollDetails(null); }}>Close</Button></DialogActions>
        </Dialog>
      )}

      {/* Create Poll Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Poll</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField fullWidth label="Poll Title" margin="normal" value={form.Title} onChange={(e) => setForm({ ...form, Title: e.target.value })} />
          <TextField fullWidth label="Description" margin="normal" multiline rows={2} value={form.Description} onChange={(e) => setForm({ ...form, Description: e.target.value })} />
          <FormControl fullWidth margin="normal">
            <InputLabel>Poll Type</InputLabel>
            <Select value={form.PollType} label="Poll Type" onChange={(e) => setForm({ ...form, PollType: e.target.value })}>
              <MenuItem value="General">General</MenuItem>
              <MenuItem value="Election">Election</MenuItem>
            </Select>
          </FormControl>
          <TextField fullWidth label="Start Date" type="date" margin="normal" InputLabelProps={{ shrink: true }} value={form.StartDate} onChange={(e) => setForm({ ...form, StartDate: e.target.value })} />
          <TextField fullWidth label="End Date" type="date" margin="normal" InputLabelProps={{ shrink: true }} value={form.EndDate} onChange={(e) => setForm({ ...form, EndDate: e.target.value })} />
          <Typography variant="subtitle2" mt={2} mb={1}>Options (min 2):</Typography>
          {form.options.map((opt, i) => (
            <TextField key={i} fullWidth label={`Option ${i + 1}`} margin="dense" value={opt} onChange={(e) => { const opts = [...form.options]; opts[i] = e.target.value; setForm({ ...form, options: opts }); }} />
          ))}
          <Button size="small" onClick={() => setForm({ ...form, options: [...form.options, ""] })} sx={{ mt: 1 }}>+ Add Option</Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: "#1a237e" }}>Create Poll</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Polls;
