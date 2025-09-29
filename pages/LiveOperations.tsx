import React, { useState, useMemo } from 'react';
import type { LiveStudent, StudentGrades } from '../types';
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
import { useLiveStatus } from '../hooks/useLiveStatus';
import LiveStatusSummary from '../components/LiveStatusSummary';
import ClassroomStatusModal from '../components/ClassroomStatusModal';

interface LiveOperationsPageProps {
  liveStatusData: ReturnType<typeof useLiveStatus>;
}

const FloorTab: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            isActive
                ? 'bg-brand-primary text-black shadow-md'
                : 'bg-slate-200 text-text-muted hover:bg-slate-300'
        }`}
    >
        {label}
    </button>
);

const NAVA_UNITS: (keyof StudentGrades)[] = ['nava001', 'nava002', 'nava003', 'nava004', 'nava005', 'nava006', 'nava007', 'nava008'];

const LiveOperationsPage: React.FC<LiveOperationsPageProps> = ({ liveStatusData }) => {
    const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
    const { classrooms: classroomState, setOutOfService, setAvailable } = useClassroomStore();
    const [activeFloor, setActiveFloor] = useState<'second' | 'first' | 'ground'>('second');
    const { filters, globalSearchTerm } = useAppStore();
    const debouncedSearchTerm = useDebounce(globalSearchTerm, 300);

    const activeFloorLayout = allFloorLayouts[activeFloor];

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
                        return lc.type === 'industrial' || lc.type === 'service';
                    }
                    return lc.type === filters.sessionType;
                })
                .map(lc => lc.group));
            studentsToFilter = studentsToFilter.filter(s => activeGroups.has(s.techGroup));
        }

        if (filters.companies.length > 0) studentsToFilter = studentsToFilter.filter(s => filters.companies.includes(s.company));
        if (filters.techTracks.length > 0) studentsToFilter = studentsToFilter.filter(s => filters.techTracks.includes(s.trackName));
        // FIX: Added a check to ensure `s.aptisScores.overall.cefr` is not undefined before calling `includes`.
        if (filters.aptisCEFRLevels.length > 0) studentsToFilter = studentsToFilter.filter(s => s.aptisScores?.overall.cefr && filters.aptisCEFRLevels.includes(s.aptisScores.overall.cefr));
        if (filters.techGroups.length > 0) studentsToFilter = studentsToFilter.filter(s => filters.techGroups.includes(s.techGroup));
        if (filters.classrooms.length > 0) studentsToFilter = studentsToFilter.filter(s => filters.classrooms.some(c => s.location.includes(c)));
        if (filters.technicalGrades.length > 0) {
            studentsToFilter = studentsToFilter.filter(s => {
                if (!s.grades) return false;
                return NAVA_UNITS.some(unit => {
                    const grade = s.grades?.[unit];
                    return grade ? filters.technicalGrades.includes(grade) : false;
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
                // FIX: Used `toString()` to ensure the search is performed on a string representation of the navaId.
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

    const handleClassroomClick = (name: string) => {
        setSelectedClassroom(name);
    };

    return (
        <>
            <ClassroomStatusModal
                isOpen={!!selectedClassroom}
                onClose={() => setSelectedClassroom(null)}
                classroomName={selectedClassroom}
                liveOccupancy={liveStatusData.occupancy}
                classroomState={classroomState}
                setOutOfService={setOutOfService}
                setAvailable={setAvailable}
            />
            <div className="flex flex-col gap-6 h-full">
                <div className="flex-shrink-0">
                    <LiveStatusSummary liveStatusData={liveStatusData} />
                </div>
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
                    <div className="bg-bg-panel border border-slate-200 rounded-lg shadow-sm flex flex-col p-4 h-full">
                        <div className="flex justify-between items-center mb-4 flex-shrink-0">
                            <h2 className="text-xl font-bold text-text-primary">Academy Floor Plan</h2>
                             <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
                                <FloorTab label="2nd" isActive={activeFloor === 'second'} onClick={() => setActiveFloor('second')} />
                                <FloorTab label="1st" isActive={activeFloor === 'first'} onClick={() => setActiveFloor('first')} />
                                <FloorTab label="Ground" isActive={activeFloor === 'ground'} onClick={() => setActiveFloor('ground')} />
                            </div>
                        </div>
                        <div className="flex-grow flex items-center justify-center">
                             <FloorPlan 
                                layout={activeFloorLayout} 
                                occupancy={liveStatusData.occupancy}
                                classroomState={classroomState}
                                selectedClassroom={selectedClassroom}
                                onClassroomClick={handleClassroomClick}
                                highlightedClassrooms={highlightedClassrooms}
                            />
                        </div>
                        <FloorPlanLegend />
                    </div>

                     <div className="bg-bg-panel border border-slate-200 rounded-lg shadow-sm flex flex-col p-4 h-full min-h-0">
                        <h2 className="text-xl font-bold text-text-primary mb-2 flex-shrink-0">
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
