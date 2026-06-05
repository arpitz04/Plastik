const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Product = require('../models/Product');
const User = require('../models/User');
const Redemption = require('../models/Redemption');

// @desc    Get all products
// @route   GET /api/products
// @access  Public (or Private if you want only logged-in users to see products)
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Error fetching single product:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Redeem a product with reward points
// @route   POST /api/products/redeem
// @access  Private
router.post('/redeem', protect, async (req, res) => {
    const { productId, quantity = 1 } = req.body; // Default quantity to 1

    if (!productId || quantity < 1) {
        return res.status(400).json({ message: 'Invalid product or quantity' });
    }

    try {
        const user = await User.findById(req.user._id);
        const product = await Product.findById(productId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const totalPointsCost = product.pricePoints * quantity;

        if (user.rewardPoints < totalPointsCost) {
            return res.status(400).json({ message: 'Not enough reward points' });
        }
        if (product.stock < quantity) {
            return res.status(400).json({ message: `Not enough stock for ${product.name}. Available: ${product.stock}` });
        }

        // Deduct points from user
        user.rewardPoints -= totalPointsCost;
        await user.save();

        // Update product stock
        product.stock -= quantity;
        await product.save();

        // Create Redemption record
        const redemption = await Redemption.create({
            userId: user._id,
            productId: product._id,
            pointsUsed: totalPointsCost,
            quantity: quantity,
            status: 'pending' // Can be 'fulfilled' or 'cancelled' later
        });

        res.status(200).json({
            message: `Successfully redeemed ${quantity} x ${product.name}!`,
            newRewardPoints: user.rewardPoints,
            redemptionId: redemption._id
        });

    } catch (error) {
        console.error('Error during product redemption:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get user's redemption history
// @route   GET /api/products/my-redemptions
// @access  Private
router.get('/my-redemptions', protect, async (req, res) => {
    try {
        const redemptions = await Redemption.find({ userId: req.user._id })
            .populate('productId', 'name pricePoints imageUrl') // Populate product details
            .sort({ redemptionDate: -1 });

        res.json(redemptions);
    } catch (error) {
        console.error('Error fetching user redemptions:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Route Example: Add Product (requires admin role)
// If you implement this, ensure the 'admin' middleware is also imported in server.js for app.use('/api/products')
// const { protect, admin } = require('../middleware/authMiddleware'); // For admin routes

// @desc    Add a new product (Admin only)
// @route   POST /api/products/add
// @access  Private/Admin
/*
router.post('/add', protect, admin, async (req, res) => {
    const { name, description, pricePoints, imageUrl, category, stock } = req.body;

    if (!name || !description || !pricePoints || !imageUrl || !stock) {
        return res.status(400).json({ message: 'Please provide all required product fields' });
    }

    try {
        const product = await Product.create({
            name,
            description,
            pricePoints,
            imageUrl,
            category,
            stock
        });
        res.status(201).json(product);
    } catch (error) {
        console.error('Error adding product:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});
*/

module.exports = router;