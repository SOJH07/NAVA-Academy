import React from 'react';
import type { DailyPeriod } from '../types';

// Icons
const CoffeeIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3m4-1v3m4-1v3" /></svg>;
const UtensilsIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path strokeLinecap="round" strokeLinejoin="round" d="M7 2v11" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 15V2v0a5 5 0 0 0-5 5v4.5" /></svg>;
const BookIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;

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
    }).replace(' ', ''); // e.g. 8:00AM
};

const formatCountdown = (totalSeconds: number): string => {
    if (totalSeconds < 0) return '00:00';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

interface PeriodTimelineProps {
    dailySchedule: DailyPeriod[];
    currentPeriod: DailyPeriod | null;
    now: Date;
}

const PeriodTimeline: React.FC<PeriodTimelineProps> = ({ dailySchedule, currentPeriod, now }) => {
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    return (
        <div className="flex items-center justify-center gap-3 p-2">
            {dailySchedule.map((period) => {
                const isLive = currentPeriod?.name === period.name;
                const isPast = timeToMinutes(period.end) < nowMinutes && !isLive;
                const isBreak = period.type === 'break';
                let icon, label = period.name;

                if (isBreak) {
                    if (period.name.includes('Breakfast')) { icon = <CoffeeIcon className="h-5 w-5" />; label = 'Breakfast'; } 
                    else if (period.name.includes('Lunch')) { icon = <UtensilsIcon className="h-5 w-5" />; label = 'Lunch'; } 
                    else { icon = <CoffeeIcon className="h-5 w-5" />; label = 'Break'; }
                } else {
                    icon = <BookIcon className="h-5 w-5" />;
                }

                if (isLive) {
                    const [endH, endM] = period.end.split(':').map(Number);
                    const endTime = new Date(now);
                    endTime.setHours(endH, endM, 0, 0);
                    
                    const [startH, startM] = period.start.split(':').map(Number);
                    const startTime = new Date(now);
                    startTime.setHours(startH, startM, 0, 0);

                    const totalSecondsLeft = Math.round((endTime.getTime() - now.getTime()) / 1000);
                    const countdown = formatCountdown(totalSecondsLeft);
                    
                    const duration = endTime.getTime() - startTime.getTime();
                    const elapsed = now.getTime() - startTime.getTime();
                    const progress = duration > 0 ? Math.max(0, Math.min(100, (elapsed / duration) * 100)) : 0;
                    
                    return (
                        <div key={period.name} className="flex-shrink-0 bg-kiosk-primary text-white rounded-2xl p-3 shadow-lg flex flex-col justify-between w-48 h-24">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    {icon}
                                    <span className="font-bold text-lg">{label}</span>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-baseline text-xs font-semibold opacity-80">
                                    <span>Session ends in:</span>
                                    <span className="font-mono">{countdown}</span>
                                </div>
                                <div className="w-full bg-white/20 h-1.5 rounded-full mt-1">
                                    <div className="bg-white h-full rounded-full" style={{ width: `${progress}%`, transition: 'width 1s linear' }}></div>
                                </div>
                            </div>
                        </div>
                    );
                }
                
                return (
                    <div key={period.name} className={`flex-shrink-0 rounded-2xl p-3 shadow-sm flex flex-col items-center justify-center w-36 h-20 transition-colors ${
                        isPast ? 'bg-slate-100 text-slate-400' : 'bg-white text-slate-600'
                    }`}>
                        <div className="flex items-center gap-2 font-bold">
                            {icon}
                            <span>{label}</span>
                        </div>
                        <div className="text-xs font-mono font-semibold opacity-80 mt-1">
                            {formatPeriodTime(period.start)} – {formatPeriodTime(period.end)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PeriodTimeline;