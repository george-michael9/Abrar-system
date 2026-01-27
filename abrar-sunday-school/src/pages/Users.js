import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUsers } from '../services/mockApi';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import styles from './Users.module.css';

const Users = () => {
    const { logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);

    useEffect(() => {
        // Check if user is admin
        if (!isAdmin()) {
            navigate('/dashboard');
            return;
        }
        loadUsers();
        // eslint-disable-next-line
    }, []);

    const loadUsers = () => {
        setUsers(getUsers());
    };

    const getRoleColor = (role) => {
        const colors = {
            Admin: '#EF4444',
            Amin: '#8B5CF6',
            Khadem: '#10B981'
        };
        return colors[role] || '#6B7280';
    };

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
                    <GlassButton variant="primary" onClick={() => alert('Add New User - Feature coming soon!')}>
                        ➕ Add New User
                    </GlassButton>
                </div>

                <div className={styles.grid}>
                    {users.map(user => (
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
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Users;
