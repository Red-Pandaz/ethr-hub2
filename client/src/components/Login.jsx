import React, { useEffect } from "react";
import { ethers } from "ethers";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { userAddress, isConnected, login, logout } = useAuth();

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

const checkIfWalletIsConnected = async () => {
  if (window.ethereum) {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.listAccounts();

      if (accounts.length > 0) {
        const userAddress = accounts[0];
        const token = localStorage.getItem("authToken");
        localStorage.setItem("userAddress", userAddress);

        if (token) {
          login(userAddress, token);
        } else {
          console.log("No token found, user might not be logged in");
        }
      } else {
        console.log("No accounts found, user might not be connected");
      }
    } catch (err) {
      console.error("Error checking wallet connection:", err);
    }
  } else {
    alert("Please install MetaMask to use this feature");
  }
};

const connectWallet = async () => {
  if (!window.ethereum) {
    alert("MetaMask is not installed. Please install MetaMask and try again.");
    return;
  }

  try {
    // Request user accounts from MetaMask
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    if (accounts && accounts[0]) {
      const userAddress = accounts[0];
      const message = "Please sign this message to log in"; // Request message

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const signature = await signer.signMessage(message);

      // Send the request to the backend to log in
      const response = await fetch("https://ethrhub.xyz:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: userAddress, signature, message }),
      });

      if (!response.ok) {
        console.error("Error logging in, status:", response.status);
        const errorData = await response.json();
        console.error("Error details:", errorData.error || "Unknown error");
        return;
      }

      const data = await response.json();

      if (data.token) {
        // Store the token and ENS name in local storage
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("ensName", data.ensName);

        // Call the login function with the necessary information
        login(userAddress, data.token, data.ensName);
      } else {
        console.error("Login failed: No token received");
      }
    } else {
      console.error("No accounts returned from MetaMask");
    }
  } catch (err) {
    console.error("Error connecting to MetaMask:", err);
    if (err instanceof TypeError) {
      console.error("TypeError details:", err.message);
    }
  }
};

const disconnectWallet = () => {
  logout();
};

  return (
    <div className="login-container">
      {!isConnected ? (
        <div>
          <h3>Login with MetaMask</h3>
          <button className='connect-btn' onClick={connectWallet}>Connect MetaMask</button>
        </div>
      ) : (
        <div>
          <h3>Welcome!</h3>
          <p>You are signed in as {localStorage.getItem("ensName") == "null" ? userAddress: localStorage.getItem("ensName")}</p>
    
          <button className='disconnect-btn' onClick={disconnectWallet}>Disconnect</button>
          <button className="browse-channels-btn">
            <a href="/channels">Browse Channels</a>
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;
