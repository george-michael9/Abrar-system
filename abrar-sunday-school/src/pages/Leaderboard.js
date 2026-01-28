import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getScores, getTeams, getMakhdoumeen, updateTeam, getClasses, getEvents } from '../services/mockApi';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import Modal from '../components/Modal';
import styles from './Leaderboard.module.css';

const Leaderboard = () => {
    const { logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [teamScores, setTeamScores] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [allClasses, setAllClasses] = useState([]);
    const [editFormData, setEditFormData] = useState({
        teamName: '',
        icon: '',
        classIds: []
    });

    useEffect(() => {
        const allEvents = getEvents();
        // Filter for relevant events if needed, for now show all upcoming/ongoing/completed
        const relevantEvents = allEvents.filter(e => e.status !== 'cancelled' && e.status !== 'draft');
        setEvents(relevantEvents);

        if (relevantEvents.length > 0) {
            // Default to the most recent ongoing or upcoming event, or just the first one
            const activeEvent = relevantEvents.find(e => e.status === 'ongoing') || relevantEvents.find(e => e.status === 'upcoming') || relevantEvents[0];
            setSelectedEventId(activeEvent.eventId);
        }
    }, []);

    useEffect(() => {
        if (selectedEventId) {
            calculateScores();
        }
    }, [selectedEventId]);

    useEffect(() => {
        if (selectedEventId) {
            // Set up an interval to refresh scores every 30 seconds for live updates
            const interval = setInterval(calculateScores, 30000);
            return () => clearInterval(interval);
        }
    }, [selectedEventId]);

    const calculateScores = () => {
        const scores = getScores();
        const teams = getTeams();
        const makhdoumeen = getMakhdoumeen();

        // Initialize scores for each team
        const scoresMap = {};
        teams.forEach(team => {
            scoresMap[team.teamId] = {
                ...team,
                totalScore: 0
            };
        });

        // Tally up scores
        // Tally up scores
        scores.forEach(scoreRecord => {
            // Filter by selected event
            if (parseInt(scoreRecord.eventId) !== parseInt(selectedEventId)) {
                return;
            }

            const makhdoum = makhdoumeen.find(m => m.makhdoumId === scoreRecord.makhdoumId);
            if (makhdoum) {
                // Find team for this makhdoum based on class
                const team = teams.find(t => t.classIds && t.classIds.includes(makhdoum.classId));
                if (team) {
                    scoresMap[team.teamId].totalScore += scoreRecord.score;
                }
            }
        });

        // Convert to array and sort
        const sortedTeams = Object.values(scoresMap).sort((a, b) => b.totalScore - a.totalScore);
        setTeamScores(sortedTeams);
        setTeamScores(sortedTeams);
    };

    const handleEditTeam = (team) => {
        setEditingTeam(team);
        setEditFormData({
            teamName: team.teamName,
            icon: team.icon,
            classIds: team.classIds || []
        });
        setAllClasses(getClasses());
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

    const handleSaveTeam = (e) => {
        e.preventDefault();
        if (editingTeam) {
            updateTeam(editingTeam.teamId, editFormData);
            setIsEditModalOpen(false);
            setEditingTeam(null);
            calculateScores(); // Refresh
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
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.pageTitle}>
                        <span className="text-gradient">Team Leaderboard</span>
                    </h1>
                    <p className={styles.pageSubtitle}>Live standings for all teams</p>

                    <div style={{ marginTop: '1rem' }}>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                            Select Event:
                        </label>
                        {events.length > 0 ? (
                            <select
                                value={selectedEventId}
                                onChange={(e) => setSelectedEventId(e.target.value)}
                                className={styles.glassSelect}
                            >
                                {events.map(event => (
                                    <option key={event.eventId} value={event.eventId}>
                                        {event.eventId === selectedEventId ? '👉 ' : ''}{event.eventName} ({event.status})
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div style={{ color: '#F59E0B' }}>No active events found</div>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <GlassButton variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                        🏠 Dashboard
                    </GlassButton>
                    <GlassButton variant="danger" size="sm" onClick={logout}>
                        🚪 Logout
                    </GlassButton>
                </div>
            </header >

            <div className={styles.leaderboardGrid}>
                {teamScores.map((team, index) => (
                    <GlassCard key={team.teamId} className={styles.rankCard}>
                        <div className={`${styles.rank} ${styles[`rank${index + 1}`]}`}>
                            #{index + 1}
                        </div>
                        <div className={styles.teamIcon} style={{ background: team.primaryColor, overflow: 'hidden' }}>
                            {team.icon.startsWith('data:image') || team.icon.startsWith('http') ? (
                                <img src={team.icon} alt={team.teamName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                team.icon
                            )}
                        </div>
                        <div className={styles.teamInfo}>
                            <h2 className={styles.teamName}>
                                {team.teamName}
                                {isAdmin() && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEditTeam(team); }}
                                        style={{ marginLeft: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                                    >
                                        ✏️
                                    </button>
                                )}
                            </h2>
                            <p className={styles.teamMotto}>{team.motto}</p>
                            <div style={{ fontSize: '0.7rem', color: '#ccc', marginTop: '0.2rem' }}>
                                Assigned: {team.classIds && team.classIds.length > 0 ? team.classIds.length + ' classes' : 'None'}
                            </div>
                        </div>
                        <div className={styles.score}>
                            <span className={styles.scoreValue}>{team.totalScore}</span>
                            <span className={styles.scoreLabel}>Points</span>
                        </div>
                    </GlassCard>
                ))}
            </div>
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
        </div >
    );
};

export default Leaderboard;
