const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Route Files
const resumeRoute = require('./routes/resume.js');

dotenv.config();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log(err));

// API Routes
app.use('/api/resume', resumeRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
