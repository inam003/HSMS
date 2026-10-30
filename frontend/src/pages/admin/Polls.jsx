import AdminDialog, { AdminDialogHeader as ModalHeader } from "../../components/common/AdminDialog";
import Toast from "../../components/common/Toast";
import { useEffect, useState } from "react";
import {
  Box, Typography, Button, DialogContent, DialogActions, TextField, Select, MenuItem,
  FormControl, InputLabel, LinearProgress, Divider, CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LockOutlined from "@mui/icons-material/LockOutlined";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SearchRounded from "@mui/icons-material/SearchRounded";
import FilterAltOutlined from "@mui/icons-material/FilterAltOutlined";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import PeopleOutlineRounded from "@mui/icons-material/PeopleOutlineRounded";
import AssessmentOutlined from "@mui/icons-material/AssessmentOutlined";
import api from "../../api/axios";
import "./Members.css";
import "./Polls.css";

const dateLabel = value => {
  const date = new Date(value);
  return value && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }) : "—";
};


const validate = (form) => ({
  Title:     !form.Title.trim()   ? "Poll title is required"       : "",
  StartDate: !form.StartDate      ? "Start date is required"        : "",
  EndDate:   !form.EndDate        ? "End date is required"
           : form.StartDate && form.EndDate && form.EndDate <= form.StartDate
                                  ? "End date must be after start date" : "",
});

const Polls = () => {
  const [polls, setPolls]               = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [closingId, setClosingId] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const query = search.trim().toLowerCase();
  const activeCount = polls.filter(poll => poll.IsActive).length;
  const filtered = polls.filter(poll => (!status || (status === "active" ? poll.IsActive : !poll.IsActive)) && (!category || poll.PollType === category) && [poll.Title, poll.Description].some(value => (value || "").toLowerCase().includes(query)));
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
    try { setLoadError(""); const { data } = await api.get("/polls"); setPolls(data); }
    catch (e) { setLoadError(e.response?.data?.message || "Unable to load polls. Please try again."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const loadDetails = async (id) => {
    if (detailsLoading) return;
    setSelectedPoll(id); setPollDetails(null); setDetailsError(""); setDetailsLoading(true);
    try {
      const { data } = await api.get(`/polls/${id}`);
      setPollDetails(data);
    } catch (e) { setDetailsError(e.response?.data?.message || "Unable to load poll results. Please try again."); }
    finally { setDetailsLoading(false); }
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
    if (!isValid || saving) return;
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
    if (closingId) return;
    setClosingId(id); setActionError("");
    try {
      await api.put(`/polls/${id}/close`);
      setSuccess("Poll closed. Results are now available to residents.");
      await load(); setPollDetails(null); setSelectedPoll(null);
    } catch (e) { setActionError(e.response?.data?.message || "Unable to close this poll. Please try again."); }
    finally { setClosingId(null); }
  };

  const totalVotes = pollDetails?.options?.reduce((s, o) => s + (Number(o.VoteCount) || 0), 0) || 0;

  return (
    <div className="hs-poll-management">
      <div className="hs-page-heading hs-members-heading hs-poll-heading"><div><h1>Polls Management</h1><p>Create community polls and review resident responses.</p></div><button className="hs-resident-add" onClick={handleOpen}><AddIcon/>Create poll</button></div>
      {success && <Toast severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Toast>}
      {loadError && <Toast severity="error" sx={{ mb: 2 }} action={<Button color="inherit" onClick={() => { setLoading(true); load(); }}>Retry</Button>}>{loadError}</Toast>}
      {actionError && <Toast severity="error" sx={{ mb: 2 }} onClose={() => setActionError("")}>{actionError}</Toast>}
      <section className="hs-panel hs-poll-toolbar" aria-label="Filter polls">
        <div className="hs-poll-tabs" role="group" aria-label="Filter polls by status">{[["", "All polls", polls.length], ["active", "Active", activeCount], ["closed", "Closed", polls.length - activeCount]].map(([value, label, count]) => <button key={label} className={status === value ? "active" : ""} aria-pressed={status === value} onClick={() => setStatus(value)}>{label}<span>{count}</span></button>)}</div>
        <div className="hs-residents-filters hs-poll-filters"><label className="hs-resident-search"><SearchRounded/><input type="search" placeholder="Search polls..." aria-label="Search polls by title or description" value={search} onChange={e => setSearch(e.target.value)}/></label><div className="hs-resident-filter"><FilterAltOutlined/><select aria-label="Filter polls by category" value={category} onChange={e => setCategory(e.target.value)}><option value="">All categories</option><option value="General">General</option><option value="Election">Election</option></select><KeyboardArrowDownRounded/></div></div>
      </section>
      <section className="hs-poll-grid" aria-label="Community polls" aria-busy={loading}>
        {loading ? <div className="hs-panel hs-loading" role="status"><CircularProgress size={28}/>Loading polls...</div> : filtered.map(poll => <article className="hs-panel hs-poll-card" key={poll._id}>
          <div className="hs-poll-card-heading"><span className="hs-poll-category">{poll.PollType}</span><span className={`hs-poll-state ${poll.IsActive ? "active" : "closed"}`}>{poll.IsActive ? "Active" : "Closed"}</span></div>
          <h2>{poll.Title}</h2><p className="hs-poll-description">{poll.Description || "No description provided."}</p>
          <div className="hs-poll-metrics"><div><CalendarMonthOutlined/><span><small>Ends on</small><strong>{dateLabel(poll.EndDate)}</strong></span></div><div><PeopleOutlineRounded/><span><small>Total votes</small><strong>{poll.voters?.length || 0}</strong></span></div></div>
          <div className="hs-poll-card-actions"><button className="hs-poll-results" disabled={detailsLoading || closingId !== null} onClick={() => loadDetails(poll._id)}><AssessmentOutlined/>View results</button>{poll.IsActive && <button className="hs-poll-close" disabled={closingId !== null || detailsLoading} onClick={() => handleClose(poll._id)}><LockOutlined/>{closingId === poll._id ? "Closing..." : "Close poll"}</button>}</div>
        </article>)}
        {!loading && !filtered.length && <div className="hs-panel hs-empty">{loadError ? "Poll data unavailable" : polls.length ? "No polls match your search or filters." : "No polls created yet. Create a poll to get started."}</div>}
      </section>

      {/* ── Poll Results Dialog ── */}
      <AdminDialog open={!!selectedPoll} onClose={() => { setSelectedPoll(null); setPollDetails(null); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<AssessmentIcon />} title={pollDetails?.poll?.Title || "Poll Results"} subtitle={pollDetails ? `Total Votes: ${totalVotes}` : "Resident responses"} />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          {detailsLoading && <Box display="flex" alignItems="center" justifyContent="center" gap={2} py={4} role="status"><CircularProgress size={26}/>Loading results...</Box>}
          {detailsError && <Toast severity="error" sx={{ mb: 2 }} action={<Button color="inherit" onClick={() => loadDetails(selectedPoll)}>Retry</Button>}>{detailsError}</Toast>}
          {!detailsLoading && !detailsError && pollDetails?.options?.map(opt => {
            const votes = Number(opt.VoteCount) || 0;
            const percentage = totalVotes ? (votes / totalVotes) * 100 : 0;
            return <Box key={opt._id} mb={2.5}><Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2} mb={0.5}><Typography variant="body2" sx={{ overflowWrap: "anywhere", minWidth: 0 }}>{opt.OptionText}</Typography><Typography variant="body2" fontWeight="bold" sx={{ flexShrink: 0 }}>{votes} votes ({Math.round(percentage)}%)</Typography></Box><LinearProgress variant="determinate" value={percentage} aria-label={`${opt.OptionText}: ${votes} votes`} sx={{ height: 10, borderRadius: 5 }}/></Box>;
          })}
          {!detailsLoading && !detailsError && pollDetails && !pollDetails.options?.length && <Typography color="text.secondary" py={2}>No options available for this poll.</Typography>}
        </DialogContent><Divider/><DialogActions sx={{ px: 3, py: 2 }}><Button onClick={() => { setSelectedPoll(null); setPollDetails(null); }} sx={{ color: "#555", borderRadius: 2 }}>Close</Button></DialogActions>
      </AdminDialog>

      {/* ── Create Poll Dialog ── */}
      <AdminDialog busy={saving} open={open} onClose={() => { if (!saving) setOpen(false); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<HowToVoteIcon />} title="Create New Poll" subtitle="Set up a community poll for residents" />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          {submitError && <Toast severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSubmitError("")}>{submitError}</Toast>}
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
          <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2} mb={1}>
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
          <Button disabled={saving} onClick={() => setOpen(false)} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!isValid || saving}
            sx={{ bgcolor: "#0854ed", borderRadius: 2, px: 3, minWidth: 120, "&:disabled": { bgcolor: "#c5cae9", color: "#fff" } }}>
            {saving ? <CircularProgress size={18} color="inherit" /> : "Create Poll"}
          </Button>
        </DialogActions>
      </AdminDialog>
    </div>
  );
};

export default Polls;
