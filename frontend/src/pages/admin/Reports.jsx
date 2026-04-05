import { useState } from "react";
import {
  Box, Typography, Button, Card, CardContent, Grid, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Alert, CircularProgress, Chip
} from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import WarningIcon from "@mui/icons-material/Warning";
import api from "../../api/axios";

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState("");
  const [error, setError] = useState("");

  const fetchReport = async (type) => {
    setLoading(true); setError(""); setReport(null); setReportType(type);
    try {
      const { data } = await api.get(`/expenses/reports/summary?type=${type}`);
      setReport(data);
    } catch (e) { setError(e.response?.data?.message || "Error fetching report"); }
    setLoading(false);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3}>Financial Reports</Typography>
      <Grid container spacing={2} mb={3}>
        <Grid item>
          <Button variant="contained" startIcon={<AssessmentIcon />} onClick={() => fetchReport("income-expense")} sx={{ bgcolor: "#1a237e" }}>
            Income vs Expense Report
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="error" startIcon={<WarningIcon />} onClick={() => fetchReport("defaulters")}>
            Defaulter List
          </Button>
        </Grid>
      </Grid>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {report && reportType === "income-expense" && (
        <Box>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ borderLeft: "4px solid #2e7d32", borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">Total Income (Paid Bills)</Typography>
                  <Typography variant="h5" fontWeight="bold" color="#2e7d32">PKR {report.totalIncome?.toLocaleString()}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ borderLeft: "4px solid #c62828", borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">Total Expenses</Typography>
                  <Typography variant="h5" fontWeight="bold" color="#c62828">PKR {report.totalExpenses?.toLocaleString()}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ borderLeft: "4px solid #1565c0", borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">Net Balance</Typography>
                  <Typography variant="h5" fontWeight="bold" color={report.balance >= 0 ? "#2e7d32" : "#c62828"}>
                    PKR {report.balance?.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {report && reportType === "defaulters" && (
        <Box>
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
                      <TableCell>PKR {b.Amount?.toLocaleString()}</TableCell>
                      <TableCell>{b.Due_Date ? new Date(b.Due_Date).toLocaleDateString() : "—"}</TableCell>
                      <TableCell><Chip label={b.Bill_Type} size="small" /></TableCell>
                      <TableCell>
                        <Chip
                          label={isOverdue ? "Overdue ⚠️" : "Pending"}
                          color={isOverdue ? "error" : "warning"}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!report.length && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No unpaid bills found 🎉</TableCell>
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
