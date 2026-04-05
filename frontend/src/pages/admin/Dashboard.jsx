import { useEffect, useState } from "react";
import { Grid, Card, CardContent, Typography, Box, CircularProgress, Chip } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import ApartmentIcon from "@mui/icons-material/Apartment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import SecurityIcon from "@mui/icons-material/Security";
import SpaIcon from "@mui/icons-material/Spa";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
          <Typography variant="h4" fontWeight="bold" color={color}>{value}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
        </Box>
        <Box sx={{ bgcolor: `${color}20`, p: 1.5, borderRadius: 2, color }}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [residents, units, bills, complaints, guards, amenities] = await Promise.all([
          api.get("/residents"),
          api.get("/units"),
          api.get("/bills"),
          api.get("/complaints"),
          api.get("/guards"),
          api.get("/amenities"),
        ]);
        setStats({
          residents: residents.data.length,
          units: units.data.length,
          occupiedUnits: units.data.filter((u) => u.Status === "Occupied").length,
          unpaidBills: bills.data.filter((b) => b.Status === "Unpaid").length,
          pendingComplaints: complaints.data.filter((c) => c.Status === "Pending").length,
          guards: guards.data.length,
          amenities: amenities.data.length,
        });
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={1}>Welcome back, {user?.Name}!</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>Housing Society Management System — Admin Dashboard</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total Residents" value={stats?.residents ?? 0} icon={<PeopleIcon />} color="#1a237e" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total Units" value={stats?.units ?? 0} icon={<ApartmentIcon />} color="#2e7d32" subtitle={`${stats?.occupiedUnits ?? 0} Occupied`} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Unpaid Bills" value={stats?.unpaidBills ?? 0} icon={<ReceiptIcon />} color="#c62828" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Pending Complaints" value={stats?.pendingComplaints ?? 0} icon={<ReportProblemIcon />} color="#e65100" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Security Guards" value={stats?.guards ?? 0} icon={<SecurityIcon />} color="#4527a0" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Amenities" value={stats?.amenities ?? 0} icon={<SpaIcon />} color="#00695c" />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
