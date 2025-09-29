import React, { useMemo } from 'react';
import type { DailyPeriod } from '../types';

const timeToMinutes = (time: string): number => {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

interface LiveStatusTimelineProps {
    dailySchedule: DailyPeriod[];
    currentPeriod: DailyPeriod | null;
    now: Date;
    weekNumber: number;
}

const LiveStatusTimeline: React.FC<LiveStatusTimelineProps> = ({ dailySchedule, currentPeriod, now, weekNumber }) => {
    const { progress } = useMemo(() => {
        if (!currentPeriod) return { progress: 100 };
        
        const nowInSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        const startInSeconds = timeToMinutes(currentPeriod.start) * 60;
        const endInSeconds = timeToMinutes(currentPeriod.end) * 60;
        const duration = endInSeconds - startInSeconds;
        const elapsed = nowInSeconds - startInSeconds;
        
        const progress = duration > 0 ? Math.min(100, (elapsed / duration) * 100) : 100;
        return { progress };
    }, [now, currentPeriod]);

    const formatPeriodTime = (time24: string): string => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':').map(Number);
        const d = new Date(1970, 0, 1, hours, minutes);
        return d.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-4 w-full flex items-center gap-6">
            <div className="flex-shrink-0 text-center pr-6 border-r border-slate-200">
                <p className="text-5xl font-mono font-bold text-text-primary">{now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
                <div className={`text-sm font-semibold mt-1 px-2 py-0.5 rounded-full inline-block bg-indigo-100 text-indigo-700`}>
                    Week {weekNumber}
                </div>
            </div>
            <div className="flex-grow flex items-center gap-2 overflow-x-auto py-2">
                {dailySchedule.map((period) => {
                    const isLive = currentPeriod?.name === period.name;
                    const nowMinutes = now.getHours() * 60 + now.getMinutes();
                    const isPast = timeToMinutes(period.end) < nowMinutes;

                    return (
                        <div key={period.name} className={`relative rounded-lg h-20 flex flex-col justify-between p-3 flex-shrink-0 transition-all duration-300 ${period.type === 'class' ? 'w-32' : 'w-24'} ${isLive ? 'bg-brand-primary text-black shadow-lg shadow-brand-primary/40 scale-105' : (isPast ? 'bg-slate-200 text-slate-500' : 'bg-slate-100 text-text-secondary')}`}>
                            <div className="flex justify-between items-center">
                                <p className={`font-bold text-sm truncate ${isLive ? 'text-black' : ''}`}>{period.name}</p>
                                {isLive && <span className="text-xs font-bold bg-black/20 px-2 py-0.5 rounded-full animate-pulse">LIVE</span>}
                            </div>
                            <p className="text-xs font-medium">{formatPeriodTime(period.start)}</p>

                            {isLive && (
                                <div className="absolute bottom-1 left-2 right-2 w-auto bg-black/15 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-black h-full" style={{ width: `${progress}%` }}></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LiveStatusTimeline;
