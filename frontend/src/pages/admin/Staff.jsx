import AdminDialog, { AdminDialogHeader as ModalHeader, AdminDeleteDialog } from "../../components/common/AdminDialog";
import Toast from "../../components/common/Toast";
import { useEffect, useState } from "react";
import {
  Box, Typography, Button, DialogContent,
  DialogActions, TextField, Rating, Divider, CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import KeyIcon from "@mui/icons-material/Key";
import BadgeIcon from "@mui/icons-material/Badge";
import api from "../../api/axios";
import SearchRounded from "@mui/icons-material/SearchRounded";
import FilterAltOutlined from "@mui/icons-material/FilterAltOutlined";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import "./Members.css";
import "./Staff.css";

const initials = name => (name || "?").trim().split(/\s+/).slice(0,2).map(part => part.charAt(0)).join("").toUpperCase();
const ratingValue = value => Math.min(5, Math.max(0, Number(value) || 0));


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (form, editId) => ({
  Name:     !form.Name.trim()                          ? "Full name is required"          : "",
  Email:    !form.Email.trim()                         ? "Email is required"
          : !emailRegex.test(form.Email)               ? "Enter a valid email address"    : "",
  Type:     !form.Type.trim()                          ? "Staff type is required"          : "",
  Password: !editId && !form.Password                  ? "Password is required"
          : form.Password && form.Password.length < 6  ? "At least 6 characters required" : "",
});

const Staff = () => {
  const [staff, setStaff]               = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [loadError, setLoadError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const pageSize = 10;
  const types = [...new Set(staff.map(s => s.Type).filter(Boolean))].sort((a,b) => a.localeCompare(b));
  const filtered = staff.filter(s => {
    const query = search.trim().toLowerCase();
    return ((s.Name || "").toLowerCase().includes(query) || (s.Email || "").toLowerCase().includes(query)) && (!type || s.Type === type);
  });
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const visibleStaff = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const [open, setOpen]                 = useState(false);
  const [editId, setEditId]             = useState(null);
  const [form, setForm]                 = useState({ Name: "", Email: "", Password: "", Type: "", Aadhar_CNIC_No: "", Rating: 0 });
  const [touched, setTouched]           = useState({});
  const [submitError, setSubmitError]   = useState("");
  const [success, setSuccess]           = useState("");
  const [saving, setSaving]             = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading]           = useState(true);

  const load = async () => {
    try { setLoadError(""); const { data } = await api.get("/staff"); setStaff(data); }
    catch (e) {setLoadError(e.response?.data?.message || "Unable to load staff and vendors. Please try again.");}
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const errors  = validate(form, editId);
  const isValid = !errors.Name && !errors.Email && !errors.Type && !errors.Password;

  const field = (key) => ({
    error:      !!touched[key] && !!errors[key],
    helperText: touched[key] && errors[key] ? errors[key] : " ",
    onBlur:     () => setTouched((t) => ({ ...t, [key]: true })),
  });

  const openAdd = () => {
    setEditId(null);
    setForm({ Name: "", Email: "", Password: "", Type: "", Aadhar_CNIC_No: "", Rating: 0 });
    setTouched({}); setSubmitError(""); setOpen(true);
  };

  const openEdit = (s) => {
    setEditId(s._id);
    setForm({ Name: s.Name, Email: s.Email || "", Password: "", Type: s.Type, Aadhar_CNIC_No: s.Aadhar_CNIC_No || "", Rating: s.Rating || 0 });
    setTouched({}); setSubmitError(""); setOpen(true);
  };

  const handleSave = async () => {
    setTouched({ Name: true, Email: true, Type: true, Password: true });
    if (!isValid) return;
    setSaving(true); setSubmitError("");
    try {
      if (editId) {
        const payload = { ...form };
        if (!payload.Password) delete payload.Password;
        await api.put(`/staff/${editId}`, payload);
      } else {
        await api.post("/staff", form);
      }
      setSuccess("Staff saved!"); setOpen(false); load();
    } catch (e) { setSubmitError(e.response?.data?.message || "Error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true); setDeleteError("");
    try {
      await api.delete(`/staff/${deleteTarget.id}`);
      setSuccess(`${deleteTarget.name} has been removed.`); setDeleteTarget(null); load();
    } catch (e) {setDeleteError(e.response?.data?.message || "Unable to delete this record. Please try again.");}
    finally { setDeleting(false); }
  };

  return (
    <div className="hs-staff">
      <div className="hs-page-heading hs-members-heading hs-staff-heading"><div><h1>Staff &amp; Vendor Management</h1><p>Manage staff, vendors, and access details.</p></div><button className="hs-resident-add" onClick={openAdd}><AddIcon/>Add staff/vendor</button></div>
      {success && <Toast severity="success" sx={{mb:2}} onClose={() => setSuccess("")}>{success}</Toast>}
      {loadError && <Toast severity="error" sx={{mb:2}} action={<Button color="inherit" onClick={() => {setLoading(true);load();}}>Retry</Button>}>{loadError}</Toast>}
      <section className="hs-panel hs-residents-panel hs-staff-panel" aria-label="Staff and vendor directory" aria-busy={loading}>
        <div className="hs-residents-toolbar"><h2>All staff &amp; vendors <span className="hs-residents-count">{staff.length}</span></h2><div className="hs-residents-filters"><label className="hs-resident-search"><SearchRounded/><input type="search" aria-label="Search staff and vendors by name or email" placeholder="Search by name or email..." value={search} onChange={e => {setSearch(e.target.value);setPage(1);}}/></label><div className="hs-resident-filter"><FilterAltOutlined/><select aria-label="Filter staff and vendors by type" value={type} onChange={e => {setType(e.target.value);setPage(1);}}><option value="">All types</option>{types.map(t => <option key={t} value={t}>{t}</option>)}</select><KeyboardArrowDownRounded/></div></div></div>
        <div className="hs-residents-table-wrap"><table className="hs-residents-table hs-staff-table"><thead><tr>{["Name","Type","Email","CNIC","Entry code","Rating","Actions"].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{loading ? <tr><td colSpan={7}><div className="hs-residents-loading" role="status"><CircularProgress size={26}/>Loading staff and vendors...</div></td></tr> : visibleStaff.map(s => <tr key={s._id}><td><div className="hs-resident-person"><span className="hs-resident-avatar">{initials(s.Name)}</span><strong>{s.Name}</strong></div></td><td><span className="hs-staff-type">{s.Type}</span></td><td>{s.Email || "—"}</td><td>{s.Aadhar_CNIC_No || "—"}</td><td>{s.Entry_Code ? <span className="hs-staff-code"><KeyIcon/>{s.Entry_Code}</span> : "—"}</td><td><div className="hs-staff-rating"><Rating value={ratingValue(s.Rating)} precision={0.1} readOnly size="small"/><span>{ratingValue(s.Rating).toFixed(1)}</span></div></td><td><div className="hs-resident-actions"><button className="hs-resident-edit" title="Edit staff/vendor" aria-label={`Edit ${s.Name}`} onClick={() => openEdit(s)}><EditOutlined/></button><button className="hs-resident-delete" title="Delete staff/vendor" aria-label={`Delete ${s.Name}`} onClick={() => {setDeleteError("");setDeleteTarget({id:s._id,name:s.Name});}}><DeleteOutlineRounded/></button></div></td></tr>)}{!loading && !visibleStaff.length && <tr><td colSpan={7} className="hs-empty">{loadError ? "Staff and vendor data unavailable" : staff.length ? "No records match your search or filter." : "No staff or vendors yet. Add a record to get started."}</td></tr>}</tbody></table></div>
        <div className="hs-residents-pagination"><span aria-live="polite">Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize,filtered.length)} of {filtered.length} records</span><div><button disabled={loading || currentPage <= 1} onClick={() => setPage(currentPage - 1)}><ChevronLeftRounded/>Previous</button><button disabled={loading || currentPage * pageSize >= filtered.length} onClick={() => setPage(currentPage + 1)}>Next<ChevronRightRounded/></button></div></div>
      </section>

      {/* ── Add / Edit Dialog ── */}
      <AdminDialog busy={saving} open={open} onClose={() => {if (!saving) setOpen(false);}} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<BadgeIcon />} title={editId ? "Edit Staff/Vendor" : "Add Staff/Vendor"}
          subtitle={editId ? "Update staff member details" : "Enter the staff/vendor information"} />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          {submitError && <Toast severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSubmitError("")}>{submitError}</Toast>}
          <Box display="flex" flexDirection={{xs:"column",sm:"row"}} gap={2} mb={1}>
            <TextField fullWidth label="Full Name" required value={form.Name}
              onChange={(e) => setForm({ ...form, Name: e.target.value })} {...field("Name")} />
            <TextField fullWidth label="Email Address" type="email" required value={form.Email}
              onChange={(e) => setForm({ ...form, Email: e.target.value })} {...field("Email")} />
          </Box>
          {!editId && <TextField fullWidth label="Password" type="password" required value={form.Password}
            onChange={(e) => setForm({ ...form, Password: e.target.value })} {...field("Password")} />}
          <Box display="flex" flexDirection={{xs:"column",sm:"row"}} gap={2} mb={1}>
            <TextField fullWidth label="Type (e.g. Maid, Driver, Plumber)" required value={form.Type}
              onChange={(e) => setForm({ ...form, Type: e.target.value })} {...field("Type")} />
            <TextField fullWidth label="CNIC Number" value={form.Aadhar_CNIC_No}
              onChange={(e) => setForm({ ...form, Aadhar_CNIC_No: e.target.value })} helperText=" " />
          </Box>
          <Box mb={1}>
            <Typography variant="body2" mb={0.5}>Rating</Typography>
            <Rating value={form.Rating} onChange={(_, v) => setForm({ ...form, Rating: v ?? 0 })} />
          </Box>
          {!editId && (
            <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
              Entry Code will be auto-generated. Staff can log in using their Email + Password.
            </Typography>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button disabled={saving} onClick={() => setOpen(false)} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!isValid || saving}
            sx={{ bgcolor: "#0854ed", borderRadius: 2, px: 3, minWidth: 120, "&:disabled": { bgcolor: "#c5cae9", color: "#fff" } }}>
            {saving ? <CircularProgress size={18} color="inherit" /> : (editId ? "Save Changes" : "Add Staff")}
          </Button>
        </DialogActions>
      </AdminDialog>

      {/* ── Delete Dialog ── */}
      <AdminDeleteDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} busy={deleting} title="Delete Staff/Vendor?" name={deleteTarget?.name}>
        {deleteError && <Toast severity="error">{deleteError}</Toast>}
      </AdminDeleteDialog>
    </div>
  );
};

export default Staff;
