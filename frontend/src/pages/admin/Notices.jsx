import AdminDialog, { AdminDialogHeader as ModalHeader, AdminDeleteDialog } from "../../components/common/AdminDialog";
import Toast from "../../components/common/Toast";
import { useEffect, useState } from "react";
import {
  Box, Typography, Button, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel, Divider, CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import PublishIcon from "@mui/icons-material/Publish";
import CampaignIcon from "@mui/icons-material/Campaign";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SearchRounded from "@mui/icons-material/SearchRounded";
import FilterAltOutlined from "@mui/icons-material/FilterAltOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import AccessTimeRounded from "@mui/icons-material/AccessTimeRounded";
import ErrorOutlineRounded from "@mui/icons-material/ErrorOutlineRounded";
import LocationOnRounded from "@mui/icons-material/LocationOnRounded";
import api from "../../api/axios";
import "./Members.css";
import "./Notices.css";

const noticeStatus = notice => notice.IsActive ? "Active" : notice.ExpiredAt ? "Expired" : "Draft";
const stamp = value => {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "—";
  return `${date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} · ${date.toLocaleTimeString("en-GB")}`;
};
const typeClass = value => ["Emergency", "Meeting", "Maintenance", "General"].includes(value) ? value.toLowerCase() : "general";


const validate = (form) => ({
  Title:   !form.Title.trim()   ? "Title is required"   : form.Title.trim().length < 3 ? "Title too short (min 3 chars)" : "",
  Content: !form.Content.trim() ? "Content is required" : form.Content.trim().length < 10 ? "Content too short (min 10 chars)" : "",
});

const Notices = () => {
  const [notices, setNotices]       = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const query = search.trim().toLowerCase();
  const filtered = notices.filter(notice => (!status || noticeStatus(notice) === status) && (!category || notice.NoticeType === category) && (!priority || notice.Priority === priority) && [notice.Title, notice.Content].some(value => (value || "").toLowerCase().includes(query)));
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
    try { setLoadError(""); const { data } = await api.get("/notices"); setNotices(data); }
    catch (e) { setLoadError(e.response?.data?.message || "Unable to load notices. Please try again."); }
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
    setBusyId(id); setActionError("");
    try {
      await api.put(`/notices/${id}/publish`, { emergencyFlag });
      setSuccess(emergencyFlag ? "Notice published as an emergency." : "Notice published.");
      await load();
    } catch (e) { setActionError(e.response?.data?.message || "Unable to publish this notice. Please try again."); }
    finally { setBusyId(null); }
  };

  const handleExpire = async (id) => {
    setBusyId(id); setActionError("");
    try {
      await api.put(`/notices/${id}/expire`);
      setSuccess("Notice expired."); await load();
    } catch (e) { setActionError(e.response?.data?.message || "Unable to expire this notice. Please try again."); }
    finally { setBusyId(null); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true); setDeleteError("");
    try {
      await api.delete(`/notices/${deleteTarget.id}`);
      setSuccess("Notice deleted."); setDeleteTarget(null); load();
    } catch (e) { setDeleteError(e.response?.data?.message || "Unable to delete this notice. Please try again."); }
    finally { setDeleting(false); }
  };

  return (
    <div className="hs-notice-management">
      <div className="hs-page-heading hs-members-heading hs-notice-heading"><div><h1>Notice Board Management</h1><p>Publish announcements and manage society notices.</p></div><button className="hs-resident-add" onClick={() => handleOpen()}><AddIcon/>Create notice</button></div>
      {success && <Toast severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Toast>}
      {loadError && <Toast severity="error" sx={{ mb: 2 }} action={<Button color="inherit" onClick={() => { setLoading(true); load(); }}>Retry</Button>}>{loadError}</Toast>}
      {actionError && <Toast severity="error" sx={{ mb: 2 }} onClose={() => setActionError("")}>{actionError}</Toast>}
      <section className="hs-panel hs-notice-toolbar" aria-label="Filter notices">
        <div className="hs-notice-tabs" role="group" aria-label="Filter notices by status">
          {[["", "All notices"], ["Active", "Active"], ["Draft", "Drafts"], ["Expired", "Expired"]].map(([value, label]) => <button key={label} className={status === value ? "active" : ""} aria-pressed={status === value} onClick={() => setStatus(value)}>{label}<span>{value ? notices.filter(notice => noticeStatus(notice) === value).length : notices.length}</span></button>)}
        </div>
        <div className="hs-residents-filters hs-notice-filters"><label className="hs-resident-search"><SearchRounded/><input type="search" aria-label="Search notice titles and content" placeholder="Search notices..." value={search} onChange={e => setSearch(e.target.value)}/></label><div className="hs-notice-selects">
          <div className="hs-resident-filter"><FilterAltOutlined/><select aria-label="Filter notices by category" value={category} onChange={e => setCategory(e.target.value)}><option value="">All categories</option>{["General", "Emergency", "Meeting", "Maintenance"].map(value => <option key={value} value={value}>{value}</option>)}</select><KeyboardArrowDownRounded/></div>
          <div className="hs-resident-filter hs-notice-priority-filter"><CalendarTodayOutlined/><select aria-label="Filter notices by priority" value={priority} onChange={e => setPriority(e.target.value)}><option value="">All priorities</option>{["Low", "Medium", "High"].map(value => <option key={value} value={value}>{value}</option>)}</select><KeyboardArrowDownRounded/></div>
        </div></div>
      </section>
      <section className="hs-notice-grid" aria-label="Society notices" aria-busy={loading}>
        {loading ? <div className="hs-panel hs-loading" role="status"><CircularProgress size={28}/>Loading notices...</div> : filtered.map(notice => {
          const state = noticeStatus(notice);
          const isSOS = notice.NoticeType === "Emergency" && /SOS/i.test(notice.Title);
          const locationMatch = isSOS && (notice.Content || "").match(/Location:\s*([\s\S]+)/i);
          const content = locationMatch ? notice.Content.slice(0, locationMatch.index).trim() : notice.Content;
          const disabled = busyId !== null;
          return <article key={notice._id} className={`hs-panel hs-notice-card ${typeClass(notice.NoticeType)} ${state.toLowerCase()}`}>
            <div className="hs-notice-card-heading"><h2>{isSOS && <WarningAmberIcon/>}{notice.Title}</h2><span className={`hs-notice-state ${state.toLowerCase()}`}>{state}</span></div>
            <div className="hs-notice-tags-row"><span className={`hs-notice-type ${typeClass(notice.NoticeType)}`}>{notice.NoticeType}</span><span className={`hs-notice-priority ${["High", "Medium", "Low"].includes(notice.Priority) ? notice.Priority.toLowerCase() : "medium"}`}>{notice.Priority} priority</span></div>
            <p className="hs-notice-content">{content}</p>
            {locationMatch && <div className="hs-notice-location"><LocationOnRounded/><p>{locationMatch[1]}</p></div>}
            <p className="hs-notice-published">{state === "Draft" ? "Created" : "Published"}: {stamp(state === "Draft" ? notice.createdAt : notice.PublishDate)}</p>
            <div className="hs-notice-card-actions">
              <div className="hs-notice-lifecycle">{notice.IsActive ? <button className="hs-notice-expire" disabled={disabled} onClick={() => handleExpire(notice._id)}><AccessTimeRounded/>{busyId === notice._id ? "Updating..." : "Expire notice"}</button> : <><button className="hs-notice-publish" disabled={disabled} onClick={() => handlePublish(notice._id)}><PublishIcon/>{busyId === notice._id ? "Updating..." : "Publish"}</button><button className="hs-notice-emergency" disabled={disabled} onClick={() => handlePublish(notice._id, true)}><ErrorOutlineRounded/>Publish as emergency</button></>}</div>
              <div className="hs-resident-actions"><button disabled={disabled} title="Edit notice" aria-label={`Edit ${notice.Title}`} onClick={() => handleOpen(notice)}><EditOutlined/></button><button disabled={disabled} className="hs-resident-delete" title="Delete notice" aria-label={`Delete ${notice.Title}`} onClick={() => { setDeleteError(""); setDeleteTarget({ id: notice._id, title: notice.Title }); }}><DeleteOutlineRounded/></button></div>
            </div>
          </article>;
        })}
        {!loading && !filtered.length && <div className="hs-panel hs-empty">{loadError ? "Notice data unavailable" : notices.length ? "No notices match your search or filters." : "No notices yet. Create a notice to get started."}</div>}
      </section>

      {/* ── Add / Edit Dialog ── */}
      <AdminDialog busy={saving} open={open} onClose={() => { if (!saving) setOpen(false); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<CampaignIcon />} title={editId ? "Edit Notice" : "Create Notice"}
          subtitle={editId ? "Update notice details" : "Fill in the notice information"} />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          {submitError && <Toast severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSubmitError("")}>{submitError}</Toast>}
          <TextField fullWidth label="Title" required value={form.Title}
            onChange={(e) => setForm({ ...form, Title: e.target.value })} {...field("Title")} />
          <TextField fullWidth label="Content" multiline rows={4} required value={form.Content}
            onChange={(e) => setForm({ ...form, Content: e.target.value })} {...field("Content")} />
          <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2} mt={1} mb={1}>
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
          <Button disabled={saving} onClick={() => setOpen(false)} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!isValid || saving}
            sx={{ bgcolor: "#0854ed", borderRadius: 2, px: 3, minWidth: 130, "&:disabled": { bgcolor: "#c5cae9", color: "#fff" } }}>
            {saving ? <CircularProgress size={18} color="inherit" /> : (editId ? "Save Changes" : "Create Notice")}
          </Button>
        </DialogActions>
      </AdminDialog>

      {/* ── Delete Dialog ── */}
      <AdminDeleteDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} busy={deleting} title="Delete Notice?" name={deleteTarget?.title}>
        {deleteError && <Toast severity="error">{deleteError}</Toast>}
      </AdminDeleteDialog>
    </div>
  );
};

export default Notices;
