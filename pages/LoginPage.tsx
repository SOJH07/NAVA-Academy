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
        if (password === '1995') {
            setError('');
            onLoginSuccess();
        } else {
            setError('Incorrect password. Please try again.');
            setPassword('');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-slate-100 font-sans">
            <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-2xl shadow-xl">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-brand-nava-green rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bukra font-extrabold text-slate-800 tracking-tight">NAVA Academy Portal</h1>
                    <p className="mt-2 text-slate-500 font-medium">Admin Access Required</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div>
                         <label htmlFor="password" className="sr-only">Password</label>
                         <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 text-base border-slate-300 bg-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-nava-green-dark focus:border-brand-nava-green-dark"
                            placeholder="Password"
                         />
                    </div>

                    {error && <p className="text-center text-sm text-red-600">{error}</p>}
                    
                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-base font-bold rounded-lg text-white bg-brand-nava-green hover:bg-brand-nava-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-nava-green-dark transition-colors duration-300 shadow-md"
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
                        className="w-full flex justify-center py-3 px-4 border border-slate-300 text-base font-bold rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-colors duration-300"
                    >
                        View NAVAToday
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;