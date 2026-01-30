import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Html5Qrcode } from 'html5-qrcode';
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
    const [actionType, setActionType] = useState('score');
    const [score, setScore] = useState('');
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState('');
    const [html5QrCode, setHtml5QrCode] = useState(null);

    // Load events
    useEffect(() => {
        const loadEvents = async () => {
            try {
                const allEvents = await getEvents();
                const activeEvents = allEvents.filter(e => e.status === 'upcoming' || e.status === 'ongoing');
                setEvents(activeEvents);
                if (activeEvents.length > 0) {
                    setSelectedEvent(activeEvents[0].eventId);
                }
            } catch (e) {
                console.error("Error loading events", e);
            }
        };
        loadEvents();
        // eslint-disable-next-line
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().catch(console.error);
            }
        };
    }, [html5QrCode]);

    const startScanning = async () => {
        // Ensure element exists (it should, because we render it always now)
        const element = document.getElementById("qr-reader");
        if (!element) {
            alert("Error: Scanner element not found. Please reload.");
            return;
        }

        setScanning(true);

        try {
            isProcessingRef.current = false; // Reset processing flag

            // If instance exists, reuse it or creating new one if it was cleared?
            // Safer to create new one or ensure old one is stopped.
            // But Html5Qrcode throws if we create two on same ID. 
            // We should check if we have one.

            let qrCode = html5QrCode;
            if (!qrCode) {
                qrCode = new Html5Qrcode("qr-reader");
                setHtml5QrCode(qrCode);
            }

            const config = { fps: 10, qrbox: { width: 250, height: 250 } };

            try {
                await qrCode.start(
                    { facingMode: "environment" },
                    config,
                    onScanSuccess,
                    onScanFailure
                );
            } catch (backCamError) {
                console.warn("Back camera failed, trying default...", backCamError);
                await qrCode.start(
                    { facingMode: "user" },
                    config,
                    onScanSuccess,
                    onScanFailure
                );
            }

        } catch (err) {
            console.error("Error starting scanner:", err);
            setScanning(false);
            // If "already started" error, we might just ignore it
            if (!err.message?.includes("already started")) {
                alert(`Camera Error: ${err.message || "Could not start camera"}`);
            }
        }
    };

    const stopScanning = async () => {
        if (html5QrCode) {
            try {
                if (html5QrCode.isScanning) {
                    await html5QrCode.stop();
                }
                // We do NOT clear setHtml5QrCode here so we can reuse the instance?
                // Or we clear it to be safe. Let's clear it to allow fresh start.
                // Actually properly handling clear() is key.
                await html5QrCode.clear();
                setHtml5QrCode(null);
            } catch (err) {
                console.error("Error stopping scanner:", err);
            }
        }
        setScanning(false);
    };

    const isProcessingRef = React.useRef(false);

    const onScanSuccess = (decodedText) => {
        // Prevent multiple fires
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        handleScan(decodedText);

        // Stop scanning immediately to prevent loop
        // We do not wait for handleScan to finish before stopping
        stopScanning();
    };

    const onScanFailure = (error) => {
        // console.warn(error);
    };

    const handleScan = async (data) => {
        if (data) {
            setScannedData(data);
            try {
                const parts = data.split(':');
                if (parts.length >= 2) {
                    const makhdoumId = parts[1].trim();
                    const child = await getMakhdoumById(makhdoumId);
                    if (child) {
                        setMakhdoum(child);
                    } else {
                        alert('Child not found!');
                        // Do NOT reset processing ref here. 
                        // User must restart scanner manually to try again.
                        // This prevents infinite loop if they are still holding the code up.
                    }
                } else {
                    alert('Invalid QR format');
                    // Do NOT reset processing ref.
                }
            } catch (e) {
                console.error(e);
                alert('Invalid QR Code!');
                // Do NOT reset processing ref.
            }
        }
    };

    const handleRecordScore = async () => {
        if (!makhdoum || !selectedEvent || !score) {
            alert('Please enter a score');
            return;
        }

        const scoreRecord = {
            eventId: selectedEvent,
            makhdoumId: makhdoum.makhdoumId,
            score: parseInt(score),
            enteredBy: user.userId,
        };

        try {
            await addScore(scoreRecord);
            alert(`✅ Score ${score} recorded for ${makhdoum.fullName}!`);

            // Reset logic
            setMakhdoum(null);
            setScannedData(null);
            setScore('');
        } catch (e) {
            console.error("Error recording score", e);
            alert("Failed to record score");
        }
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

                <div className={styles.scannerSection}>
                    {/* BUTTONS SECTION */}
                    {!scanning && !makhdoum && (
                        <GlassButton
                            variant="primary"
                            size="lg"
                            onClick={startScanning}
                            className={styles.scanButton}
                        >
                            📷 Start Scanning
                        </GlassButton>
                    )}

                    {scanning && (
                        <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
                            <GlassButton
                                variant="danger"
                                onClick={stopScanning}
                                className={styles.stopButton}
                                style={{ marginBottom: '1rem' }}
                            >
                                ⏹️ Stop Scanner
                            </GlassButton>
                        </div>
                    )}

                    {/* ALWAYS RENDERED SCANNER DIV, HIDDEN IF NOT SCANNING */}
                    {/* This prevents DOM race conditions */}
                    <div
                        style={{
                            width: '100%',
                            maxWidth: '500px',
                            display: scanning ? 'block' : 'none',
                            margin: '0 auto'
                        }}
                    >
                        <GlassCard className={styles.scanner}>
                            <div id="qr-reader" style={{ width: '100%' }}></div>
                        </GlassCard>
                    </div>

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
