import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    ArrowLeft, Save, Download, Sparkles, Plus, Trash2,
    Upload, Eye, EyeOff, ChevronDown, ChevronUp, Loader2, MessageSquare,
} from 'lucide-react';
import API from '../api/axios';
import ResumePreview from '../components/ResumePreview';
import AIReviewPanel from '../components/AIReviewPanel';
import AIChatPanel from '../components/AIChatPanel';
import './ResumeBuilder.css';

// ── Blank resume template ─────────────────────────────────────────────────────
const blankResume = {
    title: 'My Resume',
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    summary: '',
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    languages: [],
    template: 'modern',
};

// ── Section collapse helper ───────────────────────────────────────────────────
const Section = ({ title, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="builder-section">
            <button className="section-toggle" onClick={() => setOpen(!open)}>
                <span>{title}</span>
                {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {open && <div className="section-body">{children}</div>}
        </div>
    );
};

// ── Main component ────────────────────────────────────────────────────────────
const ResumeBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isNew = id === 'new';

    const [resume, setResume] = useState({
        ...blankResume,
        template: searchParams.get('template') || 'modern',
    });
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [aiLoading, setAiLoading] = useState({});
    const [skillInput, setSkillInput] = useState('');
    const [certInput, setCertInput] = useState('');
    const [langInput, setLangInput] = useState('');
    const previewRef = useRef(null);

    // ── Dynamically scale the A4 preview to fit the panel ────────────────────
    useEffect(() => {
        if (!showPreview || !previewRef.current) return;
        const panel = previewRef.current;
        const updateScale = () => {
            const panelW = panel.clientWidth - 32; // subtract padding
            const scale = Math.min(1, panelW / 794);
            panel.style.setProperty('--preview-scale', scale.toFixed(3));
        };
        updateScale();
        const ro = new ResizeObserver(updateScale);
        ro.observe(panel);
        return () => ro.disconnect();
    }, [showPreview]);

    // ── Load existing resume ──────────────────────────────────────────────────
    useEffect(() => {
        if (!isNew) {
            API.get(`/api/resume/${id}`)
                .then((res) => setResume(res.data))
                .catch(() => {
                    toast.error('Resume not found');
                    navigate('/dashboard');
                })
                .finally(() => setLoading(false));
        }
    }, [id, isNew, navigate]);

    // ── Field helpers ─────────────────────────────────────────────────────────
    const set = useCallback((field, value) => {
        setResume((prev) => ({ ...prev, [field]: value }));
    }, []);

    // ── Save ──────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!resume.name || !resume.email) {
            return toast.error('Name and email are required');
        }
        setSaving(true);
        try {
            if (isNew) {
                const res = await API.post('/api/resume', resume);
                toast.success('Resume created!');
                navigate(`/builder/${res.data._id}`, { replace: true });
            } else {
                await API.put(`/api/resume/${id}`, resume);
                toast.success('Resume saved!');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    // ── PDF Export ────────────────────────────────────────────────────────────
    const handleExportPDF = async () => {
        const { default: html2canvas } = await import('html2canvas');
        const { default: jsPDF } = await import('jspdf');

        const el = document.getElementById('resume-preview-print');
        if (!el) return toast.error('Preview not visible — toggle preview first');

        toast.loading('Generating PDF…', { id: 'pdf' });
        try {
            const canvas = await html2canvas(el, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${resume.title || 'resume'}.pdf`);
            toast.success('PDF downloaded!', { id: 'pdf' });
        } catch {
            toast.error('PDF export failed', { id: 'pdf' });
        }
    };

    // ── AI Suggest ────────────────────────────────────────────────────────────
    const aiSuggest = async (section, context, onResult) => {
        if (!context.trim()) return toast.error('Add some context first');
        setAiLoading((prev) => ({ ...prev, [section]: true }));
        try {
            const res = await API.post('/api/resume/ai-suggest', { section, context });
            onResult(res.data.suggestion);
            toast.success('AI suggestion applied!');
        } catch (err) {
            const msg = err.response?.data?.message || 'AI suggestion failed';
            toast.error(msg);
        } finally {
            setAiLoading((prev) => ({ ...prev, [section]: false }));
        }
    };

    // ── PDF Upload / Parse ────────────────────────────────────────────────────
    const handlePDFUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('resume', file);
        toast.loading('Parsing PDF…', { id: 'parse' });
        try {
            const res = await API.post('/api/resume/parse', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const { parsed } = res.data;
            setResume((prev) => ({
                ...prev,
                name: parsed.name || prev.name,
                email: parsed.email || prev.email,
                phone: parsed.phone || prev.phone,
                skills: parsed.skills?.length ? parsed.skills : prev.skills,
            }));
            toast.success('Resume parsed — review and fill in the rest', { id: 'parse' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Parse failed', { id: 'parse' });
        }
        e.target.value = '';
    };

    // ── Array helpers ─────────────────────────────────────────────────────────
    const addItem = (field, item) => set(field, [...resume[field], item]);
    const removeItem = (field, idx) => set(field, resume[field].filter((_, i) => i !== idx));
    const updateItem = (field, idx, updated) =>
        set(field, resume[field].map((item, i) => (i === idx ? { ...item, ...updated } : item)));

    const addTag = (field, value, setter) => {
        const trimmed = value.trim();
        if (!trimmed) return;
        if (!resume[field].includes(trimmed)) addItem(field, trimmed);
        setter('');
    };

    if (loading) {
        return (
            <div className="full-page-loader">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="builder-layout">
            {/* ── Top Bar ── */}
            <header className="builder-topbar">
                <div className="topbar-left">
                    <button className="btn-back" onClick={() => navigate('/dashboard')}>
                        <ArrowLeft size={18} />
                    </button>
                    <input
                        className="resume-title-input"
                        value={resume.title}
                        onChange={(e) => set('title', e.target.value)}
                        placeholder="Resume title"
                    />
                </div>
                <div className="topbar-right">
                    <label className="btn-upload" title="Import PDF">
                        <Upload size={16} />
                        <span className="btn-label">Import PDF</span>
                        <input type="file" accept=".pdf" onChange={handlePDFUpload} hidden />
                    </label>
                    <button
                        className={`btn-preview ${showPreview ? 'active' : ''}`}
                        onClick={() => { setShowPreview(!showPreview); setShowChat(false); setShowReview(false); }}
                    >
                        {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                        <span className="btn-label">{showPreview ? 'Hide Preview' : 'Preview'}</span>
                    </button>
                    <button
                        className={`btn-ai-chat ${showChat ? 'active' : ''}`}
                        onClick={() => { setShowChat(!showChat); setShowReview(false); setShowPreview(false); }}
                        title="Chat with AI Coach"
                    >
                        <MessageSquare size={16} />
                        <span className="btn-label">AI Chat</span>
                    </button>
                    <button
                        className={`btn-ai-review ${showReview ? 'active' : ''}`}
                        onClick={() => { setShowReview(!showReview); setShowChat(false); setShowPreview(false); }}
                        title="AI Resume Review"
                    >
                        <Sparkles size={16} />
                        <span className="btn-label">AI Review</span>
                    </button>
                    <button className="btn-export" onClick={handleExportPDF}>
                        <Download size={16} />
                        <span className="btn-label">Export PDF</span>
                    </button>
                    <button className="btn-save" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 size={16} className="spin-icon" /> : <Save size={16} />}
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                </div>
            </header>

            {/* ── Body ── */}
            <div className={`builder-body ${showPreview ? 'with-preview' : ''}`}>
                {/* ── Form Panel ── */}
                <div className="builder-form-panel">
                    {/* Template */}
                    <div className="template-selector">
                        <span className="template-label">Template:</span>
                        {['modern', 'classic', 'minimal'].map((t) => (
                            <button
                                key={t}
                                className={`template-btn ${resume.template === t ? 'active' : ''}`}
                                onClick={() => set('template', t)}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* Personal Info */}
                    <Section title="Personal Information">
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input value={resume.name} onChange={(e) => set('name', e.target.value)} placeholder="Jane Doe" />
                            </div>
                            <div className="form-group">
                                <label>Email *</label>
                                <input type="email" value={resume.email} onChange={(e) => set('email', e.target.value)} placeholder="jane@example.com" />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input value={resume.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 555 000 0000" />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input value={resume.location} onChange={(e) => set('location', e.target.value)} placeholder="City, Country" />
                            </div>
                            <div className="form-group">
                                <label>LinkedIn</label>
                                <input value={resume.linkedin} onChange={(e) => set('linkedin', e.target.value)} placeholder="linkedin.com/in/janedoe" />
                            </div>
                            <div className="form-group">
                                <label>GitHub</label>
                                <input value={resume.github} onChange={(e) => set('github', e.target.value)} placeholder="github.com/janedoe" />
                            </div>
                            <div className="form-group form-full">
                                <label>Website / Portfolio</label>
                                <input value={resume.website} onChange={(e) => set('website', e.target.value)} placeholder="https://janedoe.dev" />
                            </div>
                        </div>
                    </Section>

                    {/* Summary */}
                    <Section title="Professional Summary">
                        <div className="form-group">
                            <textarea
                                rows={4}
                                value={resume.summary}
                                onChange={(e) => set('summary', e.target.value)}
                                placeholder="A brief overview of your professional background and goals…"
                            />
                        </div>
                        <button
                            className="btn-ai"
                            disabled={aiLoading.summary}
                            onClick={() =>
                                aiSuggest('summary', resume.summary || `${resume.name}, ${resume.skills.join(', ')}`, (s) =>
                                    set('summary', s)
                                )
                            }
                        >
                            {aiLoading.summary ? <Loader2 size={14} className="spin-icon" /> : <Sparkles size={14} />}
                            AI Suggest Summary
                        </button>
                    </Section>

                    {/* Skills */}
                    <Section title="Skills">
                        <div className="tag-input-row">
                            <input
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('skills', skillInput, setSkillInput))}
                                placeholder="Type a skill and press Enter"
                            />
                            <button className="btn-add-tag" onClick={() => addTag('skills', skillInput, setSkillInput)}>
                                <Plus size={16} />
                            </button>
                        </div>
                        <div className="tag-list">
                            {resume.skills.map((skill, i) => (
                                <span key={i} className="tag">
                                    {skill}
                                    <button onClick={() => removeItem('skills', i)}><Trash2 size={11} /></button>
                                </span>
                            ))}
                        </div>
                        <button
                            className="btn-ai"
                            disabled={aiLoading.skills}
                            onClick={() =>
                                aiSuggest(
                                    'skills',
                                    resume.summary || resume.title || 'software developer',
                                    (s) => {
                                        const newSkills = s.split(',').map((sk) => sk.trim()).filter(Boolean);
                                        set('skills', [...new Set([...resume.skills, ...newSkills])]);
                                    }
                                )
                            }
                        >
                            {aiLoading.skills ? <Loader2 size={14} className="spin-icon" /> : <Sparkles size={14} />}
                            AI Suggest Skills
                        </button>
                    </Section>

                    {/* Experience */}
                    <Section title="Work Experience">
                        {resume.experience.map((exp, i) => (
                            <div key={i} className="list-item-card">
                                <div className="list-item-header">
                                    <span className="list-item-title">{exp.position || exp.company || `Experience ${i + 1}`}</span>
                                    <button className="btn-remove" onClick={() => removeItem('experience', i)}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label>Company</label>
                                        <input value={exp.company} onChange={(e) => updateItem('experience', i, { company: e.target.value })} placeholder="Acme Corp" />
                                    </div>
                                    <div className="form-group">
                                        <label>Position</label>
                                        <input value={exp.position} onChange={(e) => updateItem('experience', i, { position: e.target.value })} placeholder="Software Engineer" />
                                    </div>
                                    <div className="form-group">
                                        <label>Start Date</label>
                                        <input value={exp.startDate} onChange={(e) => updateItem('experience', i, { startDate: e.target.value })} placeholder="Jan 2022" />
                                    </div>
                                    <div className="form-group">
                                        <label>End Date</label>
                                        <input value={exp.endDate} onChange={(e) => updateItem('experience', i, { endDate: e.target.value })} placeholder="Present" />
                                    </div>
                                    <div className="form-group form-full">
                                        <label>Description</label>
                                        <textarea
                                            rows={3}
                                            value={exp.description}
                                            onChange={(e) => updateItem('experience', i, { description: e.target.value })}
                                            placeholder="Describe your responsibilities and achievements…"
                                        />
                                    </div>
                                </div>
                                <button
                                    className="btn-ai"
                                    disabled={aiLoading[`exp-${i}`]}
                                    onClick={() =>
                                        aiSuggest(
                                            'experience',
                                            exp.description || `${exp.position} at ${exp.company}`,
                                            (s) => updateItem('experience', i, { description: s })
                                        )
                                    }
                                >
                                    {aiLoading[`exp-${i}`] ? <Loader2 size={14} className="spin-icon" /> : <Sparkles size={14} />}
                                    AI Improve Description
                                </button>
                            </div>
                        ))}
                        <button
                            className="btn-add-item"
                            onClick={() => addItem('experience', { company: '', position: '', startDate: '', endDate: '', description: '' })}
                        >
                            <Plus size={15} /> Add Experience
                        </button>
                    </Section>

                    {/* Education */}
                    <Section title="Education">
                        {resume.education.map((edu, i) => (
                            <div key={i} className="list-item-card">
                                <div className="list-item-header">
                                    <span className="list-item-title">{edu.institution || `Education ${i + 1}`}</span>
                                    <button className="btn-remove" onClick={() => removeItem('education', i)}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label>Institution</label>
                                        <input value={edu.institution} onChange={(e) => updateItem('education', i, { institution: e.target.value })} placeholder="MIT" />
                                    </div>
                                    <div className="form-group">
                                        <label>Degree</label>
                                        <input value={edu.degree} onChange={(e) => updateItem('education', i, { degree: e.target.value })} placeholder="B.Sc." />
                                    </div>
                                    <div className="form-group">
                                        <label>Field of Study</label>
                                        <input value={edu.field} onChange={(e) => updateItem('education', i, { field: e.target.value })} placeholder="Computer Science" />
                                    </div>
                                    <div className="form-group">
                                        <label>Start Date</label>
                                        <input value={edu.startDate} onChange={(e) => updateItem('education', i, { startDate: e.target.value })} placeholder="Sep 2018" />
                                    </div>
                                    <div className="form-group">
                                        <label>End Date</label>
                                        <input value={edu.endDate} onChange={(e) => updateItem('education', i, { endDate: e.target.value })} placeholder="May 2022" />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button
                            className="btn-add-item"
                            onClick={() => addItem('education', { institution: '', degree: '', field: '', startDate: '', endDate: '' })}
                        >
                            <Plus size={15} /> Add Education
                        </button>
                    </Section>

                    {/* Projects */}
                    <Section title="Projects">
                        {resume.projects.map((proj, i) => (
                            <div key={i} className="list-item-card">
                                <div className="list-item-header">
                                    <span className="list-item-title">{proj.title || `Project ${i + 1}`}</span>
                                    <button className="btn-remove" onClick={() => removeItem('projects', i)}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label>Project Title</label>
                                        <input value={proj.title} onChange={(e) => updateItem('projects', i, { title: e.target.value })} placeholder="My Awesome App" />
                                    </div>
                                    <div className="form-group">
                                        <label>Link</label>
                                        <input value={proj.link} onChange={(e) => updateItem('projects', i, { link: e.target.value })} placeholder="https://github.com/…" />
                                    </div>
                                    <div className="form-group form-full">
                                        <label>Technologies (comma-separated)</label>
                                        <input
                                            value={proj.technologies?.join(', ')}
                                            onChange={(e) =>
                                                updateItem('projects', i, {
                                                    technologies: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                                                })
                                            }
                                            placeholder="React, Node.js, MongoDB"
                                        />
                                    </div>
                                    <div className="form-group form-full">
                                        <label>Description</label>
                                        <textarea
                                            rows={3}
                                            value={proj.description}
                                            onChange={(e) => updateItem('projects', i, { description: e.target.value })}
                                            placeholder="What did you build and why?"
                                        />
                                    </div>
                                </div>
                                <button
                                    className="btn-ai"
                                    disabled={aiLoading[`proj-${i}`]}
                                    onClick={() =>
                                        aiSuggest(
                                            'project',
                                            proj.description || `${proj.title} using ${proj.technologies?.join(', ')}`,
                                            (s) => updateItem('projects', i, { description: s })
                                        )
                                    }
                                >
                                    {aiLoading[`proj-${i}`] ? <Loader2 size={14} className="spin-icon" /> : <Sparkles size={14} />}
                                    AI Improve Description
                                </button>
                            </div>
                        ))}
                        <button
                            className="btn-add-item"
                            onClick={() => addItem('projects', { title: '', description: '', technologies: [], link: '' })}
                        >
                            <Plus size={15} /> Add Project
                        </button>
                    </Section>

                    {/* Certifications */}
                    <Section title="Certifications" defaultOpen={false}>
                        <div className="tag-input-row">
                            <input
                                value={certInput}
                                onChange={(e) => setCertInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('certifications', certInput, setCertInput))}
                                placeholder="e.g. AWS Certified Developer"
                            />
                            <button className="btn-add-tag" onClick={() => addTag('certifications', certInput, setCertInput)}>
                                <Plus size={16} />
                            </button>
                        </div>
                        <div className="tag-list">
                            {resume.certifications.map((cert, i) => (
                                <span key={i} className="tag">
                                    {cert}
                                    <button onClick={() => removeItem('certifications', i)}><Trash2 size={11} /></button>
                                </span>
                            ))}
                        </div>
                    </Section>

                    {/* Languages */}
                    <Section title="Languages" defaultOpen={false}>
                        <div className="tag-input-row">
                            <input
                                value={langInput}
                                onChange={(e) => setLangInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('languages', langInput, setLangInput))}
                                placeholder="e.g. English (Native)"
                            />
                            <button className="btn-add-tag" onClick={() => addTag('languages', langInput, setLangInput)}>
                                <Plus size={16} />
                            </button>
                        </div>
                        <div className="tag-list">
                            {resume.languages.map((lang, i) => (
                                <span key={i} className="tag">
                                    {lang}
                                    <button onClick={() => removeItem('languages', i)}><Trash2 size={11} /></button>
                                </span>
                            ))}
                        </div>
                    </Section>
                </div>

                {/* ── Preview Panel ── */}
                {showPreview && (
                    <div className="builder-preview-panel" ref={previewRef}>
                        <div>
                            <ResumePreview resume={resume} />
                        </div>
                    </div>
                )}

                {/* ── AI Review Panel ── */}
                {showReview && (
                    <AIReviewPanel
                        resume={resume}
                        onClose={() => setShowReview(false)}
                        onApplySummary={(s) => set('summary', s)}
                        onAddSkills={(skills) => {
                            const merged = [...new Set([...resume.skills, ...skills])];
                            set('skills', merged);
                        }}
                    />
                )}

                {/* ── AI Chat Panel ── */}
                {showChat && (
                    <AIChatPanel
                        resume={resume}
                        onClose={() => setShowChat(false)}
                        onApplyAction={(action) => {
                            switch (action.type) {
                                case 'rewrite_summary':
                                    set('summary', action.content);
                                    toast.success('Summary updated from chat!');
                                    break;
                                case 'add_skills': {
                                    const merged = [...new Set([...resume.skills, ...(action.skills || [])])];
                                    set('skills', merged);
                                    toast.success(`${action.skills?.length || 0} skills added!`);
                                    break;
                                }
                                case 'rewrite_experience': {
                                    const idx = action.index ?? 0;
                                    if (resume.experience[idx]) {
                                        updateItem('experience', idx, { [action.field || 'description']: action.content });
                                        toast.success('Experience updated from chat!');
                                    }
                                    break;
                                }
                                case 'rewrite_project': {
                                    const idx = action.index ?? 0;
                                    if (resume.projects[idx]) {
                                        updateItem('projects', idx, { [action.field || 'description']: action.content });
                                        toast.success('Project updated from chat!');
                                    }
                                    break;
                                }
                                default:
                                    toast('Action received but not recognised');
                            }
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default ResumeBuilder;
