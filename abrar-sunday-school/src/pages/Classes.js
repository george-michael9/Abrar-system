import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getClasses, getEvents, getTeams, assignClassToTeam, getClassById, createClass, deleteClass, getMakhdoumeen, updateMakhdoum, getUsers, updateClass, getClassesByKhadem } from '../services/mockApi';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import Modal from '../components/Modal';
import styles from './Classes.module.css';

const Classes = () => {
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [allTeams, setAllTeams] = useState([]);
    const [displayTeams, setDisplayTeams] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newClass, setNewClass] = useState({
        className: '',
        description: '',
        ageGroup: '',
        scheduleDay: 'Sunday',
        scheduleTime: '09:00', // Default
        location: ''
    });
    const [allChildren, setAllChildren] = useState([]);
    const [selectedChildren, setSelectedChildren] = useState([]);
    const [allKhadems, setAllKhadems] = useState([]);
    const [assignKhademModalOpen, setAssignKhademModalOpen] = useState(false);
    const [selectedClassForAssignment, setSelectedClassForAssignment] = useState(null);
    const [selectedKhademsForClass, setSelectedKhademsForClass] = useState([]);

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = () => {
        setEvents(getEvents());
        setAllTeams(getTeams());
        if (isAdmin()) {
            setClasses(getClasses());
            // Filter users to get only Khadems
            const users = getUsers();
            setAllKhadems(users.filter(u => u.role === 'Khadem'));
        } else {
            // Khadem view - only show assigned classes
            setClasses(getClassesByKhadem(user.userId));
        }
        setAllChildren(getMakhdoumeen());
    };

    useEffect(() => {
        if (selectedEventId) {
            // For now, we are using global teams, so we might just filter if they were event specific
            // But since we moved to 4 main teams, we show them all
            setDisplayTeams(allTeams);
        } else {
            setDisplayTeams(allTeams);
        }
    }, [selectedEventId, allTeams]);

    const handleAssignTeam = (classId, teamId) => {
        if (!isAdmin()) return;
        assignClassToTeam(parseInt(teamId), classId);
        // Refresh data
        setAllTeams(getTeams());
        setClasses(getClasses()); // In case class data needs refresh (though relationships are in teams now mainly)
    };

    const handleAddClass = (e) => {
        e.preventDefault();
        if (!newClass.className || !newClass.ageGroup) {
            alert('Please fill in required fields');
            return;
        }

        const createdClass = createClass({
            ...newClass,
            category: 'Sunday School', // Default
            khadems: []
        });

        // Assign selected children to the new class
        selectedChildren.forEach(childId => {
            updateMakhdoum(childId, { classId: createdClass.classId });
        });

        setIsModalOpen(false);
        setNewClass({
            className: '',
            description: '',
            ageGroup: '',
            scheduleDay: 'Sunday',
            scheduleTime: '09:00',
            location: ''
        });
        setSelectedChildren([]);

        // Refresh data
        loadData();
    };

    const handleDeleteClass = (classId) => {
        if (window.confirm('Are you sure you want to delete this class?')) {
            deleteClass(classId);
            loadData();
        }
    };

    const openAssignKhademModal = (cls) => {
        setSelectedClassForAssignment(cls);
        setSelectedKhademsForClass(cls.khadems || []);
        setAssignKhademModalOpen(true);
    };

    const handleSaveKhademAssignment = () => {
        if (!selectedClassForAssignment) return;

        updateClass(selectedClassForAssignment.classId, {
            khadems: selectedKhademsForClass
        });

        setAssignKhademModalOpen(false);
        setSelectedClassForAssignment(null);
        setSelectedKhademsForClass([]);
        loadData();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewClass(prev => ({
            ...prev,
            [name]: value
        }));
    };

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
                {team.classIds && team.classIds.map(classId => {
                    const cls = getClassById(classId);
                    if (!cls) return null;
                    return <ClassCard key={cls.classId} cls={cls} hideAssign={true} />;
                })}
                {(!team.classIds || team.classIds.length === 0) && <p className={styles.empty}>No classes assigned</p>}
            </div>
        </section>
    );

    const ClassCard = ({ cls, hideAssign }) => {
        // Find current team for this class
        const currentTeam = allTeams.find(t => t.classIds && t.classIds.includes(cls.classId));

        return (
            <GlassCard className={styles.card}>
                <div className={styles.cardHeader}>
                    <div className={styles.icon}>📚</div>
                    <div className={styles.ageBadge}>{cls.ageGroup}</div>
                </div>
                <h3 className={styles.className}>{cls.className}</h3>
                <p className={styles.description}>{cls.description}</p>

                {/* Admin Assignment UI */}
                {isAdmin() && !hideAssign && (
                    <div className={styles.adminControls} style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <GlassButton variant="primary" size="sm" onClick={() => openAssignKhademModal(cls)} style={{ flex: 1, fontSize: '0.7rem' }}>
                                👥 Manage Khadems
                            </GlassButton>
                            <GlassButton variant="danger" size="sm" onClick={() => handleDeleteClass(cls.classId)} style={{ fontSize: '0.7rem' }}>
                                🗑️
                            </GlassButton>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#ccc', marginBottom: '0.5rem' }}>
                            Assigned: {cls.khadems && cls.khadems.length > 0
                                ? cls.khadems.map(kid => allKhadems.find(k => k.userId === kid)?.fullName).filter(Boolean).join(', ')
                                : 'None'}
                        </div>
                        <select
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: 'white',
                                borderRadius: '0.5rem'
                            }}
                            value={currentTeam ? currentTeam.teamId : ''}
                            onChange={(e) => handleAssignTeam(cls.classId, e.target.value)}
                        >
                            <option value="">Select Team...</option>
                            {allTeams.map(t => (
                                <option key={t.teamId} value={t.teamId}>{t.teamName}</option>
                            ))}
                        </select>
                    </div>
                )}

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
    };

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
                            className={styles.glassSelect}
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
                    {isAdmin() && (
                        <div style={{ alignSelf: 'flex-end' }}>
                            <GlassButton variant="primary" onClick={() => setIsModalOpen(true)}>
                                ➕ Add New Class
                            </GlassButton>
                        </div>
                    )}
                </div>

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Add New Class"
                >
                    <form onSubmit={handleAddClass} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <GlassInput
                            label="Class Name *"
                            name="className"
                            value={newClass.className}
                            onChange={handleInputChange}
                            placeholder="e.g. Grade 1"
                        />
                        <GlassInput
                            label="Age Group *"
                            name="ageGroup"
                            value={newClass.ageGroup}
                            onChange={handleInputChange}
                            placeholder="e.g. 6-7 years"
                        />
                        <GlassInput
                            label="Description"
                            name="description"
                            value={newClass.description}
                            onChange={handleInputChange}
                            placeholder="Class details..."
                        />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem', paddingLeft: '0.2rem' }}>Assign Children</label>
                            <div style={{
                                maxHeight: '150px',
                                overflowY: 'auto',
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '0.5rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                {allChildren.length > 0 ? (
                                    allChildren.map(child => (
                                        <div key={child.makhdoumId} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <input
                                                type="checkbox"
                                                id={`child-${child.makhdoumId}`}
                                                value={child.makhdoumId}
                                                checked={selectedChildren.includes(child.makhdoumId)}
                                                onChange={(e) => {
                                                    const id = parseInt(e.target.value);
                                                    if (e.target.checked) {
                                                        setSelectedChildren([...selectedChildren, id]);
                                                    } else {
                                                        setSelectedChildren(selectedChildren.filter(cId => cId !== id));
                                                    }
                                                }}
                                                style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                                            />
                                            <label htmlFor={`child-${child.makhdoumId}`} style={{ color: 'white', cursor: 'pointer', fontSize: '0.9rem' }}>
                                                {child.fullName} {child.classId ? '(Assigned)' : '(Unassigned)'}
                                            </label>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ color: '#ccc', textAlign: 'center', padding: '1rem' }}>No children found</p>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem', paddingLeft: '0.2rem' }}>Day</label>
                                <select
                                    name="scheduleDay"
                                    value={newClass.scheduleDay}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        color: 'white',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="Sunday" style={{ color: 'black' }}>Sunday</option>
                                    <option value="Friday" style={{ color: 'black' }}>Friday</option>
                                    <option value="Saturday" style={{ color: 'black' }}>Saturday</option>
                                </select>
                            </div>
                            <GlassInput
                                label="Time"
                                name="scheduleTime"
                                type="time"
                                value={newClass.scheduleTime}
                                onChange={handleInputChange}
                            />
                        </div>

                        <GlassInput
                            label="Location"
                            name="location"
                            value={newClass.location}
                            onChange={handleInputChange}
                            placeholder="e.g. Room 3B"
                        />

                        <GlassButton type="submit" variant="success" fullWidth>
                            Create Class
                        </GlassButton>
                    </form>
                </Modal>

                <Modal
                    isOpen={assignKhademModalOpen}
                    onClose={() => setAssignKhademModalOpen(false)}
                    title={`Assign Khadems to ${selectedClassForAssignment?.className || 'Class'}`}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{
                            maxHeight: '300px',
                            overflowY: 'auto',
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '0.5rem',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            {allKhadems.length > 0 ? (
                                allKhadems.map(khadem => (
                                    <div key={khadem.userId} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <input
                                            type="checkbox"
                                            id={`khadem-${khadem.userId}`}
                                            value={khadem.userId}
                                            checked={selectedKhademsForClass.includes(khadem.userId)}
                                            onChange={(e) => {
                                                const id = parseInt(e.target.value);
                                                if (e.target.checked) {
                                                    setSelectedKhademsForClass([...selectedKhademsForClass, id]);
                                                } else {
                                                    setSelectedKhademsForClass(selectedKhademsForClass.filter(kId => kId !== id));
                                                }
                                            }}
                                            style={{ marginRight: '0.8rem', cursor: 'pointer', transform: 'scale(1.2)' }}
                                        />
                                        <label htmlFor={`khadem-${khadem.userId}`} style={{ color: 'white', cursor: 'pointer', fontSize: '1rem', flex: 1 }}>
                                            {khadem.fullName}
                                            <div style={{ fontSize: '0.8rem', color: '#ccc' }}>@{khadem.username}</div>
                                        </label>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#ccc', textAlign: 'center', padding: '1rem' }}>No Khadems found</p>
                            )}
                        </div>
                        <GlassButton onClick={handleSaveKhademAssignment} variant="success" fullWidth>
                            Save Assignments
                        </GlassButton>
                    </div>
                </Modal>

                {selectedEventId ? (
                    <div className={styles.teamsList}>
                        {displayTeams.length > 0 ? (
                            displayTeams.map(team => (
                                <TeamGroup key={team.teamId} team={team} />
                            ))
                        ) : (
                            <p className={styles.empty}>No teams defined.</p>
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
