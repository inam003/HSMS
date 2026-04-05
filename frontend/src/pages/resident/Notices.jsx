import { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent, Grid, Chip, Alert
} from "@mui/material";
import api from "../../api/axios";

const priorityColors = { High: "error", Medium: "warning", Low: "success" };
const typeColors = { Emergency: "error", Meeting: "info", Maintenance: "warning", General: "default" };

const Notices = () => {
  const [notices, setNotices] = useState([]);

  useEffect(() => { api.get("/notices").then(({ data }) => setNotices(data)); }, []);

  const emergency = notices.filter((n) => n.NoticeType === "Emergency");
  const regular = notices.filter((n) => n.NoticeType !== "Emergency");

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={2}>Notice Board</Typography>
      {emergency.map((n) => (
        <Alert severity="error" key={n._id} sx={{ mb: 2, fontWeight: "bold" }}>
          🚨 {n.Title}: {n.Content}
        </Alert>
      ))}
      <Grid container spacing={2}>
        {regular.map((n) => (
          <Grid item xs={12} md={6} key={n._id}>
            <Card sx={{ borderRadius: 2, borderLeft: `4px solid #1a237e` }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="h6">{n.Title}</Typography>
                  <Chip label={n.Priority} color={priorityColors[n.Priority]} size="small" />
                </Box>
                <Chip label={n.NoticeType} color={typeColors[n.NoticeType]} size="small" sx={{ mb: 1 }} />
                <Typography variant="body2">{n.Content}</Typography>
                <Typography variant="caption" color="text.secondary" mt={1} display="block">
                  {new Date(n.PublishDate).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {!notices.length && <Grid item xs={12}><Typography color="text.secondary" align="center">No active notices</Typography></Grid>}
      </Grid>
    </Box>
  );
};

export default Notices;
