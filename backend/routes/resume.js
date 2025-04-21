const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume.js');

router.get('/a', async (req, res) => {
    try {
        const resumes = await Resume.find();
        res.status(200).json(resumes);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/api/resume', async (req, res) => {
    console.log("POST request received:", req.body); 
    try {
        const newResume = new Resume(req.body);
        const savedResume = await newResume.save();
        res.status(201).json(savedResume);
    } catch (error) {
        console.error("Error saving resume:", error);
        res.status(400).json({ error: 'Bad Request' });
    }
});

module.exports = router;
