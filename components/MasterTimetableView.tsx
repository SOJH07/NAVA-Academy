import React, { useMemo } from 'react';
import type { Assignment } from '../types';
import MasterSessionCard from './MasterSessionCard';

const DAYS: Assignment['day'][] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

interface MasterTimetableViewProps {
    assignments: Assignment[];
    focusedInstructor: string | null;
    setFocusedInstructor: (instructor: string | null) => void;
    showTooltip: (content: React.ReactNode, e: React.MouseEvent) => void;
    hideTooltip: () => void;
}


const MasterTimetableView: React.FC<MasterTimetableViewProps> = ({ assignments, focusedInstructor, setFocusedInstructor, showTooltip, hideTooltip }) => {
    const assignmentsByDay = useMemo(() => {
        const data: { [day: string]: Assignment[] } = {};
        for (const day of DAYS) {
            const dayAssignments = assignments.filter(a => a.day === day);
            const periodOrder: { [key: string]: number } = {};
            for (let i = 1; i <= 7; i++) {
                periodOrder[`P${i}`] = i;
            }
            
            dayAssignments.sort((a, b) => {
                const periodA = periodOrder[a.period] || 99;
                const periodB = periodOrder[b.period] || 99;
                if (periodA !== periodB) {
                    return periodA - periodB;
                }
                if (a.type !== b.type) {
                    return a.type === 'Technical' ? -1 : 1;
                }
                return a.group.localeCompare(b.group);
            });
            data[day] = dayAssignments;
        }
        return data;
    }, [assignments]);

    return (
        <div className="bg-bg-panel border border-slate-200 rounded-lg shadow-sm h-full flex flex-col">
            <div className="grid grid-cols-5 flex-shrink-0 sticky top-0 bg-white z-10">
                {DAYS.map(day => (
                    <div key={day} className="text-center font-bold text-base md:text-lg text-text-primary border-b border-r border-slate-200 p-3 last:border-r-0 bg-slate-50">
                        {day}
                    </div>
                ))}
            </div>
            <div className="flex-grow overflow-y-auto">
                <div className="grid grid-cols-5 min-h-full">
                    {DAYS.map(day => (
                        <div key={day} className="border-r border-slate-200 last:border-r-0 p-2 space-y-2 bg-slate-50/30">
                            {assignmentsByDay[day].map(assignment => (
                                <MasterSessionCard 
                                    key={assignment.id.toString()}
                                    assignment={assignment}
                                    focusedInstructor={focusedInstructor}
                                    setFocusedInstructor={setFocusedInstructor}
                                    showTooltip={showTooltip}
                                    hideTooltip={hideTooltip}
                                />
                            ))}
                            {assignmentsByDay[day].length === 0 && (
                                <div className="text-center text-sm text-text-muted py-4">No sessions</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default MasterTimetableView;
