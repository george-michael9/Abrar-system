import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getClasses, getEvents, getTeamsByEvent, getClassById } from '../services/mockApi';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import styles from './Classes.module.css';

const Classes = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [teams, setTeams] = useState([]);

    useEffect(() => {
        setEvents(getEvents());
        setClasses(getClasses());
    }, []);

    useEffect(() => {
        if (selectedEventId) {
            setTeams(getTeamsByEvent(parseInt(selectedEventId)));
        } else {
            setTeams([]);
        }
    }, [selectedEventId]);

    const TeamGroup = ({ team }) => (
        <section className={styles.teamSection}>
            <div className={styles.teamHeader}>
                <div className={styles.teamIcon} style={{ background: team.primaryColor }}>
                    {team.icon}
                </div>
                <div>
                    <h2 className={styles.teamName}>{team.teamName}</h2>
                    <p className={styles.teamMotto}>{team.motto}</p>
                </div>
            </div>
            <div className={styles.grid}>
                {team.classIds.map(classId => {
                    const cls = getClassById(classId);
                    if (!cls) return null;
                    return <ClassCard key={cls.classId} cls={cls} />;
                })}
            </div>
        </section>
    );

    const ClassCard = ({ cls }) => (
        <GlassCard className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={styles.icon}>📚</div>
                <div className={styles.ageBadge}>{cls.ageGroup}</div>
            </div>
            <h3 className={styles.className}>{cls.className}</h3>
            <p className={styles.description}>{cls.description}</p>
            <div className={styles.details}>
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

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div>
                        <h1 className={styles.pageTitle}>
                            <span className="text-gradient">Classes & Teams</span>
                        </h1>
                        <p className={styles.pageSubtitle}>Manage class groupings for events</p>
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
                    <div className={styles.filterGroup}>
                        <label className={styles.label}>View by Event:</label>
                        <select
                            className={styles.select}
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                        >
                            <option value="">All Classes (Static)</option>
                            {events.map(event => (
                                <option key={event.eventId} value={event.eventId}>
                                    {event.eventName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {selectedEventId ? (
                    <div className={styles.teamsList}>
                        {teams.length > 0 ? (
                            teams.map(team => (
                                <TeamGroup key={team.teamId} team={team} />
                            ))
                        ) : (
                            <p className={styles.empty}>No teams defined for this event.</p>
                        )}
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {classes.map(cls => (
                            <ClassCard key={cls.classId} cls={cls} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Classes;
