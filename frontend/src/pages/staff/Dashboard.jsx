import { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent, Grid, Chip, Alert, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import BadgeIcon from "@mui/icons-material/Badge";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

const StaffDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [p, a] = await Promise.all([
        api.get("/staff/me"),
        api.get("/staff/attendance/my"),
      ]);
      setProfile(p.data);
      setAttendance(a.data);

      const today = new Date().toDateString();
      const rec = a.data.find((r) => new Date(r.Date).toDateString() === today);
      setTodayRecord(rec || null);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCheckIn = async () => {
    setError(""); setSuccess("");
    try {
      await api.post("/staff/attendance/checkin");
      setSuccess("Checked in successfully! Have a productive day.");
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Check-in failed");
    }
  };

  const handleCheckOut = async () => {
    setError(""); setSuccess("");
    try {
      await api.post("/staff/attendance/checkout");
      setSuccess("Checked out successfully! See you tomorrow.");
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Check-out failed");
    }
  };

  const checkedInToday = todayRecord?.CheckIn_Time;
  const checkedOutToday = todayRecord?.CheckOut_Time;

  const statusColor = {
    Available: "success",
    "On Duty": "warning",
    "Off Duty": "default",
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={1}>Staff Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Welcome back, {user?.Name} — {user?.Type}
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Grid container spacing={3} mb={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <BadgeIcon sx={{ color: "#4527a0" }} />
                <Typography variant="h6" fontWeight="bold">My Profile</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">Name</Typography>
              <Typography fontWeight="bold" mb={1}>{profile?.Name}</Typography>
              <Typography variant="body2" color="text.secondary">Type</Typography>
              <Typography fontWeight="bold" mb={1}>{profile?.Type}</Typography>
              <Typography variant="body2" color="text.secondary">CNIC / Aadhar</Typography>
              <Typography fontWeight="bold" mb={1}>{profile?.Aadhar_CNIC_No || "—"}</Typography>
              <Typography variant="body2" color="text.secondary">Entry Code</Typography>
              <Chip label={profile?.Entry_Code} color="success" size="small" sx={{ fontFamily: "monospace", fontWeight: "bold", letterSpacing: 2 }} />
              <Box mt={1}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Chip
                  label={profile?.Availability_Status}
                  color={statusColor[profile?.Availability_Status] || "default"}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" mt={1}>Rating</Typography>
              <Typography fontWeight="bold">{"⭐".repeat(Math.round(profile?.Rating || 0))} {profile?.Rating}/5</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Attendance Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, height: "100%", border: checkedInToday ? "2px solid #2e7d32" : "2px solid #e0e0e0" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>Today's Attendance</Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </Typography>
              <Divider sx={{ my: 2 }} />
              {checkedInToday ? (
                <>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <CheckCircleIcon color="success" />
                    <Typography>Check-In: <strong>{new Date(todayRecord.CheckIn_Time).toLocaleTimeString()}</strong></Typography>
                  </Box>
                  {checkedOutToday ? (
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <CheckCircleIcon color="error" />
                      <Typography>Check-Out: <strong>{new Date(todayRecord.CheckOut_Time).toLocaleTimeString()}</strong></Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" mb={1}>Not yet checked out</Typography>
                  )}
                  <Chip
                    label={todayRecord.Status}
                    color={todayRecord.Status === "Present" ? "success" : "warning"}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </>
              ) : (
                <Typography color="text.secondary">No attendance recorded yet today.</Typography>
              )}

              <Box display="flex" gap={1} mt={3} flexWrap="wrap">
                {!checkedInToday && (
                  <Button
                    variant="contained"
                    startIcon={<LoginIcon />}
                    onClick={handleCheckIn}
                    sx={{ bgcolor: "#2e7d32" }}
                  >
                    Check In
                  </Button>
                )}
                {checkedInToday && !checkedOutToday && (
                  <Button
                    variant="contained"
                    startIcon={<LogoutIcon />}
                    onClick={handleCheckOut}
                    color="error"
                  >
                    Check Out
                  </Button>
                )}
                {checkedOutToday && (
                  <Chip label="Shift Complete ✓" color="success" />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Stats Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>This Month</Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box textAlign="center" sx={{ bgcolor: "#e8f5e9", p: 2, borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight="bold" color="#2e7d32">
                    {attendance.filter((r) => r.Status === "Present").length}
                  </Typography>
                  <Typography variant="body2">Days Present</Typography>
                </Box>
                <Box textAlign="center" sx={{ bgcolor: "#fff8e1", p: 2, borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight="bold" color="#f57f17">
                    {attendance.filter((r) => r.Status === "Half-Day").length}
                  </Typography>
                  <Typography variant="body2">Half Days</Typography>
                </Box>
                <Box textAlign="center" sx={{ bgcolor: "#fce4ec", p: 2, borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight="bold" color="#c62828">
                    {attendance.filter((r) => r.Status === "Absent").length}
                  </Typography>
                  <Typography variant="body2">Absent</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Attendance Table */}
      <Typography variant="h6" fontWeight="bold" mb={1}>Recent Attendance (Last 10)</Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#4527a0" }}>
            <TableRow>
              {["Date", "Check-In", "Check-Out", "Hours", "Status"].map((h) => (
                <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {attendance.slice(0, 10).map((r) => {
              const hours = r.CheckIn_Time && r.CheckOut_Time
                ? ((new Date(r.CheckOut_Time) - new Date(r.CheckIn_Time)) / 3600000).toFixed(1)
                : "—";
              return (
                <TableRow key={r._id} hover>
                  <TableCell>{new Date(r.Date).toLocaleDateString()}</TableCell>
                  <TableCell>{r.CheckIn_Time ? new Date(r.CheckIn_Time).toLocaleTimeString() : "—"}</TableCell>
                  <TableCell>{r.CheckOut_Time ? new Date(r.CheckOut_Time).toLocaleTimeString() : "—"}</TableCell>
                  <TableCell>{hours !== "—" ? `${hours} hrs` : "—"}</TableCell>
                  <TableCell>
                    <Chip
                      label={r.Status}
                      color={r.Status === "Present" ? "success" : r.Status === "Half-Day" ? "warning" : "error"}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            {!attendance.length && (
              <TableRow>
                <TableCell colSpan={5} align="center">No attendance records yet</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StaffDashboard;
