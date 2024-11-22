import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isConnected } = useAuth();

  return isConnected ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
