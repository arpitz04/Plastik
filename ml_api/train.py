import tensorflow as tf
from tensorflow.keras import layers

# 1. Prepare dataset
train_ds = tf.keras.preprocessing.image_dataset_from_directory(
    'dataset/',
    validation_split=0.2,
    subset='training',
    seed=123,
    image_size=(150, 150),
    batch_size=32
)

val_ds = tf.keras.preprocessing.image_dataset_from_directory(
    'dataset/',
    validation_split=0.2,
    subset='validation',
    seed=123,
    image_size=(150, 150),
    batch_size=32
)

# 2. Create simple model
model = tf.keras.Sequential([
    layers.Rescaling(1./255),  # Normalize pixel values
    layers.Conv2D(16, 3, activation='relu'),
    layers.MaxPooling2D(),
    layers.Conv2D(32, 3, activation='relu'),
    layers.MaxPooling2D(),
    layers.Flatten(),
    layers.Dense(64, activation='relu'),
    layers.Dense(1, activation='sigmoid')  # Output: 0=non-plastic, 1=plastic
])

# 3. Compile and train
model.compile(
    optimizer='adam',
    loss='binary_crossentropy',
    metrics=['accuracy']
)

model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=10
)

# 4. Save model
model.save('plastic_model.h5')