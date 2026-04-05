import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Alert, Chip, IconButton, Tooltip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../api/axios";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ExpenseCategory: "Salary", Amount: "", ExpenseDate: "", Description: "", PaymentStatus: "Pending" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const load = async () => { const { data } = await api.get("/expenses"); setExpenses(data); };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    try { await api.post("/expenses", form); setSuccess("Expense recorded!"); setOpen(false); load(); }
    catch (e) { setError(e.response?.data?.message || "Error"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    await api.delete(`/expenses/${id}`); load();
  };

  const total = expenses.reduce((s, e) => s + e.Amount, 0);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Expense Tracking</Typography>
          <Typography variant="body2" color="text.secondary">Total: PKR {total.toLocaleString()}</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm({ ExpenseCategory: "Salary", Amount: "", ExpenseDate: "", Description: "", PaymentStatus: "Pending" }); setError(""); setOpen(true); }} sx={{ bgcolor: "#1a237e" }}>
          Record Expense
        </Button>
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
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
                <TableCell><Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(e._id)}><DeleteIcon /></IconButton></Tooltip></TableCell>
              </TableRow>
            ))}
            {!expenses.length && <TableRow><TableCell colSpan={6} align="center">No expenses recorded</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Expense</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select value={form.ExpenseCategory} label="Category" onChange={(e) => setForm({ ...form, ExpenseCategory: e.target.value })}>
              {["Salary", "Repair", "Utility", "Other"].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField fullWidth label="Amount (PKR)" type="number" margin="normal" value={form.Amount} onChange={(e) => setForm({ ...form, Amount: e.target.value })} />
          <TextField fullWidth label="Expense Date" type="date" margin="normal" InputLabelProps={{ shrink: true }} value={form.ExpenseDate} onChange={(e) => setForm({ ...form, ExpenseDate: e.target.value })} />
          <TextField fullWidth label="Description" margin="normal" multiline rows={2} value={form.Description} onChange={(e) => setForm({ ...form, Description: e.target.value })} />
          <FormControl fullWidth margin="normal">
            <InputLabel>Payment Status</InputLabel>
            <Select value={form.PaymentStatus} label="Payment Status" onChange={(e) => setForm({ ...form, PaymentStatus: e.target.value })}>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: "#1a237e" }}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Expenses;
