import numpy as np
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model

# Load model
model = load_model("plastic_classifier_02.keras")

# Load image
img_path = r"C:\project\test_01\download (1).jpeg"
img = image.load_img(img_path, target_size=(150, 150))
img_array = image.img_to_array(img)
img_array = np.expand_dims(img_array, axis=0)
img_array = img_array / 255.0  # normalize

# Predict
prediction = model.predict(img_array)

# Interpret
if prediction[0][0] > 0.5:
    print("Predicted: Plastic")
else:
    print("Predicted: Non-Plastic")
