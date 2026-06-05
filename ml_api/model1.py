import tensorflow as tf
from tensorflow.keras import layers, models
import matplotlib.pyplot as plt

# Create CNN model for 3 classes
model = models.Sequential([
    tf.keras.Input(shape=(150, 150, 3)),  # Better than using input_shape in Conv2D
    layers.Conv2D(32, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),

    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),

    layers.Flatten(),
    layers.Dense(128, activation='relu'),
    layers.Dense(3, activation='softmax')  # 3 output classes
])

# Compile the model
model.compile(optimizer='adam',
              loss='categorical_crossentropy',  # for multi-class
              metrics=['accuracy'])

# Data preparation
train_datagen = tf.keras.preprocessing.image.ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2
)

train_generator = train_datagen.flow_from_directory(
    r'C:\project\dataset1',
    target_size=(150, 150),
    batch_size=32,
    class_mode='categorical',  # for 3 classes
    subset='training'
)

validation_generator = train_datagen.flow_from_directory(
    r'C:\project\dataset',
    target_size=(150, 150),
    batch_size=32,
    class_mode='categorical',
    subset='validation'
)

# Train model
history = model.fit(
    train_generator,
    epochs=10,
    validation_data=validation_generator
)

# Save model
model.save('plastic_classifier_01.h5')

# Plot training results
plt.plot(history.history['accuracy'], label='Training Accuracy')
plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.legend()
plt.savefig('training_results.png')
plt.show()
