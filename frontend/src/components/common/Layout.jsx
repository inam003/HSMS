import { Box, Toolbar } from "@mui/material";
import { Outlet } from "react-router";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = () => (
  <Box sx={{ display: "flex" }}>
    <Navbar />
    <Sidebar />
    <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      <Toolbar />
      <Outlet />
    </Box>
  </Box>
);

export default Layout;
