const express = require('express');
const router = express.Router();
const VideoUpload = require('../models/PhotoUpload');
const User = require('../models/User');

// @desc    Internal endpoint for ML model to report video processing result
// @route   POST /api/rewards/process-video-result
// @access  Internal/Secure (e.g., via API Key or IP Whitelist in production)
router.post('/process-video-result', async (req, res) => {
    // In a real scenario, you'd secure this endpoint tightly.
    // For now, we'll assume the ML service has internal access.
    const { videoUploadId, mlResult, isBottle, pointsAwarded } = req.body;

    if (!videoUploadId || mlResult === undefined || isBottle === undefined || pointsAwarded === undefined) {
        return res.status(400).json({ message: 'Missing required fields for ML result processing.' });
    }

    try {
        const videoUpload = await VideoUpload.findById(videoUploadId);

        if (!videoUpload) {
            return res.status(404).json({ message: 'Video upload record not found.' });
        }

        // Update video upload record
        videoUpload.status = isBottle ? 'approved' : 'rejected';
        videoUpload.mlResult = mlResult;
        videoUpload.pointsAwarded = pointsAwarded;
        videoUpload.processedAt = Date.now();
        await videoUpload.save();

        // Update user's reward points if approved
        if (isBottle && pointsAwarded > 0) {
            const user = await User.findById(videoUpload.userId);
            if (user) {
                user.rewardPoints += pointsAwarded;
                await user.save();
                console.log(`User ${user.username} awarded ${pointsAwarded} points for video ${videoUploadId}.`);
            } else {
                console.warn(`User with ID ${videoUpload.userId} not found for point award.`);
            }
        }

        res.status(200).json({ message: 'ML result processed successfully.', videoUpload });

    } catch (error) {
        console.error('Error processing ML result:', error.message);
        res.status(500).json({ message: 'Server error during ML result processing.' });
    }
});

module.exports = router;