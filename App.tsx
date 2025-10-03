import React, { useState, useCallback, useEffect } from 'react';
import AdminDashboard from './pages/AdminDashboard';
import KioskPage from './pages/KioskPage';
import LoginPage from './pages/LoginPage';
import useUserPreferencesStore from './hooks/useUserPreferencesStore';

type View = 'login' | 'admin' | 'kiosk';

const App: React.FC = () => {
    const [view, setView] = useState<View>('kiosk');
    const { theme } = useUserPreferencesStore();

    useEffect(() => {
        const root = window.document.documentElement;
        const isDark =
            theme === 'dark' ||
            (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        root.classList.remove(isDark ? 'light' : 'dark');
        root.classList.add(isDark ? 'dark' : 'light');
    }, [theme]);


    const handleLoginSuccess = useCallback(() => {
        setView('admin');
    }, []);
    
    const handleLogout = useCallback(() => {
        setView('login');
    }, []);

    const handleSwitchToKiosk = useCallback(() => {
        setView('kiosk');
    }, []);

    switch (view) {
        case 'admin':
            return <AdminDashboard onLogout={handleLogout} />;
        case 'kiosk':
            return <KioskPage onExitKiosk={handleLogout} />;
        case 'login':
        default:
            return <LoginPage onLoginSuccess={handleLoginSuccess} onSwitchToKiosk={handleSwitchToKiosk} />;
    }
}

export default App;