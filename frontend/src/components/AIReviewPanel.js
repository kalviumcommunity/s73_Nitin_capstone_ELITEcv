import React, { useState } from 'react';
import {
    X, Sparkles, CheckCircle, AlertTriangle, AlertCircle,
    ChevronDown, ChevronUp, Zap, Plus, RefreshCw,
} from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import './AIReviewPanel.css';

// ── Score ring ────────────────────────────────────────────────────────────────
const ScoreRing = ({ score, size = 80, label }) => {
    const r = (size / 2) - 6;
    const circ = 2 * Math.PI * r;
    const fill = (score / 100) * circ;
    const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

    return (
        <div className="score-ring-wrap" style={{ width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="5" />
                <circle
                    cx={size / 2} cy={size / 2} r={r}
                    fill="none" stroke={color} strokeWidth="5"
                    strokeDasharray={`${fill} ${circ}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.8s ease' }}
                />
            </svg>
            <div className="score-ring-inner">
                <span className="score-ring-value" style={{ color }}>{score}</span>
                {label && <span className="score-ring-label">{label}</span>}
            </div>
        </div>
    );
};

// ── Section score bar ─────────────────────────────────────────────────────────
const ScoreBar = ({ label, score }) => {
    const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
    return (
        <div className="score-bar-row">
            <span className="score-bar-label">{label}</span>
            <div className="score-bar-track">
                <div
                    className="score-bar-fill"
                    style={{ width: `${score}%`, background: color }}
                />
            </div>
            <span className="score-bar-value" style={{ color }}>{score}</span>
        </div>
    );
};

// ── Severity icon ─────────────────────────────────────────────────────────────
const SeverityIcon = ({ severity }) => {
    if (severity === 'high')   return <AlertCircle   size={15} className="sev-high"   />;
    if (severity === 'medium') return <AlertTriangle size={15} className="sev-medium" />;
    return                            <CheckCircle   size={15} className="sev-low"    />;
};

// ── Collapsible block ─────────────────────────────────────────────────────────
const Block = ({ title, count, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="review-block">
            <button className="review-block-toggle" onClick={() => setOpen(!open)}>
                <span>{title}{count !== undefined && <span className="block-count">{count}</span>}</span>
                {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            {open && <div className="review-block-body">{children}</div>}
        </div>
    );
};

// ── Main panel ────────────────────────────────────────────────────────────────
const AIReviewPanel = ({ resume, onClose, onApplySummary, onAddSkills }) => {
    const [review, setReview]   = useState(null);
    const [loading, setLoading] = useState(false);

    const runReview = async () => {
        if (!resume.name || !resume.email) {
            return toast.error('Fill in at least your name and email first');
        }
        setLoading(true);
        setReview(null);
        try {
            const res = await API.post('/api/resume/ai-review', { resume });
            setReview(res.data.review);
            toast.success('AI review complete!');
        } catch (err) {
            const msg = err.response?.data?.message || 'Review failed';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleApplySummary = () => {
        if (review?.improvedSummary) {
            onApplySummary(review.improvedSummary);
            toast.success('Improved summary applied!');
        }
    };

    const handleAddMissingSkills = () => {
        if (review?.missingSkills?.length) {
            onAddSkills(review.missingSkills);
            toast.success(`${review.missingSkills.length} skills added!`);
        }
    };

    return (
        <div className="ai-review-panel">
            {/* Header */}
            <div className="review-header">
                <div className="review-header-left">
                    <div className="review-header-icon"><Sparkles size={18} /></div>
                    <div>
                        <h2>AI Resume Review</h2>
                        <p>Get instant feedback and improvements</p>
                    </div>
                </div>
                <button className="review-close" onClick={onClose}><X size={18} /></button>
            </div>

            {/* Body */}
            <div className="review-body">
                {/* Idle state */}
                {!review && !loading && (
                    <div className="review-idle">
                        <div className="review-idle-icon"><Sparkles size={36} /></div>
                        <h3>Ready to analyse your resume</h3>
                        <p>
                            Our AI will review your entire resume and give you a score,
                            highlight weaknesses, and suggest concrete improvements.
                        </p>
                        <ul className="review-idle-list">
                            <li><CheckCircle size={14} /> Overall ATS score</li>
                            <li><CheckCircle size={14} /> Section-by-section breakdown</li>
                            <li><CheckCircle size={14} /> Strengths & issues</li>
                            <li><CheckCircle size={14} /> Rewritten summary suggestion</li>
                            <li><CheckCircle size={14} /> Missing skills to add</li>
                            <li><CheckCircle size={14} /> Quick-win action items</li>
                        </ul>
                        <button className="btn-run-review" onClick={runReview}>
                            <Sparkles size={16} /> Analyse My Resume
                        </button>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="review-loading">
                        <div className="review-spinner" />
                        <p>Analysing your resume…</p>
                        <span>This takes about 10–15 seconds</span>
                    </div>
                )}

                {/* Results */}
                {review && !loading && (
                    <div className="review-results">
                        {/* Overall score */}
                        <div className="review-overall">
                            <ScoreRing score={review.overallScore} size={90} />
                            <div className="review-overall-text">
                                <h3>Overall Score</h3>
                                <p>{review.overallVerdict}</p>
                                <button className="btn-rerun" onClick={runReview}>
                                    <RefreshCw size={13} /> Re-analyse
                                </button>
                            </div>
                        </div>

                        {/* Section scores */}
                        <Block title="Section Scores">
                            <div className="score-bars">
                                {Object.entries(review.scores || {}).map(([key, val]) => (
                                    <ScoreBar
                                        key={key}
                                        label={key.charAt(0).toUpperCase() + key.slice(1)}
                                        score={val}
                                    />
                                ))}
                            </div>
                        </Block>

                        {/* Strengths */}
                        {review.strengths?.length > 0 && (
                            <Block title="Strengths">
                                <ul className="review-list review-list-green">
                                    {review.strengths.map((s, i) => (
                                        <li key={i}><CheckCircle size={14} />{s}</li>
                                    ))}
                                </ul>
                            </Block>
                        )}

                        {/* Issues */}
                        {review.issues?.length > 0 && (
                            <Block title="Issues to Fix" count={review.issues.length}>
                                <div className="issues-list">
                                    {review.issues.map((issue, i) => (
                                        <div key={i} className={`issue-card sev-card-${issue.severity}`}>
                                            <div className="issue-card-top">
                                                <SeverityIcon severity={issue.severity} />
                                                <span className="issue-section">{issue.section}</span>
                                                <span className={`issue-badge sev-badge-${issue.severity}`}>
                                                    {issue.severity}
                                                </span>
                                            </div>
                                            <p className="issue-text">{issue.issue}</p>
                                            <div className="issue-fix">
                                                <Zap size={12} />
                                                <span>{issue.fix}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Block>
                        )}

                        {/* Improved summary */}
                        {review.improvedSummary && (
                            <Block title="Improved Summary">
                                <p className="improved-summary-text">{review.improvedSummary}</p>
                                <button className="btn-apply" onClick={handleApplySummary}>
                                    <CheckCircle size={14} /> Apply to Resume
                                </button>
                            </Block>
                        )}

                        {/* Missing skills */}
                        {review.missingSkills?.length > 0 && (
                            <Block title="Suggested Skills to Add">
                                <div className="missing-skills">
                                    {review.missingSkills.map((s, i) => (
                                        <span key={i} className="missing-skill-tag">{s}</span>
                                    ))}
                                </div>
                                <button className="btn-apply" onClick={handleAddMissingSkills}>
                                    <Plus size={14} /> Add All to Skills
                                </button>
                            </Block>
                        )}

                        {/* Quick wins */}
                        {review.quickWins?.length > 0 && (
                            <Block title="Quick Wins" defaultOpen={true}>
                                <ul className="review-list review-list-blue">
                                    {review.quickWins.map((tip, i) => (
                                        <li key={i}><Zap size={13} />{tip}</li>
                                    ))}
                                </ul>
                            </Block>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIReviewPanel;
