import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUsers, createUser, updateUser, deleteUser } from '../services/mockApi';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import Modal from '../components/Modal';
import styles from './Users.module.css';

const Users = () => {
    const { user: currentUser, logout, isAdmin, loading } = useAuth(); // Destructure loading
    const navigate = useNavigate();
    const location = useLocation();
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        role: 'Khadem', // Default role
        email: '',
        phone: ''
    });

    const [pendingRole, setPendingRole] = useState({}); // Map userId -> selectedRole

    useEffect(() => {
        if (loading) return; // Wait for auth to load
        // Check if user is admin
        if (!isAdmin()) {
            navigate('/dashboard');
            return;
        }
        loadUsers();
        if (location.state?.openAdd) {
            setIsModalOpen(true);
            window.history.replaceState({}, document.title);
        }
        // eslint-disable-next-line
    }, [location, currentUser, loading]); // Added loading to dependency

    const loadUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading users:", error);
        }
    };

    if (loading) return <div style={{ color: 'white', padding: '2rem' }}>Loading...</div>;

    const getRoleColor = (role) => {
        const colors = {
            Admin: '#EF4444',
            Amin: '#8B5CF6',
            Khadem: '#10B981',
            Pending: '#F59E0B'
        };
        return colors[role] || '#6B7280';
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.username || '',
                password: '', // Leave blank unless changing
                fullName: user.fullName || '',
                role: user.role || 'Khadem',
                email: user.email || '',
                phone: user.phone || ''
            });
        } else {
            setEditingUser(null);
            setFormData({
                username: '',
                password: '',
                fullName: '',
                role: 'Khadem',
                email: '',
                phone: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();



        // Validation
        if (!formData.username || !formData.fullName) {
            alert('Please fill in required fields');
            return;
        }
        if (!editingUser && !formData.password) {
            alert('Password is required for new users');
            return;
        }

        try {
            if (editingUser) {
                // Update
                const updates = { ...formData };
                if (!updates.password) delete updates.password; // Don't overwrite if blank

                await updateUser(editingUser.userId, updates);
                alert('User updated successfully!');
            } else {
                // Create
                await createUser(formData);
                alert('User created successfully!');
            }

            setIsModalOpen(false);
            setEditingUser(null);
            loadUsers();
        } catch (error) {
            console.error("Error saving user:", error);
            alert("Failed to save user: " + error.message);
        }
    };



    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleApprove = async (userId) => {
        try {
            const role = pendingRole[userId] || 'Khadem'; // Default to Khadem if not selected
            await updateUser(userId, { role });
            loadUsers();
            alert(`User approved as ${role}!`);
        } catch (error) {
            console.error("Error approving user:", error);
        }
    };

    const handleReject = async (userId) => {
        if (window.confirm('Are you sure you want to reject and delete this request?')) {
            try {
                await deleteUser(userId);
                loadUsers();
            } catch (error) {
                console.error("Error rejecting user:", error);
            }
        }
    };

    const pendingUsers = users.filter(u => u.role === 'Pending');
    const activeUsers = users.filter(u => u.role !== 'Pending');

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div>
                        <h1 className={styles.pageTitle}>
                            <span className="text-gradient">Users</span>
                        </h1>
                        <p className={styles.pageSubtitle}>Manage system users and roles</p>
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
                    <GlassButton variant="primary" onClick={() => handleOpenModal()}>
                        ➕ Add New User
                    </GlassButton>
                </div>

                {/* Pending Requests Section */}
                {pendingUsers.length > 0 && (
                    <div style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            🔔 Pending Requests ({pendingUsers.length})
                        </h2>
                        <div className={styles.grid}>
                            {pendingUsers.map(user => (
                                <GlassCard key={user.userId} className={styles.card} style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.avatar} style={{ background: user.photoUrl ? 'transparent' : '#F59E0B', overflow: 'hidden' }}>
                                            {user.photoUrl ? (
                                                <img src={user.photoUrl} alt={user.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                (user.fullName || '?').charAt(0)
                                            )}
                                        </div>
                                        <div
                                            className={styles.roleBadge}
                                            style={{
                                                background: getRoleColor(user.role),
                                                boxShadow: `0 0 15px ${getRoleColor(user.role)}50`
                                            }}
                                        >
                                            {user.role}
                                        </div>
                                    </div>
                                    <h3 className={styles.userName}>{user.fullName}</h3>
                                    <p className={styles.username}>@{user.username}</p>

                                    <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#ccc', marginBottom: '0.5rem' }}>
                                            Approve as:
                                        </label>
                                        <select
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem',
                                                marginBottom: '1rem',
                                                background: 'rgba(0,0,0,0.3)',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                color: 'white',
                                                borderRadius: '0.5rem'
                                            }}
                                            value={pendingRole[user.userId] || 'Khadem'}
                                            onChange={(e) => setPendingRole({ ...pendingRole, [user.userId]: e.target.value })}
                                        >
                                            <option value="Khadem">Khadem</option>
                                            {/* <option value="Amin">Amin</option> Disabled for now */}
                                            <option value="Admin">Admin</option>
                                        </select>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <GlassButton
                                                variant="success"
                                                size="sm"
                                                style={{ flex: 1 }}
                                                onClick={() => handleApprove(user.userId)}
                                            >
                                                Approve
                                            </GlassButton>
                                            <GlassButton
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleReject(user.userId)}
                                            >
                                                Reject
                                            </GlassButton>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </div>
                )}

                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'white' }}>
                    👥 Active Users
                </h2>

                <div className={styles.grid}>
                    {activeUsers.map(user => (
                        <GlassCard key={user.userId} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.avatar} style={{ background: user.photoUrl ? 'transparent' : undefined, overflow: 'hidden' }}>
                                    {user.photoUrl ? (
                                        <img src={user.photoUrl} alt={user.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        (user.fullName || '?').charAt(0)
                                    )}
                                </div>
                                <div
                                    className={styles.roleBadge}
                                    style={{
                                        background: getRoleColor(user.role),
                                        boxShadow: `0 0 15px ${getRoleColor(user.role)}50`
                                    }}
                                >
                                    {user.role}
                                </div>
                            </div>

                            <h3 className={styles.userName}>{user.fullName}</h3>
                            <p className={styles.username}>@{user.username}</p>

                            <div className={styles.details}>
                                {user.email && (
                                    <div className={styles.detail}>
                                        <span>📧</span>
                                        <span>{user.email}</span>
                                    </div>
                                )}
                                {user.phone && (
                                    <div className={styles.detail}>
                                        <span>📞</span>
                                        <span>{user.phone}</span>
                                    </div>
                                )}
                                <div className={styles.detail}>
                                    <span>✅</span>
                                    <span>{user.isActive ? 'Active' : 'Inactive'}</span>
                                </div>
                                {currentUser.userId !== user.userId && (
                                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                        <GlassButton variant="ghost" size="sm" onClick={() => handleOpenModal(user)}>
                                            ✏️ Edit
                                        </GlassButton>
                                        <GlassButton variant="danger" size="sm" onClick={() => handleReject(user.userId)}>
                                            Delete
                                        </GlassButton>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    ))}
                </div>

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={editingUser ? "Edit User" : "Add New User"}
                >
                    <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <GlassInput
                            label="Username *"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            placeholder="Enter username"
                        />
                        <GlassInput
                            label={editingUser ? "Password (leave blank to keep current)" : "Password *"}
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Enter password"
                        />
                        <GlassInput
                            label="Full Name *"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Enter full name"
                        />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <label style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem', paddingLeft: '0.2rem' }}>Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                className={styles.glassSelect}
                            >
                                <option value="Khadem">Khadem</option>
                                {/* <option value="Amin">Amin</option> Disabled for now */}
                                <option value="Admin">Admin</option>
                            </select>
                        </div>

                        <GlassInput
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter email (optional)"
                        />
                        <GlassInput
                            label="Phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter phone (optional)"
                        />

                        <GlassButton type="submit" variant="success" fullWidth>
                            {editingUser ? "Update User" : "Create User"}
                        </GlassButton>
                    </form>
                </Modal>
            </div>
        </div>
    );
};

export default Users;
