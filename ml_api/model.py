import tensorflow as tf
from tensorflow.keras import layers, models
import matplotlib.pyplot as plt

# Create CNN model
model = models.Sequential([
    # Input: 150x150 pixels with 3 color channels
    layers.Conv2D(32, (3,3), activation='relu', input_shape=(150, 150, 3)),
    layers.MaxPooling2D((2,2)),
    
    layers.Conv2D(64, (3,3), activation='relu'),
    layers.MaxPooling2D((2,2)),
    
    layers.Flatten(),
    layers.Dense(128, activation='relu'),
    layers.Dense(1, activation='sigmoid')  # Output: 1 (plastic) or 0 (non-plastic)
])

model.compile(optimizer='adam',
              loss='binary_crossentropy',
              metrics=['accuracy'])

# Data preparation
train_datagen = tf.keras.preprocessing.image.ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2  # Use 20% for validation
)

train_generator = train_datagen.flow_from_directory(
    r'C:\project\dataset',
    target_size=(150, 150),  # Resize images
    batch_size=32,
    class_mode='binary',  # Plastic vs non-plastic
    subset='training'
)

validation_generator = train_datagen.flow_from_directory(
    r'C:\project\dataset1',
    target_size=(150, 150),
    batch_size=32,
    class_mode='binary',
    subset='validation'
)
# Train model
history = model.fit(
    train_generator,
    epochs=10,
    validation_data=validation_generator
)

# Save model
model.save('plastic_classifier_00.h5')

# Plot training results
plt.plot(history.history['accuracy'], label='Training Accuracy')
plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.legend()
plt.savefig('training_results.png')