import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, Chip
} from "@mui/material";
import api from "../../api/axios";

const GuardStaff = () => {
  const [staff, setStaff] = useState([]);
  const [codeOpen, setCodeOpen] = useState(false);
  const [code, setCode] = useState("");
  const [validated, setValidated] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { api.get("/staff").then(({ data }) => setStaff(data)); }, []);

  const handleValidate = async () => {
    setError(""); setValidated(null);
    try {
      const { data } = await api.post("/staff/validate-code", { entryCode: code });
      setValidated(data.staff);
    } catch (e) { setError("Invalid entry code. Access denied."); }
  };

  const handleCheckin = async (id) => {
    // For now we just show the staff record; in full implementation this would POST to attendance
    setSuccess(`Staff ${validated?.Name} checked in!`); setCodeOpen(false); setValidated(null); setCode("");
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">Staff & Vendor Attendance</Typography>
        <Button variant="contained" onClick={() => { setCode(""); setValidated(null); setError(""); setCodeOpen(true); }} sx={{ bgcolor: "#4527a0" }}>
          Validate Entry Code
        </Button>
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
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
                <TableCell><Chip label={s.Entry_Code} size="small" color="success" sx={{ fontFamily: "monospace", fontWeight: "bold" }} /></TableCell>
                <TableCell>{s.Rating}/5</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={codeOpen} onClose={() => setCodeOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Validate Staff Entry Code</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField fullWidth label="Enter Code" margin="normal" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} inputProps={{ style: { fontFamily: "monospace", fontWeight: "bold", letterSpacing: 4 } }} />
          {validated && (
            <Alert severity="success" sx={{ mt: 1 }}>
              ✅ Valid: {validated.Name} ({validated.Type})
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCodeOpen(false)}>Cancel</Button>
          <Button variant="outlined" onClick={handleValidate}>Validate</Button>
          {validated && <Button variant="contained" onClick={handleCheckin} sx={{ bgcolor: "#2e7d32" }}>Confirm Check-In</Button>}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GuardStaff;
