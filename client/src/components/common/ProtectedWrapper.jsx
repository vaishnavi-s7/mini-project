import { Navigate } from "react-router-dom";

/**
 * Redirect unauthenticated users to the login page.
 */
const ProtectedWrapper = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // If there is no token, send the user to the login screen.
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedWrapper;
