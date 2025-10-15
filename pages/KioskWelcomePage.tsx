import React, { useState, useEffect } from 'react';
import KioskWelcomeScreen from '../components/KioskWelcomeScreen';

interface KioskWelcomePageProps {
    onEnter: () => void;
    onAdminLogin: () => void;
}

const KioskWelcomePage: React.FC<KioskWelcomePageProps> = ({ onEnter, onAdminLogin }) => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        // Update the time every minute for the dynamic greeting
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="w-screen h-screen relative">
            <KioskWelcomeScreen onEnter={onEnter} now={now} />
            <div className="absolute bottom-6 right-6">
                <button 
                    onClick={onAdminLogin} 
                    className="text-sm font-semibold text-kiosk-text-muted/80 hover:text-kiosk-text-title transition-colors"
                >
                    Admin Access
                </button>
            </div>
        </div>
    );
};

export default KioskWelcomePage;