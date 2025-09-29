import React, { useState } from 'react';

interface LoginPageProps {
    onLoginSuccess: () => void;
    onSwitchToKiosk: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onSwitchToKiosk }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === '2030') {
            setError('');
            onLoginSuccess();
        } else {
            setError('Incorrect password. Please try again.');
            setPassword('');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-bg-body font-sans">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-2xl">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 bg-brand-primary rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">NAVA Academy Portal</h1>
                    <p className="mt-2 text-text-secondary">Admin Access Required</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="relative">
                         <label htmlFor="password" className="sr-only">Password</label>
                         <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-4 text-lg border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                            placeholder="Password"
                         />
                    </div>

                    {error && <p className="text-center text-sm text-red-600">{error}</p>}
                    
                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-4 px-4 border border-transparent text-lg font-bold rounded-lg text-white bg-brand-primary hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors duration-300 shadow-lg"
                        >
                            Sign In
                        </button>
                    </div>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-text-muted">Or</span>
                    </div>
                </div>

                 <div>
                    <button
                        onClick={onSwitchToKiosk}
                        className="w-full flex justify-center py-4 px-4 border border-slate-300 text-lg font-bold rounded-lg text-text-primary bg-white hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors duration-300"
                    >
                        View Public Kiosk
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;