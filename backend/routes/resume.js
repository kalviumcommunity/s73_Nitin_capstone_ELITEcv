const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume.js');

router.get('/api/resume', async (req, res) => {
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

router.put('/api/resume/:email', async (req, res) => {
    const { email } = req.params;
    const { name, skills } = req.body;

    try {
        const resume = await Resume.findOne({ email });
        if (!resume) {
            return res.status(404).json({ message: "User not found!" });
        }
        if (name) resume.name = name;
        if (skills) resume.skills = skills;

        await resume.save();
        res.json({ message: "User updated successfully", resume });
    } catch (err) {
        console.error("Error updating resume:", err);
        res.status(500).json({ message: "Error updating user", error: err });
    }
});

module.exports = router;
