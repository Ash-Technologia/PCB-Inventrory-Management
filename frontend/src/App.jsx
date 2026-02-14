import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import PCBManagement from './pages/PCBManagement';
import Production from './pages/Production';
import Analytics from './pages/Analytics';
import Procurement from './pages/Procurement';

// Layout
import Layout from './components/layout/Layout';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppRoutes() {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/" /> : <Login />}
            />

            <Route
                path="/signup"
                element={isAuthenticated ? <Navigate to="/" /> : <Signup />}
            />

            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Dashboard />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="pcbs" element={<PCBManagement />} />
                <Route path="production" element={<Production />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="procurement" element={<Procurement />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
            </Router>
        </AuthProvider>
    );
}

export default App;
