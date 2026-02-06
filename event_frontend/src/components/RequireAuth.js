import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 */
export function RequireAuth({ user, children }) {
  /** Protect a route by redirecting to /login. */
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
