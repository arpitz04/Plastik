import os
import io
import gdown
from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_URL = os.environ.get("MODEL_URL")
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'plastic_classifier_02.keras')

# Step 3: Download model from Google Drive if not exists
os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

if not os.path.exists(MODEL_PATH):
    try:
        print(f"Downloading model from {MODEL_URL}...")
        gdown.download(MODEL_URL, MODEL_PATH, quiet=False)
        print(f"Model downloaded to {MODEL_PATH}")
    except Exception as e:
        print(f"Error downloading model: {e}")

# Load the model
try:
    model = load_model(MODEL_PATH)
    print(f"ML model '{MODEL_PATH}' loaded successfully.")
except Exception as e:
    print(f"Error loading ML model from {MODEL_PATH}: {e}")
    model = None

@app.route('/predict_plastic', methods=['POST'])
def predict_plastic():
    if model is None:
        return jsonify({'error': 'ML model not loaded. Please check server logs for model loading errors.'}), 503
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided in the request'}), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({'error': 'No selected image file'}), 400

    try:
        img_bytes = file.read()
        img = image.load_img(io.BytesIO(img_bytes), target_size=(150, 150))
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array / 255.0

        prediction = model.predict(img_array)
        probability = float(prediction[0][0])

        is_plastic = probability > 0.5
        status = 'approved' if is_plastic else 'rejected'
        points = 10 if is_plastic else 0

        return jsonify({
            'mlResult': probability,
            'isPlastic': is_plastic,
            'status': status,
            'pointsAwarded': points,
            'message': 'Image processed successfully.'
        })

    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({'error': f'Failed to process image or make prediction: {e}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
