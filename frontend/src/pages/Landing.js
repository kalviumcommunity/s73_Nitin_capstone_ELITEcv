import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, FileText, Download, Upload, Shield, Zap } from 'lucide-react';
import './Landing.css';

const features = [
    {
        icon: <Sparkles size={28} />,
        title: 'AI-Powered Suggestions',
        desc: 'Get smart, ATS-friendly content suggestions for your summary, skills, and experience — powered by OpenAI.',
    },
    {
        icon: <FileText size={28} />,
        title: '3 Professional Templates',
        desc: 'Choose from Modern, Classic, and Minimal templates. Switch anytime with a single click.',
    },
    {
        icon: <Upload size={28} />,
        title: 'Import Existing Resume',
        desc: 'Upload your current PDF resume and we\'ll extract your details automatically to get you started fast.',
    },
    {
        icon: <Download size={28} />,
        title: 'Export to PDF',
        desc: 'Download a pixel-perfect PDF of your resume, ready to send to recruiters.',
    },
    {
        icon: <Shield size={28} />,
        title: 'Secure & Private',
        desc: 'Your data is protected with JWT authentication. Only you can access your resumes.',
    },
    {
        icon: <Zap size={28} />,
        title: 'Fast & Easy',
        desc: 'Build a complete, professional resume in minutes — not hours.',
    },
];

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="landing">
            {/* Nav */}
            <nav className="landing-nav">
                <div className="landing-logo">
                    <span className="logo-elite">ELITE</span><span className="logo-cv">cv</span>
                </div>
                <div className="landing-nav-actions">
                    <button className="btn-ghost" onClick={() => navigate('/login')}>Sign In</button>
                    <button className="btn-cta-sm" onClick={() => navigate('/register')}>Get Started Free</button>
                </div>
            </nav>

            {/* Hero */}
            <section className="landing-hero">
                <div className="hero-badge">
                    <Sparkles size={14} /> AI-Powered Resume Builder
                </div>
                <h1>
                    Build your perfect resume<br />
                    <span className="hero-gradient">in minutes, not hours</span>
                </h1>
                <p className="hero-sub">
                    ELITEcv uses AI to help you craft professional, ATS-optimised resumes.
                    Import your existing resume, get smart suggestions, and export a polished PDF.
                </p>
                <div className="hero-actions">
                    <button className="btn-hero-primary" onClick={() => navigate('/register')}>
                        Create My Resume — It's Free
                    </button>
                    <button className="btn-hero-ghost" onClick={() => navigate('/login')}>
                        Sign In
                    </button>
                </div>
                <p className="hero-note">No credit card required · Takes 2 minutes to set up</p>
            </section>

            {/* Features */}
            <section className="landing-features">
                <h2>Everything you need to land the job</h2>
                <p className="features-sub">One platform, all the tools.</p>
                <div className="features-grid">
                    {features.map((f, i) => (
                        <div key={i} className="feature-card">
                            <div className="feature-icon">{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="landing-cta">
                <h2>Ready to build your best resume?</h2>
                <p>Join thousands of job seekers who've landed interviews with ELITEcv.</p>
                <button className="btn-hero-primary" onClick={() => navigate('/register')}>
                    Get Started for Free
                </button>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="landing-logo">
                    <span className="logo-elite">ELITE</span><span className="logo-cv">cv</span>
                </div>
                <p>© {new Date().getFullYear()} ELITEcv. Built with ❤️ for job seekers.</p>
            </footer>
        </div>
    );
};

export default Landing;
