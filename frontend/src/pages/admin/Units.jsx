import AdminDialog, { AdminDialogHeader as ModalHeader } from "../../components/common/AdminDialog";
import Toast from "../../components/common/Toast";
import { useEffect, useState } from "react";
import {
  Box, Typography, Button, DialogContent,
  DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, CircularProgress, Divider
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlined from "@mui/icons-material/EditOutlined";
import PersonAddAltOutlined from "@mui/icons-material/PersonAddAltOutlined";
import ApartmentIcon from "@mui/icons-material/Apartment";
import PeopleIcon from "@mui/icons-material/People";
import api from "../../api/axios";
import SearchRounded from "@mui/icons-material/SearchRounded";
import FilterAltOutlined from "@mui/icons-material/FilterAltOutlined";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import "./Units.css";


const Units = () => {
  const [units, setUnits]       = useState([]);
  const [search, setSearch] = useState("");
  const [block, setBlock] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loadError, setLoadError] = useState("");
  const [assignError, setAssignError] = useState("");
  const pageSize = 10;
  const blocks = [...new Set(units.map(u => u.Block).filter(Boolean))].sort((a,b) => a.localeCompare(b, undefined, {numeric:true}));
  const filtered = units.filter(u => {
    const query = search.trim().toLowerCase();
    return (String(u.Unit_Number || "").toLowerCase().includes(query) || (u.resident?.Name || "").toLowerCase().includes(query)) && (!block || u.Block === block) && (!status || u.Status === status);
  });
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const visibleUnits = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const occupiedCount = units.filter(u => u.Status === "Occupied").length;
  const vacantCount = units.filter(u => u.Status === "Vacant").length;
  const openUnit = (unit = null) => {
    setEditId(unit?._id || null);
    setForm(unit ? {Unit_Number:unit.Unit_Number, Floor:unit.Floor ?? "", Block:unit.Block ?? "", Square_Footage:unit.Square_Footage ?? ""} : {Unit_Number:"",Floor:"",Block:"",Square_Footage:""});
    setError("");setOpen(true);
  };
  const openAssignment = unit => {
    setAssignUnitId(unit._id);
    setAssignForm({residentId:unit.resident?._id || "",role:unit.residentRole || "Owner"});
    setAssignError("");setAssignOpen(true);
  };
  const [residents, setResidents] = useState([]);
  const [open, setOpen]         = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [assignUnitId, setAssignUnitId] = useState(null);
  const [form, setForm]         = useState({ Unit_Number: "", Floor: "", Block: "", Square_Footage: "" });
  const [assignForm, setAssignForm] = useState({ residentId: "", role: "Owner" });
  const [success, setSuccess]   = useState("");
  const [error, setError]       = useState("");
  const [saving, setSaving]     = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [loading, setLoading]     = useState(true);

  const load = async () => {
    try {
      setLoadError("");
      const [u, r] = await Promise.all([api.get("/units"), api.get("/residents")]);
      setUnits(u.data); setResidents(r.data);
    } catch (e) { setLoadError(e.response?.data?.message || "Unable to load units and residents. Please try again."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      if (editId) await api.put(`/units/${editId}`, form);
      else await api.post("/units", form);
      setSuccess("Unit saved successfully!"); setOpen(false); load();
    } catch (e) { setError(e.response?.data?.message || "Error saving unit"); }
    finally { setSaving(false); }
  };

  const handleAssign = async () => {
    setAssigning(true); setAssignError("");
    try {
      await api.post(`/units/${assignUnitId}/assign`, { ...assignForm, residentId: assignForm.residentId || null });
      setSuccess(assignForm.residentId ? "Resident assigned successfully!" : "Unit vacated successfully!"); setAssignOpen(false); load();
    } catch (e) { setAssignError(e.response?.data?.message || "Unable to update resident assignment."); }
    finally { setAssigning(false); }
  };

  return (
    <div className="hs-units">
      <div className="hs-page-heading hs-units-heading"><div><h1>Units</h1><p>Manage housing units, occupancy, and resident assignments.</p></div><button className="hs-unit-add" onClick={() => openUnit()}><AddIcon/>Add unit</button></div>
      {success && <Toast severity="success" sx={{mb:2}} onClose={() => setSuccess("")}>{success}</Toast>}
      {loadError && <Toast severity="error" sx={{mb:2}} action={<Button color="inherit" onClick={() => {setLoading(true);load();}}>Retry</Button>}>{loadError}</Toast>}
      <section className="hs-panel hs-units-panel" aria-label="Unit directory" aria-busy={loading}>
        <div className="hs-units-toolbar"><div className="hs-units-summary"><h2>All units <span>{units.length}</span></h2><p>{occupiedCount} occupied <span>·</span> {vacantCount} vacant</p></div>
          <div className="hs-units-filters"><label className="hs-unit-search"><SearchRounded/><input type="search" aria-label="Search unit or resident" placeholder="Search unit or resident..." value={search} onChange={e => {setSearch(e.target.value);setPage(1);}}/></label><div className="hs-unit-selects"><div className="hs-unit-filter"><ApartmentIcon/><select aria-label="Filter by block" value={block} onChange={e => {setBlock(e.target.value);setPage(1);}}><option value="">All blocks</option>{blocks.map(b => <option key={b} value={b}>Block {b}</option>)}</select><KeyboardArrowDownRounded/></div><div className="hs-unit-filter"><FilterAltOutlined/><select aria-label="Filter by status" value={status} onChange={e => {setStatus(e.target.value);setPage(1);}}><option value="">All statuses</option><option value="Occupied">Occupied</option><option value="Vacant">Vacant</option></select><KeyboardArrowDownRounded/></div></div></div>
        </div>
        <div className="hs-units-table-wrap"><table className="hs-units-table"><thead><tr>{["Unit no.","Floor","Block","Area","Status","Resident","Role","Actions"].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>
          {loading ? <tr><td colSpan={8}><div className="hs-units-loading" role="status"><CircularProgress size={26}/>Loading units…</div></td></tr> : visibleUnits.map(u => <tr key={u._id}><td><strong>{u.Unit_Number}</strong></td><td>{u.Floor ?? "—"}</td><td>{u.Block || "—"}</td><td>{u.Square_Footage != null ? `${Number(u.Square_Footage).toLocaleString("en-US")} sq ft` : "—"}</td><td><span className={`hs-unit-status ${u.Status === "Occupied" ? "occupied" : "vacant"}`}><i/>{u.Status}</span></td><td>{u.resident?.Name || "—"}</td><td>{u.Status === "Occupied" ? u.residentRole || "—" : "—"}</td><td><div className="hs-unit-actions"><button title="Edit unit" aria-label={`Edit unit ${u.Unit_Number}`} onClick={() => openUnit(u)}><EditOutlined/></button><button title="Assign resident" aria-label={`Assign resident to unit ${u.Unit_Number}`} className="hs-unit-assign" onClick={() => openAssignment(u)}><PersonAddAltOutlined/></button></div></td></tr>)}
          {!loading && !visibleUnits.length && <tr><td colSpan={8} className="hs-empty">{loadError ? "Unit data unavailable" : units.length ? "No units match your search or filters." : "No units yet. Add a unit to get started."}</td></tr>}
        </tbody></table></div>
        <div className="hs-units-footer"><span aria-live="polite">Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize,filtered.length)} of {filtered.length} units</span><div className="hs-unit-legend"><span><EditOutlined/>Edit</span><span><PersonAddAltOutlined/>Assign resident</span></div><div className="hs-units-pagination"><button disabled={loading || currentPage <= 1} onClick={() => setPage(currentPage - 1)}><ChevronLeftRounded/>Previous</button><button disabled={loading || currentPage * pageSize >= filtered.length} onClick={() => setPage(currentPage + 1)}>Next<ChevronRightRounded/></button></div></div>
      </section>

      {/* ── Add / Edit Unit Dialog ── */}
      <AdminDialog busy={saving} open={open} onClose={() => {if (!saving) setOpen(false);}} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<ApartmentIcon />} title={editId ? "Edit Unit" : "Add New Unit"} subtitle={editId ? "Update unit details below" : "Enter the unit information"} />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          {error && <Toast severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError("")}>{error}</Toast>}
          <Box display="flex" flexDirection={{xs:"column",sm:"row"}} gap={2} mb={1}>
            <TextField fullWidth label="Unit Number" required value={form.Unit_Number} onChange={(e) => setForm({ ...form, Unit_Number: e.target.value })} helperText=" " />
            <TextField fullWidth label="Floor" value={form.Floor} onChange={(e) => setForm({ ...form, Floor: e.target.value })} helperText=" " />
          </Box>
          <Box display="flex" flexDirection={{xs:"column",sm:"row"}} gap={2} mb={1}>
            <TextField fullWidth label="Block" value={form.Block} onChange={(e) => setForm({ ...form, Block: e.target.value })} helperText=" " />
            <TextField fullWidth label="Square Footage" type="number" value={form.Square_Footage} onChange={(e) => setForm({ ...form, Square_Footage: e.target.value })} helperText=" " />
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button disabled={saving} onClick={() => setOpen(false)} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.Unit_Number.trim() || saving}
            sx={{ bgcolor: "#0854ed", borderRadius: 2, px: 3, minWidth: 110, "&:disabled": { bgcolor: "#c5cae9", color: "#fff" } }}>
            {saving ? <CircularProgress size={18} color="inherit" /> : (editId ? "Save Changes" : "Add Unit")}
          </Button>
        </DialogActions>
      </AdminDialog>

      {/* ── Assign Resident Dialog ── */}
      <AdminDialog busy={assigning} open={assignOpen} onClose={() => {if (!assigning) setAssignOpen(false);}} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<PeopleIcon />} title="Assign Resident to Unit" subtitle="Select a resident and their role for this unit" />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          {assignError && <Toast severity="error" sx={{mb:2}}>{assignError}</Toast>}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Resident</InputLabel>
            <Select value={assignForm.residentId} label="Resident" onChange={(e) => setAssignForm({ ...assignForm, residentId: e.target.value })}>
              <MenuItem value=""><em>— Vacate Unit —</em></MenuItem>
              {residents.map((r) => <MenuItem key={r._id} value={r._id}>{r.Name} ({r.Email})</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select value={assignForm.role} label="Role" onChange={(e) => setAssignForm({ ...assignForm, role: e.target.value })}>
              <MenuItem value="Owner">Owner</MenuItem>
              <MenuItem value="Tenant">Tenant</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <Divider sx={{ mt: 2 }} />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button disabled={assigning} onClick={() => setAssignOpen(false)} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleAssign} disabled={assigning}
            sx={{ bgcolor: "#2e7d32", borderRadius: 2, px: 3, minWidth: 110 }}>
            {assigning ? <CircularProgress size={18} color="inherit" /> : "Assign"}
          </Button>
        </DialogActions>
      </AdminDialog>
    </div>
  );
};

export default Units;
