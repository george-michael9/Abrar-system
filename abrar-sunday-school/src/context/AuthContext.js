import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {

            try {
                if (firebaseUser) {
                    // Fetch additional user data from Firestore
                    const userDocRef = doc(db, 'users', firebaseUser.uid);

                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {

                        setUser({ ...userDoc.data(), userId: firebaseUser.uid, uid: firebaseUser.uid, email: firebaseUser.email });
                    } else {

                        // Fallback if user document doesn't exist yet (e.g. just registered)
                        setUser({
                            userId: firebaseUser.uid,
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName,
                            role: 'Guest' // Default role until approved/assigned
                        });
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('AuthProvider Error:', error);
                // Even on error, we should probably allow the user to see *something* (or maybe logout)
                setUser(null);
            } finally {

                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const login = async (email, password, rememberMe = true) => {
        try {
            await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const googleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user document exists, if not create it
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    username: user.email,
                    fullName: user.displayName,
                    email: user.email,
                    role: 'Pending',
                    photoUrl: user.photoURL,
                    createdAt: new Date().toISOString(),
                    isActive: true,
                    isGoogle: true
                });
            }
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const register = async (email, password, fullName) => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const user = result.user;

            // Create user document in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                username: email, // Use email as username initially
                fullName: fullName,
                email: email,
                role: 'Pending',
                createdAt: new Date().toISOString(),
                isActive: true
            });

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    const updateCurrentUser = (userData) => {
        // This is now purely local state update until we implement Firestore updates properly
        // In a real app, you'd call a Firestore update function here.
        setUser(prev => ({ ...prev, ...userData }));
    };

    const isAdmin = () => user?.role === 'Admin';
    const isAmin = () => user?.role === 'Amin';
    const isKhadem = () => user?.role === 'Khadem';

    const resetPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const value = {
        user,
        login,
        googleLogin,
        register,
        resetPassword,
        logout,
        updateCurrentUser,
        isAuthenticated: !!user,
        isAdmin,
        isAmin,
        isKhadem,
        loading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
