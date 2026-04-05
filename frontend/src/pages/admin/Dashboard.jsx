import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Grid, Card, CardContent, Typography, Box, CircularProgress,
  Chip, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, Divider, Avatar, List, ListItem,
  ListItemAvatar, ListItemText
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import ApartmentIcon from "@mui/icons-material/Apartment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import SecurityIcon from "@mui/icons-material/Security";
import SpaIcon from "@mui/icons-material/Spa";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CampaignIcon from "@mui/icons-material/Campaign";
import AddIcon from "@mui/icons-material/Add";
import AssessmentIcon from "@mui/icons-material/Assessment";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

/* ── Stat Card ─────────────────────────────────────────────────────────── */
const StatCard = ({ title, value, icon, color, subtitle, onClick }) => (
  <Card
    onClick={onClick}
    sx={{
      borderRadius: 3,
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      borderLeft: `5px solid ${color}`,
      cursor: onClick ? "pointer" : "default",
      transition: "transform 0.15s, box-shadow 0.15s",
      "&:hover": onClick ? { transform: "translateY(-3px)", boxShadow: "0 6px 20px rgba(0,0,0,0.12)" } : {},
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500} mb={0.5}>
            {title}
          </Typography>
          <Typography variant="h3" fontWeight="bold" color={color} lineHeight={1}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            bgcolor: `${color}18`,
            color,
            p: 2,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

/* ── Quick Action Button ───────────────────────────────────────────────── */
const QuickAction = ({ label, icon, color, onClick }) => (
  <Button
    fullWidth
    variant="outlined"
    startIcon={icon}
    onClick={onClick}
    sx={{
      justifyContent: "flex-start",
      py: 1.4,
      px: 2,
      borderRadius: 2,
      borderColor: `${color}50`,
      color,
      fontWeight: 600,
      fontSize: 13,
      "&:hover": { bgcolor: `${color}10`, borderColor: color },
    }}
  >
    {label}
  </Button>
);

/* ── Status dot ────────────────────────────────────────────────────────── */
const statusColor = { Pending: "#e65100", "In Progress": "#1565c0", Resolved: "#2e7d32" };

/* ═══════════════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]         = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices]     = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [residents, units, bills, comp, guards, amenities, noticesRes] = await Promise.all([
          api.get("/residents"),
          api.get("/units"),
          api.get("/bills"),
          api.get("/complaints"),
          api.get("/guards"),
          api.get("/amenities"),
          api.get("/notices"),
        ]);
        setStats({
          residents:        residents.data.length,
          units:            units.data.length,
          occupiedUnits:    units.data.filter((u) => u.Status === "Occupied").length,
          vacantUnits:      units.data.filter((u) => u.Status === "Vacant").length,
          unpaidBills:      bills.data.filter((b) => b.Status === "Unpaid").length,
          totalBills:       bills.data.length,
          pendingComplaints: comp.data.filter((c) => c.Status === "Pending").length,
          guards:           guards.data.length,
          amenities:        amenities.data.length,
        });
        setComplaints(comp.data.slice(0, 5));
        setNotices(noticesRes.data.filter((n) => n.IsActive).slice(0, 4));
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress size={48} sx={{ color: "#1a237e" }} />
    </Box>
  );

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <Box>
      {/* ── Header ── */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1a237e 0%, #283593 60%, #3949ab 100%)",
          borderRadius: 3,
          p: 3,
          mb: 3,
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Welcome back, {user?.Name}!
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
            Housing Society Management System &mdash; Admin Dashboard
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.65 }}>{today}</Typography>
        </Box>
      </Box>

      {/* ── Stat Cards ── */}
      <Grid container spacing={2.5} mb={3}>
        {[
          { title: "Total Residents",    value: stats?.residents ?? 0,        icon: <PeopleIcon fontSize="large" />,       color: "#1a237e", subtitle: "Registered members",                    path: "/admin/members" },
          { title: "Total Units",        value: stats?.units ?? 0,            icon: <ApartmentIcon fontSize="large" />,    color: "#2e7d32", subtitle: `${stats?.vacantUnits ?? 0} Vacant`,     path: "/admin/units" },
          { title: "Unpaid Bills",       value: stats?.unpaidBills ?? 0,      icon: <ReceiptIcon fontSize="large" />,      color: "#c62828", subtitle: `Out of ${stats?.totalBills ?? 0} total`, path: "/admin/bills" },
          { title: "Pending Complaints", value: stats?.pendingComplaints ?? 0, icon: <ReportProblemIcon fontSize="large" />, color: "#e65100", subtitle: "Awaiting action",                     path: "/admin/complaints" },
          { title: "Security Guards",    value: stats?.guards ?? 0,           icon: <SecurityIcon fontSize="large" />,     color: "#4527a0", subtitle: "On duty roster",                        path: "/admin/guards" },
          { title: "Amenities",          value: stats?.amenities ?? 0,        icon: <SpaIcon fontSize="large" />,          color: "#00695c", subtitle: "Available facilities",                  path: "/admin/amenities" },
        ].map((card) => (
          <Grid item xs={12} sm={6} lg={4} key={card.title}>
            <StatCard {...card} onClick={() => navigate(card.path)} />
          </Grid>
        ))}
      </Grid>

      {/* ── Bottom Section ── */}
      <Grid container spacing={2.5}>

        {/* Recent Complaints */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", height: "100%" }}>
            <CardContent sx={{ p: 0 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" px={3} pt={2.5} pb={1.5}>
                <Box display="flex" alignItems="center" gap={1}>
                  <ReportProblemIcon sx={{ color: "#e65100", fontSize: 20 }} />
                  <Typography fontWeight="bold" fontSize={15}>Recent Complaints</Typography>
                </Box>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate("/admin/complaints")}
                  sx={{ color: "#1a237e", textTransform: "none", fontWeight: 600 }}
                >
                  View All
                </Button>
              </Box>
              <Divider />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                      {["Resident", "Category", "Status", "Date"].map((h) => (
                        <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12, color: "#555" }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {complaints.map((c) => (
                      <TableRow key={c._id} hover>
                        <TableCell sx={{ fontSize: 13 }}>{c.resident?.Name || "—"}</TableCell>
                        <TableCell sx={{ fontSize: 13 }}>{c.Category || "General"}</TableCell>
                        <TableCell>
                          <Chip
                            label={c.Status}
                            size="small"
                            sx={{
                              bgcolor: `${statusColor[c.Status]}18`,
                              color: statusColor[c.Status],
                              fontWeight: 700,
                              fontSize: 11,
                              border: `1px solid ${statusColor[c.Status]}40`,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: 12, color: "#888" }}>
                          {new Date(c.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!complaints.length && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4, color: "#aaa" }}>
                          No complaints yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={5}>
          <Grid container spacing={2.5} direction="column">

            {/* Quick Actions */}
            <Grid item>
              <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography fontWeight="bold" fontSize={15} mb={2}>Quick Actions</Typography>
                  <Grid container spacing={1.5}>
                    {[
                      { label: "Add Resident",     icon: <AddIcon fontSize="small" />,        color: "#1a237e", path: "/admin/members" },
                      { label: "Create Notice",    icon: <CampaignIcon fontSize="small" />,    color: "#2e7d32", path: "/admin/notices" },
                      { label: "Generate Bills",   icon: <ReceiptIcon fontSize="small" />,     color: "#c62828", path: "/admin/bills" },
                      { label: "View Reports",     icon: <AssessmentIcon fontSize="small" />,  color: "#4527a0", path: "/admin/reports" },
                      { label: "Create Poll",      icon: <HowToVoteIcon fontSize="small" />,   color: "#00695c", path: "/admin/polls" },
                      { label: "Manage Units",     icon: <ApartmentIcon fontSize="small" />,   color: "#e65100", path: "/admin/units" },
                    ].map((a) => (
                      <Grid item xs={6} key={a.label}>
                        <QuickAction {...a} onClick={() => navigate(a.path)} />
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Active Notices */}
            <Grid item>
              <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ p: 0 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" px={2.5} pt={2} pb={1.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CampaignIcon sx={{ color: "#2e7d32", fontSize: 20 }} />
                      <Typography fontWeight="bold" fontSize={15}>Active Notices</Typography>
                    </Box>
                    <Button
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => navigate("/admin/notices")}
                      sx={{ color: "#1a237e", textTransform: "none", fontWeight: 600 }}
                    >
                      View All
                    </Button>
                  </Box>
                  <Divider />
                  <List dense disablePadding>
                    {notices.map((n, i) => (
                      <Box key={n._id}>
                        <ListItem sx={{ px: 2.5, py: 1.2 }}>
                          <ListItemAvatar sx={{ minWidth: 36 }}>
                            <FiberManualRecordIcon
                              sx={{
                                fontSize: 10,
                                color: n.NoticeType === "Emergency" ? "#c62828"
                                  : n.Priority === "High" ? "#e65100"
                                  : "#2e7d32",
                              }}
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography fontSize={13} fontWeight={600} noWrap>{n.Title}</Typography>
                            }
                            secondary={
                              <Box display="flex" gap={0.8} mt={0.3}>
                                <Chip
                                  label={n.NoticeType}
                                  size="small"
                                  sx={{ fontSize: 10, height: 18,
                                    bgcolor: n.NoticeType === "Emergency" ? "#ffebee" : "#e8f5e9",
                                    color: n.NoticeType === "Emergency" ? "#c62828" : "#2e7d32",
                                  }}
                                />
                                <Chip
                                  label={n.Priority}
                                  size="small"
                                  sx={{ fontSize: 10, height: 18, bgcolor: "#f3e5f5", color: "#6a1b9a" }}
                                />
                              </Box>
                            }
                          />
                        </ListItem>
                        {i < notices.length - 1 && <Divider component="li" sx={{ ml: 2.5 }} />}
                      </Box>
                    ))}
                    {!notices.length && (
                      <ListItem sx={{ px: 2.5, py: 3, justifyContent: "center" }}>
                        <Typography variant="body2" color="text.secondary">No active notices</Typography>
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>

          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
