import { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent, Grid, Chip, Alert, CircularProgress
} from "@mui/material";
import CampaignIcon      from "@mui/icons-material/Campaign";
import WarningAmberIcon  from "@mui/icons-material/WarningAmber";
import InfoIcon          from "@mui/icons-material/Info";
import BuildIcon         from "@mui/icons-material/Build";
import GroupsIcon        from "@mui/icons-material/Groups";
import api from "../../api/axios";

const typeColors = {
  Emergency:   "#c62828",
  Meeting:     "#1565c0",
  Maintenance: "#e65100",
  General:     "#1a237e",
};
const typeIcons = {
  Emergency:   <WarningAmberIcon />,
  Meeting:     <GroupsIcon />,
  Maintenance: <BuildIcon />,
  General:     <InfoIcon />,
};
const priorityColors = { High: "error", Medium: "warning", Low: "success" };

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/notices")
      .then(({ data }) => setNotices(data))
      .finally(() => setLoading(false));
  }, []);

  const emergency = notices.filter((n) => n.NoticeType === "Emergency");
  const regular   = notices.filter((n) => n.NoticeType !== "Emergency");

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress sx={{ color: "#1a237e" }} />
    </Box>
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={2}>Notice Board</Typography>

      {/* ── Summary Pills ── */}
      <Box display="flex" gap={1} mb={2.5} flexWrap="wrap">
        <Box sx={{ bgcolor: "#e8eaf6", borderRadius: 2, px: 2, py: 0.8 }}>
          <Typography variant="caption" color="#1a237e" fontWeight="bold">{notices.length} Total</Typography>
        </Box>
        {emergency.length > 0 && (
          <Box sx={{ bgcolor: "#ffebee", borderRadius: 2, px: 2, py: 0.8 }}>
            <Typography variant="caption" color="#c62828" fontWeight="bold">🚨 {emergency.length} Emergency</Typography>
          </Box>
        )}
        <Box sx={{ bgcolor: "#e8f5e9", borderRadius: 2, px: 2, py: 0.8 }}>
          <Typography variant="caption" color="#2e7d32" fontWeight="bold">{regular.length} Regular</Typography>
        </Box>
      </Box>

      {/* ── Emergency Alerts ── */}
      {emergency.map((n) => (
        <Alert severity="error" key={n._id} icon={<WarningAmberIcon />}
          sx={{ mb: 2, borderRadius: 2, fontWeight: "bold",
            "& .MuiAlert-message": { fontWeight: "bold" } }}>
          🚨 {n.Title}: {n.Content}
        </Alert>
      ))}

      {/* ── Regular Notices ── */}
      {regular.length > 0 ? (
        <Grid container spacing={2}>
          {regular.map((n) => (
            <Grid item xs={12} md={6} key={n._id}>
              <Card sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                height: "100%", display: "flex", flexDirection: "column" }}>
                {/* Type-colored header */}
                <Box sx={{ bgcolor: typeColors[n.NoticeType] || "#1a237e",
                  borderRadius: "8px 8px 0 0", px: 2.5, py: 1.8,
                  display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ color: "white", display: "flex", "& svg": { fontSize: 20 } }}>
                    {typeIcons[n.NoticeType] || <CampaignIcon />}
                  </Box>
                  <Typography variant="subtitle2" fontWeight="bold" color="white" noWrap sx={{ flex: 1 }}>
                    {n.Title}
                  </Typography>
                  <Chip label={n.NoticeType} size="small"
                    sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: "bold", border: "none", fontSize: 11 }} />
                </Box>

                <CardContent sx={{ flex: 1, pt: 2 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                    <Chip label={`Priority: ${n.Priority}`} color={priorityColors[n.Priority]} size="small" />
                  </Box>
                  <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.7 }}>{n.Content}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.5 }}>
                    Published: {new Date(n.PublishDate).toLocaleDateString()}
                    {n.ExpiryDate && ` · Expires: ${new Date(n.ExpiryDate).toLocaleDateString()}`}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <CampaignIcon sx={{ fontSize: 60, color: "#ddd", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" mb={0.5}>No Regular Notices</Typography>
          <Typography variant="body2" color="text.secondary">
            Check back later for updates from the society management
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Notices;
