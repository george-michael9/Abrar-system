import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, getUserById } from '../services/mockApi';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (username, password) => {
        const authenticatedUser = apiLogin(username, password);

        if (authenticatedUser) {
            setUser(authenticatedUser);
            localStorage.setItem('currentUser', JSON.stringify(authenticatedUser));
            return { success: true };
        }

        return { success: false, error: 'Invalid username or password' };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('currentUser');
    };

    const isAdmin = () => user?.role === 'Admin';
    const isAmin = () => user?.role === 'Amin';
    const isKhadem = () => user?.role === 'Khadem';

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin,
        isAmin,
        isKhadem,
        loading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
