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
    const { logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        fullName: '',
        role: 'Khadem', // Default role
        email: '',
        phone: ''
    });

    const [pendingRole, setPendingRole] = useState({}); // Map userId -> selectedRole

    useEffect(() => {
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
    }, [location]);

    const loadUsers = () => {
        setUsers(getUsers());
    };

    const getRoleColor = (role) => {
        const colors = {
            Admin: '#EF4444',
            Amin: '#8B5CF6',
            Khadem: '#10B981',
            Pending: '#F59E0B'
        };
        return colors[role] || '#6B7280';
    };

    const handleAddUser = (e) => {
        e.preventDefault();
        if (!newUser.username || !newUser.password || !newUser.fullName) {
            alert('Please fill in required fields');
            return;
        }

        createUser(newUser);
        setIsModalOpen(false);
        setNewUser({
            username: '',
            password: '',
            fullName: '',
            role: 'Khadem',
            email: '',
            phone: ''
        });
        loadUsers();
        alert('User created successfully!');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleApprove = (userId) => {
        const role = pendingRole[userId] || 'Khadem'; // Default to Khadem if not selected
        updateUser(userId, { role });
        loadUsers();
        alert(`User approved as ${role}!`);
    };

    const handleReject = (userId) => {
        if (window.confirm('Are you sure you want to reject and delete this request?')) {
            deleteUser(userId);
            loadUsers();
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
                    <GlassButton variant="primary" onClick={() => setIsModalOpen(true)}>
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
                                        <div className={styles.avatar} style={{ background: '#F59E0B' }}>
                                            {user.fullName.charAt(0)}
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
                                <div className={styles.avatar}>
                                    {user.fullName.charAt(0)}
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
                                {user.role !== 'Admin' && (
                                    <div style={{ marginTop: '0.5rem' }}>
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
                    title="Add New User"
                >
                    <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <GlassInput
                            label="Username *"
                            name="username"
                            value={newUser.username}
                            onChange={handleInputChange}
                            placeholder="Enter username"
                        />
                        <GlassInput
                            label="Password *"
                            name="password"
                            type="password"
                            value={newUser.password}
                            onChange={handleInputChange}
                            placeholder="Enter password"
                        />
                        <GlassInput
                            label="Full Name *"
                            name="fullName"
                            value={newUser.fullName}
                            onChange={handleInputChange}
                            placeholder="Enter full name"
                        />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <label style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem', paddingLeft: '0.2rem' }}>Role</label>
                            <select
                                name="role"
                                value={newUser.role}
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
                                <option value="Khadem" style={{ color: 'black' }}>Khadem</option>
                                {/* <option value="Amin" style={{ color: 'black' }}>Amin</option> Disabled for now */}
                                <option value="Admin" style={{ color: 'black' }}>Admin</option>
                            </select>
                        </div>

                        <GlassInput
                            label="Email"
                            name="email"
                            type="email"
                            value={newUser.email}
                            onChange={handleInputChange}
                            placeholder="Enter email (optional)"
                        />
                        <GlassInput
                            label="Phone"
                            name="phone"
                            value={newUser.phone}
                            onChange={handleInputChange}
                            placeholder="Enter phone (optional)"
                        />

                        <GlassButton type="submit" variant="success" fullWidth>
                            Create User
                        </GlassButton>
                    </form>
                </Modal>
            </div>
        </div>
    );
};

export default Users;
