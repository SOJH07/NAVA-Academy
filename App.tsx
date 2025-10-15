import React, { useState, useCallback, useEffect } from 'react';
import AdminDashboard from './pages/AdminDashboard';
import KioskPage from './pages/KioskPage';
import LoginPage from './pages/LoginPage';
import useUserPreferencesStore from './hooks/useUserPreferencesStore';
import KioskWelcomePage from './pages/KioskWelcomePage';

type View = 'login' | 'admin' | 'kiosk' | 'kioskWelcome';

const App: React.FC = () => {
    const [view, setView] = useState<View>('kioskWelcome');

    const handleLoginSuccess = useCallback(() => {
        setView('admin');
    }, []);
    
    const handleLogout = useCallback(() => {
        setView('login');
    }, []);

    const handleSwitchToKiosk = useCallback(() => {
        setView('kiosk');
    }, []);

    const handleEnterKiosk = useCallback(() => {
        setView('kiosk');
    }, []);

    const handleGoToLogin = useCallback(() => {
        setView('login');
    }, []);

    const handleExitKiosk = useCallback(() => {
        setView('kioskWelcome');
    }, []);

    switch (view) {
        case 'admin':
            return <AdminDashboard onLogout={handleLogout} />;
        case 'kioskWelcome':
            return <KioskWelcomePage onEnter={handleEnterKiosk} onAdminLogin={handleGoToLogin} />;
        case 'kiosk':
            return <KioskPage onExitKiosk={handleExitKiosk} />;
        case 'login':
        default:
            return <LoginPage onLoginSuccess={handleLoginSuccess} onSwitchToKiosk={handleSwitchToKiosk} />;
    }
}

export default App;