import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enables CORS for all routes
# Update CORS to specify your Vercel domain
CORS(app, origins=["https://sushruta.vercel.app",
                   "http://localhost:5173",
                   "http://127.0.0.1:5173"],
                   supports_credentials=True)
port = int(os.environ.get("PORT", 5000))  # Get Render's port, default to 5000

# Load the new trained model
try:
    with open("heart_disease_rf_model.pkl", "rb") as file:
        model = pickle.load(file)
    logger.info("New random forest model loaded successfully")
except Exception as e:
    logger.error(f"Error loading model: {e}")
    model = None

@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "API is running"})

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        logger.info(f"Received data: {data}")

        # Define the feature order expected by the model
        feature_order = [
            "Age", "Gender", "Blood_Pressure", "Cholesterol_Level", 
            "Exercise_Habits", "Smoking", "Family_Heart_Disease", "Diabetes", 
            "BMI", "High_Blood_Pressure", "Low_HDL_Cholesterol", 
            "High_LDL_Cholesterol", "Alcohol_Consumption", "Stress_Level", 
            "Sleep_Hours", "Sugar_Consumption", "Triglyceride_Level", 
            "Fasting_Blood_Sugar", "CRP_Level", "Homocysteine_Level"
        ]
        
        # Extract the features in the expected order
        input_values = [data[f] for f in feature_order]
        logger.info(f"Input values: {input_values}")

        # Make prediction
        prediction = model.predict([input_values])[0]
        logger.info(f"Raw prediction: {prediction}, type: {type(prediction)}")

        # Convert NumPy data types to native Python types
        prediction = prediction.item() if isinstance(prediction, np.generic) else prediction
        logger.info(f"Converted prediction: {prediction}, type: {type(prediction)}")

        return jsonify({"prediction": prediction})
    
    except Exception as e:
        logger.error(f"Error during prediction: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    logger.info(f"Starting Flask server on port {port}")
    app.run(host="0.0.0.0", port=port)