from flask import Flask, request, jsonify
import numpy as np
from PIL import Image

app = Flask(__name__)

model = None

def load_model_once():
    global model
    if model is None:
        import tensorflow as tf  # 👈 moved inside
        model = tf.keras.models.load_model("models/plastic_classifier_02.keras")


@app.route("/")
def home():
    return "ML API Running 🚀"


@app.route("/predict_plastic", methods=["POST"])
def predict():
    try:
        load_model_once()

        file = request.files['photo']
        img = Image.open(file).resize((150, 150))
        img = np.array(img) / 255.0
        img = np.expand_dims(img, axis=0)

        prediction = model.predict(img)[0][0]
        isPlastic = prediction > 0.5

        return jsonify({
            "mlResult": float(prediction),
            "isPlastic": bool(isPlastic)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500