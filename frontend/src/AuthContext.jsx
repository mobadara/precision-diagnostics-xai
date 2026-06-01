import { useState } from 'react';
import { AuthContext } from './authContext';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('debutron_user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const login = (email, password) => {
        // Hardcoded for MVP phase
        if (email === "doctor@clinic.com" && password === "password123") {
            const userData = { email, role: "physician", name: "Dr. Smith" };
            setUser(userData);
            localStorage.setItem('debutron_user', JSON.stringify(userData));
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('debutron_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};