import React, { useState, useEffect } from 'react';
import KioskWelcomeScreen from '../components/KioskWelcomeScreen';

interface KioskWelcomePageProps {
    onEnter: () => void;
}

const KioskWelcomePage: React.FC<KioskWelcomePageProps> = ({ onEnter }) => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        // Update the time every minute for the dynamic greeting
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="w-screen h-screen">
            <KioskWelcomeScreen onEnter={onEnter} now={now} />
        </div>
    );
};

export default KioskWelcomePage;
