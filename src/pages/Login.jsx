import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const HARDCODED_PASS = 'sveltee@Admin!123';

    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Simple client-side check (trimmed to ignore accidental spaces)
        if (password.trim() === HARDCODED_PASS) {
            // Success: Set local storage flag
            sessionStorage.setItem('isAdmin', 'true');
            navigate('/admin');
        } else {
            console.log('Login attempt failed. Typed:', password); // Debug log
            setLoading(false);
            setError("Incorrect password. Please try again.");
        }
    };

    return (
        <div className="login-container">
            {/* Background Decor */}
            <div className="bg-decor bg-orb-1"></div>
            <div className="bg-decor bg-orb-2"></div>


            <div className="login-card animate-fade-in">
                <h1 className="login-title">
                    Admin Login
                </h1>

                {error && (
                    <div className="login-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="login-form">
                    <input
                        type="password"
                        placeholder="Enter Admin Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="login-input"
                        required
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="login-button"
                    >
                        {loading ? 'Verifying...' : 'Access Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
