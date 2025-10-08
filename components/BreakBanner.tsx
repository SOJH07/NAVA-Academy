import React, { useState, useEffect } from 'react';

interface BreakBannerProps {
    breakName: string;
    endTime: string;
    now: Date;
    language: 'en' | 'ar';
    onRestore: () => void;
}

const BreakBanner: React.FC<BreakBannerProps> = ({ breakName, endTime, now, language, onRestore }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const calculateTimeLeft = () => {
            const end = new Date();
            const [h, m] = endTime.split(':');
            end.setHours(parseInt(h), parseInt(m), 0, 0);

            const diff = end.getTime() - new Date().getTime();
            if (diff < 0) {
                setTimeLeft('00:00');
                return;
            }
            
            const minutes = Math.floor((diff / 1000) / 60);
            const seconds = Math.floor((diff / 1000) % 60);
            setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(interval);
    }, [endTime, now]);

    return (
        <div className="flex-shrink-0 w-full bg-amber-100 border border-amber-300 rounded-lg p-3 flex items-center justify-between mb-4 animate-fade-in">
            <div className="flex items-center gap-4">
                <div className="font-bold text-amber-800">
                    <p className="text-base">{breakName}</p>
                    <p className="text-xs">{language === 'ar' ? 'قيد التقدم' : 'In Progress'}</p>
                </div>
                <div className="text-center">
                    <p className="font-mono font-bold text-2xl text-amber-700 tabular-nums">{timeLeft}</p>
                    <p className="text-xs font-semibold text-amber-600">{language === 'ar' ? 'متبقٍ' : 'Ends in'}</p>
                </div>
            </div>
            <button
                onClick={onRestore}
                className="bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg shadow-sm transition-transform hover:scale-105"
            >
                {language === 'ar' ? 'استعادة' : 'Restore'}
            </button>
        </div>
    );
};

export default BreakBanner;