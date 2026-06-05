const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const { protect } = require('../middleware/authMiddleware');
const PhotoUpload = require('../models/PhotoUpload');
const User = require('../models/User');

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
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'), false);
        }
    }
});

const uploadMiddleware = (req, res, next) => {
    upload.single('photo')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(500).json({ message: err.message });
        }
        next();
    });
};

router.post('/upload', protect, uploadMiddleware, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        const imagePath = path.join(__dirname, '../uploads', req.file.filename);

        const formData = new FormData();

        // ✅ FIXED FIELD NAME (VERY IMPORTANT)
        formData.append('photo', fs.createReadStream(imagePath));

        const mlApiResponse = await axios.post(
            'https://plastik-ml-api.onrender.com/predict_plastic',
            formData,
            {
                headers: formData.getHeaders(),
                timeout: 20000
            }
        );

        const { mlResult, isPlastic } = mlApiResponse.data;

        let points = isPlastic ? 10 : 0;

        const photo = new PhotoUpload({
            userId: req.user._id,
            imageUrl: `/uploads/${req.file.filename}`,
            mlResult,
            isPlastic,
            status: isPlastic ? 'approved' : 'rejected',
            pointsAwarded: points
        });

        await photo.save();

        if (isPlastic) {
            await User.findByIdAndUpdate(req.user._id, {
                $inc: { rewardPoints: points }
            });
        }

        res.json({
            message: 'Upload successful',
            mlResult,
            isPlastic,
            points
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'ML processing failed' });
    }
});

module.exports = router;