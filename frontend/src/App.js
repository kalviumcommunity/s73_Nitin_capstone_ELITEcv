import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import './App.css';

// Protected route — redirect to login if not authenticated
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="full-page-loader"><div className="spinner" /></div>;
    return user ? children : <Navigate to="/login" replace />;
};

// Public route — redirect to dashboard if already logged in
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="full-page-loader"><div className="spinner" /></div>;
    return user ? <Navigate to="/dashboard" replace /> : children;
};

// Simple 404
const NotFound = () => (
    <div className="not-found">
        <h1>404</h1>
        <p>Page not found.</p>
        <a href="/">Go home</a>
    </div>
);

function AppRoutes() {
    return (
        <Routes>
            {/* Public landing */}
            <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />

            {/* Auth */}
            <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            {/* Protected */}
            <Route path="/dashboard"    element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/builder/:id"  element={<PrivateRoute><ResumeBuilder /></PrivateRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

function App() {
    return (
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
            <AuthProvider>
                <Router>
                    <AppRoutes />
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3500,
                            style: { borderRadius: '10px', fontSize: '0.9rem' },
                        }}
                    />
                </Router>
            </AuthProvider>
        </GoogleOAuthProvider>
    );
}

export default App;
