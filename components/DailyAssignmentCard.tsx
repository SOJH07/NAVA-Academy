import React from 'react';
import type { Assignment, GroupInfo, FocusedPath } from '../types';
import useAppStore from '../hooks/useAppStore';


interface DailyAssignmentCardProps {
    assignment: Assignment;
    density: 'comfortable' | 'compact';
    focusedInstructor: string | null;
    setFocusedInstructor: (instructor: string | null) => void;
    showTooltip: (content: React.ReactNode, e: React.MouseEvent) => void;
    hideTooltip: () => void;
    isLive?: boolean;
    groupInfo: GroupInfo;
}

const BookIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>;
const LocationIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;


const DailyAssignmentCard: React.FC<DailyAssignmentCardProps> = ({ assignment, density, focusedInstructor, setFocusedInstructor, showTooltip, hideTooltip, isLive = false, groupInfo }) => {
    const { setFocusedPath } = useAppStore();
    
    const track = groupInfo[assignment.group]?.track_name;
    const isIndustrial = track === 'Industrial Tech';
    const isPD = assignment.type === 'Professional Development';
    const isPractical = assignment.classroom.startsWith('1.') || assignment.classroom.startsWith('WS-') || assignment.classroom.startsWith('0.');

    const styles = {
        bg: isPD ? 'bg-status-professional-light' : (isIndustrial ? 'bg-status-industrial-light' : 'bg-status-tech-light'),
        border: isPD ? 'border-status-professional' : (isIndustrial ? 'border-status-industrial' : 'border-status-tech'),
        text: isPD ? 'text-status-professional' : (isIndustrial ? 'text-status-industrial' : 'text-status-tech'),
        hoverBg: isPD ? 'hover:bg-emerald-200/60' : (isIndustrial ? 'hover:bg-blue-200/60' : 'hover:bg-rose-200/60'),
        hoverBorder: isPD ? 'hover:border-emerald-400' : (isIndustrial ? 'hover:border-blue-400' : 'hover:border-rose-400'),
    };

    const isDimmed = focusedInstructor && !assignment.instructors.includes(focusedInstructor);

    const tooltipContent = (
        <div>
            <p className="font-bold">{assignment.group}: {assignment.topic}</p>
            <p>Classroom: C-{assignment.classroom.replace('.','')}</p>
            <p>Period: {assignment.period}</p>
            <p>Type: {isPractical ? 'Practical' : 'Theory'}</p>
        </div>
    );

    const handlePathClick = (type: 'group' | 'instructor', id: string) => {
        setFocusedPath({type, id});
    };

    const padding = density === 'comfortable' ? 'p-3' : 'p-2';

    return (
        <div 
            className={`relative w-full h-full rounded-xl border-l-4 flex flex-col ${padding} ${styles.border} ${styles.bg} ${styles.hoverBg} ${styles.hoverBorder} transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg ${isDimmed ? 'opacity-30' : ''} ${isLive ? 'ring-2 ring-offset-1 ring-amber-400 shadow-xl' : ''} overflow-hidden`}
            onMouseEnter={(e) => showTooltip(tooltipContent, e)}
            onMouseLeave={hideTooltip}
        >
            {isPractical && <div className="absolute inset-0 bg-repeat bg-center" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-2 10L10 -2M-2 2L2 -2M6 10L10 6' stroke='%23000' stroke-width='1' stroke-opacity='0.1'/%3E%3C/svg%3E")`}}></div>}
            
            <div className="relative z-1">
                {isLive && <div className="absolute top-0 right-0 text-[10px] font-bold bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full animate-pulse">LIVE</div>}
                <button 
                    className={`font-extrabold text-left ${density === 'comfortable' ? 'text-base' : 'text-sm'} ${styles.text} truncate hover:underline`}
                    onClick={(e) => { e.stopPropagation(); handlePathClick('group', assignment.group); }}
                >
                    {assignment.group}
                </button>
                
                <div className={`flex-grow mt-1 space-y-1 ${density === 'comfortable' ? 'text-sm' : 'text-xs'}`}>
                     <div className="flex items-start gap-1.5 text-text-secondary dark:text-dark-text-secondary">
                        <BookIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="truncate">{assignment.topic}</span>
                    </div>
                     <div className="flex items-start gap-1.5 text-text-secondary dark:text-dark-text-secondary">
                        <LocationIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>C-{assignment.classroom.replace('.','')}</span>
                    </div>
                </div>

                <div className={`text-xs text-text-secondary dark:text-dark-text-secondary truncate mt-auto ${density === 'comfortable' ? 'mt-2 pt-2 border-t border-slate-300/50 dark:border-dark-border' : 'mt-1 pt-1'}`}>
                    {assignment.instructors.map((inst, index) => (
                        <span key={inst}>
                            <button
                                onClick={(e) => { e.stopPropagation(); handlePathClick('instructor', inst); }}
                                className="hover:underline focus:outline-none focus:text-brand-primary disabled:no-underline disabled:cursor-default"
                                disabled={!!focusedInstructor}
                            >
                                {inst}
                            </button>
                            {index < assignment.instructors.length - 1 && ', '}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DailyAssignmentCard;