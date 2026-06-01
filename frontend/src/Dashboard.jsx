import React from 'react';
import { useAuth } from './useAuth';
import { LogOut, Activity } from 'lucide-react';

export default function Dashboard() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation Bar */}
            <nav className="bg-navy text-white p-4 shadow-md flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Activity className="w-6 h-6 text-trust-cyan" />
                    <span className="font-bold tracking-wide">DEBUTRON LAB</span>
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-sm text-gray-200">Welcome, {user?.name}</span>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 hover:text-red-300 transition-colors text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto p-6 mt-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <h2 className="text-2xl font-semibold text-navy mb-2">Diagnostic Engine Active</h2>
                    <p className="text-gray-500">The main X-Ray upload interface will go here.</p>
                </div>
            </main>
        </div>
    );
}