import React, { useState, useEffect } from 'react';
import { getWeek } from 'date-fns';
import type { DailyPeriod } from '../types';

// Icons for breaks
const CoffeeIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3m4-1v3m4-1v3" /></svg>;
const UtensilsIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path strokeLinecap="round" strokeLinejoin="round" d="M7 2v11" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 15V2v0a5 5 0 0 0-5 5v4.5" /></svg>;

const timeToMinutes = (time: string): number => {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const formatPeriodTime = (time24: string): string => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':').map(Number);
    const d = new Date(0);
    d.setHours(hours, minutes);
    return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).replace(/\s/g, '').toLowerCase(); // e.g. 8:00am
};

const DynamicTimeDisplay: React.FC = () => {
    const [timeString, setTimeString] = useState('');

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
        }, 1000);

        return () => clearInterval(timerId);
    }, []);
    
    return (
        <p className="text-xl font-bold font-mono text-teal-600 tabular-nums whitespace-nowrap" dir="ltr">
            {timeString}
        </p>
    );
};

interface KioskHeaderProps {
    onExitKiosk: () => void;
    language: 'en' | 'ar';
    setLanguage: (lang: 'en' | 'ar') => void;
    now: Date;
    weekNumber: number;
    dailySchedule: DailyPeriod[];
    currentPeriod: DailyPeriod | null;
}

const KioskHeader: React.FC<KioskHeaderProps> = ({ onExitKiosk, language, setLanguage, now, weekNumber, dailySchedule, currentPeriod }) => {
    
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

    const timelineMetrics = React.useMemo(() => {
        if (!dailySchedule || dailySchedule.length === 0) return { totalDuration: 0 };
        const dayStart = timeToMinutes(dailySchedule[0].start);
        const dayEnd = timeToMinutes(dailySchedule[dailySchedule.length - 1].end);
        return { totalDuration: dayEnd - dayStart };
    }, [dailySchedule]);

    const nowMinutes = timeToMinutes(`${now.getHours()}:${now.getMinutes()}`);

    return (
        <header className="flex-shrink-0 bg-bg-panel p-4 pb-0 border border-kiosk-border shadow-lg rounded-2xl flex flex-col">
            {/* Top Row */}
            <div className="flex items-center justify-between">
                {/* Left Section: Date */}
                <div className="w-1/3 text-left">
                    <p className="font-bold text-text-primary text-lg leading-tight">
                        {formattedGregorianDate}
                    </p>
                    <div className="text-sm text-text-muted flex items-center gap-2 mt-0.5" dir="ltr">
                        <span className="bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-md">Week {weekNumber}</span>
                        <span className="text-slate-300">|</span>
                        <span dir="rtl">{formattedHijriDate}</span>
                    </div>
                </div>

                {/* Center Section: Title */}
                <div className="w-1/3 text-center">
                    <h1 className="text-2xl tracking-tight whitespace-nowrap">
                        <span className="font-extrabold text-text-primary">NAVA</span>
                        <span className="ml-2 font-semibold text-kiosk-primary">
                            Today
                        </span>
                    </h1>
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
            </div>

            {/* Bottom Row: Timeline */}
            <div className="w-full mt-4">
                <div className="flex w-full rounded-t-lg overflow-hidden h-16 border-t border-slate-200">
                    {dailySchedule.map((period) => {
                        const isLive = currentPeriod?.name === period.name;
                        const isPast = timeToMinutes(period.end) <= nowMinutes && !isLive;
                        const isBreak = period.type === 'break';
                        
                        const periodStartMinutes = timeToMinutes(period.start);
                        const periodEndMinutes = timeToMinutes(period.end);
                        const duration = periodEndMinutes - periodStartMinutes;
                        const flexBasis = timelineMetrics.totalDuration > 0 ? `${(duration / timelineMetrics.totalDuration) * 100}%` : 'auto';

                        let progress = 0;
                        if(isLive) {
                            const nowWithSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
                            const periodStartSeconds = periodStartMinutes * 60;
                            const periodDurationSeconds = duration * 60;
                            const elapsed = nowWithSeconds - periodStartSeconds;
                            progress = Math.max(0, Math.min(100, (elapsed / periodDurationSeconds) * 100));
                        }

                        let label = period.name;
                        let Icon = null;
                        if(isBreak) {
                            if(label.toLowerCase().includes('lunch')) { Icon = UtensilsIcon; label = "Lunch" }
                            else { Icon = CoffeeIcon; label = "Break" }
                        }
                        
                        return (
                            <div 
                                key={period.name}
                                className={`
                                    relative flex flex-col items-center justify-between p-2 text-center transition-colors duration-300 border-r border-slate-200/50 last:border-r-0
                                    ${isLive ? 'bg-kiosk-primary text-white font-bold' : ''}
                                    ${isPast ? 'bg-slate-100 text-slate-400' : ''}
                                    ${!isLive && !isPast ? 'bg-white text-slate-500' : ''}
                                `}
                                style={{ flexBasis }}
                            >
                                {/* Text content */}
                                <div className="flex flex-col items-center justify-center">
                                    {Icon && <Icon className={`h-4 w-4 mb-0.5 ${isLive ? 'opacity-100' : 'opacity-80'}`} />}
                                    <span className={`font-semibold ${isBreak ? 'text-xs' : 'text-sm'}`}>{label}</span>
                                    <span className={`text-[10px] font-mono mt-0.5 ${isLive ? 'opacity-100' : 'opacity-70'}`}>{formatPeriodTime(period.start)}-{formatPeriodTime(period.end)}</span>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-1.5 w-full mt-1"> 
                                    {isLive && (
                                        <div className="bg-white/30 rounded-full h-full overflow-hidden">
                                            <div className="bg-white h-full rounded-full" style={{width: `${progress}%`, transition: 'width 1s linear'}}></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </header>
    );
};

export default KioskHeader;