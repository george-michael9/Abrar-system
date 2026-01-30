import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import styles from './Login.module.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, googleLogin, resetPassword } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);


        const result = await login(username, password, rememberMe);


        if (result.success) {

            navigate('/dashboard');
        } else {
            console.error('Login failed:', result.error);
            setError(result.error);
            // Shake animation
            const form = e.target;
            form.classList.add(styles.shake);
            setTimeout(() => form.classList.remove(styles.shake), 500);
        }
        setLoading(false);
    };

    const handleResetPassword = async () => {
        const email = window.prompt("Please enter your email address to reset your password:");
        if (email) {
            if (!/\S+@\S+\.\S+/.test(email)) {
                alert("Please enter a valid email address.");
                return;
            }
            const result = await resetPassword(email);
            if (result.success) {
                alert("Password reset email sent! Check your inbox.");
            } else {
                alert("Error: " + result.error);
            }
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.particles}>
                {[...Array(20)].map((_, i) => (
                    <div key={i} className={styles.particle} style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 3}s`,
                        animationDuration: `${3 + Math.random() * 2}s`
                    }} />
                ))}
            </div>

            <div className={styles.content}>
                <div className={styles.logoSection}>
                    <div className={styles.logoCircle}>
                        <img src="/church-logo.png" alt="Logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                    </div>
                    <h1 className={styles.title}>
                        <span className="text-gradient">Osret Abrar</span>
                    </h1>
                    <p className={styles.subtitle}>Management System</p>
                </div>

                <GlassCard className={styles.loginCard} padding="lg">
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <h2 className={styles.formTitle}>Welcome Back</h2>
                        <p className={styles.formSubtitle}>Sign in to continue to your account</p>

                        {error && (
                            <div className={styles.errorAlert}>
                                <span className={styles.errorIcon}>⚠️</span>
                                {error}
                            </div>
                        )}

                        <GlassInput
                            label="Email"
                            type="email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your email"
                            required
                            icon="📧"
                            autoComplete="email"
                        />

                        <GlassInput
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            icon="🔒"
                            autoComplete="current-password"
                        />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'white' }}>
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    style={{ cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '0.9rem' }}>Stay logged in</span>
                            </label>

                            <span
                                onClick={handleResetPassword}
                                style={{ color: '#ccc', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                Forgot Password?
                            </span>
                        </div>

                        <GlassButton
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            loading={loading}
                        >
                            Sign In
                        </GlassButton>

                        <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0' }}>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
                            <span style={{ padding: '0 0.5rem', color: '#ccc', fontSize: '0.9rem' }}>OR</span>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
                        </div>

                        <button
                            type="button"
                            onClick={async () => {
                                const result = await googleLogin();
                                if (result.success) {
                                    navigate('/dashboard');
                                } else {
                                    setError(result.error);
                                }
                            }}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'white',
                                color: '#333',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'transform 0.2s',
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" style={{ width: '20px', height: '20px' }} />
                            Sign in with Google
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '1rem', color: '#ccc' }}>
                            Don't have an account?{' '}
                            <span
                                onClick={() => navigate('/register')}
                                style={{ color: '#4facfe', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Register here
                            </span>
                        </div>
                    </form>
                </GlassCard>

                <p className={styles.footer}>
                    © 2026 Sunday School System. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Login;
