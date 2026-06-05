import numpy as np
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model

# Load your trained model (make sure this matches your saved model name and format)
model = load_model("plastic_classifier_02.keras")  # updated extension from your last training

# Load and preprocess the image
img_path = r"C:\Users\Acer\Desktop\plastik-backend\ml\test_01\mspoon.jpeg"  # Path to your test image
img = image.load_img(img_path, target_size=(150, 150))  # Resize to model input size
img_array = image.img_to_array(img)
img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
img_array = img_array / 255.0  # Normalize pixel values (0-1) same as training

# Predict
prediction = model.predict(img_array)

# Since it is binary classification with sigmoid output:
probability = prediction[0][0]
print(f"Prediction probability (Plastic): {probability:.4f}")

# Threshold can be adjusted, default 0.5
if probability > 0.5:
    print("Predicted Class: Plastic")
else:
    print("Predicted Class: Non-Plastic")
