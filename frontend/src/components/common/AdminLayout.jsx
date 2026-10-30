import { useState } from "react";
import { NavLink, Outlet, Link, useLocation, useNavigate } from "react-router";
import AdminHelpDialog from "./AdminHelpDialog";
import ApartmentOutlined from "@mui/icons-material/ApartmentOutlined";
import DashboardRounded from "@mui/icons-material/DashboardRounded";
import PeopleOutline from "@mui/icons-material/PeopleOutline";
import BadgeOutlined from "@mui/icons-material/BadgeOutlined";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import AccountBalanceOutlined from "@mui/icons-material/AccountBalanceOutlined";
import AssessmentOutlined from "@mui/icons-material/AssessmentOutlined";
import CampaignOutlined from "@mui/icons-material/CampaignOutlined";
import ReportProblemOutlined from "@mui/icons-material/ReportProblemOutlined";
import HowToVoteOutlined from "@mui/icons-material/HowToVoteOutlined";
import SpaOutlined from "@mui/icons-material/SpaOutlined";
import ShieldOutlined from "@mui/icons-material/ShieldOutlined";
import RouteOutlined from "@mui/icons-material/RouteOutlined";
import HelpOutline from "@mui/icons-material/HelpOutline";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import NotificationsNoneOutlined from "@mui/icons-material/NotificationsNoneOutlined";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import MenuRounded from "@mui/icons-material/MenuRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import { useAuth } from "../../context/AuthContext";
import "./AdminLayout.css";

const groups = [
  ["Overview", [["Dashboard", "dashboard", DashboardRounded]]],
  ["Management", [["Residents", "members", PeopleOutline], ["Units", "units", ApartmentOutlined], ["Staff & Vendors", "staff", BadgeOutlined]]],
  ["Finance", [["Bills", "bills", ReceiptLongOutlined], ["Expenses", "expenses", AccountBalanceOutlined], ["Reports", "reports", AssessmentOutlined]]],
  ["Community", [["Notices", "notices", CampaignOutlined], ["Complaints", "complaints", ReportProblemOutlined], ["Polls", "polls", HowToVoteOutlined], ["Amenities", "amenities", SpaOutlined]]],
  ["Security", [["Guards", "guards", ShieldOutlined], ["Visitor Logs", "visitors", PeopleOutline], ["Patrols", "patrols", RouteOutlined]]],
];
export default function AdminLayout({ navigation = groups, basePath = "/admin", roleLabel = "Administrator", noticesPath = "/admin/notices", showHelp = true, rootClassName = "", contentClassName = "" }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("hsms_sidebar_collapsed") === "true"; }
    catch { return false; }
  });
  const toggleSidebar = () => {
    setCollapsed(previous => {
      const next = !previous;
      try { localStorage.setItem("hsms_sidebar_collapsed", String(next)); } catch { /* Storage may be unavailable. */ }
      return next;
    });
  };
  const [helpOpen, setHelpOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const page = navigation.flatMap(([, items]) => items).find(([, path]) => location.pathname === `${basePath}/${path}`);
  const signOut = () => { logout(); navigate("/login"); };
  return <div className={`hs-admin${collapsed ? " is-collapsed" : ""} ${rootClassName}`}>
    <a className="hs-skip" href="#admin-content">Skip to content</a>
    {mobileOpen && <button className="hs-sidebar-backdrop" aria-label="Close sidebar" onClick={() => setMobileOpen(false)} />}
    <aside id="admin-sidebar" className={`hs-sidebar${mobileOpen ? " is-open" : ""}`} aria-label={`${roleLabel} sidebar`}>
      <Link to={`${basePath}/dashboard`} className="hs-brand" aria-label="Housing Society Management System dashboard" title="Housing Society Management System" onClick={() => setMobileOpen(false)}><ApartmentOutlined/><span><strong>Housing Society</strong><small>Management System</small></span></Link>
      <button className="hs-mobile-close hs-icon-button" aria-label="Close sidebar" onClick={() => setMobileOpen(false)}><CloseRounded/></button>
      <nav aria-label={`${roleLabel} navigation`}>{navigation.map(([label, items]) => <div className="hs-nav-group" key={label}><p>{label}</p>{items.map(([name, path, icon]) => { const Icon = icon; return <NavLink key={path} title={name} aria-label={name} to={`${basePath}/${path}`} onClick={() => setMobileOpen(false)} className={({isActive}) => `hs-nav-item${isActive ? " active" : ""}`}><Icon/><span>{name}</span></NavLink>; })}</div>)}</nav>
      {showHelp && <div className="hs-sidebar-bottom"><button className="hs-nav-item" title="Help" aria-label="Help" onClick={() => setHelpOpen(true)}><HelpOutline/><span>Help</span></button></div>}
    </aside>
    <div className="hs-right"><header className="hs-topbar"><button className="hs-desktop-toggle hs-icon-button" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed} aria-controls="admin-sidebar" onClick={toggleSidebar}><MenuRounded/></button><button className="hs-mobile-toggle hs-icon-button" aria-label="Open sidebar" aria-controls="admin-sidebar" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><MenuRounded/></button><div className="hs-breadcrumb"><span>{navigation.find(([,items]) => items.some(([,path])=>location.pathname === `${basePath}/${path}`))?.[0] || "Overview"}</span><span>/</span><strong>{page?.[1] === "patrols" ? "Monitoring" : page?.[0] || "Administration"}</strong></div><div className="hs-topbar-actions">{noticesPath && <Link to={noticesPath} className="hs-icon-button" aria-label="View society notices"><NotificationsNoneOutlined/></Link>}<div className="hs-account"><button className="hs-account-button" onClick={() => setAccountOpen(!accountOpen)} aria-expanded={accountOpen} aria-controls="hs-account-menu"><span className="hs-avatar">{user?.Name?.charAt(0).toUpperCase() || "S"}</span><span className="hs-account-name"><strong>{user?.Name || roleLabel}</strong><small>{roleLabel}</small></span><KeyboardArrowDownRounded/></button>{accountOpen && <div id="hs-account-menu" className="hs-account-menu"><p>Signed in as {user?.Email || user?.Name || "Administrator"}</p><button onClick={signOut}><LogoutOutlined/> Sign out</button></div>}</div></div></header><main id="admin-content" className={`hs-content ${contentClassName}`} tabIndex={-1}><Outlet/></main></div>
    <AdminHelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
  </div>;
}
