import React, { useState, useEffect, useMemo } from 'react';

interface BreakTimeDisplayProps {
    breakName: string;
    endTime: string;
    now: Date;
    language: 'en' | 'ar';
    onDismiss: () => void;
}

const BreakTimeDisplay: React.FC<BreakTimeDisplayProps> = ({ breakName, endTime, now, language, onDismiss }) => {
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

    const { title, message } = useMemo(() => {
        const lowerBreakName = breakName.toLowerCase();
        if (lowerBreakName.includes('lunch')) {
            return {
                title: language === 'ar' ? 'استراحة الغداء والصلاة' : 'Lunch & Prayer Break',
                message: language === 'ar' ? 'استمتع بوجبتك وصلاتك. نراك قريباً.' : 'Enjoy your meal and prayer. See you soon.',
            };
        }
        if (lowerBreakName.includes('breakfast')) {
            return {
                title: language === 'ar' ? 'استراحة الفطور' : 'Breakfast Break',
                message: language === 'ar' ? 'استعد ليوم مثمر. استمتع بوجبة الإفطار.' : 'Fuel up for a productive day. Enjoy your breakfast.',
            };
        }
        return { // Short Break or default
            title: language === 'ar' ? 'استراحة قصيرة' : 'Short Break',
            message: language === 'ar' ? 'استراحة سريعة لتجديد النشاط. نراك قريباً.' : 'A quick pause to refresh. See you back shortly.',
        };
    }, [breakName, language]);

    return (
        <div className="relative flex flex-col items-center justify-center h-full w-full text-center text-kiosk-text-title p-8 kiosk-welcome-bg">
            <div className="flex flex-col items-center" style={{ textShadow: '0 3px 10px rgba(0,0,0,0.1)' }}>
                <h2 className="text-5xl lg:text-6xl font-black font-montserrat text-kiosk-text-title drop-shadow-md">
                    {title}
                </h2>
                <p className="text-xl text-kiosk-text-body mt-4 drop-shadow-sm">
                    {language === 'ar' ? 'تنتهي في' : 'Ends in'}
                </p>
                <p className="text-8xl lg:text-9xl font-black font-mono text-kiosk-primary tracking-tighter tabular-nums my-4 drop-shadow-lg animate-pulse-slow">
                    {timeLeft}
                </p>
                <p className="text-xl font-medium text-kiosk-text-body drop-shadow-sm text-wrap-balance max-w-lg">
                    {message}
                </p>
                <div className="mt-10">
                    <button
                        onClick={onDismiss}
                        className="bg-white/80 text-kiosk-text-title font-bold px-8 py-4 rounded-full shadow-xl backdrop-blur-sm border border-white/50 transition-all hover:bg-white hover:scale-105"
                    >
                        {language === 'ar' ? 'عرض الجدول الكامل' : 'View Full Schedule'} &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BreakTimeDisplay;