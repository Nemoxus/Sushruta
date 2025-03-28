import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Particles from "./Particles"; 
import MenuButton from "./MenuButton";
import "./CheckUpPage.css";
import styled from 'styled-components';

const Predict = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prediction = location.state?.prediction;
  const cholesterol = location.state?.cholesterol;

  // Function to determine diet plan based on cholesterol levels
  const getDietPlan = (cholesterolLevel) => {
    if (cholesterolLevel < 200) {
      return [
        "> Moderate intake of saturated fats",
        "> Include sources of unsaturated fats",
        "> Limit sugary foods and beverages",
        "> Incorporate fiber-rich foods, especially soluble fiber"
      ];
    } else if (cholesterolLevel >= 200 && cholesterolLevel < 240) {
      return [
        "> Increase intake of soluble fiber-rich foods",
        "> Be more vigilant about limiting saturated fats",
        "> Prefer cooking methods that minimize unhealthy fats",
        "> Incorporate foods fortified with plant sterols or stanols"
      ];
    } else {
      return [
        "> Prioritize plant-based protein sources",
        "> Limit dietary cholesterol from high-fat sources",
        "> Severely restrict saturated fats from all sources",
        "> Maintain a consistently high intake of soluble fiber"
      ];
    }
  };

  useEffect(() => {
    console.log("Predict component mounted");
    console.log("Location state:", location.state);
    console.log("Prediction value:", prediction);
    
    if (prediction === undefined) {
      console.warn("No prediction data found, redirecting to home");
      navigate("/");
    }
  }, [location, prediction, navigate]);

  const dietPlan = cholesterol ? getDietPlan(cholesterol) : [];

  const handleClose = () => {
    navigate("/");
  };

  return (
    <div className="checkup-container">
      <div className="checkup-particles-container">
        <Particles />
      </div>

      <nav className="checkup-top-menu-bar scrolled">
        <MenuButton isOpen={false} toggleMenu={() => {}} />
        <img src="/sushruta_icon.png" alt="Sushruta Logo" className="checkup-sushruta-logo scrolled" />
      </nav>

      <StyledWrapper>
        <div className="card">
          <div className="tools">
            <div className="circle" onClick={handleClose}>
              <span className="red box" />
            </div>
            <div className="circle">
              <span className="yellow box" />
            </div>
            <div className="circle">
              <span className="green box" />
            </div>
          </div>
          <div className="card__content">
            <div className="prediction-result">
              Heart Disease: {prediction === 1 ? "High Possibility" : "Low Possibility"}
            </div>
            {cholesterol && (
              <div className="diet-plan">
                <h3>Recommended Diet Plan</h3>
                <ul>
                  {dietPlan.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </StyledWrapper>
    </div>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;

  .card {
    width: 450px;
    height: 400px;
    background-color: #011522;
    border-radius: 8px;
    z-index: 1;
    color: white;
    display: flex;
    flex-direction: column;
  }

  .tools {
    display: flex;
    align-items: center;
    padding: 9px;
  }

  .circle {
    padding: 0 4px;
    cursor: pointer;  /* Add cursor pointer to indicate clickability */
  }

  .box {
    display: inline-block;
    align-items: center;
    width: 10px;
    height: 10px;
    padding: 1px;
    border-radius: 50%;
  }

  .red {
    background-color: #ff605c;
  }

  .yellow {
    background-color: #ffbd44;
  }

  .green {
    background-color: #00ca4e;
  }

  .card__content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 20px;
    text-align: center;
  }

  .prediction-result {
    font-size: 18px;
    margin-bottom: 20px;
    font-weight: bold;
  }

  .diet-plan h3 {
    margin-bottom: 10px;
    font-size: 16px;
  }

  .diet-plan ul {
    list-style-type: none;
    padding: 0;
    text-align: left;
    width: 100%;
  }

  .diet-plan li {
    margin-bottom: 10px;
    font-size: 14px;
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export default Predict;