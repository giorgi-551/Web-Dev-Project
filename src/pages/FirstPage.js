import React from "react";
import { Link } from "react-router-dom";
import "./FirstPage.css";

const LandingPage = () => {
  return (
    <div className="landing-page">
      <h1>Welcome to Event System</h1>
      <Link to="/signin">
        <button>Sign In</button>
      </Link>
      <Link to="/home">
        <button>Continue as Guest</button>
      </Link>
    </div>
  );
};

export default LandingPage;
