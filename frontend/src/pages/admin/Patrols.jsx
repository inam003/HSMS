import Toast from "../../components/common/Toast";
import { useEffect, useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { Link } from "react-router";
import RouteOutlined from "@mui/icons-material/RouteOutlined";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import CancelRounded from "@mui/icons-material/CancelRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import PersonOutlineRounded from "@mui/icons-material/PersonOutlineRounded";
import PeopleRounded from "@mui/icons-material/PeopleRounded";
import MeetingRoomOutlined from "@mui/icons-material/MeetingRoomOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import FilterAltOutlined from "@mui/icons-material/FilterAltOutlined";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import ErrorRounded from "@mui/icons-material/ErrorRounded";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import api from "../../api/axios";
import "./Members.css";
import "./Patrols.css";

const localDay = value => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const Timestamp = ({ value }) => {
  const date = new Date(value);
  return !value || Number.isNaN(date.getTime()) ? "—" : <span className="hs-monitor-time"><span>{date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span><strong>{date.toLocaleTimeString("en-GB")}</strong></span>;
};

export default function Patrols() {
  const [logs, setLogs] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [dateRange, setDateRange] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [now, setNow] = useState(() => new Date());
  const pageSize = 10;

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [patrols, access] = await Promise.all([api.get("/patrol"), api.get("/visitors")]);
        if (active) { setLogs(patrols.data); setVisitors(access.data); }
      } catch (e) { if (active) setError(e.response?.data?.message || "Unable to load security monitoring data. Please try again."); }
      finally { if (active) setLoading(false); }
    };
    load();
    return () => { active = false; };
  }, [revision]);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const today = localDay(now);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const todayLogs = logs.filter(log => localDay(log.LogTime) === today);
  const completedToday = todayLogs.filter(log => log.Status === "Completed").length;
  const skippedToday = todayLogs.filter(log => log.Status === "Skipped").length;
  const insideNow = visitors.filter(visitor => visitor.CheckIn_Time && !visitor.CheckOut_Time).length;
  const missingCheckIn = visitors.filter(visitor => !visitor.CheckIn_Time && !visitor.CheckOut_Time && !visitor.preApprovalUsed).length;
  const todayAccess = visitors.filter(visitor => localDay(visitor.CheckIn_Time) === today).length;
  const filtered = logs.filter(log => {
    if (status && log.Status !== status) return false;
    if (!dateRange) return true;
    const date = localDay(log.LogTime);
    if (!date) return false;
    if (dateRange === "today") return date === today;
    if (dateRange === "month") return date.slice(0, 7) === today.slice(0, 7);
    if (dateRange === "30days") return date >= localDay(thirtyDaysAgo) && date <= today;
    return (!startDate || date >= startDate) && (!endDate || date <= endDate);
  });
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const recent = [...visitors].sort((a, b) => new Date(b.CheckIn_Time || b.createdAt || 0) - new Date(a.CheckIn_Time || a.createdAt || 0)).slice(0, 20);

  return <div className="hs-security-monitor">
    <div className="hs-page-heading hs-members-heading hs-monitor-heading"><div><h1>Security Monitoring</h1><p>Review patrol checkpoints and gate activity.</p></div><div className="hs-monitor-date"><CalendarTodayOutlined/><time dateTime={today}>{now.toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</time></div></div>
    {error && <Toast severity="error" sx={{ mb: 2 }} action={<Button color="inherit" onClick={() => { setError(""); setLoading(true); setRevision(value => value + 1); }}>Retry</Button>}>{error}</Toast>}
    <div className="hs-monitor-stats" aria-busy={loading}>
      {[
        { label: "Patrols completed today", value: completedToday, icon: <CheckCircleRounded/> },
        { label: "Patrols skipped today", value: skippedToday, icon: <CloseRounded/> },
        { label: "Visitors inside", value: insideNow, icon: <PersonOutlineRounded/>, visitor: true },
        { label: "Gate access today", value: todayAccess, icon: <MeetingRoomOutlined/> },
      ].map(item => <section className={`hs-panel hs-monitor-stat${item.visitor ? " visitor" : ""}`} key={item.label}><div><h2>{item.label}</h2><strong>{loading || error ? "—" : item.value}</strong>{item.visitor && !loading && !error && missingCheckIn > 0 && <p><WarningAmberRounded/>{missingCheckIn} without a recorded check-in</p>}</div><span className="hs-monitor-stat-icon">{item.icon}</span></section>)}
    </div>
    <p className="hs-monitor-note"><InfoOutlined/>Today’s counts are separate from the historical logs below.</p>
    <section className="hs-panel hs-monitor-panel" aria-label="Patrol checkpoint logs" aria-busy={loading}>
      <div className="hs-monitor-panel-heading"><h2><span className="hs-monitor-section-icon patrol"><RouteOutlined/></span>Patrol checkpoint logs<span className="hs-monitor-count">{logs.length}</span></h2><div className="hs-monitor-filters"><div className="hs-resident-filter"><CalendarTodayOutlined/><select aria-label="Filter patrol logs by date range" value={dateRange} onChange={e => { setDateRange(e.target.value); setPage(1); }}><option value="">Date range</option><option value="today">Today</option><option value="month">This month</option><option value="30days">Last 30 days</option><option value="custom">Custom range</option></select><KeyboardArrowDownRounded/></div><div className="hs-resident-filter hs-monitor-status-filter"><FilterAltOutlined/><select aria-label="Filter patrol logs by status" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">All statuses</option><option value="Completed">Completed</option><option value="Skipped">Skipped</option></select><KeyboardArrowDownRounded/></div></div></div>
      {dateRange === "custom" && <div className="hs-monitor-custom-dates"><label>From<input type="date" value={startDate} max={endDate || undefined} onChange={e => { setStartDate(e.target.value); setPage(1); }}/></label><label>To<input type="date" value={endDate} min={startDate || undefined} onChange={e => { setEndDate(e.target.value); setPage(1); }}/></label>{startDate && endDate && startDate > endDate && <span role="alert">End date must be on or after the start date.</span>}</div>}
      <div className="hs-monitor-table-wrap"><table className="hs-monitor-table hs-monitor-patrol-table"><thead><tr>{["Guard", "Checkpoint", "Date & time", "Status"].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>
        {loading ? <tr><td colSpan={4}><div className="hs-residents-loading" role="status"><CircularProgress size={26}/>Loading patrol logs...</div></td></tr> : visible.map(log => <tr key={log._id}><td>{log.guard?.Name || "—"}</td><td>{log.CheckpointName || "—"}</td><td><Timestamp value={log.LogTime}/></td><td><span className={`hs-monitor-status ${log.Status === "Completed" ? "completed" : "skipped"}`}>{log.Status === "Completed" ? <CheckCircleRounded/> : <CancelRounded/>}{log.Status}</span></td></tr>)}
        {!loading && !visible.length && <tr><td colSpan={4} className="hs-empty">{error ? "Patrol data unavailable" : logs.length ? "No patrol logs match your filters." : "No patrol logs yet."}</td></tr>}
      </tbody></table></div>
      {filtered.length > pageSize && <div className="hs-residents-pagination"><span aria-live="polite">Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} patrol logs</span><div><button disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}><ChevronLeftRounded/>Previous</button><button disabled={currentPage * pageSize >= filtered.length} onClick={() => setPage(currentPage + 1)}>Next<ChevronRightRounded/></button></div></div>}
    </section>
    <section className="hs-panel hs-monitor-panel" aria-label="Recent gate access" aria-busy={loading}>
      <div className="hs-monitor-panel-heading"><h2><span className="hs-monitor-section-icon gate"><PeopleRounded/></span>Recent gate access<span className="hs-monitor-count">{recent.length}</span></h2><Link className="hs-monitor-view-all" to="/admin/visitors">View all</Link></div>
      <div className="hs-monitor-table-wrap"><table className="hs-monitor-table hs-monitor-gate-table"><thead><tr>{["Visitor name", "Visiting unit", "Purpose", "Check-in", "Check-out", "Pre-approved", "Status"].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>
        {loading ? <tr><td colSpan={7}><div className="hs-residents-loading" role="status"><CircularProgress size={26}/>Loading gate access...</div></td></tr> : recent.map(visitor => <tr key={visitor._id}><td>{visitor.Name || "—"}</td><td>{visitor.unit?.Unit_Number != null ? `Unit ${visitor.unit.Unit_Number}` : "—"}</td><td>{visitor.Purpose || "—"}</td><td><Timestamp value={visitor.CheckIn_Time}/></td><td><Timestamp value={visitor.CheckOut_Time}/></td><td><span className={`hs-monitor-approval ${visitor.isPreApproved ? "yes" : ""}`}>{visitor.isPreApproved ? "Yes" : "No"}</span></td><td><span className={`hs-monitor-status ${visitor.CheckOut_Time ? "left" : visitor.CheckIn_Time ? "inside" : "missing"}`}>{!visitor.CheckIn_Time && !visitor.CheckOut_Time && <ErrorRounded/>}{visitor.CheckOut_Time ? "Left" : visitor.CheckIn_Time ? "Inside" : "No check-in recorded"}</span></td></tr>)}
        {!loading && !recent.length && <tr><td colSpan={7} className="hs-empty">{error ? "Gate access data unavailable" : "No gate access records yet."}</td></tr>}
      </tbody></table></div>
    </section>
  </div>;
}
