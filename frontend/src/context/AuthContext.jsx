import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        const initAuth = () => {
            const currentUser = authService.getCurrentUser();
            const token = localStorage.getItem('token');
            if (currentUser && token) {
                setUser(currentUser);
            } else {
                setUser(null);
                authService.logout(); // Clear any partial state
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        const response = await authService.login(email, password);
        // authService.login returns response.data which is { success, data: { user, token } }
        if (response.success && response.data?.user) {
            setUser(response.data.user);
        }
        return response;
    };

    const register = async (username, email, password, role) => {
        const response = await authService.register(username, email, password, role);
        if (response.success && response.data?.user) {
            setUser(response.data.user);
        }
        return response;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const value = {
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
