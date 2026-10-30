import AdminDialog, { AdminDialogHeader as ModalHeader, AdminDeleteDialog } from "../../components/common/AdminDialog";
import Toast from "../../components/common/Toast";
import { useEffect, useState } from "react";
import {
  Box, Typography, Button, DialogContent, DialogActions,
  TextField, Divider, CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import SecurityIcon from "@mui/icons-material/Security";
import SearchRounded from "@mui/icons-material/SearchRounded";
import FilterAltOutlined from "@mui/icons-material/FilterAltOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import MeetingRoomOutlined from "@mui/icons-material/MeetingRoomOutlined";
import api from "../../api/axios";
import "./Members.css";
import "./Guards.css";

const initials = name => (name || "?").trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join("").toUpperCase();
const GuardShift = ({ value }) => {
  const parts = (value || "").match(/^(Morning|Evening|Night|Day)\b[\s:(–—-]*(.*?)[)]?$/i);
  return parts ? <span className="hs-guard-shift">{parts[1]}{parts[2] && <small>{parts[2]}</small>}</span> : <span className="hs-guard-shift">{value || "—"}</span>;
};


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (form, editId) => ({
  Name:     !form.Name.trim()                             ? "Full name is required"            : "",
  Email:    !form.Email.trim()                            ? "Email is required"
          : !emailRegex.test(form.Email)                  ? "Enter a valid email address"       : "",
  Password: !editId && !form.Password                     ? "Password is required"
          : form.Password && form.Password.length < 6     ? "At least 6 characters required"    : "",
});

const emptyForm = { Name: "", Email: "", Password: "", Contact_No: "", Shift_Timing: "", Assigned_Gate: "" };

const Guards = () => {
  const [guards, setGuards]         = useState([]);
  const [search, setSearch] = useState("");
  const [shift, setShift] = useState("");
  const [gate, setGate] = useState("");
  const [page, setPage] = useState(1);
  const [loadError, setLoadError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const pageSize = 10;
  const shifts = [...new Set(guards.map(guard => guard.Shift_Timing).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const gates = [...new Set(guards.map(guard => guard.Assigned_Gate).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const query = search.trim().toLowerCase();
  const filtered = guards.filter(guard => (!shift || guard.Shift_Timing === shift) && (!gate || guard.Assigned_Gate === gate) && [guard.Name, guard.Email].some(value => (value || "").toLowerCase().includes(query)));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const [open, setOpen]             = useState(false);
  const [editId, setEditId]         = useState(null);
  const [form, setForm]             = useState(emptyForm);
  const [touched, setTouched]       = useState({});
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess]       = useState("");
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading]       = useState(true);

  const load = async () => {
    try { setLoadError(""); const { data } = await api.get("/guards"); setGuards(data); }
    catch (e) { setLoadError(e.response?.data?.message || "Unable to load guards. Please try again."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const errors  = validate(form, editId);
  const isValid = !errors.Name && !errors.Email && !errors.Password;

  const field = (key) => ({
    error:      !!touched[key] && !!errors[key],
    helperText: touched[key] && errors[key] ? errors[key] : " ",
    onBlur:     () => setTouched((t) => ({ ...t, [key]: true })),
  });

  const handleOpen = (g = null) => {
    setEditId(g?._id || null);
    setForm(g
      ? { Name: g.Name, Email: g.Email, Password: "", Contact_No: g.Contact_No || "", Shift_Timing: g.Shift_Timing || "", Assigned_Gate: g.Assigned_Gate || "" }
      : emptyForm);
    setTouched({}); setSubmitError(""); setOpen(true);
  };

  const handleSave = async () => {
    setTouched({ Name: true, Email: true, Password: true });
    if (!isValid || saving) return;
    setSaving(true); setSubmitError("");
    try {
      const payload = { ...form };
      if (!payload.Password) delete payload.Password;
      if (editId) await api.put(`/guards/${editId}`, payload);
      else await api.post("/guards", payload);
      setSuccess("Guard saved successfully!"); setOpen(false); load();
    } catch (e) { setSubmitError(e.response?.data?.message || "Error saving guard"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true); setDeleteError("");
    try {
      await api.delete(`/guards/${deleteTarget.id}`);
      setSuccess(`${deleteTarget.name} has been removed.`); setDeleteTarget(null); load();
    } catch (e) { setDeleteError(e.response?.data?.message || "Unable to delete this guard. Please try again."); }
    finally { setDeleting(false); }
  };

  return (
    <div className="hs-guard-management">
      <div className="hs-page-heading hs-members-heading hs-guard-heading"><div><h1>Security Guard Management</h1><p>Manage guard accounts, shifts, and gate assignments.</p></div><button className="hs-resident-add" onClick={() => handleOpen()}><AddIcon/>Add guard</button></div>
      {success && <Toast severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Toast>}
      {loadError && <Toast severity="error" sx={{ mb: 2 }} action={<Button color="inherit" onClick={() => { setLoading(true); load(); }}>Retry</Button>}>{loadError}</Toast>}
      <section className="hs-panel hs-residents-panel hs-guard-panel" aria-label="Security guard directory" aria-busy={loading}>
        <div className="hs-guard-toolbar"><div className="hs-guard-toolbar-heading"><h2>All guards <span>{guards.length}</span></h2></div><div className="hs-residents-filters hs-guard-filters"><label className="hs-resident-search"><SearchRounded/><input type="search" aria-label="Search guards by name or email" placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/></label><div className="hs-guard-selects">
          <div className="hs-resident-filter"><FilterAltOutlined/><select aria-label="Filter guards by shift" value={shift} onChange={e => { setShift(e.target.value); setPage(1); }}><option value="">All shifts</option>{shifts.map(value => <option key={value} value={value}>{value}</option>)}</select><KeyboardArrowDownRounded/></div>
          <div className="hs-resident-filter hs-guard-gate-filter"><CalendarTodayOutlined/><select aria-label="Filter guards by assigned gate" value={gate} onChange={e => { setGate(e.target.value); setPage(1); }}><option value="">All gates</option>{gates.map(value => <option key={value} value={value}>{value}</option>)}</select><KeyboardArrowDownRounded/></div>
        </div></div></div>
        <div className="hs-residents-table-wrap"><table className="hs-residents-table hs-guard-table"><thead><tr>{["Name", "Email", "Contact", "Shift timing", "Assigned gate", "Actions"].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>
          {loading ? <tr><td colSpan={6}><div className="hs-residents-loading" role="status"><CircularProgress size={26}/>Loading guards...</div></td></tr> : visible.map(guard => <tr key={guard._id}><td><div className="hs-resident-person"><span className="hs-resident-avatar" aria-hidden="true">{initials(guard.Name)}</span><strong>{guard.Name}</strong></div></td><td>{guard.Email || "—"}</td><td>{guard.Contact_No || "—"}</td><td><GuardShift value={guard.Shift_Timing}/></td><td>{guard.Assigned_Gate ? <span className="hs-guard-gate"><MeetingRoomOutlined/>{guard.Assigned_Gate}</span> : "—"}</td><td><div className="hs-resident-actions"><button className="hs-resident-edit" title="Edit guard" aria-label={`Edit ${guard.Name}`} onClick={() => handleOpen(guard)}><EditOutlined/></button><button className="hs-resident-delete" title="Delete guard" aria-label={`Delete ${guard.Name}`} onClick={() => { setDeleteError(""); setDeleteTarget({ id: guard._id, name: guard.Name }); }}><DeleteOutlineRounded/></button></div></td></tr>)}
          {!loading && !visible.length && <tr><td colSpan={6} className="hs-empty">{loadError ? "Guard data unavailable" : guards.length ? "No guards match your search or filters." : "No guards yet. Add a guard to get started."}</td></tr>}
        </tbody></table></div>
        <div className="hs-residents-pagination"><span aria-live="polite">Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} guards</span><div><button disabled={loading || currentPage <= 1} onClick={() => setPage(currentPage - 1)}><ChevronLeftRounded/>Previous</button><button disabled={loading || currentPage * pageSize >= filtered.length} onClick={() => setPage(currentPage + 1)}>Next<ChevronRightRounded/></button></div></div>
      </section>

      {/* ── Add / Edit Dialog ── */}
      <AdminDialog busy={saving} open={open} onClose={() => { if (!saving) setOpen(false); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<SecurityIcon />} title={editId ? "Edit Guard" : "Add Security Guard"}
          subtitle={editId ? "Update guard details below" : "Enter the guard information"} />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          {submitError && <Toast severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSubmitError("")}>{submitError}</Toast>}
          <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2} mb={1}>
            <TextField fullWidth label="Full Name" required value={form.Name}
              onChange={(e) => setForm({ ...form, Name: e.target.value })} {...field("Name")} />
            <TextField fullWidth label="Email Address" type="email" required value={form.Email}
              onChange={(e) => setForm({ ...form, Email: e.target.value })} {...field("Email")} />
          </Box>
          <TextField fullWidth label={editId ? "New Password (leave blank to keep current)" : "Password"}
            type="password" required={!editId} value={form.Password}
            onChange={(e) => setForm({ ...form, Password: e.target.value })} {...field("Password")} />
          <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2} mb={1}>
            <TextField fullWidth label="Contact Number" value={form.Contact_No}
              onChange={(e) => setForm({ ...form, Contact_No: e.target.value })} helperText=" " />
            <TextField fullWidth label="Shift Timing" value={form.Shift_Timing}
              onChange={(e) => setForm({ ...form, Shift_Timing: e.target.value })} helperText=" " />
          </Box>
          <TextField fullWidth label="Assigned Gate" value={form.Assigned_Gate}
            onChange={(e) => setForm({ ...form, Assigned_Gate: e.target.value })} helperText=" " />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button disabled={saving} onClick={() => setOpen(false)} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!isValid || saving}
            sx={{ bgcolor: "#0854ed", borderRadius: 2, px: 3, minWidth: 120, "&:disabled": { bgcolor: "#c5cae9", color: "#fff" } }}>
            {saving ? <CircularProgress size={18} color="inherit" /> : (editId ? "Save Changes" : "Add Guard")}
          </Button>
        </DialogActions>
      </AdminDialog>

      {/* ── Delete Dialog ── */}
      <AdminDeleteDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} busy={deleting} title="Delete Guard?" name={deleteTarget?.name}>
        {deleteError && <Toast severity="error">{deleteError}</Toast>}
      </AdminDeleteDialog>
    </div>
  );
};

export default Guards;
