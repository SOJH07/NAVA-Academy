import React, { useState, useMemo, useEffect } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { useLiveStatus } from '../hooks/useLiveStatus';
import StudentDetailCard from '../components/StudentDetailCard';
import PeriodTimeline from '../components/PeriodTimeline';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import GroupDailyScheduleCard from '../components/GroupDailyScheduleCard';
import type { Assignment, FloorPlanItem } from '../types';
import KioskSummaryPanel from '../components/KioskSummaryPanel';
import DailySummaryPanel from '../components/DailySummaryPanel';
import KioskHeader from '../components/KioskHeader';
import useAppStore from '../hooks/useAppStore';
import CampusNavigatorFloorPlan from '../components/CampusNavigatorFloorPlan';
import useKioskStore from '../store/kioskStore';
import { FLOOR_PLANS } from '../data/floorPlanMatrix';


const schematicNameToId = (name: string): string => {
    // Normalize by removing spaces to handle codes like "WS- 9"
    const normalizedName = name.replace(/\s/g, '');
    const match = normalizedName.match(/(C|LAP|L|WS)-?(\d+)/i);
    if (!match) return normalizedName.replace(/[^a-z0-9]/gi, ''); 
    const prefix = match[1].toUpperCase();
    const number = match[2];
    if (prefix === 'WS') {
        return `WS${parseInt(number, 10)}`;
    }
     const numericPart = parseInt(number, 10);
    if (numericPart > 100) return String(numericPart);
    return number;
};

const scheduleCodeToId = (code: string): string => {
    if (!code) return '';
     // Normalize to handle codes like 'WS-0.9' -> 'WS-9'
    return code.replace('0.', '').replace('.', '');
};


interface KioskPageProps {
    onExitKiosk: () => void;
}

const KioskPage: React.FC<KioskPageProps> = ({ onExitKiosk }) => {
    const [language, setLanguage] = useState<'en' | 'ar'>('en');

    const dashboardData = useDashboardData();
    const { analyzedStudents } = useAnalyticsData(dashboardData.enhancedStudents);
    const { simulatedTime } = useAppStore();
    const liveStatusData = useLiveStatus(analyzedStudents, dashboardData.dailySchedule, dashboardData.groupInfo, dashboardData.processedScheduleData, simulatedTime);
    
    const [activeTab, setActiveTab] = useState<'schedule' | 'trainees'>('schedule');
    const { selectedGroup, selectedRoom, setRoomStatus } = useKioskStore();

    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }, [language]);
    
    useEffect(() => {
        const allRooms = FLOOR_PLANS.flatMap(floor => floor.rows.flat());
        const liveOccupancyMap = new Map<string, any>(Object.entries(liveStatusData.occupancy));

        allRooms.forEach(room => {
            if (room.type === 'Facility') {
                setRoomStatus(room.code, { status: 'staffOnly' });
                return;
            }

            const schematicId = schematicNameToId(room.code);
            let isOccupied = false;
            for (const [scheduleCode, occupancyInfo] of liveOccupancyMap.entries()) {
                const scheduleId = schematicNameToId(scheduleCodeToId(scheduleCode));
                if (schematicId.toLowerCase() === scheduleId.toLowerCase()) {
                    setRoomStatus(room.code, {
                        status: 'inClass',
                        group: occupancyInfo.group,
                        period: liveStatusData.currentPeriod?.name,
                    });
                    isOccupied = true;
                    break;
                }
            }

            if (isOccupied) return;

            if (liveStatusData.overallStatus.includes('Break')) {
                setRoomStatus(room.code, { status: 'break' });
                return;
            }
            
            setRoomStatus(room.code, { status: 'empty' });
        });
    }, [liveStatusData.occupancy, liveStatusData.overallStatus, liveStatusData.currentPeriod, setRoomStatus]);


    const today: Assignment['day'] = useMemo(() => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][liveStatusData.now.getDay()] as Assignment['day'], [liveStatusData.now]);
    
    const selection = useMemo(() => {
        if (selectedGroup) return { type: 'group' as const, value: selectedGroup };
        if (selectedRoom) return { type: 'room' as const, value: selectedRoom.name };
        return null;
    }, [selectedGroup, selectedRoom]);
    
    const groupForSelection = useMemo(() => {
        if (selectedGroup) {
            return selectedGroup;
        }
        if (selectedRoom && liveStatusData.currentPeriod) {
            const schematicId = schematicNameToId(selectedRoom.name);
            const assignmentInRoom = dashboardData.processedScheduleData.find(a => 
                a.day === today &&
                a.period === liveStatusData.currentPeriod?.name &&
                (schematicNameToId(scheduleCodeToId(a.classroom)).toLowerCase() === schematicId.toLowerCase())
            );
            return assignmentInRoom?.group ?? null;
        }
        return null;
    }, [selectedGroup, selectedRoom, liveStatusData.currentPeriod, dashboardData.processedScheduleData, today]);


     const traineesForSelection = useMemo(() => {
        if (!groupForSelection) return [];
        return liveStatusData.liveStudents.filter(s => s.techGroup === groupForSelection);
    }, [groupForSelection, liveStatusData.liveStudents]);

    const groupSessionTypeMap = useMemo(() => {
        const map = new Map<string, 'industrial' | 'service' | 'professional'>();
        liveStatusData.liveClasses.forEach(c => map.set(c.group, c.trackType));
        return map;
    }, [liveStatusData.liveClasses]);
    
    const allGroups = useMemo(() => dashboardData.allFilterOptions.allTechGroups, [dashboardData]);

    return (
        <div className="h-screen w-screen bg-kiosk-bg flex flex-col p-6 lg:p-8 gap-4 font-sans relative transition-all duration-300">
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
            
            <CampusNavigatorFloorPlan />
            
            <main className="flex-grow grid grid-cols-12 gap-6 min-h-0">
                <div className="col-span-12 lg:col-span-3">
                    <KioskSummaryPanel 
                        allGroups={allGroups}
                        liveClasses={liveStatusData.liveClasses}
                        groupInfo={dashboardData.groupInfo}
                        overallStatus={liveStatusData.overallStatus}
                        language={language}
                    />
                </div>
                
                <div className="col-span-12 lg:col-span-5 bg-nava-neutral rounded-xl shadow-lg flex flex-col p-4 h-full min-h-0">
                    {!selection ? (
                        <div className="flex items-center justify-center h-full text-center text-kiosk-text-muted">
                            <div className="max-w-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                                <h3 className="font-bold text-lg mt-4 font-montserrat">Select an Item</h3>
                                <p className="text-sm mt-1">Select a group from the <span className="font-bold text-nava-blue">Live Schedule</span> or a room from the <span className="font-bold text-nava-green">Campus Navigator</span> to view details.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full min-h-0">
                            <div className="flex-shrink-0 flex justify-between items-center mb-3 px-2">
                                <h2 className="text-xl font-montserrat font-semibold text-text-primary truncate pr-4">
                                  {selection.type === 'group' ? `Group: ${selection.value}` : `Room: ${selection.value}`}
                                </h2>
                                <div className="flex items-center gap-1 p-1 bg-slate-200 rounded-lg">
                                    <button onClick={() => setActiveTab('schedule')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${activeTab === 'schedule' ? 'bg-white shadow' : 'hover:bg-white/60'}`}>Weekly Schedule</button>
                                    <button onClick={() => setActiveTab('trainees')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${activeTab === 'trainees' ? 'bg-white shadow' : 'hover:bg-white/60'}`}>Trainee List</button>
                                </div>
                            </div>
                             <div className="flex-grow min-h-0 overflow-y-auto rounded-lg bg-white shadow-inner">
                                {activeTab === 'schedule' ? (
                                    <GroupDailyScheduleCard
                                        selection={selection}
                                        allAssignments={dashboardData.processedScheduleData}
                                        currentPeriodName={liveStatusData.currentPeriod?.name ?? null}
                                        today={today}
                                    />
                                ) : (
                                  <div className="p-2 space-y-3">
                                    {traineesForSelection.length > 0 ? (
                                      traineesForSelection.map(student => {
                                        const sessionType = groupSessionTypeMap.get(student.techGroup);
                                        return <StudentDetailCard key={student.navaId.toString()} student={student} viewMode="kiosk" sessionType={sessionType} />;
                                      })
                                    ) : (
                                      <div className="text-center py-10 text-kiosk-text-muted">
                                          <h3 className="font-bold text-lg">No Trainees Found</h3>
                                          <p className="text-sm mt-1">There are no trainees for this selection at this time.</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="col-span-12 lg:col-span-4">
                   <DailySummaryPanel 
                        liveStatusData={liveStatusData}
                        dailyAssignments={dashboardData.processedScheduleData.filter(a => a.day === today)}
                        groupInfo={dashboardData.groupInfo}
                        language={language}
                   />
                </div>
            </main>
        </div>
    );
};

export default KioskPage;