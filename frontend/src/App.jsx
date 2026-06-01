import React from 'react';
import { AuthProvider } from './AuthContext';
import { useAuth } from './useAuth';
import LoginScreen from './LoginScreen';
import Dashboard from './Dashboard';

// The Gatekeeper Component
const MainRouter = () => {
    const { user } = useAuth();

    // If no user exists in global state, lock them out
    if (!user) {
        return <LoginScreen />;
    }

    // Otherwise, let them into the system
    return <Dashboard />;
};

export default function App() {
    return (
        <AuthProvider>
            <MainRouter />
        </AuthProvider>
    );
}