import React, { useState, useEffect, useMemo } from 'react';
import useScheduleStore from '../hooks/useScheduleStore';
import type { Assignment, DailyPeriod, GroupInfo, AnalyzedStudent, StudentGrades } from '../types';
import { allInstructors } from '../data/scheduleData';
import DailyTimetableView from '../components/DailyTimetableView';
import WeeklyScheduleView from '../components/WeeklyScheduleView';
import DailyScheduleView from '../components/DailyScheduleView';
import TeachingLoad from '../components/TeachingLoad';
import useAppStore from '../hooks/useAppStore';
import { useDebounce } from '../hooks/useDebounce';

const DAYS: Assignment['day'][] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
const NAVA_UNITS: (keyof StudentGrades)[] = ['nava001', 'nava002', 'nava003', 'nava004', 'nava005', 'nava006', 'nava007', 'nava008'];


type ViewMode = 'weekly' | 'daily' | 'table' | 'load';
type Density = 'comfortable' | 'compact';

const Tooltip: React.FC<{ content: React.ReactNode, position: { x: number, y: number } | null }> = ({ content, position }) => {
    if (!position) return null;
    return (
        <div 
            className="fixed z-50 bg-gray-800 text-white p-2 text-sm rounded-lg shadow-xl transition-opacity duration-200 pointer-events-none"
            style={{ top: position.y + 15, left: position.x + 15 }}
        >
            {content}
        </div>
    );
};

interface InstructorSchedulePageProps {
    groupInfo: GroupInfo;
    groupCompanyMap: Record<string, string[]>;
    dailySchedule: DailyPeriod[];
    currentPeriod: DailyPeriod | null;
    now: Date;
    allStudents: AnalyzedStudent[];
}

const InstructorSchedulePage: React.FC<InstructorSchedulePageProps> = (props) => {
    const { groupInfo, groupCompanyMap, dailySchedule, currentPeriod, now, allStudents } = props;
    const { filters, globalSearchTerm } = useAppStore();
    const debouncedSearchTerm = useDebounce(globalSearchTerm, 300);
    
    const { getAssignments } = useScheduleStore();
    const [viewMode, setViewMode] = useState<ViewMode>('weekly');
    const [density, setDensity] = useState<Density>('comfortable');
    const [selectedDay, setSelectedDay] = useState<Assignment['day']>(DAYS[now.getDay()] ?? 'Sunday');
    const [focusedInstructor, setFocusedInstructor] = useState<string | null>(null);
    const [tooltipState, setTooltipState] = useState<{ content: React.ReactNode, position: {x: number, y: number} } | null>(null);

    const allAssignments = useMemo(() => getAssignments(), [getAssignments]);
    
    const liveDay = useMemo(() => DAYS[now.getDay()] ?? null, [now]);

    const filteredAssignments = useMemo(() => {
        let assignments = allAssignments;
        let studentFilteredGroups: Set<string> | null = null;
    
        const applyStudentFilter = (filterFn: (student: AnalyzedStudent) => boolean) => {
            const matchingGroups = new Set(allStudents.filter(filterFn).map(s => s.techGroup));
            if (studentFilteredGroups === null) {
                studentFilteredGroups = matchingGroups;
            } else {
                studentFilteredGroups = new Set([...studentFilteredGroups].filter(group => matchingGroups.has(group)));
            }
        };
    
        if (filters.technicalGrades.length > 0) {
            applyStudentFilter(s => s.grades && NAVA_UNITS.some(unit => { const grade = s.grades?.[unit]; return grade ? filters.technicalGrades.includes(grade) : false; }));
        }

        if (filters.gpaRange[0] > 0 || filters.gpaRange[1] < 4) {
            applyStudentFilter(s => s.gpa !== null && s.gpa >= filters.gpaRange[0] && s.gpa <= filters.gpaRange[1]);
        }
    
        if (studentFilteredGroups !== null) {
            if (studentFilteredGroups.size > 0) {
                assignments = assignments.filter(a => studentFilteredGroups!.has(a.group));
            } else {
                return [];
            }
        }

        if (focusedInstructor) {
            assignments = assignments.filter(a => a.instructors.includes(focusedInstructor));
        }
        
        if (filters.companies.length > 0) {
            assignments = assignments.filter(a => {
                const companiesInGroup = groupCompanyMap[a.group] || [];
                return filters.companies.some(c => companiesInGroup.includes(c));
            });
        }
        
        if (filters.techTracks.length > 0) {
            assignments = assignments.filter(a => {
                if (a.type === 'Professional Development') return true; 
                const track = groupInfo[a.group]?.track_name;
                return track && filters.techTracks.includes(track);
            });
        }

        if (filters.techGroups.length > 0) {
            assignments = assignments.filter(a => filters.techGroups.includes(a.group));
        }

        if (filters.classrooms.length > 0) {
            assignments = assignments.filter(a => filters.classrooms.some(c => `C-${a.classroom.replace('.', '')}` === c || a.classroom === c));
        }

        if (debouncedSearchTerm) {
            const lowercasedFilter = debouncedSearchTerm.toLowerCase();
            const matchingStudents = allStudents.filter(student =>
              student.fullName.toLowerCase().includes(lowercasedFilter) ||
              // FIX: Used `toString()` to ensure the search is performed on a string representation of the navaId.
              student.navaId.toString().includes(lowercasedFilter)
            );
            const studentGroups = new Set(matchingStudents.map(s => s.techGroup));
            
            const matchingInstructors = [...allInstructors.tech, ...allInstructors.professional].filter(
                inst => inst.toLowerCase().includes(lowercasedFilter)
            );

            if (studentGroups.size > 0 || matchingInstructors.length > 0) {
                assignments = assignments.filter(a => 
                    studentGroups.has(a.group) || 
                    a.instructors.some(i => matchingInstructors.includes(i))
                );
            } else {
                return [];
            }
        }

        return assignments;
    }, [allAssignments, filters, focusedInstructor, groupCompanyMap, groupInfo, debouncedSearchTerm, allStudents]);


    const teachingLoad = useMemo(() => {
        const counts: { [key: string]: { count: number; type: 'tech' | 'professional' } } = {};
    
        const relevantInstructors = new Set<string>([...allInstructors.tech, ...allInstructors.professional]);

        relevantInstructors.forEach(instructor => {
            const assignmentsForInstructor = filteredAssignments.filter(a => a.instructors.includes(instructor));
            if (assignmentsForInstructor.length > 0) {
                const type = assignmentsForInstructor[0].type === 'Technical' ? 'tech' : 'professional';
                counts[instructor] = { count: assignmentsForInstructor.length, type };
            }
        });

        return Object.entries(counts).map(([instructor, data]) => ({
            instructor,
            count: data.count,
            type: data.type
        }));
    }, [filteredAssignments]);

    const showTooltip = (content: React.ReactNode, e: React.MouseEvent) => setTooltipState({ content, position: { x: e.clientX, y: e.clientY } });
    const hideTooltip = () => setTooltipState(null);

    const handleDayClick = (day: Assignment['day']) => {
        setSelectedDay(day);
        setViewMode('daily');
    };

    const renderView = () => {
        switch (viewMode) {
            case 'daily':
                return <DailyScheduleView 
                            assignments={filteredAssignments} 
                            selectedDay={selectedDay}
                            isLiveDay={selectedDay === liveDay}
                            density={density}
                            currentPeriod={currentPeriod}
                            focusedInstructor={focusedInstructor}
                            setFocusedInstructor={setFocusedInstructor}
                            showTooltip={showTooltip}
                            hideTooltip={hideTooltip}
                            groupInfo={groupInfo}
                        />
            case 'table':
                 return <DailyTimetableView 
                            periods={dailySchedule}
                            assignments={filteredAssignments.filter(a => a.day === selectedDay)} 
                            selectedDay={selectedDay}
                            isLiveDay={selectedDay === liveDay}
                            currentPeriod={currentPeriod}
                            groupInfo={groupInfo}
                            focusedInstructor={focusedInstructor}
                            allInstructors={allInstructors}
                        />
            case 'load':
                return <TeachingLoad 
                            loadData={teachingLoad}
                            focusedInstructor={focusedInstructor}
                            setFocusedInstructor={setFocusedInstructor}
                        />
            case 'weekly':
            default:
                return <WeeklyScheduleView 
                            assignments={filteredAssignments}
                            onDayClick={handleDayClick}
                            density={density}
                            selectedDay={selectedDay}
                            liveToday={liveDay}
                            currentPeriod={currentPeriod}
                            focusedInstructor={focusedInstructor}
                            setFocusedInstructor={setFocusedInstructor}
                            showTooltip={showTooltip}
                            hideTooltip={hideTooltip}
                        />;
        }
    }
    
    return (
        <div className="flex flex-col h-full">
            <Tooltip content={tooltipState?.content} position={tooltipState?.position} />
            {/* Header Controls */}
            <div className="flex-shrink-0 flex flex-wrap justify-between items-center gap-4 mb-4">
                 <div className="flex items-center gap-2 bg-slate-100 dark:bg-dark-panel p-1 rounded-lg">
                    <button onClick={() => setViewMode('weekly')} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${viewMode === 'weekly' ? 'bg-white dark:bg-dark-panel-hover shadow' : 'hover:bg-white/60 dark:hover:bg-dark-panel-hover/60'}`}>Weekly</button>
                    <button onClick={() => setViewMode('daily')} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${viewMode === 'daily' ? 'bg-white dark:bg-dark-panel-hover shadow' : 'hover:bg-white/60 dark:hover:bg-dark-panel-hover/60'}`}>Daily</button>
                    <button onClick={() => setViewMode('table')} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-dark-panel-hover shadow' : 'hover:bg-white/60 dark:hover:bg-dark-panel-hover/60'}`}>Table</button>
                     <button onClick={() => setViewMode('load')} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${viewMode === 'load' ? 'bg-white dark:bg-dark-panel-hover shadow' : 'hover:bg-white/60 dark:hover:bg-dark-panel-hover/60'}`}>Load</button>
                </div>

                <div className="flex items-center gap-4">
                     {viewMode !== 'load' && (
                        <div className="flex items-center gap-1">
                            {DAYS.map(day => (
                                <button key={day} onClick={() => setSelectedDay(day)} className={`px-3 py-1.5 text-sm font-semibold rounded-full border-2 transition-colors ${selectedDay === day ? 'bg-brand-secondary text-white border-brand-secondary' : 'bg-white dark:bg-dark-panel border-slate-300 dark:border-dark-border hover:border-slate-400'}`}>
                                    {day.substring(0,1)}
                                </button>
                            ))}
                        </div>
                     )}
                     {(viewMode === 'weekly' || viewMode === 'daily') && (
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-dark-panel p-1 rounded-lg">
                           <button onClick={() => setDensity('comfortable')} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${density === 'comfortable' ? 'bg-white dark:bg-dark-panel-hover shadow' : 'hover:bg-white/60 dark:hover:bg-dark-panel-hover/60'}`}>Comfortable</button>
                           <button onClick={() => setDensity('compact')} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${density === 'compact' ? 'bg-white dark:bg-dark-panel-hover shadow' : 'hover:bg-white/60 dark:hover:bg-dark-panel-hover/60'}`}>Compact</button>
                        </div>
                     )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow min-h-0">
                {renderView()}
            </div>
        </div>
    );
};

export default InstructorSchedulePage;
