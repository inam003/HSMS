import { useState } from "react";
import {
  Box, Typography, Button, Card, CardContent, Alert, CircularProgress, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField
} from "@mui/material";
import SosIcon from "@mui/icons-material/Sos";
import WarningIcon from "@mui/icons-material/Warning";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const SOS = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    setLoading(true); setError("");
    try {
      await api.post("/notices/sos", { location });
      setSent(true); setOpen(false);
    } catch (e) { setError(e.response?.data?.message || "Failed to send SOS"); }
    setLoading(false);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
      <Card sx={{ maxWidth: 500, width: "100%", borderRadius: 3, boxShadow: 3, textAlign: "center" }}>
        <CardContent sx={{ p: 5 }}>
          <WarningIcon sx={{ fontSize: 80, color: "#c62828", mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" color="#c62828" mb={1}>Emergency SOS</Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Press the button below to send an immediate emergency alert to security personnel and emergency contacts.
          </Typography>

          {sent ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              🚨 SOS Alert sent successfully! Security has been notified.
            </Alert>
          ) : (
            <>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Button
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SosIcon />}
                onClick={() => setOpen(true)}
                disabled={loading}
                sx={{
                  bgcolor: "#c62828", "&:hover": { bgcolor: "#b71c1c" },
                  py: 2, px: 6, fontSize: 20, fontWeight: "bold", borderRadius: 3,
                  animation: "pulse 1.5s infinite",
                  "@keyframes pulse": {
                    "0%": { boxShadow: "0 0 0 0 rgba(198,40,40,0.7)" },
                    "70%": { boxShadow: "0 0 0 15px rgba(198,40,40,0)" },
                    "100%": { boxShadow: "0 0 0 0 rgba(198,40,40,0)" },
                  },
                }}
              >
                SEND SOS ALERT
              </Button>
              <Typography variant="caption" color="text.secondary" display="block" mt={2}>
                Resident: {user?.Name}
              </Typography>
            </>
          )}

          {sent && (
            <Button variant="outlined" color="error" sx={{ mt: 2 }} onClick={() => setSent(false)}>
              Send Another Alert
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm SOS Alert</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Are you sure? This will immediately alert all security personnel.
          </Typography>
          <TextField fullWidth label="Location / Description (optional)" multiline rows={2} value={location} onChange={(e) => setLocation(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel (False Alarm)</Button>
          <Button variant="contained" color="error" onClick={handleSend} disabled={loading}>
            {loading ? "Sending..." : "YES, SEND SOS"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SOS;
