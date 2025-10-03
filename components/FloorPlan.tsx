import React from 'react';
import type { FloorPlanItem, OccupancyData, ClassroomState, DailyPeriod, Assignment, FocusedPath, FloorId } from '../types';

interface FloorPlanProps {
    layout: FloorPlanItem[];
    occupancy: OccupancyData;
    selectedClassroom: string | null;
    onClassroomClick: (classroomName: string) => void;
    highlightedClassrooms?: Set<string>;
    classroomState: ClassroomState;
    floor: FloorId;
    currentPeriod: DailyPeriod | null;
    dailyAssignments: Assignment[];
    allDailyAssignments: Assignment[];
    isHeatmapVisible: boolean;
    roomUsage: { [key: string]: number };
    focusedPath: FocusedPath;
    onSetFocusedPath: (path: FocusedPath) => void;
    groupStudentCounts: { [key: string]: number };
    isOperationalHours: boolean;
}

const WarningIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${className}`} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.636-1.214 2.852-1.214 3.488 0l5.584 10.68c.636 1.214-.474 2.721-1.744 2.721H4.417c-1.27 0-2.38-1.507-1.744-2.721L8.257 3.099zM10 12a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 011 1v1a1 1 0 11-2 0V9a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);

const CapacityRing: React.FC<{ current: number; max: number; type: 'industrial' | 'service' | 'professional'}> = ({ current, max, type }) => {
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const offset = max > 0 ? circumference - (current / max) * circumference : circumference;

    const colorClasses = {
        industrial: 'text-status-industrial',
        service: 'text-status-tech',
        professional: 'text-status-professional'
    };

    return (
        <div className="relative w-10 h-10 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
                <circle className="text-slate-200 dark:text-dark-panel-hover" stroke="currentColor" strokeWidth="4" fill="transparent" r={radius} cx="20" cy="20" />
                <circle className={colorClasses[type]} stroke="currentColor" strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" fill="transparent" r={radius} cx="20" cy="20" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{current}</span>
        </div>
    );
};


// Helper to parse a group name from a room's full name
const parseGroupName = (name: string): string | null => {
    const match = name.match(/(DP(IT|ST)-\d{2})/);
    return match ? match[0] : null;
};

// Helper to format a classroom code from the schedule data
const formatClassroomCode = (code: string): string => {
    if (code.startsWith('WS-')) return code;
    return `C-${code.replace('.', '')}`;
};


const FloorPlan: React.FC<FloorPlanProps> = (props) => {
    // FIX: Add missing 'roomUsage' prop to destructuring to fix heatmap rendering errors.
    const { 
        layout, occupancy, selectedClassroom, onClassroomClick, highlightedClassrooms, classroomState, floor,
        currentPeriod, dailyAssignments, allDailyAssignments, isHeatmapVisible, roomUsage, focusedPath, onSetFocusedPath, groupStudentCounts, isOperationalHours
    } = props;
    
    const activeAssignmentsByGroup = React.useMemo(() => {
        if (!currentPeriod || currentPeriod.type === 'break') return new Map<string, Assignment>();
        const map = new Map<string, Assignment>();
        dailyAssignments.filter(a => a.period === currentPeriod?.name).forEach(a => map.set(a.group, a));
        return map;
    }, [currentPeriod, dailyAssignments]);
    
    const isStandardGrid = ['first', 'second', 'third'].includes(floor);
    const gridClasses = isStandardGrid
        ? "grid grid-cols-2 gap-5"
        : `grid grid-cols-[repeat(15,minmax(0,1fr))] grid-rows-[repeat(6,minmax(0,1fr))] gap-x-2 gap-y-3`;


    const renderHeatmapView = () => {
        const maxUsage = Math.max(...Object.values(roomUsage), 1);
        return layout.filter(item => item.type !== 'static').map(item => {
            const usage = roomUsage[item.name] || 0;
            const intensity = usage / maxUsage;
            const hue = 120 * (1 - intensity); // 120 (green) -> 0 (red)
            const color = `hsl(${hue}, 80%, 60%)`;

            const gridStyle = isStandardGrid ? {} : { gridColumn: item.gridColumn, gridRow: item.gridRow };

            return (
                <div key={item.name} style={gridStyle} className="w-full h-full rounded-xl flex flex-col items-center justify-center text-center p-2 shadow-sm transition-all min-w-0" title={`${item.name}\nUsage: ${usage} periods/week`}>
                    <div className="w-full h-full rounded-lg flex flex-col items-center justify-center" style={{backgroundColor: color, color: intensity > 0.6 ? 'white' : 'black'}}>
                        <p className="font-bold text-xs break-words">{item.name.replace(/DP(IT|ST)-\d{2}/, '').trim()}</p>
                        <p className="font-mono text-lg font-extrabold">{usage}</p>
                    </div>
                </div>
            )
        });
    };

    const renderStaticView = () => {
        return layout.map(item => {
            let baseClasses = 'border rounded-xl flex flex-col items-center justify-center text-center transition-all duration-300 w-full h-full p-2 shadow-sm min-w-0';
            
            if (item.type === 'classroom') {
                 baseClasses += ' bg-classroom-idle-bg border-classroom-idle-border text-classroom-idle-text dark:bg-classroom-idle-dark-bg dark:border-classroom-idle-dark-border dark:text-classroom-idle-dark-text';
            } else if (item.type === 'lab' || item.type === 'workshop') {
                baseClasses += ' bg-lab-bg border-lab-border text-lab-text dark:bg-lab-dark-bg dark:border-lab-dark-border dark:text-lab-dark-text';
            } else { // static
                baseClasses += ' bg-common-bg border-common-border text-common-text dark:bg-common-dark-bg dark:border-common-dark-border dark:text-common-dark-text';
            }
            
            const isPathFocused = focusedPath !== null;
            let isInPath = false;
            if (isPathFocused) {
                 isInPath = allDailyAssignments.some(a => {
                    const assignmentId = focusedPath.type === 'group' ? a.group : a.instructors.join(',');
                    // This mapping is fragile but attempts to link schedule classroom codes to floor plan item names
                    const formattedClassroom = formatClassroomCode(a.classroom);
                    return assignmentId.includes(focusedPath.id) && (item.name.includes(formattedClassroom) || item.name.includes(a.group));
                });
            }
             if (isPathFocused && !isInPath) {
                baseClasses += ' opacity-30';
            }

            const isClickable = item.type !== 'static';
            const gridStyle = isStandardGrid ? {} : { gridColumn: item.gridColumn, gridRow: item.gridRow };

            return (
                 <button
                    key={item.name}
                    disabled={!isClickable}
                    onClick={() => isClickable && onClassroomClick(item.name)}
                    title={`Name: ${item.name}\nType: ${item.type}\nCapacity: ${item.capacity || 'N/A'}`}
                    className={`${isClickable ? 'cursor-pointer' : 'cursor-default'} ${baseClasses}`}
                    style={gridStyle}
                >
                    <p className="text-xs font-semibold line-clamp-2 break-words text-wrap-balance">{item.name}</p>
                </button>
            );
        });
    };

    const renderClassTimeView = () => {
        const visibleLayout = layout.filter(item => {
            if (item.type !== 'classroom') return false;
            const group = parseGroupName(item.name);
            return group ? activeAssignmentsByGroup.has(group) : false;
        });

        return visibleLayout.map(item => {
            const group = parseGroupName(item.name);
            if (!group) return null;
            
            const assignment = activeAssignmentsByGroup.get(group);
            if (!assignment) return null;
            
            const manualState = classroomState[item.name];
            const occupiedInfo = occupancy[assignment.classroom];

            let baseClasses = 'border rounded-xl flex flex-col justify-between text-left transition-all duration-300 w-full h-full p-[14px] shadow-md min-w-0';

            if (manualState?.status === 'out-of-service') {
                 baseClasses += ` bg-yellow-100 border-yellow-400 text-yellow-800 dark:bg-yellow-900/50 dark:border-yellow-700 dark:text-yellow-200`;
            } else {
                 baseClasses += ' bg-classroom-active-bg border-classroom-active-border text-classroom-active-text';
            }
             
            const isPathFocused = focusedPath !== null;
            let isInPath = false;
             if (isPathFocused) {
                 const assignmentId = focusedPath.type === 'group' ? assignment.group : assignment.instructors.join(',');
                 isInPath = assignmentId.includes(focusedPath.id);
             }
             if (isPathFocused && !isInPath) {
                 baseClasses += ' opacity-30';
             }

            if (selectedClassroom === item.name) {
                baseClasses += ' scale-105 shadow-glow-md';
            }
            if (highlightedClassrooms && highlightedClassrooms.size > 0 && !highlightedClassrooms.has(item.name)) {
                baseClasses += ' opacity-40';
            }
            
            const groupSize = groupStudentCounts[group] || 0;
            const gridStyle = isStandardGrid ? {} : { gridColumn: item.gridColumn, gridRow: item.gridRow };

            return (
                <button
                    key={item.name}
                    onClick={() => onClassroomClick(item.name)}
                    title={`Name: ${item.name}\nType: ${item.type}\nCapacity: ${item.capacity || 'N/A'}\nTopic: ${assignment.topic}`}
                    className={`cursor-pointer ${baseClasses}`}
                    style={gridStyle}
                >
                    <div className="flex justify-between items-start">
                        <p className="font-extrabold font-clamp-lg">{formatClassroomCode(assignment.classroom)}</p>
                        {occupiedInfo && <CapacityRing current={groupSize} max={item.capacity || 20} type={occupiedInfo.type} />}
                    </div>

                    <div className="flex-grow flex flex-col justify-center my-2 line-clamp-2">
                        <button onClick={(e) => { e.stopPropagation(); onSetFocusedPath({ type: 'group', id: assignment.group })}} className="font-bold text-lg leading-tight text-left hover:underline">{assignment.group}</button>
                        <p className="text-sm font-medium opacity-80 line-clamp-2 break-words">{assignment.topic}</p>
                    </div>

                    <div className="flex-shrink-0 text-xs font-semibold capitalize mt-1 pt-2 border-t border-current border-opacity-20 w-full flex justify-between items-center">
                        <button onClick={(e) => { e.stopPropagation(); onSetFocusedPath({ type: 'instructor', id: assignment.instructors[0] })}} className="truncate hover:underline">
                            {assignment.instructors.join(', ')}
                        </button>
                        {manualState?.status === 'out-of-service' && (
                             <div className="flex items-center gap-1 text-yellow-800 dark:text-yellow-200">
                                <WarningIcon className="h-4 w-4" />
                                <span className="truncate">{manualState.reason}</span>
                             </div>
                        )}
                    </div>
                </button>
            );
        });
    };

    const isClassTime = isOperationalHours && currentPeriod?.type === 'class';
    const classTimeContent = isClassTime ? renderClassTimeView() : [];
    const hasActiveClasses = Array.isArray(classTimeContent) && classTimeContent.filter(Boolean).length > 0;

    return (
        <div className={`w-full p-4 ${gridClasses}`}>
           {isHeatmapVisible 
               ? renderHeatmapView() 
               : (hasActiveClasses ? classTimeContent : renderStaticView())}
        </div>
    );
};

export default FloorPlan;
