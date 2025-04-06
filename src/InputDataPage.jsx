import React, { useState, useEffect } from "react";
import Particles from "./Particles";
import MenuButton from "./MenuButton";
import { auth, db } from "./firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./CheckUpPage.css";

const InputDataPage = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState({
    Age: "",
    Gender: "",
    Blood_Pressure: "",
    Cholesterol_Level: "",
    Exercise_Habits: "",
    Smoking: "",
    Family_Heart_Disease: "",
    Diabetes: "",
    BMI: "",
    High_Blood_Pressure: "",
    Low_HDL_Cholesterol: "",
    High_LDL_Cholesterol: "",
    Alcohol_Consumption: "",
    Stress_Level: "",
    Sleep_Hours: "",
    Sugar_Consumption: "",
    Triglyceride_Level: "",
    Fasting_Blood_Sugar: "",
    CRP_Level: "",
    Homocysteine_Level: ""
  });

  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔄 InputDataPage mounted, opening form by default...");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("✅ Auth state changed: ", user);
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const validateField = (name, value) => {
    // First check if the value is empty (which is allowed during typing)
    if (value === '') return true;
    
    switch (name) {
      case 'Age':
        return parseFloat(value) >= 0 && parseFloat(value) <= 120;
      case 'Gender':
        return ['0', '1'].includes(value);
      case 'Blood_Pressure':
        // Fixed validation for Blood_Pressure
        return parseFloat(value) >= 70 && parseFloat(value) <= 220;
      case 'Cholesterol_Level':
        // Added limits for Cholesterol_Level (130-300)
        return parseFloat(value) >= 130 && parseFloat(value) <= 300;
      case 'BMI':
        return parseFloat(value) >= 10 && parseFloat(value) <= 50;
      case 'Sleep_Hours':
        return parseFloat(value) >= 0 && parseFloat(value) <= 24;
      case 'Triglyceride_Level':
        // Added limits for Triglyceride_Level (40-500)
        return parseFloat(value) >= 40 && parseFloat(value) <= 500;
      case 'Fasting_Blood_Sugar':
        // Added limits for Fasting_Blood_Sugar (70-300)
        return parseFloat(value) >= 70 && parseFloat(value) <= 300;
      case 'CRP_Level':
        // Added limits for CRP_Level (0-20)
        return parseFloat(value) >= 0 && parseFloat(value) <= 20;
      case 'Homocysteine_Level':
        // Added limits for Homocysteine_Level (5-30)
        return parseFloat(value) >= 5 && parseFloat(value) <= 30;
      case 'Alcohol_Consumption':
        // Values 0/1/2/3 (none/low/medium/high)
        return ['0', '1', '2', '3'].includes(value);
      case 'Sugar_Consumption':
        // Values 0/1/2 (low/medium/high)
        return ['0', '1', '2'].includes(value);
      case 'Stress_Level':
        // Values 0 to 2
        return parseInt(value) >= 0 && parseInt(value) <= 2;
      case 'Exercise_Habits':
      case 'Smoking':
      case 'Family_Heart_Disease':
      case 'Diabetes':
      case 'High_Blood_Pressure':
      case 'Low_HDL_Cholesterol':
      case 'High_LDL_Cholesterol':
        return ['0', '1'].includes(value);
      default:
        return true;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Always update the form data first
    setFormData({ ...formData, [name]: value });
    
    // Then validate and set errors if needed
    if (!validateField(name, value)) {
      setErrors(prev => ({
        ...prev,
        [name]: `Invalid ${name.replace(/_/g, ' ')} value`
      }));
    } else {
      // Clear any existing error for this field
      if (errors[name]) {
        setErrors(prev => {
          const newErrors = {...prev};
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🚀 Submitting form data:", formData);

    // Validate all fields before submission
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (formData[key].trim() === "") {
        newErrors[key] = `${key.replace(/_/g, ' ')} is required`;
      } else if (!validateField(key, formData[key])) {
        newErrors[key] = `Invalid ${key.replace(/_/g, ' ')} value`;
      }
    });

    // If there are any validation errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert("⚠️ Please fix all errors before submitting!");
      return;
    }

    if (!user) {
      alert("⚠️ You must be signed in to submit data!");
      return;
    }

    try {
      // 🔹 Convert string values to appropriate types for prediction
      const formattedData = {
        Age: parseFloat(formData.Age),
        Gender: parseInt(formData.Gender),
        Blood_Pressure: parseFloat(formData.Blood_Pressure),
        Cholesterol_Level: parseFloat(formData.Cholesterol_Level),
        Exercise_Habits: parseInt(formData.Exercise_Habits),
        Smoking: parseInt(formData.Smoking),
        Family_Heart_Disease: parseInt(formData.Family_Heart_Disease),
        Diabetes: parseInt(formData.Diabetes),
        BMI: parseFloat(formData.BMI),
        High_Blood_Pressure: parseInt(formData.High_Blood_Pressure),
        Low_HDL_Cholesterol: parseInt(formData.Low_HDL_Cholesterol),
        High_LDL_Cholesterol: parseInt(formData.High_LDL_Cholesterol),
        Alcohol_Consumption: parseInt(formData.Alcohol_Consumption),
        Stress_Level: parseInt(formData.Stress_Level),
        Sleep_Hours: parseFloat(formData.Sleep_Hours),
        Sugar_Consumption: parseInt(formData.Sugar_Consumption),
        Triglyceride_Level: parseFloat(formData.Triglyceride_Level),
        Fasting_Blood_Sugar: parseFloat(formData.Fasting_Blood_Sugar),
        CRP_Level: parseFloat(formData.CRP_Level),
        Homocysteine_Level: parseFloat(formData.Homocysteine_Level)
      };

      // 🔹 Save to Firestore
      await addDoc(collection(db, `users/${user.uid}/healthData`), {
        ...formattedData,
        timestamp: serverTimestamp(),
      });
      console.log("✅ Health data added to Firestore successfully");
      
      console.log("🔍 Sending features to prediction API:", formattedData);

      // 🔹 Send data to Flask API for prediction
      const response = await fetch("https://sushruta-backend.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });
      
      console.log("📡 API response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const result = await response.json();
      console.log("🔮 API response data:", result);

      if (result.prediction !== undefined) {
        console.log("✅ Navigating to prediction page with result:", result.prediction);
        // Force navigation with state
        navigate("/predict", { 
          state: {
            prediction: result.prediction,
            cholesterol: parseFloat(formData.Cholesterol_Level),
          },
          replace: true 
        });
      } else {
        console.error("❌ Prediction failed:", result.error);
        alert("⚠️ Failed to get a prediction.");
      }

      // 🔹 Reset form after submission
      setFormData({
        Age: "",
        Gender: "",
        Blood_Pressure: "",
        Cholesterol_Level: "",
        Exercise_Habits: "",
        Smoking: "",
        Family_Heart_Disease: "",
        Diabetes: "",
        BMI: "",
        High_Blood_Pressure: "",
        Low_HDL_Cholesterol: "",
        High_LDL_Cholesterol: "",
        Alcohol_Consumption: "",
        Stress_Level: "",
        Sleep_Hours: "",
        Sugar_Consumption: "",
        Triglyceride_Level: "",
        Fasting_Blood_Sugar: "",
        CRP_Level: "",
        Homocysteine_Level: ""
      });

    } catch (error) {
      console.error("❌ Error submitting data:", error);
      alert(`⚠️ Submission failed: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="checkup-container">
      <div className="checkup-particles-container">
        <Particles />
      </div>

      <nav className="checkup-top-menu-bar scrolled">
        <MenuButton isOpen={isMenuOpen} toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />
        <img src="/sushruta_icon.png" alt="Sushruta Logo" className="checkup-sushruta-logo scrolled" />
        <div className="checkup-signin-btn-container">
          {user ? (
            <div className="checkup-user-info">
              <span className="checkup-hello">Hello</span>
              <span className="checkup-username">{user.displayName?.split(" ")[0] || "User"}</span>
              <button className="checkup-signout-btn" onClick={handleLogout}>Sign Out</button>
            </div>
          ) : (
            <button className="checkup-signin-btn" onClick={() => navigate("/signin")}>Sign In</button>
          )}
        </div>
      </nav>

      {/* Updated Health Data Form */}
      {showForm && (
        <div className="input-modal-overlay">
          <div className="input-modal-content">
            <h1>Fill the health data form</h1>
            <form onSubmit={handleSubmit}>
              {/* Row 1 */}
              <div className="input-group">
                <input 
                  type="number" 
                  name="Age" 
                  step="0.1"
                  value={formData.Age} 
                  onChange={handleChange} 
                  required 
                  className="input" 
                />
                <label className="user-label">Age (0-120)</label>
                {errors.Age && <span className="error-message">{errors.Age}</span>}
              </div>
              <div className="input-group">
                <input 
                  type="number" 
                  name="Gender" 
                  value={formData.Gender} 
                  onChange={handleChange} 
                  required 
                  className="input" 
                />
                <label className="user-label">Gender (0-Female/1-Male)</label>
                {errors.Gender && <span className="error-message">{errors.Gender}</span>}
              </div>
              <div className="input-group">
                <input 
                  type="number" 
                  name="Blood_Pressure" 
                  step="0.1"
                  value={formData.Blood_Pressure} 
                  onChange={handleChange} 
                  required 
                  className="input" 
                />
                <label className="user-label">Blood Pressure (70-220 mmHg)</label>
                {errors.Blood_Pressure && <span className="error-message">{errors.Blood_Pressure}</span>}
              </div>
              <div className="input-group">
                <input 
                  type="number" 
                  name="Cholesterol_Level" 
                  step="0.1"
                  value={formData.Cholesterol_Level} 
                  onChange={handleChange} 
                  required 
                  className="input" 
                />
                <label className="user-label">Cholesterol Level (130-300 mg/dL)</label>
                {errors.Cholesterol_Level && <span className="error-message">{errors.Cholesterol_Level}</span>}
              </div>
              
              {/* Row 2 */}
              <div className="input-group">
                <input 
                  type="number" 
                  name="Exercise_Habits" 
                  value={formData.Exercise_Habits} 
                  onChange={handleChange} 
                  required 
                  className="input" 
                />
                <label className="user-label">Exercise Habits (0/1)</label>
                {errors.Exercise_Habits && <span className="error-message">{errors.Exercise_Habits}</span>}
              </div>
              <div className="input-group">
                <input 
                  type="number" 
                  name="Smoking" 
                  value={formData.Smoking} 
                  onChange={handleChange} 
                  required 
                  className="input" 
                />
                <label className="user-label">Smoking (0/1)</label>
                {errors.Smoking && <span className="error-message">{errors.Smoking}</span>}
              </div>
              <div className="input-group">
                <input 
                  type="number" 
                  name="Family_Heart_Disease" 
                  value={formData.Family_Heart_Disease} 
                  onChange={handleChange} 
                  required 
                  className="input" 
                />
                <label className="user-label">Family Heart Disease (0/1)</label>
                {errors.Family_Heart_Disease && <span className="error-message">{errors.Family_Heart_Disease}</span>}
              </div>
              <div className="input-group">
                <input 
                  type="number" 
                  name="Diabetes" 
                  value={formData.Diabetes} 
                  onChange={handleChange} 
                  required 
                  className="input" 
                />
                <label className="user-label">Diabetes (0/1)</label>
                {errors.Diabetes && <span className="error-message">{errors.Diabetes}</span>}
              </div>
              
              {/* Row 3 */}
              <div className="input-group">
                <input 
                  type="number" 
                  name="BMI" 
                  step="0.1"
                  value={formData.BMI} 
                  onChange={handleChange} 
                  required 
                  className="input" 
                />
                <label className="user-label">BMI (10-50)</label>
                {errors.BMI && <span className="error-message">{errors.BMI}</span>}
              </div>
              <div className="input-group">
                <input 
                  type="number" 
                  name="High_Blood_Pressure" 
                  value={formData.High_Blood_Pressure} 
                  onChange={handleChange} 
                  required 
                  className="input" 
                />
                <label className="user-label">High Blood Pressure (0/1)</label>
                {errors.High_Blood_Pressure && <span className="error-message">{errors.High_Blood_Pressure}</span>}
              </div>
              <div className="input-group">
                <input 
                  type="number" 
                  name="Low_HDL_Cholesterol" 
                  value={formData.Low_HDL_Cholesterol} 
                  onChange={handleChange} 
                  required 
                  className="input" 
                />
                <label className="user-label">Low HDL Cholesterol (0/1)</label>
                {errors.Low_HDL_Cholesterol && <span className="error-message">{errors.Low_HDL_Cholesterol}</span>}
              </div>
              <div className="input-group">
                <input 
                  type="number" 
                  name="High_LDL_Cholesterol" 
                  value={formData.High_LDL_Cholesterol} 
                  onChange={handleChange} 
                  required 
                  className="input" 
                />
                <label className="user-label">High LDL Cholesterol (0/1)</label>
                {errors.High_LDL_Cholesterol && <span className="error-message">{errors.High_LDL_Cholesterol}</span>}
              </div>
              
              {/* Row 4 */}
              <div className="input-group">
              <input 
                type="number" 
                name="Alcohol_Consumption" 
                value={formData.Alcohol_Consumption} 
                onChange={handleChange} 
                required 
                className="input" 
              />
              <label className="user-label">Alcohol (0/1/2/3)</label>
              {errors.Alcohol_Consumption && <span className="error-message">{errors.Alcohol_Consumption}</span>}
            </div>
            <div className="input-group">
            <input 
              type="number" 
              name="Stress_Level" 
              value={formData.Stress_Level} 
              onChange={handleChange} 
              required 
              className="input" 
            />
            <label className="user-label">Stress (0/1/2)</label>
            {errors.Stress_Level && <span className="error-message">{errors.Stress_Level}</span>}
          </div>
              <div className="input-group">
                <input 
                  type="number" 
                  name="Sleep_Hours" 
                  step="0.1"
                  value={formData.Sleep_Hours} 
                  onChange={handleChange} 
                  required 
                  className="input" 
                />
                <label className="user-label">Sleep Hours (0-24)</label>
                {errors.Sleep_Hours && <span className="error-message">{errors.Sleep_Hours}</span>}
              </div>
              <div className="input-group">
              <input 
                type="number" 
                name="Sugar_Consumption" 
                value={formData.Sugar_Consumption} 
                onChange={handleChange} 
                required 
                className="input" 
              />
              <label className="user-label">Sugar (0/1/2)</label>
              {errors.Sugar_Consumption && <span className="error-message">{errors.Sugar_Consumption}</span>}
            </div>
              
              {/* Row 5 */}
              <div className="input-group">
                <input 
                  type="number" 
                  name="Triglyceride_Level" 
                  step="0.1"
                  value={formData.Triglyceride_Level} 
                  onChange={handleChange} 
                  required 
                  className="input" 
                />
                <label className="user-label">Triglyceride (40-500 mg/dL)</label>
                {errors.Triglyceride_Level && <span className="error-message">{errors.Triglyceride_Level}</span>}
              </div>
              <div className="input-group">
                <input 
                  type="number" 
                  name="Fasting_Blood_Sugar" 
                  step="0.1"
                  value={formData.Fasting_Blood_Sugar} 
                  onChange={handleChange} 
                  required 
                  className="input" 
                />
                <label className="user-label">Fasting Blood Sugar(70-300)</label>
                {errors.Fasting_Blood_Sugar && <span className="error-message">{errors.Fasting_Blood_Sugar}</span>}
              </div>
              <div className="input-group">
                <input 
                  type="number" 
                  name="CRP_Level" 
                  step="0.1"
                  value={formData.CRP_Level} 
                  onChange={handleChange} 
                  required 
                  className="input" 
                />
                <label className="user-label">CRP (0-20 mg/L)</label>
                {errors.CRP_Level && <span className="error-message">{errors.CRP_Level}</span>}
              </div>
              <div className="input-group">
                <input 
                  type="number" 
                  name="Homocysteine_Level" 
                  step="0.1"
                  value={formData.Homocysteine_Level} 
                  onChange={handleChange} 
                  required 
                  className="input" 
                />
                <label className="user-label">Homocysteine (5-30 μmol/L)</label>
                {errors.Homocysteine_Level && <span className="error-message">{errors.Homocysteine_Level}</span>}
              </div>
              
              <button type="submit" className="submit-btn">Submit</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InputDataPage;