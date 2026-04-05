import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Alert, Chip, Card, CardContent,
  TextField, Dialog, DialogContent, DialogActions, Divider, CircularProgress
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import EditIcon from "@mui/icons-material/Edit";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import UpdateIcon from "@mui/icons-material/Update";
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

const StaffAttendance = () => {
  const [attendance, setAttendance]   = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [notes, setNotes]             = useState("");
  const [noteOpen, setNoteOpen]       = useState(false);
  const [noteAction, setNoteAction]   = useState(""); // "checkin" | "checkout"
  const [success, setSuccess]         = useState("");
  const [error, setError]             = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [availStatus, setAvailStatus] = useState("");
  const [availTouched, setAvailTouched] = useState(false);
  const [statusOpen, setStatusOpen]   = useState(false);
  const [updating, setUpdating]       = useState(false);

  const load = async () => {
    const { data } = await api.get("/staff/attendance/my");
    setAttendance(data);
    const today = new Date().toDateString();
    setTodayRecord(data.find((r) => new Date(r.Date).toDateString() === today) || null);
  };
  useEffect(() => { load(); }, []);

  const openAction = (action) => {
    setNoteAction(action); setNotes(""); setNoteOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true); setError(""); setSuccess("");
    try {
      if (noteAction === "checkin") {
        await api.post("/staff/attendance/checkin", { Notes: notes });
        setSuccess("Checked in successfully!");
      } else {
        await api.post("/staff/attendance/checkout", { Notes: notes });
        setSuccess("Checked out successfully!");
      }
      setNoteOpen(false); load();
    } catch (e) {
      setError(e.response?.data?.message || "Action failed");
      setNoteOpen(false);
    }
    finally { setSubmitting(false); }
  };

  // Availability validation
  const availError = availTouched && !availStatus ? "Please select an availability status" : "";

  const handleUpdateStatus = async () => {
    setAvailTouched(true);
    if (!availStatus) return;
    setUpdating(true);
    try {
      await api.put("/staff/me/availability", { Availability_Status: availStatus });
      setSuccess(`Availability updated to "${availStatus}"`);
      setStatusOpen(false); load();
    } catch { setError("Failed to update status"); setStatusOpen(false); }
    finally { setUpdating(false); }
  };

  const checkedInToday  = todayRecord?.CheckIn_Time;
  const checkedOutToday = todayRecord?.CheckOut_Time;
  const presentCount    = attendance.filter((r) => r.Status === "Present").length;
  const halfDayCount    = attendance.filter((r) => r.Status === "Half-Day").length;
  const absentCount     = attendance.filter((r) => r.Status === "Absent").length;
  const isCheckin       = noteAction === "checkin";
  const actionColor     = isCheckin ? "#2e7d32" : "#c62828";

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">Attendance Management</Typography>
        <Button variant="outlined" startIcon={<EditIcon />}
          onClick={() => { setAvailStatus(""); setAvailTouched(false); setStatusOpen(true); }}
          sx={{ borderColor: "#4527a0", color: "#4527a0", borderRadius: 2 }}>
          Update Availability
        </Button>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}
      {error   && <Alert severity="error"   sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError("")}>{error}</Alert>}

      {/* Action Buttons */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Today — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button variant="contained" size="large" startIcon={<LoginIcon />}
              onClick={() => openAction("checkin")} disabled={!!checkedInToday}
              sx={{ bgcolor: "#2e7d32", py: 1.5, px: 4, borderRadius: 2 }}>
              {checkedInToday ? `Checked In at ${new Date(todayRecord.CheckIn_Time).toLocaleTimeString()}` : "Check In"}
            </Button>
            <Button variant="contained" size="large" startIcon={<LogoutIcon />}
              onClick={() => openAction("checkout")} disabled={!checkedInToday || !!checkedOutToday}
              color="error" sx={{ py: 1.5, px: 4, borderRadius: 2 }}>
              {checkedOutToday ? `Checked Out at ${new Date(todayRecord.CheckOut_Time).toLocaleTimeString()}` : "Check Out"}
            </Button>
            {checkedInToday && (
              <Chip label={todayRecord.Status} color={todayRecord.Status === "Present" ? "success" : "warning"}
                sx={{ alignSelf: "center", fontSize: 14, py: 2 }} />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        {[
          { count: presentCount, label: "Present",      color: "#2e7d32", bg: "#e8f5e9" },
          { count: halfDayCount, label: "Half-Day",     color: "#f57f17", bg: "#fff8e1" },
          { count: absentCount,  label: "Absent",       color: "#c62828", bg: "#fce4ec" },
          { count: attendance.length, label: "Total Records", color: "#1565c0", bg: "#e3f2fd" },
        ].map(({ count, label, color, bg }) => (
          <Paper key={label} sx={{ p: 2, borderRadius: 2, flex: 1, minWidth: 120, textAlign: "center", bgcolor: bg }}>
            <Typography variant="h4" fontWeight="bold" color={color}>{count}</Typography>
            <Typography variant="body2">{label}</Typography>
          </Paper>
        ))}
      </Box>

      {/* Attendance History */}
      <Typography variant="h6" fontWeight="bold" mb={1}>Attendance History</Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#4527a0" }}>
            <TableRow>
              {["Date", "Check-In", "Check-Out", "Hours Worked", "Status", "Notes"].map((h) => (
                <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {attendance.map((r) => {
              const hours = r.CheckIn_Time && r.CheckOut_Time
                ? ((new Date(r.CheckOut_Time) - new Date(r.CheckIn_Time)) / 3600000).toFixed(2) : null;
              return (
                <TableRow key={r._id} hover>
                  <TableCell>{new Date(r.Date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</TableCell>
                  <TableCell>{r.CheckIn_Time ? new Date(r.CheckIn_Time).toLocaleTimeString() : "—"}</TableCell>
                  <TableCell>{r.CheckOut_Time ? new Date(r.CheckOut_Time).toLocaleTimeString() : <Chip label="Active" color="success" size="small" />}</TableCell>
                  <TableCell>{hours ? `${hours} hrs` : "—"}</TableCell>
                  <TableCell><Chip label={r.Status} size="small" color={r.Status === "Present" ? "success" : r.Status === "Half-Day" ? "warning" : "error"} /></TableCell>
                  <TableCell>{r.Notes || "—"}</TableCell>
                </TableRow>
              );
            })}
            {!attendance.length && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: "#aaa" }}>No attendance records yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Check-In / Check-Out Notes Dialog ── */}
      <Dialog open={noteOpen} onClose={() => !submitting && setNoteOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader
          icon={isCheckin ? <LoginIcon /> : <LogoutIcon />}
          title={isCheckin ? "Confirm Check-In" : "Confirm Check-Out"}
          subtitle={`Time: ${new Date().toLocaleTimeString()}`}
          color={actionColor}
        />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          <TextField fullWidth label="Notes (optional)" multiline rows={2} value={notes}
            onChange={(e) => setNotes(e.target.value)} helperText=" "
            placeholder={isCheckin ? "e.g. Starting cleaning duties..." : "e.g. Completed repair work..."} />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setNoteOpen(false)} disabled={submitting} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}
            sx={{ bgcolor: actionColor, borderRadius: 2, px: 3, minWidth: 160 }}>
            {submitting ? <CircularProgress size={18} color="inherit" /> : `Confirm ${isCheckin ? "Check-In" : "Check-Out"}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Update Availability Dialog ── */}
      <Dialog open={statusOpen} onClose={() => setStatusOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<UpdateIcon />} title="Update Availability Status" subtitle="Select your current availability" color="#4527a0" />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          <Box display="flex" flexDirection="column" gap={1.5}>
            {["Available", "On Duty", "Off Duty"].map((s) => (
              <Button key={s} variant={availStatus === s ? "contained" : "outlined"} onClick={() => setAvailStatus(s)}
                sx={{
                  justifyContent: "flex-start", borderRadius: 2, py: 1.2,
                  ...(availStatus === s ? { bgcolor: "#4527a0" } : { borderColor: "#ccc", color: "#555" }),
                }}>
                {s}
              </Button>
            ))}
          </Box>
          {availError && <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>{availError}</Typography>}
        </DialogContent>
        <Divider sx={{ mt: 1 }} />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setStatusOpen(false)} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateStatus} disabled={!availStatus || updating}
            sx={{ bgcolor: "#4527a0", borderRadius: 2, px: 3, minWidth: 110, "&:disabled": { bgcolor: "#d1c4e9", color: "#fff" } }}>
            {updating ? <CircularProgress size={18} color="inherit" /> : "Update"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffAttendance;
