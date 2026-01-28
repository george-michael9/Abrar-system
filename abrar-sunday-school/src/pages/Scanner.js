import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { getMakhdoumById, getEvents, addScore } from '../services/mockApi';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import styles from './Scanner.module.css';

const Scanner = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [scanning, setScanning] = useState(false);
    const [scannedData, setScannedData] = useState(null);
    const [makhdoum, setMakhdoum] = useState(null);
    const [actionType, setActionType] = useState('score'); // Default to score, no toggle
    const [score, setScore] = useState('');
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState('');

    useEffect(() => {
        const allEvents = getEvents();
        setEvents(allEvents.filter(e => e.status === 'upcoming' || e.status === 'ongoing'));
        if (allEvents.length > 0) {
            setSelectedEvent(allEvents[0].eventId);
        }
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (scanning) {
            const scanner = new Html5QrcodeScanner('qr-reader', {
                qrbox: {
                    width: 250,
                    height: 250,
                },
                fps: 5,
            });

            scanner.render(success, error);

            function success(result) {
                scanner.clear();
                setScanning(false);
                handleScan(result);
            }

            function error(err) {
                console.warn(err);
            }

            return () => {
                scanner.clear().catch(error => {
                    console.error("Failed to clear scanner", error);
                });
            };
        }
        // eslint-disable-next-line
    }, [scanning]);

    const handleScan = (data) => {
        if (data) {
            setScannedData(data);
            // Extract makhdoumId from QR code data
            // Format: "MKD-XXXXXX:makhdoumId"
            try {
                const parts = data.split(':');
                if (parts.length >= 2) {
                    const makhdoumId = parseInt(parts[1]);
                    const child = getMakhdoumById(makhdoumId);
                    if (child) {
                        setMakhdoum(child);
                    } else {
                        alert('Child not found!');
                    }
                }
            } catch (e) {
                alert('Invalid QR Code!');
            }
        }
    };

    const handleRecordAttendance = () => {
        if (!makhdoum || !selectedEvent) {
            alert('Please select an event');
            return;
        }

        // In a real app, this would save to database
        const attendanceRecord = {
            eventId: selectedEvent,
            makhdoumId: makhdoum.makhdoumId,
            scannedBy: user.userId,
            scannedAt: new Date().toISOString()
        };

        console.log('Attendance Recorded:', attendanceRecord);
        alert(`✅ Attendance recorded for ${makhdoum.fullName}!`);

        // Reset for next scan
        setMakhdoum(null);
        setScannedData(null);
    };

    const handleRecordScore = () => {
        if (!makhdoum || !selectedEvent || !score) {
            alert('Please enter a score');
            return;
        }

        const scoreRecord = {
            eventId: parseInt(selectedEvent),
            makhdoumId: makhdoum.makhdoumId,
            score: parseInt(score),
            enteredBy: user.userId,
            // We need to find the team ID for this makhdoum's class
            // But for now, let's just save the core info. 
            // The Leaderboard will need to look up the team based on the makhdoum's class -> team mapping.
        };

        addScore(scoreRecord);

        console.log('Score Recorded:', scoreRecord);
        alert(`✅ Score ${score} recorded for ${makhdoum.fullName}!`);

        // Reset for next scan
        setMakhdoum(null);
        setScannedData(null);
        setScore('');
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div>
                        <h1 className={styles.pageTitle}>
                            <span className="text-gradient">QR Scanner</span>
                        </h1>
                        <p className={styles.pageSubtitle}>Scan child QR codes for attendance and scoring</p>
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
                {/* Action Type Selection */}
                {/* Action Type Selection - REMOVED per request */}
                {/* 
                <div className={styles.actionSelector}>
                    ...
                </div> 
                */}

                {/* Event Selection */}
                <GlassCard className={styles.eventCard}>
                    <label className={styles.label}>Select Event:</label>
                    <select
                        value={selectedEvent}
                        onChange={(e) => setSelectedEvent(e.target.value)}
                        className={styles.select}
                    >
                        {events.map(event => (
                            <option key={event.eventId} value={event.eventId}>
                                {event.eventName} - {new Date(event.startDate).toLocaleDateString()}
                            </option>
                        ))}
                    </select>
                </GlassCard>

                {/* Scanner Section */}
                <div className={styles.scannerSection}>
                    {!scanning && !makhdoum && (
                        <GlassButton
                            variant="primary"
                            size="lg"
                            onClick={() => setScanning(true)}
                            className={styles.scanButton}
                        >
                            📷 Start Scanning
                        </GlassButton>
                    )}

                    {scanning && (
                        <GlassCard className={styles.scanner}>
                            <div id="qr-reader"></div>
                            <GlassButton
                                variant="danger"
                                onClick={() => setScanning(false)}
                                className={styles.stopButton}
                            >
                                ⏹️ Stop Scanner
                            </GlassButton>
                        </GlassCard>
                    )}

                    {/* Scanned Child Info */}
                    {makhdoum && (
                        <GlassCard className={styles.childCard}>
                            <div className={styles.childHeader}>
                                <div className={styles.avatar}>
                                    {makhdoum.fullName.charAt(0)}
                                </div>
                                <div>
                                    <h2 className={styles.childName}>{makhdoum.fullName}</h2>
                                    <p className={styles.childCode}>{makhdoum.makhdoumCode}</p>
                                </div>
                            </div>

                            {/* Attendance Action Removed */}

                            {actionType === 'score' && (
                                <div className={styles.actionSection}>
                                    <label className={styles.label}>Enter Score:</label>
                                    <input
                                        type="number"
                                        value={score}
                                        onChange={(e) => setScore(e.target.value)}
                                        placeholder="Enter score..."
                                        className={styles.scoreInput}
                                        min="0"
                                        max="100"
                                    />
                                    <div className={styles.actionButtons}>
                                        <GlassButton
                                            variant="success"
                                            onClick={handleRecordScore}
                                            fullWidth
                                        >
                                            ✅ Record Score
                                        </GlassButton>
                                        <GlassButton
                                            variant="ghost"
                                            onClick={() => { setMakhdoum(null); setScannedData(null); setScore(''); }}
                                            fullWidth
                                        >
                                            ❌ Cancel
                                        </GlassButton>
                                    </div>
                                </div>
                            )}
                        </GlassCard>
                    )}
                </div>

                {/* Instructions */}
                <GlassCard className={styles.instructions}>
                    <h3 className={styles.instructionsTitle}>📖 How to Use</h3>
                    <ol className={styles.instructionsList}>
                        <li>Select the event you're recording for</li>
                        <li>Click "Start Scanning" and point camera at child's QR code</li>
                        <li>Review the child's information</li>
                        <li>Record attendance or enter and submit score</li>
                    </ol>
                </GlassCard>
            </div>
        </div>
    );
};

export default Scanner;
