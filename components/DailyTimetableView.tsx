import React from 'react';
import type { Assignment, DailyPeriod, GroupInfo } from '../types';

interface DailyTimetableViewProps {
    periods: DailyPeriod[];
    assignments: Assignment[];
    selectedDay: string;
    isLiveDay: boolean;
    currentPeriod: DailyPeriod | null;
    groupInfo: GroupInfo;
    focusedInstructor: string | null;
    allInstructors: { tech: string[], professional: string[] };
}

const TableHeader: React.FC<{isTech?: boolean}> = ({ isTech = false }) => (
    <thead className="text-xs text-slate-500 dark:text-dark-text-muted font-semibold uppercase bg-slate-50 dark:bg-dark-panel">
        <tr>
            <th className="p-2 text-left w-1/3">Instructor</th>
            <th className="p-2 text-left">Group</th>
            <th className="p-2 text-left">Class</th>
            <th className="p-2 text-left w-1/3">{isTech ? 'Topic' : 'Unit'}</th>
        </tr>
    </thead>
);

const TableRow: React.FC<{assignment: Assignment, groupInfo: GroupInfo, hasFocus: boolean, isTech?: boolean}> = ({ assignment, groupInfo, hasFocus, isTech = false }) => {
    const instructorColor = isTech ? 'text-status-tech dark:text-status-tech' : 'text-text-primary dark:text-dark-text-primary';
    const isLab = assignment.classroom.startsWith('1.') || assignment.classroom.startsWith('3.');
    const locationPrefix = isLab ? 'L' : 'C';

    return (
        <tr className={`transition-opacity duration-300 ${!hasFocus ? 'opacity-30' : ''}`}>
            <td className={`p-2 font-bold ${instructorColor}`}>{assignment.instructors.join(', ')}</td>
            <td className="p-2 font-semibold text-text-primary dark:text-dark-text-primary">{assignment.group}</td>
            <td className="p-2 text-text-secondary dark:text-dark-text-secondary">{locationPrefix}-{assignment.classroom.replace('.', '')}</td>
            <td className="p-2 text-text-secondary dark:text-dark-text-secondary">{assignment.topic}</td>
        </tr>
    )
};


const DailyTimetableView: React.FC<DailyTimetableViewProps> = ({ periods, assignments, selectedDay, isLiveDay, currentPeriod, groupInfo, focusedInstructor, allInstructors }) => {

    const classPeriods = periods.filter(p => p.type === 'class');
    const technicalAssignments = assignments.filter(a => a.type === 'Technical');

    return (
        <div className="bg-bg-panel dark:bg-dark-body border border-slate-200 dark:border-dark-border rounded-lg shadow-sm h-full flex flex-col overflow-auto">
            {/* Main Header */}
            <div className="sticky top-0 bg-white dark:bg-dark-body z-20 grid grid-cols-[10rem_1fr] border-b-2 border-slate-200 dark:border-dark-border">
                <div className="p-4 bg-slate-50 dark:bg-dark-panel border-r border-slate-200 dark:border-dark-border flex items-center justify-center">
                    <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">{selectedDay}</h2>
                </div>
                 <div className="p-4 bg-status-tech-light dark:bg-status-tech/20 text-center">
                    <h3 className="text-xl font-bold text-status-tech dark:text-status-tech">Technical</h3>
                </div>
            </div>

            {/* Content */}
            <div className="flex-grow">
                 {classPeriods.map(period => {
                    const techAssignments = technicalAssignments.filter(a => a.period === period.name).sort((a, b) => a.group.localeCompare(b.group));
                    
                    const periodAssignments = assignments.filter(a => a.period === period.name);
                    const assignedInstructors = new Set(periodAssignments.flatMap(a => a.instructors));

                    const availableTechInstructors = allInstructors.tech.filter(inst => !assignedInstructors.has(inst));
                    const availableProfInstructors = allInstructors.professional.filter(inst => !assignedInstructors.has(inst));

                    const isLive = isLiveDay && currentPeriod?.name === period.name;

                    return (
                        <div key={period.name} className={`grid grid-cols-[10rem_1fr] border-b border-slate-200 dark:border-dark-border transition-colors duration-300 ${isLive ? 'bg-amber-100 dark:bg-amber-500/20' : ''}`}>
                            {/* Period Cell */}
                            <div className={`p-4 border-r border-slate-200 dark:border-dark-border flex items-center justify-center ${isLive ? 'bg-amber-200/80 dark:bg-amber-500/30' : 'bg-slate-50 dark:bg-dark-panel/50'}`}>
                                <div className="text-center">
                                    <p className={`font-extrabold text-xl ${isLive ? 'text-amber-800 dark:text-amber-300 animate-pulse' : 'text-text-primary dark:text-dark-text-primary'}`}>{period.name}</p>
                                    <p className={`text-xs font-semibold ${isLive ? 'text-amber-700 dark:text-amber-400' : 'text-text-muted dark:text-dark-text-muted'}`}>{period.start} - {period.end}</p>
                                </div>
                            </div>

                            {/* Tech Panel */}
                            <div className="p-2">
                                {techAssignments.length > 0 && (
                                     <table className="w-full text-sm">
                                        <TableHeader isTech />
                                        <tbody>
                                            {techAssignments.map(a => (
                                                <TableRow 
                                                    key={a.id.toString()} 
                                                    assignment={a} 
                                                    groupInfo={groupInfo}
                                                    hasFocus={!focusedInstructor || a.instructors.includes(focusedInstructor)}
                                                    isTech
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {(availableTechInstructors.length > 0 || availableProfInstructors.length > 0) && (
                                    <div className="mt-2 p-2 bg-green-50 dark:bg-green-500/10 rounded-md">
                                        <h5 className="font-bold text-xs text-green-800 dark:text-green-300 mb-2">Available Instructors</h5>
                                        <div className="space-y-1">
                                            {availableTechInstructors.length > 0 && (
                                                <div className="flex items-start gap-2">
                                                    <span className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary w-20 flex-shrink-0">Technical:</span>
                                                    <div className="flex flex-wrap gap-1">
                                                        {availableTechInstructors.map(inst => (
                                                            <span key={inst} className="px-2 py-0.5 text-xs bg-white dark:bg-dark-panel rounded-full border border-slate-200 dark:border-dark-border text-text-secondary dark:text-dark-text-secondary">{inst}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                             {availableProfInstructors.length > 0 && (
                                                <div className="flex items-start gap-2">
                                                    <span className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary w-20 flex-shrink-0">Professional:</span>
                                                    <div className="flex flex-wrap gap-1">
                                                        {availableProfInstructors.map(inst => (
                                                            <span key={inst} className="px-2 py-0.5 text-xs bg-white dark:bg-dark-panel rounded-full border border-slate-200 dark:border-dark-border text-text-secondary dark:text-dark-text-secondary">{inst}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {techAssignments.length === 0 && availableTechInstructors.length === 0 && availableProfInstructors.length === 0 && (
                                    <div className="p-4 h-full flex items-center justify-center text-sm text-slate-400 dark:text-slate-500">
                                        No scheduled activity.
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                 })}
                 {assignments.length === 0 && (
                    <div className="text-center p-20 text-text-muted dark:text-dark-text-muted">
                        <h3 className="text-lg font-semibold">No technical assignments for {selectedDay}.</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyTimetableView;