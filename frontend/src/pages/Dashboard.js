import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    FileText, Plus, Trash2, Edit, LogOut, User,
    Copy, Eye, X, Sparkles, Download, Layout,
    ChevronRight, Star, Zap, Shield,
} from 'lucide-react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ResumePreview from '../components/ResumePreview';
import './Dashboard.css';

// ── Template showcase data ────────────────────────────────────────────────────
const TEMPLATES = [
    {
        id: 'modern',
        name: 'Modern',
        tag: 'Most Popular',
        tagColor: '#7c3aed',
        tagBg: '#ede9fe',
        desc: 'Two-column layout with a bold gradient header. Great for tech & creative roles.',
        accent: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        preview: ModernMini,
    },
    {
        id: 'classic',
        name: 'Classic',
        tag: 'ATS Friendly',
        tagColor: '#1d4ed8',
        tagBg: '#dbeafe',
        desc: 'Clean, traditional single-column format. Trusted by recruiters everywhere.',
        accent: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
        preview: ClassicMini,
    },
    {
        id: 'minimal',
        name: 'Minimal',
        tag: 'Clean & Sharp',
        tagColor: '#065f46',
        tagBg: '#d1fae5',
        desc: 'Ultra-clean design with subtle dividers. Perfect for design & product roles.',
        accent: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)',
        preview: MinimalMini,
    },
    {
        id: 'executive',
        name: 'Executive',
        tag: 'Coming Soon',
        tagColor: '#92400e',
        tagBg: '#fef3c7',
        desc: 'Premium layout for senior professionals and leadership positions.',
        accent: 'linear-gradient(135deg, #78350f 0%, #f59e0b 100%)',
        preview: ExecutiveMini,
        disabled: true,
    },
];

// ── Mini template previews (SVG-based thumbnails) ─────────────────────────────
function ModernMini() {
    return (
        <svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg" className="template-svg">
            {/* Header */}
            <defs>
                <linearGradient id="mg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
            </defs>
            <rect width="160" height="200" fill="#f8f9ff" rx="4" />
            <rect width="160" height="52" fill="url(#mg)" rx="4" />
            <rect x="12" y="12" width="70" height="8" rx="2" fill="rgba(255,255,255,0.9)" />
            <rect x="12" y="24" width="50" height="5" rx="2" fill="rgba(255,255,255,0.6)" />
            <rect x="12" y="32" width="90" height="4" rx="2" fill="rgba(255,255,255,0.4)" />
            {/* Left col */}
            <rect x="8" y="58" width="44" height="130" fill="#f0f0ff" rx="2" />
            <rect x="12" y="64" width="30" height="4" rx="2" fill="#667eea" />
            <rect x="12" y="72" width="36" height="3" rx="2" fill="#c4b5fd" />
            <rect x="12" y="78" width="32" height="3" rx="2" fill="#c4b5fd" />
            <rect x="12" y="84" width="34" height="3" rx="2" fill="#c4b5fd" />
            <rect x="12" y="94" width="30" height="4" rx="2" fill="#667eea" />
            <rect x="12" y="102" width="36" height="3" rx="2" fill="#c4b5fd" />
            <rect x="12" y="108" width="28" height="3" rx="2" fill="#c4b5fd" />
            {/* Right col */}
            <rect x="58" y="64" width="40" height="4" rx="2" fill="#667eea" />
            <rect x="58" y="72" width="94" height="3" rx="2" fill="#d1d5db" />
            <rect x="58" y="78" width="80" height="3" rx="2" fill="#d1d5db" />
            <rect x="58" y="84" width="88" height="3" rx="2" fill="#d1d5db" />
            <rect x="58" y="96" width="40" height="4" rx="2" fill="#667eea" />
            <rect x="58" y="104" width="94" height="3" rx="2" fill="#d1d5db" />
            <rect x="58" y="110" width="70" height="3" rx="2" fill="#d1d5db" />
            <rect x="58" y="116" width="85" height="3" rx="2" fill="#d1d5db" />
            <rect x="58" y="128" width="40" height="4" rx="2" fill="#667eea" />
            <rect x="58" y="136" width="94" height="3" rx="2" fill="#d1d5db" />
            <rect x="58" y="142" width="60" height="3" rx="2" fill="#d1d5db" />
        </svg>
    );
}

function ClassicMini() {
    return (
        <svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg" className="template-svg">
            <rect width="160" height="200" fill="#fff" rx="4" />
            {/* Header centered */}
            <rect x="40" y="12" width="80" height="8" rx="2" fill="#1e3a5f" />
            <rect x="20" y="24" width="120" height="3" rx="2" fill="#94a3b8" />
            <rect x="10" y="32" width="140" height="1" fill="#1e3a5f" />
            {/* Section 1 */}
            <rect x="10" y="40" width="60" height="4" rx="2" fill="#1e3a5f" />
            <rect x="10" y="48" width="140" height="1" fill="#e2e8f0" />
            <rect x="10" y="54" width="140" height="3" rx="2" fill="#d1d5db" />
            <rect x="10" y="60" width="120" height="3" rx="2" fill="#d1d5db" />
            <rect x="10" y="66" width="130" height="3" rx="2" fill="#d1d5db" />
            {/* Section 2 */}
            <rect x="10" y="78" width="60" height="4" rx="2" fill="#1e3a5f" />
            <rect x="10" y="86" width="140" height="1" fill="#e2e8f0" />
            <rect x="10" y="92" width="100" height="3" rx="2" fill="#1e3a5f" />
            <rect x="10" y="98" width="140" height="3" rx="2" fill="#d1d5db" />
            <rect x="10" y="104" width="110" height="3" rx="2" fill="#d1d5db" />
            {/* Section 3 */}
            <rect x="10" y="116" width="60" height="4" rx="2" fill="#1e3a5f" />
            <rect x="10" y="124" width="140" height="1" fill="#e2e8f0" />
            <rect x="10" y="130" width="140" height="3" rx="2" fill="#d1d5db" />
            <rect x="10" y="136" width="100" height="3" rx="2" fill="#d1d5db" />
            <rect x="10" y="148" width="60" height="4" rx="2" fill="#1e3a5f" />
            <rect x="10" y="156" width="140" height="1" fill="#e2e8f0" />
            <rect x="10" y="162" width="130" height="3" rx="2" fill="#d1d5db" />
        </svg>
    );
}

function MinimalMini() {
    return (
        <svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg" className="template-svg">
            <rect width="160" height="200" fill="#fff" rx="4" />
            {/* Name */}
            <rect x="10" y="14" width="90" height="10" rx="2" fill="#111" />
            <rect x="10" y="28" width="130" height="3" rx="2" fill="#9ca3af" />
            <rect x="10" y="38" width="1" height="120" fill="#e5e7eb" />
            {/* Sections */}
            <rect x="18" y="46" width="30" height="3" rx="2" fill="#9ca3af" />
            <rect x="18" y="54" width="130" height="3" rx="2" fill="#374151" />
            <rect x="18" y="60" width="110" height="3" rx="2" fill="#374151" />
            <rect x="18" y="66" width="120" height="3" rx="2" fill="#374151" />
            <rect x="10" y="76" width="140" height="1" fill="#e5e7eb" />
            <rect x="18" y="84" width="30" height="3" rx="2" fill="#9ca3af" />
            <rect x="18" y="92" width="130" height="3" rx="2" fill="#374151" />
            <rect x="18" y="98" width="100" height="3" rx="2" fill="#374151" />
            <rect x="10" y="108" width="140" height="1" fill="#e5e7eb" />
            <rect x="18" y="116" width="30" height="3" rx="2" fill="#9ca3af" />
            {/* Skill tags */}
            <rect x="18" y="124" width="28" height="10" rx="5" fill="#f3f4f6" />
            <rect x="50" y="124" width="32" height="10" rx="5" fill="#f3f4f6" />
            <rect x="86" y="124" width="24" height="10" rx="5" fill="#f3f4f6" />
            <rect x="114" y="124" width="30" height="10" rx="5" fill="#f3f4f6" />
            <rect x="10" y="142" width="140" height="1" fill="#e5e7eb" />
            <rect x="18" y="150" width="30" height="3" rx="2" fill="#9ca3af" />
            <rect x="18" y="158" width="130" height="3" rx="2" fill="#374151" />
            <rect x="18" y="164" width="90" height="3" rx="2" fill="#374151" />
        </svg>
    );
}

function ExecutiveMini() {
    return (
        <svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg" className="template-svg">
            <defs>
                <linearGradient id="eg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#78350f" />
                    <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
            </defs>
            <rect width="160" height="200" fill="#fffbeb" rx="4" />
            <rect width="160" height="6" fill="url(#eg)" />
            <rect x="10" y="16" width="80" height="9" rx="2" fill="#1c1917" />
            <rect x="10" y="29" width="55" height="4" rx="2" fill="#92400e" />
            <rect x="10" y="38" width="140" height="1" fill="#fcd34d" />
            <rect x="10" y="46" width="50" height="4" rx="2" fill="#92400e" />
            <rect x="10" y="54" width="140" height="1" fill="#e5e7eb" />
            <rect x="10" y="60" width="140" height="3" rx="2" fill="#d1d5db" />
            <rect x="10" y="66" width="120" height="3" rx="2" fill="#d1d5db" />
            <rect x="10" y="78" width="50" height="4" rx="2" fill="#92400e" />
            <rect x="10" y="86" width="140" height="1" fill="#e5e7eb" />
            <rect x="10" y="92" width="110" height="3" rx="2" fill="#1c1917" />
            <rect x="10" y="98" width="140" height="3" rx="2" fill="#d1d5db" />
            <rect x="10" y="104" width="100" height="3" rx="2" fill="#d1d5db" />
            <rect x="10" y="116" width="50" height="4" rx="2" fill="#92400e" />
            <rect x="10" y="124" width="140" height="1" fill="#e5e7eb" />
            <rect x="10" y="130" width="140" height="3" rx="2" fill="#d1d5db" />
            <rect x="10" y="136" width="80" height="3" rx="2" fill="#d1d5db" />
            {/* Lock overlay */}
            <rect width="160" height="200" fill="rgba(255,255,255,0.55)" rx="4" />
            <rect x="60" y="82" width="40" height="36" rx="8" fill="rgba(245,158,11,0.15)" stroke="#f59e0b" strokeWidth="1.5" />
            <rect x="68" y="96" width="24" height="16" rx="3" fill="#f59e0b" />
            <circle cx="80" cy="88" r="8" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
        </svg>
    );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
const Dashboard = () => {
    const [resumes, setResumes]       = useState([]);
    const [loading, setLoading]       = useState(true);
    const [previewResume, setPreview] = useState(null);
    const [activeTab, setActiveTab]   = useState('resumes'); // 'resumes' | 'templates'
    const { user, logout }            = useAuth();
    const navigate                    = useNavigate();

    useEffect(() => { fetchResumes(); }, []);

    const fetchResumes = async () => {
        try {
            const res = await API.get('/api/resume');
            setResumes(res.data);
        } catch {
            toast.error('Failed to load resumes');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this resume? This cannot be undone.')) return;
        try {
            await API.delete(`/api/resume/${id}`);
            setResumes((prev) => prev.filter((r) => r._id !== id));
            toast.success('Resume deleted');
        } catch {
            toast.error('Failed to delete resume');
        }
    };

    const handleDuplicate = async (resume) => {
        try {
            const { _id, user: _u, createdAt, updatedAt, __v, ...data } = resume;
            const res = await API.post('/api/resume', {
                ...data,
                title: `${data.title || 'Resume'} (Copy)`,
            });
            setResumes((prev) => [res.data, ...prev]);
            toast.success('Resume duplicated');
        } catch {
            toast.error('Failed to duplicate resume');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        toast.success('Logged out');
    };

    const handleUseTemplate = (templateId) => {
        navigate(`/builder/new?template=${templateId}`);
    };

    const formatDate = (d) =>
        new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="dashboard">
            {/* ── Sidebar ── */}
            <aside className="dash-sidebar">
                <div className="sidebar-logo">
                    <span className="logo-elite">ELITE</span><span className="logo-cv">cv</span>
                </div>
                <nav className="sidebar-nav">
                    <button
                        className={`sidebar-link ${activeTab === 'resumes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('resumes')}
                    >
                        <FileText size={18} /> My Resumes
                        {resumes.length > 0 && <span className="sidebar-badge">{resumes.length}</span>}
                    </button>
                    <button
                        className={`sidebar-link ${activeTab === 'templates' ? 'active' : ''}`}
                        onClick={() => setActiveTab('templates')}
                    >
                        <Layout size={18} /> Templates
                    </button>
                </nav>
                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        {user?.avatar
                            ? <img src={user.avatar} alt={user.name} className="user-avatar" />
                            : <div className="user-avatar-placeholder"><User size={16} /></div>
                        }
                        <div className="sidebar-user-info">
                            <span className="sidebar-user-name">{user?.name}</span>
                            <span className="sidebar-user-email">{user?.email}</span>
                        </div>
                    </div>
                    <button className="btn-logout" onClick={handleLogout}>
                        <LogOut size={15} /> Logout
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <div className="dash-main">
                {/* Top bar */}
                <header className="dash-topbar">
                    <div>
                        <p className="topbar-greeting">{greeting()}, {user?.name?.split(' ')[0]} 👋</p>
                        <h1 className="topbar-title">
                            {activeTab === 'resumes' ? 'My Resumes' : 'Choose a Template'}
                        </h1>
                    </div>
                    <button className="btn-new-resume" onClick={() => navigate('/builder/new')}>
                        <Plus size={17} /> New Resume
                    </button>
                </header>

                {/* ── Stats strip (only on resumes tab) ── */}
                {activeTab === 'resumes' && !loading && (
                    <div className="stats-strip">
                        <div className="stat-card">
                            <FileText size={20} className="stat-icon purple" />
                            <div>
                                <p className="stat-value">{resumes.length}</p>
                                <p className="stat-label">Total Resumes</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <Sparkles size={20} className="stat-icon blue" />
                            <div>
                                <p className="stat-value">{resumes.filter(r => r.summary).length}</p>
                                <p className="stat-label">AI Enhanced</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <Download size={20} className="stat-icon green" />
                            <div>
                                <p className="stat-value">{resumes.reduce((a, r) => a + (r.skills?.length || 0), 0)}</p>
                                <p className="stat-label">Total Skills</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <Star size={20} className="stat-icon amber" />
                            <div>
                                <p className="stat-value">{[...new Set(resumes.map(r => r.template))].length}</p>
                                <p className="stat-label">Templates Used</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Resumes Tab ── */}
                {activeTab === 'resumes' && (
                    <div className="tab-content">
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner" />
                                <p>Loading your resumes…</p>
                            </div>
                        ) : resumes.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-illustration">
                                    <FileText size={56} strokeWidth={1} />
                                </div>
                                <h3>No resumes yet</h3>
                                <p>Start from scratch or pick a template to get going fast.</p>
                                <div className="empty-actions">
                                    <button className="btn-primary" onClick={() => navigate('/builder/new')}>
                                        <Plus size={16} /> Create from Scratch
                                    </button>
                                    <button className="btn-secondary" onClick={() => setActiveTab('templates')}>
                                        <Layout size={16} /> Browse Templates
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="resume-grid">
                                {/* New resume card */}
                                <div className="resume-card resume-card-new" onClick={() => navigate('/builder/new')}>
                                    <div className="new-card-inner">
                                        <div className="new-card-icon"><Plus size={28} /></div>
                                        <p>New Resume</p>
                                    </div>
                                </div>

                                {resumes.map((resume) => (
                                    <div key={resume._id} className="resume-card">
                                        {/* Mini preview thumbnail */}
                                        <div className={`resume-thumb thumb-${resume.template}`}>
                                            <div className="thumb-header" />
                                            <div className="thumb-lines">
                                                <div className="thumb-line w-70" />
                                                <div className="thumb-line w-50" />
                                                <div className="thumb-line w-90" />
                                                <div className="thumb-line w-60" />
                                                <div className="thumb-line w-80" />
                                            </div>
                                        </div>

                                        <div className="resume-card-body">
                                            <div className="resume-card-top">
                                                <span className={`template-badge template-${resume.template}`}>
                                                    {resume.template}
                                                </span>
                                                <span className="resume-date">{formatDate(resume.updatedAt)}</span>
                                            </div>
                                            <h3 className="resume-card-title">{resume.title || 'Untitled Resume'}</h3>
                                            <p className="resume-card-name">{resume.name}</p>
                                            <p className="resume-card-meta">
                                                {resume.skills?.length || 0} skills
                                                {resume.experience?.length > 0 && ` · ${resume.experience.length} jobs`}
                                                {resume.projects?.length > 0 && ` · ${resume.projects.length} projects`}
                                            </p>

                                            <div className="resume-card-actions">
                                                <button className="btn-action btn-preview-icon" onClick={() => setPreview(resume)} title="Preview">
                                                    <Eye size={14} /> Preview
                                                </button>
                                                <button className="btn-action btn-edit" onClick={() => navigate(`/builder/${resume._id}`)} title="Edit">
                                                    <Edit size={14} /> Edit
                                                </button>
                                                <div className="btn-action-group">
                                                    <button className="btn-icon-sm btn-duplicate" onClick={() => handleDuplicate(resume)} title="Duplicate">
                                                        <Copy size={13} />
                                                    </button>
                                                    <button className="btn-icon-sm btn-delete" onClick={() => handleDelete(resume._id)} title="Delete">
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Templates Tab ── */}
                {activeTab === 'templates' && (
                    <div className="tab-content">
                        <p className="templates-subtitle">
                            Pick a template to start your resume. You can switch templates anytime inside the builder.
                        </p>
                        <div className="templates-grid">
                            {TEMPLATES.map((tpl) => {
                                const Preview = tpl.preview;
                                return (
                                    <div key={tpl.id} className={`template-card ${tpl.disabled ? 'disabled' : ''}`}>
                                        <div className="template-preview-box" style={{ background: tpl.disabled ? '#f9fafb' : '#f8f9ff' }}>
                                            <Preview />
                                            <div className="template-overlay">
                                                {!tpl.disabled && (
                                                    <button
                                                        className="btn-use-template"
                                                        onClick={() => handleUseTemplate(tpl.id)}
                                                    >
                                                        Use Template <ChevronRight size={15} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="template-card-info">
                                            <div className="template-card-top">
                                                <h3>{tpl.name}</h3>
                                                <span className="template-tag" style={{ color: tpl.tagColor, background: tpl.tagBg }}>
                                                    {tpl.tag}
                                                </span>
                                            </div>
                                            <p>{tpl.desc}</p>
                                            {!tpl.disabled && (
                                                <button
                                                    className="btn-template-use-full"
                                                    style={{ background: tpl.accent }}
                                                    onClick={() => handleUseTemplate(tpl.id)}
                                                >
                                                    Use {tpl.name} Template
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Feature highlights */}
                        <div className="template-features">
                            <h3>All templates include</h3>
                            <div className="template-features-grid">
                                <div className="tf-item"><Sparkles size={18} className="tf-icon" /><span>AI content suggestions</span></div>
                                <div className="tf-item"><Download size={18} className="tf-icon" /><span>One-click PDF export</span></div>
                                <div className="tf-item"><Zap size={18} className="tf-icon" /><span>Instant live preview</span></div>
                                <div className="tf-item"><Shield size={18} className="tf-icon" /><span>ATS-optimised layout</span></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Preview Modal ── */}
            {previewResume && (
                <div className="preview-modal-overlay" onClick={() => setPreview(null)}>
                    <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="preview-modal-header">
                            <span>{previewResume.title || 'Resume Preview'}</span>
                            <div className="preview-modal-actions">
                                <button className="btn-cta-sm" onClick={() => { navigate(`/builder/${previewResume._id}`); setPreview(null); }}>
                                    <Edit size={14} /> Edit
                                </button>
                                <button className="btn-modal-close" onClick={() => setPreview(null)}>
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="preview-modal-body">
                            <ResumePreview resume={previewResume} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
