import { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent, Grid, Chip, Alert, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Divider, CircularProgress
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LogoutIcon      from "@mui/icons-material/Logout";
import LoginIcon       from "@mui/icons-material/Login";
import BadgeIcon       from "@mui/icons-material/Badge";
import EventNoteIcon   from "@mui/icons-material/EventNote";
import AccessTimeIcon  from "@mui/icons-material/AccessTime";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

const StatCard = ({ label, value, color, bg, icon }) => (
  <Card sx={{ borderRadius: 2, borderLeft: `5px solid ${color}`,
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)", height: "100%" }}>
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight="medium" mb={1}>{label}</Typography>
          <Typography variant="h3" fontWeight="bold" color={color} lineHeight={1}>{value}</Typography>
        </Box>
        <Box sx={{ bgcolor: bg, borderRadius: "50%", width: 56, height: 56, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Box sx={{ color, display: "flex", "& svg": { fontSize: 28 } }}>{icon}</Box>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const InfoRow = ({ label, value }) => (
  <Box display="flex" justifyContent="space-between" alignItems="center"
    sx={{ py: 1.1, borderBottom: "1px solid #f5f5f5" }}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography variant="body2" fontWeight="bold">{value}</Typography>
  </Box>
);

const StaffDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile]       = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [success, setSuccess]       = useState("");
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(true);

  const load = async () => {
    try {
      const [p, a] = await Promise.all([
        api.get("/staff/me"),
        api.get("/staff/attendance/my"),
      ]);
      setProfile(p.data);
      setAttendance(a.data);
      const today = new Date().toDateString();
      const rec   = a.data.find((r) => new Date(r.Date).toDateString() === today);
      setTodayRecord(rec || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const handleCheckIn = async () => {
    setError(""); setSuccess("");
    try {
      await api.post("/staff/attendance/checkin");
      setSuccess("Checked in successfully! Have a productive day.");
      load();
    } catch (e) { setError(e.response?.data?.message || "Check-in failed"); }
  };

  const handleCheckOut = async () => {
    setError(""); setSuccess("");
    try {
      await api.post("/staff/attendance/checkout");
      setSuccess("Checked out successfully! See you tomorrow.");
      load();
    } catch (e) { setError(e.response?.data?.message || "Check-out failed"); }
  };

  const checkedInToday  = todayRecord?.CheckIn_Time;
  const checkedOutToday = todayRecord?.CheckOut_Time;
  const presentCount    = attendance.filter((r) => r.Status === "Present").length;
  const halfDayCount    = attendance.filter((r) => r.Status === "Half-Day").length;
  const absentCount     = attendance.filter((r) => r.Status === "Absent").length;

  const statusColor = { Available: "success", "On Duty": "warning", "Off Duty": "default" };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress sx={{ color: "#1a237e" }} />
    </Box>
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={0.5}>Staff Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Welcome back, {user?.Name} — {user?.Type}
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}
      {error   && <Alert severity="error"   sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError("")}>{error}</Alert>}

      {/* ── Stat Cards ── */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={3}>
          <StatCard label="Days Present"  value={presentCount}  color="#2e7d32" bg="#e8f5e9" icon={<CheckCircleIcon />} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Half Days"     value={halfDayCount}  color="#f57f17" bg="#fff8e1" icon={<AccessTimeIcon />} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Absent"        value={absentCount}   color="#c62828" bg="#ffebee" icon={<EventNoteIcon />} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Total Records" value={attendance.length} color="#4527a0" bg="#ede7f6" icon={<BadgeIcon />} />
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={3}>
        {/* ── Profile Card ── */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden", height: "100%" }}>
            <Box sx={{ bgcolor: "#4527a0", px: 2.5, py: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ bgcolor: "rgba(255,255,255,0.15)", borderRadius: "50%", p: 1, display: "flex" }}>
                <BadgeIcon sx={{ color: "white", fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="white">My Profile</Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                  Staff details & credentials
                </Typography>
              </Box>
            </Box>
            <CardContent sx={{ p: 2.5 }}>
              <InfoRow label="Name"        value={profile?.Name} />
              <InfoRow label="Type"        value={profile?.Type} />
              <InfoRow label="CNIC" value={profile?.Aadhar_CNIC_No || "—"} />
              <InfoRow label="Rating"      value={`${"⭐".repeat(Math.round(profile?.Rating || 0))} ${profile?.Rating || 0}/5`} />
              <Box sx={{ py: 1.1, borderBottom: "1px solid #f5f5f5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Chip label={profile?.Availability_Status} size="small"
                  color={statusColor[profile?.Availability_Status] || "default"} />
              </Box>
              <Box sx={{ py: 1.1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">Entry Code</Typography>
                <Chip label={profile?.Entry_Code} color="success" size="small"
                  sx={{ fontFamily: "monospace", fontWeight: "bold", letterSpacing: 2 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Today's Attendance ── */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden", height: "100%" }}>
            <Box sx={{ bgcolor: checkedInToday ? "#2e7d32" : "#1a237e", px: 2.5, py: 2,
              display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ bgcolor: "rgba(255,255,255,0.15)", borderRadius: "50%", p: 1, display: "flex" }}>
                <AccessTimeIcon sx={{ color: "white", fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="white">Today's Attendance</Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </Typography>
              </Box>
            </Box>
            <CardContent sx={{ p: 2.5 }}>
              {checkedInToday ? (
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                    <CheckCircleIcon color="success" />
                    <Typography>Check-In: <strong>{new Date(todayRecord.CheckIn_Time).toLocaleTimeString()}</strong></Typography>
                  </Box>
                  {checkedOutToday ? (
                    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                      <CheckCircleIcon sx={{ color: "#c62828" }} />
                      <Typography>Check-Out: <strong>{new Date(todayRecord.CheckOut_Time).toLocaleTimeString()}</strong></Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" mb={1.5}>Not yet checked out</Typography>
                  )}
                  <Chip label={todayRecord.Status} size="small"
                    color={todayRecord.Status === "Present" ? "success" : "warning"} sx={{ mb: 2 }} />
                </Box>
              ) : (
                <Typography color="text.secondary" mb={2}>No attendance recorded today yet.</Typography>
              )}
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" gap={2} flexWrap="wrap">
                {!checkedInToday && (
                  <Button variant="contained" startIcon={<LoginIcon />} onClick={handleCheckIn}
                    sx={{ bgcolor: "#2e7d32", borderRadius: 2, px: 3 }}>Check In</Button>
                )}
                {checkedInToday && !checkedOutToday && (
                  <Button variant="contained" startIcon={<LogoutIcon />} onClick={handleCheckOut}
                    color="error" sx={{ borderRadius: 2, px: 3 }}>Check Out</Button>
                )}
                {checkedOutToday && <Chip label="✓ Shift Complete" color="success" sx={{ fontSize: 14, py: 1.5 }} />}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Recent Attendance Table ── */}
      <Card sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Box sx={{ bgcolor: "#4527a0", borderRadius: 1.5, p: 0.8, display: "flex" }}>
              <EventNoteIcon sx={{ color: "white", fontSize: 18 }} />
            </Box>
            <Typography variant="h6" fontWeight="bold">Recent Attendance</Typography>
          </Box>
          <TableContainer>
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
                        <Chip label={r.Status} size="small"
                          color={r.Status === "Present" ? "success" : r.Status === "Half-Day" ? "warning" : "error"} />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!attendance.length && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: "#aaa" }}>
                      No attendance records yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StaffDashboard;
