// client/src/components/ProtectedRoute.js
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="text-center mt-10">🔐 Loading auth...</div>;
  }

  if (!user || !user.role) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div className="text-red-500 mt-10">🚫 Access denied</div>;
  }

  return children;
};

export default ProtectedRoute;
