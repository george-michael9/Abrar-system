import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import styles from './Login.module.css'; // Reusing Login styles for consistency

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register, googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        const fullName = `${formData.firstName} ${formData.lastName}`.trim();
        const result = await register(formData.email, formData.password, fullName);

        if (result.success) {
            alert('Registration successful! Please wait for admin approval.');
            navigate('/dashboard'); // Go to dashboard or login
        } else {
            setError(result.error);
            const form = e.target;
            form.classList.add(styles.shake);
            setTimeout(() => form.classList.remove(styles.shake), 500);
        }
        setLoading(false);
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
                        <span className="text-gradient">Abrar System</span>
                    </h1>
                    <p className={styles.subtitle}>Create New Account</p>
                </div>

                <GlassCard className={styles.loginCard} padding="lg">
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <h2 className={styles.formTitle}>Register</h2>
                        <p className={styles.formSubtitle}>Enter your details below</p>

                        {error && (
                            <div className={styles.errorAlert}>
                                <span className={styles.errorIcon}>⚠️</span>
                                {error}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <GlassInput
                                label="First Name"
                                name="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                icon="👤"
                            />
                            <GlassInput
                                label="Last Name"
                                name="lastName"
                                type="text"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                icon="👤"
                            />
                        </div>

                        <GlassInput
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                            icon="📧"
                            autoComplete="email"
                        />

                        <GlassInput
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Choose a password"
                            required
                            icon="🔒"
                            autoComplete="new-password"
                        />

                        <GlassInput
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            required
                            icon="🔒"
                            autoComplete="new-password"
                        />

                        <GlassButton
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            loading={loading}
                        >
                            Create Account
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
                            Already have an account?{' '}
                            <span
                                onClick={() => navigate('/login')}
                                style={{ color: '#4facfe', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Login here
                            </span>
                        </div>
                    </form>
                </GlassCard>
            </div>
        </div>
    );
};

export default Register;
