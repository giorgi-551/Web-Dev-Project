import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [popup, setPopup] = useState("");
  const navigate = useNavigate();

  const users = JSON.parse(localStorage.getItem("users") || "[]");

  const validatePassword = (pwd) => /^(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/.test(pwd);

  const handleSendCode = () => {
    setError("");
    const user = users.find((u) => u.email === email);
    if (!user) return setError("Email not found!");

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(newCode);
    setStep(2);

    // Demo popup instead of email
    setPopup(`Your verification code is: ${newCode}`);
  };

  const handleReset = () => {
    setError("");
    if (code !== generatedCode) return setError("Incorrect code!");
    if (!validatePassword(newPassword))
      return setError(
        "Password must be 8+ chars, include a number and a symbol!"
      );
    if (newPassword !== confirmPassword) return setError("Passwords do not match!");

    const updatedUsers = users.map((u) =>
      u.email === email ? { ...u, password: newPassword } : u
    );
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    setPopup("Password reset successfully!");
    setTimeout(() => navigate("/signin"), 1500);
  };

  return (
    <div className="forgot-wrapper">
      <div className="forgot-box">
        {step === 1 && (
          <>
            <h2>Forgot Password</h2>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && <p className="error-msg">{error}</p>}
            <button onClick={handleSendCode}>Send Code</button>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Enter Verification Code</h2>
            <input
              type="text"
              placeholder="Enter code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {error && <p className="error-msg">{error}</p>}
            <button onClick={handleReset}>Reset Password</button>
          </>
        )}

        {popup && (
          <div className="popup">
            <p>{popup}</p>
            <button onClick={() => setPopup("")}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
