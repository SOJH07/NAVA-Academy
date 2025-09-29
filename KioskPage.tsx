import React, { useState, useMemo } from 'react';
import { useDashboardData } from './hooks/useDashboardData';
import { useLiveStatus } from './hooks/useLiveStatus';
import useClassroomStore from './hooks/useClassroomStore';
import FloorPlan from './components/FloorPlan';
import FloorPlanLegend from './components/FloorPlanLegend';
import StudentDetailCard from './components/StudentDetailCard';
import LiveStatusTimeline from './components/LiveStatusTimeline';
import { allFloorLayouts } from './data/floorPlan';
// FIX: Imported useAnalyticsData hook to process student data.
import { useAnalyticsData } from './hooks/useAnalyticsData';

interface KioskPageProps {
    onExitKiosk: () => void;
}

const FloorTab: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 text-base font-bold rounded-lg transition-colors ${
            isActive
                ? 'bg-brand-primary text-black shadow-lg'
                : 'bg-slate-200 text-text-muted hover:bg-slate-300'
        }`}
    >
        {label}
    </button>
);


const KioskPage: React.FC<KioskPageProps> = ({ onExitKiosk }) => {
    const dashboardData = useDashboardData();
    // FIX: Used useAnalyticsData to get fully analyzed student data.
    const { analyzedStudents } = useAnalyticsData(dashboardData.enhancedStudents);
    const liveStatusData = useLiveStatus(
        // FIX: Passed analyzedStudents to useLiveStatus to match expected type.
        analyzedStudents,
        dashboardData.dailySchedule,
        dashboardData.groupInfo,
        dashboardData.processedScheduleData
    );
    const { classrooms: classroomState } = useClassroomStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
    const [activeFloor, setActiveFloor] = useState<'second' | 'first' | 'ground'>('second');
    
    const activeFloorLayout = allFloorLayouts[activeFloor];

    const handleClassroomClick = (classroomName: string) => {
        setSearchTerm('');
        setSelectedClassroom(prev => prev === classroomName ? null : classroomName);
    };

    const clearFilters = () => {
        setSelectedClassroom(null);
        setSearchTerm('');
    }

    const showStudentList = useMemo(() => !!searchTerm || !!selectedClassroom, [searchTerm, selectedClassroom]);

    const filteredStudents = useMemo(() => {
        if (!showStudentList) return [];

        let students = liveStatusData.liveStudents;

        if (selectedClassroom) {
            students = students.filter(student => {
                if (student.status === 'In Class') {
                    const locationParts = student.location.split(': ');
                    if (locationParts.length === 2) {
                        const classroomNameFromLocation = locationParts[1].startsWith('C-') ? locationParts[1] : `C-${locationParts[1].replace('.', '')}`;
                        return classroomNameFromLocation === selectedClassroom;
                    }
                }
                return false;
            });
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
                    <div className="w-16 h-16 bg-brand-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-primary/30">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-text-primary tracking-tight">NAVA Academy Kiosk</h1>
                        <p className="text-lg text-text-muted font-medium">Live Operations Display</p>
                    </div>
                </div>
                <button onClick={onExitKiosk} className="bg-white text-text-primary font-bold py-3 px-6 rounded-lg shadow-md hover:bg-slate-200 hover:border-brand-primary transition-all flex items-center gap-2 border border-slate-300">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Exit Kiosk
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
                        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
                            <FloorTab label="2nd Floor" isActive={activeFloor === 'second'} onClick={() => setActiveFloor('second')} />
                            <FloorTab label="1st Floor" isActive={activeFloor === 'first'} onClick={() => setActiveFloor('first')} />
                            <FloorTab label="Ground Floor" isActive={activeFloor === 'ground'} onClick={() => setActiveFloor('ground')} />
                        </div>
                    </div>
                    <div className="flex-grow flex items-center justify-center">
                        <FloorPlan 
                            layout={activeFloorLayout} 
                            occupancy={liveStatusData.occupancy}
                            classroomState={classroomState}
                            selectedClassroom={selectedClassroom}
                            onClassroomClick={handleClassroomClick}
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
                        placeholder="Search by Name or NAVA ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-slate-100 border border-slate-300 rounded-lg py-3 px-4 pl-12 text-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary w-full"
                        />
                    </div>

                    {showStudentList ? (
                         <div className="flex-grow overflow-y-auto -mr-3 pr-3 space-y-3">
                             {filteredStudents.length > 0 ? (
                                filteredStudents.map(student => (
                                    <div key={student.navaId.toString()}>
                                        <StudentDetailCard student={student} />
                                    </div>
                                ))
                             ) : (
                                <div className="text-center py-20 text-text-muted">
                                    <h3 className="font-bold text-lg">No Students Found</h3>
                                    <p className="text-sm mt-1">Try a different search or filter.</p>
                                </div>
                             )}
                        </div>
                    ) : (
                        <div className="flex-grow flex items-center justify-center text-center text-text-muted">
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                <h3 className="mt-4 text-xl font-bold text-text-primary">Student Roster</h3>
                                <p className="mt-1 text-base">Select a classroom or use the search bar<br/>to view student details.</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default KioskPage;
