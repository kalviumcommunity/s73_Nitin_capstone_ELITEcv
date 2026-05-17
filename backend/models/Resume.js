const mongoose = require('mongoose');

const ExperienceSchema = new mongoose.Schema({
    company: { type: String },
    position: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    description: { type: String },
});

const EducationSchema = new mongoose.Schema({
    institution: { type: String },
    degree: { type: String },
    field: { type: String },
    startDate: { type: String },
    endDate: { type: String },
});

const ProjectSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String },
    technologies: { type: [String] },
    link: { type: String },
});

const ResumeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        default: 'My Resume',
    },
    // Personal Info
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    location: { type: String },
    linkedin: { type: String },
    github: { type: String },
    website: { type: String },
    summary: { type: String },

    // Sections
    skills: { type: [String], default: [] },
    experience: { type: [ExperienceSchema], default: [] },
    education: { type: [EducationSchema], default: [] },
    projects: { type: [ProjectSchema], default: [] },
    certifications: { type: [String], default: [] },
    languages: { type: [String], default: [] },

    // AI-generated content
    aiSuggestions: { type: String },

    // Template choice
    template: {
        type: String,
        enum: ['modern', 'classic', 'minimal'],
        default: 'modern',
    },
}, { timestamps: true });

module.exports = mongoose.model('Resume', ResumeSchema);
