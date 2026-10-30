import AdminDialog, { AdminDialogHeader as ModalHeader, AdminDeleteDialog } from "../../components/common/AdminDialog";
import Toast from "../../components/common/Toast";
import { useEffect, useState } from "react";
import {
  Box, Typography, Button, DialogContent,
  DialogActions, TextField, Switch, Divider, InputAdornment, Avatar
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PhoneIcon from "@mui/icons-material/Phone";
import CircularProgress from "@mui/material/CircularProgress";
import api from "../../api/axios";
import SearchRounded from "@mui/icons-material/SearchRounded";
import FilterAltOutlined from "@mui/icons-material/FilterAltOutlined";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import "./Members.css";

/* ── Validation ──────────────────────────────────────────────────────── */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (form, editId) => ({
  Name:     !form.Name.trim()                    ? "Full name is required"          : "",
  Email:    !form.Email.trim()                   ? "Email is required"
          : !emailRegex.test(form.Email)         ? "Enter a valid email address"    : "",
  Password: !editId && !form.Password            ? "Password is required"
          : form.Password && form.Password.length < 6 ? "Password must be at least 6 characters" : "",
});

const emptyForm = { Name: "", Email: "", Password: "", Contact_No: "", Emergency_Contact: "", Is_Owner: true };

/* ═══════════════════════════════════════════════════════════════════════ */
const Members = () => {
  const [residents, setResidents] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [loadError, setLoadError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const pageSize = 10;
  const filtered = residents.filter(r => {
    const query = search.trim().toLowerCase();
    return ((r.Name || "").toLowerCase().includes(query) || (r.Email || "").toLowerCase().includes(query)) && (type === "all" || (type === "owner" ? r.Is_Owner : !r.Is_Owner));
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleResidents = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const [open, setOpen]           = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [touched, setTouched]     = useState({});
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess]     = useState("");

  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
  const [loading, setLoading]           = useState(true);

  const load = async () => {
    try {
      setLoadError("");
      const { data } = await api.get("/residents");
      setResidents(data);
    } catch (e) {
      setLoadError(e.response?.data?.message || "Unable to load residents. Please try again.");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  /* ── Field helpers ── */
  const errors  = validate(form, editId);
  const isValid = !errors.Name && !errors.Email && !errors.Password;

  const field = (key) => ({
    error:    !!touched[key] && !!errors[key],
    helperText: touched[key] && errors[key] ? errors[key] : " ",
    onBlur:   () => setTouched((t) => ({ ...t, [key]: true })),
  });

  /* ── Open add / edit ── */
  const handleOpen = (r = null) => {
    setEditId(r?._id || null);
    setForm(r
      ? { Name: r.Name, Email: r.Email, Password: "", Contact_No: r.Contact_No || "", Emergency_Contact: r.Emergency_Contact || "", Is_Owner: r.Is_Owner }
      : emptyForm
    );
    setTouched({});
    setSubmitError("");
    setOpen(true);
  };

  /* ── Save ── */
  const handleSave = async () => {
    setTouched({ Name: true, Email: true, Password: true });
    if (!isValid) return;
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.Password) delete payload.Password;
      if (editId) await api.put(`/residents/${editId}`, payload);
      else        await api.post("/residents", payload);
      setSuccess(editId ? "Resident updated successfully!" : "Resident added successfully!");
      setOpen(false);
      load();
    } catch (e) {
      setSubmitError(e.response?.data?.message || "Something went wrong. Please try again.");
    } finally { setSaving(false); }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await api.delete(`/residents/${deleteTarget.id}`);
      setSuccess(`${deleteTarget.name} has been removed.`);
      setDeleteTarget(null);
      load();
    } catch (e) { setDeleteError(e.response?.data?.message || "Unable to delete resident. Please try again."); }
    finally { setDeleting(false); }
  };

  /* ─────────────────────────────────────────────────────────────────── */
  return (
    <div className="hs-members">
      <div className="hs-page-heading hs-members-heading">
        <div><h1>Residents</h1><p>Manage resident profiles and household records.</p></div>
        <button className="hs-resident-add" onClick={() => handleOpen()}><AddIcon/>Add resident</button>
      </div>
      {success && <Toast severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Toast>}
      {loadError && <Toast severity="error" sx={{ mb: 2 }} action={<Button color="inherit" onClick={() => {setLoading(true);load();}}>Retry</Button>}>{loadError}</Toast>}
      <section className="hs-panel hs-residents-panel" aria-label="Resident directory" aria-busy={loading}>
        <div className="hs-residents-toolbar">
          <h2>All residents <span className="hs-residents-count">{residents.length}</span></h2>
          <div className="hs-residents-filters">
            <label className="hs-resident-search"><SearchRounded/><input type="search" aria-label="Search residents by name or email" placeholder="Search by name or email..." value={search} onChange={e => {setSearch(e.target.value);setPage(1);}}/></label>
            <div className="hs-resident-filter"><FilterAltOutlined/><select aria-label="Filter residents by type" value={type} onChange={e => {setType(e.target.value);setPage(1);}}><option value="all">All types</option><option value="owner">Owners</option><option value="tenant">Tenants</option></select><KeyboardArrowDownRounded/></div>
          </div>
        </div>
        <div className="hs-residents-table-wrap"><table className="hs-residents-table"><thead><tr>{["Name", "Email", "Contact", "Type", "Emergency contact", "Actions"].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead>
          <tbody>{loading ? <tr><td colSpan={6}><div className="hs-residents-loading" role="status"><CircularProgress size={26}/>Loading residents…</div></td></tr> : visibleResidents.map(r => <tr key={r._id}>
            <td><div className="hs-resident-person"><span className="hs-resident-avatar">{(r.Name || "?").charAt(0).toUpperCase()}</span><strong>{r.Name}</strong></div></td>
            <td>{r.Email}</td><td>{r.Contact_No || "—"}</td><td><span className={`hs-resident-type ${r.Is_Owner ? "owner" : "tenant"}`}>{r.Is_Owner ? "Owner" : "Tenant"}</span></td><td>{r.Emergency_Contact || "—"}</td>
            <td><div className="hs-resident-actions"><button className="hs-resident-edit" title="Edit resident" aria-label={`Edit ${r.Name}`} onClick={() => handleOpen(r)}><EditOutlined/></button><button className="hs-resident-delete" title="Delete resident" aria-label={`Delete ${r.Name}`} onClick={() => {setDeleteError("");setDeleteTarget({id:r._id,name:r.Name});}}><DeleteOutlineRounded/></button></div></td>
          </tr>)}{!loading && !visibleResidents.length && <tr><td colSpan={6} className="hs-empty">{loadError ? "Resident data unavailable" : residents.length ? "No residents match your search or filter." : "No residents yet. Add a resident to get started."}</td></tr>}</tbody>
        </table></div>
        <div className="hs-residents-pagination"><span aria-live="polite">Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} residents</span><div><button disabled={loading || currentPage <= 1} onClick={() => setPage(currentPage - 1)}><ChevronLeftRounded/>Previous</button><button disabled={loading || currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}>Next<ChevronRightRounded/></button></div></div>
      </section>

      {/* ── Add / Edit Dialog ── */}
      <AdminDialog busy={saving} open={open} onClose={() => {if (!saving) setOpen(false);}} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>

        <ModalHeader icon={<PersonIcon/>} title={editId ? "Edit Resident" : "Add New Resident"} subtitle={editId ? "Update resident information below" : "Fill in the details to register a new resident"}/>

        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          {submitError && (
            <Toast severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSubmitError("")}>
              {submitError}
            </Toast>
          )}

          {/* Name + Email row */}
          <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2} mb={1}>
            <TextField
              fullWidth
              label="Full Name"
              required
              value={form.Name}
              onChange={(e) => setForm({ ...form, Name: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ fontSize: 18, color: "#aaa" }} /></InputAdornment> }}
              {...field("Name")}
            />
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              required
              value={form.Email}
              onChange={(e) => setForm({ ...form, Email: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ fontSize: 18, color: "#aaa" }} /></InputAdornment> }}
              {...field("Email")}
            />
          </Box>

          {/* Password */}
          <TextField
            fullWidth
            label={editId ? "New Password (leave blank to keep current)" : "Password"}
            type="password"
            required={!editId}
            value={form.Password}
            onChange={(e) => setForm({ ...form, Password: e.target.value })}
            InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon sx={{ fontSize: 18, color: "#aaa" }} /></InputAdornment> }}
            sx={{ mt: 1 }}
            {...field("Password")}
          />

          {/* Contact + Emergency */}
          <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2} mt={1} mb={1}>
            <TextField
              fullWidth
              label="Contact Number"
              value={form.Contact_No}
              onChange={(e) => setForm({ ...form, Contact_No: e.target.value })}
              helperText=" "
              InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ fontSize: 18, color: "#aaa" }} /></InputAdornment> }}
            />
            <TextField
              fullWidth
              label="Emergency Contact"
              value={form.Emergency_Contact}
              onChange={(e) => setForm({ ...form, Emergency_Contact: e.target.value })}
              helperText=" "
              InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ fontSize: 18, color: "#aaa" }} /></InputAdornment> }}
            />
          </Box>

          {/* Owner toggle */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: form.Is_Owner ? "#e8eaf6" : "#f5f5f5",
              border: `1px solid ${form.Is_Owner ? "#9fa8da" : "#e0e0e0"}`,
              borderRadius: 2,
              px: 2,
              py: 1.2,
              mb: 1,
            }}
          >
            <Box>
              <Typography variant="body2" fontWeight={600}>{form.Is_Owner ? "Owner" : "Tenant"}</Typography>
              <Typography variant="caption" color="text.secondary">
                {form.Is_Owner ? "This resident owns the unit" : "This resident rents the unit"}
              </Typography>
            </Box>
            <Switch
              checked={form.Is_Owner}
              onChange={(e) => setForm({ ...form, Is_Owner: e.target.checked })}
              sx={{ "& .MuiSwitch-thumb": { bgcolor: form.Is_Owner ? "#0854ed" : "#bbb" } }}
            />
          </Box>
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button disabled={saving} onClick={() => setOpen(false)} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!isValid || saving}
            sx={{ bgcolor: "#0854ed", borderRadius: 2, px: 3, minWidth: 130, "&:disabled": { bgcolor: "#c5cae9", color: "#fff" } }}
          >
            {saving ? <CircularProgress size={18} color="inherit" /> : (editId ? "Save Changes" : "Add Resident")}
          </Button>
        </DialogActions>
      </AdminDialog>

      {/* ── Delete Confirmation Dialog ── */}
      <AdminDeleteDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} busy={deleting} title="Delete Resident?" name={deleteTarget?.name} description="This action cannot be undone. The resident account will be removed.">
        {deleteError && <Toast severity="error">{deleteError}</Toast>}
      </AdminDeleteDialog>
    </div>
  );
};

export default Members;
