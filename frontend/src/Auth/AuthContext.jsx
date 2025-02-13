import { createContext, useContext, useState, useEffect } from "react";
import { FetchReusable, PostReusable } from "../Page/API/FetchReusable";
import { Navigate, useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user"))
  );
  const [role, setRole] = useState(() => user?.role);

  const login = (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    setUser(userData);
    setRole(userData.role); // Mengatur role di state
    setIsAuthenticated(true);
  };

  //  

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("splashScreenShown");
    localStorage.clear();
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  const checkToken = async () => {
    const response = await PostReusable(`/auth/check-token`, "post", "", {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response?.data;
  };
  const checkAndLogout = async () => {
    const response = await checkToken();
    if (response?.availability === false) {
      logout();
    }
  };

 

 

  const hasRole = (role) => {
    return user?.role === role;
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, role, login, logout, hasRole,checkAndLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
