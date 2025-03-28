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

# Load the trained model
try:
    with open("stacking_model.pkl", "rb") as file:
        model = pickle.load(file)
    logger.info("Model loaded successfully")
except Exception as e:
    logger.error(f"Error loading model: {e}")
    model = None

# Feature name mapping
feature_mapping = {
    "chestPain": "chest pain",
    "maxHeartRate": "max heart rate",
    "oldPeak": "oldpeak"
}

@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "API is running"})

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        logger.info(f"Received data: {data}")

        # Convert input feature names to match the trained model
        formatted_data = {feature_mapping.get(k, k): v for k, v in data.items()}
        logger.info(f"Formatted data: {formatted_data}")

        # Ensure features are in correct order
        feature_order = ["age", "chest pain", "max heart rate", "exang", "oldpeak", "ca"]
        input_values = [formatted_data[f] for f in feature_order]
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