import React from 'react';
import './ResumePreview.css';

// ── Shared helpers ────────────────────────────────────────────────────────────
const Link = ({ href, children }) =>
    href ? (
        <a href={href.startsWith('http') ? href : `https://${href}`} target="_blank" rel="noreferrer">
            {children}
        </a>
    ) : (
        <span>{children}</span>
    );

// ── Modern Template ───────────────────────────────────────────────────────────
const ModernTemplate = ({ r }) => (
    <div className="rp-modern" id="resume-preview-print">
        {/* Header */}
        <header className="rp-modern-header">
            <h1>{r.name || 'Your Name'}</h1>
            <div className="rp-modern-contact">
                {r.email && <span>{r.email}</span>}
                {r.phone && <span>{r.phone}</span>}
                {r.location && <span>{r.location}</span>}
                {r.linkedin && <Link href={r.linkedin}>{r.linkedin}</Link>}
                {r.github && <Link href={r.github}>{r.github}</Link>}
                {r.website && <Link href={r.website}>{r.website}</Link>}
            </div>
        </header>

        <div className="rp-modern-body">
            {/* Left column */}
            <aside className="rp-modern-aside">
                {r.skills?.length > 0 && (
                    <section>
                        <h3>Skills</h3>
                        <ul className="rp-skill-list">
                            {r.skills.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </section>
                )}
                {r.certifications?.length > 0 && (
                    <section>
                        <h3>Certifications</h3>
                        <ul className="rp-plain-list">
                            {r.certifications.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                    </section>
                )}
                {r.languages?.length > 0 && (
                    <section>
                        <h3>Languages</h3>
                        <ul className="rp-plain-list">
                            {r.languages.map((l, i) => <li key={i}>{l}</li>)}
                        </ul>
                    </section>
                )}
            </aside>

            {/* Main column */}
            <main className="rp-modern-main">
                {r.summary && (
                    <section>
                        <h3>Summary</h3>
                        <p>{r.summary}</p>
                    </section>
                )}
                {r.experience?.length > 0 && (
                    <section>
                        <h3>Experience</h3>
                        {r.experience.map((exp, i) => (
                            <div key={i} className="rp-entry">
                                <div className="rp-entry-header">
                                    <strong>{exp.position}</strong>
                                    <span className="rp-date">{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ''}</span>
                                </div>
                                <div className="rp-entry-sub">{exp.company}</div>
                                {exp.description && <p className="rp-entry-desc">{exp.description}</p>}
                            </div>
                        ))}
                    </section>
                )}
                {r.education?.length > 0 && (
                    <section>
                        <h3>Education</h3>
                        {r.education.map((edu, i) => (
                            <div key={i} className="rp-entry">
                                <div className="rp-entry-header">
                                    <strong>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</strong>
                                    <span className="rp-date">{edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ''}</span>
                                </div>
                                <div className="rp-entry-sub">{edu.institution}</div>
                            </div>
                        ))}
                    </section>
                )}
                {r.projects?.length > 0 && (
                    <section>
                        <h3>Projects</h3>
                        {r.projects.map((proj, i) => (
                            <div key={i} className="rp-entry">
                                <div className="rp-entry-header">
                                    <strong>
                                        {proj.link ? <Link href={proj.link}>{proj.title}</Link> : proj.title}
                                    </strong>
                                    {proj.technologies?.length > 0 && (
                                        <span className="rp-tech">{proj.technologies.join(' · ')}</span>
                                    )}
                                </div>
                                {proj.description && <p className="rp-entry-desc">{proj.description}</p>}
                            </div>
                        ))}
                    </section>
                )}
            </main>
        </div>
    </div>
);

// ── Classic Template ──────────────────────────────────────────────────────────
const ClassicTemplate = ({ r }) => (
    <div className="rp-classic" id="resume-preview-print">
        <header className="rp-classic-header">
            <h1>{r.name || 'Your Name'}</h1>
            <div className="rp-classic-contact">
                {[r.email, r.phone, r.location, r.linkedin, r.github, r.website]
                    .filter(Boolean)
                    .join('  |  ')}
            </div>
        </header>

        {r.summary && (
            <section className="rp-classic-section">
                <h2>PROFESSIONAL SUMMARY</h2>
                <p>{r.summary}</p>
            </section>
        )}

        {r.experience?.length > 0 && (
            <section className="rp-classic-section">
                <h2>EXPERIENCE</h2>
                {r.experience.map((exp, i) => (
                    <div key={i} className="rp-classic-entry">
                        <div className="rp-classic-entry-top">
                            <span><strong>{exp.position}</strong> — {exp.company}</span>
                            <span>{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ''}</span>
                        </div>
                        {exp.description && <p>{exp.description}</p>}
                    </div>
                ))}
            </section>
        )}

        {r.education?.length > 0 && (
            <section className="rp-classic-section">
                <h2>EDUCATION</h2>
                {r.education.map((edu, i) => (
                    <div key={i} className="rp-classic-entry">
                        <div className="rp-classic-entry-top">
                            <span><strong>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</strong> — {edu.institution}</span>
                            <span>{edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ''}</span>
                        </div>
                    </div>
                ))}
            </section>
        )}

        {r.skills?.length > 0 && (
            <section className="rp-classic-section">
                <h2>SKILLS</h2>
                <p>{r.skills.join(' · ')}</p>
            </section>
        )}

        {r.projects?.length > 0 && (
            <section className="rp-classic-section">
                <h2>PROJECTS</h2>
                {r.projects.map((proj, i) => (
                    <div key={i} className="rp-classic-entry">
                        <div className="rp-classic-entry-top">
                            <strong>{proj.title}</strong>
                            {proj.technologies?.length > 0 && <span>{proj.technologies.join(', ')}</span>}
                        </div>
                        {proj.description && <p>{proj.description}</p>}
                    </div>
                ))}
            </section>
        )}

        {r.certifications?.length > 0 && (
            <section className="rp-classic-section">
                <h2>CERTIFICATIONS</h2>
                <p>{r.certifications.join(' · ')}</p>
            </section>
        )}

        {r.languages?.length > 0 && (
            <section className="rp-classic-section">
                <h2>LANGUAGES</h2>
                <p>{r.languages.join(' · ')}</p>
            </section>
        )}
    </div>
);

// ── Minimal Template ──────────────────────────────────────────────────────────
const MinimalTemplate = ({ r }) => (
    <div className="rp-minimal" id="resume-preview-print">
        <header className="rp-minimal-header">
            <h1>{r.name || 'Your Name'}</h1>
            <div className="rp-minimal-contact">
                {r.email && <span>{r.email}</span>}
                {r.phone && <span>{r.phone}</span>}
                {r.location && <span>{r.location}</span>}
                {r.linkedin && <span>{r.linkedin}</span>}
                {r.github && <span>{r.github}</span>}
            </div>
        </header>

        {r.summary && (
            <section className="rp-minimal-section">
                <p className="rp-minimal-summary">{r.summary}</p>
            </section>
        )}

        {r.experience?.length > 0 && (
            <section className="rp-minimal-section">
                <h2>Experience</h2>
                {r.experience.map((exp, i) => (
                    <div key={i} className="rp-minimal-entry">
                        <div className="rp-minimal-entry-row">
                            <span className="rp-minimal-role">{exp.position} <span className="rp-minimal-at">at</span> {exp.company}</span>
                            <span className="rp-minimal-date">{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ''}</span>
                        </div>
                        {exp.description && <p>{exp.description}</p>}
                    </div>
                ))}
            </section>
        )}

        {r.education?.length > 0 && (
            <section className="rp-minimal-section">
                <h2>Education</h2>
                {r.education.map((edu, i) => (
                    <div key={i} className="rp-minimal-entry">
                        <div className="rp-minimal-entry-row">
                            <span className="rp-minimal-role">{edu.degree}{edu.field ? `, ${edu.field}` : ''} — {edu.institution}</span>
                            <span className="rp-minimal-date">{edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ''}</span>
                        </div>
                    </div>
                ))}
            </section>
        )}

        {r.skills?.length > 0 && (
            <section className="rp-minimal-section">
                <h2>Skills</h2>
                <div className="rp-minimal-tags">
                    {r.skills.map((s, i) => <span key={i} className="rp-minimal-tag">{s}</span>)}
                </div>
            </section>
        )}

        {r.projects?.length > 0 && (
            <section className="rp-minimal-section">
                <h2>Projects</h2>
                {r.projects.map((proj, i) => (
                    <div key={i} className="rp-minimal-entry">
                        <div className="rp-minimal-entry-row">
                            <span className="rp-minimal-role">{proj.title}</span>
                            {proj.technologies?.length > 0 && (
                                <span className="rp-minimal-date">{proj.technologies.join(', ')}</span>
                            )}
                        </div>
                        {proj.description && <p>{proj.description}</p>}
                    </div>
                ))}
            </section>
        )}

        {(r.certifications?.length > 0 || r.languages?.length > 0) && (
            <section className="rp-minimal-section rp-minimal-two-col">
                {r.certifications?.length > 0 && (
                    <div>
                        <h2>Certifications</h2>
                        <ul>{r.certifications.map((c, i) => <li key={i}>{c}</li>)}</ul>
                    </div>
                )}
                {r.languages?.length > 0 && (
                    <div>
                        <h2>Languages</h2>
                        <ul>{r.languages.map((l, i) => <li key={i}>{l}</li>)}</ul>
                    </div>
                )}
            </section>
        )}
    </div>
);

// ── Router ────────────────────────────────────────────────────────────────────
const ResumePreview = ({ resume }) => {
    const props = { r: resume };
    switch (resume.template) {
        case 'classic': return <ClassicTemplate {...props} />;
        case 'minimal': return <MinimalTemplate {...props} />;
        default: return <ModernTemplate {...props} />;
    }
};

export default ResumePreview;
