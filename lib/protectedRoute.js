import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./auth-context"; // Adjust path if your context file is elsewhere

/**
 * Usage:
 * <ProtectedRoute>
 *   <DashboardPage />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // While loading, don't render children or redirect (prevents flicker)
  if (loading) return null;

  // If not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the children (protected page)
  return children;
};

export default ProtectedRoute;