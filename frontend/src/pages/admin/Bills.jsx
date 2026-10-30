import AdminDialog, { AdminDialogHeader as ModalHeader } from "../../components/common/AdminDialog";
import Toast from "../../components/common/Toast";
import { useEffect, useState } from "react";
import {
  Box, Typography, Button, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, FormHelperText,
  Divider, CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import ReceiptIcon from "@mui/icons-material/Receipt";
import GroupsIcon from "@mui/icons-material/Groups";
import SearchRounded from "@mui/icons-material/SearchRounded";
import FilterAltOutlined from "@mui/icons-material/FilterAltOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import api from "../../api/axios";
import "./Members.css";
import "./Bills.css";

const money = value => `PKR ${Number(value || 0).toLocaleString("en-PK", { maximumFractionDigits: 2 })}`;
const dateLabel = value => {
  const date = new Date(value);
  return value && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("en-GB", { timeZone: "UTC" }) : "—";
};


const validateSingle = (form) => ({
  unit:     !form.unit                          ? "Please select a unit"            : "",
  Amount:   !form.Amount                        ? "Amount is required"
          : Number(form.Amount) <= 0            ? "Amount must be greater than 0"  : "",
  Due_Date: !form.Due_Date                      ? "Due date is required"            : "",
});

const validateGen = (form) => ({
  Amount:   !form.Amount                        ? "Amount is required"
          : Number(form.Amount) <= 0            ? "Amount must be greater than 0"  : "",
  Due_Date: !form.Due_Date                      ? "Due date is required"            : "",
});

const Bills = () => {
  const [bills, setBills]         = useState([]);
  const [units, setUnits]         = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [billType, setBillType] = useState("");
  const [dueOrder, setDueOrder] = useState("");
  const [page, setPage] = useState(1);
  const [loadError, setLoadError] = useState("");
  const [genError, setGenError] = useState("");
  const pageSize = 10;
  const paid = bills.filter(bill => bill.Status === "Paid");
  const unpaid = bills.filter(bill => bill.Status === "Unpaid");
  const totalAmount = records => records.reduce((sum, bill) => sum + (Number(bill.Amount) || 0), 0);
  const query = search.trim().toLowerCase();
  const filtered = bills.filter(bill =>
    (!status || bill.Status === status) && (!billType || bill.Bill_Type === billType) &&
    (String(bill.unit?.Unit_Number ?? "").toLowerCase().includes(query) ||
      (bill.unit?.resident?.Name || "").toLowerCase().includes(query))
  );
  if (dueOrder) filtered.sort((a, b) => (new Date(a.Due_Date) - new Date(b.Due_Date)) * (dueOrder === "earliest" ? 1 : -1));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const visibleBills = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  // Single bill
  const [open, setOpen]           = useState(false);
  const [form, setForm]           = useState({ unit: "", Amount: "", Due_Date: "", Bill_Type: "Maintenance" });
  const [touched, setTouched]     = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving]       = useState(false);
  // Generate all
  const [genOpen, setGenOpen]     = useState(false);
  const [genForm, setGenForm]     = useState({ Amount: "", Due_Date: "", Bill_Type: "Maintenance" });
  const [genTouched, setGenTouched] = useState({});
  const [generating, setGenerating] = useState(false);

  const [success, setSuccess]     = useState("");
  const [loading, setLoading]     = useState(true);

  const load = async () => {
    try {
      setLoadError("");
      const [b, u] = await Promise.all([api.get("/bills"), api.get("/units")]);
      setBills(b.data); setUnits(u.data.filter((u) => u.Status === "Occupied"));
    } catch (e) { setLoadError(e.response?.data?.message || "Unable to load bills. Please try again."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  // Single bill validation
  const errors  = validateSingle(form);
  const isValid = !errors.unit && !errors.Amount && !errors.Due_Date;

  const field = (key) => ({
    error:      !!touched[key] && !!errors[key],
    helperText: touched[key] && errors[key] ? errors[key] : " ",
    onBlur:     () => setTouched((t) => ({ ...t, [key]: true })),
  });

  // Generate validation
  const genErrors  = validateGen(genForm);
  const genIsValid = !genErrors.Amount && !genErrors.Due_Date;

  const genField = (key) => ({
    error:      !!genTouched[key] && !!genErrors[key],
    helperText: genTouched[key] && genErrors[key] ? genErrors[key] : " ",
    onBlur:     () => setGenTouched((t) => ({ ...t, [key]: true })),
  });

  const handleSave = async () => {
    setTouched({ unit: true, Amount: true, Due_Date: true });
    if (!isValid) return;
    setSaving(true); setSubmitError("");
    try {
      await api.post("/bills", form);
      setSuccess("Bill created!"); setOpen(false); load();
    } catch (e) { setSubmitError(e.response?.data?.message || "Error"); }
    finally { setSaving(false); }
  };

  const handleGenerate = async () => {
    setGenTouched({ Amount: true, Due_Date: true });
    if (!genIsValid) return;
    setGenerating(true); setGenError("");
    try {
      const { data } = await api.post("/bills/generate", genForm);
      setSuccess(data.message); setGenOpen(false); load();
    } catch (e) { setGenError(e.response?.data?.message || "Unable to generate bills. Please try again."); }
    finally { setGenerating(false); }
  };

  return (
    <div className="hs-bills">
      <div className="hs-page-heading hs-members-heading hs-bills-heading">
        <div><h1>Bills Management</h1><p>Create bills and track resident dues.</p></div>
        <div className="hs-bills-actions">
          <button className="hs-resident-add hs-bills-generate" onClick={() => { setGenForm({ Amount: "", Due_Date: "", Bill_Type: "Maintenance" }); setGenTouched({}); setGenError(""); setGenOpen(true); }}><AutorenewIcon/>Generate all bills</button>
          <button className="hs-resident-add" onClick={() => { setForm({ unit: "", Amount: "", Due_Date: "", Bill_Type: "Maintenance" }); setTouched({}); setSubmitError(""); setOpen(true); }}><AddIcon/>Add single bill</button>
        </div>
      </div>
      {success && <Toast severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Toast>}
      {loadError && <Toast severity="error" sx={{ mb: 2 }} action={<Button color="inherit" onClick={() => { setLoading(true); load(); }}>Retry</Button>}>{loadError}</Toast>}
      <section className="hs-panel hs-bills-summary" aria-label="Billing summary" aria-busy={loading}>
        {[{ label: "Total billed", records: bills, suffix: "bills" }, { label: "Paid", records: paid, suffix: "bills" }, { label: "Outstanding", records: unpaid, suffix: "unpaid bills" }].map(item => <div key={item.label} className={item.label === "Outstanding" ? "is-outstanding" : ""}><h2>{item.label}</h2><strong>{loading || loadError ? "—" : money(totalAmount(item.records))}</strong><p>{loading || loadError ? "—" : `${item.records.length} ${item.suffix}`}</p></div>)}
      </section>
      <section className="hs-panel hs-residents-panel hs-bills-panel" aria-label="Bills" aria-busy={loading}>
        <div className="hs-bills-toolbar">
          <div className="hs-bills-tabs" role="group" aria-label="Filter bills by payment status">
            {[["", "All bills", bills.length], ["Paid", "Paid", paid.length], ["Unpaid", "Unpaid", unpaid.length]].map(([value, label, count]) => <button key={label} aria-pressed={status === value} className={status === value ? "active" : ""} onClick={() => { setStatus(value); setPage(1); }}>{label}<span>{count}</span></button>)}
          </div>
          <div className="hs-residents-filters hs-bills-filters">
            <label className="hs-resident-search"><SearchRounded/><input type="search" aria-label="Search bills by unit or resident" placeholder="Search unit or resident..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/></label>
            <div className="hs-bills-selects">
              <div className="hs-resident-filter"><FilterAltOutlined/><select aria-label="Filter bills by type" value={billType} onChange={e => { setBillType(e.target.value); setPage(1); }}><option value="">All bill types</option><option value="Maintenance">Maintenance</option><option value="Utility">Utility</option></select><KeyboardArrowDownRounded/></div>
              <div className="hs-resident-filter hs-bills-date"><CalendarTodayOutlined/><select aria-label="Sort bills by due date" value={dueOrder} onChange={e => { setDueOrder(e.target.value); setPage(1); }}><option value="">Due date</option><option value="earliest">Earliest first</option><option value="latest">Latest first</option></select><KeyboardArrowDownRounded/></div>
            </div>
          </div>
        </div>
        <div className="hs-residents-table-wrap"><table className="hs-residents-table hs-bills-table">
          <thead><tr>{["Unit no.", "Resident", "Amount (PKR)", "Type", "Due date", "Status"].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6}><div className="hs-residents-loading" role="status"><CircularProgress size={26}/>Loading bills...</div></td></tr> : visibleBills.map(bill => <tr key={bill._id}>
              <td><strong>{bill.unit?.Unit_Number ?? "—"}</strong></td><td>{bill.unit?.resident?.Name || "—"}</td><td>{money(bill.Amount)}</td><td><span className="hs-bill-type">{bill.Bill_Type}</span></td><td>{dateLabel(bill.Due_Date)}</td><td><span className={`hs-bill-status ${bill.Status === "Paid" ? "paid" : "unpaid"}`}><i/>{bill.Status}</span></td>
            </tr>)}
            {!loading && !visibleBills.length && <tr><td colSpan={6} className="hs-empty">{loadError ? "Bill data unavailable" : bills.length ? "No bills match your search or filters." : "No bills yet. Create a bill to get started."}</td></tr>}
          </tbody>
        </table></div>
        <div className="hs-residents-pagination"><span aria-live="polite">Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} bills</span><div><button disabled={loading || currentPage <= 1} onClick={() => setPage(currentPage - 1)}><ChevronLeftRounded/>Previous</button><button disabled={loading || currentPage * pageSize >= filtered.length} onClick={() => setPage(currentPage + 1)}>Next<ChevronRightRounded/></button></div></div>
      </section>

      {/* ── Single Bill Dialog ── */}
      <AdminDialog busy={saving} open={open} onClose={() => { if (!saving) setOpen(false); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<ReceiptIcon />} title="Create Bill" subtitle="Generate a bill for a specific unit" />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          {submitError && <Toast severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSubmitError("")}>{submitError}</Toast>}
          <FormControl fullWidth required error={!!touched.unit && !!errors.unit} sx={{ mb: 1 }}>
            <InputLabel>Unit</InputLabel>
            <Select value={form.unit} label="Unit"
              onChange={(e) => { setForm({ ...form, unit: e.target.value }); setTouched((t) => ({ ...t, unit: true })); }}>
              {units.map((u) => <MenuItem key={u._id} value={u._id}>Unit {u.Unit_Number} — {u.resident?.Name}</MenuItem>)}
            </Select>
            <FormHelperText>{touched.unit && errors.unit ? errors.unit : " "}</FormHelperText>
          </FormControl>
          <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2} mb={1}>
            <TextField fullWidth label="Amount (PKR)" type="number" required value={form.Amount}
              onChange={(e) => setForm({ ...form, Amount: e.target.value })} {...field("Amount")} />
            <TextField fullWidth label="Due Date" type="date" required InputLabelProps={{ shrink: true }}
              value={form.Due_Date} onChange={(e) => setForm({ ...form, Due_Date: e.target.value })} {...field("Due_Date")} />
          </Box>
          <FormControl fullWidth>
            <InputLabel>Bill Type</InputLabel>
            <Select value={form.Bill_Type} label="Bill Type" onChange={(e) => setForm({ ...form, Bill_Type: e.target.value })}>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
              <MenuItem value="Utility">Utility</MenuItem>
            </Select>
            <FormHelperText> </FormHelperText>
          </FormControl>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button disabled={saving} onClick={() => setOpen(false)} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!isValid || saving}
            sx={{ bgcolor: "#0854ed", borderRadius: 2, px: 3, minWidth: 120, "&:disabled": { bgcolor: "#c5cae9", color: "#fff" } }}>
            {saving ? <CircularProgress size={18} color="inherit" /> : "Create Bill"}
          </Button>
        </DialogActions>
      </AdminDialog>

      {/* ── Generate Bills Dialog ── */}
      <AdminDialog busy={generating} open={genOpen} onClose={() => { if (!generating) setGenOpen(false); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<GroupsIcon />} title="Generate Bills" subtitle="Create bills for all occupied units at once" color="#0854ed" />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          {genError && <Toast severity="error" sx={{ mb: 2 }} onClose={() => setGenError("")}>{genError}</Toast>}
          <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2} mb={1}>
            <TextField fullWidth label="Amount (PKR)" type="number" required value={genForm.Amount}
              onChange={(e) => setGenForm({ ...genForm, Amount: e.target.value })} {...genField("Amount")} />
            <TextField fullWidth label="Due Date" type="date" required InputLabelProps={{ shrink: true }}
              value={genForm.Due_Date} onChange={(e) => setGenForm({ ...genForm, Due_Date: e.target.value })} {...genField("Due_Date")} />
          </Box>
          <FormControl fullWidth>
            <InputLabel>Bill Type</InputLabel>
            <Select value={genForm.Bill_Type} label="Bill Type" onChange={(e) => setGenForm({ ...genForm, Bill_Type: e.target.value })}>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
              <MenuItem value="Utility">Utility</MenuItem>
            </Select>
            <FormHelperText> </FormHelperText>
          </FormControl>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button disabled={generating} onClick={() => setGenOpen(false)} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleGenerate} disabled={!genIsValid || generating}
            sx={{ bgcolor: "#0854ed", borderRadius: 2, px: 3, minWidth: 140, "&:disabled": { bgcolor: "#c8e6c9", color: "#fff" } }}>
            {generating ? <CircularProgress size={18} color="inherit" /> : "Generate Bills"}
          </Button>
        </DialogActions>
      </AdminDialog>
    </div>
  );
};

export default Bills;
