import { ThemeProvider, createTheme } from "@mui/material/styles";
import DashboardRounded from "@mui/icons-material/DashboardRounded";
import ApartmentOutlined from "@mui/icons-material/ApartmentOutlined";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import ReportProblemOutlined from "@mui/icons-material/ReportProblemOutlined";
import CampaignOutlined from "@mui/icons-material/CampaignOutlined";
import HowToVoteOutlined from "@mui/icons-material/HowToVoteOutlined";
import SpaOutlined from "@mui/icons-material/SpaOutlined";
import PeopleOutline from "@mui/icons-material/PeopleOutline";
import SosOutlined from "@mui/icons-material/SosOutlined";
import BadgeOutlined from "@mui/icons-material/BadgeOutlined";
import RouteOutlined from "@mui/icons-material/RouteOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import AdminLayout from "./AdminLayout";
import "./PortalPages.css";

const navigation = {
  resident: [
    ["Overview", [["Dashboard", "dashboard", DashboardRounded], ["My Unit", "unit", ApartmentOutlined]]],
    ["Finance", [["Bills & Payments", "bills", ReceiptLongOutlined]]],
    ["Community", [["Complaints", "complaints", ReportProblemOutlined], ["Notices", "notices", CampaignOutlined], ["Polls", "polls", HowToVoteOutlined], ["Amenities", "amenities", SpaOutlined]]],
    ["Security", [["Visitor Approval", "visitors", PeopleOutline], ["SOS Alert", "sos", SosOutlined]]],
  ],
  guard: [
    ["Overview", [["Dashboard", "dashboard", DashboardRounded]]],
    ["Security", [["Visitor Entry/Exit", "visitors", PeopleOutline], ["Staff Attendance", "staff", BadgeOutlined], ["Patrol Log", "patrol", RouteOutlined]]],
  ],
  staff: [
    ["Overview", [["Dashboard", "dashboard", DashboardRounded]]],
    ["Attendance", [["My Attendance", "attendance", AccessTimeOutlined]]],
  ],
};
const labels = { resident: "Resident", guard: "Security Guard", staff: "Staff / Vendor" };
const theme = createTheme({
  palette: { primary: { main: "#0854ed" }, secondary: { main: "#0854ed" }, success: { main: "#168249" }, error: { main: "#dc2638" }, warning: { main: "#b87a09" }, text: { primary: "#10183f", secondary: "#63749a" }, divider: "#dfe5ef", background: { default: "#f3f5f8", paper: "#fff" } },
  typography: { fontFamily: 'Arial,"Segoe UI",sans-serif', button: { textTransform: "none", fontWeight: 500 }, h5: { fontSize: 34, fontWeight: 700, letterSpacing: -.6 }, h6: { fontSize: 19, fontWeight: 600 }, body2: { fontSize: 14, lineHeight: 1.6 } },
  shape: { borderRadius: 6 },
  components: {
    MuiCard: { defaultProps: { elevation: 0 } },
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 6, minHeight: 40, padding: "8px 16px" } } },
    MuiTabs: { styleOverrides: { root: { borderBottom: "1px solid #d7e2f3", minHeight: 54 }, indicator: { height: 3 } } },
    MuiTab: { styleOverrides: { root: { textTransform: "none", fontSize: 16, minHeight: 54 } } },
    MuiTableCell: { styleOverrides: { root: { borderColor: "#dfe5ef", padding: "15px 20px" }, head: { background: "#f2f6fc", color: "#254177", fontWeight: 500 } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 6 }, notchedOutline: { borderColor: "#cdd8e9" } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 10 } } },
  },
});
export default function PortalLayout({ role }) {
  return <ThemeProvider theme={theme}><AdminLayout navigation={navigation[role] || []} basePath={`/${role}`} roleLabel={labels[role] || "Member"} noticesPath={role === "resident" ? "/resident/notices" : null} showHelp={false} rootClassName="hs-portal" contentClassName="hs-portal-content"/></ThemeProvider>;
}
