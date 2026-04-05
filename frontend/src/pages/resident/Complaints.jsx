import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Card, CardContent, CardActions, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel,
  Alert, Chip, Stepper, Step, StepLabel
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import api from "../../api/axios";

const statusColors = { Pending: "warning", "In Progress": "info", Resolved: "success" };
const steps = ["Pending", "In Progress", "Resolved"];

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [open, setOpen] = useState(false);
  const [feedbackId, setFeedbackId] = useState(null);
  const [form, setForm] = useState({ Category: "", Description: "" });
  const [feedback, setFeedback] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const load = async () => { const { data } = await api.get("/complaints"); setComplaints(data); };
  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    try {
      await api.post("/complaints", form);
      setSuccess("Complaint submitted!"); setOpen(false); load();
    } catch (e) { setError(e.response?.data?.message || "Error"); }
  };

  const handleFeedback = async () => {
    await api.post(`/complaints/${feedbackId}/feedback`, { feedback });
    setSuccess("Feedback submitted!"); setFeedbackId(null); load();
  };

  const categories = ["Electricity", "Plumbing", "Security", "Cleanliness", "Noise", "Parking", "Other"];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">My Complaints & Requests</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm({ Category: "", Description: "" }); setError(""); setOpen(true); }} sx={{ bgcolor: "#1a237e" }}>
          New Complaint
        </Button>
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}
      <Grid container spacing={2}>
        {complaints.map((c) => (
          <Grid item xs={12} md={6} key={c._id}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Chip label={c.Category} size="small" />
                  <Chip label={c.Status} color={statusColors[c.Status]} size="small" />
                </Box>
                <Typography variant="body2" mb={1}>{c.Description}</Typography>
                <Stepper activeStep={steps.indexOf(c.Status)} alternativeLabel sx={{ mt: 1 }}>
                  {steps.map((s) => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
                </Stepper>
                {c.assignedTo && <Typography variant="caption">Assigned to: {c.assignedTo.Name}</Typography>}
                {c.feedback && <Typography variant="caption" display="block" color="text.secondary">Your feedback: {c.feedback}</Typography>}
                <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                  {new Date(c.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
              {c.Status === "Resolved" && !c.feedback && (
                <CardActions>
                  <Button size="small" onClick={() => { setFeedbackId(c._id); setFeedback(""); }}>Submit Feedback</Button>
                </CardActions>
              )}
            </Card>
          </Grid>
        ))}
        {!complaints.length && <Grid item xs={12}><Typography color="text.secondary" align="center">No complaints submitted</Typography></Grid>}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit Complaint / Request</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select value={form.Category} label="Category" onChange={(e) => setForm({ ...form, Category: e.target.value })}>
              {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField fullWidth label="Description" margin="normal" multiline rows={4} value={form.Description} onChange={(e) => setForm({ ...form, Description: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: "#1a237e" }}>Submit</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!feedbackId} onClose={() => setFeedbackId(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit Feedback</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Your feedback on resolution" margin="normal" multiline rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackId(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleFeedback} sx={{ bgcolor: "#1a237e" }}>Submit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Complaints;
