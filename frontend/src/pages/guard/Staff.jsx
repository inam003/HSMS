import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogContent, DialogActions,
  TextField, Alert, Chip, Divider, CircularProgress
} from "@mui/material";
import KeyIcon from "@mui/icons-material/Key";
import api from "../../api/axios";

const ModalHeader = ({ icon, title, subtitle, color = "#4527a0" }) => (
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

const GuardStaff = () => {
  const [staff, setStaff]           = useState([]);
  const [codeOpen, setCodeOpen]     = useState(false);
  const [code, setCode]             = useState("");
  const [codeTouched, setCodeTouched] = useState(false);
  const [validated, setValidated]   = useState(null);
  const [codeError, setCodeError]   = useState("");
  const [success, setSuccess]       = useState("");
  const [validating, setValidating] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => { api.get("/staff").then(({ data }) => setStaff(data)); }, []);

  const codeFieldError = codeTouched && !code.trim() ? "Entry code is required" : "";

  const handleValidate = async () => {
    setCodeTouched(true);
    if (!code.trim()) return;
    setValidating(true); setCodeError(""); setValidated(null);
    try {
      const { data } = await api.post("/staff/validate-code", { entryCode: code });
      setValidated(data.staff);
    } catch { setCodeError("Invalid entry code. Access denied."); }
    finally { setValidating(false); }
  };

  const handleCheckin = async () => {
    setConfirming(true);
    try {
      setSuccess(`Staff ${validated?.Name} checked in!`);
      setCodeOpen(false); setValidated(null); setCode(""); setCodeTouched(false);
    } catch { /* ignore */ }
    finally { setConfirming(false); }
  };

  const handleOpen = () => {
    setCode(""); setValidated(null); setCodeError(""); setCodeTouched(false); setCodeOpen(true);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">Staff & Vendor Attendance</Typography>
        <Button variant="contained" onClick={handleOpen} sx={{ bgcolor: "#4527a0", borderRadius: 2 }}>
          Validate Entry Code
        </Button>
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#4527a0" }}>
            <TableRow>
              {["Name", "Type", "CNIC", "Entry Code", "Rating"].map((h) => (
                <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {staff.map((s) => (
              <TableRow key={s._id} hover>
                <TableCell>{s.Name}</TableCell>
                <TableCell><Chip label={s.Type} size="small" color="primary" /></TableCell>
                <TableCell>{s.Aadhar_CNIC_No}</TableCell>
                <TableCell>
                  <Chip icon={<KeyIcon />} label={s.Entry_Code} size="small" color="success"
                    sx={{ fontFamily: "monospace", fontWeight: "bold" }} />
                </TableCell>
                <TableCell>{s.Rating}/5</TableCell>
              </TableRow>
            ))}
            {!staff.length && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: "#aaa" }}>No staff found</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Validate Entry Code Dialog ── */}
      <Dialog open={codeOpen} onClose={() => setCodeOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<KeyIcon />} title="Validate Staff Entry Code" subtitle="Enter the code shown on staff's profile" />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          {codeError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setCodeError("")}>{codeError}</Alert>}
          <TextField
            fullWidth required label="Entry Code" value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setValidated(null); setCodeError(""); }}
            onBlur={() => setCodeTouched(true)}
            error={!!codeFieldError}
            helperText={codeFieldError || " "}
            inputProps={{ style: { fontFamily: "monospace", fontWeight: "bold", letterSpacing: 4, fontSize: 18 } }}
            placeholder="e.g. A1B2C3D4"
          />
          {validated && (
            <Alert severity="success" sx={{ mt: 1, borderRadius: 2 }}>
              ✅ Valid: <strong>{validated.Name}</strong> ({validated.Type})
            </Alert>
          )}
        </DialogContent>
        <Divider sx={{ mt: 1 }} />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setCodeOpen(false)} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          {!validated ? (
            <Button variant="outlined" onClick={handleValidate} disabled={!code.trim() || validating}
              sx={{ borderColor: "#4527a0", color: "#4527a0", borderRadius: 2, minWidth: 110 }}>
              {validating ? <CircularProgress size={18} sx={{ color: "#4527a0" }} /> : "Validate"}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleCheckin} disabled={confirming}
              sx={{ bgcolor: "#2e7d32", borderRadius: 2, minWidth: 150 }}>
              {confirming ? <CircularProgress size={18} color="inherit" /> : "Confirm Check-In"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GuardStaff;
