import React, { useState, useEffect } from 'react';
import { getWeek } from 'date-fns';

interface KioskHeaderProps {
    onExitKiosk: () => void;
}

const DynamicTimeDisplay: React.FC = () => {
    const [timeString, setTimeString] = useState('');
    const [isBright, setIsBright] = useState(false);

    useEffect(() => {
        const timerId = setInterval(() => {
            const now = new Date();
            const timeOptions: Intl.DateTimeFormatOptions = {
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
                timeZone: 'Asia/Riyadh',
            };
            setTimeString(new Intl.DateTimeFormat('en-US', timeOptions).format(now));
            setIsBright(prev => !prev);
        }, 1000);

        return () => clearInterval(timerId);
    }, []);
    
    const timeStyle = {
        color: isBright ? '#14B8A6' : '#0F766E',
        textShadow: '0 0 4px rgba(20, 184, 166, 0.2)',
        transition: 'color 0.3s ease-in-out',
    };

    return (
        <p className="text-xl font-bold font-mono tabular-nums whitespace-nowrap" style={timeStyle} dir="ltr">
            {timeString}
        </p>
    );
};

const KioskHeader: React.FC<KioskHeaderProps> = ({ onExitKiosk }) => {
    const [now, setNow] = useState(new Date());
    const [showTagline, setShowTagline] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 30000); // Update date every 30s for accuracy
        return () => clearInterval(timer);
    }, []);
    
    useEffect(() => {
        const taglineTimer = setTimeout(() => {
            setShowTagline(false);
        }, 5000);
        return () => clearTimeout(taglineTimer);
    }, []);
    
    const weekNumber = getWeek(now, { weekStartsOn: 0 }); // Sunday as start of week

    const gregorianDateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'Asia/Riyadh',
    };
    
    const hijriDateOptions: Intl.DateTimeFormatOptions = {
        calendar: 'islamic',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Riyadh',
    };

    const formattedGregorianDate = new Intl.DateTimeFormat('en-US', gregorianDateOptions).format(now);
    const formattedHijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', hijriDateOptions).format(now);
    
    return (
        <header className="relative flex h-16 items-center justify-between bg-bg-panel px-10 border-b border-slate-200 shadow-sm">
            {/* Left Section: Date */}
            <div className="w-1/3 text-left">
                <div className="hidden lg:block">
                    <p className="font-bold text-text-primary text-lg leading-tight">
                        {formattedGregorianDate}
                    </p>
                    <p className="text-sm text-text-muted flex items-center gap-2 mt-0.5" dir="ltr">
                        <span className="bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-md">Week {weekNumber}</span>
                        <span className="text-slate-300">|</span>
                        <span dir="rtl">{formattedHijriDate}</span>
                    </p>
                </div>
            </div>

            {/* Center Section: Title */}
            <div className="w-1/3 text-center">
                 <h1 className="text-2xl tracking-tight whitespace-nowrap">
                    <span className="font-extrabold text-text-primary">NAVA</span>
                    <span className="ml-2 font-semibold" style={{ color: '#0F766E', textShadow: '0 0 8px rgba(15, 118, 110, 0.2)' }}>
                        Today
                    </span>
                </h1>
                {showTagline && (
                    <p className="text-xs italic text-slate-400 animate-fade-in opacity-0" style={{ animationFillMode: 'forwards' }}>
                        Empowering Tomorrow’s Innovators
                    </p>
                )}
            </div>

            {/* Right Section: Time and Exit button */}
            <div className="w-1/3 flex items-center justify-end gap-4">
                <DynamicTimeDisplay />
                <button onClick={onExitKiosk} title="Exit Kiosk Mode" className="p-2 rounded-full text-slate-500 hover:bg-slate-200">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                     </svg>
                </button>
            </div>
        </header>
    );
};

export default KioskHeader;