import React, { useState, useEffect } from 'react';
import type { DailyPeriod, LiveOpsFilters, Assignment } from '../types';
import { useLiveStatus } from '../hooks/useLiveStatus';

// Icons
const TechIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c.94-1.543.826 3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> );
const ProfessionalIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" /></svg>;
const CoffeeIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 11h16M4 11a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v3a2 2 0 01-2 2m-8 5v5m-4-5v5m8-5v5M4 16h16" /></svg> );
const ClassIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-1.082.186l-6.5 5.5a1 1 0 00-.312.746V16a1 1 0 001 1h2.158a1 1 0 00.863-.486l1.842-3.223a1 1 0 011.71 0l1.842 3.223a1 1 0 00.863.486H15a1 1 0 001-1V8.512a1 1 0 00-.312-.746l-6.5-5.5a1 1 0 00-.794-.186zM12 10a2 2 0 10-4 0 2 2 0 004 0z" /></svg> );


interface LiveStatusSidebarProps {
    liveStatusData: ReturnType<typeof useLiveStatus>;
    dailySchedule: DailyPeriod[];
    assignments: Assignment[];
    sessionInfo: {
        sessionCounts: { industrial: number; service: number; professional: number; };
        sessionGroups: { industrial: string[]; service: string[]; professional: string[]; };
    };
    filters: LiveOpsFilters;
    toggleArrayFilter: (filterType: 'techGroups', value: string) => void;
    toggleSessionTypeFilter: (sessionType: 'tech' | 'professional') => void;
    isCollapsed: boolean;
    setIsCollapsed: (isCollapsed: boolean) => void;
}

const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const formatTimeLeft = (seconds: number): string => {
    if (seconds < 0) return '00:00:00';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

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

const Tooltip: React.FC<{ content: string; position: { top: number; left: number } | null }> = ({ content, position }) => {
    if (!position) return null;
    return (
        <div
            className="fixed z-50 bg-gray-800 text-white px-3 py-1.5 text-sm rounded-lg shadow-xl transition-opacity duration-200 pointer-events-none"
            style={{ top: position.top, left: position.left, transform: 'translate(-110%, -50%)' }}
        >
            {content}
        </div>
    );
};

const DAYS: Assignment['day'][] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const LiveStatusSidebar: React.FC<LiveStatusSidebarProps> = ({ liveStatusData, dailySchedule, assignments, sessionInfo, filters, toggleArrayFilter, toggleSessionTypeFilter, isCollapsed, setIsCollapsed }) => {
    const { now, currentPeriod } = liveStatusData;
    const [timeLeft, setTimeLeft] = useState(0);
    const [progress, setProgress] = useState(0);
    const [tooltip, setTooltip] = useState<{ content: string; position: { top: number; left: number } } | null>(null);


    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });
    };

    useEffect(() => {
        if (!currentPeriod) {
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            const endOfDay = timeToMinutes("15:40");
            setProgress(nowMinutes >= endOfDay ? 100 : 0);
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

    }, [now, currentPeriod]);

    const handleMouseEnter = (e: React.MouseEvent, period: DailyPeriod) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const content = `${period.name}: ${formatPeriodTime(period.start)} - ${formatPeriodTime(period.end)}`;
        setTooltip({
            content,
            position: { top: rect.top + rect.height / 2, left: rect.left },
        });
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };


    const SessionCard: React.FC<{
        type: 'industrial' | 'service';
    }> = ({ type }) => {
        const dataMap = {
            industrial: { 
                count: sessionInfo.sessionCounts.industrial, 
                groups: sessionInfo.sessionGroups.industrial, 
                icon: <TechIcon className="h-6 w-6 text-status-industrial"/>, 
                title: 'Industrial Technician', 
                lightColor: 'bg-status-industrial-light', 
                darkColor: 'text-status-industrial', 
                borderColor: 'border-status-industrial/20', 
                ringColor: 'ring-status-industrial',
                filterType: 'tech'
            },
            service: { 
                count: sessionInfo.sessionCounts.service, 
                groups: sessionInfo.sessionGroups.service, 
                icon: <TechIcon className="h-6 w-6 text-status-tech"/>,
                title: 'Service Technician', 
                lightColor: 'bg-status-tech-light', 
                darkColor: 'text-status-tech', 
                borderColor: 'border-status-tech/20', 
                ringColor: 'ring-status-tech',
                filterType: 'tech'
            }
        };
        const { count, groups, icon, title, lightColor, darkColor, borderColor, ringColor, filterType } = dataMap[type];
        
        const isActive = filters.sessionType === filterType;
        
        return (
            <button 
                onClick={() => toggleSessionTypeFilter(filterType as 'tech' | 'professional')}
                className={`p-4 rounded-xl text-left w-full transition-all duration-200 focus:outline-none ${lightColor} ${isActive ? `ring-2 ${ringColor}` : 'hover:shadow-md'}`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {icon}
                        <h4 className="font-bold text-text-primary text-sm">{title}</h4>
                    </div>
                    <p className={`text-xl font-extrabold ${darkColor}`}>{count}</p>
                </div>
                {count > 0 && 
                    <div className={`pt-3 mt-3 border-t ${borderColor}`}>
                        <div className="flex flex-wrap gap-1.5">
                            {groups?.map(group => {
                                const filterType = 'techGroups';
                                const isGroupActive = filters[filterType].includes(group);
                                return (
                                    <button
                                        key={group}
                                        onClick={(e) => { e.stopPropagation(); toggleArrayFilter(filterType, group); }}
                                        className={`whitespace-nowrap px-2 py-1 text-xs font-semibold rounded-full transition-all duration-200 shadow-sm hover:scale-105 ${
                                            isGroupActive
                                                ? `bg-white ${darkColor}`
                                                : `${darkColor.replace('text-','bg-')} text-white opacity-80 hover:opacity-100`
                                        }`}
                                        title={`Filter by group ${group}`}
                                    >
                                        {group}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                }
            </button>
        );
    };

     if (isCollapsed) {
        const r = 14;
        const circ = 2 * Math.PI * r;
        const offset = circ - (progress / 100) * circ;

        return (
            <aside className={`bg-panel border-l border-slate-200 p-4 flex flex-col items-center flex-shrink-0 h-full transition-all duration-300 ease-in-out w-20`}>
                {tooltip && <Tooltip content={tooltip.content} position={tooltip.position} />}
                <div className="flex-grow overflow-y-auto -mx-4 w-full flex flex-col items-center">
                    <div className="relative py-2">
                        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-slate-200 -z-10"></div>
                        {dailySchedule.map(period => {
                            const isLive = currentPeriod?.name === period.name;
                            const isPast = timeToMinutes(period.end) < (now.getHours() * 60 + now.getMinutes());
                            const isClass = period.type === 'class';
                           
                            let IconToShow: React.FC<{className?: string}> = CoffeeIcon;
                            let finalIconColor = 'text-text-muted';

                            if (isClass) {
                                const dayOfWeek = DAYS[now.getDay()];
                                const assignmentsForPeriod = assignments.filter(a => 
                                    a.day === dayOfWeek &&
                                    a.period === period.name
                                );
                                const types = new Set(assignmentsForPeriod.map(a => a.type));
                                
                                IconToShow = ClassIcon;
                                finalIconColor = isPast ? 'text-text-muted' : 'text-text-secondary';

                                if(types.size === 1) {
                                    if(types.has('Technical')) {
                                        IconToShow = TechIcon;
                                        finalIconColor = isPast ? 'text-status-tech/60' : 'text-status-tech';
                                    } else if (types.has('Professional Development')) {
                                        IconToShow = ProfessionalIcon;
                                        finalIconColor = isPast ? 'text-status-professional/60' : 'text-status-professional';
                                    }
                                }
                            } else { // Break
                                IconToShow = CoffeeIcon;
                                finalIconColor = isPast ? 'text-text-muted' : 'text-status-break';
                            }
                            
                            const periodIconContent = <IconToShow className={`h-6 w-6 transition-colors duration-300 ${finalIconColor}`} />;

                            return (
                                <div
                                    key={period.name}
                                    className="my-2"
                                    onMouseEnter={(e) => handleMouseEnter(e, period)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    {isLive ? (
                                        <div className="relative w-10 h-10 animate-pulse">
                                            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                                                <circle className="text-slate-200" strokeWidth="3" stroke="currentColor" fill="transparent" r={r} cx="18" cy="18" />
                                                <circle className="text-brand-primary" strokeWidth="3" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={r} cx="18" cy="18" />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                               {periodIconContent}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${isPast ? 'bg-slate-50' : 'bg-slate-100'}`}>
                                            {periodIconContent}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                 {/* Footer Area */}
                 <div className="flex-shrink-0 mt-auto pt-2 w-full border-t border-slate-200">
                    <button onClick={() => setIsCollapsed(false)} className="w-full flex items-center justify-center p-2 rounded-lg text-text-secondary hover:bg-bg-panel-hover" title="Expand">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </aside>
        );
    }


    return (
        <aside className={`bg-panel border-l border-slate-200 p-4 flex flex-col flex-shrink-0 h-full transition-all duration-300 ease-in-out w-80`}>
            {/* Header */}
            <div className="flex-shrink-0 pb-4">
                <div className="flex justify-between items-center">
                    <h2 className={`text-xl font-bold text-text-primary whitespace-nowrap transition-opacity`}>Live Status</h2>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap transition-opacity bg-brand-primary-light text-brand-primary`}>
                        Week {liveStatusData.weekNumber}
                    </span>
                </div>
                <p className={`text-sm font-medium text-text-muted whitespace-nowrap transition-opacity`}>{formatTime(now)}</p>
            </div>

            {/* Session Summaries */}
            <div className={`flex-shrink-0 space-y-3 mb-4 flex transition-all flex-col`}>
                <SessionCard type="industrial" />
                <SessionCard type="service" />
            </div>

            {/* Daily Schedule */}
            <div className={`flex-grow overflow-y-auto -mr-2 pr-2 transition-opacity`}>
                <div className="relative">
                    {/* Timeline bar */}
                    <div className="absolute top-2.5 left-[19px] w-0.5 h-full bg-slate-200 z-0"></div>

                    <ul className="space-y-1">
                        {dailySchedule.map(period => {
                            const isLive = currentPeriod?.name === period.name;
                            const isPast = timeToMinutes(period.end) < (now.getHours() * 60 + now.getMinutes());
                            
                            let IconComponent: React.FC<{ className?: string }> = ClassIcon;
                            const iconColor = 'text-text-muted';

                            if (period.type === 'break') {
                                IconComponent = CoffeeIcon;
                            } else {
                                const dayOfWeek = DAYS[now.getDay()];
                                const assignmentsForPeriod = assignments.filter(a => 
                                    a.day === dayOfWeek &&
                                    a.period === period.name
                                );
                                const types = new Set(assignmentsForPeriod.map(a => a.type));
                                if (types.size === 1) {
                                    if (types.has('Technical')) IconComponent = TechIcon;
                                    else if (types.has('Professional Development')) IconComponent = ProfessionalIcon;
                                }
                            }
                            const finalIconColor = period.type === 'break' ? 'text-status-break' : (IconComponent === TechIcon ? 'text-status-tech' : (IconComponent === ProfessionalIcon ? 'text-status-professional' : 'text-text-muted'));

                            return (
                                <li key={period.name} className={`relative p-3 rounded-lg transition-all duration-300 ${isPast && !isLive ? 'opacity-50' : ''}`}>
                                    {/* Timeline Dot */}
                                    <div className={`absolute top-1/2 -translate-y-1/2 left-[11px] w-4 h-4 rounded-full border-4 border-panel z-10 ${isLive ? 'bg-brand-primary' : (isPast ? 'bg-text-muted' : 'bg-text-secondary')}`}></div>
                                    
                                    <div className={`pl-8 ${isLive ? 'pb-4' : ''}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <IconComponent className={`h-5 w-5 ${finalIconColor}`} />
                                                <span className="font-bold text-text-primary text-sm">{period.name}</span>
                                            </div>
                                            <span className="text-xs font-semibold text-text-muted">{formatPeriodTime(period.start)} - {formatPeriodTime(period.end)}</span>
                                        </div>
                                    </div>
                                    
                                    {isLive && (
                                        <div className="absolute bottom-2 left-12 right-3">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <span className="text-xs font-bold text-brand-primary animate-pulse">LIVE</span>
                                                <span className="text-xs font-mono text-text-muted">{formatTimeLeft(timeLeft)}</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-1">
                                                <div className="bg-brand-primary h-1 rounded-full" style={{ width: `${progress}%` }}></div>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
            
             {/* Footer Area */}
            <div className="flex-shrink-0 mt-auto pt-2 border-t border-slate-200">
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`w-full text-left flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 text-text-secondary hover:bg-bg-panel-hover hover:text-text-primary`}
                    title={'Collapse'}
                >
                     <div className="flex-shrink-0">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                         </svg>
                    </div>
                    <span className={`whitespace-nowrap transition-opacity`}>Collapse</span>
                </button>
            </div>
        </aside>
    );
};

export default LiveStatusSidebar;