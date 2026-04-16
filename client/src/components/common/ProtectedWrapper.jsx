import { Navigate } from "react-router-dom";

/**
 * Redirect unauthenticated users to the login page.
 */
const ProtectedWrapper = ({ children }) => {
  const token = localStorage.getItem("token");

  // If there is no token, send the user to the login screen.
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedWrapper;
