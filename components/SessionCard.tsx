import React from 'react';
import type { Assignment, FocusedPath, GroupInfo } from '../types';
import useAppStore from '../hooks/useAppStore';

interface SessionCardProps {
    assignment: Assignment;
    density: 'comfortable' | 'compact';
    focusedInstructor: string | null;
    setFocusedInstructor: (instructor: string | null) => void;
    showTooltip: (content: React.ReactNode, e: React.MouseEvent) => void;
    hideTooltip: () => void;
    isLive?: boolean;
    groupInfo: GroupInfo;
}

const SessionCard: React.FC<SessionCardProps> = ({ assignment, density, focusedInstructor, setFocusedInstructor, showTooltip, hideTooltip, isLive = false, groupInfo }) => {
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
    };

    const isDimmed = focusedInstructor && !assignment.instructors.includes(focusedInstructor);

    const tooltipContent = (
        <div>
            <p className="font-bold">{assignment.topic}</p>
            <p>Classroom: C-{assignment.classroom.replace('.','')}</p>
            <p>Period: {assignment.period}</p>
            <p>Type: {isPractical ? 'Practical' : 'Theory'}</p>
        </div>
    );

    const padding = density === 'comfortable' ? 'p-2' : 'p-1.5';

    const handleGroupClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFocusedPath({ type: 'group', id: assignment.group });
    }

    return (
        <div 
            className={`relative overflow-hidden ${padding} rounded-lg ${styles.bg} ${styles.hoverBg} border-l-4 ${styles.border} transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md ${isDimmed ? 'opacity-30' : ''} ${isLive ? 'ring-2 ring-offset-1 ring-amber-400 shadow-lg' : ''}`}
            onMouseEnter={(e) => showTooltip(tooltipContent, e)}
            onMouseLeave={hideTooltip}
        >
            {isPractical && <div className="absolute inset-0 bg-repeat bg-center" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-2 10L10 -2M-2 2L2 -2M6 10L10 6' stroke='%23000' stroke-width='1' stroke-opacity='0.1'/%3E%3C/svg%3E")`}}></div>}
            <div className="relative">
                {isLive && <div className="absolute top-0 right-0 text-[10px] font-bold bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full animate-pulse z-10">LIVE</div>}
                <button
                    onClick={handleGroupClick}
                    className={`font-extrabold text-sm ${styles.text} truncate hover:underline`}
                    title={`Focus on ${assignment.group}`}
                >
                    {assignment.group}
                </button>
                <div className="text-xs text-text-muted dark:text-dark-text-muted truncate">
                    {assignment.instructors.map((inst, index) => (
                        <span key={inst}>
                            <button
                                onClick={(e) => { e.stopPropagation(); setFocusedInstructor(inst); }}
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

export default SessionCard;