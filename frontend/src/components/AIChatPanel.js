import React, { useState, useRef, useEffect } from 'react';
import {
    X, Send, Sparkles, Bot, User, CheckCircle,
    Edit3, Briefcase, ChevronDown, Trash2,
} from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import './AIChatPanel.css';

// ── Suggested starter prompts ─────────────────────────────────────────────────
const STARTERS = [
    { icon: '🎯', text: 'Review my resume for this role and tell me what to improve' },
    { icon: '✍️', text: 'Rewrite my professional summary for this target role' },
    { icon: '💼', text: 'What skills am I missing for this job?' },
    { icon: '📈', text: 'Improve my most recent work experience description' },
    { icon: '🔍', text: 'Is my resume ATS-friendly? What should I change?' },
    { icon: '🚀', text: 'What are the top 3 things I should fix right now?' },
];

// ── Action pill component ─────────────────────────────────────────────────────
const ActionPill = ({ action, onApply, applied }) => {
    const labels = {
        rewrite_summary:    '✨ Apply improved summary',
        add_skills:         `➕ Add ${action.skills?.length || ''} skills`,
        rewrite_experience: '✨ Apply to experience',
        rewrite_project:    '✨ Apply to project',
    };

    return (
        <button
            className={`action-pill ${applied ? 'applied' : ''}`}
            onClick={() => !applied && onApply(action)}
            disabled={applied}
        >
            {applied ? <CheckCircle size={13} /> : <Edit3 size={13} />}
            {applied ? 'Applied!' : (labels[action.type] || 'Apply suggestion')}
        </button>
    );
};

// ── Single message bubble ─────────────────────────────────────────────────────
const MessageBubble = ({ msg, onApplyAction }) => {
    const isUser = msg.role === 'user';

    return (
        <div className={`msg-row ${isUser ? 'msg-user' : 'msg-ai'}`}>
            {!isUser && (
                <div className="msg-avatar ai-avatar">
                    <Bot size={14} />
                </div>
            )}
            <div className="msg-content">
                <div className={`msg-bubble ${isUser ? 'bubble-user' : 'bubble-ai'}`}>
                    {msg.content.split('\n').map((line, i) =>
                        line.trim() ? <p key={i}>{line}</p> : <br key={i} />
                    )}
                </div>
                {/* Action pills for AI messages */}
                {!isUser && msg.actions?.length > 0 && (
                    <div className="action-pills">
                        {msg.actions.map((action, i) => (
                            <ActionPill
                                key={i}
                                action={action}
                                applied={msg.appliedActions?.includes(i)}
                                onApply={(a) => onApplyAction(msg.id, i, a)}
                            />
                        ))}
                    </div>
                )}
                <span className="msg-time">{msg.time}</span>
            </div>
            {isUser && (
                <div className="msg-avatar user-avatar-chat">
                    <User size={14} />
                </div>
            )}
        </div>
    );
};

// ── Main chat panel ───────────────────────────────────────────────────────────
const AIChatPanel = ({ resume, onClose, onApplyAction }) => {
    const [messages, setMessages]       = useState([]);
    const [input, setInput]             = useState('');
    const [targetRole, setTargetRole]   = useState('');
    const [editingRole, setEditingRole] = useState(true);
    const [loading, setLoading]         = useState(false);
    const bottomRef                     = useRef(null);
    const inputRef                      = useRef(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    // Focus input when panel opens
    useEffect(() => {
        if (!editingRole) inputRef.current?.focus();
    }, [editingRole]);

    const now = () =>
        new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const sendMessage = async (text) => {
        const userText = (text || input).trim();
        if (!userText) return;
        if (!targetRole.trim()) {
            toast.error('Set your target role first so the AI can give relevant advice');
            setEditingRole(true);
            return;
        }

        const userMsg = {
            id: Date.now(),
            role: 'user',
            content: userText,
            time: now(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        // Build history for the API (only role + content, no UI fields)
        const history = [...messages, userMsg].map(m => ({
            role: m.role,
            content: m.content,
        }));

        try {
            const res = await API.post('/api/resume/ai-chat', {
                resume,
                messages: history,
                targetRole,
            });

            const aiMsg = {
                id: Date.now() + 1,
                role: 'assistant',
                content: res.data.reply,
                actions: res.data.actions || [],
                appliedActions: [],
                time: now(),
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || 'Something went wrong';
            console.error('Chat error:', err.response?.data);
            toast.error(errMsg);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: `Sorry, I ran into an error: ${errMsg}`,
                actions: [],
                appliedActions: [],
                time: now(),
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyAction = (msgId, actionIdx, action) => {
        // Mark as applied in the message
        setMessages(prev => prev.map(m =>
            m.id === msgId
                ? { ...m, appliedActions: [...(m.appliedActions || []), actionIdx] }
                : m
        ));
        // Bubble up to ResumeBuilder
        onApplyAction(action);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {
        setMessages([]);
        toast.success('Chat cleared');
    };

    return (
        <div className="ai-chat-panel">
            {/* ── Header ── */}
            <div className="chat-header">
                <div className="chat-header-left">
                    <div className="chat-header-icon"><Sparkles size={16} /></div>
                    <div>
                        <h2>AI Resume Coach</h2>
                        <p>Context-aware advice for your resume</p>
                    </div>
                </div>
                <div className="chat-header-actions">
                    {messages.length > 0 && (
                        <button className="btn-clear-chat" onClick={clearChat} title="Clear chat">
                            <Trash2 size={14} />
                        </button>
                    )}
                    <button className="chat-close" onClick={onClose}><X size={17} /></button>
                </div>
            </div>

            {/* ── Target Role Bar ── */}
            <div className="target-role-bar">
                <Briefcase size={14} className="role-icon" />
                {editingRole ? (
                    <div className="role-input-row">
                        <input
                            className="role-input"
                            value={targetRole}
                            onChange={e => setTargetRole(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && targetRole.trim() && setEditingRole(false)}
                            placeholder="e.g. Frontend Developer at Google, Data Scientist, Product Manager…"
                            autoFocus
                        />
                        <button
                            className="btn-set-role"
                            onClick={() => targetRole.trim() && setEditingRole(false)}
                            disabled={!targetRole.trim()}
                        >
                            Set
                        </button>
                    </div>
                ) : (
                    <div className="role-display" onClick={() => setEditingRole(true)}>
                        <span className="role-label">Target:</span>
                        <span className="role-value">{targetRole}</span>
                        <ChevronDown size={13} className="role-edit-icon" />
                    </div>
                )}
            </div>

            {/* ── Messages ── */}
            <div className="chat-messages">
                {messages.length === 0 && (
                    <div className="chat-empty">
                        <div className="chat-empty-icon"><Bot size={32} /></div>
                        <h3>Hi! I'm your AI resume coach.</h3>
                        <p>
                            {targetRole
                                ? `I can see your resume and know you're targeting: "${targetRole}". Ask me anything!`
                                : 'Set your target role above, then ask me anything about your resume.'}
                        </p>
                        {targetRole && (
                            <div className="starter-grid">
                                {STARTERS.map((s, i) => (
                                    <button
                                        key={i}
                                        className="starter-btn"
                                        onClick={() => sendMessage(s.text)}
                                    >
                                        <span>{s.icon}</span> {s.text}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {messages.map(msg => (
                    <MessageBubble
                        key={msg.id}
                        msg={msg}
                        onApplyAction={handleApplyAction}
                    />
                ))}

                {loading && (
                    <div className="msg-row msg-ai">
                        <div className="msg-avatar ai-avatar"><Bot size={14} /></div>
                        <div className="msg-content">
                            <div className="bubble-ai typing-bubble">
                                <span /><span /><span />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* ── Input ── */}
            <div className="chat-input-area">
                <textarea
                    ref={inputRef}
                    className="chat-input"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        targetRole
                            ? `Ask about your resume for ${targetRole}…`
                            : 'Set your target role first…'
                    }
                    rows={1}
                    disabled={loading}
                />
                <button
                    className="btn-send"
                    onClick={() => sendMessage()}
                    disabled={loading || !input.trim()}
                >
                    <Send size={16} />
                </button>
            </div>
            <p className="chat-hint">Press Enter to send · Shift+Enter for new line</p>
        </div>
    );
};

export default AIChatPanel;
