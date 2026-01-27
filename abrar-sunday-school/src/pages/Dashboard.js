import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStatistics, getClasses, getMakhdoumeen, getEvents, getClassesByKhadem, getMakhdoumeenByClass } from '../services/mockApi';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import styles from './Dashboard.module.css';

const Dashboard = () => {
    const { user, isAdmin, isAmin, isKhadem, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [upcomingEvents, setUpcomingEvents] = useState([]);

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = () => {
        if (isKhadem()) {
            // Khadems see their assigned classes only
            const assignedClasses = getClassesByKhadem(user.userId);
            let totalChildren = 0;
            assignedClasses.forEach(cls => {
                const children = getMakhdoumeenByClass(cls.classId);
                totalChildren += children.length;
            });

            setStats({
                myClasses: assignedClasses.length,
                myChildren: totalChildren
            });
        } else {
            // Admin and Amin see full stats
            setStats(getStatistics());
        }

        const events = getEvents();
        setUpcomingEvents(events.filter(e => e.status === 'upcoming').slice(0, 3));
    };

    const StatCard = ({ title, value, icon, gradient }) => (
        <GlassCard className={styles.statCard}>
            <div className={styles.statIcon} style={{
                background: gradient
            }}>
                {icon}
            </div>
            <div className={styles.statContent}>
                <div className={styles.statValue}>{value}</div>
                <div className={styles.statTitle}>{title}</div>
            </div>
        </GlassCard>
    );

    const QuickActionButton = ({ icon, label, onClick }) => (
        <GlassButton variant="ghost" onClick={onClick} className={styles.quickAction}>
            <span className={styles.quickActionIcon}>{icon}</span>
            <span>{label}</span>
        </GlassButton>
    );

    return (
        <div className={styles.dashboard}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div>
                        <h1 className={styles.welcomeTitle}>
                            Welcome back, <span className="text-gradient">{user?.fullName}</span>
                        </h1>
                        <p className={styles.headerSubtitle}>
                            {user?.role} Dashboard
                        </p>
                    </div>
                    <div className={styles.headerActions}>
                        <GlassButton variant="ghost" size="sm" onClick={() => navigate('/profile')}>
                            👤 Profile
                        </GlassButton>
                        <GlassButton variant="danger" size="sm" onClick={logout}>
                            🚪 Logout
                        </GlassButton>
                    </div>
                </div>
            </header>

            <div className={styles.container}>
                {/* Statistics Cards */}
                <section className={styles.statsSection}>
                    <div className={styles.statsGrid}>
                        {(isAdmin() || isAmin()) && (
                            <>
                                <StatCard
                                    title="Total Users"
                                    value={stats?.totalUsers || 0}
                                    icon="👥"
                                    gradient="linear-gradient(135deg, var(--color-primary-cyan), var(--color-secondary-purple))"
                                />
                                <StatCard
                                    title="Total Classes"
                                    value={stats?.totalClasses || 0}
                                    icon="📚"
                                    gradient="linear-gradient(135deg, var(--color-secondary-purple), var(--color-accent-magenta))"
                                />
                                <StatCard
                                    title="Total Children"
                                    value={stats?.totalMakhdoumeen || 0}
                                    icon="👶"
                                    gradient="linear-gradient(135deg, var(--color-success-green), #059669)"
                                />
                                <StatCard
                                    title="Upcoming Events"
                                    value={stats?.upcomingEvents || 0}
                                    icon="📅"
                                    gradient="linear-gradient(135deg, var(--color-warning-amber), #F97316)"
                                />
                            </>
                        )}
                        {isKhadem() && (
                            <>
                                <StatCard
                                    title="My Classes"
                                    value={stats?.myClasses || 0}
                                    icon="📚"
                                    gradient="linear-gradient(135deg, var(--color-primary-cyan), var(--color-secondary-purple))"
                                />
                                <StatCard
                                    title="My Children"
                                    value={stats?.myChildren || 0}
                                    icon="👶"
                                    gradient="linear-gradient(135deg, var(--color-success-green), #059669)"
                                />
                            </>
                        )}
                    </div>
                </section>

                {/* Quick Actions */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Quick Actions</h2>
                    <div className={styles.quickActionsGrid}>
                        {(isAdmin() || isAmin()) && (
                            <>
                                <QuickActionButton
                                    icon="👶"
                                    label="Add Child"
                                    onClick={() => navigate('/makhdoumeen')}
                                />
                                <QuickActionButton
                                    icon="📚"
                                    label="Manage Classes"
                                    onClick={() => navigate('/classes')}
                                />
                                <QuickActionButton
                                    icon="📅"
                                    label="View Events"
                                    onClick={() => navigate('/events')}
                                />
                                {isAdmin() && (
                                    <QuickActionButton
                                        icon="👥"
                                        label="Manage Users"
                                        onClick={() => navigate('/users')}
                                    />
                                )}
                            </>
                        )}
                        {isKhadem() && (
                            <>
                                <QuickActionButton
                                    icon="👶"
                                    label="My Children"
                                    onClick={() => navigate('/makhdoumeen')}
                                />
                                <QuickActionButton
                                    icon="📚"
                                    label="My Classes"
                                    onClick={() => navigate('/classes')}
                                />
                            </>
                        )}
                    </div>
                </section>

                {/* Upcoming Events */}
                {upcomingEvents.length > 0 && (
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Upcoming Events</h2>
                            <GlassButton variant="ghost" size="sm" onClick={() => navigate('/events')}>
                                View All →
                            </GlassButton>
                        </div>
                        <div className={styles.eventsGrid}>
                            {upcomingEvents.map(event => (
                                <GlassCard key={event.eventId} className={styles.eventCard}>
                                    <div className={styles.eventHeader}>
                                        <span className={styles.eventType}>{event.eventType}</span>
                                        <span className={styles.eventStatus}>{event.status}</span>
                                    </div>
                                    <h3 className={styles.eventTitle}>{event.eventName}</h3>
                                    <p className={styles.eventDescription}>{event.description}</p>
                                    <div className={styles.eventDetails}>
                                        <div className={styles.eventDetail}>
                                            <span>📅</span>
                                            <span>{new Date(event.startDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className={styles.eventDetail}>
                                            <span>📍</span>
                                            <span>{event.location}</span>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
