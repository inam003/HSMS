import AdminDialog, { AdminDialogHeader as ModalHeader, AdminDeleteDialog } from "../../components/common/AdminDialog";
import Toast from "../../components/common/Toast";
import { useEffect, useState } from "react";
import {
  Box, Typography, Button, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, FormHelperText,
  Divider, CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SearchRounded from "@mui/icons-material/SearchRounded";
import FilterAltOutlined from "@mui/icons-material/FilterAltOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import api from "../../api/axios";
import "./Members.css";
import "./Expenses.css";

const categories = ["Salary", "Repair", "Utility", "Other"];
const money = value => `PKR ${Number(value || 0).toLocaleString("en-PK", { maximumFractionDigits: 2 })}`;
const dateLabel = value => {
  const date = new Date(value);
  return value && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("en-GB", { timeZone: "UTC" }) : "—";
};
const sumAmounts = records => records.reduce((sum, record) => sum + (Number(record.Amount) || 0), 0);


const validate = (form) => ({
  Amount:      !form.Amount                   ? "Amount is required"
             : Number(form.Amount) <= 0        ? "Amount must be greater than 0"  : "",
  ExpenseDate: !form.ExpenseDate              ? "Expense date is required"         : "",
});

const Expenses = () => {
  const [expenses, setExpenses]     = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [loadError, setLoadError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const pageSize = 10;
  const paid = expenses.filter(expense => expense.PaymentStatus === "Paid");
  const pending = expenses.filter(expense => expense.PaymentStatus === "Pending");
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const query = search.trim().toLowerCase();
  const filtered = expenses.filter(expense => {
    if (status && expense.PaymentStatus !== status) return false;
    if (category && expense.ExpenseCategory !== category) return false;
    if (![expense.Description, expense.ExpenseCategory, String(expense.Amount)].some(value => (value || "").toLowerCase().includes(query))) return false;
    const timestamp = new Date(expense.ExpenseDate).getTime();
    if (dateRange === "month") return timestamp >= Date.UTC(now.getFullYear(), now.getMonth(), 1) && timestamp < Date.UTC(now.getFullYear(), now.getMonth() + 1, 1);
    if (dateRange === "30days") return timestamp >= today - 29 * 86400000 && timestamp < today + 86400000;
    if (dateRange === "custom") return Number.isFinite(timestamp) && (!startDate || timestamp >= Date.parse(startDate)) && (!endDate || timestamp < Date.parse(endDate) + 86400000);
    return true;
  });
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const visibleExpenses = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const [open, setOpen]             = useState(false);
  const [form, setForm]             = useState({ ExpenseCategory: "Salary", Amount: "", ExpenseDate: "", Description: "", PaymentStatus: "Pending" });
  const [touched, setTouched]       = useState({});
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess]       = useState("");
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading]           = useState(true);

  const load = async () => {
    try { setLoadError(""); const { data } = await api.get("/expenses"); setExpenses(data); }
    catch (e) { setLoadError(e.response?.data?.message || "Unable to load expenses. Please try again."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const errors  = validate(form);
  const isValid = !errors.Amount && !errors.ExpenseDate;

  const field = (key) => ({
    error:      !!touched[key] && !!errors[key],
    helperText: touched[key] && errors[key] ? errors[key] : " ",
    onBlur:     () => setTouched((t) => ({ ...t, [key]: true })),
  });

  const handleOpen = () => {
    setForm({ ExpenseCategory: "Salary", Amount: "", ExpenseDate: "", Description: "", PaymentStatus: "Pending" });
    setTouched({}); setSubmitError(""); setOpen(true);
  };

  const handleSave = async () => {
    setTouched({ Amount: true, ExpenseDate: true });
    if (!isValid) return;
    setSaving(true); setSubmitError("");
    try {
      await api.post("/expenses", form);
      setSuccess("Expense recorded successfully!"); setOpen(false); load();
    } catch (e) { setSubmitError(e.response?.data?.message || "Error recording expense"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true); setDeleteError("");
    try {
      await api.delete(`/expenses/${deleteTarget.id}`);
      setSuccess("Expense deleted."); setDeleteTarget(null); load();
    } catch (e) { setDeleteError(e.response?.data?.message || "Unable to delete this expense. Please try again."); }
    finally { setDeleting(false); }
  };

  return (
    <div className="hs-expenses">
      <div className="hs-page-heading hs-members-heading hs-expenses-heading">
        <div><h1>Expense Tracking</h1><p>Record society expenses and track payments.</p></div>
        <button className="hs-resident-add" onClick={handleOpen}><AddIcon/>Record expense</button>
      </div>
      {success && <Toast severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Toast>}
      {loadError && <Toast severity="error" sx={{ mb: 2 }} action={<Button color="inherit" onClick={() => { setLoading(true); load(); }}>Retry</Button>}>{loadError}</Toast>}
      <section className="hs-panel hs-expenses-summary" aria-label="Expense summary" aria-busy={loading}>
        {[{ label: "Total expenses", records: expenses }, { label: "Paid", records: paid }, { label: "Pending payment", records: pending }].map(item => <div key={item.label} className={item.label === "Pending payment" ? "is-pending" : ""}><h2>{item.label}</h2><strong>{loading || loadError ? "—" : money(sumAmounts(item.records))}</strong><p>{loading || loadError ? "—" : `${item.records.length} ${item.records.length === 1 ? "expense" : "expenses"}`}</p></div>)}
      </section>
      <section className="hs-panel hs-residents-panel hs-expenses-panel" aria-label="Expense records" aria-busy={loading}>
        <div className="hs-expenses-toolbar">
          <div className="hs-expenses-tabs" role="group" aria-label="Filter expenses by payment status">
            {[["", "All expenses", expenses.length], ["Paid", "Paid", paid.length], ["Pending", "Pending", pending.length]].map(([value, label, count]) => <button key={label} aria-pressed={status === value} className={status === value ? "active" : ""} onClick={() => { setStatus(value); setPage(1); }}>{label}<span>{count}</span></button>)}
          </div>
          <div className="hs-residents-filters hs-expenses-filters">
            <label className="hs-resident-search"><SearchRounded/><input type="search" aria-label="Search expenses by description, category or amount" placeholder="Search expenses..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/></label>
            <div className="hs-expenses-selects">
              <div className="hs-resident-filter"><FilterAltOutlined/><select aria-label="Filter expenses by category" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}><option value="">All categories</option>{categories.map(value => <option key={value} value={value}>{value}</option>)}</select><KeyboardArrowDownRounded/></div>
              <div className="hs-resident-filter hs-expenses-date"><CalendarTodayOutlined/><select aria-label="Filter expenses by date range" value={dateRange} onChange={e => { setDateRange(e.target.value); setPage(1); }}><option value="">Date range</option><option value="month">This month</option><option value="30days">Last 30 days</option><option value="custom">Custom range</option></select><KeyboardArrowDownRounded/></div>
            </div>
          </div>
          {dateRange === "custom" && <div className="hs-expenses-custom-dates"><label>From<input type="date" value={startDate} max={endDate || undefined} onChange={e => { setStartDate(e.target.value); setPage(1); }}/></label><label>To<input type="date" value={endDate} min={startDate || undefined} onChange={e => { setEndDate(e.target.value); setPage(1); }}/></label>{startDate && endDate && startDate > endDate && <span role="alert">End date must be on or after the start date.</span>}</div>}
        </div>
        <div className="hs-residents-table-wrap"><table className="hs-residents-table hs-expenses-table">
          <thead><tr>{["Category", "Amount (PKR)", "Date", "Description", "Payment status", "Actions"].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6}><div className="hs-residents-loading" role="status"><CircularProgress size={26}/>Loading expenses...</div></td></tr> : visibleExpenses.map(expense => <tr key={expense._id}>
              <td><span className="hs-expense-category">{expense.ExpenseCategory}</span></td><td>{money(expense.Amount)}</td><td>{dateLabel(expense.ExpenseDate)}</td><td>{expense.Description || "—"}</td><td><span className={`hs-expense-status ${expense.PaymentStatus === "Paid" ? "paid" : "pending"}`}><i/>{expense.PaymentStatus}</span></td><td><button className="hs-expense-delete" title="Delete expense" aria-label={`Delete ${expense.ExpenseCategory} expense of ${money(expense.Amount)}`} onClick={() => { setDeleteError(""); setDeleteTarget({ id: expense._id, label: `${money(expense.Amount)} - ${expense.ExpenseCategory}` }); }}><DeleteOutlineRounded/></button></td>
            </tr>)}
            {!loading && !visibleExpenses.length && <tr><td colSpan={6} className="hs-empty">{loadError ? "Expense data unavailable" : expenses.length ? "No expenses match your search or filters." : "No expenses recorded. Record an expense to get started."}</td></tr>}
          </tbody>
        </table></div>
        <div className="hs-residents-pagination"><span aria-live="polite">Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} expenses</span><div><button disabled={loading || currentPage <= 1} onClick={() => setPage(currentPage - 1)}><ChevronLeftRounded/>Previous</button><button disabled={loading || currentPage * pageSize >= filtered.length} onClick={() => setPage(currentPage + 1)}>Next<ChevronRightRounded/></button></div></div>
      </section>

      {/* ── Record Expense Dialog ── */}
      <AdminDialog busy={saving} open={open} onClose={() => { if (!saving) setOpen(false); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<ReceiptLongIcon />} title="Record Expense" subtitle="Enter the expense details below" />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          {submitError && <Toast severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSubmitError("")}>{submitError}</Toast>}
          <FormControl fullWidth sx={{ mb: 1 }}>
            <InputLabel>Category</InputLabel>
            <Select value={form.ExpenseCategory} label="Category" onChange={(e) => setForm({ ...form, ExpenseCategory: e.target.value })}>
              {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
            <FormHelperText> </FormHelperText>
          </FormControl>
          <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2} mb={1}>
            <TextField fullWidth label="Amount (PKR)" type="number" required value={form.Amount}
              onChange={(e) => setForm({ ...form, Amount: e.target.value })} {...field("Amount")} />
            <TextField fullWidth label="Expense Date" type="date" required InputLabelProps={{ shrink: true }}
              value={form.ExpenseDate} onChange={(e) => setForm({ ...form, ExpenseDate: e.target.value })} {...field("ExpenseDate")} />
          </Box>
          <TextField fullWidth label="Description" multiline rows={2} value={form.Description}
            onChange={(e) => setForm({ ...form, Description: e.target.value })} sx={{ mb: 1 }} helperText=" " />
          <FormControl fullWidth>
            <InputLabel>Payment Status</InputLabel>
            <Select value={form.PaymentStatus} label="Payment Status" onChange={(e) => setForm({ ...form, PaymentStatus: e.target.value })}>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </Select>
            <FormHelperText> </FormHelperText>
          </FormControl>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button disabled={saving} onClick={() => setOpen(false)} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!isValid || saving}
            sx={{ bgcolor: "#0854ed", borderRadius: 2, px: 3, minWidth: 130, "&:disabled": { bgcolor: "#c5cae9", color: "#fff" } }}>
            {saving ? <CircularProgress size={18} color="inherit" /> : "Save Expense"}
          </Button>
        </DialogActions>
      </AdminDialog>

      {/* ── Delete Dialog ── */}
      <AdminDeleteDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} busy={deleting} title="Delete Expense?" name={deleteTarget?.label}>
        {deleteError && <Toast severity="error">{deleteError}</Toast>}
      </AdminDeleteDialog>
    </div>
  );
};

export default Expenses;
