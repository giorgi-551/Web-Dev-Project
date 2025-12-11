import React, { useState } from "react";
import "./SignIn.css";
import Navbar from "./Navbar";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid email or password");
        return;
      }

      // Backend returns { user, token }
      login(data.user, data.token);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setResetError("Please enter your email.");
      return;
    }
    // Just demo behaviour – no real backend here
    setResetError("");
    setCodeSent(true);
    console.log(`Pretending to send reset code to ${resetEmail}`);
  };

  return (
    <div className="signin-page">
      <Navbar />

      <div className="wrapper">
        <div className="login_box">
          <div className="login_header">
            <span>Sign In</span>
          </div>

          {error && <div className="error-msg">{error}</div>}

          {!showForgot ? (
            <form onSubmit={handleSubmit}>
              <div className="input_box">
                <input
                  type="email"
                  className="input-field"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input_box">
                <input
                  type="password"
                  className="input-field"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="input-submit">
                Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              {!codeSent ? (
                <>
                  <div className="input_box">
                    <input
                      type="email"
                      className="input-field"
                      placeholder="Enter your email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="input-submit">
                    Send Reset Code
                  </button>

                  {resetError && <div className="error-msg">{resetError}</div>}
                </>
              ) : (
                <>
                  <div className="input_box">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Enter reset code"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      required
                    />
                  </div>

                  <div className="input_box">
                    <input
                      type="password"
                      className="input-field"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="input-submit">
                    Reset Password
                  </button>
                </>
              )}
            </form>
          )}

          <p
            className="forgot-password"
            onClick={() => setShowForgot(!showForgot)}
          >
            {showForgot ? "Back to Sign In" : "Forgot Password?"}
          </p>

          <p className="bottom-text">
            Don't have an account?{" "}
            <Link to="/register" className="signin-link">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
