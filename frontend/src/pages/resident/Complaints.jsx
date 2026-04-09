import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Card, CardContent, CardActions, Grid, Dialog,
  DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel,
  FormHelperText, Alert, Chip, Stepper, Step, StepLabel, Divider, CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import FeedbackIcon from "@mui/icons-material/Feedback";
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

const statusColors = { Pending: "warning", "In Progress": "info", Resolved: "success" };
const steps = ["Pending", "In Progress", "Resolved"];
const categories = ["Electricity", "Plumbing", "Security", "Cleanliness", "Noise", "Parking", "Other"];

const validateSubmit = (form) => ({
  Category:    !form.Category                       ? "Please select a category"             : "",
  Description: !form.Description.trim()             ? "Description is required"
             : form.Description.trim().length < 10  ? "Please provide more detail (min 10 chars)" : "",
});

const validateFeedback = (feedback) => ({
  feedback: !feedback.trim() ? "Feedback cannot be empty" : "",
});

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [open, setOpen]             = useState(false);
  const [feedbackId, setFeedbackId] = useState(null);
  const [form, setForm]             = useState({ Category: "", Description: "" });
  const [feedback, setFeedback]     = useState("");
  const [touched, setTouched]       = useState({});
  const [fbTouched, setFbTouched]   = useState(false);
  const [success, setSuccess]       = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [loading, setLoading]               = useState(true);

  const load = async () => {
    try { const { data } = await api.get("/complaints"); setComplaints(data); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  // Submit validation
  const errors  = validateSubmit(form);
  const isValid = !errors.Category && !errors.Description;

  const field = (key) => ({
    error:      !!touched[key] && !!errors[key],
    helperText: touched[key] && errors[key] ? errors[key] : " ",
    onBlur:     () => setTouched((t) => ({ ...t, [key]: true })),
  });

  // Feedback validation
  const fbErrors  = validateFeedback(feedback);
  const fbIsValid = !fbErrors.feedback;

  const handleSubmit = async () => {
    setTouched({ Category: true, Description: true });
    if (!isValid) return;
    setSubmitting(true); setSubmitError("");
    try {
      await api.post("/complaints", form);
      setSuccess("Complaint submitted!"); setOpen(false); load();
    } catch (e) { setSubmitError(e.response?.data?.message || "Error"); }
    finally { setSubmitting(false); }
  };

  const handleFeedback = async () => {
    setFbTouched(true);
    if (!fbIsValid) return;
    setSendingFeedback(true);
    try {
      await api.post(`/complaints/${feedbackId}/feedback`, { feedback });
      setSuccess("Feedback submitted!"); setFeedbackId(null); load();
    } catch { /* ignore */ }
    finally { setSendingFeedback(false); }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress sx={{ color: "#1a237e" }} />
    </Box>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">My Complaints & Requests</Typography>
        <Button variant="contained" startIcon={<AddIcon />}
          onClick={() => { setForm({ Category: "", Description: "" }); setTouched({}); setSubmitError(""); setOpen(true); }}
          sx={{ bgcolor: "#1a237e", borderRadius: 2 }}>New Complaint</Button>
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      <Grid container spacing={2}>
        {complaints.map((c) => {
          const headerColor = c.Status === "Resolved" ? "#2e7d32" : c.Status === "In Progress" ? "#1565c0" : "#e65100";
          return (
            <Grid item xs={12} md={6} key={c._id}>
              <Card sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", height: "100%", display: "flex", flexDirection: "column" }}>
                {/* Colored header */}
                <Box sx={{ bgcolor: headerColor, borderRadius: "8px 8px 0 0", px: 2.5, py: 1.5,
                  display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Chip label={c.Category} size="small"
                    sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: "bold", border: "none" }} />
                  <Chip label={c.Status} size="small"
                    sx={{ bgcolor: "rgba(255,255,255,0.25)", color: "white", fontWeight: "bold", border: "none" }} />
                </Box>

                <CardContent sx={{ flex: 1, pt: 2 }}>
                  <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6, mb: 2 }}>
                    {c.Description}
                  </Typography>

                  <Stepper activeStep={steps.indexOf(c.Status)} alternativeLabel
                    sx={{ "& .MuiStepLabel-label": { fontSize: 11 } }}>
                    {steps.map((s) => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
                  </Stepper>

                  <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid #f5f5f5" }}>
                    {c.assignedTo && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Assigned to: <strong>{c.assignedTo.Name}</strong>
                      </Typography>
                    )}
                    {c.feedback && (
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                        Your feedback: {c.feedback}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      Submitted: {new Date(c.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>

                {c.Status === "Resolved" && !c.feedback && (
                  <Box sx={{ px: 2, pb: 2 }}>
                    <Button fullWidth size="small" variant="outlined"
                      onClick={() => { setFeedbackId(c._id); setFeedback(""); setFbTouched(false); }}
                      sx={{ borderColor: "#2e7d32", color: "#2e7d32", borderRadius: 2 }}>
                      Submit Feedback
                    </Button>
                  </Box>
                )}
              </Card>
            </Grid>
          );
        })}
        {!complaints.length && (
          <Grid item xs={12}>
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>No complaints submitted</Typography>
          </Grid>
        )}
      </Grid>

      {/* ── Submit Complaint Dialog ── */}
      <Dialog open={open} onClose={() => !submitting && setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<ReportProblemIcon />} title="Submit Complaint / Request" subtitle="Describe your issue and we'll assign it" />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          {submitError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSubmitError("")}>{submitError}</Alert>}
          <FormControl fullWidth required error={!!touched.Category && !!errors.Category} sx={{ mb: 1 }}>
            <InputLabel>Category</InputLabel>
            <Select value={form.Category} label="Category"
              onChange={(e) => { setForm({ ...form, Category: e.target.value }); setTouched((t) => ({ ...t, Category: true })); }}>
              {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
            <FormHelperText>{touched.Category && errors.Category ? errors.Category : " "}</FormHelperText>
          </FormControl>
          <TextField fullWidth label="Description" required multiline rows={4} value={form.Description}
            onChange={(e) => setForm({ ...form, Description: e.target.value })} {...field("Description")} />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setOpen(false)} disabled={submitting} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!isValid || submitting}
            sx={{ bgcolor: "#1a237e", borderRadius: 2, px: 3, minWidth: 110, "&:disabled": { bgcolor: "#c5cae9", color: "#fff" } }}>
            {submitting ? <CircularProgress size={18} color="inherit" /> : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Feedback Dialog ── */}
      <Dialog open={!!feedbackId} onClose={() => !sendingFeedback && setFeedbackId(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<FeedbackIcon />} title="Submit Feedback" subtitle="Let us know how the issue was resolved" color="#2e7d32" />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          <TextField fullWidth label="Your feedback on resolution" required multiline rows={3} value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            error={fbTouched && !!fbErrors.feedback}
            helperText={fbTouched && fbErrors.feedback ? fbErrors.feedback : " "}
            onBlur={() => setFbTouched(true)} />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setFeedbackId(null)} disabled={sendingFeedback} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleFeedback} disabled={!fbIsValid || sendingFeedback}
            sx={{ bgcolor: "#2e7d32", borderRadius: 2, px: 3, minWidth: 140, "&:disabled": { bgcolor: "#c8e6c9", color: "#fff" } }}>
            {sendingFeedback ? <CircularProgress size={18} color="inherit" /> : "Submit Feedback"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Complaints;
