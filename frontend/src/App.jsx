import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Layout from "./components/common/Layout";

// Public
import Login from "./pages/Login";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminMembers from "./pages/admin/Members";
import AdminUnits from "./pages/admin/Units";
import AdminStaff from "./pages/admin/Staff";
import AdminBills from "./pages/admin/Bills";
import AdminExpenses from "./pages/admin/Expenses";
import AdminReports from "./pages/admin/Reports";
import AdminNotices from "./pages/admin/Notices";
import AdminComplaints from "./pages/admin/Complaints";
import AdminPolls from "./pages/admin/Polls";
import AdminGuards from "./pages/admin/Guards";
import AdminVisitors from "./pages/admin/Visitors";
import AdminPatrols from "./pages/admin/Patrols";
import AdminAmenities from "./pages/admin/Amenities";

// Resident Pages
import ResidentDashboard from "./pages/resident/Dashboard";
import ResidentUnit from "./pages/resident/Unit";
import ResidentBills from "./pages/resident/Bills";
import ResidentComplaints from "./pages/resident/Complaints";
import ResidentNotices from "./pages/resident/Notices";
import ResidentPolls from "./pages/resident/Polls";
import ResidentAmenities from "./pages/resident/Amenities";
import ResidentVisitors from "./pages/resident/Visitors";
import ResidentSOS from "./pages/resident/SOS";

// Guard Pages
import GuardDashboard from "./pages/guard/Dashboard";
import GuardVisitors from "./pages/guard/Visitors";
import GuardStaff from "./pages/guard/Staff";
import GuardPatrol from "./pages/guard/Patrol";

// Staff Pages
import StaffDashboard from "./pages/staff/Dashboard";
import StaffAttendance from "./pages/staff/Attendance";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* ─── ADMIN ROUTES ─── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="units" element={<AdminUnits />} />
            <Route path="staff" element={<AdminStaff />} />
            <Route path="bills" element={<AdminBills />} />
            <Route path="expenses" element={<AdminExpenses />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="notices" element={<AdminNotices />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="polls" element={<AdminPolls />} />
            <Route path="guards" element={<AdminGuards />} />
            <Route path="visitors" element={<AdminVisitors />} />
            <Route path="patrols" element={<AdminPatrols />} />
            <Route path="amenities" element={<AdminAmenities />} />
          </Route>

          {/* ─── RESIDENT ROUTES ─── */}
          <Route
            path="/resident"
            element={
              <ProtectedRoute allowedRole="resident">
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/resident/dashboard" replace />} />
            <Route path="dashboard" element={<ResidentDashboard />} />
            <Route path="unit" element={<ResidentUnit />} />
            <Route path="bills" element={<ResidentBills />} />
            <Route path="complaints" element={<ResidentComplaints />} />
            <Route path="notices" element={<ResidentNotices />} />
            <Route path="polls" element={<ResidentPolls />} />
            <Route path="amenities" element={<ResidentAmenities />} />
            <Route path="visitors" element={<ResidentVisitors />} />
            <Route path="sos" element={<ResidentSOS />} />
          </Route>

          {/* ─── GUARD ROUTES ─── */}
          <Route
            path="/guard"
            element={
              <ProtectedRoute allowedRole="guard">
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/guard/dashboard" replace />} />
            <Route path="dashboard" element={<GuardDashboard />} />
            <Route path="visitors" element={<GuardVisitors />} />
            <Route path="staff" element={<GuardStaff />} />
            <Route path="patrol" element={<GuardPatrol />} />
          </Route>

          {/* ─── STAFF ROUTES ─── */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRole="staff">
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/staff/dashboard" replace />} />
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="attendance" element={<StaffAttendance />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
