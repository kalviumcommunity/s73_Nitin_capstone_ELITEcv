const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const resumeRoute = require('./routes/resume.js');

const app = express();

dotenv.config();

app.use(express.json());

mongoose.connect(process.env.MONGODB_URL,)
.then(() => console.log('MongoDB Connected'))
.catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

app.use('/', resumeRoute);

app.get('/', (req, res) => {
    res.send('Resume API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});


