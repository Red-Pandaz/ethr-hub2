import { createContext, useContext, useState, useEffect } from "react";
import apiClient from "../utils/apiClient";

const AuthContext = createContext({
  userAddress: null,
  isConnected: false,
  authToken: null, // Add authToken to the context
  login: () => {},
  logout: () => {},
  loading: true,
});

export const AuthProvider = ({ children }) => {
  const [userAddress, setUserAddress] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [ensName, setEnsName] = useState(null)
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const login = (userAddress, token) => {
    setUserAddress(userAddress);
    setAuthToken(token);
    setEnsName(ensName)
    setIsConnected(true);
    localStorage.setItem("authToken", token);
    localStorage.setItem("userAddress", userAddress);
  };

  const logout = () => {
    setUserAddress(null);
    setAuthToken(null); // Clear the token
    setEnsName(null)

    setIsConnected(false);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userAddress");
    localStorage.removeItem("ensName");
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("userAddress");
    const verify = async () => {
      if (token && user) {
        const isValid = await verifyTokenWithBackend(token);
        if (isValid) {
          setAuthToken(token);
          setUserAddress(user);
          setIsConnected(true);
        } else {
          logout();
        }
      }
      setLoading(false);
    };
    verify();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider
      value={{ userAddress, authToken, isConnected, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const verifyTokenWithBackend = async (token) => {
  try {
    const response = await apiClient.post("/verify-token", { token });
    return response.data.valid;
  } catch {
    return false;
  }
};

export const useAuth = () => useContext(AuthContext);
