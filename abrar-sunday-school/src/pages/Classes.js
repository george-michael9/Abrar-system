import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getClasses, getTeams, getClassById, getTeamById } from '../services/mockApi';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import styles from './Classes.module.css';

const Classes = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        loadClasses();
        // eslint-disable-next-line
    }, []);

    const loadClasses = () => {
        const allClasses = getClasses();
        setClasses(allClasses);
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div>
                        <h1 className={styles.pageTitle}>
                            <span className="text-gradient">Classes</span>
                        </h1>
                        <p className={styles.pageSubtitle}>Manage Sunday School classes</p>
                    </div>
                    <div className={styles.headerActions}>
                        <GlassButton variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                            🏠 Dashboard
                        </GlassButton>
                        <GlassButton variant="danger" size="sm" onClick={logout}>
                            🚪 Logout
                        </GlassButton>
                    </div>
                </div>
            </header>

            <div className={styles.container}>
                <div className={styles.toolbar}>
                    <GlassButton variant="primary" onClick={() => alert('Add New Class - Feature coming soon!')}>
                        ➕ Add New Class
                    </GlassButton>
                </div>

                <div className={styles.grid}>
                    {classes.map(cls => {
                        const team = getTeamById(cls.teamId);
                        return (
                            <GlassCard key={cls.classId} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.icon}>📚</div>
                                    {team && (
                                        <div className={styles.teamBadge} style={{
                                            background: team.primaryColor,
                                            boxShadow: `0 0 15px ${team.primaryColor}50`
                                        }}>
                                            {team.icon} {team.teamName}
                                        </div>
                                    )}
                                </div>
                                <h3 className={styles.className}>{cls.className}</h3>
                                <p className={styles.description}>{cls.description}</p>
                                <div className={styles.details}>
                                    <div className={styles.detail}>
                                        <span>👶</span>
                                        Age: {cls.ageGroup}
                                    </div>
                                    <div className={styles.detail}>
                                        <span>📅</span>
                                        {cls.scheduleDay} - {cls.scheduleTime}
                                    </div>
                                    <div className={styles.detail}>
                                        <span>📍</span>
                                        {cls.location}
                                    </div>
                                </div>
                            </GlassCard>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Classes;
