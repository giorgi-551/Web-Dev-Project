import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignInPage.css";

const SignInPage = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleSignIn = () => {
    if (!username) return alert("Enter username");
    localStorage.setItem("username", username);
    navigate("/home");
  };

  return (
    <div className="signin-page">
      <h2>Sign In</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleSignIn}>Sign In</button>
    </div>
  );
};

export default SignInPage;
