import React, { useState, useMemo } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { useLiveStatus } from '../hooks/useLiveStatus';
import useClassroomStore from '../hooks/useClassroomStore';
import FloorPlan from '../components/FloorPlan';
import FloorPlanLegend from '../components/FloorPlanLegend';
import StudentDetailCard from '../components/StudentDetailCard';
import LiveStatusTimeline from '../components/LiveStatusTimeline';
import { allFloorLayouts } from '../data/floorPlan';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import KioskSummaryPanel from '../components/KioskSummaryPanel';
// FIX: Added missing imports for LiveClass, Assignment, and FloorId types.
import type { LiveClass, Assignment, FloorId } from '../types';

interface KioskPageProps {
    onExitKiosk: () => void;
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

const getFloorFromClassroomName = (classroomName: string): FloorId | null => {
    if (classroomName.startsWith('WS-') || classroomName.startsWith('0.')) return 'ground';
    if (classroomName.startsWith('1.')) return 'first';
    if (classroomName.startsWith('2.')) return 'second';
    if (classroomName.startsWith('3.')) return 'third';
    if (classroomName.startsWith('INCUBATOR')) return 'incubator';
    return null;
}

// FIX: Added missing helper function to parse group name from a room's name.
const parseGroupName = (name: string): string | null => {
    const match = name.match(/(DP(IT|ST)-\d{2})/);
    return match ? match[0] : null;
};


const KioskPage: React.FC<KioskPageProps> = ({ onExitKiosk }) => {
    const dashboardData = useDashboardData();
    const { analyzedStudents } = useAnalyticsData(dashboardData.enhancedStudents);
    // FIX: Passed `null` for the `simulatedTime` argument to match the expected signature of `useLiveStatus`.
    const liveStatusData = useLiveStatus(
        analyzedStudents,
        dashboardData.dailySchedule,
        dashboardData.groupInfo,
        dashboardData.processedScheduleData,
        null // No time scrubbing in kiosk mode
    );
    const { classrooms: classroomState } = useClassroomStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
    const [activeFloor, setActiveFloor] = useState<FloorId>('ground');
    
    const activeFloorLayout = allFloorLayouts[activeFloor];
    
    const today: Assignment['day'] = useMemo(() => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][liveStatusData.now.getDay()] as Assignment['day'], [liveStatusData.now]);
    const dailyAssignments = useMemo(() => dashboardData.processedScheduleData.filter(a => a.day === today), [dashboardData.processedScheduleData, today]);

    const handleClassroomClick = (classroomName: string) => {
        setSearchTerm('');
        setSelectedClassroom(prev => prev === classroomName ? null : classroomName);
    };

    const clearFilters = () => {
        setSelectedClassroom(null);
        setSearchTerm('');
    }

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setSelectedClassroom(null);

        const upperValue = value.toUpperCase().trim();
        // "Find My Class" logic
        if (/^DP(IT|ST)-\d{2}$/.test(upperValue)) {
            const studentWithLocation = liveStatusData.liveStudents.find(s => s.techGroup === upperValue);
            if (studentWithLocation?.status === 'In Class' && studentWithLocation.currentPeriod) {
                const assignment = dailyAssignments.find(a => a.group === upperValue && a.period === studentWithLocation.currentPeriod);
                if (assignment) {
                    const floor = getFloorFromClassroomName(assignment.classroom);
                    
                    if (floor) {
                        const floorPlanItem = allFloorLayouts[floor].find(item => item.name.includes(upperValue));
                        if(floorPlanItem) {
                            setActiveFloor(floor);
                            setSelectedClassroom(floorPlanItem.name);
                            setSearchTerm(''); // Clear search to prevent list filtering
                            return;
                        }
                    }
                }
            }
        }
    };

    const showStudentList = useMemo(() => !!searchTerm || !!selectedClassroom, [searchTerm, selectedClassroom]);

    const sessionInfo = useMemo(() => {
        const industrial = new Set<string>();
        const service = new Set<string>();
        const professional = new Set<string>();
        liveStatusData.liveClasses.forEach(c => {
            if (c.type === 'industrial') industrial.add(c.group);
            if (c.type === 'service') service.add(c.group);
            if (c.type === 'professional') professional.add(c.group);
        });
        return {
            industrial: industrial.size,
            service: service.size,
            professional: professional.size,
        };
    }, [liveStatusData.liveClasses]);

    const groupSessionTypeMap = useMemo(() => {
        const map = new Map<string, 'industrial' | 'service' | 'professional'>();
        liveStatusData.liveClasses.forEach(c => map.set(c.group, c.type));
        return map;
    }, [liveStatusData.liveClasses]);

    const filteredStudents = useMemo(() => {
        if (!showStudentList) return [];

        let students = liveStatusData.liveStudents;

        if (selectedClassroom) {
             const groupInRoom = parseGroupName(selectedClassroom);
             if(groupInRoom){
                students = students.filter(s => s.techGroup === groupInRoom);
             }
        }
        
        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            students = students.filter(student =>
                student.fullName.toLowerCase().includes(lowercasedFilter) ||
                student.navaId.toString().includes(lowercasedFilter)
            );
        }

        return students;

    }, [liveStatusData.liveStudents, searchTerm, selectedClassroom, showStudentList]);


    return (
        <div className="h-screen w-screen bg-bg-body flex flex-col p-4 md:p-6 lg:p-8 gap-6 font-sans">
            <header className="flex-shrink-0 flex justify-between items-center">
                <div className="flex items-center gap-4">
                     <div className="w-16 h-16 bg-[#1E361E] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.25278C12 6.25278 15.0163 3 19.5 3C22.5 3 24 4.5 24 7.5C24 10.5 22.5 12 19.5 12C15.0163 12 12 8.74722 12 8.74722" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.25278C12 6.25278 8.98375 3 4.5 3C1.5 3 0 4.5 0 7.5C0 10.5 1.5 12 4.5 12C8.98375 12 12 8.74722 12 8.74722" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.74722V21" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21H16.5" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-text-primary tracking-tight">NAVA Academy Kiosk</h1>
                        <p className="text-lg text-text-muted font-medium">Live Operations Display</p>
                    </div>
                </div>
                 <button onClick={onExitKiosk} className="bg-slate-100/50 text-slate-500 text-xs font-semibold py-2 px-3 rounded-lg hover:bg-slate-200 hover:text-slate-700 transition-colors flex items-center gap-2 opacity-70 hover:opacity-100 z-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Admin Login
                </button>
            </header>
            
            <div className="flex-shrink-0">
                <LiveStatusTimeline 
                    dailySchedule={dashboardData.dailySchedule}
                    currentPeriod={liveStatusData.currentPeriod}
                    now={liveStatusData.now}
                    weekNumber={liveStatusData.weekNumber}
                />
            </div>
            
            <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                {/* Left Column */}
                <div className="bg-white rounded-2xl shadow-xl flex flex-col p-6">
                     <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <h2 className="text-2xl font-bold text-text-primary">Academy Floor Plan</h2>
                        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-dark-panel rounded-lg flex-wrap">
                            <FloorTab label="Incubator" isActive={activeFloor === 'incubator'} onClick={() => setActiveFloor('incubator')} />
                            <FloorTab label="3rd" isActive={activeFloor === 'third'} onClick={() => setActiveFloor('third')} />
                            <FloorTab label="2nd" isActive={activeFloor === 'second'} onClick={() => setActiveFloor('second')} />
                            <FloorTab label="1st" isActive={activeFloor === 'first'} onClick={() => setActiveFloor('first')} />
                            <FloorTab label="Ground" isActive={activeFloor === 'ground'} onClick={() => setActiveFloor('ground')} />
                        </div>
                    </div>
                    <div className="flex-grow flex items-center justify-center overflow-auto">
                        {/* FIX: Added all missing props to the FloorPlan component to match its definition. */}
                        <FloorPlan 
                            floor={activeFloor}
                            layout={activeFloorLayout} 
                            occupancy={liveStatusData.occupancy}
                            classroomState={classroomState}
                            selectedClassroom={selectedClassroom}
                            onClassroomClick={handleClassroomClick}
                            currentPeriod={liveStatusData.currentPeriod}
                            dailyAssignments={dailyAssignments}
                            allDailyAssignments={dashboardData.processedScheduleData} 
                            isHeatmapVisible={false}
                            roomUsage={{}}
                            focusedPath={null}
                            onSetFocusedPath={() => {}}
                            groupStudentCounts={dashboardData.groupStudentCounts.tech}
                            isOperationalHours={liveStatusData.isOperationalHours}
                        />
                    </div>
                    <FloorPlanLegend />
                </div>
                
                {/* Right Column */}
                <div className="bg-white rounded-2xl shadow-xl flex flex-col p-6 min-h-0">
                    <div className="flex-shrink-0 flex justify-between items-center mb-4">
                         <h2 className="text-2xl font-bold text-text-primary">
                            Student Roster 
                            {selectedClassroom && <span className="text-brand-primary-dark">: {selectedClassroom}</span>}
                        </h2>
                        {showStudentList && <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-700 font-semibold">Clear</button>}
                    </div>

                    <div className="relative flex-shrink-0 mb-4">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-muted" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                        </span>
                        <input
                        type="text"
                        placeholder="Search Name/ID or enter Group ID to find class..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="bg-slate-100 border border-slate-300 rounded-lg py-3 px-4 pl-12 text-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary w-full"
                        />
                    </div>

                    {showStudentList ? (
                         <div className="flex-grow overflow-y-auto -mr-3 pr-3 space-y-3">
                             {filteredStudents.length > 0 ? (
                                filteredStudents.map(student => {
                                    const sessionType = groupSessionTypeMap.get(student.techGroup);
                                    return (
                                        <StudentDetailCard 
                                            key={student.navaId.toString()} 
                                            student={student} 
                                            viewMode="kiosk" 
                                            sessionType={sessionType}
                                        />
                                    );
                                })
                             ) : (
                                <div className="text-center py-20 text-text-muted">
                                    <h3 className="font-bold text-lg">No Students Found</h3>
                                    <p className="text-sm mt-1">Try a different search or filter.</p>
                                </div>
                             )}
                        </div>
                    ) : (
                        <KioskSummaryPanel 
                            liveStudentsCount={liveStatusData.liveStudents.filter(s => s.status === 'In Class' || s.status === 'Break').length}
                            totalStudents={dashboardData.enhancedStudents.length}
                            sessionInfo={sessionInfo}
                            liveClasses={liveStatusData.liveClasses}
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

export default KioskPage;
