import React, { useEffect } from "react";
import './LoginPage.css';
import Login from '../components/Login';

const LoginPage = () => {
  useEffect(() => {
    // Directly apply dark mode on page load
    document.documentElement.setAttribute("data-theme", "dark"); 
  }, []);

  return (
    <>
      <div className="header-container">
        <h1>Welcome to Ethr-Hub</h1>
      </div>

      <Login />
    </>
  );
}

export default LoginPage;

