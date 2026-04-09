import { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Chip, Dialog, DialogContent, DialogActions, TextField, Alert,
  Divider, CircularProgress
} from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import api from "../../api/axios";

const ModalHeader = ({ icon, title, subtitle, color = "#2e7d32" }) => (
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
  cardHolder:  !form.cardHolder.trim()              ? "Card holder name is required"       : "",
  cardNumber:  !form.cardNumber                     ? "Card number is required"
             : !/^\d{16}$/.test(form.cardNumber)   ? "Enter a valid 16-digit card number" : "",
  expiryDate:  !form.expiryDate                     ? "Expiry date is required"
             : !/^\d{2}\/\d{2}$/.test(form.expiryDate) ? "Use MM/YY format"              : "",
  cvv:         !form.cvv                            ? "CVV is required"
             : !/^\d{3}$/.test(form.cvv)           ? "Enter a valid 3-digit CVV"          : "",
});

const Bills = () => {
  const [bills, setBills]       = useState([]);
  const [selected, setSelected] = useState(null);
  const [payForm, setPayForm]   = useState({ cardNumber: "", cardHolder: "", expiryDate: "", cvv: "", paymentMethod: "Card" });
  const [touched, setTouched]   = useState({});
  const [success, setSuccess]   = useState("");
  const [error, setError]       = useState("");
  const [paying, setPaying]     = useState(false);
  const [loading, setLoading]   = useState(true);

  const load = async () => {
    try { const { data } = await api.get("/bills/my-bills"); setBills(data); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const errors  = validate(payForm);
  const isValid = !errors.cardHolder && !errors.cardNumber && !errors.expiryDate && !errors.cvv;

  const field = (key) => ({
    error:      !!touched[key] && !!errors[key],
    helperText: touched[key] && errors[key] ? errors[key] : " ",
    onBlur:     () => setTouched((t) => ({ ...t, [key]: true })),
  });

  const openPayment = (b) => {
    setSelected(b);
    setPayForm({ cardNumber: "", cardHolder: "", expiryDate: "", cvv: "", paymentMethod: "Card" });
    setTouched({}); setError("");
  };

  const handlePay = async () => {
    setTouched({ cardHolder: true, cardNumber: true, expiryDate: true, cvv: true });
    if (!isValid) return;
    setPaying(true); setError("");
    try {
      const { data } = await api.post(`/bills/${selected._id}/pay`, payForm);
      setSuccess(`Payment successful! Ref: ${data.payment.Transaction_Ref_No}`);
      setSelected(null); load();
    } catch (e) { setError(e.response?.data?.message || "Payment failed"); }
    finally { setPaying(false); }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress sx={{ color: "#1a237e" }} />
    </Box>
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={2}>My Bills & Payments</Typography>
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
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
                <TableCell><strong>PKR {b.Amount?.toLocaleString()}</strong></TableCell>
                <TableCell>{new Date(b.Due_Date).toLocaleDateString()}</TableCell>
                <TableCell><Chip label={b.Status} color={b.Status === "Paid" ? "success" : "error"} size="small" /></TableCell>
                <TableCell>
                  {b.Status === "Unpaid" && (
                    <Button size="small" variant="contained" startIcon={<PaymentIcon />}
                      onClick={() => openPayment(b)} sx={{ bgcolor: "#2e7d32", borderRadius: 2 }}>
                      Pay Now
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!bills.length && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: "#aaa" }}>No bills found</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Payment Dialog ── */}
      <Dialog open={!!selected} onClose={() => !paying && setSelected(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<CreditCardIcon />} title={`Pay Bill — PKR ${selected?.Amount?.toLocaleString()}`}
          subtitle="Secure dummy payment gateway simulation" />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError("")}>{error}</Alert>}
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>This is a dummy payment gateway simulation</Alert>
          <TextField fullWidth label="Card Holder Name" required value={payForm.cardHolder}
            onChange={(e) => setPayForm({ ...payForm, cardHolder: e.target.value })} {...field("cardHolder")} />
          <TextField fullWidth label="Card Number (16 digits)" required inputProps={{ maxLength: 16 }}
            value={payForm.cardNumber} onChange={(e) => setPayForm({ ...payForm, cardNumber: e.target.value.replace(/\D/g, "") })}
            {...field("cardNumber")} />
          <Box display="flex" gap={2} mb={1}>
            <TextField fullWidth label="Expiry (MM/YY)" required value={payForm.expiryDate}
              onChange={(e) => setPayForm({ ...payForm, expiryDate: e.target.value })} {...field("expiryDate")} />
            <TextField fullWidth label="CVV" required inputProps={{ maxLength: 3 }}
              value={payForm.cvv} onChange={(e) => setPayForm({ ...payForm, cvv: e.target.value.replace(/\D/g, "") })}
              {...field("cvv")} />
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setSelected(null)} disabled={paying} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handlePay} disabled={!isValid || paying}
            sx={{ bgcolor: "#2e7d32", borderRadius: 2, px: 3, minWidth: 180, "&:disabled": { bgcolor: "#c8e6c9", color: "#fff" } }}>
            {paying ? <CircularProgress size={18} color="inherit" /> : `Pay PKR ${selected?.Amount?.toLocaleString()}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Bills;
