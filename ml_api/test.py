import numpy as np
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model

# Load your trained model
model = load_model("plastic_classifier_00.h5")


# Load and preprocess the image
img_path = r"C:\project\test_01\download.png"  # Path to test image
img = image.load_img(img_path, target_size=(150, 150))  # Resize image
img_array = image.img_to_array(img)  # Convert to numpy array
img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
img_array /= 255.0  # Normalize pixel values to [0,1]

# Predict
prediction = model.predict(img_array)

# Interpret and print result
if prediction[0][0] > 0.5:
    print("Predicted: Plastic")
else:
    print("Predicted: Non-Plastic")
