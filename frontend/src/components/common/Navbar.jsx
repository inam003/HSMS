import { AppBar, Toolbar, Typography, Button, Box, Chip, Avatar } from "@mui/material";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import LogoutIcon from "@mui/icons-material/Logout";

const roleColors = { admin: "error", resident: "primary", guard: "success" };
const roleLabels = { admin: "Administrator", resident: "Resident", guard: "Security Guard" };

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: "#283593" }}>
      <Toolbar>
        <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
          Housing Society Management System
        </Typography>
        {user && (
          <Box display="flex" alignItems="center" gap={2}>
            <Chip
              label={roleLabels[role] || role}
              color={roleColors[role] || "default"}
              size="small"
              sx={{ color: "white" }}
            />
            <Avatar sx={{ width: 32, height: 32, bgcolor: "#5c6bc0", fontSize: 14 }}>
              {user.Name?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body2" color="white">{user.Name}</Typography>
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              size="small"
            >
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
