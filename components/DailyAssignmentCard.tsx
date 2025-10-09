import React from 'react';
import type { Assignment, GroupInfo } from '../types';
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

const DailyAssignmentCard: React.FC<DailyAssignmentCardProps> = ({ assignment, density, focusedInstructor, setFocusedInstructor, showTooltip, hideTooltip, isLive = false, groupInfo }) => {
    const { setFocusedPath } = useAppStore();
    
    const track = groupInfo[assignment.group]?.track_name;
    const isIndustrial = track === 'Industrial Tech';
    const isPD = assignment.type === 'Professional Development';
    
    const styles = {
        bg: isPD ? 'bg-status-professional-light' : (isIndustrial ? 'bg-status-industrial-light' : 'bg-status-tech-light'),
        border: isPD ? 'border-status-professional' : (isIndustrial ? 'border-status-industrial' : 'border-status-tech'),
        text: isPD ? 'text-status-professional' : (isIndustrial ? 'text-status-industrial' : 'text-status-tech'),
        hoverBg: isPD ? 'hover:bg-emerald-200/60' : (isIndustrial ? 'hover:bg-blue-200/60' : 'hover:bg-rose-200/60'),
        hoverBorder: isPD ? 'hover:border-emerald-400' : (isIndustrial ? 'hover:border-blue-400' : 'hover:border-rose-400'),
    };

    const isDimmed = focusedInstructor && !assignment.instructors.includes(focusedInstructor);
    
    const unitCodeMatch = assignment.topic.match(/(U\d+|Unit-\d+)/i);
    const unitCode = unitCodeMatch ? unitCodeMatch[0].replace('Unit-', 'U').toUpperCase() : null;

    const isLab = assignment.classroom.startsWith('1.') || assignment.classroom.startsWith('3.');
    const formattedLocation = assignment.classroom.startsWith('WS-') 
        ? assignment.classroom.replace('WS-0.', 'WS-') 
        : `${isLab ? 'L' : 'C'}-${assignment.classroom.replace('.', '')}`;
    
    let locationPillColor = 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    if (assignment.classroom.startsWith('1.') || assignment.classroom.startsWith('3.')) {
        locationPillColor = 'bg-lab-bg text-lab-text dark:bg-lab-dark-bg dark:text-lab-dark-text'; // Lab
    } else if (assignment.classroom.startsWith('2.')) {
        locationPillColor = 'bg-classroom-bg text-classroom-text dark:bg-classroom-dark-bg dark:text-classroom-dark-text'; // Classroom
    } else if (assignment.classroom.startsWith('WS-')) {
        locationPillColor = 'bg-status-break-light text-status-break dark:bg-amber-900/50 dark:text-amber-300'; // Workshop (using break colors)
    }

    const tooltipContent = (
        <div>
            <p className="font-bold">{assignment.group}: {assignment.topic}</p>
            <p>Classroom: {formattedLocation}</p>
            <p>Period: {assignment.period}</p>
        </div>
    );

    const handlePathClick = (type: 'group' | 'instructor', id: string) => {
        setFocusedPath({type, id});
    };

    return (
        <div 
            className={`relative w-full h-full rounded-xl border-l-4 flex flex-row ${styles.border} ${styles.bg} ${styles.hoverBorder} transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg ${isDimmed ? 'opacity-30' : ''} ${isLive ? 'ring-2 ring-offset-1 ring-amber-400 shadow-xl' : ''} overflow-hidden`}
            onMouseEnter={(e) => showTooltip(tooltipContent, e)}
            onMouseLeave={hideTooltip}
        >
            {/* Left Part: Group Name */}
            <button 
                className={`w-1/3 flex flex-col items-center justify-center p-2 border-r border-slate-300/50 dark:border-dark-border/50 ${styles.hoverBg} h-full`}
                onClick={(e) => { e.stopPropagation(); handlePathClick('group', assignment.group); }}
            >
                <div className={`font-extrabold text-center ${styles.text} ${density === 'comfortable' ? 'text-xl' : 'text-lg'}`}>
                    <div>{assignment.group.split('-')[0]}</div>
                    <div>{assignment.group.split('-')[1]}</div>
                </div>
            </button>

            {/* Right Part: Details */}
            <div className="w-2/3 flex-grow p-2 flex flex-col justify-between">
                {/* Top Row: Location & Unit Pill */}
                <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm text-text-secondary dark:text-dark-text-secondary">{unitCode}</span>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${locationPillColor}`}>
                        {formattedLocation}
                    </span>
                </div>
                
                {/* Bottom Row: Instructor */}
                <div className={`text-sm font-semibold text-text-secondary dark:text-dark-text-secondary truncate`}>
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

            {isLive && <div className="absolute top-1.5 right-1.5 text-[10px] font-bold bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full animate-pulse z-20">LIVE</div>}
        </div>
    );
};

export default DailyAssignmentCard;