import React, { useState, useMemo, useEffect } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { useLiveStatus } from '../hooks/useLiveStatus';
import useClassroomStore from '../hooks/useClassroomStore';
import FloorPlan from '../components/FloorPlan';
import StudentDetailCard from '../components/StudentDetailCard';
import PeriodTimeline from '../components/PeriodTimeline';
import { allFloorLayouts } from '../data/floorPlan';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import GroupWeeklyScheduleCard from '../components/GroupDailyScheduleCard';
import type { Assignment, FloorId, FloorPlanItem } from '../types';
import KioskSummaryPanel from '../components/KioskSummaryPanel';
import DailySummaryPanel from '../components/DailySummaryPanel';
import ClassroomStatusModal from '../components/ClassroomStatusModal';
import KioskHeader from '../components/KioskHeader';
import useAppStore from '../hooks/useAppStore';
import FloorPlanLegend from '../components/FloorPlanLegend';

interface KioskPageProps {
    onExitKiosk: () => void;
}

const FloorTab: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-base font-bold rounded-lg transition-colors ${
            isActive
                ? 'bg-kiosk-primary text-white shadow-md'
                : 'bg-kiosk-border text-kiosk-text-muted hover:bg-slate-300'
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
    return null;
}

const scheduleCodeToId = (code: string): string => {
    return code.replace('0.', '').replace('.', '');
};

const schematicNameToId = (name: string): string => {
    const match = name.match(/(C|LAP|L|WS)-?\s?(\d+)/);
    if (!match) return name; 
    const prefix = match[1];
    const number = match[2];
    if (prefix === 'WS') {
        return `WS-${parseInt(number, 10)}`;
    }
    return number;
};


const KioskPage: React.FC<KioskPageProps> = ({ onExitKiosk }) => {
    const [language, setLanguage] = useState<'en' | 'ar'>('en');

    const dashboardData = useDashboardData();
    const { analyzedStudents } = useAnalyticsData(dashboardData.enhancedStudents);
    const { simulatedTime } = useAppStore();
    const liveStatusData = useLiveStatus(analyzedStudents, dashboardData.dailySchedule, dashboardData.groupInfo, dashboardData.processedScheduleData, simulatedTime);
    const { classrooms: classroomState } = useClassroomStore();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
    const [popoverTarget, setPopoverTarget] = useState<HTMLElement | null>(null);
    const [activeFloor, setActiveFloor] = useState<FloorId>('second');
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    
    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }, [language]);

    const activeFloorLayout = allFloorLayouts[activeFloor];
    const today: Assignment['day'] = useMemo(() => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][liveStatusData.now.getDay()] as Assignment['day'], [liveStatusData.now]);
    const dailyAssignments = useMemo(() => dashboardData.processedScheduleData.filter(a => a.day === today), [dashboardData.processedScheduleData, today]);

    const handleClassroomClick = (classroomName: string, target: HTMLElement) => {
        setSearchTerm('');
        setSelectedGroup(null);
        if (selectedClassroom === classroomName) {
            setSelectedClassroom(null);
            setPopoverTarget(null);
        } else {
            setSelectedClassroom(classroomName);
            setPopoverTarget(target);
        }
    };

    const clearSelection = () => {
        setSelectedClassroom(null);
        setPopoverTarget(null);
        setSearchTerm('');
        setSelectedGroup(null);
    }

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setSelectedGroup(null);
        setSelectedClassroom(null);
        setPopoverTarget(null);
    };
    
    const handleGroupClick = (group: string) => {
        setSelectedGroup(prev => prev === group ? null : group);
        setSearchTerm('');
        setSelectedClassroom(null);
        setPopoverTarget(null);

        const currentLiveClass = liveStatusData.liveClasses.find(c => c.group === group);
        if (currentLiveClass) {
            const floor = getFloorFromClassroomName(currentLiveClass.classroom);
            if (floor) {
                const schematicId = scheduleCodeToId(currentLiveClass.classroom);
                let floorPlanItem = (Object.values(allFloorLayouts).flat() as FloorPlanItem[]).find(item => schematicNameToId(item.name) === schematicId);
                if (floorPlanItem) {
                    setActiveFloor(floor);
                    setSelectedClassroom(floorPlanItem.name);
                }
            }
        }
    };
    
    const isSearching = searchTerm.trim() !== '';

    const groupSessionTypeMap = useMemo(() => {
        const map = new Map<string, 'industrial' | 'service' | 'professional'>();
        liveStatusData.liveClasses.forEach(c => map.set(c.group, c.trackType));
        return map;
    }, [liveStatusData.liveClasses]);
    
    const allGroups = useMemo(() => dashboardData.allFilterOptions.allTechGroups, [dashboardData]);

    const filteredStudents = useMemo(() => {
        if (!isSearching && !selectedClassroom) return [];

        let students = liveStatusData.liveStudents;

        if (selectedClassroom) {
            const schematicId = schematicNameToId(selectedClassroom);
            const assignmentForRoom = dailyAssignments.find(a => {
                if (a.period !== liveStatusData.currentPeriod?.name) return false;
                const scheduleId = scheduleCodeToId(a.classroom);
                if (!schematicId || !scheduleId) return false;
                if (scheduleId.startsWith('WS')) return schematicId === scheduleId;
                if (schematicId.length === 3 && scheduleId.length === 3) return schematicId === scheduleId;
                return false;
            });
            const groupInRoom = assignmentForRoom?.group;

            if (groupInRoom) {
                students = students.filter(s => s.techGroup === groupInRoom);
            } else {
                students = [];
            }
        }
        
        if (isSearching) {
            const lowercasedFilter = searchTerm.toLowerCase();
            students = students.filter(student =>
                student.fullName.toLowerCase().includes(lowercasedFilter) ||
                student.navaId.toString().includes(lowercasedFilter)
            );
        }
        return students;
    }, [liveStatusData.liveStudents, searchTerm, isSearching, selectedClassroom, dailyAssignments, liveStatusData.currentPeriod]);

    return (
        <div className="h-screen w-screen bg-kiosk-bg flex flex-col p-6 lg:p-8 gap-6 font-sans relative">
            <ClassroomStatusModal
                isOpen={!!selectedClassroom}
                onClose={() => { setSelectedClassroom(null); setPopoverTarget(null); }}
                targetRect={popoverTarget?.getBoundingClientRect() ?? null}
                classroomName={selectedClassroom}
                liveOccupancy={liveStatusData.occupancy}
                classroomState={classroomState}
                isManagable={false}
            />

            <KioskHeader
                onExitKiosk={onExitKiosk}
                language={language}
                setLanguage={setLanguage}
                now={liveStatusData.now}
                weekNumber={liveStatusData.weekNumber}
            />
            
            <PeriodTimeline 
                dailySchedule={dashboardData.dailySchedule}
                currentPeriod={liveStatusData.currentPeriod}
                now={liveStatusData.now}
            />
            
            <main className="flex-grow grid grid-cols-12 gap-8 min-h-0">
                <div className="col-span-12 lg:col-span-3">
                    <KioskSummaryPanel 
                        allGroups={allGroups}
                        liveClasses={liveStatusData.liveClasses}
                        groupInfo={dashboardData.groupInfo}
                        overallStatus={liveStatusData.overallStatus}
                        onGroupClick={handleGroupClick}
                        selectedGroup={selectedGroup}
                        language={language}
                    />
                </div>
                
                <div className="col-span-12 lg:col-span-5 bg-kiosk-panel rounded-2xl shadow-xl flex flex-col p-6">
                     <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <h2 className={`text-2xl font-bold text-kiosk-text-title ${language === 'ar' ? 'font-kufi' : ''}`}>
                            {language === 'ar' ? 'خريطة الأكاديمية' : 'Campus Navigator'}
                        </h2>
                        <div className="flex items-center gap-2 p-1 bg-kiosk-bg rounded-xl">
                            <FloorTab label="3rd" isActive={activeFloor === 'third'} onClick={() => setActiveFloor('third')} />
                            <FloorTab label="2nd" isActive={activeFloor === 'second'} onClick={() => setActiveFloor('second')} />
                            <FloorTab label="1st" isActive={activeFloor === 'first'} onClick={() => setActiveFloor('first')} />
                            <FloorTab label="Ground" isActive={activeFloor === 'ground'} onClick={() => setActiveFloor('ground')} />
                        </div>
                    </div>
                    <div className="flex-grow flex items-start justify-center overflow-auto -mx-4">
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
                            cardHeightClass="h-36"
                        />
                    </div>
                    <FloorPlanLegend language={language} />
                </div>
                
                <div className="col-span-12 lg:col-span-4 bg-kiosk-panel rounded-2xl shadow-xl flex flex-col p-6 min-h-0">
                    <div className="flex-shrink-0 flex justify-between items-center mb-4">
                         <h2 className="text-2xl font-bold text-kiosk-text-title truncate">
                            {language === 'ar' ? 'التفاصيل' : 'Details'}
                         </h2>
                        {(isSearching || selectedGroup || selectedClassroom) && <button onClick={clearSelection} className="text-sm text-red-500 hover:text-red-700 font-semibold flex-shrink-0">{language === 'ar' ? 'مسح' : 'Clear'}</button>}
                    </div>

                    <div className="relative flex-shrink-0 mb-4">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-kiosk-text-muted" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg></span>
                        <input type="text" placeholder={language === 'ar' ? 'ابحث عن المتدربين...' : 'Search Trainees...'} value={searchTerm} onChange={(e) => handleSearchChange(e.target.value)} className="bg-kiosk-bg border border-kiosk-border rounded-lg py-3 px-4 pl-12 text-lg text-kiosk-text-title focus:outline-none focus:ring-2 focus:ring-kiosk-primary w-full"/>
                    </div>

                    <div className="flex-grow overflow-y-auto -mr-3 pr-3 space-y-3">
                        {selectedGroup ? (
                            <GroupWeeklyScheduleCard
                                group={selectedGroup}
                                dailySchedule={dashboardData.dailySchedule}
                                groupAssignments={dashboardData.processedScheduleData.filter(a => a.group === selectedGroup)}
                                currentPeriodName={liveStatusData.currentPeriod?.name ?? null}
                                groupInfo={dashboardData.groupInfo}
                                language={language}
                            />
                        ) : (isSearching || selectedClassroom) ? (
                             <>
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map(student => {
                                        const sessionType = groupSessionTypeMap.get(student.techGroup);
                                        return <StudentDetailCard key={student.navaId.toString()} student={student} viewMode="kiosk" sessionType={sessionType} />;
                                    })
                                ) : (
                                    <div className="text-center py-10 text-kiosk-text-muted"><h3 className="font-bold text-lg">{language === 'ar' ? 'لم يتم العثور على متدربين' : 'No Trainees Found'}</h3><p className="text-sm mt-1">{language === 'ar' ? 'جرّب بحثًا أو مرشحًا مختلفًا.' : 'Try a different search or filter.'}</p></div>
                                )}
                            </>
                        ) : (
                           <DailySummaryPanel 
                                liveStatusData={liveStatusData}
                                dailyAssignments={dailyAssignments}
                                groupInfo={dashboardData.groupInfo}
                                language={language}
                           />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default KioskPage;