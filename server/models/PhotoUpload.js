const mongoose = require('mongoose');

const photoUploadSchema = new mongoose.Schema( // Using 'new mongoose.Schema' is more conventional
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            // Changed 'pending' to 'pending_ml' for clarity in the ML processing flow
            enum: ['pending_ml', 'approved', 'rejected'],
            default: 'pending_ml', // Initial status after upload
        },
        mlResult: { // Stores the probability (a number between 0 and 1) from the ML model
            type: Number, // Changed to Number as the ML model outputs a probability
            required: false, // Not required immediately upon upload, only after ML processing
        },
        isPlastic: { // A new field to store the boolean result (true/false) of the classification
            type: Boolean,
            required: false, // Not required immediately upon upload
        },
        pointsAwarded: {
            type: Number,
            default: 0,
        },
        uploadDate: {
            type: Date,
            default: Date.now,
        },
        processedAt: { // Timestamp when the ML processing completed
            type: Date,
            required: false,
        },
    },
    {
        timestamps: true, // Keeping your existing timestamps option
    }
);

// Changed model name to 'PhotoUpload' as requested
module.exports = mongoose.model('PhotoUpload', photoUploadSchema);