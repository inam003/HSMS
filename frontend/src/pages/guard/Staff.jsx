import { PortalPageTitle, PortalStatCard as StatCard } from "../../components/common/PortalUI";
import Toast from "../../components/common/Toast";
import AdminDialog, { AdminDialogHeader as ModalHeader } from "../../components/common/AdminDialog";
import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, DialogContent, DialogActions,
  TextField, Alert, Chip, Divider, CircularProgress, Grid, Card, CardContent
} from "@mui/material";
import KeyIcon        from "@mui/icons-material/Key";
import BadgeIcon      from "@mui/icons-material/Badge";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import api from "../../api/axios";



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

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/staff")
      .then(({ data }) => setStaff(data))
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress sx={{ color: "#0854ed" }} />
    </Box>
  );

  return (
    <Box className="hs-portal-page hs-portal-guard-Staff">
      <Box className="hs-portal-heading-row" display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <PortalPageTitle subtitle="Review staff details and validate entry codes.">Staff & Vendor Attendance</PortalPageTitle>
        <Button variant="contained" onClick={handleOpen} sx={{ bgcolor: "#0854ed", borderRadius: 2 }}>
          Validate Entry Code
        </Button>
      </Box>
      {success && <Toast severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>{success}</Toast>}

      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 6 }}  >
          <StatCard label="Total Staff & Vendors" value={staff.length} color="#0854ed" bg="#e9f1ff" icon={<BadgeIcon />} />
        </Grid>
        <Grid size={{ xs: 6 }}  >
          <StatCard label="Active Entry Codes" value={staff.filter((s) => s.Entry_Code).length} color="#2e7d32" bg="#e8f5e9" icon={<CheckCircleIcon />} />
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#0854ed" }}>
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
      <AdminDialog open={codeOpen} onClose={() => setCodeOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<KeyIcon />} title="Validate Staff Entry Code" subtitle="Enter the code shown on staff's profile" />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          {codeError && <Toast severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setCodeError("")}>{codeError}</Toast>}
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
              sx={{ borderColor: "#0854ed", color: "#0854ed", borderRadius: 2, minWidth: 110 }}>
              {validating ? <CircularProgress size={18} sx={{ color: "#0854ed" }} /> : "Validate"}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleCheckin} disabled={confirming}
              sx={{ bgcolor: "#2e7d32", borderRadius: 2, minWidth: 150 }}>
              {confirming ? <CircularProgress size={18} color="inherit" /> : "Confirm Check-In"}
            </Button>
          )}
        </DialogActions>
      </AdminDialog>
    </Box>
  );
};

export default GuardStaff;
