import AdminDialog, { AdminDialogHeader as ModalHeader } from "../../components/common/AdminDialog";
import Toast from "../../components/common/Toast";
import { useEffect, useState } from "react";
import {
  Box, Typography, DialogContent, DialogActions, Button, Select, MenuItem,
  FormControl, InputLabel, FormHelperText, Divider, CircularProgress
} from "@mui/material";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import SearchRounded from "@mui/icons-material/SearchRounded";
import FilterAltOutlined from "@mui/icons-material/FilterAltOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import api from "../../api/axios";
import "./Members.css";
import "./Complaints.css";

const statuses = ["Pending", "In Progress", "Resolved"];
const statusClass = value => ({ Pending: "pending", "In Progress": "progress", Resolved: "resolved" })[value] || "pending";
const initials = name => (name || "?").trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join("").toUpperCase();
const dateLabel = value => {
  const date = new Date(value);
  return value && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
};


const validate = (form) => ({
  Status: !form.Status ? "Please select a status" : "",
});

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const pageSize = 10;
  const categories = [...new Set(complaints.map(complaint => complaint.Category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const query = search.trim().toLowerCase();
  const filtered = complaints.filter(complaint => (!category || complaint.Category === category) && (!status || complaint.Status === status) && [complaint.resident?.Name, complaint.Category, complaint.Description, complaint.assignedTo?.Name].some(value => (value || "").toLowerCase().includes(query)));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const inProgress = complaints.filter(complaint => complaint.Status === "In Progress").length;
  const [staff, setStaff]           = useState([]);
  const [open, setOpen]             = useState(false);
  const [selected, setSelected]     = useState(null);
  const [form, setForm]             = useState({ Status: "", assignedTo: "" });
  const [touched, setTouched]       = useState({});
  const [success, setSuccess]       = useState("");
  const [saving, setSaving]         = useState(false);

  const [loading, setLoading]       = useState(true);

  const load = async () => {
    try {
      setLoadError("");
      const [c, s] = await Promise.all([api.get("/complaints"), api.get("/staff")]);
      setComplaints(c.data); setStaff(s.data);
    } catch (e) { setLoadError(e.response?.data?.message || "Unable to load complaints and staff. Please try again."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const errors  = validate(form);
  const isValid = !errors.Status;

  const handleOpen = (c) => {
    setSelected(c);
    setForm({ Status: c.Status, assignedTo: c.assignedTo?._id || "" });
    setTouched({}); setSubmitError(""); setOpen(true);
  };

  const handleUpdate = async () => {
    setTouched({ Status: true });
    if (!isValid || !selected || saving) return;
    setSaving(true); setSubmitError("");
    try {
      await api.put(`/complaints/${selected._id}`, { ...form, assignedTo: form.assignedTo || null });
      setSuccess("Complaint updated!"); setOpen(false); load();
    } catch (e) { setSubmitError(e.response?.data?.message || "Unable to update this complaint. Please try again."); }
    finally { setSaving(false); }
  };

  return (
    <div className="hs-complaint-management">
      <div className="hs-page-heading hs-members-heading hs-complaint-heading"><div><h1>Complaints Management</h1><p>Review complaints, assign staff, and track resolution.</p></div></div>
      {success && <Toast severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Toast>}
      {loadError && <Toast severity="error" sx={{ mb: 2 }} action={<Button color="inherit" onClick={() => { setLoading(true); load(); }}>Retry</Button>}>{loadError}</Toast>}
      <section className="hs-panel hs-residents-panel hs-complaint-panel" aria-label="Complaint records" aria-busy={loading}>
        <div className="hs-complaint-toolbar">
          <div className="hs-complaint-toolbar-heading"><h2>All complaints <span>{complaints.length}</span></h2><p>{inProgress} in progress</p></div>
          <div className="hs-residents-filters hs-complaint-filters"><label className="hs-resident-search"><SearchRounded/><input type="search" aria-label="Search complaints by resident, description, category or assigned staff" placeholder="Search complaints..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/></label><div className="hs-complaint-selects">
            <div className="hs-resident-filter"><FilterAltOutlined/><select aria-label="Filter complaints by category" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}><option value="">All categories</option>{categories.map(value => <option key={value} value={value}>{value}</option>)}</select><KeyboardArrowDownRounded/></div>
            <div className="hs-resident-filter hs-complaint-status-filter"><CalendarTodayOutlined/><select aria-label="Filter complaints by status" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">All statuses</option>{statuses.map(value => <option key={value} value={value}>{value}</option>)}</select><KeyboardArrowDownRounded/></div>
          </div></div>
        </div>
        <div className="hs-residents-table-wrap"><table className="hs-residents-table hs-complaint-table"><thead><tr>{["Resident", "Category", "Description", "Status", "Assigned to", "Date", "Actions"].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>
          {loading ? <tr><td colSpan={7}><div className="hs-residents-loading" role="status"><CircularProgress size={26}/>Loading complaints...</div></td></tr> : visible.map(complaint => <tr key={complaint._id}>
            <td>{complaint.resident?.Name || "—"}</td><td><span className="hs-complaint-category">{complaint.Category}</span></td><td><p className="hs-complaint-description" title={complaint.Description}>{complaint.Description}</p></td><td><span className={`hs-complaint-status ${statusClass(complaint.Status)}`}><i/>{complaint.Status === "In Progress" ? "In progress" : complaint.Status}</span></td><td>{complaint.assignedTo?.Name ? <div className="hs-complaint-assignee"><span aria-hidden="true">{initials(complaint.assignedTo.Name)}</span>{complaint.assignedTo.Name}</div> : "—"}</td><td>{dateLabel(complaint.createdAt)}</td><td><button className="hs-complaint-manage" aria-label={`Manage ${complaint.Category} complaint from ${complaint.resident?.Name || "unknown resident"}`} onClick={() => handleOpen(complaint)}>Manage<ChevronRightRounded/></button></td>
          </tr>)}
          {!loading && !visible.length && <tr><td colSpan={7} className="hs-empty">{loadError ? "Complaint data unavailable" : complaints.length ? "No complaints match your search or filters." : "No complaints have been submitted."}</td></tr>}
        </tbody></table></div>
        <div className="hs-residents-pagination"><span aria-live="polite">Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} {filtered.length === 1 ? "complaint" : "complaints"}</span><div><button disabled={loading || currentPage <= 1} onClick={() => setPage(currentPage - 1)}><ChevronLeftRounded/>Previous</button><button disabled={loading || currentPage * pageSize >= filtered.length} onClick={() => setPage(currentPage + 1)}>Next<ChevronRightRounded/></button></div></div>
      </section>

      {/* ── Manage Complaint Dialog ── */}
      <AdminDialog busy={saving} open={open} onClose={() => { if (!saving) setOpen(false); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<ReportProblemIcon />} title="Manage Complaint"
          subtitle={selected ? `Category: ${selected.Category}` : ""} />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          {submitError && <Toast severity="error" sx={{ mb: 2 }} onClose={() => setSubmitError("")}>{submitError}</Toast>}
          <Box sx={{ bgcolor: "#f5f5f5", borderRadius: 2, p: 2, mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{selected?.Description}</Typography>
          </Box>
          <FormControl fullWidth required error={!!touched.Status && !!errors.Status} sx={{ mb: 1 }}>
            <InputLabel>Status</InputLabel>
            <Select value={form.Status} label="Status"
              onChange={(e) => { setForm({ ...form, Status: e.target.value }); setTouched((t) => ({ ...t, Status: true })); }}>
              {statuses.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
            <FormHelperText>{touched.Status && errors.Status ? errors.Status : " "}</FormHelperText>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 1 }}>
            <InputLabel>Assign to Staff/Vendor</InputLabel>
            <Select value={form.assignedTo} label="Assign to Staff/Vendor"
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
              <MenuItem value="">— Not Assigned —</MenuItem>
              {staff.map((s) => <MenuItem key={s._id} value={s._id}>{s.Name} ({s.Type})</MenuItem>)}
            </Select>
            <FormHelperText> </FormHelperText>
          </FormControl>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button disabled={saving} onClick={() => setOpen(false)} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate} disabled={!isValid || saving}
            sx={{ bgcolor: "#0854ed", borderRadius: 2, px: 3, minWidth: 150, "&:disabled": { bgcolor: "#c5cae9", color: "#fff" } }}>
            {saving ? <CircularProgress size={18} color="inherit" /> : "Update Complaint"}
          </Button>
        </DialogActions>
      </AdminDialog>
    </div>
  );
};

export default Complaints;
