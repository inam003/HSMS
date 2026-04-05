import { useState } from "react";
import {
  Box, Typography, Button, Card, CardContent, Alert, CircularProgress, Dialog,
  DialogContent, DialogActions, TextField, Divider
} from "@mui/material";
import SosIcon from "@mui/icons-material/Sos";
import WarningIcon from "@mui/icons-material/Warning";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const SOS = () => {
  const { user } = useAuth();
  const [open, setOpen]         = useState(false);
  const [location, setLocation] = useState("");
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState("");

  const handleSend = async () => {
    setLoading(true); setError("");
    try {
      await api.post("/notices/sos", { location });
      setSent(true); setOpen(false);
    } catch (e) { setError(e.response?.data?.message || "Failed to send SOS"); }
    finally { setLoading(false); }
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
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              🚨 SOS Alert sent successfully! Security has been notified.
            </Alert>
          ) : (
            <>
              {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
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
                    "0%":   { boxShadow: "0 0 0 0 rgba(198,40,40,0.7)" },
                    "70%":  { boxShadow: "0 0 0 15px rgba(198,40,40,0)" },
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
            <Button variant="outlined" color="error" sx={{ mt: 2, borderRadius: 2 }} onClick={() => setSent(false)}>
              Send Another Alert
            </Button>
          )}
        </CardContent>
      </Card>

      {/* ── SOS Confirmation Dialog ── */}
      <Dialog open={open} onClose={() => !loading && setOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <Box sx={{ bgcolor: "#c62828", px: 3, py: 2.5, borderRadius: "12px 12px 0 0" }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <WarningIcon sx={{ color: "rgba(255,255,255,0.85)" }} />
            <Box>
              <Typography variant="h6" fontWeight="bold" color="white">Confirm SOS Alert</Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>This will alert all security personnel immediately</Typography>
            </Box>
          </Box>
        </Box>
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Are you sure? This will immediately alert all security personnel.
          </Typography>
          <TextField fullWidth label="Location / Description (optional)" multiline rows={2}
            value={location} onChange={(e) => setLocation(e.target.value)} />
        </DialogContent>
        <Divider sx={{ mt: 2 }} />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setOpen(false)} disabled={loading} sx={{ color: "#555", borderRadius: 2 }}>
            Cancel (False Alarm)
          </Button>
          <Button variant="contained" color="error" onClick={handleSend} disabled={loading}
            sx={{ borderRadius: 2, px: 3, minWidth: 140 }}>
            {loading ? <CircularProgress size={18} color="inherit" /> : "YES, SEND SOS"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SOS;
