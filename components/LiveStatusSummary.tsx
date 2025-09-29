import React, { useState, useEffect } from 'react';
import type { useLiveStatus } from '../hooks/useLiveStatus';

const ClockIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const formatTimeLeft = (seconds: number): string => {
    if (seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

interface LiveStatusSummaryProps {
    liveStatusData: ReturnType<typeof useLiveStatus>;
}

const LiveStatusSummary: React.FC<LiveStatusSummaryProps> = ({ liveStatusData }) => {
    const { now, currentPeriod, overallStatus } = liveStatusData;
    const [timeLeft, setTimeLeft] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!currentPeriod) {
            setProgress(overallStatus === 'Finished' ? 100 : 0);
            setTimeLeft(0);
            return;
        }

        const nowInSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        const startInSeconds = timeToMinutes(currentPeriod.start) * 60;
        const endInSeconds = timeToMinutes(currentPeriod.end) * 60;
        const duration = endInSeconds - startInSeconds;
        
        if (duration > 0) {
            const elapsed = nowInSeconds - startInSeconds;
            setProgress(Math.min(100, (elapsed / duration) * 100));
        } else {
            setProgress(100);
        }
        
        setTimeLeft(Math.max(0, endInSeconds - nowInSeconds));

    }, [now, currentPeriod, overallStatus]);
    
    const getStatusColorClasses = () => {
        if (overallStatus === 'In Class') return { text: 'text-brand-primary-dark dark:text-brand-primary', bg: 'bg-brand-primary/20', icon: 'text-brand-primary-dark dark:text-brand-primary', progress: 'bg-brand-primary' };
        if (overallStatus.includes('Break')) return { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-500/20', icon: 'text-amber-500 dark:text-amber-400', progress: 'bg-amber-500' };
        if (overallStatus === 'Upcoming') return { text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-500/20', icon: 'text-indigo-500 dark:text-indigo-400', progress: 'bg-indigo-500' };
        return { text: 'text-text-muted dark:text-dark-text-muted', bg: 'bg-slate-100 dark:bg-dark-panel-hover', icon: 'text-text-muted dark:text-dark-text-muted', progress: 'bg-slate-400' };
    }
    
    const colors = getStatusColorClasses();

    return (
        <div className="p-4 rounded-xl shadow-sm border border-slate-200 dark:border-dark-border bg-bg-panel dark:bg-dark-panel flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors.bg}`}>
                   <ClockIcon className={`h-6 w-6 ${colors.icon}`} />
                </div>
            </div>
             <div className="mt-2">
                <p className={`text-2xl font-extrabold ${colors.text}`}>{overallStatus}</p>
                <p className="text-sm font-semibold text-text-muted dark:text-dark-text-muted mt-1">{currentPeriod?.name || 'Operations Ended'}</p>
            </div>
            {currentPeriod && (
                <div className="mt-2">
                     <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs font-mono text-text-muted dark:text-dark-text-muted">{formatTimeLeft(timeLeft)} left</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-dark-panel-hover rounded-full h-1.5">
                        <div className={`${colors.progress} h-1.5 rounded-full`} style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveStatusSummary;