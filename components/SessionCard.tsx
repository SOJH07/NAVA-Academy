import React from 'react';
import type { Assignment, FocusedPath } from '../types';
import useAppStore from '../hooks/useAppStore';

interface SessionCardProps {
    assignment: Assignment;
    density: 'comfortable' | 'compact';
    focusedInstructor: string | null;
    setFocusedInstructor: (instructor: string | null) => void;
    showTooltip: (content: React.ReactNode, e: React.MouseEvent) => void;
    hideTooltip: () => void;
    isLive?: boolean;
}

const SessionCard: React.FC<SessionCardProps> = ({ assignment, density, focusedInstructor, setFocusedInstructor, showTooltip, hideTooltip, isLive = false }) => {
    const { setFocusedPath } = useAppStore();
    
    const isTech = assignment.type === 'Technical';
    const styles = {
        bg: isTech ? 'bg-status-tech-light' : 'bg-status-professional-light',
        border: isTech ? 'border-status-tech' : 'border-status-professional',
        text: isTech ? 'text-status-tech' : 'text-status-professional',
        hoverBg: isTech ? 'hover:bg-rose-200/60' : 'hover:bg-sky-200/60',
    };

    const isDimmed = focusedInstructor && !assignment.instructors.includes(focusedInstructor);

    const tooltipContent = (
        <div>
            <p className="font-bold">{assignment.topic}</p>
            <p>Classroom: C-{assignment.classroom}</p>
            <p>Period: {assignment.period}</p>
        </div>
    );

    const padding = density === 'comfortable' ? 'p-2' : 'p-1.5';

    const handleGroupClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFocusedPath({ type: 'group', id: assignment.group });
    }

    return (
        <div 
            className={`relative ${padding} rounded-lg ${styles.bg} ${styles.hoverBg} border-l-4 ${styles.border} transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md ${isDimmed ? 'opacity-30' : ''} ${isLive ? 'ring-2 ring-offset-1 ring-amber-400 shadow-lg' : ''}`}
            onMouseEnter={(e) => showTooltip(tooltipContent, e)}
            onMouseLeave={hideTooltip}
        >
            {isLive && <div className="absolute top-1 right-1 text-[10px] font-bold bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full animate-pulse z-10">LIVE</div>}
            <button
                onClick={handleGroupClick}
                className={`font-extrabold text-sm ${styles.text} truncate hover:underline`}
                title={`Focus on ${assignment.group}`}
            >
                {assignment.group}
            </button>
            <div className="text-xs text-text-muted truncate">
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
    );
};

export default SessionCard;