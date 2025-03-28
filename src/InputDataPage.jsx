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
    age: "",
    chestPain: "",
    cholesterol: "",
    fastingBloodSugar: "",
    maxHeartRate: "",
    exang: "",
    oldPeak: "",
    ca: "",
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
    switch (name) {
      case 'age':
        return value === '' || (parseInt(value) >= 0 && parseInt(value) <= 100);
      case 'oldPeak':
        return value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 7);
      case 'chestPain':
        return value === '' || ['0', '1', '2', '3'].includes(value);
      case 'exang':
        return value === '' || ['0', '1'].includes(value);
      case 'ca':
        return value === '' || ['0', '1', '2', '3'].includes(value);
      default:
        return true;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validate the input
    if (validateField(name, value)) {
      setFormData({ ...formData, [name]: value });
      
      // Clear any existing error for this field
      if (errors[name]) {
        setErrors(prev => {
          const newErrors = {...prev};
          delete newErrors[name];
          return newErrors;
        });
      }
    } else {
      // Set an error for invalid input
      setErrors(prev => ({
        ...prev,
        [name]: `Invalid ${name} value`
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🚀 Submitting form data:", formData);

    // Validate all fields before submission
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (!validateField(key, formData[key])) {
        newErrors[key] = `Invalid ${key} value`;
      }
    });

    if (Object.values(formData).some((value) => value.trim() === "")) {
      alert("⚠️ Please fill in all fields!");
      return;
    }

    // If there are any validation errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!user) {
      alert("⚠️ You must be signed in to submit data!");
      return;
    }

    try {
      // 🔹 Convert `Oldpeak` to float
      const formattedData = {
        ...formData,
        oldPeak: parseFloat(formData.oldPeak), // Ensure it's a float
        timestamp: serverTimestamp(),
      };

      // 🔹 Save to Firestore
      await addDoc(collection(db, `users/${user.uid}/healthData`), formattedData);
      console.log("✅ Health data added to Firestore successfully");
      
      // 🔹 Extract only required features for prediction
      const selectedFeatures = {
        age: parseInt(formData.age),
        chestPain: parseInt(formData.chestPain),
        maxHeartRate: parseInt(formData.maxHeartRate),
        exang: parseInt(formData.exang),
        oldPeak: parseFloat(formData.oldPeak), // Send as float
        ca: parseInt(formData.ca),
      };
      
      console.log("🔍 Sending features to prediction API:", selectedFeatures);

      // 🔹 Send data to Flask API for prediction
      // Update port to 5001 to match your server configuration
      const response = await fetch("https://sushruta-backend.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedFeatures),
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
          state: { prediction: result.prediction },
          replace: true 
        });
      } else {
        console.error("❌ Prediction failed:", result.error);
        alert("⚠️ Failed to get a prediction.");
      }

      // 🔹 Reset form after submission
      setFormData({
        age: "",
        chestPain: "",
        cholesterol: "",
        fastingBloodSugar: "",
        maxHeartRate: "",
        exang: "",
        oldPeak: "",
        ca: "",
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

      {/* Health Data Form */}
      {showForm && (
  <div className="input-modal-overlay">
    <div className="input-modal-content">
      <h1>Fill the health data form</h1>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input 
            type="number" 
            name="age" 
            value={formData.age} 
            onChange={handleChange} 
            required 
            className="input" 
          />
          <label className="user-label">Age</label>
          {errors.age && <span className="error-message">{errors.age}</span>}
        </div>
        <div className="input-group">
          <input 
            type="number" 
            name="chestPain" 
            value={formData.chestPain} 
            onChange={handleChange} 
            required 
            className="input" 
          />
          <label className="user-label">Chest Pain (0/1/2/3)</label>
          {errors.chestPain && <span className="error-message">{errors.chestPain}</span>}
        </div>
        <div className="input-group">
          <input 
            type="number" 
            name="cholesterol" 
            value={formData.cholesterol} 
            onChange={handleChange} 
            required 
            className="input" 
          />
          <label className="user-label">Cholesterol (mg/dL)</label>
        </div>
        <div className="input-group">
          <input 
            type="number" 
            name="fastingBloodSugar" 
            value={formData.fastingBloodSugar} 
            onChange={handleChange} 
            required 
            className="input" 
          />
          <label className="user-label">Fasting Blood Sugar (mg/dL)</label>
        </div>
        <div className="input-group">
          <input 
            type="number" 
            name="maxHeartRate" 
            value={formData.maxHeartRate} 
            onChange={handleChange} 
            required 
            className="input" 
          />
          <label className="user-label">Max Heart Rate</label>
        </div>
        <div className="input-group">
          <input 
            type="number" 
            name="exang" 
            value={formData.exang} 
            onChange={handleChange} 
            required 
            className="input" 
          />
          <label className="user-label">Exang (0/1)</label>
          {errors.exang && <span className="error-message">{errors.exang}</span>}
        </div>
        <div className="input-group">
          <input 
            type="number" 
            name="oldPeak" 
            step="0.1" 
            value={formData.oldPeak} 
            onChange={handleChange} 
            required 
            className="input" 
          />
          <label className="user-label">Oldpeak (ST Depression)</label>
          {errors.oldPeak && <span className="error-message">{errors.oldPeak}</span>}
        </div>
        <div className="input-group">
          <input 
            type="number" 
            name="ca" 
            value={formData.ca} 
            onChange={handleChange} 
            required 
            className="input" 
          />
          <label className="user-label">CA (0/1/2/3)</label>
          {errors.ca && <span className="error-message">{errors.ca}</span>}
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