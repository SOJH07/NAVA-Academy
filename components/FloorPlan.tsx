import React from 'react';
import type { FloorPlanItem, OccupancyData, ClassroomState } from '../types';

interface FloorPlanProps {
    layout: FloorPlanItem[];
    occupancy: OccupancyData;
    selectedClassroom: string | null;
    onClassroomClick: (classroomName: string) => void;
    highlightedClassrooms?: Set<string>;
    classroomState: ClassroomState;
}

const WarningIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${className}`} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.636-1.214 2.852-1.214 3.488 0l5.584 10.68c.636 1.214-.474 2.721-1.744 2.721H4.417c-1.27 0-2.38-1.507-1.744-2.721L8.257 3.099zM10 12a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 011 1v1a1 1 0 11-2 0V9a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
)

const FloorPlan: React.FC<FloorPlanProps> = ({ layout, occupancy, selectedClassroom, onClassroomClick, highlightedClassrooms, classroomState }) => {

    const getStatusInfo = (item: FloorPlanItem) => {
        const manualState = classroomState[item.name];

        let roomKey = item.name;
        if (item.name.startsWith('C-2')) {
            roomKey = `2.${item.name.substring(3)}`;
        } else if (item.name.startsWith('C-1')) {
            roomKey = `1.${item.name.substring(3)}`;
        }
        
        const occupiedInfo = occupancy[roomKey];
        
        let style = '';
        let text = '';
        let icon = null;
        let animationClass = '';

        if (manualState?.status === 'out-of-service') {
            style = 'bg-yellow-100 border-yellow-300/50 text-yellow-700';
            text = manualState.reason ?? 'Out of Service';
            icon = <WarningIcon className="h-5 w-5" />;
        } else if (occupiedInfo) {
            animationClass = 'animate-glow';
            switch (occupiedInfo.type) {
                case 'industrial':
                    style = 'bg-status-industrial-light border-status-industrial/30 text-status-industrial hover:bg-blue-200 dark:bg-status-industrial/20 dark:border-status-industrial/30 dark:text-status-industrial dark:hover:bg-status-industrial/30';
                    break;
                case 'service':
                    style = 'bg-status-tech-light border-status-tech/30 text-status-tech hover:bg-rose-200 dark:bg-status-tech/20 dark:border-status-tech/30 dark:text-status-tech dark:hover:bg-status-tech/30';
                    break;
                case 'professional':
                    style = 'bg-status-professional-light border-status-professional/30 text-status-professional hover:bg-emerald-200 dark:bg-status-professional/20 dark:border-status-professional/30 dark:text-status-professional dark:hover:bg-status-professional/30';
                    break;
            }
            text = occupiedInfo.group;
        } else {
             switch (item.type) {
                case 'static':
                    if (item.name === 'TUV Office' || item.name === 'Dean Office' || item.name === 'Technical Trainers') {
                        style = 'bg-slate-700 border-slate-800 text-white font-semibold dark:bg-dark-panel-hover dark:border-dark-border';
                    } else {
                        style = 'bg-slate-200 border-slate-300 text-slate-600 dark:bg-dark-panel-hover dark:border-dark-border dark:text-dark-text-secondary';
                    }
                    text = 'Office';
                    break;
                case 'workshop':
                case 'lab':
                    style = 'bg-purple-100 border-purple-300/50 text-purple-700 hover:bg-purple-200 dark:bg-purple-500/20 dark:border-purple-500/30 dark:text-purple-300 dark:hover:bg-purple-500/30';
                    text = 'Vacant';
                    break;
                case 'classroom':
                default:
                    style = 'bg-status-vacant-light border-status-vacant/50 text-brand-primary-dark hover:bg-status-vacant/60 dark:bg-brand-primary/20 dark:border-brand-primary/20 dark:text-brand-primary dark:hover:bg-brand-primary/30';
                    text = 'Vacant';
                    break;
            }
        }
        
        const isSelected = selectedClassroom === item.name;
        const highlightStyle = isSelected ? 'shadow-glow-md ring-2 ring-brand-primary scale-105' : 'shadow-sm';

        let finalStyle = `${style} ${highlightStyle} ${animationClass}`;

        if (highlightedClassrooms && highlightedClassrooms.size > 0 && !highlightedClassrooms.has(item.name)) {
            finalStyle += ' opacity-40';
        }

        return { style: finalStyle, text, icon };
    };

    return (
        <div className="grid grid-cols-2 grid-rows-[repeat(11,auto)] gap-3 w-full">
           {layout.map(item => {
                const { style, text, icon } = getStatusInfo(item);
                const isClickable = item.type !== 'static';
                
                return (
                     <button
                        key={item.name}
                        disabled={!isClickable}
                        onClick={() => isClickable && onClassroomClick(item.name)}
                        className={`border rounded-xl p-2 flex flex-col justify-center items-center transition-all duration-300 h-16 ${isClickable ? 'cursor-pointer' : 'cursor-default'} ${style}`}
                        style={{ gridColumn: item.gridColumn, gridRow: item.gridRow }}
                    >
                        <div className="flex items-center gap-1.5">
                            {icon}
                            <p className="font-bold text-sm text-center">{item.name}</p>
                        </div>
                        <p className="text-xs text-center truncate w-full">{text}</p>
                     </button>
                );
           })}
        </div>
    );
};

export default FloorPlan;
