import { useState } from 'react';
import { useAuth } from './useAuth';
import { Activity } from 'lucide-react';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleLogin = (e) => {
        e.preventDefault();
        const success = login(email, password);
        if (!success) setError("Invalid credentials. Use doctor@clinic.com / password123");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="flex flex-col items-center justify-center mb-8">
                    <div className="bg-navy p-3 rounded-full mb-4">
                        <Activity className="text-white w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-navy">PNEUMONIA VISION AI</h2>
                    <p className="text-gray-500 text-sm mt-1">Precision Diagnostics Portal</p>
                </div>

                <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    Use doctor@clinic.com / password123 to log in and explore the demo dashboard with sample X-ray images.
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-critical-red text-sm rounded-md border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-cyan focus:border-transparent outline-none transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="doctor@clinic.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-cyan focus:border-transparent outline-none transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-navy hover:bg-blue-900 text-white font-semibold py-2.5 rounded-lg transition-colors duration-200"
                    >
                        Secure Login
                    </button>
                </form>
            </div>
        </div>
    );
}