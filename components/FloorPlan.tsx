import React, { useMemo } from 'react';
import type { FloorPlanItem, OccupancyData, ClassroomState, DailyPeriod, Assignment, FocusedPath, FloorId } from '../types';
import RoomCard from './RoomCard';

const scheduleCodeToId = (code: string): string => {
    return code.replace('0.', '').replace('.', '');
};

const schematicNameToId = (name: string): string => {
    const match = name.match(/(C|Lab|L|WS)-?\s?(\d+)/);
    if (!match) return name; 
    const prefix = match[1];
    const number = match[2];
    if (prefix === 'WS') {
        return `WS-${parseInt(number, 10)}`;
    }
    return number;
};


interface FloorPlanProps {
    layout: FloorPlanItem[];
    occupancy: OccupancyData;
    selectedClassroom: string | null;
    onClassroomClick: (classroomName: string, target: HTMLElement) => void;
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
    cardHeightClass?: string;
}

const FloorPlan: React.FC<FloorPlanProps> = (props) => {
    const { 
        layout, occupancy, selectedClassroom, onClassroomClick, highlightedClassrooms, classroomState,
        floor, currentPeriod, dailyAssignments, allDailyAssignments, isHeatmapVisible, roomUsage, focusedPath, onSetFocusedPath, groupStudentCounts, isOperationalHours,
        cardHeightClass: cardHeightClassFromProps
    } = props;
    
    const isClassTime = isOperationalHours && currentPeriod?.type === 'class';
    const cardHeightClass = cardHeightClassFromProps || "h-40";
    
    const assignmentsForCurrentPeriod = useMemo(() => {
        if (!isClassTime || !currentPeriod) return [];
        return dailyAssignments.filter(a => a.period === currentPeriod.name);
    }, [isClassTime, currentPeriod, dailyAssignments]);

    return (
        <div className="w-full p-4 grid grid-cols-2 gap-4">
           {layout.map((item, index) => {
               const key = item.name + index;

                if (isHeatmapVisible) {
                    const usage = roomUsage[item.name] || 0;
                    // FIX: Cast Object.values(roomUsage) to number[] to resolve incorrect type inference
                    // where it was treated as unknown[], causing an error with the spread operator.
                    const maxUsage = Math.max(...(Object.values(roomUsage) as number[]), 1);
                    const usagePercent = (usage / maxUsage);
                    let bgColor = 'bg-green-400';
                    if (usagePercent > 0.33) bgColor = 'bg-yellow-400';
                    if (usagePercent > 0.66) bgColor = 'bg-red-400';

                     return (
                        <div key={key} className={`rounded-lg flex items-center justify-center p-2 text-center text-xs font-bold text-black/70 ${bgColor} ${cardHeightClass}`}>
                            {item.name} ({usage})
                        </div>
                    );
                }
                
                const schematicId = schematicNameToId(item.name);
        
                const assignment = assignmentsForCurrentPeriod.find(a => {
                    const scheduleId = scheduleCodeToId(a.classroom);
                    
                    if (!schematicId || !scheduleId) return false;

                    if (scheduleId.startsWith('WS')) {
                        return schematicId === scheduleId;
                    }
                    if (schematicId.length === 3 && scheduleId.length === 3 && schematicId === scheduleId) {
                        return true;
                    }
                    return false;
                });

                const manualState = classroomState[item.name];
                const occupiedInfo = assignment ? occupancy[assignment.classroom] : undefined;
                const groupSize = assignment ? (groupStudentCounts[assignment.group] || 0) : 0;
                
                const isPathFocused = focusedPath !== null;
                let isInPath = false;
                if (isPathFocused && assignment) {
                    const assignmentId = focusedPath.type === 'group' ? assignment.group : assignment.instructors.join(',');
                    isInPath = assignmentId.includes(focusedPath.id);
                }
                
                return (
                    <RoomCard
                        key={key}
                        item={item}
                        assignment={assignment}
                        manualState={manualState}
                        occupiedInfo={occupiedInfo}
                        isSelected={selectedClassroom === item.name}
                        isInPath={isInPath}
                        isPathFocused={isPathFocused}
                        highlightedClassrooms={highlightedClassrooms}
                        onClick={onClassroomClick}
                        groupSize={groupSize}
                        cardHeightClass={cardHeightClass}
                    />
                );
           })}
        </div>
    );
};

export default FloorPlan;