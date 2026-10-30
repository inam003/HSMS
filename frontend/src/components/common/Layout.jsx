import { useAuth } from "../../context/AuthContext";
import AdminLayout from "./AdminLayout";
import PortalLayout from "./PortalLayout";

export default function Layout() {
  const { role } = useAuth();
  return role === "admin" ? <AdminLayout/> : <PortalLayout role={role}/>;
}
