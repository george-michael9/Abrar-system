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
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = login(username, password);

        setTimeout(() => {
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error);
                // Shake animation
                const form = e.target;
                form.classList.add(styles.shake);
                setTimeout(() => form.classList.remove(styles.shake), 500);
            }
            setLoading(false);
        }, 800);
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
                        <span className={styles.logoIcon}>✝️</span>
                    </div>
                    <h1 className={styles.title}>
                        <span className="text-gradient">Abrar System</span>
                    </h1>
                    <p className={styles.subtitle}>Sunday School Management</p>
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
                            label="Username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                            icon="👤"
                            autoComplete="username"
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

                        <GlassButton
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            loading={loading}
                        >
                            Sign In
                        </GlassButton>

                        <div className={styles.demoCredentials}>
                            <p className={styles.demoTitle}>Demo Credentials:</p>
                            <div className={styles.demoGrid}>
                                <div className={styles.demoItem}>
                                    <strong>Admin:</strong> admin / admin123
                                </div>
                                <div className={styles.demoItem}>
                                    <strong>Amin:</strong> amin1 / amin123
                                </div>
                                <div className={styles.demoItem}>
                                    <strong>Khadem:</strong> khadem1 / khadem123
                                </div>
                            </div>
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
