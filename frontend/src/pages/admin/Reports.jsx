import Toast from "../../components/common/Toast";
import { useEffect, useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import AssessmentOutlined from "@mui/icons-material/AssessmentOutlined";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import AccessTimeRounded from "@mui/icons-material/AccessTimeRounded";
import api from "../../api/axios";
import "./Members.css";
import "./Reports.css";

const amount = value => Number(value || 0).toLocaleString("en-PK", { maximumFractionDigits: 2 });
const money = value => `PKR ${amount(value)}`;
const sum = rows => rows.reduce((total, row) => total + (Number(row.Amount) || 0), 0);
const dateLabel = value => {
  const date = new Date(value);
  return value && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("en-GB", { timeZone: "UTC" }) : "—";
};
const breakdown = (rows, field) => rows.reduce((groups, row) => {
  const label = row[field] || "Other";
  const group = groups.get(label) || { amount: 0, count: 0 };
  group.amount += Number(row.Amount) || 0;
  group.count += 1;
  groups.set(label, group);
  return groups;
}, new Map());

function Reports() {
  const [report, setReport] = useState(null);
  const [unpaid, setUnpaid] = useState([]);
  const [view, setView] = useState("income-expense");
  const [tab, setTab] = useState("income");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [summary, defaulters] = await Promise.all([
          api.get("/expenses/reports/summary?type=income-expense"),
          api.get("/expenses/reports/summary?type=defaulters"),
        ]);
        if (active) { setReport(summary.data); setUnpaid(defaulters.data); }
      } catch (e) {
        if (active) setError(e.response?.data?.message || "Unable to load financial reports. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [revision]);

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const overdue = bill => Boolean(bill.Due_Date && bill.Due_Date.slice(0, 10) < today);
  const overdueCount = unpaid.filter(overdue).length;
  const query = search.trim().toLowerCase();
  const filtered = unpaid.filter(bill =>
    (String(bill.unit?.Unit_Number ?? "").toLowerCase().includes(query) || (bill.unit?.resident?.Name || "").toLowerCase().includes(query)) &&
    (!status || (status === "overdue" ? overdue(bill) : !overdue(bill)))
  );
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const income = report?.paidBills ?? [];
  const expenses = report?.expenses ?? [];
  const isIncome = tab === "income";
  const records = isIncome ? income : expenses;
  const groups = breakdown(records, isIncome ? "Bill_Type" : "ExpenseCategory");
  const balance = Number(report?.balance || 0);
  const expPaid = sum(expenses.filter(expense => expense.PaymentStatus === "Paid"));
  const expPending = sum(expenses.filter(expense => expense.PaymentStatus === "Pending"));

  return <div className="hs-reports">
    <div className="hs-page-heading hs-members-heading hs-reports-heading"><div><h1>Financial Reports</h1><p>Review income, expenses, and outstanding dues.</p></div></div>
    <div className="hs-report-switch" role="group" aria-label="Select financial report">
      <button className={view === "income-expense" ? "active" : ""} aria-pressed={view === "income-expense"} onClick={() => setView("income-expense")}><AssessmentOutlined/>Income vs expenses</button>
      <button className={view === "defaulters" ? "active" : ""} aria-pressed={view === "defaulters"} onClick={() => setView("defaulters")}><WarningAmberRounded/>Defaulter list <span>{loading || error ? "—" : unpaid.length}</span></button>
    </div>
    {error && <Toast severity="error" sx={{ mb: 2 }} action={<Button color="inherit" onClick={() => { setError(""); setLoading(true); setRevision(value => value + 1); }}>Retry</Button>}>{error}</Toast>}
    {loading && <div className="hs-loading" role="status"><CircularProgress size={28}/>Loading financial reports...</div>}
    {!loading && !error && report && (view === "income-expense" ? <>
      <div className="hs-report-cards">
        {[
          { label: "Total income", value: report.totalIncome, sub: `${income.length} paid bills` },
          { label: "Total expenses", value: report.totalExpenses, sub: `${expenses.length} expense records` },
          { label: "Net balance (Income − Expenses)", value: balance, sub: balance < 0 ? "Expenses exceed income" : balance > 0 ? "Income exceeds expenses" : "Income equals expenses", color: balance < 0 ? "negative" : "positive" },
          { label: "Outstanding dues", value: report.totalOutstanding, sub: `${report.unpaidCount ?? unpaid.length} unpaid bills`, color: "outstanding" },
        ].map(card => <section className={`hs-panel hs-report-card ${card.color || ""}`} key={card.label}><h2>{card.label}</h2><strong>{money(card.value)}</strong><p>{card.sub}</p></section>)}
      </div>
      <section className="hs-panel hs-report-detail" aria-label="Income and expense details">
        <div className="hs-report-tabs" role="group" aria-label="Select income or expenses">
          {[["income", "Income", income.length], ["expenses", "Expenses", expenses.length]].map(([value, label, count]) => <button key={value} className={tab === value ? "active" : ""} aria-pressed={tab === value} onClick={() => setTab(value)}>{label}<span>{count}</span></button>)}
        </div>
        <div className="hs-report-breakdown"><h2>{isIncome ? "Breakdown by bill type" : "Breakdown by category"}</h2><div className="hs-report-breakdown-grid">
          {[...groups].map(([label, group]) => <div key={label}><h3>{label}</h3><strong>{money(group.amount)}</strong><p>{group.count} {group.count === 1 ? "record" : "records"}</p></div>)}
          {!groups.size && <p className="hs-report-muted">{isIncome ? "No paid bills yet." : "No expenses recorded yet."}</p>}
        </div></div>
        <h2 className="hs-report-table-title">{isIncome ? "Paid bills" : "Expense records"} ({records.length} records)</h2>
        <div className="hs-report-table-wrap"><table className="hs-report-table"><thead><tr>{(isIncome ? ["#", "Unit no.", "Resident", "Bill type", "Due date", "Amount (PKR)"] : ["#", "Date", "Category", "Description", "Payment status", "Amount (PKR)"]).map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead>
          <tbody>{records.map((record, index) => <tr key={record._id}><td>{index + 1}</td>{isIncome ? <><td>{record.unit?.Unit_Number ?? "—"}</td><td>{record.unit?.resident?.Name || "—"}</td><td><span className="hs-report-type">{record.Bill_Type}</span></td><td>{dateLabel(record.Due_Date)}</td></> : <><td>{dateLabel(record.ExpenseDate)}</td><td><span className="hs-report-type">{record.ExpenseCategory}</span></td><td className="hs-report-description">{record.Description || "—"}</td><td><span className={`hs-report-status ${record.PaymentStatus === "Paid" ? "paid" : "pending"}`}><i/>{record.PaymentStatus}</span></td></>}<td>{money(record.Amount)}</td></tr>)}
            {!records.length && <tr><td colSpan={6} className="hs-empty">{isIncome ? "No paid bills found." : "No expense records found."}</td></tr>}
          </tbody><tfoot><tr><th colSpan={5} scope="row">{isIncome ? "Total income" : "Total expenses"}</th><td>{money(isIncome ? report.totalIncome : report.totalExpenses)}</td></tr></tfoot>
        </table></div>
        {!isIncome && <div className="hs-report-expense-footer"><p>Paid: <strong>{money(expPaid)}</strong><span>Pending: <strong>{money(expPending)}</strong></span></p><div className={balance < 0 ? "negative" : "positive"}><span>Net balance = {money(report.totalIncome)} − {money(report.totalExpenses)}</span><strong>{money(balance)}</strong></div></div>}
      </section>
      <p className="hs-report-footnote">{isIncome ? "Income includes paid bills only." : "Expenses include both paid and pending records."}</p>
    </> : <>
      <section className="hs-panel hs-defaulter-summary" aria-label="Unpaid bill summary"><div><h2>Outstanding dues</h2><strong>{money(sum(unpaid))}</strong></div><div><h2>Unpaid bills</h2><strong>{unpaid.length}</strong></div><div className="negative"><h2>Overdue bills</h2><strong>{overdueCount}</strong></div></section>
      {overdueCount > 0 && <div className="hs-report-warning" role="status"><WarningAmberRounded/>{overdueCount} {overdueCount === 1 ? "bill has" : "bills have"} passed {overdueCount === 1 ? "its" : "their"} due date.</div>}
      <section className="hs-panel hs-defaulter-detail" aria-label="Defaulter list">
        <div className="hs-defaulter-heading"><div><h2>Defaulter list <span>{unpaid.length}</span></h2><p>All unpaid bills and overdue balances.</p></div><div className="hs-defaulter-filters"><label className="hs-resident-search"><SearchRounded/><input type="search" placeholder="Search unit or resident..." aria-label="Search defaulters by unit or resident" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/></label><div className="hs-resident-filter"><select aria-label="Filter unpaid bills by status" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">All statuses</option><option value="overdue">Overdue</option><option value="pending">Pending</option></select><KeyboardArrowDownRounded/></div></div></div>
        <div className="hs-report-table-wrap"><table className="hs-report-table hs-defaulter-table"><thead><tr>{["Unit no.", "Resident", "Contact", "Amount (PKR)", "Due date", "Type", "Status"].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>
          {visible.map(bill => <tr key={bill._id}><td>{bill.unit?.Unit_Number ?? "—"}</td><td>{bill.unit?.resident?.Name || "—"}</td><td>{bill.unit?.resident?.Contact_No || "—"}</td><td><strong>{amount(bill.Amount)}</strong></td><td>{dateLabel(bill.Due_Date)}</td><td><span className="hs-report-type">{bill.Bill_Type}</span></td><td><span className={`hs-report-status ${overdue(bill) ? "overdue" : "pending"}`}><AccessTimeRounded/>{overdue(bill) ? "Overdue" : "Pending"}</span></td></tr>)}
          {!visible.length && <tr><td colSpan={7} className="hs-empty">{unpaid.length ? "No unpaid bills match your search or filter." : "No unpaid bills found."}</td></tr>}
        </tbody><tfoot><tr><th colSpan={3} scope="row">{search.trim() || status ? "Filtered outstanding" : "Total outstanding"}</th><td>{money(sum(filtered))}</td><td colSpan={3}/></tr></tfoot></table></div>
        <div className="hs-residents-pagination"><span aria-live="polite">Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} unpaid bills.</span><div><button disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}><ChevronLeftRounded/>Previous</button><button disabled={currentPage * pageSize >= filtered.length} onClick={() => setPage(currentPage + 1)}>Next<ChevronRightRounded/></button></div></div>
      </section>
    </>)}
  </div>;
}

export default Reports;
