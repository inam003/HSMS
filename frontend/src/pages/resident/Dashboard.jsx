import { useEffect, useState } from "react";
import { Grid, Card, CardContent, Typography, Box, Chip } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

const ResidentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ bills: [], complaints: [], notices: [] });

  useEffect(() => {
    Promise.all([api.get("/bills/my-bills"), api.get("/complaints"), api.get("/notices")])
      .then(([b, c, n]) => setData({ bills: b.data, complaints: c.data, notices: n.data }))
      .catch(() => {});
  }, []);

  const unpaid = data.bills.filter((b) => b.Status === "Unpaid").length;
  const pending = data.complaints.filter((c) => c.Status === "Pending").length;
  const emergency = data.notices.filter((n) => n.NoticeType === "Emergency" && n.IsActive).length;

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={1}>Welcome, {user?.Name}!</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>Resident Portal — Housing Society Management System</Typography>
      {emergency > 0 && (
        <Box sx={{ bgcolor: "#c62828", color: "white", p: 2, borderRadius: 2, mb: 2 }}>
          🚨 {emergency} Emergency Alert(s) active — Check Notices
        </Box>
      )}
      <Grid container spacing={3}>
        {[
          { label: "Unpaid Bills", value: unpaid, color: "#c62828" },
          { label: "Pending Complaints", value: pending, color: "#e65100" },
          { label: "Active Notices", value: data.notices.filter((n) => n.IsActive).length, color: "#1a237e" },
        ].map((s) => (
          <Grid item xs={12} sm={4} key={s.label}>
            <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">{s.label}</Typography>
                <Typography variant="h4" fontWeight="bold" color={s.color}>{s.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ResidentDashboard;
