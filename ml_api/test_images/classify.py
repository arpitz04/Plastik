import tensorflow as tf
import cv2
import numpy as np

# Load model
model = tf.keras.models.load_model('plastic_model.h5')

def classify_image(image_path):
    img = cv2.imread(image_path)
    img = cv2.resize(img, (150, 150))
    img = np.expand_dims(img, axis=0)
    prediction = model.predict(img)
    return "PLASTIC" if prediction[0] > 0.5 else "NON-PLASTIC"

# Example usage
print(classify_image("test_image.jpg"))