import React from 'react';
import type { FloorPlanItem, OccupancyData, ClassroomState, Assignment } from '../types';

const WarningIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w.org/2000/svg" className={`h-4 w-4 ${className}`} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.636-1.214 2.852-1.214 3.488 0l5.584 10.68c.636 1.214-.474 2.721-1.744 2.721H4.417c-1.27 0-2.38-1.507-1.744-2.721L8.257 3.099zM10 12a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 011 1v1a1 1 0 11-2 0V9a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);

const CapacityRing: React.FC<{ current: number; max: number; type: 'industrial' | 'service' | 'professional'}> = ({ current, max, type }) => {
    const radius = 12;
    const circumference = 2 * Math.PI * radius;
    const offset = max > 0 ? circumference - (current / max) * circumference : circumference;

    const colorClasses = {
        industrial: 'text-status-industrial',
        service: 'text-status-tech',
        professional: 'text-status-professional'
    };

    return (
        <div className="relative w-8 h-8 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 32 32">
                <circle className="text-slate-200 dark:text-dark-panel-hover" stroke="currentColor" strokeWidth="3" fill="transparent" r={radius} cx="16" cy="16" />
                <circle className={colorClasses[type]} stroke="currentColor" strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" fill="transparent" r={radius} cx="16" cy="16" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{current}</span>
        </div>
    );
};

interface RoomCardProps {
    item: FloorPlanItem;
    assignment: Assignment | undefined;
    manualState: ClassroomState[string];
    occupiedInfo: OccupancyData[string];
    isSelected: boolean;
    isInPath: boolean;
    isPathFocused: boolean;
    highlightedClassrooms: Set<string> | undefined;
    onClick: (classroomName: string, target: HTMLElement) => void;
    groupSize: number;
    cardHeightClass: string;
}

const RoomCard: React.FC<RoomCardProps> = (props) => {
    const { 
        item, assignment, manualState, occupiedInfo,
        isSelected, isInPath, isPathFocused, highlightedClassrooms,
        onClick, groupSize, cardHeightClass
    } = props;

    // Occupied Room Logic
    if (assignment) {
        let trackColorClass = 'border-slate-300 dark:border-slate-600';
        if (occupiedInfo) {
            if (occupiedInfo.trackType === 'industrial') trackColorClass = 'border-status-industrial';
            else if (occupiedInfo.trackType === 'service') trackColorClass = 'border-status-tech';
            else if (occupiedInfo.trackType === 'professional') trackColorClass = 'border-status-professional';
        }
        
        let baseClasses = `border-l-[6px] rounded-lg flex flex-col text-left transition-all duration-300 w-full ${cardHeightClass} p-3 shadow-md min-w-0 bg-kiosk-panel text-kiosk-text-body ${trackColorClass}`;

        if (manualState?.status === 'out-of-service') {
            baseClasses = `border-l-[6px] border-amber-500 rounded-lg flex flex-col justify-center text-left w-full ${cardHeightClass} p-3 shadow-md min-w-0 bg-kiosk-panel`;
        }
        
        if (isPathFocused && !isInPath) baseClasses += ' opacity-30';
        if (isSelected) baseClasses += ' scale-105 ring-2 ring-kiosk-primary z-10';
        if (highlightedClassrooms?.size && !highlightedClassrooms.has(item.name)) baseClasses += ' opacity-40';
        
        return (
            <button
                onClick={(e) => onClick(item.name, e.currentTarget)}
                title={`Name: ${item.name}\nType: ${item.type}\nCapacity: ${item.capacity || 'N/A'}\nTopic: ${assignment.topic}`}
                className={`cursor-pointer relative ${baseClasses}`}
            >
                {manualState?.status === 'out-of-service' ? (
                    <>
                        <div className="flex items-center gap-3 text-amber-600">
                            <WarningIcon className="h-6 w-6 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="font-bold text-xl">Out of Service</p>
                                <p className="text-base truncate font-medium">{manualState.reason}</p>
                            </div>
                        </div>
                        <div className="mt-2 text-left pt-2 border-t border-amber-400/50">
                            <p className="font-bold text-xl text-kiosk-text-muted opacity-60">{assignment.group}</p>
                            <p className="text-xs truncate text-kiosk-text-muted opacity-60">{item.name} | {assignment.instructors.join(', ')}</p>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Top Row: Room Name and LIVE badge */}
                        <div className="flex justify-between items-start">
                            <p className="font-extrabold text-2xl text-kiosk-text-title leading-tight truncate">{item.name}</p>
                            <span className="px-2 py-0.5 text-[10px] font-bold text-amber-800 rounded-full bg-amber-400 shadow">LIVE</span>
                        </div>

                        {/* Middle section: Group, Topic */}
                        <div className="flex-grow my-1 space-y-1 text-sm text-kiosk-text-muted min-h-0 flex flex-col justify-center">
                            <p className="font-bold text-base text-kiosk-text-body truncate">{assignment.group}</p>
                            <p className="text-xs line-clamp-2 break-words">{assignment.topic}</p>
                        </div>

                        {/* Bottom Row: Instructor and Capacity */}
                        <div className="flex-shrink-0 text-xs font-medium mt-auto pt-2 border-t border-kiosk-border/50 w-full flex justify-between items-center">
                            <div className="truncate font-semibold text-kiosk-text-body">{assignment.instructors.join(', ')}</div>
                            {occupiedInfo && <CapacityRing current={groupSize} max={item.capacity || 20} type={occupiedInfo.trackType} />}
                        </div>
                    </>
                )}
            </button>
        );
    }

    // Vacant/Static Room
    const isClickable = item.type !== 'static';
    let baseClasses = `rounded-lg flex items-center justify-center text-center p-4 shadow-sm min-w-0 ${cardHeightClass} text-2xl font-bold whitespace-pre-wrap text-wrap-balance transition-all`;

    if(manualState?.status === 'out-of-service') {
            baseClasses += ' bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400';
    } else {
            baseClasses += ' bg-white dark:bg-dark-panel border border-slate-200 dark:border-dark-border text-slate-400 dark:text-slate-500';
    }
    
    if (isPathFocused) baseClasses += ' opacity-30';

    return (
        <button
            disabled={!isClickable}
            onClick={(e) => isClickable && onClick(item.name, e.currentTarget)}
            title={isClickable ? `Name: ${item.name}\nType: ${item.type}` : item.name}
            className={`${isClickable ? 'cursor-pointer hover:scale-105 hover:shadow-md' : 'cursor-default'} ${baseClasses}`}
        >
            {manualState?.status === 'out-of-service' ? (
                <div className="flex flex-col items-center">
                    <WarningIcon className="h-6 w-6 mb-2" />
                    {item.name}
                    <span className="text-sm font-medium mt-1">({manualState.reason})</span>
                </div>
            ) : (
                item.name
            )}
        </button>
    );
};

export default React.memo(RoomCard);
