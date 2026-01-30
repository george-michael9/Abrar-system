import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { getStatistics, getClasses, getMakhdoumeen, getEvents, getClassesByKhadem, getMakhdoumeenByClass, getTeams, getScores, updateTeam } from '../services/mockApi';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import Modal from '../components/Modal';
import styles from './Dashboard.module.css';

const Dashboard = () => {
    const { user, isAdmin, isAmin, isKhadem, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [leaderboardEventId, setLeaderboardEventId] = useState('');
    const [allEvents, setAllEvents] = useState([]);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [allClasses, setAllClasses] = useState([]);
    const [editFormData, setEditFormData] = useState({
        teamName: '',
        motto: '',
        icon: '',
        classIds: []
    });

    // Debug UI State
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        loadData();
    }, [user, leaderboardEventId]);

    const loadData = async () => {
        try {

            const statsData = await getStatistics();
            const classesData = await getClasses();
            const makhdoumeenData = await getMakhdoumeen();
            const eventsData = await getEvents();
            const teamData = await getTeams();
            const scoresData = await getScores();



            setStats(statsData);
            setAllEvents(eventsData.filter(e => e.status !== 'cancelled' && e.status !== 'draft'));

            // Determine which event to show
            let targetEventId = leaderboardEventId;
            if (!targetEventId) {
                const activeEvent = eventsData.find(e => e.status === 'ongoing') || eventsData.find(e => e.status === 'upcoming') || eventsData[0];
                if (activeEvent) {
                    targetEventId = activeEvent.eventId;
                    // Avoid infinite loop by checking if state needs update
                    if (leaderboardEventId === '') setLeaderboardEventId(activeEvent.eventId);
                }
            }

            setUpcomingEvents(eventsData.filter(e => e.status === 'upcoming').slice(0, 3));

            if (targetEventId) {
                // Calculate scores for this event
                const scoresMap = {};
                teamData.forEach(team => {
                    // Start with base team data
                    scoresMap[team.teamId] = {
                        ...team,
                        totalScore: 0,
                        classNames: []
                    };

                    // Resolve class names
                    if (team.classIds && Array.isArray(team.classIds)) {
                        scoresMap[team.teamId].classNames = team.classIds
                            .map(id => classesData.find(c => c.classId === id || c.id === id)?.className)
                            .filter(Boolean);
                    }
                });

                scoresData.forEach(scoreRecord => {
                    // Filter by active event
                    // Note: Ensure string/number comparison works
                    if (String(scoreRecord.eventId) === String(targetEventId)) {
                        const makhdoum = makhdoumeenData.find(m => String(m.makhdoumId) === String(scoreRecord.makhdoumId) || m.id === scoreRecord.makhdoumId);
                        if (makhdoum) {
                            const team = teamData.find(t => t.classIds && t.classIds.includes(makhdoum.classId));
                            if (team) {
                                scoresMap[team.teamId].totalScore += (Number(scoreRecord.score) || 0);
                            }
                        }
                    }
                });

                setLeaderboard(Object.values(scoresMap).sort((a, b) => b.totalScore - a.totalScore));
            } else {
                setLeaderboard([]);
            }

            if (isKhadem() && user?.userId) {
                // Khadems see their assigned classes only
                const assignedClasses = await getClassesByKhadem(user.userId);

                // Get children count for each class
                let totalChildren = 0;
                for (const cls of assignedClasses) {
                    const children = await getMakhdoumeenByClass(cls.classId || cls.id);
                    totalChildren += children.length;
                }

                setStats(prev => ({
                    ...prev,
                    myClasses: assignedClasses.length,
                    myChildren: totalChildren
                }));
            }
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        }
    };

    const StatCard = ({ title, value, icon, gradient, onClick }) => (
        <GlassCard
            className={styles.statCard}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default', transition: 'transform 0.2s' }}
            onMouseOver={(e) => onClick && (e.currentTarget.style.transform = 'translateY(-5px)')}
            onMouseOut={(e) => onClick && (e.currentTarget.style.transform = 'translateY(0)')}
        >
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

    const handleEditTeam = async (team) => {
        setEditingTeam(team);
        setEditFormData({
            teamName: team.teamName,
            motto: team.motto || '',
            icon: team.icon,
            classIds: team.classIds || []
        });
        const classes = await getClasses();
        setAllClasses(classes);
        setIsEditModalOpen(true);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditFormData(prev => ({ ...prev, icon: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveTeam = async (e) => {
        e.preventDefault();
        if (editingTeam) {
            await updateTeam(editingTeam.teamId, editFormData);
            setIsEditModalOpen(false);
            setEditingTeam(null);
            loadData(); // Refresh
        }
    };

    const handleClassToggle = (classId) => {
        const currentIds = editFormData.classIds;
        if (currentIds.includes(classId)) {
            setEditFormData(prev => ({ ...prev, classIds: currentIds.filter(id => id !== classId) }));
        } else {
            setEditFormData(prev => ({ ...prev, classIds: [...currentIds, classId] }));
        }
    };

    return (
        <div className={styles.dashboard}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div>
                        <h1 className={styles.welcomeTitle}>
                            <span style={{ marginRight: '1rem', width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', verticalAlign: 'middle', overflow: 'hidden' }}>
                                {user?.photoUrl ? (
                                    <img src={user.photoUrl} alt="Me" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    user?.fullName?.charAt(0)
                                )}
                            </span>
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
                                    onClick={() => navigate('/users')}
                                />
                                <StatCard
                                    title="Total Classes"
                                    value={stats?.totalClasses || 0}
                                    icon="📚"
                                    gradient="linear-gradient(135deg, var(--color-secondary-purple), var(--color-accent-magenta))"
                                    onClick={() => navigate('/classes')}
                                />
                                <StatCard
                                    title="Total Children"
                                    value={stats?.totalMakhdoumeen || 0}
                                    icon="👶"
                                    gradient="linear-gradient(135deg, var(--color-success-green), #059669)"
                                    onClick={() => navigate('/makhdoumeen')}
                                />
                                <StatCard
                                    title="Upcoming Events"
                                    value={stats?.upcomingEvents || 0}
                                    icon="📅"
                                    gradient="linear-gradient(135deg, var(--color-warning-amber), #F97316)"
                                    onClick={() => navigate('/events')}
                                />
                            </>
                        )}
                        {isKhadem() && (
                            <StatCard
                                title="My Children"
                                value={stats?.myChildren || 0}
                                icon="👶"
                                gradient="linear-gradient(135deg, var(--color-success-green), #059669)"
                                onClick={() => navigate('/makhdoumeen')}
                            />
                        )}
                    </div>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Quick Actions</h2>
                    <div className={styles.quickActionsGrid}>
                        {(isAdmin() || isAmin()) && (
                            <>
                                <QuickActionButton
                                    icon="👶"
                                    label="Add Child"
                                    onClick={() => navigate('/makhdoumeen', { state: { openAdd: true } })}
                                />
                                <QuickActionButton
                                    icon="📚"
                                    label="Create Class"
                                    onClick={() => navigate('/classes', { state: { openAdd: true } })}
                                />
                                <QuickActionButton
                                    icon="📅"
                                    label="Create Event"
                                    onClick={() => navigate('/events', { state: { openAdd: true } })}
                                />
                                <QuickActionButton
                                    icon="📷"
                                    label="QR Scanner"
                                    onClick={() => navigate('/scanner')}
                                />
                                <QuickActionButton
                                    icon="👥"
                                    label="Add User"
                                    onClick={() => navigate('/users', { state: { openAdd: true } })}
                                />
                                <QuickActionButton
                                    icon="🏆"
                                    label="Leaderboard"
                                    onClick={() => navigate('/leaderboard')}
                                />
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
                                <QuickActionButton
                                    icon="📷"
                                    label="QR Scanner"
                                    onClick={() => navigate('/scanner')}
                                />
                            </>
                        )}
                    </div>
                </section>

                {/* Leaderboard Widget - Visible to ALL */}
                {leaderboard.length > 0 && (
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>🏆 Team Standings</h2>
                                <select
                                    value={leaderboardEventId}
                                    onChange={(e) => setLeaderboardEventId(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className={styles.glassSelect}
                                    style={{ padding: '0.4rem 2.5rem 0.4rem 1rem', fontSize: '0.9rem' }}
                                >
                                    {allEvents.map(e => (
                                        <option key={e.eventId} value={e.eventId} style={{ color: 'black' }}>
                                            {e.eventName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <GlassButton variant="ghost" size="sm" onClick={() => navigate('/leaderboard')}>
                                Full Leaderboard →
                            </GlassButton>
                        </div>
                        <div className={styles.leaderboardList}>
                            {leaderboard.map((team, index) => (
                                <div key={team.teamId} className={styles.leaderboardItem}>
                                    {/* Rank Badge */}
                                    <div className={`${styles.rankBadge} ${styles['rank' + (index + 1 > 3 ? '4' : index + 1)]}`}>
                                        {index + 1}
                                    </div>

                                    {/* Team Icon */}
                                    <div style={{
                                        fontSize: '1.8rem',
                                        marginRight: '0.8rem',
                                        filter: 'drop-shadow(0 0 10px ' + team.primaryColor + ')'
                                    }}>
                                        {team.icon}
                                    </div>

                                    {/* Team Info */}
                                    <div className={styles.teamInfo}>
                                        <div className={styles.teamHeader}>
                                            <span className={styles.teamName}>
                                                {team.teamName}
                                                {isAdmin() && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleEditTeam(team); }}
                                                        style={{
                                                            marginLeft: '0.8rem',
                                                            background: 'rgba(255,255,255,0.1)',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            fontSize: '1rem',
                                                            padding: '0.3rem',
                                                            borderRadius: '4px',
                                                            color: 'white',
                                                            lineHeight: 1
                                                        }}
                                                        title="Edit Team"
                                                    >
                                                        ✏️
                                                    </button>
                                                )}
                                            </span>
                                        </div>
                                        <div className={styles.teamClasses}>
                                            {team.classNames && team.classNames.length > 0 ? (
                                                team.classNames.map((cls, i) => (
                                                    <span key={i} className={styles.classTag}>{cls}</span>
                                                ))
                                            ) : (
                                                <span style={{ fontStyle: 'italic', opacity: 0.5 }}>No classes assigned</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Score */}
                                    <div className={styles.teamScore} style={{ color: team.primaryColor }}>
                                        {team.totalScore}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Edit Team Modal */}
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    title="Edit Team"
                >
                    <form onSubmit={handleSaveTeam} className={styles.form}>
                        <GlassInput
                            label="Team Name"
                            value={editFormData.teamName}
                            onChange={(e) => setEditFormData({ ...editFormData, teamName: e.target.value })}
                            required
                        />
                        <GlassInput
                            label="Slogan (Motto)"
                            value={editFormData.motto}
                            onChange={(e) => setEditFormData({ ...editFormData, motto: e.target.value })}
                        />

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', color: 'white', marginBottom: '0.5rem' }}>Team Icon</label>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    background: editingTeam?.primaryColor,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    fontSize: '1.5rem',
                                    border: '2px solid rgba(255,255,255,0.2)'
                                }}>
                                    {editFormData.icon.startsWith('data:image') || editFormData.icon.startsWith('http') ? (
                                        <img src={editFormData.icon} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        editFormData.icon || '?'
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <input
                                        type="text"
                                        placeholder="Enter emoji or paste URL..."
                                        value={editFormData.icon}
                                        onChange={(e) => setEditFormData({ ...editFormData, icon: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'white',
                                            borderRadius: '8px',
                                            marginBottom: '0.5rem'
                                        }}
                                    />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        style={{ color: '#ccc', fontSize: '0.8rem' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', color: 'white', marginBottom: '0.5rem' }}>Assigned Classes</label>
                            <div style={{
                                maxHeight: '150px',
                                overflowY: 'auto',
                                background: 'rgba(255,255,255,0.05)',
                                padding: '0.5rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                {allClasses.map(cls => (
                                    <div key={cls.classId} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={editFormData.classIds.includes(cls.classId)}
                                            onChange={() => handleClassToggle(cls.classId)}
                                            style={{ marginRight: '0.5rem' }}
                                        />
                                        <span style={{ color: 'white' }}>{cls.className}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <GlassButton type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</GlassButton>
                            <GlassButton type="submit" variant="primary">Save Changes</GlassButton>
                        </div>
                    </form>
                </Modal>

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
