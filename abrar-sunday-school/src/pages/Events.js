import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEvents } from '../services/mockApi';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import styles from './Events.module.css';

const Events = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);

    useEffect(() => {
        loadEvents();
        // eslint-disable-next-line
    }, []);

    const loadEvents = () => {
        setEvents(getEvents());
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
                    <GlassButton variant="primary" onClick={() => alert('Add New Event - Feature coming soon!')}>
                        ➕ Add New Event
                    </GlassButton>
                </div>

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
                                {event.maxCapacity && (
                                    <div className={styles.detail}>
                                        <span>👥</span>
                                        <span>Max Capacity: {event.maxCapacity}</span>
                                    </div>
                                )}
                            </div>
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
        </div>
    );
};

export default Events;
