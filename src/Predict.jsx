import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Particles from "./Particles"; 
import MenuButton from "./MenuButton";
import "./CheckUpPage.css";

const Predict = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prediction = location.state?.prediction;

  useEffect(() => {
    // Log the incoming data to help debug
    console.log("Predict component mounted");
    console.log("Location state:", location.state);
    console.log("Prediction value:", prediction);
    
    // Redirect if no prediction data is available
    if (prediction === undefined) {
      console.warn("No prediction data found, redirecting to home");
      navigate("/");
    }
  }, [location, prediction, navigate]);

  return (
    <div className="checkup-container">
      {/* Particles Background */}
      <div className="checkup-particles-container">
        <Particles />
      </div>

      {/* Top Navigation Bar */}
      <nav className="checkup-top-menu-bar scrolled">
        <MenuButton isOpen={false} toggleMenu={() => {}} />
        <img src="/sushruta_icon.png" alt="Sushruta Logo" className="checkup-sushruta-logo scrolled" />
      </nav>

      {/* Prediction Result Box */}
      <div className="predict-result-box">
        <button className="close-btn" onClick={() => navigate("/")}>✖</button>
        <h2>Heart Disease:</h2>
        {prediction !== undefined ? (
          <h3 className="prediction-text">
            {prediction === 1 ? "High Possibility" : "Low Possibility"}
          </h3>
        ) : (
          <h3 className="prediction-text">No prediction data available</h3>
        )}
      </div>
    </div>
  );
};

export default Predict;