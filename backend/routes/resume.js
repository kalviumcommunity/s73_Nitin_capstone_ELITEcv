const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume.js');

// GET API - Fetch all resumes
router.get('/', async (req, res) => {
    try {
        const resumes = await Resume.find();
        res.status(200).json(resumes);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
