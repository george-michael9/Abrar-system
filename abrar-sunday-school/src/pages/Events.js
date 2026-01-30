import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../services/mockApi';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import Modal from '../components/Modal';
import styles from './Events.module.css';

const Events = () => {
    const { logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [newEvent, setNewEvent] = useState({
        eventName: '',
        eventType: 'service', // Default
        description: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        location: ''
    });

    useEffect(() => {
        loadEvents();
        if (location.state?.openAdd) {
            resetForm();
            setIsModalOpen(true);
            window.history.replaceState({}, document.title);
        }
        // eslint-disable-next-line
    }, [location]);

    const loadEvents = async () => {
        try {
            const data = await getEvents();
            setEvents(data);
        } catch (error) {
            console.error("Error loading events:", error);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            draft: '#6B7280',
            upcoming: '#10B981',
            ongoing: '#F59E0B',
            completed: '#3B82F6',
            cancelled: '#EF4444'
        };
        return colors[status] || colors.draft;
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        if (!newEvent.eventName || !newEvent.startDate) {
            alert('Please fill in required fields');
            return;
        }

        try {
            if (isEditing) {
                await updateEvent(selectedEventId, newEvent);
            } else {
                await createEvent(newEvent);
            }

            setIsModalOpen(false);
            resetForm();
            loadEvents();
        } catch (error) {
            console.error("Error saving event:", error);
            alert("Failed to save event");
        }
    };

    const resetForm = () => {
        setNewEvent({
            eventName: '',
            eventType: 'service',
            description: '',
            startDate: '',
            endDate: '',
            startTime: '',
            endTime: '',
            location: ''
        });
        setIsEditing(false);
        setSelectedEventId(null);
    };

    const handleEditClick = (event) => {
        setNewEvent({
            eventName: event.eventName,
            eventType: event.eventType,
            description: event.description || '',
            startDate: event.startDate ? event.startDate.split('T')[0] : '', // Handle optional date format
            endDate: event.endDate ? event.endDate.split('T')[0] : '',
            startTime: event.startTime || '',
            endTime: event.endTime || '',
            location: event.location || ''
        });
        setSelectedEventId(event.eventId);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            try {
                await deleteEvent(eventId);
                loadEvents();
            } catch (error) {
                console.error("Error deleting event:", error);
            }
        }
    };



    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEvent(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div>
                        <h1 className={styles.pageTitle}>
                            <span className="text-gradient">Events</span>
                        </h1>
                        <p className={styles.pageSubtitle}>Manage events, camps, and activities</p>
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
                    <GlassButton variant="primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
                        ➕ Add New Event
                    </GlassButton>
                </div>

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={isEditing ? "Edit Event" : "Add New Event"}
                >
                    <form onSubmit={handleAddEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <GlassInput
                            label="Event Name *"
                            name="eventName"
                            value={newEvent.eventName}
                            onChange={handleInputChange}
                            placeholder="e.g. Weekly Service"
                        />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <label style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem', paddingLeft: '0.2rem' }}>Event Type</label>
                            <select
                                name="eventType"
                                value={newEvent.eventType}
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
                                <option value="service" style={{ color: 'black' }}>Service</option>
                                <option value="camp" style={{ color: 'black' }}>Camp</option>
                                <option value="activity" style={{ color: 'black' }}>Activity</option>
                            </select>
                        </div>

                        <GlassInput
                            label="Description"
                            name="description"
                            value={newEvent.description}
                            onChange={handleInputChange}
                            placeholder="Event details..."
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <GlassInput
                                label="Start Date *"
                                name="startDate"
                                type="date"
                                value={newEvent.startDate}
                                onChange={handleInputChange}
                            />
                            <GlassInput
                                label="End Date"
                                name="endDate"
                                type="date"
                                value={newEvent.endDate}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <GlassInput
                                label="Start Time"
                                name="startTime"
                                type="time"
                                value={newEvent.startTime}
                                onChange={handleInputChange}
                            />
                            <GlassInput
                                label="End Time"
                                name="endTime"
                                type="time"
                                value={newEvent.endTime}
                                onChange={handleInputChange}
                            />
                        </div>

                        <GlassInput
                            label="Location"
                            name="location"
                            value={newEvent.location}
                            onChange={handleInputChange}
                            placeholder="e.g. Church Hall"
                        />


                        <GlassButton type="submit" variant="success" fullWidth>
                            {isEditing ? "Update Event" : "Create Event"}
                        </GlassButton>
                    </form>
                </Modal>

                <div className={styles.grid}>
                    {events.map(event => (
                        <GlassCard key={event.eventId} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.eventType}>{event.eventType}</div>
                                <div
                                    className={styles.status}
                                    style={{
                                        background: getStatusColor(event.status),
                                        boxShadow: `0 0 15px ${getStatusColor(event.status)}50`
                                    }}
                                >
                                    {event.status}
                                </div>
                            </div>

                            <h3 className={styles.eventTitle}>{event.eventName}</h3>
                            <p className={styles.description}>{event.description}</p>

                            <div className={styles.details}>
                                <div className={styles.detail}>
                                    <span>📅</span>
                                    <span>
                                        {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className={styles.detail}>
                                    <span>🕐</span>
                                    <span>{event.startTime} - {event.endTime}</span>
                                </div>
                                <div className={styles.detail}>
                                    <span>📍</span>
                                    <span>{event.location}</span>
                                </div>

                            </div>

                            {isAdmin() && (
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                                    <GlassButton variant="ghost" size="sm" onClick={() => handleEditClick(event)} style={{ flex: 1, justifyContent: 'center' }}>
                                        ✏️ Edit
                                    </GlassButton>
                                    <GlassButton variant="danger" size="sm" onClick={() => handleDeleteClick(event.eventId)} style={{ flex: 1, justifyContent: 'center' }}>
                                        🗑️ Delete
                                    </GlassButton>
                                </div>
                            )}

                        </GlassCard>
                    ))}
                </div>

                {events.length === 0 && (
                    <div className={styles.empty}>
                        <span className={styles.emptyIcon}>📅</span>
                        <p>No events found</p>
                    </div>
                )}
            </div>
        </div >
    );
};

export default Events;
