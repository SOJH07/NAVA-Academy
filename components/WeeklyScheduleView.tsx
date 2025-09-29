import React, { useMemo, useState } from 'react';
import type { Assignment, DailyPeriod } from '../types';
import SessionCard from './SessionCard';

const DAYS: Assignment['day'][] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
const PERIODS: Assignment['period'][] = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'];

const MAX_VISIBLE_ITEMS = 4;

interface WeeklyScheduleViewProps {
    assignments: Assignment[];
    onDayClick: (day: Assignment['day']) => void;
    density: 'comfortable' | 'compact';
    selectedDay: Assignment['day'];
    liveToday: Assignment['day'] | null;
    currentPeriod: DailyPeriod | null;
    focusedInstructor: string | null;
    setFocusedInstructor: (instructor: string | null) => void;
    showTooltip: (content: React.ReactNode, e: React.MouseEvent) => void;
    hideTooltip: () => void;
}

const WeeklyScheduleView: React.FC<WeeklyScheduleViewProps> = ({ assignments, onDayClick, density, selectedDay, liveToday, currentPeriod, focusedInstructor, setFocusedInstructor, showTooltip, hideTooltip }) => {
    
    const [expandedCells, setExpandedCells] = useState<Record<string, boolean>>({});

    const handleToggleExpand = (cellKey: string) => {
        setExpandedCells(prev => ({...prev, [cellKey]: !prev[cellKey]}));
    }

    const assignmentsByDayAndPeriod = useMemo(() => {
        const data: { [day: string]: { [period: string]: Assignment[] } } = {};
        for (const day of DAYS) {
            data[day] = {};
            for (const period of PERIODS) {
                data[day][period] = [];
            }
        }
        assignments.forEach(a => {
            if (data[a.day] && data[a.day][a.period]) {
                data[a.day][a.period].push(a);
            }
        });
        return data;
    }, [assignments]);

    return (
        <div className="bg-bg-panel border border-slate-200 rounded-lg shadow-sm h-full flex flex-col">
            <div className="grid grid-cols-5 flex-shrink-0 sticky top-0 bg-white z-10">
                {DAYS.map(day => (
                    <button 
                        key={day} 
                        onClick={() => onDayClick(day)}
                        className={`text-center font-bold text-base md:text-lg text-text-primary border-b border-r border-slate-200 p-3 last:border-r-0 hover:bg-slate-100 transition-colors relative ${day === liveToday ? 'bg-amber-100 text-amber-800' : (day === selectedDay ? 'bg-slate-100' : 'bg-slate-50')}`}
                    >
                        {day}
                        {day === liveToday && <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white" title="Today"></span>}
                    </button>
                ))}
            </div>
            <div className="flex-grow overflow-y-auto">
                <div className="grid grid-cols-1 divide-y divide-slate-200">
                    {PERIODS.map(period => {
                        const isLivePeriod = period === currentPeriod?.name;
                         return (
                             <div key={period} className={`grid grid-cols-5 auto-rows-fr min-h-[12rem] ${isLivePeriod ? 'bg-amber-50/50' : ''}`}>
                                 {DAYS.map(day => {
                                    const cellKey = `${day}-${period}`;
                                    const isExpanded = expandedCells[cellKey];
                                    const isLiveCell = isLivePeriod && day === liveToday;

                                    const cellAssignments = (assignmentsByDayAndPeriod[day]?.[period] || []).sort((a, b) => {
                                        if (a.type === b.type) return a.group.localeCompare(b.group);
                                        return a.type === 'Technical' ? -1 : 1;
                                    });
                                    
                                    const techAssignments = cellAssignments.filter(a => a.type === 'Technical');
                                    const professionalAssignments = cellAssignments.filter(a => a.type === 'Professional Development');

                                    const visibleAssignments = isExpanded ? cellAssignments : cellAssignments.slice(0, MAX_VISIBLE_ITEMS);
                                    const hiddenCount = cellAssignments.length - visibleAssignments.length;

                                    const visibleTech = visibleAssignments.filter(a => a.type === 'Technical');
                                    const visibleProfessional = visibleAssignments.filter(a => a.type === 'Professional Development');

                                    return (
                                        <div key={cellKey} className={`relative border-r border-slate-200 p-2 last:border-r-0 transition-all duration-300 ${isLiveCell ? 'bg-amber-100' : (day === liveToday ? 'bg-amber-50/20' : '')}`}>
                                            {isLiveCell && <div className="absolute inset-0 ring-2 ring-amber-400 rounded-lg pointer-events-none"></div>}
                                            <div className={`absolute top-2 right-2 text-xs font-bold select-none ${isLivePeriod ? 'text-amber-600 animate-pulse' : 'text-slate-300'}`}>{period}</div>
                                            <div className="pt-4 flex flex-col gap-1.5">
                                                {techAssignments.length > 0 && <h4 className="text-xs font-bold text-status-tech mb-1 mt-2">Technical</h4>}
                                                {visibleTech.map(a => <SessionCard key={a.id.toString()} assignment={a} isLive={isLiveCell} density={density} focusedInstructor={focusedInstructor} setFocusedInstructor={setFocusedInstructor} showTooltip={showTooltip} hideTooltip={hideTooltip} />)}
                                                
                                                {professionalAssignments.length > 0 && techAssignments.length > 0 && <hr className="my-2 border-slate-200/80" />}

                                                {professionalAssignments.length > 0 && <h4 className="text-xs font-bold text-status-professional mb-1">Professional Development</h4>}
                                                {visibleProfessional.map(a => <SessionCard key={a.id.toString()} assignment={a} isLive={isLiveCell} density={density} focusedInstructor={focusedInstructor} setFocusedInstructor={setFocusedInstructor} showTooltip={showTooltip} hideTooltip={hideTooltip} />)}
                                                
                                                {hiddenCount > 0 && !isExpanded && (
                                                    <button onClick={() => handleToggleExpand(cellKey)} className="text-sm font-bold text-brand-primary hover:underline mt-2 text-left">
                                                        + {hiddenCount} more
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default WeeklyScheduleView;