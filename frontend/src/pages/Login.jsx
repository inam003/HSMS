import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import {
  Box, Card, CardContent, TextField, Button, Typography,
  CircularProgress, Alert, InputAdornment, IconButton
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import HomeWorkIcon from "@mui/icons-material/HomeWork";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (form) => ({
  Email:    !form.Email.trim()              ? "Email is required"
          : !emailRegex.test(form.Email)    ? "Enter a valid email address" : "",
  Password: !form.Password                  ? "Password is required"        : "",
});

const Login = () => {
  const [form, setForm]       = useState({ Email: "", Password: "" });
  const [touched, setTouched] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const errors  = validate(form);
  const isValid = !errors.Email && !errors.Password;

  const field = (key) => ({
    error:      !!touched[key] && !!errors[key],
    helperText: touched[key] && errors[key] ? errors[key] : " ",
    onBlur:     () => setTouched((t) => ({ ...t, [key]: true })),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true); setError("");
    try {
      const role = await login(form.Email, form.Password);
      if (role === "admin")    navigate("/admin/dashboard");
      else if (role === "resident") navigate("/resident/dashboard");
      else if (role === "guard")    navigate("/guard/dashboard");
      else if (role === "staff")    navigate("/staff/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)" }}
    >
      <Card sx={{ width: 420, borderRadius: 3, boxShadow: 10 }}>
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={3}>
            <HomeWorkIcon sx={{ fontSize: 56, color: "#1a237e", mb: 1 }} />
            <Typography variant="h5" fontWeight="bold" color="#1a237e">HSMS Portal</Typography>
            <Typography variant="body2" color="text.secondary">Housing Society Management System</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Email Address" type="email" required
              value={form.Email} onChange={(e) => setForm({ ...form, Email: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> }}
              {...field("Email")}
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth label="Password" required
              type={showPwd ? "text" : "password"}
              value={form.Password} onChange={(e) => setForm({ ...form, Password: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockIcon /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPwd(!showPwd)} edge="end">
                      {showPwd ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              {...field("Password")}
            />
            <Button
              fullWidth type="submit" variant="contained" size="large"
              disabled={!isValid || loading}
              sx={{
                mt: 2, mb: 1, py: 1.5, bgcolor: "#1a237e",
                "&:hover": { bgcolor: "#283593" },
                "&:disabled": { bgcolor: "#c5cae9", color: "#fff" },
                borderRadius: 2,
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
            </Button>
          </form>

          <Typography variant="caption" color="text.secondary" align="center" display="block" mt={2}>
            Login with your Admin, Resident, Security Guard, or Staff credentials
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
