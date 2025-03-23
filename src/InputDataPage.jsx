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

  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔄 InputDataPage mounted, opening form by default...");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("✅ Auth state changed: ", user);
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🚀 Submitting form data:", formData);

    if (Object.values(formData).some((value) => value.trim() === "")) {
      alert("⚠️ Please fill in all fields!");
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
              <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
              <input type="number" name="chestPain" placeholder="Chest Pain (0/1/2/3)" value={formData.chestPain} onChange={handleChange} required />
              <input type="number" name="cholesterol" placeholder="Cholesterol (mg/dL)" value={formData.cholesterol} onChange={handleChange} required />
              <input type="number" name="fastingBloodSugar" placeholder="Fast Blood Sugar (mg/dL)" value={formData.fastingBloodSugar} onChange={handleChange} required />
              <input type="number" name="maxHeartRate" placeholder="Max Heart Rate" value={formData.maxHeartRate} onChange={handleChange} required />
              <input type="number" name="exang" placeholder="Exang (0/1)" value={formData.exang} onChange={handleChange} required />
              <input type="number" name="oldPeak" placeholder="Oldpeak (ST Depression)" step="0.1" value={formData.oldPeak} onChange={handleChange} required />
              <input type="number" name="ca" placeholder="CA (Color of Arteries)" value={formData.ca} onChange={handleChange} required />
              <button type="submit" className="submit-btn">Submit</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InputDataPage;