import { useState, useEffect } from "react";
import {
  Box, Typography, Button, Card, CardContent, Grid, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Alert,
  CircularProgress, Chip, Divider, Tabs, Tab
} from "@mui/material";
import AssessmentIcon   from "@mui/icons-material/Assessment";
import WarningIcon      from "@mui/icons-material/Warning";
import TrendingUpIcon   from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceIcon  from "@mui/icons-material/AccountBalance";
import HourglassEmptyIcon  from "@mui/icons-material/HourglassEmpty";
import api from "../../api/axios";

/* ── small reusable summary card ── */
const SummaryCard = ({ label, value, sub, color }) => (
  <Card sx={{ borderLeft: `4px solid ${color}`, borderRadius: 2, height: "100%" }}>
    <CardContent>
      <Typography variant="subtitle2" color="text.secondary" mb={0.5}>{label}</Typography>
      <Typography variant="h5" fontWeight="bold" color={color}>
        PKR {(value ?? 0).toLocaleString()}
      </Typography>
      {sub && (
        <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>{sub}</Typography>
      )}
    </CardContent>
  </Card>
);

/* ── breakdown pill showing a sub-total ── */
const SubPill = ({ label, amount, count, color }) => (
  <Box sx={{
    display: "inline-flex", flexDirection: "column", alignItems: "center",
    bgcolor: `${color}12`, border: `1px solid ${color}30`,
    borderRadius: 2, px: 4, py: 2, mr: 1.5, mb: 1.5, minWidth: 160,
  }}>
    <Typography variant="body2" color="text.secondary" fontWeight="bold" mb={0.5}>{label}</Typography>
    <Typography variant="h6" fontWeight="bold" color={color}>PKR {(amount ?? 0).toLocaleString()}</Typography>
    <Typography variant="caption" color="text.secondary" mt={0.5}>{count} record{count !== 1 ? "s" : ""}</Typography>
  </Box>
);

const Reports = () => {
  const [report, setReport]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [reportType, setReportType] = useState("");
  const [error, setError]       = useState("");
  const [tab, setTab]           = useState(0);

  const fetchReport = async (type) => {
    setLoading(true); setError(""); setReport(null); setReportType(type);
    try {
      const { data } = await api.get(`/expenses/reports/summary?type=${type}`);
      setReport(data);
    } catch (e) { setError(e.response?.data?.message || "Error fetching report"); }
    setLoading(false);
  };

  useEffect(() => { fetchReport("income-expense"); }, []);

  /* ── derived breakdowns (computed only when income-expense report is loaded) ── */
  const incomeByType = (report?.paidBills ?? []).reduce((acc, b) => {
    if (!acc[b.Bill_Type]) acc[b.Bill_Type] = { amount: 0, count: 0 };
    acc[b.Bill_Type].amount += b.Amount;
    acc[b.Bill_Type].count  += 1;
    return acc;
  }, {});

  const expenseByCategory = (report?.expenses ?? []).reduce((acc, e) => {
    if (!acc[e.ExpenseCategory]) acc[e.ExpenseCategory] = { amount: 0, count: 0 };
    acc[e.ExpenseCategory].amount += e.Amount;
    acc[e.ExpenseCategory].count  += 1;
    return acc;
  }, {});

  /* total from expenses where PaymentStatus = "Paid" vs "Pending" */
  const expPaid    = (report?.expenses ?? []).filter((e) => e.PaymentStatus === "Paid").reduce((s, e) => s + e.Amount, 0);
  const expPending = (report?.expenses ?? []).filter((e) => e.PaymentStatus === "Pending").reduce((s, e) => s + e.Amount, 0);

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3}>Financial Reports</Typography>

      {/* ── Report buttons ── */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <Button
          variant={reportType === "income-expense" ? "contained" : "outlined"}
          startIcon={<AssessmentIcon />}
          onClick={() => fetchReport("income-expense")}
          sx={{ borderRadius: 2, ...(reportType === "income-expense" && { bgcolor: "#1a237e" }) }}>
          Income vs Expense Report
        </Button>
        <Button
          variant={reportType === "defaulters" ? "contained" : "outlined"}
          color="error" startIcon={<WarningIcon />}
          onClick={() => fetchReport("defaulters")}
          sx={{ borderRadius: 2 }}>
          Defaulter List
        </Button>
      </Box>

      {loading && <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>}
      {error   && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      {/* ════════════════ INCOME vs EXPENSE REPORT ════════════════ */}
      {report && reportType === "income-expense" && (
        <Box>

          {/* ── 4 summary cards ── */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                label="Total Income (Paid Bills)"
                value={report.totalIncome}
                sub={`${report.paidBills?.length ?? 0} paid bills — sum of all amounts`}
                color="#2e7d32"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                label="Total Expenses"
                value={report.totalExpenses}
                sub={`${report.expenses?.length ?? 0} expense records — all categories`}
                color="#c62828"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                label="Net Balance (Income − Expenses)"
                value={report.balance}
                sub={report.balance >= 0 ? "Surplus — income exceeds expenses" : "Deficit — expenses exceed income"}
                color={report.balance >= 0 ? "#2e7d32" : "#c62828"}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                label="Outstanding (Unpaid Bills)"
                value={report.totalOutstanding}
                sub={`${report.unpaidCount ?? 0} bills still unpaid — not counted in income`}
                color="#f57f17"
              />
            </Grid>
          </Grid>

          {/* ── Income / Expense tabs ── */}
          <Card sx={{ borderRadius: 2 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}
              sx={{ px: 2, borderBottom: "1px solid #e0e0e0" }}
              TabIndicatorProps={{ style: { backgroundColor: tab === 0 ? "#2e7d32" : "#c62828" } }}>
              <Tab
                icon={<TrendingUpIcon />} iconPosition="start"
                label={`Income (${report.paidBills?.length ?? 0} bills)`}
                sx={{ fontWeight: "bold", color: tab === 0 ? "#2e7d32" : undefined, "&.Mui-selected": { color: "#2e7d32" } }}
              />
              <Tab
                icon={<TrendingDownIcon />} iconPosition="start"
                label={`Expenses (${report.expenses?.length ?? 0} records)`}
                sx={{ fontWeight: "bold", color: tab === 1 ? "#c62828" : undefined, "&.Mui-selected": { color: "#c62828" } }}
              />
            </Tabs>

            <CardContent>
              {/* ── Income tab ── */}
              {tab === 0 && (
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" mb={1}>Breakdown by Bill Type</Typography>
                  <Box mb={2}>
                    {Object.entries(incomeByType).length ? (
                      Object.entries(incomeByType).map(([type, { amount, count }]) => (
                        <SubPill key={type} label={type} amount={amount} count={count} color="#2e7d32" />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">No paid bills yet.</Typography>
                    )}
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                    All Paid Bills ({report.paidBills?.length ?? 0} records)
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: "#e8f5e9" }}>
                        <TableRow>
                          {["#", "Unit No.", "Resident", "Bill Type", "Due Date", "Amount"].map((h) => (
                            <TableCell key={h} sx={{ fontWeight: "bold", color: "#2e7d32" }}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {report.paidBills?.map((b, i) => (
                          <TableRow key={b._id} hover>
                            <TableCell sx={{ color: "#aaa" }}>{i + 1}</TableCell>
                            <TableCell>{b.unit?.Unit_Number || "—"}</TableCell>
                            <TableCell>{b.unit?.resident?.Name || "—"}</TableCell>
                            <TableCell><Chip label={b.Bill_Type} size="small" /></TableCell>
                            <TableCell>{b.Due_Date ? new Date(b.Due_Date).toLocaleDateString() : "—"}</TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "#2e7d32" }}>
                              PKR {b.Amount?.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                        {!report.paidBills?.length && (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 4, color: "#aaa" }}>No paid bills found</TableCell>
                          </TableRow>
                        )}
                        {report.paidBills?.length > 0 && (
                          <TableRow sx={{ bgcolor: "#e8f5e9" }}>
                            <TableCell colSpan={5} sx={{ fontWeight: "bold", textAlign: "right" }}>Total Income</TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "#2e7d32" }}>
                              PKR {(report.totalIncome ?? 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* ── Expenses tab ── */}
              {tab === 1 && (
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" mb={1}>Breakdown by Category</Typography>
                  <Box mb={2}>
                    {Object.entries(expenseByCategory).length ? (
                      Object.entries(expenseByCategory).map(([cat, { amount, count }]) => (
                        <SubPill key={cat} label={cat} amount={amount} count={count} color="#c62828" />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">No expenses recorded yet.</Typography>
                    )}
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                    All Expense Records ({report.expenses?.length ?? 0} records)
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: "#ffebee" }}>
                        <TableRow>
                          {["#", "Date", "Category", "Description", "Payment Status", "Amount"].map((h) => (
                            <TableCell key={h} sx={{ fontWeight: "bold", color: "#c62828" }}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {report.expenses?.map((e, i) => (
                          <TableRow key={e._id} hover>
                            <TableCell sx={{ color: "#aaa" }}>{i + 1}</TableCell>
                            <TableCell>{e.ExpenseDate ? new Date(e.ExpenseDate).toLocaleDateString() : "—"}</TableCell>
                            <TableCell><Chip label={e.ExpenseCategory} size="small" /></TableCell>
                            <TableCell>{e.Description || "—"}</TableCell>
                            <TableCell>
                              <Chip label={e.PaymentStatus} size="small"
                                color={e.PaymentStatus === "Paid" ? "success" : "warning"} />
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "#c62828" }}>
                              PKR {e.Amount?.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                        {!report.expenses?.length && (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 4, color: "#aaa" }}>No expense records found</TableCell>
                          </TableRow>
                        )}
                        {report.expenses?.length > 0 && (
                          <TableRow sx={{ bgcolor: "#ffebee" }}>
                            <TableCell colSpan={5} sx={{ fontWeight: "bold", textAlign: "right" }}>Total Expenses</TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "#c62828" }}>
                              PKR {(report.totalExpenses ?? 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* net balance footer */}
                  <Box sx={{
                    mt: 2, p: 2, borderRadius: 2,
                    bgcolor: report.balance >= 0 ? "#e8f5e9" : "#ffebee",
                    border: `1px solid ${report.balance >= 0 ? "#a5d6a7" : "#ef9a9a"}`,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AccountBalanceIcon sx={{ color: report.balance >= 0 ? "#2e7d32" : "#c62828" }} />
                      <Typography fontWeight="bold" color={report.balance >= 0 ? "#2e7d32" : "#c62828"}>
                        Net Balance = PKR {(report.totalIncome ?? 0).toLocaleString()} − PKR {(report.totalExpenses ?? 0).toLocaleString()}
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold" color={report.balance >= 0 ? "#2e7d32" : "#c62828"}>
                      PKR {(report.balance ?? 0).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* ════════════════ DEFAULTER LIST ════════════════ */}
      {report && reportType === "defaulters" && (
        <Box>
          {/* summary bar */}
          {report.length > 0 && (
            <Box sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: "#fff3e0", border: "1px solid #ffcc80",
              display: "flex", gap: 3, flexWrap: "wrap" }}>
              <Box display="flex" alignItems="center" gap={1}>
                <HourglassEmptyIcon sx={{ color: "#f57f17" }} />
                <Typography fontWeight="bold" color="#f57f17">
                  {report.length} unpaid bill{report.length !== 1 ? "s" : ""}
                </Typography>
              </Box>
              <Typography fontWeight="bold" color="#c62828">
                Total Outstanding: PKR {report.reduce((s, b) => s + b.Amount, 0).toLocaleString()}
              </Typography>
              <Typography fontWeight="bold" color="#c62828">
                Overdue: {report.filter((b) => new Date(b.Due_Date) < new Date()).length} bill(s)
              </Typography>
            </Box>
          )}

          <Typography variant="h6" mb={1} color="error">Defaulters — All Unpaid Bills</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Bills marked <strong>Overdue</strong> have passed their due date.
          </Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ bgcolor: "#c62828" }}>
                <TableRow>
                  {["Unit No.", "Resident", "Contact", "Amount", "Due Date", "Type", "Status"].map((h) => (
                    <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {report.map((b) => {
                  const isOverdue = b.Due_Date && new Date(b.Due_Date) < new Date();
                  return (
                    <TableRow key={b._id} sx={{ bgcolor: isOverdue ? "#fff8f8" : "inherit" }}>
                      <TableCell>{b.unit?.Unit_Number || "—"}</TableCell>
                      <TableCell>{b.unit?.resident?.Name || "—"}</TableCell>
                      <TableCell>{b.unit?.resident?.Contact_No || "—"}</TableCell>
                      <TableCell><strong>PKR {b.Amount?.toLocaleString()}</strong></TableCell>
                      <TableCell>{b.Due_Date ? new Date(b.Due_Date).toLocaleDateString() : "—"}</TableCell>
                      <TableCell><Chip label={b.Bill_Type} size="small" /></TableCell>
                      <TableCell>
                        <Chip label={isOverdue ? "Overdue ⚠️" : "Pending"} size="small"
                          color={isOverdue ? "error" : "warning"} />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!report.length && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      No unpaid bills found 🎉
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default Reports;
