const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// --- NEW IMPORTS ---
const axios = require('axios'); // For making HTTP requests to the ML API
const FormData = require('form-data'); // For sending multipart/form-data to the ML API
// --- END NEW IMPORTS ---

const { protect } = require('../middleware/authMiddleware');
const PhotoUpload = require('../models/PhotoUpload');
const User = require('../models/User'); // Ensure User model is imported

// --- Multer Configuration for Local Storage (for Photos) ---
const UPLOADS_DIR = path.join(__dirname, '../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB for photos (adjust as needed)
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'), false);
        }
    }
});

// Custom middleware to handle Multer errors and ensure JSON response
// IMPORTANT: Change 'image' in upload.single('image') to 'photo' to match frontend and previous multer config
const uploadMiddleware = (req, res, next) => {
    upload.single('photo')(req, res, function (err) { // Changed 'image' to 'photo' here
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err.message);
            return res.status(400).json({ message: `Upload error: ${err.message}. Please check file type and size (max 10MB).` });
        } else if (err) {
            console.error('Unknown upload error:', err.message);
            return res.status(500).json({ message: `An unexpected error occurred during upload: ${err.message}` });
        }
        next();
    });
};


// @desc    Upload a photo, process it, and award points
// @route   POST /api/photos/upload
// @access  Private
router.post('/upload', protect, uploadMiddleware, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded.' });
        }

        const imageUrl = `/uploads/${req.file.filename}`; // Path to the uploaded photo on your Node.js server

        // 1. Save initial photo upload record with 'pending_ml' status
        const photoUpload = new PhotoUpload({
            userId: req.user._id, // Assuming req.user._id comes from your 'protect' middleware
            imageUrl: imageUrl,
            status: 'pending_ml', // Set initial status to pending ML processing (updated from 'pending')
            uploadDate: Date.now(),
            // mlResult and isPlastic are not set yet, they will be updated after ML processing
            // pointsAwarded is 0 by default from schema
        });

        await photoUpload.save(); // Save the initial record to get an _id

        // 2. Prepare and send the image to the Python ML API
        // Construct the full absolute path to the uploaded image file on the Node.js server
        const imageFilePath = path.join(__dirname, '../uploads', req.file.filename);

        // Read the image file as a buffer
        const imageBuffer = fs.readFileSync(imageFilePath);

        // Create a new FormData instance for sending multipart/form-data
        const formData = new FormData();
        // 'image' is the field name expected by your Python Flask API (ml_api.py)
        formData.append('image', imageBuffer, req.file.filename);

        // Make an HTTP POST request to your Python ML API endpoint
        // IMPORTANT: Ensure the URL (http://localhost:5000/predict_plastic) matches where your Python API is running
        const mlApiResponse = await axios.post('http://localhost:5001/predict_plastic', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        // --- START OF CHANGE ---
        // Corrected the variable name from mlResponse to mlApiResponse
        const mlResultData = mlApiResponse.data; // Get the JSON response from the ML API
        // --- END OF CHANGE ---

        // Destructure the expected fields from the ML API response
        const { mlResult, isPlastic, status, pointsAwarded } = mlResultData;

        // 3. Update the photo upload record in your database with ML results
        photoUpload.status = status; // 'approved' or 'rejected' from ML API
        photoUpload.mlResult = mlResult; // Probability from ML API
        photoUpload.isPlastic = isPlastic; // Boolean result from ML API
        photoUpload.pointsAwarded = pointsAwarded; // Points awarded by ML API
        photoUpload.processedAt = Date.now(); // Mark as processed

        await photoUpload.save(); // Save the updated record to MongoDB

        // 4. Award points to the user if the image was classified as plastic
        if (isPlastic && pointsAwarded > 0) {
            const user = await User.findById(req.user._id); // Find the user by their ID
            if (user) {
                user.rewardPoints += pointsAwarded; // Add the awarded points to their total
                await user.save(); // Save the updated user document
                console.log(`User ${user.username} awarded ${pointsAwarded} points for plastic.`);
            }
        }

        // 5. Send a final response back to the frontend
        // Using status 200 OK because the processing is now complete at this point
        res.status(200).json({
            message: 'Photo uploaded and processed by ML model.',
            photoUploadId: photoUpload._id,
            imageUrl: photoUpload.imageUrl,
            status: photoUpload.status,
            mlResult: photoUpload.mlResult,
            isPlastic: photoUpload.isPlastic,
            pointsAwarded: photoUpload.pointsAwarded
        });

    } catch (error) {
        console.error('Server error during photo upload or ML processing:', error);
        // Handle specific errors from the ML service (e.g., if it's down or returns an error)
        if (error.response && error.response.data && error.response.data.error) {
            // If ML service returned an error response
            return res.status(500).json({ message: `ML service error: ${error.response.data.error}` });
        }
        // Generic error message for other server issues
        res.status(500).json({ message: 'Server error during photo upload or ML processing.' });
    }
});


// @desc    Get all photos uploaded by the logged-in user
// @route   GET /api/photos/my-uploads
// @access  Private
router.get('/my-uploads', protect, async (req, res) => {
    try {
        const photos = await PhotoUpload.find({ userId: req.user._id })
            .sort({ uploadDate: -1 });

        res.json(photos);
    } catch (error) {
        console.error('Error fetching user photos:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get a single photo by ID
// @route   GET /api/photos/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const photo = await PhotoUpload.findById(req.params.id);

        if (photo && photo.userId.toString() === req.user._id.toString()) {
            res.json(photo);
        } else if (photo && photo.userId.toString() !== req.user._id.toString()) {
            res.status(403).json({ message: 'Not authorized to view this photo' });
        } else {
            res.status(404).json({ message: 'Photo not found' });
        }
    } catch (error) {
        console.error('Error fetching single photo:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;