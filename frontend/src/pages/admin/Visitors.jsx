import Toast from "../../components/common/Toast";
import { useEffect, useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import SearchRounded from "@mui/icons-material/SearchRounded";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import FilterAltOutlined from "@mui/icons-material/FilterAltOutlined";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import api from "../../api/axios";
import "./Members.css";
import "./Visitors.css";

const localDay = value => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const VisitTimestamp = ({ value }) => {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "—";
  return <span className="hs-visitor-timestamp"><span>{date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span><strong>{date.toLocaleTimeString("en-GB")}</strong></span>;
};

const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [approval, setApproval] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    let active = true;
    api.get("/visitors")
      .then(({ data }) => { if (active) setVisitors(data); })
      .catch(error => { if (active) setLoadError(error.response?.data?.message || "Unable to load visitor logs. Please try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [revision]);

  const now = new Date();
  const today = localDay(now);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const query = search.trim().toLowerCase();
  const filtered = visitors.filter(visitor => {
    if (approval && Boolean(visitor.isPreApproved) !== (approval === "yes")) return false;
    if (![visitor.Name, visitor.Contact_No, String(visitor.unit?.Unit_Number ?? "")].some(value => (value || "").toLowerCase().includes(query))) return false;
    if (!dateRange) return true;
    const date = localDay(visitor.CheckIn_Time || visitor.expectedArrival || visitor.createdAt);
    if (!date) return false;
    if (dateRange === "today") return date === today;
    if (dateRange === "30days") return date >= localDay(thirtyDaysAgo) && date <= today;
    if (dateRange === "month") return date.slice(0, 7) === today.slice(0, 7);
    return (!startDate || date >= startDate) && (!endDate || date <= endDate);
  });
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return <div className="hs-visitor-management">
    <div className="hs-page-heading hs-members-heading hs-visitor-heading"><div><h1>Visitor Logs</h1><p>Review visitor entries, exits, and pre-approved guests.</p></div></div>
    {loadError && <Toast severity="error" sx={{ mb: 2 }} action={<Button color="inherit" onClick={() => { setLoadError(""); setLoading(true); setRevision(value => value + 1); }}>Retry</Button>}>{loadError}</Toast>}
    <section className="hs-panel hs-residents-panel hs-visitor-panel" aria-label="Visitor logs" aria-busy={loading}>
      <div className="hs-visitor-toolbar">
        <div className="hs-visitor-toolbar-heading"><h2>All visitor logs <span>{visitors.length}</span></h2></div>
        <div className="hs-residents-filters hs-visitor-filters"><label className="hs-resident-search"><SearchRounded/><input type="search" aria-label="Search by visitor name, contact or unit" placeholder="Search visitor, contact, or unit..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/></label><div className="hs-visitor-selects">
          <div className="hs-resident-filter"><CalendarTodayOutlined/><select aria-label="Filter visitor logs by date range" value={dateRange} onChange={e => { setDateRange(e.target.value); setPage(1); }}><option value="">Date range</option><option value="today">Today</option><option value="month">This month</option><option value="30days">Last 30 days</option><option value="custom">Custom range</option></select><KeyboardArrowDownRounded/></div>
          <div className="hs-resident-filter hs-visitor-approval-filter"><FilterAltOutlined/><select aria-label="Filter visitor logs by pre-approval" value={approval} onChange={e => { setApproval(e.target.value); setPage(1); }}><option value="">All approvals</option><option value="yes">Pre-approved</option><option value="no">Not pre-approved</option></select><KeyboardArrowDownRounded/></div>
        </div></div>
        {dateRange === "custom" && <div className="hs-visitor-custom-dates"><label>From<input type="date" value={startDate} max={endDate || undefined} onChange={e => { setStartDate(e.target.value); setPage(1); }}/></label><label>To<input type="date" value={endDate} min={startDate || undefined} onChange={e => { setEndDate(e.target.value); setPage(1); }}/></label>{startDate && endDate && startDate > endDate && <span role="alert">End date must be on or after the start date.</span>}</div>}
        {dateRange && <p className="hs-visitor-date-help">Dates use check-in, or expected arrival for guests without a check-in; otherwise the record creation date.</p>}
      </div>
      <div className="hs-residents-table-wrap"><table className="hs-residents-table hs-visitor-table"><thead><tr>{["Visitor name", "Contact", "Purpose", "Unit", "Check-in", "Check-out", "Guard", "Pre-approved"].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>
        {loading ? <tr><td colSpan={8}><div className="hs-residents-loading" role="status"><CircularProgress size={26}/>Loading visitor logs...</div></td></tr> : visible.map(visitor => <tr key={visitor._id}><td><strong>{visitor.Name || "—"}</strong></td><td>{visitor.Contact_No || "—"}</td><td className="hs-visitor-purpose">{visitor.Purpose || "—"}</td><td>{visitor.unit?.Unit_Number ?? "—"}</td><td><VisitTimestamp value={visitor.CheckIn_Time}/></td><td>{visitor.CheckOut_Time ? <VisitTimestamp value={visitor.CheckOut_Time}/> : visitor.CheckIn_Time ? <span className="hs-visitor-inside">Inside</span> : <span className="hs-visitor-no-checkin">No check-in<br/>recorded</span>}</td><td>{visitor.guard?.Name || "—"}</td><td><span className={`hs-visitor-approval ${visitor.isPreApproved ? "yes" : "no"}`}>{visitor.isPreApproved ? "Yes" : "No"}</span></td></tr>)}
        {!loading && !visible.length && <tr><td colSpan={8} className="hs-empty">{loadError ? "Visitor data unavailable" : visitors.length ? "No visitor logs match your search or filters." : "No visitor records yet."}</td></tr>}
      </tbody></table></div>
      <div className="hs-residents-pagination"><span aria-live="polite">Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} visitor logs</span><div><button disabled={loading || currentPage <= 1} onClick={() => setPage(currentPage - 1)}><ChevronLeftRounded/>Previous</button><button disabled={loading || currentPage * pageSize >= filtered.length} onClick={() => setPage(currentPage + 1)}>Next<ChevronRightRounded/></button></div></div>
    </section>
    <p className="hs-visitor-footnote"><InfoOutlined/>Visitor presence requires a recorded check-in.</p>
  </div>;
};

export default Visitors;
