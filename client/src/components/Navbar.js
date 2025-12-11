import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">🎟️ Event Manager</div>
        <div className="nav-buttons">
          <Link to="/signin">
            <button className="log-in">Sign In</button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
