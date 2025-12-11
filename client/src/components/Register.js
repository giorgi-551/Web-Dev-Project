import React, { useState } from "react";
import "./Register.css";
import Navbar from "./Navbar";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validatePassword = (pwd) =>
    /^(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/.test(pwd);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match!");
      return;
    }

    // Optional password strength check
    // if (!validatePassword(form.password)) {
    //   setError("Password must include a number, special char, and be 8+ chars.");
    //   return;
    // }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      setSuccess("Registration successful! Redirecting to Sign In...");
      setTimeout(() => navigate("/signin"), 1500);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="register-page">
      <Navbar />

      <div className="register-wrapper">
        <div className="register-box">
          <h2>Create Account</h2>

          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}

          <form onSubmit={handleRegister}>
            <div className="input-group">
              <label>Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label>Phone (optional)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                required
              />
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={form.confirm}
                onChange={(e) =>
                  setForm({ ...form, confirm: e.target.value })
                }
                required
              />
            </div>

            <button type="submit" className="submit-btn">
              Register
            </button>
          </form>

          <p className="bottom-text">
            Already have an account?{" "}
            <Link to="/signin" className="signin-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
