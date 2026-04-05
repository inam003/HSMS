import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("hsms_user");
    const storedRole = localStorage.getItem("hsms_role");
    if (storedUser && storedRole) {
      setUser(JSON.parse(storedUser));
      setRole(storedRole);
    }
    setLoading(false);
  }, []);

  const login = async (Email, Password) => {
    const { data } = await api.post("/auth/login", { Email, Password });
    localStorage.setItem("hsms_token", data.token);
    localStorage.setItem("hsms_user", JSON.stringify(data.user));
    localStorage.setItem("hsms_role", data.role);
    setUser(data.user);
    setRole(data.role);
    return data.role;
  };

  const logout = () => {
    localStorage.removeItem("hsms_token");
    localStorage.removeItem("hsms_user");
    localStorage.removeItem("hsms_role");
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
