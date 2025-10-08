import React, { useState, useMemo } from 'react';
import type { LiveStudent, FoundationGrades, Assignment, DailyPeriod, FloorId, FloorPlanItem } from '../types';
import FloorPlan from '../components/FloorPlan';
import FloorPlanLegend from '../components/FloorPlanLegend';
import StudentDetailCard from '../components/StudentDetailCard';
import { allFloorLayouts } from '../data/floorPlan';
import useClassroomStore from '../hooks/useClassroomStore';
import AutoSizer from 'react-virtualized-auto-sizer';
// @ts-ignore
import { FixedSizeList } from 'react-window';
import useAppStore from '../hooks/useAppStore';
import { useDebounce } from '../hooks/useDebounce';
import LiveStatusSummary from '../components/LiveStatusSummary';
import ClassroomStatusModal from '../components/ClassroomStatusModal';
import { useDashboardData } from '../hooks/useDashboardData';

// FIX: Import 'useLiveStatus' hook to resolve 'Cannot find name' error.
import { useLiveStatus } from '../hooks/useLiveStatus';

interface LiveOperationsPageProps {
  liveStatusData: ReturnType<typeof useLiveStatus>;
}

const FloorTab: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
            isActive
                ? 'bg-white dark:bg-dark-panel-hover text-brand-primary shadow-sm'
                : 'text-text-muted hover:bg-slate-200 dark:hover:bg-dark-panel-hover/50'
        }`}
    >
        {label}
    </button>
);

const NAVA_UNITS: (keyof FoundationGrades)[] = ['nava001', 'nava002', 'nava003', 'nava004', 'nava005', 'nava006', 'nava007', 'nava008'];

const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
};

const TimelineScrubber: React.FC<{ dailySchedule: DailyPeriod[], simulatedTime: number | null, setSimulatedTime: (time: number | null) => void }> = ({ dailySchedule, simulatedTime, setSimulatedTime }) => {
    const dayStart = timeToMinutes('08:00');
    const dayEnd = timeToMinutes('15:40');
    const totalMinutes = dayEnd - dayStart;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const minutesFromStart = parseInt(e.target.value, 10);
        const today = new Date();
        today.setHours(Math.floor((dayStart + minutesFromStart) / 60));
        today.setMinutes((dayStart + minutesFromStart) % 60);
        today.setSeconds(0);
        setSimulatedTime(today.getTime());
    };
    
    const value = useMemo(() => {
        if (simulatedTime === null) return totalMinutes / 2; // Default to midday if not simulating
        const d = new Date(simulatedTime);
        const currentMinutes = d.getHours() * 60 + d.getMinutes();
        return Math.max(0, Math.min(totalMinutes, currentMinutes - dayStart));
    }, [simulatedTime, totalMinutes, dayStart]);

    return (
        <div className="bg-bg-panel dark:bg-dark-panel border border-slate-200 dark:border-dark-border rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
                 <h4 className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">Time Simulation</h4>
                 {simulatedTime !== null && (
                     <button onClick={() => setSimulatedTime(null)} className="text-xs font-bold text-red-500 hover:text-red-700">
                         Return to Live
                     </button>
                 )}
            </div>
             <div className="relative h-8">
                 <input
                    type="range"
                    min="0"
                    max={totalMinutes}
                    value={value}
                    onChange={handleChange}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer absolute top-1/2 -translate-y-1/2"
                />
                 {dailySchedule.map(period => {
                    const periodStart = timeToMinutes(period.start);
                    const left = ((periodStart - dayStart) / totalMinutes) * 100;
                    return (
                        <div key={period.name} style={{left: `${left}%`}} className="absolute top-0 h-full flex flex-col items-center">
                            <div className="w-px h-1/2 bg-slate-300"></div>
                            <div className="text-xs text-text-muted">{period.name}</div>
                        </div>
                    );
                 })}
            </div>
        </div>
    );
};

const HeatmapToggle: React.FC<{ isVisible: boolean, setIsVisible: (v: boolean) => void }> = ({ isVisible, setIsVisible }) => (
    <div className="flex items-center gap-2">
        <label htmlFor="heatmap-toggle" className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">Heatmap</label>
        <button
            id="heatmap-toggle"
            role="switch"
            aria-checked={isVisible}
            onClick={() => setIsVisible(!isVisible)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isVisible ? 'bg-brand-primary' : 'bg-slate-300 dark:bg-dark-panel-hover'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isVisible ? 'translate-x-6' : 'translate-x-1'}`}/>
        </button>
    </div>
);


const LiveOperationsPage: React.FC<LiveOperationsPageProps> = ({ liveStatusData }) => {
    const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
    const [popoverTarget, setPopoverTarget] = useState<HTMLElement | null>(null);
    const { classrooms: classroomState, setOutOfService, setAvailable } = useClassroomStore();
    const [activeFloor, setActiveFloor] = useState<FloorId>('second');
    
    const { 
        filters, globalSearchTerm, 
        focusedPath, setFocusedPath, 
        isHeatmapVisible, setIsHeatmapVisible, 
        simulatedTime, setSimulatedTime 
    } = useAppStore();

    const debouncedSearchTerm = useDebounce(globalSearchTerm, 300);
    const dashboardData = useDashboardData();

    const activeFloorLayout = allFloorLayouts[activeFloor];
    
    const today: Assignment['day'] = useMemo(() => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][liveStatusData.now.getDay()] as Assignment['day'], [liveStatusData.now]);
    const dailyAssignments = useMemo(() => dashboardData.processedScheduleData.filter(a => a.day === today), [dashboardData.processedScheduleData, today]);

    const roomUsage = useMemo(() => {
        const counts: {[key: string]: number} = {};
        dashboardData.processedScheduleData.forEach(assignment => {
            // FIX: Explicitly cast the result of flat() to FloorPlanItem[] to resolve type inference issue.
            const allItems = Object.values(allFloorLayouts).flat() as FloorPlanItem[];
            const item = allItems.find(i => i.name.includes(assignment.group));
            if (item) {
                counts[item.name] = (counts[item.name] || 0) + 1;
            }
        });
        return counts;
    }, [dashboardData.processedScheduleData]);


    const filteredStudents = useMemo(() => {
        let studentsToFilter = liveStatusData.liveStudents;

        if (filters.status !== 'all') {
            studentsToFilter = studentsToFilter.filter(student => {
                const isLive = student.status === 'In Class' || student.status === 'Break';
                return filters.status === 'live' ? isLive : !isLive;
            });
        }
        
        if (filters.sessionType !== 'all') {
             const activeGroups = new Set(liveStatusData.liveClasses
                .filter(lc => {
                    if (filters.sessionType === 'tech') {
                        return lc.trackType === 'industrial' || lc.trackType === 'service';
                    }
                    return lc.trackType === filters.sessionType;
                })
                .map(lc => lc.group));
            studentsToFilter = studentsToFilter.filter(s => activeGroups.has(s.techGroup));
        }

        if (filters.companies.length > 0) studentsToFilter = studentsToFilter.filter(s => filters.companies.includes(s.company));
        if (filters.techTracks.length > 0) studentsToFilter = studentsToFilter.filter(s => filters.techTracks.includes(s.trackName));
        if (filters.aptisCEFRLevels.length > 0) studentsToFilter = studentsToFilter.filter(s => s.aptisScores?.overall.cefr && filters.aptisCEFRLevels.includes(s.aptisScores.overall.cefr));
        if (filters.techGroups.length > 0) studentsToFilter = studentsToFilter.filter(s => filters.techGroups.includes(s.techGroup));
        if (filters.classrooms.length > 0) studentsToFilter = studentsToFilter.filter(s => filters.classrooms.some(c => s.location.includes(c)));
        if (filters.technicalGrades.length > 0) {
            studentsToFilter = studentsToFilter.filter(s => {
                if (!s.grades) return false;
                return NAVA_UNITS.some(unit => {
                    const grade = s.grades?.[unit];
                    return typeof grade === 'string' ? filters.technicalGrades.includes(grade) : false;
                });
            });
        }
        if (filters.gpaRange[0] > 0 || filters.gpaRange[1] < 4) {
            studentsToFilter = studentsToFilter.filter(s => {
                if (s.gpa === null) return false;
                return s.gpa >= filters.gpaRange[0] && s.gpa <= filters.gpaRange[1];
            });
        }

        if (debouncedSearchTerm) {
            const lowercasedFilter = debouncedSearchTerm.toLowerCase();
            studentsToFilter = studentsToFilter.filter(student =>
                student.fullName.toLowerCase().includes(lowercasedFilter) ||
                student.navaId.toString().includes(lowercasedFilter) ||
                student.techGroup.toLowerCase().includes(lowercasedFilter)
            );
        }
        
        return studentsToFilter;
    }, [liveStatusData.liveStudents, liveStatusData.liveClasses, debouncedSearchTerm, filters]);
    
    const highlightedClassrooms = useMemo(() => {
        if (!filters.classrooms.length) return undefined;
        return new Set<string>(filters.classrooms);
    }, [filters.classrooms]);
    
    const StudentRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const student = filteredStudents[index];
        return (
            <div style={style} className="px-1 py-1.5">
                <StudentDetailCard student={student} />
            </div>
        );
    };

    const handleClassroomClick = (name: string, target: HTMLElement) => {
        if (selectedClassroom === name) {
            setSelectedClassroom(null);
            setPopoverTarget(null);
        } else {
            setSelectedClassroom(name);
            setPopoverTarget(target);
        }
    };

    const closePopover = () => {
        setSelectedClassroom(null);
        setPopoverTarget(null);
    }

    return (
        <>
            <ClassroomStatusModal
                isOpen={!!selectedClassroom}
                onClose={closePopover}
                targetRect={popoverTarget?.getBoundingClientRect() ?? null}
                classroomName={selectedClassroom}
                liveOccupancy={liveStatusData.occupancy}
                classroomState={classroomState}
                setOutOfService={setOutOfService}
                setAvailable={setAvailable}
                isManagable={true}
            />
            <div className="flex flex-col gap-6 h-full">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0">
                    <LiveStatusSummary liveStatusData={liveStatusData} />
                    <TimelineScrubber dailySchedule={dashboardData.dailySchedule} simulatedTime={simulatedTime} setSimulatedTime={setSimulatedTime} />
                </div>
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
                    <div className="bg-bg-panel dark:bg-dark-panel border border-slate-200 dark:border-dark-border rounded-lg shadow-sm flex flex-col p-4 h-full">
                        <div className="flex justify-between items-center mb-4 flex-shrink-0">
                            <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">Academy Floor Plan</h2>
                             <div className="flex items-center gap-4">
                                <HeatmapToggle isVisible={isHeatmapVisible} setIsVisible={setIsHeatmapVisible} />
                                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-dark-panel rounded-lg flex-wrap">
                                    <FloorTab label="Incubator" isActive={activeFloor === 'incubator'} onClick={() => setActiveFloor('incubator')} />
                                    <FloorTab label="3rd" isActive={activeFloor === 'third'} onClick={() => setActiveFloor('third')} />
                                    <FloorTab label="2nd" isActive={activeFloor === 'second'} onClick={() => setActiveFloor('second')} />
                                    <FloorTab label="1st" isActive={activeFloor === 'first'} onClick={() => setActiveFloor('first')} />
                                    <FloorTab label="Ground" isActive={activeFloor === 'ground'} onClick={() => setActiveFloor('ground')} />
                                </div>
                            </div>
                        </div>
                        <div className="flex-grow flex items-center justify-center overflow-auto">
                             <FloorPlan 
                                floor={activeFloor}
                                layout={activeFloorLayout} 
                                occupancy={liveStatusData.occupancy}
                                classroomState={classroomState}
                                selectedClassroom={selectedClassroom}
                                onClassroomClick={handleClassroomClick}
                                highlightedClassrooms={highlightedClassrooms}
                                currentPeriod={liveStatusData.currentPeriod}
                                dailyAssignments={dailyAssignments}
                                allDailyAssignments={dashboardData.processedScheduleData}
                                isHeatmapVisible={isHeatmapVisible}
                                roomUsage={roomUsage}
                                focusedPath={focusedPath}
                                onSetFocusedPath={setFocusedPath}
                                groupStudentCounts={dashboardData.groupStudentCounts.tech}
                                isOperationalHours={liveStatusData.isOperationalHours}
                            />
                        </div>
                        {/* FIX: Pass 'language' prop to FloorPlanLegend. */}
                        <FloorPlanLegend language="en" />
                    </div>

                     <div className="bg-bg-panel dark:bg-dark-panel border border-slate-200 dark:border-dark-border rounded-lg shadow-sm flex flex-col p-4 h-full min-h-0">
                        <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-2 flex-shrink-0">
                            Live Roster ({filteredStudents.length})
                        </h2>
                        <div className="flex-grow min-h-0">
                            {filteredStudents.length > 0 ? (
                                <AutoSizer>
                                    {({ height, width }) => (
                                        <FixedSizeList
                                            height={height}
                                            width={width}
                                            itemCount={filteredStudents.length}
                                            itemSize={120}
                                            itemKey={(index: number) => filteredStudents[index].navaId.toString()}
                                        >
                                            {StudentRow}
                                        </FixedSizeList>
                                    )}
                                </AutoSizer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-text-muted">
                                    <p>No students match the current filters.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LiveOperationsPage;