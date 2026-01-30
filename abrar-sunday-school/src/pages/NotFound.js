import React from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import styles from './Login.module.css'; // Reusing Login styles for background

const NotFound = () => {
    const navigate = useNavigate();

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
                <GlassCard padding="lg" style={{ textAlign: 'center', maxWidth: '500px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>4️⃣0️⃣4️⃣</div>
                    <h1 className={styles.title} style={{ marginBottom: '1rem' }}>
                        <span className="text-gradient">Page Not Found</span>
                    </h1>
                    <p style={{ color: '#ccc', marginBottom: '2rem', fontSize: '1.1rem' }}>
                        Oops! The page you are looking for does not exist or has been moved.
                    </p>
                    <GlassButton variant="primary" size="lg" onClick={() => navigate('/dashboard')}>
                        🏠 Go Home
                    </GlassButton>
                </GlassCard>
            </div>
        </div>
    );
};

export default NotFound;
