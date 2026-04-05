import { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert
} from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import api from "../../api/axios";

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [selected, setSelected] = useState(null);
  const [payForm, setPayForm] = useState({ cardNumber: "", cardHolder: "", expiryDate: "", cvv: "", paymentMethod: "Card" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  const load = async () => { const { data } = await api.get("/bills/my-bills"); setBills(data); };
  useEffect(() => { load(); }, []);

  const handlePay = async () => {
    setPaying(true); setError("");
    try {
      const { data } = await api.post(`/bills/${selected._id}/pay`, payForm);
      setSuccess(`Payment successful! Ref: ${data.payment.Transaction_Ref_No}`);
      setSelected(null); load();
    } catch (e) { setError(e.response?.data?.message || "Payment failed"); }
    setPaying(false);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={2}>My Bills & Payments</Typography>
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#1a237e" }}>
            <TableRow>
              {["Type", "Amount", "Due Date", "Status", "Actions"].map((h) => (
                <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {bills.map((b) => (
              <TableRow key={b._id} hover>
                <TableCell><Chip label={b.Bill_Type} size="small" /></TableCell>
                <TableCell fontWeight="bold">PKR {b.Amount?.toLocaleString()}</TableCell>
                <TableCell>{new Date(b.Due_Date).toLocaleDateString()}</TableCell>
                <TableCell><Chip label={b.Status} color={b.Status === "Paid" ? "success" : "error"} size="small" /></TableCell>
                <TableCell>
                  {b.Status === "Unpaid" && (
                    <Button size="small" variant="contained" startIcon={<PaymentIcon />} onClick={() => { setSelected(b); setPayForm({ cardNumber: "", cardHolder: "", expiryDate: "", cvv: "", paymentMethod: "Card" }); setError(""); }} sx={{ bgcolor: "#2e7d32" }}>
                      Pay Now
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!bills.length && <TableRow><TableCell colSpan={5} align="center">No bills found</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Pay Bill — PKR {selected?.Amount?.toLocaleString()}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Alert severity="info" sx={{ mb: 2 }}>This is a dummy payment gateway simulation</Alert>
          <TextField fullWidth label="Card Holder Name" margin="normal" value={payForm.cardHolder} onChange={(e) => setPayForm({ ...payForm, cardHolder: e.target.value })} />
          <TextField fullWidth label="Card Number (16 digits)" margin="normal" inputProps={{ maxLength: 16 }} value={payForm.cardNumber} onChange={(e) => setPayForm({ ...payForm, cardNumber: e.target.value })} />
          <Box display="flex" gap={2}>
            <TextField fullWidth label="Expiry (MM/YY)" margin="normal" value={payForm.expiryDate} onChange={(e) => setPayForm({ ...payForm, expiryDate: e.target.value })} />
            <TextField fullWidth label="CVV" margin="normal" inputProps={{ maxLength: 3 }} value={payForm.cvv} onChange={(e) => setPayForm({ ...payForm, cvv: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Cancel</Button>
          <Button variant="contained" onClick={handlePay} disabled={paying} sx={{ bgcolor: "#2e7d32" }}>
            {paying ? "Processing..." : `Pay PKR ${selected?.Amount?.toLocaleString()}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Bills;
