import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Alert, Chip, Card, CardContent,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import EditIcon from "@mui/icons-material/Edit";
import api from "../../api/axios";

const StaffAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [notes, setNotes] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteAction, setNoteAction] = useState(""); // "checkin" | "checkout"
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [availStatus, setAvailStatus] = useState("");
  const [statusOpen, setStatusOpen] = useState(false);

  const load = async () => {
    const { data } = await api.get("/staff/attendance/my");
    setAttendance(data);
    const today = new Date().toDateString();
    const rec = data.find((r) => new Date(r.Date).toDateString() === today);
    setTodayRecord(rec || null);
  };

  useEffect(() => { load(); }, []);

  const openAction = (action) => {
    setNoteAction(action);
    setNotes("");
    setNoteOpen(true);
  };

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    try {
      if (noteAction === "checkin") {
        await api.post("/staff/attendance/checkin", { Notes: notes });
        setSuccess("Checked in successfully!");
      } else {
        await api.post("/staff/attendance/checkout", { Notes: notes });
        setSuccess("Checked out successfully!");
      }
      setNoteOpen(false);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Action failed");
      setNoteOpen(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await api.put("/staff/me/availability", { Availability_Status: availStatus });
      setSuccess(`Availability updated to "${availStatus}"`);
      setStatusOpen(false);
      load();
    } catch (e) {
      setError("Failed to update status");
      setStatusOpen(false);
    }
  };

  const checkedInToday = todayRecord?.CheckIn_Time;
  const checkedOutToday = todayRecord?.CheckOut_Time;

  const presentCount = attendance.filter((r) => r.Status === "Present").length;
  const halfDayCount = attendance.filter((r) => r.Status === "Half-Day").length;
  const absentCount = attendance.filter((r) => r.Status === "Absent").length;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">Attendance Management</Typography>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => setStatusOpen(true)}
          sx={{ borderColor: "#4527a0", color: "#4527a0" }}
        >
          Update Availability
        </Button>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      {/* Action Buttons */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Today — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              onClick={() => openAction("checkin")}
              disabled={!!checkedInToday}
              sx={{ bgcolor: "#2e7d32", py: 1.5, px: 4 }}
            >
              {checkedInToday ? `Checked In at ${new Date(todayRecord.CheckIn_Time).toLocaleTimeString()}` : "Check In"}
            </Button>
            <Button
              variant="contained"
              size="large"
              startIcon={<LogoutIcon />}
              onClick={() => openAction("checkout")}
              disabled={!checkedInToday || !!checkedOutToday}
              color="error"
              sx={{ py: 1.5, px: 4 }}
            >
              {checkedOutToday ? `Checked Out at ${new Date(todayRecord.CheckOut_Time).toLocaleTimeString()}` : "Check Out"}
            </Button>
            {checkedInToday && (
              <Chip
                label={todayRecord.Status}
                color={todayRecord.Status === "Present" ? "success" : "warning"}
                sx={{ alignSelf: "center", fontSize: 14, py: 2 }}
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <Paper sx={{ p: 2, borderRadius: 2, flex: 1, minWidth: 120, textAlign: "center", bgcolor: "#e8f5e9" }}>
          <Typography variant="h4" fontWeight="bold" color="#2e7d32">{presentCount}</Typography>
          <Typography variant="body2">Present</Typography>
        </Paper>
        <Paper sx={{ p: 2, borderRadius: 2, flex: 1, minWidth: 120, textAlign: "center", bgcolor: "#fff8e1" }}>
          <Typography variant="h4" fontWeight="bold" color="#f57f17">{halfDayCount}</Typography>
          <Typography variant="body2">Half-Day</Typography>
        </Paper>
        <Paper sx={{ p: 2, borderRadius: 2, flex: 1, minWidth: 120, textAlign: "center", bgcolor: "#fce4ec" }}>
          <Typography variant="h4" fontWeight="bold" color="#c62828">{absentCount}</Typography>
          <Typography variant="body2">Absent</Typography>
        </Paper>
        <Paper sx={{ p: 2, borderRadius: 2, flex: 1, minWidth: 120, textAlign: "center", bgcolor: "#e3f2fd" }}>
          <Typography variant="h4" fontWeight="bold" color="#1565c0">{attendance.length}</Typography>
          <Typography variant="body2">Total Records</Typography>
        </Paper>
      </Box>

      {/* Attendance History */}
      <Typography variant="h6" fontWeight="bold" mb={1}>Attendance History</Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#4527a0" }}>
            <TableRow>
              {["Date", "Check-In Time", "Check-Out Time", "Hours Worked", "Status", "Notes"].map((h) => (
                <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {attendance.map((r) => {
              const hours = r.CheckIn_Time && r.CheckOut_Time
                ? ((new Date(r.CheckOut_Time) - new Date(r.CheckIn_Time)) / 3600000).toFixed(2)
                : null;
              return (
                <TableRow key={r._id} hover>
                  <TableCell>{new Date(r.Date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</TableCell>
                  <TableCell>{r.CheckIn_Time ? new Date(r.CheckIn_Time).toLocaleTimeString() : "—"}</TableCell>
                  <TableCell>{r.CheckOut_Time ? new Date(r.CheckOut_Time).toLocaleTimeString() : <Chip label="Active" color="success" size="small" />}</TableCell>
                  <TableCell>{hours ? `${hours} hrs` : "—"}</TableCell>
                  <TableCell>
                    <Chip
                      label={r.Status}
                      color={r.Status === "Present" ? "success" : r.Status === "Half-Day" ? "warning" : "error"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{r.Notes || "—"}</TableCell>
                </TableRow>
              );
            })}
            {!attendance.length && (
              <TableRow>
                <TableCell colSpan={6} align="center">No attendance records yet</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Check-In / Check-Out Notes Dialog */}
      <Dialog open={noteOpen} onClose={() => setNoteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{noteAction === "checkin" ? "Confirm Check-In" : "Confirm Check-Out"}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Time: <strong>{new Date().toLocaleTimeString()}</strong>
          </Typography>
          <TextField
            fullWidth
            label="Notes (optional)"
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Starting cleaning duties, Completed repair work..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ bgcolor: noteAction === "checkin" ? "#2e7d32" : "#c62828" }}
          >
            Confirm {noteAction === "checkin" ? "Check-In" : "Check-Out"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Availability Dialog */}
      <Dialog open={statusOpen} onClose={() => setStatusOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Update Availability Status</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={1} mt={1}>
            {["Available", "On Duty", "Off Duty"].map((s) => (
              <Button
                key={s}
                variant={availStatus === s ? "contained" : "outlined"}
                onClick={() => setAvailStatus(s)}
                sx={{ justifyContent: "flex-start" }}
              >
                {s}
              </Button>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateStatus} disabled={!availStatus} sx={{ bgcolor: "#4527a0" }}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffAttendance;
