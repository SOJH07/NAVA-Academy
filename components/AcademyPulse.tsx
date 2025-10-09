import React, { useMemo } from 'react';
import type { useLiveStatus } from '../hooks/useLiveStatus';

// Icons
const InClassIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3.5a1 1 0 00.028 1.84l7 3.5a1 1 0 00.764 0l7-3.5a1 1 0 00.028-1.84l-7-3.5z" /><path d="M3 9.332V14a1 1 0 00.553.894l6 3a1 1 0 00.894 0l6-3A1 1 0 0017 14v-4.668-2.45l-7 3.5-7-3.5v2.45z" /></svg>;
const OnBreakIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a1 1 0 011 1v1a1 1 0 11-2 0V4a1 1 0 011-1zM4 5a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V6a1 1 0 00-1-1H4z" /><path d="M5 18a1 1 0 011-1h6a1 1 0 110 2H6a1 1 0 01-1-1z" /></svg>;
const ActiveSessionIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v.25a.75.75 0 01-1.5 0V2.75A.75.75 0 0110 2zM5.404 4.343a.75.75 0 010 1.06l-.25.25a.75.75 0 11-1.06-1.06l.25-.25a.75.75 0 011.06 0zm9.192 0a.75.75 0 011.06 0l.25.25a.75.75 0 11-1.06 1.06l-.25-.25a.75.75 0 010-1.06zM2 10a.75.75 0 01.75-.75h.25a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm15 0a.75.75 0 01.75-.75h.25a.75.75 0 010 1.5h-.25a.75.75 0 01-.75-.75zM5.404 15.657a.75.75 0 010-1.06l-.25-.25a.75.75 0 11-1.06 1.06l.25.25a.75.75 0 011.06 0zm9.192 0a.75.75 0 011.06 0l.25-.25a.75.75 0 11-1.06-1.06l-.25.25a.75.75 0 010 1.06zM10 18a.75.75 0 01-.75-.75v-.25a.75.75 0 011.5 0v.25A.75.75 0 0110 18z" clipRule="evenodd" /></svg>;

const StatItem: React.FC<{ value: number; label: string; icon: React.ReactNode; colorClass: string }> = ({ value, label, icon, colorClass }) => (
    <div className="text-center">
        {React.cloneElement(icon as React.ReactElement, { className: `h-6 w-6 mx-auto mb-1 ${colorClass}` })}
        <p className={`text-3xl font-black text-kiosk-text-title tabular-nums`}>{value}</p>
        <p className="text-xs font-bold text-kiosk-text-muted uppercase tracking-wider">{label}</p>
    </div>
);

interface AcademyPulseProps {
    liveStatusData: ReturnType<typeof useLiveStatus>;
    language: 'en' | 'ar';
}

const AcademyPulse: React.FC<AcademyPulseProps> = ({ liveStatusData, language }) => {
    const { inClassCount, onBreakCount, activeSessionsCount } = useMemo(() => {
        return {
            inClassCount: liveStatusData.liveStudents.filter(s => s.status === 'In Class').length,
            onBreakCount: liveStatusData.liveStudents.filter(s => s.status === 'Break').length,
            activeSessionsCount: liveStatusData.liveClasses.length
        };
    }, [liveStatusData]);

    const labels = {
        title: language === 'ar' ? 'نبض الأكاديمية' : 'Academy Pulse',
        inClass: language === 'ar' ? 'في الفصل' : 'In Class',
        onBreak: language === 'ar' ? 'في استراحة' : 'On Break',
        sessions: language === 'ar' ? 'جلسات نشطة' : 'Active Sessions'
    };

    return (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 mt-6 animate-fade-in border border-slate-200">
            <h3 className="font-bold text-lg text-kiosk-text-title mb-3 text-center">
                {labels.title}
            </h3>
            <div className="grid grid-cols-3 gap-4">
                <StatItem 
                    value={inClassCount}
                    label={labels.inClass}
                    icon={<InClassIcon />}
                    colorClass="text-emerald-500"
                />
                <StatItem 
                    value={onBreakCount}
                    label={labels.onBreak}
                    icon={<OnBreakIcon />}
                    colorClass="text-amber-500"
                />
                <StatItem 
                    value={activeSessionsCount}
                    label={labels.sessions}
                    icon={<ActiveSessionIcon />}
                    colorClass="text-sky-500"
                />
            </div>
        </div>
    );
};

export default AcademyPulse;