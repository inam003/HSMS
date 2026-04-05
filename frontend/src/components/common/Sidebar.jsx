import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Box, Divider } from "@mui/material";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import ApartmentIcon from "@mui/icons-material/Apartment";
import BadgeIcon from "@mui/icons-material/Badge";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CampaignIcon from "@mui/icons-material/Campaign";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import SecurityIcon from "@mui/icons-material/Security";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import RouteIcon from "@mui/icons-material/Route";
import SpaIcon from "@mui/icons-material/Spa";
import PaymentIcon from "@mui/icons-material/Payment";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import SosIcon from "@mui/icons-material/Sos";
import GavelIcon from "@mui/icons-material/Gavel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WorkIcon from "@mui/icons-material/Work";

const DRAWER_WIDTH = 240;

const adminMenu = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
  { label: "Residents", icon: <PeopleIcon />, path: "/admin/members" },
  { label: "Units", icon: <ApartmentIcon />, path: "/admin/units" },
  { label: "Staff & Vendors", icon: <BadgeIcon />, path: "/admin/staff" },
  { label: "Bills", icon: <ReceiptIcon />, path: "/admin/bills" },
  { label: "Expenses", icon: <AccountBalanceIcon />, path: "/admin/expenses" },
  { label: "Reports", icon: <AssessmentIcon />, path: "/admin/reports" },
  { label: "Notices", icon: <CampaignIcon />, path: "/admin/notices" },
  { label: "Complaints", icon: <ReportProblemIcon />, path: "/admin/complaints" },
  { label: "Polls", icon: <HowToVoteIcon />, path: "/admin/polls" },
  { label: "Guards", icon: <SecurityIcon />, path: "/admin/guards" },
  { label: "Visitor Logs", icon: <PeopleOutlineIcon />, path: "/admin/visitors" },
  { label: "Patrols", icon: <RouteIcon />, path: "/admin/patrols" },
  { label: "Amenities", icon: <SpaIcon />, path: "/admin/amenities" },
];

const residentMenu = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/resident/dashboard" },
  { label: "My Unit", icon: <ApartmentIcon />, path: "/resident/unit" },
  { label: "Bills & Payments", icon: <PaymentIcon />, path: "/resident/bills" },
  { label: "Complaints", icon: <ReportProblemIcon />, path: "/resident/complaints" },
  { label: "Notices", icon: <AnnouncementIcon />, path: "/resident/notices" },
  { label: "Polls", icon: <HowToVoteIcon />, path: "/resident/polls" },
  { label: "Amenities", icon: <SpaIcon />, path: "/resident/amenities" },
  { label: "Visitor Approval", icon: <DirectionsCarIcon />, path: "/resident/visitors" },
  { label: "SOS Alert", icon: <SosIcon />, path: "/resident/sos" },
];

const guardMenu = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/guard/dashboard" },
  { label: "Visitor Entry/Exit", icon: <PeopleOutlineIcon />, path: "/guard/visitors" },
  { label: "Staff Attendance", icon: <GavelIcon />, path: "/guard/staff" },
  { label: "Patrol Log", icon: <RouteIcon />, path: "/guard/patrol" },
];

const staffMenu = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/staff/dashboard" },
  { label: "My Attendance", icon: <AccessTimeIcon />, path: "/staff/attendance" },
];

const menuMap = { admin: adminMenu, resident: residentMenu, guard: guardMenu, staff: staffMenu };

const Sidebar = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const menu = menuMap[role] || [];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          bgcolor: "#1a237e",
          color: "white",
        },
      }}
    >
      <Toolbar>
        <Box>
          <Typography variant="h6" fontWeight="bold" color="white">HSMS</Typography>
          <Typography variant="caption" color="rgba(255,255,255,0.7)">Housing Society Mgmt</Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
      <List>
        {menu.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                "&.Mui-selected": { bgcolor: "rgba(255,255,255,0.2)" },
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                borderRadius: 1, mx: 0.5, mb: 0.3,
              }}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 13 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
