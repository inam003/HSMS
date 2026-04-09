import { useEffect, useState } from "react";
import {
  Grid, Card, CardContent, Typography, Box, Chip, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from "@mui/material";
import ReceiptIcon        from "@mui/icons-material/Receipt";
import ReportProblemIcon  from "@mui/icons-material/ReportProblem";
import CampaignIcon       from "@mui/icons-material/Campaign";
import CheckCircleIcon    from "@mui/icons-material/CheckCircle";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

const StatCard = ({ label, value, color, bg, icon }) => (
  <Card sx={{ borderRadius: 2, borderLeft: `5px solid ${color}`, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", height: "100%" }}>
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

const SectionTitle = ({ icon, title, color }) => (
  <Box display="flex" alignItems="center" gap={1} mb={2}>
    <Box sx={{ bgcolor: color, borderRadius: 1.5, p: 0.8,
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Box sx={{ color: "white", display: "flex", "& svg": { fontSize: 18 } }}>{icon}</Box>
    </Box>
    <Typography variant="h6" fontWeight="bold">{title}</Typography>
  </Box>
);

const ResidentDashboard = () => {
  const { user } = useAuth();
  const [data, setData]     = useState({ bills: [], complaints: [], notices: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/bills/my-bills"), api.get("/complaints"), api.get("/notices")])
      .then(([b, c, n]) => setData({ bills: b.data, complaints: c.data, notices: n.data }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const unpaid        = data.bills.filter((b) => b.Status === "Unpaid").length;
  const paid          = data.bills.filter((b) => b.Status === "Paid").length;
  const pendingC      = data.complaints.filter((c) => c.Status === "Pending").length;
  const activeNotices = data.notices.filter((n) => n.IsActive).length;
  const emergency     = data.notices.filter((n) => n.NoticeType === "Emergency" && n.IsActive).length;

  const recentBills      = data.bills.slice(0, 5);
  const recentComplaints = data.complaints.slice(0, 4);
  const latestNotices    = data.notices.filter((n) => n.IsActive && n.NoticeType !== "Emergency").slice(0, 3);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress sx={{ color: "#1a237e" }} />
    </Box>
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={0.5}>Welcome, {user?.Name}!</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Resident Portal — Housing Society Management System
      </Typography>

      {emergency > 0 && (
        <Box sx={{ bgcolor: "#c62828", color: "white", p: 2, borderRadius: 2, mb: 3 }}>
          <Typography fontWeight="bold">
            🚨 {emergency} Emergency Alert(s) active — Check the Notice Board immediately
          </Typography>
        </Box>
      )}

      {/* ── Stat Cards ── */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={3}>
          <StatCard label="Unpaid Bills"    value={unpaid}        color="#c62828" bg="#ffebee" icon={<ReceiptIcon />} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Paid Bills"      value={paid}          color="#2e7d32" bg="#e8f5e9" icon={<CheckCircleIcon />} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Complaints"      value={pendingC}      color="#e65100" bg="#fff3e0" icon={<ReportProblemIcon />} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Active Notices"  value={activeNotices} color="#1a237e" bg="#e8eaf6" icon={<CampaignIcon />} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* ── Recent Bills ── */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <SectionTitle icon={<ReceiptIcon />} title="Recent Bills" color="#c62828" />
              {recentBills.length ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ "& th": { fontWeight: "bold", color: "#555", py: 0.8 } }}>
                        <TableCell>Type</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentBills.map((b) => (
                        <TableRow key={b._id} hover>
                          <TableCell>{b.Bill_Type}</TableCell>
                          <TableCell>PKR {Number(b.Amount).toLocaleString()}</TableCell>
                          <TableCell>{new Date(b.Due_Date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Chip label={b.Status} color={b.Status === "Paid" ? "success" : "error"} size="small" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                  No bills found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ── Recent Complaints ── */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <SectionTitle icon={<ReportProblemIcon />} title="Recent Complaints" color="#e65100" />
              {recentComplaints.length ? recentComplaints.map((c, i) => (
                <Box key={c._id} sx={{ py: 1.5, borderBottom: i < recentComplaints.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip label={c.Category} size="small"
                      sx={{ bgcolor: "#e8eaf6", color: "#1a237e", fontWeight: "bold", fontSize: 11 }} />
                    <Chip label={c.Status}
                      color={c.Status === "Resolved" ? "success" : c.Status === "In Progress" ? "info" : "warning"}
                      size="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {c.Description?.length > 70 ? c.Description.substring(0, 70) + "..." : c.Description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              )) : (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                  No complaints submitted
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ── Latest Notices ── */}
        {latestNotices.length > 0 && (
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <SectionTitle icon={<CampaignIcon />} title="Latest Notices" color="#1a237e" />
                <Grid container spacing={2}>
                  {latestNotices.map((n) => (
                    <Grid item xs={12} sm={4} key={n._id}>
                      <Box sx={{ p: 2, borderRadius: 2, border: "1px solid #e8eaf6", borderLeft: "4px solid #1a237e" }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                          <Typography variant="body2" fontWeight="bold" sx={{ flex: 1, mr: 1 }}>{n.Title}</Typography>
                          <Chip label={n.Priority}
                            color={n.Priority === "High" ? "error" : n.Priority === "Medium" ? "warning" : "success"}
                            size="small" />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {n.Content?.length > 90 ? n.Content.substring(0, 90) + "..." : n.Content}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ResidentDashboard;
