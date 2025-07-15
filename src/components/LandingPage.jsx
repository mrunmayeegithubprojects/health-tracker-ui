// src/components/LandingPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <div className="landing-container">
      <p className="intro-text">
        Easily manage users, assign growth goals, update activity, and track monthly rewards — all in one place.
      </p>

      <section className="features-section">
        <div className="feature-card" onClick={() => handleCardClick("/users")}>
          <h3>👥 User Management</h3>
          <p>Create and manage active users effortlessly.</p>
        </div>

        <div className="feature-card" onClick={() => handleCardClick("/parameters")}>
          <h3>📊 Growth Parameters</h3>
          <p>Define goals with daily/monthly frequency and values.</p>
        </div>

        <div className="feature-card" onClick={() => handleCardClick("/user-parameters")}>
          <h3>🔄 Assign Goals</h3>
          <p>Assign growth parameters to individual users.</p>
        </div>

        <div className="feature-card" onClick={() => handleCardClick("/update")}>
          <h3>📅 Update Progress</h3>
          <p>Allow users to update only past 2 days.</p>
        </div>

        <div className="feature-card" onClick={() => handleCardClick("/rewards")}>
          <h3>💰 Rewards</h3>
          <p>View earned rewards, calculate for T-1 month, and log consumption.</p>
        </div>
      </section>

      <footer className="landing-footer">
        <p>Created by Mrunmayee Jadhav</p>
      </footer>
    </div>
  );
};

export default LandingPage;
