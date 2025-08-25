// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    // not logged in → go to signin
    return <Navigate to="/signin" replace />;
  }

  if (requireAdmin && !user.isAdmin) {
    // user is NOT admin but trying to access admin route
    return <Navigate to="/user-dashboard" replace />;
  }

  if (!requireAdmin && user.isAdmin) {
    // admin trying to access user-only route
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ allowed
  return children;
};

export default ProtectedRoute;
