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


interface PeriodTimelineProps {
    dailySchedule: DailyPeriod[];
    currentPeriod: DailyPeriod | null;
    now: Date;
}

const PeriodTimeline: React.FC<PeriodTimelineProps> = ({ dailySchedule, currentPeriod, now }) => {
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
        <div ref={scrollRef} className="flex-shrink-0 relative overflow-x-auto py-2 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
            <div className="relative flex h-24 w-full gap-1" style={{ minWidth: '1000px' }}>
                {scheduleMetrics.segments.map(({ period, duration, isPast, isLive }) => {
                    const isBreak = period.type === 'break';
                    let bgClass = 'bg-slate-200 dark:bg-slate-800';
                    let textClass = 'text-slate-700 dark:text-slate-300';
                    let Icon = isBreak ? BreakIcon : ClassIcon;
                    
                    if (isLive) {
                        bgClass = isBreak ? 'bg-kiosk-secondary' : 'bg-kiosk-primary';
                        textClass = 'text-white';
                    } else if (isPast) {
                        bgClass = 'bg-slate-500 dark:bg-slate-600';
                        textClass = 'text-slate-100 dark:text-slate-300';
                    }
                    
                    if (isBreak && !isLive) {
                        bgClass = isPast ? 'bg-amber-600/70 dark:bg-amber-800/60' : 'bg-amber-200 dark:bg-amber-900/40';
                        textClass = isPast ? 'text-amber-100 dark:text-amber-300' : 'text-amber-800 dark:text-amber-200';
                    }
                    
                    return (
                        <div
                            key={period.name}
                            className={`relative h-full rounded-xl flex flex-col justify-between p-3 transition-all duration-300 backdrop-blur-sm shadow-sm border border-black/5 ${isLive ? 'is-live z-10 animate-glow' : ''} ${textClass}`}
                            style={{ flex: `${duration} 1 0` }}
                        >
                            <div className={`absolute inset-0 rounded-xl ${bgClass} transition-colors`}></div>
                            
                            {isLive && (
                                <div className="absolute bottom-0 left-0 right-0 h-1.5 rounded-b-xl overflow-hidden bg-black/10">
                                    <div className="bg-white h-full" style={{ width: `${progress}%` }}></div>
                                </div>
                            )}

                            <div className="relative z-1 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4" />
                                    <p className="font-bold text-sm sm:text-base truncate">{period.name}</p>
                                </div>
                                {isLive && <span className="text-xs font-bold bg-black/20 px-2 py-0.5 rounded-full animate-pulse">LIVE</span>}
                            </div>
                            <p className="relative z-1 text-xs font-semibold">{formatPeriodTime(period.start)}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PeriodTimeline;