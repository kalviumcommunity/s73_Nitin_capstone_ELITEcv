const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

dotenv.config();

const resumeRoute = require('./routes/resume.js');
const authRoute = require('./routes/auth.js');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());

// DB Connection
mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'ELITEcv API is running', version: '1.0.0' });
});

// Routes
app.use('/api/auth', authRoute);
app.use('/api/resume', resumeRoute);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
