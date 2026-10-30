import Toast from "../../components/common/Toast";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { CircularProgress } from "@mui/material";
import PeopleOutline from "@mui/icons-material/PeopleOutline";
import ApartmentOutlined from "@mui/icons-material/ApartmentOutlined";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import ReportProblemOutlined from "@mui/icons-material/ReportProblemOutlined";
import ShieldOutlined from "@mui/icons-material/ShieldOutlined";
import SpaOutlined from "@mui/icons-material/SpaOutlined";
import PersonAddAltOutlined from "@mui/icons-material/PersonAddAltOutlined";
import CampaignOutlined from "@mui/icons-material/CampaignOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import BarChartOutlined from "@mui/icons-material/BarChartOutlined";
import CheckBoxOutlined from "@mui/icons-material/CheckBoxOutlined";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import api from "../../api/axios";

const endpoints = ["residents", "units", "bills", "complaints", "guards", "amenities", "notices"];
const date = value => value && !Number.isNaN(new Date(value).getTime()) ? new Date(value).toLocaleDateString("en-GB", {day:"2-digit", month:"short", year:"numeric"}) : "—";
const actions = [["Add Resident", "members", PersonAddAltOutlined], ["Create Notice", "notices", CampaignOutlined], ["Generate Bills", "bills", DescriptionOutlined], ["View Reports", "reports", BarChartOutlined], ["Create Poll", "polls", CheckBoxOutlined], ["Manage Units", "units", ApartmentOutlined]];

export default function AdminDashboard() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState([]);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    Promise.allSettled(endpoints.map(endpoint => api.get(`/${endpoint}`))).then(results => {
      if (cancelled) return;
      const next = {}; const errors = [];
      results.forEach((result, i) => { if (result.status === "fulfilled" && Array.isArray(result.value.data)) next[endpoints[i]] = result.value.data; else errors.push(endpoints[i]); });
      setData(next); setFailed(errors); setLoading(false);
    });
    return () => { cancelled = true; };
  }, [attempt]);
  const units = data.units;
  const occupied = units?.filter(u => u.Status === "Occupied").length ?? 0;
  const vacant = units?.filter(u => u.Status === "Vacant").length ?? 0;
  const otherUnits = (units?.length ?? 0) - occupied - vacant;
  const complaints = [...(data.complaints || [])].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,5);
  const activeNotices = (data.notices || []).filter(n => n.IsActive && (!n.ExpiryDate || new Date(n.ExpiryDate) > new Date()));
  const sos = activeNotices.find(n => n.NoticeType === "Emergency" && /SOS/i.test(n.Title));
  const cards = [
    ["Total Residents", data.residents?.length, "Registered members", PeopleOutline, "members", "blue"],
    ["Total Units", units?.length, units ? `${vacant} vacant ${vacant === 1 ? "unit" : "units"}` : "Unavailable", ApartmentOutlined, "units", "neutral"],
    ["Unpaid Bills", data.bills?.filter(b => b.Status === "Unpaid").length, data.bills ? `Out of ${data.bills.length} bills` : "Unavailable", ReceiptLongOutlined, "bills", "red"],
    ["Pending Complaints", data.complaints?.filter(c => c.Status === "Pending").length, "Awaiting action", ReportProblemOutlined, "complaints", "neutral"],
    ["Security Guards", data.guards?.length, "On duty roster", ShieldOutlined, "guards", "neutral"],
    ["Amenities", data.amenities?.length, "Available facilities", SpaOutlined, "amenities", "neutral"],
  ];
  return <div className="hs-dashboard" aria-busy={loading}>
    <div className="hs-page-heading"><div><h1>Dashboard</h1><p>Your society at a glance.</p></div><time dateTime={new Date().toISOString().slice(0,10)}>{new Date().toLocaleDateString("en-GB", {weekday:"long", day:"numeric", month:"long", year:"numeric"})}</time></div>
    {loading ? <div className="hs-loading" role="status"><CircularProgress size={32}/><span>Loading society overview…</span></div> : <>
      {failed.length > 0 && <Toast severity="error" action={<button onClick={() => {setLoading(true);setAttempt(a=>a+1);}}>Retry</button>}>Could not load {failed.join(", ")}. Unavailable values are shown as —.</Toast>}
      {sos && <div className="hs-sos" role="alert"><ReportProblemOutlined/><strong>Emergency SOS · {sos.Title.replace(/^.*?SOS\s*ALERT\s*[-–:]?\s*(Unit:\s*)?/i, "")}</strong><Link to="/admin/notices">Review alert <ArrowForwardRounded/></Link></div>}
      <div className="hs-stat-grid">{cards.map(([title,value,subtitle,icon,path,tone]) => { const Icon = icon; return <Link key={title} to={`/admin/${path}`} className={`hs-stat-card ${tone}`}><div><h2>{title}</h2><strong className="hs-stat-value">{value ?? "—"}</strong><p>{subtitle}</p></div><span className="hs-stat-icon"><Icon/></span></Link>; })}</div>
      <section className="hs-panel hs-quick"><h2>Quick Actions</h2><div className="hs-quick-grid">{actions.map(([label,path,icon]) => { const Icon = icon; return <Link key={label} to={`/admin/${path}`} className={`hs-quick-action${path === "bills" ? " primary" : ""}`}><Icon/>{label}</Link>; })}</div></section>
      <div className="hs-detail-grid"><section className="hs-panel hs-complaints"><div className="hs-panel-heading"><h2>Recent Complaints</h2><Link to="/admin/complaints">View all <ArrowForwardRounded/></Link></div><div className="hs-table-wrap"><table><thead><tr>{["Resident","Category","Status","Date"].map(label=><th key={label}>{label}</th>)}</tr></thead><tbody>{complaints.map(c=><tr key={c._id}><td>{c.resident?.Name || "—"}</td><td>{c.Category || "General"}</td><td><span className={`hs-status ${c.Status === "In Progress" ? "progress" : c.Status === "Resolved" ? "resolved" : "pending"}`}>{c.Status || "Pending"}</span></td><td>{date(c.createdAt)}</td></tr>)}{!complaints.length && <tr><td colSpan={4} className="hs-empty">{failed.includes("complaints") ? "Complaints unavailable" : "No complaints yet"}</td></tr>}</tbody></table></div></section>
      <section className="hs-panel hs-notices"><div className="hs-panel-heading"><h2>Active Notices</h2><Link to="/admin/notices">View all <ArrowForwardRounded/></Link></div><div className="hs-notice-list">{activeNotices.slice(0,4).map(n=><Link className="hs-notice-item" to="/admin/notices" key={n._id}><span className={`hs-notice-dot ${n.NoticeType === "Emergency" ? "emergency" : ""}`}/><div><h3>{n.Title}</h3><div className="hs-notice-tags"><span className={n.NoticeType === "Emergency" ? "emergency" : ""}>{n.NoticeType}</span><span>{n.Priority}</span></div></div></Link>)}{!activeNotices.length && <p className="hs-empty">{failed.includes("notices") ? "Notices unavailable" : "No active notices"}</p>}</div></section></div>
      <section className="hs-panel hs-occupancy"><div className="hs-panel-heading"><h2>Occupancy</h2><span>Total Units: {units?.length ?? "—"}</span></div><div className="hs-occupancy-bar" role="img" aria-label={units ? `${occupied} occupied, ${vacant} vacant${otherUnits ? `, ${otherUnits} other` : ""} of ${units.length} total units` : "Occupancy unavailable"}><span style={{width:`${units?.length ? occupied / units.length * 100 : 0}%`}}/></div><div className="hs-occupancy-legend"><span><i/>{units ? occupied : "—"} Occupied {occupied === 1 ? "unit" : "units"}</span>{otherUnits > 0 && <span><i className="other"/>{otherUnits} Other {otherUnits === 1 ? "unit" : "units"}</span>}<span><i className="vacant"/>{units ? vacant : "—"} Vacant {vacant === 1 ? "unit" : "units"}</span></div></section>
    </>}
  </div>;
}
