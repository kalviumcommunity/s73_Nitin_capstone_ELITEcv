const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const OpenAI = require('openai');
const Resume = require('../models/Resume.js');
const { protect } = require('../middleware/auth');

// Multer config — store in memory for parsing
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    },
});

// OpenAI client pointed at OpenRouter (compatible API, wider model access)
const getOpenAI = () => {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') return null;
    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'ELITEcv Resume Builder',
        },
    });
};

// ─── POST AI chat (context-aware, knows the full resume + target role) ─────────
router.post('/ai-chat', protect, async (req, res) => {
    const { resume, messages, targetRole } = req.body;

    if (!resume || !Array.isArray(messages)) {
        return res.status(400).json({ message: 'resume and messages are required' });
    }

    const openai = getOpenAI();
    if (!openai) {
        return res.status(503).json({ message: 'AI service not configured. Add OPENAI_API_KEY to .env' });
    }

    // Safely extract arrays (handles both plain objects and mongoose docs)
    const skills        = Array.isArray(resume.skills)        ? resume.skills        : [];
    const experience    = Array.isArray(resume.experience)    ? resume.experience    : [];
    const education     = Array.isArray(resume.education)     ? resume.education     : [];
    const projects      = Array.isArray(resume.projects)      ? resume.projects      : [];
    const certifications= Array.isArray(resume.certifications)? resume.certifications: [];
    const languages     = Array.isArray(resume.languages)     ? resume.languages     : [];

    // Build a compact resume snapshot for the system prompt
    const resumeSnapshot = [
        `=== CANDIDATE RESUME ===`,
        `Name: ${resume.name || 'N/A'}`,
        `Email: ${resume.email || 'N/A'}`,
        `Location: ${resume.location || 'N/A'}`,
        `LinkedIn: ${resume.linkedin || 'N/A'}`,
        `GitHub: ${resume.github || 'N/A'}`,
        ``,
        `SUMMARY:`,
        resume.summary || '(not written yet)',
        ``,
        `SKILLS (${skills.length}):`,
        skills.length ? skills.join(', ') : 'None listed',
        ``,
        `EXPERIENCE (${experience.length}):`,
        experience.length
            ? experience.map(e => `• ${e.position || '?'} at ${e.company || '?'} (${e.startDate || '?'}–${e.endDate || 'Present'})\n  ${e.description || 'No description'}`).join('\n')
            : 'None',
        ``,
        `EDUCATION:`,
        education.length
            ? education.map(e => `• ${e.degree || '?'} in ${e.field || '?'} — ${e.institution || '?'} (${e.startDate || '?'}–${e.endDate || 'Present'})`).join('\n')
            : 'None',
        ``,
        `PROJECTS (${projects.length}):`,
        projects.length
            ? projects.map(p => `• ${p.title || '?'}: ${p.description || 'No description'} [${(p.technologies || []).join(', ') || 'no tech'}]`).join('\n')
            : 'None',
        ``,
        `CERTIFICATIONS: ${certifications.join(', ') || 'None'}`,
        `LANGUAGES: ${languages.join(', ') || 'None'}`,
        `=== END RESUME ===`,
    ].join('\n');

    const systemPrompt = `You are an expert resume coach and career advisor embedded inside ELITEcv, an AI resume builder.

You have full access to the candidate's current resume (shown below) and their target role: "${targetRole || 'not specified — ask them'}".

Your job is to give highly specific, actionable advice tailored to BOTH the candidate's actual resume content AND their target role. Never give generic advice.

${resumeSnapshot}

RESPONSE FORMAT:
- Always respond in plain conversational text first.
- If you are rewriting or improving a specific section, ALSO include a JSON action block at the very end of your response on its own line:
  ACTION:{"type":"rewrite_summary","content":"...new summary text..."}
  ACTION:{"type":"add_skills","skills":["skill1","skill2","skill3"]}
  ACTION:{"type":"rewrite_experience","index":0,"field":"description","content":"...improved description..."}
  ACTION:{"type":"rewrite_project","index":0,"field":"description","content":"...improved description..."}
- Only include ACTION lines when providing content to apply. Not for general advice.
- Keep responses under 200 words unless asked for detail.
- Always reference actual content from their resume.`;

    // Sanitise message history — only keep role + content, ensure valid roles
    const sanitisedMessages = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: String(m.content) }));

    try {
        const completion = await openai.chat.completions.create({
            model: 'openai/gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemPrompt },
                ...sanitisedMessages,
            ],
            max_tokens: 700,
            temperature: 0.6,
        });

        const raw = completion.choices[0].message.content.trim();

        // Parse out ACTION lines from the response
        const actionLines = [];
        const textLines   = [];

        raw.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('ACTION:')) {
                try {
                    actionLines.push(JSON.parse(trimmed.slice(7).trim()));
                } catch {
                    textLines.push(line);
                }
            } else {
                textLines.push(line);
            }
        });

        res.json({ reply: textLines.join('\n').trim(), actions: actionLines });
    } catch (error) {
        console.error('AI chat error:', error.status, error.message);
        res.status(500).json({
            message: error.message || 'AI chat failed',
            details: error.status,
        });
    }
});
router.post('/ai-suggest', protect, async (req, res) => {
    const { section, context } = req.body;

    if (!section || !context) {
        return res.status(400).json({ message: 'section and context are required' });
    }

    const openai = getOpenAI();
    if (!openai) {
        return res.status(503).json({ message: 'AI service not configured. Add OPENAI_API_KEY to .env' });
    }

    const prompts = {
        summary: `Write a professional resume summary for someone with the following background: ${context}. Keep it to 3-4 sentences, first person, impactful.`,
        skills: `Based on this job role/background: "${context}", suggest 10 relevant technical and soft skills for a resume. Return as a comma-separated list only.`,
        experience: `Improve this job experience description for a resume: "${context}". Use strong action verbs, quantify achievements where possible, keep it to 3-4 bullet points.`,
        project: `Write a compelling project description for a resume based on: "${context}". Include technologies used and impact. Keep it to 2-3 sentences.`,
    };

    const prompt = prompts[section] || `Improve this resume section (${section}): ${context}`;

    try {
        const completion = await openai.chat.completions.create({
            model: 'openai/gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are an expert resume writer and career coach. Provide concise, professional, ATS-friendly resume content.' },
                { role: 'user', content: prompt },
            ],
            max_tokens: 400,
            temperature: 0.7,
        });

        const suggestion = completion.choices[0].message.content.trim();
        res.json({ suggestion });
    } catch (error) {
        console.error('OpenAI error:', error);
        res.status(500).json({ message: 'AI suggestion failed', error: error.message });
    }
});

// ─── POST full AI resume review ───────────────────────────────────────────────
// Analyses the entire resume and returns structured feedback with scores
router.post('/ai-review', protect, async (req, res) => {
    const { resume } = req.body;

    if (!resume || !resume.name) {
        return res.status(400).json({ message: 'Resume data is required' });
    }

    const openai = getOpenAI();
    if (!openai) {
        return res.status(503).json({ message: 'AI service not configured. Add OPENAI_API_KEY to .env' });
    }

    // Build a plain-text snapshot of the resume for the prompt
    const resumeText = `
Name: ${resume.name}
Email: ${resume.email || 'N/A'}
Phone: ${resume.phone || 'N/A'}
Location: ${resume.location || 'N/A'}
LinkedIn: ${resume.linkedin || 'N/A'}
GitHub: ${resume.github || 'N/A'}

SUMMARY:
${resume.summary || 'Not provided'}

SKILLS (${resume.skills?.length || 0}):
${resume.skills?.join(', ') || 'None'}

EXPERIENCE (${resume.experience?.length || 0} entries):
${resume.experience?.map(e =>
    `- ${e.position} at ${e.company} (${e.startDate} – ${e.endDate || 'Present'})\n  ${e.description || 'No description'}`
).join('\n') || 'None'}

EDUCATION (${resume.education?.length || 0} entries):
${resume.education?.map(e =>
    `- ${e.degree} in ${e.field} at ${e.institution} (${e.startDate} – ${e.endDate || 'Present'})`
).join('\n') || 'None'}

PROJECTS (${resume.projects?.length || 0} entries):
${resume.projects?.map(p =>
    `- ${p.title}: ${p.description || 'No description'} [${p.technologies?.join(', ') || 'No tech listed'}]`
).join('\n') || 'None'}

CERTIFICATIONS: ${resume.certifications?.join(', ') || 'None'}
LANGUAGES: ${resume.languages?.join(', ') || 'None'}
`.trim();

    const systemPrompt = `You are an expert resume reviewer and career coach with 15+ years of experience helping candidates land jobs at top companies. You review resumes critically but constructively, focusing on ATS optimisation, impact, clarity, and completeness.

You MUST respond with valid JSON only — no markdown, no extra text, just the JSON object.`;

    const userPrompt = `Review this resume and return a JSON object with EXACTLY this structure:
{
  "overallScore": <number 0-100>,
  "overallVerdict": "<one sentence overall assessment>",
  "scores": {
    "summary": <0-100>,
    "skills": <0-100>,
    "experience": <0-100>,
    "education": <0-100>,
    "projects": <0-100>,
    "completeness": <0-100>
  },
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "issues": [
    { "section": "<section name>", "severity": "high|medium|low", "issue": "<what is wrong>", "fix": "<how to fix it>" }
  ],
  "improvedSummary": "<rewritten professional summary if the current one needs improvement, else null>",
  "missingSkills": ["<skill 1>", "<skill 2>"],
  "quickWins": ["<actionable tip 1>", "<actionable tip 2>", "<actionable tip 3>"]
}

Resume to review:
${resumeText}`;

    try {
        const completion = await openai.chat.completions.create({
            model: 'openai/gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            max_tokens: 1200,
            temperature: 0.4,
        });

        const raw = completion.choices[0].message.content.trim();

        // Parse and validate JSON
        let review;
        try {
            review = JSON.parse(raw);
        } catch {
            // Try to extract JSON if model added extra text
            const match = raw.match(/\{[\s\S]*\}/);
            if (match) {
                review = JSON.parse(match[0]);
            } else {
                throw new Error('AI returned invalid JSON');
            }
        }

        res.json({ review });
    } catch (error) {
        console.error('AI review error:', error);
        res.status(500).json({ message: 'AI review failed', error: error.message });
    }
});

// ─── POST parse uploaded PDF resume ──────────────────────────────────────────
// NOTE: must be defined BEFORE /:id routes
router.post('/parse', protect, upload.single('resume'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    try {
        const data = await pdfParse(req.file.buffer);
        const text = data.text;

        const extractEmail = (t) => {
            const match = t.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
            return match ? match[0] : '';
        };

        const extractPhone = (t) => {
            const match = t.match(/(\+?\d[\d\s\-().]{7,}\d)/);
            return match ? match[0].trim() : '';
        };

        const extractName = (t) => {
            const lines = t.split('\n').map(l => l.trim()).filter(Boolean);
            return lines[0] || '';
        };

        const extractSkills = (t) => {
            const skillsSection = t.match(/skills?[:\s]+([\s\S]*?)(?:\n\n|\n[A-Z])/i);
            if (skillsSection) {
                return skillsSection[1]
                    .split(/[,\n•\-|]/)
                    .map(s => s.trim())
                    .filter(s => s.length > 1 && s.length < 50);
            }
            return [];
        };

        const parsed = {
            rawText: text,
            name: extractName(text),
            email: extractEmail(text),
            phone: extractPhone(text),
            skills: extractSkills(text),
        };

        res.json({ message: 'Resume parsed successfully', parsed });
    } catch (error) {
        console.error('PDF parse error:', error);
        res.status(500).json({ message: 'Failed to parse PDF', error: error.message });
    }
});

// ─── GET all resumes for logged-in user ───────────────────────────────────────
router.get('/', protect, async (req, res) => {
    try {
        const resumes = await Resume.find({ user: req.user._id }).sort({ updatedAt: -1 });
        res.status(200).json(resumes);
    } catch (error) {
        console.error('GET /api/resume error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ─── GET single resume by ID ──────────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
    try {
        const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
        if (!resume) return res.status(404).json({ message: 'Resume not found' });
        res.status(200).json(resume);
    } catch (error) {
        console.error('GET /api/resume/:id error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ─── POST create new resume ───────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
    try {
        const resumeData = { ...req.body, user: req.user._id };
        const newResume = new Resume(resumeData);
        const savedResume = await newResume.save();
        res.status(201).json(savedResume);
    } catch (error) {
        console.error('POST /api/resume error:', error);
        res.status(400).json({ error: 'Bad Request', details: error.message });
    }
});

// ─── PUT update resume by ID ──────────────────────────────────────────────────
router.put('/:id', protect, async (req, res) => {
    try {
        const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
        if (!resume) return res.status(404).json({ message: 'Resume not found' });

        const allowedFields = [
            'title', 'name', 'email', 'phone', 'location', 'linkedin', 'github',
            'website', 'summary', 'skills', 'experience', 'education', 'projects',
            'certifications', 'languages', 'template',
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                resume[field] = req.body[field];
            }
        });

        const updatedResume = await resume.save();
        res.json({ message: 'Resume updated successfully', resume: updatedResume });
    } catch (error) {
        console.error('PUT /api/resume/:id error:', error);
        res.status(500).json({ message: 'Error updating resume', error: error.message });
    }
});

// ─── DELETE resume by ID ──────────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
    try {
        const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!resume) return res.status(404).json({ message: 'Resume not found' });
        res.json({ message: 'Resume deleted successfully' });
    } catch (error) {
        console.error('DELETE /api/resume/:id error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
