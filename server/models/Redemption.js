const mongoose = require('mongoose');

const redemptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    pointsUsed: {
        type: Number,
        required: true,
        min: 1
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    redemptionDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'fulfilled', 'cancelled'],
        default: 'pending'
    },
    fulfillmentDetails: {
        type: String,
    }
});

const Redemption = mongoose.model('Redemption', redemptionSchema);

module.exports = Redemption;