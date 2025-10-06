import React, { useState, useCallback, useEffect } from 'react';
import AdminDashboard from './pages/AdminDashboard';
import KioskPage from './pages/KioskPage';
import LoginPage from './pages/LoginPage';
import useUserPreferencesStore from './hooks/useUserPreferencesStore';
import KioskWelcomePage from './pages/KioskWelcomePage';

type View = 'login' | 'admin' | 'kiosk' | 'kioskWelcome';

const App: React.FC = () => {
    const [view, setView] = useState<View>('kioskWelcome');
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
        setView('kioskWelcome');
    }, []);

    const handleEnterKiosk = useCallback(() => {
        setView('kiosk');
    }, []);

    switch (view) {
        case 'admin':
            return <AdminDashboard onLogout={handleLogout} />;
        case 'kioskWelcome':
            return <KioskWelcomePage onEnter={handleEnterKiosk} />;
        case 'kiosk':
            return <KioskPage onExitKiosk={handleLogout} />;
        case 'login':
        default:
            return <LoginPage onLoginSuccess={handleLoginSuccess} onSwitchToKiosk={handleSwitchToKiosk} />;
    }
}

export default App;
