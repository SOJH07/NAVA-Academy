import React, { useMemo, useRef, useEffect, useState } from 'react';
import type { DailyPeriod } from '../types';

// SVG Icons
const CoffeeIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><path d="M6 1v3" /><path d="M10 1v3" /><path d="M14 1v3" /></svg>;
const UtensilsIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v11" /><path d="M21 15V2v0a5 5 0 0 0-5 5v4.5" /></svg>;

const timeToMinutes = (time: string): number => {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

interface PeriodTimelineProps {
    dailySchedule: DailyPeriod[];
    currentPeriod: DailyPeriod | null;
    now: Date;
}

const PeriodTimeline: React.FC<PeriodTimelineProps> = ({ dailySchedule, currentPeriod, now }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);

    const segments = useMemo(() => {
        return dailySchedule.map(period => ({
            period,
            duration: timeToMinutes(period.end) - timeToMinutes(period.start),
        }));
    }, [dailySchedule]);
    
    useEffect(() => {
        if (currentPeriod) {
            const startInSeconds = timeToMinutes(currentPeriod.start) * 60;
            const endInSeconds = timeToMinutes(currentPeriod.end) * 60;
            const nowInSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
            const duration = endInSeconds - startInSeconds;
            
            setProgress(duration > 0 ? Math.min(100, ((nowInSeconds - startInSeconds) / duration) * 100) : 100);
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
        <div ref={scrollRef} className="relative overflow-x-auto scroll-smooth h-16" style={{ scrollbarWidth: 'none' }}>
            <div className="grid grid-flow-col auto-cols-[minmax(140px,1fr)] items-stretch gap-3 h-full">
                {segments.map(({ period }) => {
                    const periodName = period.name;
                    const isLive = currentPeriod?.name === periodName;
                    const isBreak = period.type === 'break';
                    const tooltipContent = `${period.name}: ${formatPeriodTime(period.start)} - ${formatPeriodTime(period.end)}`;

                    let tileClasses = 'relative rounded-xl border px-4 py-2 select-none transition-all duration-300 ease-in-out shadow-sm flex flex-col justify-between overflow-hidden';
                    let icon: React.ReactNode;
                    let label = periodName;

                    if (isBreak) {
                        tileClasses += ' bg-slate-100 border-slate-200 text-slate-600';
                        if (periodName.includes('Breakfast')) {
                            icon = <CoffeeIcon key="coffee" className="w-5 h-5" />;
                            label = "Breakfast";
                        } else if (periodName.includes('Lunch')) {
                            icon = <UtensilsIcon key="utensils" className="w-5 h-5" />;
                            label = "Lunch & Prayer";
                        } else { // Short Break
                            icon = <CoffeeIcon key="coffee" className="w-5 h-5" />;
                            label = "Break";
                        }
                    } else {
                        tileClasses += ' bg-white border-slate-200 text-slate-700';
                    }

                    if (isLive) {
                        tileClasses += ' is-live z-10 bg-blue-50 border-blue-400 text-blue-800 ring-2 ring-blue-400';
                    }

                    return (
                        <div key={periodName} title={tooltipContent} className={tileClasses}>
                             <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    {icon}
                                    <p className="font-bold text-sm sm:text-base truncate">{label}</p>
                                </div>
                            </div>
                            <p className="text-xs font-semibold">{formatPeriodTime(period.start)}</p>
                            {isLive && !isBreak && (
                                <div className="absolute left-0 bottom-0 h-[3px] w-full bg-blue-400/20">
                                    <div className="bg-blue-400 h-full" style={{ width: `${progress}%` }}></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PeriodTimeline;