import React, { useMemo, useRef, useEffect, useState } from 'react';
import type { DailyPeriod } from '../types';

const timeToMinutes = (time: string): number => {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

// Icons for different period types
const ClassIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>;
const BreakIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 11h16M4 11a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v3a2 2 0 01-2 2m-8 5v5m-4-5v5m8-5v5M4 16h16" /></svg>;


interface LiveStatusTimelineProps {
    dailySchedule: DailyPeriod[];
    currentPeriod: DailyPeriod | null;
    now: Date;
    weekNumber: number;
}

const LiveStatusTimeline: React.FC<LiveStatusTimelineProps> = ({ dailySchedule, currentPeriod, now, weekNumber }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);

    const scheduleMetrics = useMemo(() => {
        if (dailySchedule.length === 0) return { segments: [], nowMinutes: 0 };
        
        const nowMinutes = now.getHours() * 60 + now.getMinutes();

        const segments = dailySchedule.map(period => {
            const start = timeToMinutes(period.start);
            const end = timeToMinutes(period.end);
            const duration = end - start;
            return {
                period,
                startMinutes: start,
                duration,
                isPast: end < nowMinutes,
                isLive: currentPeriod?.name === period.name,
            };
        });

        return { segments, nowMinutes };
    }, [dailySchedule, now, currentPeriod]);
    
    useEffect(() => {
        if (currentPeriod) {
            const startInSeconds = timeToMinutes(currentPeriod.start) * 60;
            const endInSeconds = timeToMinutes(currentPeriod.end) * 60;
            const nowInSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
            const duration = endInSeconds - startInSeconds;
            
            if (duration > 0) {
                const elapsed = nowInSeconds - startInSeconds;
                setProgress(Math.min(100, (elapsed / duration) * 100));
            } else {
                setProgress(100);
            }
        } else {
            setProgress(0);
        }
    }, [now, currentPeriod]);

    useEffect(() => {
        if (scrollRef.current) {
            const liveSegment = scrollRef.current.querySelector('.is-live');
            if (liveSegment) {
                liveSegment.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }
    }, [currentPeriod]);


    const formatPeriodTime = (time24: string): string => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':').map(Number);
        const d = new Date(1970, 0, 1, hours, minutes);
        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    return (
        <div className="bg-gradient-to-br from-gray-50 to-slate-100 dark:from-[#1E361E] dark:to-[#2A4B2A] rounded-2xl shadow-xl p-4 w-full flex items-center gap-6">
            <div className="flex-shrink-0 text-center">
                <div className="bg-black/5 dark:bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2 shadow-inner">
                    <p className="text-5xl font-mono font-bold text-slate-800 dark:text-slate-100 tracking-wider">{now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Riyadh' })}</p>
                </div>
                 <div className="mt-2 text-sm font-bold text-brand-primary-dark dark:text-brand-primary">
                    Week {weekNumber}
                </div>
            </div>

            <div ref={scrollRef} className="flex-grow relative overflow-x-auto py-2 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
                <div className="relative flex h-24 w-full gap-1" style={{ minWidth: '1200px' }}>
                    {scheduleMetrics.segments.map(({ period, duration, isPast, isLive }) => {
                        const isBreak = period.type === 'break';
                        let bgClass = 'bg-black/5 dark:bg-white/5';
                        let textClass = 'text-text-secondary dark:text-dark-text-secondary';
                        
                        if (isLive) {
                            bgClass = isBreak ? 'bg-amber-400' : 'bg-brand-primary';
                            textClass = isBreak ? 'text-amber-900' : 'text-black';
                        } else if (isPast) {
                            bgClass = 'bg-black/10 dark:bg-white/10';
                            textClass = 'text-slate-500 dark:text-dark-text-muted opacity-70';
                        }
                        
                        return (
                            <div
                                key={period.name}
                                className={`relative h-full rounded-lg flex flex-col justify-between p-3 transition-all duration-300 ${isLive ? 'is-live shadow-lg z-10 animate-glow' : 'hover:scale-[1.02]'} ${textClass}`}
                                style={{ flex: `${duration} 1 0` }}
                            >
                                <div className={`absolute inset-0 rounded-lg ${bgClass} transition-colors`}></div>
                                
                                {isLive && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1.5 rounded-b-lg overflow-hidden bg-white/20">
                                        <div className="bg-white h-full" style={{ width: `${progress}%` }}></div>
                                        <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg" style={{ left: `calc(${progress}% - 6px)` }}>
                                           <div className="w-full h-full bg-white rounded-full animate-ping"></div>
                                        </div>
                                    </div>
                                )}

                                <div className="relative z-1 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        {isBreak ? <BreakIcon className="w-4 h-4" /> : <ClassIcon className="w-4 h-4" />}
                                        <p className="font-bold text-sm truncate">{period.name}</p>
                                    </div>
                                    {isLive && <span className="text-xs font-bold bg-black/20 px-2 py-0.5 rounded-full animate-pulse">LIVE</span>}
                                </div>
                                <p className="relative z-1 text-xs font-semibold">{formatPeriodTime(period.start)}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LiveStatusTimeline;
