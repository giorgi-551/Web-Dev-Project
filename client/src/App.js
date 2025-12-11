import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SignIn from "./components/SignIn";
import Register from "./components/Register";
import { AuthProvider } from "./context/AuthContext";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/signin" element={<SignIn />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
