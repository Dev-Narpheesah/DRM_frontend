// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  if (requireAdmin) {
    const adminToken = localStorage.getItem("adminToken");
    const admin = (() => { try { return JSON.parse(localStorage.getItem("admin") || "null"); } catch { return null; } })();
    if (!adminToken || !admin) {
      return <Navigate to="/admin/signin" replace />;
    }
    return children;
  }

  const user = (() => { try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; } })();
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  return children;
};

export default ProtectedRoute;
