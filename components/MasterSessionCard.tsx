import React from 'react';
import type { Assignment } from '../types';

interface MasterSessionCardProps {
    assignment: Assignment;
    focusedInstructor: string | null;
    setFocusedInstructor: (instructor: string | null) => void;
    showTooltip: (content: React.ReactNode, e: React.MouseEvent) => void;
    hideTooltip: () => void;
}

const BookIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" /></svg>;
const LocationIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>;


const MasterSessionCard: React.FC<MasterSessionCardProps> = ({ assignment, focusedInstructor, setFocusedInstructor, showTooltip, hideTooltip }) => {
    const isTech = assignment.type === 'Technical';
    const styles = {
        bg: 'bg-white',
        border: isTech ? 'border-status-tech' : 'border-status-professional',
        text: isTech ? 'text-status-tech' : 'text-status-professional',
        hoverBg: isTech ? 'hover:bg-rose-50/50' : 'hover:bg-sky-50/50',
    };
    const isDimmed = focusedInstructor && !assignment.instructors.includes(focusedInstructor);
    const isLab = assignment.classroom.startsWith('1.') || assignment.classroom.startsWith('3.');
    const locationPrefix = isLab ? 'L' : 'C';
    
    const tooltipContent = (
        <div>
            <p className="font-bold">{assignment.group}: {assignment.topic}</p>
            <p>Instructors: {assignment.instructors.join(', ')}</p>
        </div>
    );

    return (
        <div 
            className={`p-2 rounded-lg border-l-4 shadow-sm transition-all duration-200 cursor-pointer ${styles.bg} ${styles.border} ${styles.hoverBg} ${isDimmed ? 'opacity-30' : ''}`}
            onMouseEnter={(e) => showTooltip(tooltipContent, e)}
            onMouseLeave={hideTooltip}
        >
            <div className="flex justify-between items-start">
                <p className={`font-extrabold text-sm ${styles.text}`}>{assignment.group}</p>
                <p className="text-xs font-bold text-slate-400">{assignment.period}</p>
            </div>
            
            <div className="text-xs text-text-secondary mt-1 space-y-0.5">
                <div className="flex items-center gap-1.5" title={assignment.topic}>
                    <BookIcon className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{assignment.topic}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <LocationIcon className="w-3 h-3 flex-shrink-0" />
                    <span>{locationPrefix}-{assignment.classroom.replace('.', '')}</span>
                </div>
            </div>

            <div className="text-xs text-text-muted truncate mt-1.5 pt-1.5 border-t border-slate-200">
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

export default MasterSessionCard;