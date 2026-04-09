import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, FormHelperText,
  Alert, Chip, IconButton, Tooltip, Divider, Avatar, CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
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

const validate = (form) => ({
  Amount:      !form.Amount                   ? "Amount is required"
             : Number(form.Amount) <= 0        ? "Amount must be greater than 0"  : "",
  ExpenseDate: !form.ExpenseDate              ? "Expense date is required"         : "",
});

const Expenses = () => {
  const [expenses, setExpenses]     = useState([]);
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
    try { const { data } = await api.get("/expenses"); setExpenses(data); }
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
    setDeleting(true);
    try {
      await api.delete(`/expenses/${deleteTarget.id}`);
      setSuccess("Expense deleted."); load();
    } catch { /* ignore */ }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const total = expenses.reduce((s, e) => s + e.Amount, 0);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress sx={{ color: "#1a237e" }} />
    </Box>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Expense Tracking</Typography>
          <Typography variant="h6" fontWeight="bold" color="#c62828">Total: PKR {total.toLocaleString()}</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}
          sx={{ bgcolor: "#1a237e", borderRadius: 2 }}>Record Expense</Button>
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#1a237e" }}>
            <TableRow>
              {["Category", "Amount", "Date", "Description", "Payment Status", "Actions"].map((h) => (
                <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((e) => (
              <TableRow key={e._id} hover>
                <TableCell><Chip label={e.ExpenseCategory} size="small" /></TableCell>
                <TableCell>PKR {e.Amount?.toLocaleString()}</TableCell>
                <TableCell>{new Date(e.ExpenseDate).toLocaleDateString()}</TableCell>
                <TableCell>{e.Description}</TableCell>
                <TableCell><Chip label={e.PaymentStatus} color={e.PaymentStatus === "Paid" ? "success" : "warning"} size="small" /></TableCell>
                <TableCell>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget({ id: e._id, label: `PKR ${e.Amount?.toLocaleString()} — ${e.ExpenseCategory}` })}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!expenses.length && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: "#aaa" }}>No expenses recorded</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Record Expense Dialog ── */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<ReceiptLongIcon />} title="Record Expense" subtitle="Enter the expense details below" />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          {submitError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSubmitError("")}>{submitError}</Alert>}
          <FormControl fullWidth sx={{ mb: 1 }}>
            <InputLabel>Category</InputLabel>
            <Select value={form.ExpenseCategory} label="Category" onChange={(e) => setForm({ ...form, ExpenseCategory: e.target.value })}>
              {["Salary", "Repair", "Utility", "Other"].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
            <FormHelperText> </FormHelperText>
          </FormControl>
          <Box display="flex" gap={2} mb={1}>
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
          <Button onClick={() => setOpen(false)} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!isValid || saving}
            sx={{ bgcolor: "#1a237e", borderRadius: 2, px: 3, minWidth: 130, "&:disabled": { bgcolor: "#c5cae9", color: "#fff" } }}>
            {saving ? <CircularProgress size={18} color="inherit" /> : "Save Expense"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Dialog ── */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}>
        <Box sx={{ bgcolor: "#c62828", height: 6 }} />
        <DialogContent sx={{ pt: 4, pb: 2, px: 3, textAlign: "center" }}>
          <Avatar sx={{ bgcolor: "#ffebee", width: 64, height: 64, mx: "auto", mb: 2 }}>
            <WarningAmberIcon sx={{ color: "#c62828", fontSize: 36 }} />
          </Avatar>
          <Typography variant="h6" fontWeight="bold" mb={1}>Delete Expense?</Typography>
          <Typography variant="body2" color="text.secondary">You are about to permanently delete</Typography>
          <Typography fontWeight="bold" fontSize={15} mt={0.5} mb={1.5} color="#1a237e">{deleteTarget?.label}</Typography>
          <Typography variant="body2" color="text.secondary">This action <strong>cannot be undone</strong>.</Typography>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1, justifyContent: "center" }}>
          <Button fullWidth variant="outlined" onClick={() => setDeleteTarget(null)} sx={{ borderRadius: 2, borderColor: "#ccc", color: "#555", py: 1 }}>Cancel</Button>
          <Button fullWidth variant="contained" onClick={handleDelete} disabled={deleting}
            sx={{ borderRadius: 2, bgcolor: "#c62828", py: 1, minWidth: 120, "&:hover": { bgcolor: "#b71c1c" } }}>
            {deleting ? <CircularProgress size={18} color="inherit" /> : "Yes, Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Expenses;
