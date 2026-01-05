import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check Auth Status
  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (token && userStr) {
        let userData = JSON.parse(userStr);

        // Always fetch fresh data from backend to ensure role is correct
        try {
          const response = await axiosInstance.get("/api/auth/me");
          if (response.data) {
            // Explicitly extract and normalize role
            const backendRole = response.data.role || userData.role || "";
            userData = {
              ...userData,
              ...response.data,
              role: backendRole.toLowerCase().trim(), // Explicitly set role
            };
            localStorage.setItem("user", JSON.stringify(userData));

            // Set user state immediately with the updated data
            setUser({ ...userData }); // Create new object to ensure React detects change
            setIsAuthenticated(true);
            setLoading(false);
            return; // Exit early to avoid setting user twice
          }
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
          // Normalize role if it exists in localStorage
          if (userData.role) {
            userData.role = userData.role.toLowerCase().trim();
            localStorage.setItem("user", JSON.stringify(userData));
          }
        }

        // Set user state if we didn't already set it above
        setUser({ ...userData }); // Create new object to ensure React detects change
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (userData, token) => {
    // Store token first so axiosInstance can use it
    localStorage.setItem("token", token);

    try {
      // Always fetch fresh user data from backend to ensure role is correct
      const response = await axiosInstance.get("/api/auth/me");
      const freshUserData = response.data || userData;

      // Ensure role is always included and normalized
      const userWithRole = {
        ...freshUserData,
        role: (freshUserData.role || userData.role || "").toLowerCase().trim(),
      };

      localStorage.setItem("user", JSON.stringify(userWithRole));

      setUser({ ...userWithRole }); // Create new object to ensure React detects change
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Failed to fetch user data on login:", error);
      // Fallback to userData if backend fetch fails - ensure role is present
      const userWithRole = {
        ...userData,
        role: (userData.role || "").toLowerCase().trim(),
      };
      localStorage.setItem("user", JSON.stringify(userWithRole));
      setUser({ ...userWithRole }); // Create new object to ensure React detects change
      setIsAuthenticated(true);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    setUser(null);
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  // Update User
  const updateUser = (updatedUserData) => {
    // Always preserve role if not provided in update
    const newUserData = {
      ...user,
      ...updatedUserData,
      role: updatedUserData.role || user?.role || "",
    };
    localStorage.setItem("user", JSON.stringify(newUserData));
    setUser(newUserData);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
