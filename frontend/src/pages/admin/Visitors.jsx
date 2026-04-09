import { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, CircularProgress
} from "@mui/material";
import api from "../../api/axios";

const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get("/visitors")
      .then(({ data }) => setVisitors(data))
      .catch(() => setVisitors([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress sx={{ color: "#1a237e" }} />
    </Box>
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={2}>Visitor Logs</Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#1a237e" }}>
            <TableRow>
              {["Visitor Name", "Contact", "Purpose", "Unit", "Check-In", "Check-Out", "Guard", "Pre-Approved"].map((h) => (
                <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visitors.map((v) => (
              <TableRow key={v._id} hover>
                <TableCell>{v.Name}</TableCell>
                <TableCell>{v.Contact_No}</TableCell>
                <TableCell>{v.Purpose}</TableCell>
                <TableCell>{v.unit?.Unit_Number || "—"}</TableCell>
                <TableCell>{v.CheckIn_Time ? new Date(v.CheckIn_Time).toLocaleString() : "—"}</TableCell>
                <TableCell>{v.CheckOut_Time ? new Date(v.CheckOut_Time).toLocaleString() : <Chip label="Inside" color="success" size="small" />}</TableCell>
                <TableCell>{v.guard?.Name || "—"}</TableCell>
                <TableCell><Chip label={v.isPreApproved ? "Yes" : "No"} color={v.isPreApproved ? "primary" : "default"} size="small" /></TableCell>
              </TableRow>
            ))}
            {!visitors.length && <TableRow><TableCell colSpan={8} align="center">No visitor records</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Visitors;
