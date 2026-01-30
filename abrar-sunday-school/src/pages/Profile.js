import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUser } from '../services/mockApi';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import styles from './Profile.module.css';

const Profile = () => {
    const { user, logout, updateCurrentUser } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        phone: '',
        photoUrl: '', // Added photoUrl
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                username: user.username || '',
                email: user.email || '',
                phone: user.phone || '',
                photoUrl: user.photoUrl || '', // Added photoUrl
                password: '',
                confirmPassword: ''
            });
        }
    }, [user]);

    const getRoleColor = (role) => {
        const colors = {
            Admin: '#EF4444',
            Amin: '#8B5CF6',
            Khadem: '#10B981'
        };
        return colors[role] || '#6B7280';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 500000) { // 500KB limit
                alert("Image is too large! Please choose an image smaller than 500KB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, photoUrl: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        // Validation
        if (formData.password && formData.password !== formData.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }

        const updates = {
            fullName: formData.fullName,
            username: formData.username,
            email: formData.email,
            phone: formData.phone,
            photoUrl: formData.photoUrl
        };

        if (formData.password) {
            // Note: Updating password in Firebase Auth requires separate API call (updatePassword)
            // For now, we only update the user document. If we need Auth update, we need to add that.
            // But let's stick to Firestore doc update for now as per current scope.
            updates.password = formData.password;
        }

        try {
            // Update in Firestore
            const updatedUser = await updateUser(user.userId, updates);

            // Update in session (AuthContext)
            // We need to merge existing user with updates
            updateCurrentUser({ ...user, ...updates });

            setIsEditing(false);

            alert('Profile updated successfully!');
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile: " + error.message);
        }
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <GlassButton variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                        ← Back to Dashboard
                    </GlassButton>
                    <h1 className={styles.pageTitle}>
                        <span className="text-gradient">My Profile</span>
                    </h1>
                </div>
                <div>
                    <GlassButton variant="danger" size="sm" onClick={logout}>
                        🚪 Logout
                    </GlassButton>
                </div>
            </header>

            <div className={styles.container}>
                <GlassCard className={styles.profileCard}>
                    <div className={styles.profileHeader}>
                        <div className={styles.avatar} style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: user?.photoUrl ? 'transparent' : undefined }}>
                            {user?.photoUrl ? (
                                <img src={user.photoUrl} alt={user.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                user?.fullName?.charAt(0)
                            )}
                        </div>
                        <div className={styles.profileInfo}>
                            <h2 className={styles.fullName}>{user?.fullName}</h2>
                            <div
                                className={styles.roleBadge}
                                style={{
                                    background: getRoleColor(user?.role),
                                    boxShadow: `0 0 15px ${getRoleColor(user?.role)}50`
                                }}
                            >
                                {user?.role}
                            </div>
                        </div>
                    </div>

                    {!isEditing ? (
                        <>
                            <div className={styles.detailsGrid}>
                                <div className={styles.detailSection}>
                                    <h3 className={styles.sectionTitle}>Account Information</h3>
                                    <div className={styles.detailItem}>
                                        <label>Username</label>
                                        <p>{user?.username}</p>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <label>User ID</label>
                                        <p>#{user?.userId}</p>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <label>Last Login</label>
                                        <p>{user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</p>
                                    </div>
                                </div>

                                <div className={styles.detailSection}>
                                    <h3 className={styles.sectionTitle}>Contact Details</h3>
                                    <div className={styles.detailItem}>
                                        <label>Email</label>
                                        <p>{user?.email || 'Not provided'}</p>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <label>Phone</label>
                                        <p>{user?.phone || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.actions}>
                                <GlassButton variant="primary" onClick={() => setIsEditing(true)}>
                                    ✏️ Edit Profile
                                </GlassButton>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleSave} className={styles.editForm}>
                            <div className={styles.detailsGrid}>
                                <div className={styles.detailSection}>
                                    <h3 className={styles.sectionTitle}>Edit Information</h3>

                                    <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                                        <div style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '50%',
                                            background: 'rgba(255,255,255,0.1)',
                                            margin: '0 auto 1rem',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '2px solid rgba(255,255,255,0.2)'
                                        }}>
                                            {formData.photoUrl ? (
                                                <img src={formData.photoUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <span style={{ fontSize: '2rem' }}>📷</span>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id="photo-upload"
                                            onChange={handleImageUpload}
                                            style={{ display: 'none' }}
                                        />
                                        <label
                                            htmlFor="photo-upload"
                                            className="glass-button"
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: 'rgba(255,255,255,0.1)',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                display: 'inline-block'
                                            }}
                                        >
                                            Upload Photo
                                        </label>
                                    </div>

                                    <GlassInput
                                        label="Full Name"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <GlassInput
                                        label="Username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <GlassInput
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                    <GlassInput
                                        label="Phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className={styles.detailSection}>
                                    <h3 className={styles.sectionTitle}>Change Password</h3>
                                    <GlassInput
                                        label="New Password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Leave blank to keep current"
                                    />
                                    <GlassInput
                                        label="Confirm Password"
                                        name="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>

                            <div className={styles.actions} style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                                <GlassButton type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </GlassButton>
                                <GlassButton type="submit" variant="success">
                                    💾 Save Changes
                                </GlassButton>
                            </div>
                        </form>
                    )}
                </GlassCard>
            </div>
        </div>
    );
};

export default Profile;
