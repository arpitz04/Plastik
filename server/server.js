const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Connect to the database
connectDB();

const app = express();

// Middleware
app.use(express.json()); // Body parser for JSON
app.use(cors()); // Enable CORS for all routes (adjust origins in production)

// Serve static files from the 'uploads' directory
// This allows access to uploaded images via /uploads/filename.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve your frontend static files (HTML, CSS, JS) from the 'client' directory
// IMPORTANT: This should generally come before API routes if you want your SPA to handle client-side routing.
app.use(express.static(path.join(__dirname, '../client')));


// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const photoRoutes = require('./routes/photos');
const productRoutes = require('./routes/products');
const rewardRoutes = require('./routes/rewards');

// Define API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/products', productRoutes);
app.use('/api/rewards', rewardRoutes);

// Basic route for serving the main HTML file of your frontend application
// This will serve index.html when someone accesses the root URL (e.g., localhost:5000)
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});