import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const AuthModal = ({ initialMode = 'login', onClose }) => {
    const { login, socialLogin, forgotPassword, resetPassword } = useContext(AuthContext);

    const [mode, setMode] = useState(initialMode); // 'login' | 'signup' | 'forgot' | 'reset'

    // Form inputs
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [resetTokenInput, setResetTokenInput] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
            const token = res.data.token || res.data.accessToken;
            login(token, res.data);
            onClose();
        } catch (err) {
            setErrorMsg(err.response?.data || 'Invalid email or password credentials');
        } finally {
            setLoading(false);
        }
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/auth/signup`, { name, email, password });
            // Auto login after signup
            const loginRes = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
            const token = loginRes.data.token || loginRes.data.accessToken;
            login(token, loginRes.data);
            onClose();
        } catch (err) {
            setErrorMsg(err.response?.data || 'Registration failed. Email may already be in use.');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialAuth = async (provider) => {
        setLoading(true);
        setErrorMsg('');
        try {
            await socialLogin(provider);
            onClose();
        } catch (err) {
            setErrorMsg(`Social login via ${provider} failed.`);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setLoading(true);
        try {
            const res = await forgotPassword(email);
            setSuccessMsg(res.message + (res.resetToken ? ` Token: ${res.resetToken}` : ''));
            if (res.resetToken) {
                setResetTokenInput(res.resetToken);
                setTimeout(() => setMode('reset'), 2000);
            }
        } catch (err) {
            setErrorMsg(err.response?.data || 'Failed to request password reset.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPasswordSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setLoading(true);
        try {
            await resetPassword(resetTokenInput, newPassword);
            setSuccessMsg('Password has been reset successfully. Please sign in with your new password.');
            setTimeout(() => setMode('login'), 2000);
        } catch (err) {
            setErrorMsg(err.response?.data || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal fade show d-block backdrop-blur" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '450px' }}>
                <div className="modal-content bg-dark text-light border-secondary shadow-lg">
                    {/* Header */}
                    <div className="modal-header border-secondary px-4 py-3">
                        <h5 className="modal-title fw-bold text-gradient">
                            {mode === 'login' && 'Sign In to ApexMarket'}
                            {mode === 'signup' && 'Create Your Account'}
                            {mode === 'forgot' && 'Forgot Password'}
                            {mode === 'reset' && 'Reset Password'}
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    {/* Body */}
                    <div className="modal-body p-4">
                        {errorMsg && <div className="alert alert-danger py-2 small">{errorMsg}</div>}
                        {successMsg && <div className="alert alert-success py-2 small">{successMsg}</div>}

                        {/* MODE: LOGIN */}
                        {mode === 'login' && (
                            <form onSubmit={handleLoginSubmit}>
                                <div className="mb-3">
                                    <label className="form-label small text-muted">Email Address</label>
                                    <input type="email" className="form-control bg-dark text-light border-secondary" placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="mb-2">
                                    <label className="form-label small text-muted d-flex justify-content-between">
                                        <span>Password</span>
                                        <button type="button" className="btn btn-link p-0 small text-decoration-none" onClick={() => setMode('forgot')}>Forgot?</button>
                                    </label>
                                    <input type="password" className="form-control bg-dark text-light border-secondary" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>

                                <button type="submit" className="btn btn-gradient-primary w-100 py-2 fw-semibold rounded-pill my-3" disabled={loading}>
                                    {loading ? 'Signing In...' : 'Sign In'}
                                </button>

                                {/* Social Login Divider */}
                                <div className="d-flex align-items-center my-3">
                                    <hr className="flex-grow-1 border-secondary" />
                                    <span className="px-2 small text-muted">or continue with</span>
                                    <hr className="flex-grow-1 border-secondary" />
                                </div>

                                {/* Social Buttons */}
                                <div className="d-flex gap-2 mb-3">
                                    <button type="button" className="btn btn-outline-secondary w-50 d-flex align-items-center justify-content-center gap-2" onClick={() => handleSocialAuth('Google')}>
                                        <i className="bi bi-google text-danger"></i> Google
                                    </button>
                                    <button type="button" className="btn btn-outline-secondary w-50 d-flex align-items-center justify-content-center gap-2" onClick={() => handleSocialAuth('Facebook')}>
                                        <i className="bi bi-facebook text-primary"></i> Facebook
                                    </button>
                                </div>

                                <div className="text-center small text-muted mt-3">
                                    Don't have an account? <button type="button" className="btn btn-link p-0 text-primary fw-semibold" onClick={() => setMode('signup')}>Sign Up</button>
                                </div>
                            </form>
                        )}

                        {/* MODE: SIGNUP */}
                        {mode === 'signup' && (
                            <form onSubmit={handleSignupSubmit}>
                                <div className="mb-3">
                                    <label className="form-label small text-muted">Full Name</label>
                                    <input type="text" className="form-control bg-dark text-light border-secondary" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small text-muted">Email Address</label>
                                    <input type="email" className="form-control bg-dark text-light border-secondary" placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small text-muted">Password</label>
                                    <input type="password" className="form-control bg-dark text-light border-secondary" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>

                                <button type="submit" className="btn btn-gradient-primary w-100 py-2 fw-semibold rounded-pill my-3" disabled={loading}>
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </button>

                                <div className="text-center small text-muted mt-3">
                                    Already have an account? <button type="button" className="btn btn-link p-0 text-primary fw-semibold" onClick={() => setMode('login')}>Sign In</button>
                                </div>
                            </form>
                        )}

                        {/* MODE: FORGOT PASSWORD */}
                        {mode === 'forgot' && (
                            <form onSubmit={handleForgotPasswordSubmit}>
                                <p className="small text-muted mb-3">Enter your registered email address and we will generate a password reset authorization token.</p>
                                <div className="mb-3">
                                    <label className="form-label small text-muted">Email Address</label>
                                    <input type="email" className="form-control bg-dark text-light border-secondary" placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>

                                <button type="submit" className="btn btn-primary w-100 py-2 rounded-pill my-3" disabled={loading}>
                                    {loading ? 'Requesting...' : 'Request Reset Token'}
                                </button>

                                <div className="text-center small text-muted">
                                    Remembered your password? <button type="button" className="btn btn-link p-0 text-primary" onClick={() => setMode('login')}>Sign In</button>
                                </div>
                            </form>
                        )}

                        {/* MODE: RESET PASSWORD */}
                        {mode === 'reset' && (
                            <form onSubmit={handleResetPasswordSubmit}>
                                <div className="mb-3">
                                    <label className="form-label small text-muted">Reset Token</label>
                                    <input type="text" className="form-control bg-dark text-light border-secondary" value={resetTokenInput} onChange={(e) => setResetTokenInput(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small text-muted">New Password</label>
                                    <input type="password" className="form-control bg-dark text-light border-secondary" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                                </div>

                                <button type="submit" className="btn btn-success w-100 py-2 rounded-pill my-3" disabled={loading}>
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
