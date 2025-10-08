import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { useLiveStatus } from '../hooks/useLiveStatus';
import StudentDetailCard from '../components/StudentDetailCard';
import PeriodTimeline from '../components/PeriodTimeline';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import GroupWeeklyScheduleCard from '../components/GroupDailyScheduleCard';
// FIX: Import `OccupancyData` to correctly type session data from `liveStatusData`.
import type { Assignment, OccupancyData } from '../types';
import KioskSummaryPanel from '../components/KioskSummaryPanel';
import KioskHeader from '../components/KioskHeader';
import useAppStore from '../hooks/useAppStore';
import useKioskStore, { RoomStatus } from '../store/kioskStore';
import CampusNavigatorTabs from '../components/CampusNavigatorTabs';
import AnnouncementsMarquee from '../components/AnnouncementsMarquee';
import { format, parse } from 'date-fns';
import { FLOOR_PLANS } from '../data/floorPlanMatrix';
import BreakTimeDisplay from '../components/BreakTimeDisplay';
import BreakBanner from '../components/BreakBanner';

const schematicNameToId = (name: string): string => {
    const normalizedName = name.replace(/\s/g, '');
    const match = normalizedName.match(/(C|LAP|L|WS)-?(\d+)/i);
    if (!match) return normalizedName.replace(/[^a-z0-9]/gi, ''); 
    const prefix = match[1].toUpperCase();
    const number = match[2];
    if (prefix === 'WS') return `WS${parseInt(number, 10)}`;
    const numericPart = parseInt(number, 10);
    if (numericPart > 100) return String(numericPart);
    return number;
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
    const { selectedGroup, setSelectedGroup, selectedRoom, setRoomStatus, clearSelection } = useKioskStore();
    
    const [traineeSearch, setTraineeSearch] = useState('');
    const [traineeSort, setTraineeSort] = useState<'asc' | 'desc'>('asc');
    const [isBreakScreenDismissed, setIsBreakScreenDismissed] = useState(false);
    const prevPeriodName = useRef<string | null>(null);


    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }, [language]);

    const handleGroupSelect = (group: string) => {
        if (selectedGroup === group) {
            clearSelection();
        } else {
            setSelectedGroup(group);
        }
    };

    // Effect to synchronize live status with the kiosk store for the navigator
    useEffect(() => {
        const allRooms = FLOOR_PLANS.flatMap(floor => floor.rows.flat());
        // FIX: Add type assertion to correctly type the map values, preventing `session` from being inferred as `unknown`.
        const occupancyByScheduleCode = new Map(Object.entries(liveStatusData.occupancy) as [string, OccupancyData[keyof OccupancyData]][]);
        
        allRooms.forEach(room => {
            let status: RoomStatus;
            let scheduleCode = '';
    
            if (room.code.startsWith('WS-')) {
                const numMatch = room.code.match(/\d+/);
                if (numMatch) {
                    scheduleCode = `WS-0.${parseInt(numMatch[0], 10)}`;
                }
            } else if (room.code.startsWith('C-')) {
                const num = room.code.substring(2);
                if (num.length === 3) scheduleCode = `${num[0]}.${num.substring(1)}`;
            } else if (room.code.match(/^(LAP|L)-/)) {
                 const numMatch = room.code.match(/\d+/);
                if (numMatch) {
                    const num = numMatch[0];
                    if (num.length === 3) scheduleCode = `${num[0]}.${num.substring(1)}`;
                }
            }
    
            const session = scheduleCode ? occupancyByScheduleCode.get(scheduleCode) : undefined;
    
            if (session) {
                status = {
                    status: 'inClass',
                    group: session.group,
                    period: liveStatusData.currentPeriod?.name,
                    topic: session.topic,
                    instructor: session.instructors.join(', '),
                };
            } else if (room.type === 'Facility') {
                status = { status: 'staffOnly' };
            } else {
                status = { status: 'empty' };
            }
            setRoomStatus(room.code, status);
        });
    }, [liveStatusData.occupancy, liveStatusData.currentPeriod, setRoomStatus]);

    const today: Assignment['day'] = useMemo(() => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][liveStatusData.now.getDay()] as Assignment['day'], [liveStatusData.now]);
    const dailyAssignments = useMemo(() => dashboardData.processedScheduleData.filter(a => a.day === today), [dashboardData.processedScheduleData, today]);

    const selection = useMemo(() => {
        if (selectedGroup) return { type: 'group' as const, value: selectedGroup };
        if (selectedRoom) return { type: 'room' as const, value: selectedRoom.name };
        return null;
    }, [selectedGroup, selectedRoom]);
    
    const groupForSelection = useMemo(() => {
        if (selectedGroup) return selectedGroup;
        if (selectedRoom && liveStatusData.currentPeriod) {
            const schematicId = schematicNameToId(selectedRoom.name);
            const assignmentInRoom = dailyAssignments.find(a => 
                a.period === liveStatusData.currentPeriod?.name &&
                (schematicNameToId(a.classroom).toLowerCase() === schematicId.toLowerCase())
            );
            return assignmentInRoom?.group ?? null;
        }
        return null;
    }, [selectedGroup, selectedRoom, liveStatusData.currentPeriod, dailyAssignments]);

    const { now, currentPeriod, overallStatus } = liveStatusData;
    const isBreak = overallStatus.toLowerCase().includes('break');

    useEffect(() => {
        const currentPeriodName = currentPeriod?.name ?? 'none';
        const isNewPeriod = prevPeriodName.current !== currentPeriodName;
    
        if (isNewPeriod) {
            const isNewPeriodABreak = overallStatus.toLowerCase().includes('break');
            if (isNewPeriodABreak) {
                setIsBreakScreenDismissed(false);
            }
        }
    
        prevPeriodName.current = currentPeriodName;
    }, [currentPeriod, overallStatus]);


    const nowNextInfo = useMemo(() => {
        if (!currentPeriod) return { now: null, next: null, countdown: '' };
        const currentPeriodIndex = dashboardData.dailySchedule.findIndex(p => p.name === currentPeriod.name);
        const nextPeriod = dashboardData.dailySchedule[currentPeriodIndex + 1];
        
        const end = new Date();
        const [h,m] = currentPeriod.end.split(':');
        end.setHours(parseInt(h), parseInt(m), 0, 0);
        const diff = end.getTime() - now.getTime();
        const minutes = Math.floor((diff / 1000) / 60);
        const seconds = Math.floor((diff / 1000) % 60);
        const countdown = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        return {
            now: `Now: ${currentPeriod.name} • ends ${format(end, 'h:mm a')}`,
            next: nextPeriod ? `Next: ${nextPeriod.name} at ${format(parse(nextPeriod.start, 'HH:mm', new Date()), 'h:mm a')}` : 'End of day',
            countdown,
        }
    }, [now, currentPeriod, dashboardData.dailySchedule]);


    const traineesForSelection = useMemo(() => {
        if (!groupForSelection) return [];
        let students = liveStatusData.liveStudents.filter(s => s.techGroup === groupForSelection);
        
        if (traineeSearch) {
            const lowerSearch = traineeSearch.toLowerCase();
            students = students.filter(s => s.fullName.toLowerCase().includes(lowerSearch) || String(s.navaId).includes(lowerSearch));
        }
        
        students.sort((a, b) => {
            if (traineeSort === 'asc') return a.fullName.localeCompare(b.fullName);
            return b.fullName.localeCompare(a.fullName);
        });

        return students;
    }, [groupForSelection, liveStatusData.liveStudents, traineeSearch, traineeSort]);

    const groupSessionTypeMap = useMemo(() => {
        const map = new Map<string, 'industrial' | 'service' | 'professional'>();
        liveStatusData.liveClasses.forEach(c => map.set(c.group, c.trackType));
        return map;
    }, [liveStatusData.liveClasses]);
    
    const allGroups = useMemo(() => dashboardData.allFilterOptions.allTechGroups, [dashboardData]);
    
    const shouldShowImmersiveBreak = isBreak && currentPeriod && !isBreakScreenDismissed;

    return (
        <div className="min-h-screen w-screen bg-kiosk-bg flex flex-col px-6 py-4 gap-4 font-sans overflow-y-auto">
            <KioskHeader onExitKiosk={onExitKiosk} language={language} setLanguage={setLanguage} now={liveStatusData.now} weekNumber={liveStatusData.weekNumber} />
            <div className="flex-shrink-0 h-16"><PeriodTimeline dailySchedule={dashboardData.dailySchedule} currentPeriod={liveStatusData.currentPeriod} now={liveStatusData.now} /></div>
            <div className="flex-shrink-0 h-14 flex items-center"><AnnouncementsMarquee language={language} currentPeriod={currentPeriod}/></div>
            
             <main className={`flex-grow flex gap-6 min-h-0 ${shouldShowImmersiveBreak ? 'items-center justify-center' : ''}`}>
                {shouldShowImmersiveBreak ? (
                    <div className="w-full h-full">
                        <BreakTimeDisplay 
                            breakName={overallStatus}
                            endTime={currentPeriod.end}
                            now={now}
                            language={language}
                            onDismiss={() => setIsBreakScreenDismissed(true)}
                        />
                    </div>
                ) : (
                    <>
                        <div style={{ flexBasis: '30%' }} className="flex flex-col">
                            <KioskSummaryPanel allGroups={allGroups} liveClasses={liveStatusData.liveClasses} groupInfo={dashboardData.groupInfo} overallStatus={liveStatusData.overallStatus} language={language} onGroupClick={handleGroupSelect} selectedGroup={selectedGroup} />
                        </div>
                        
                        <div style={{ flexBasis: '56%' }} className="bg-white/90 backdrop-blur shadow-sm transition duration-200 rounded-2xl flex flex-col p-4 min-h-0">
                            {isBreak && isBreakScreenDismissed && currentPeriod && (
                                <BreakBanner 
                                    breakName={overallStatus}
                                    endTime={currentPeriod.end}
                                    now={now}
                                    language={language}
                                    onRestore={() => setIsBreakScreenDismissed(false)}
                                />
                            )}
                            {!selection ? (
                                <div className="flex items-center justify-center h-full text-center text-kiosk-text-muted">
                                    <div className="max-w-sm">
                                        <h3 className="font-bold text-lg font-montserrat">{language === 'ar' ? 'اختر عنصراً' : 'Select an Item'}</h3>
                                        <p className="text-sm mt-1">{language === 'ar' ? 'اختر مجموعة، أو غرفة من المستكشف، أو استخدم أحد الإجراءات السريعة أدناه.' : 'Select a group, a room from the navigator, or use one of the quick actions below.'}</p>
                                        <div className="mt-4 flex flex-col gap-2">
                                            <button className="w-full text-left p-3 bg-white rounded-lg shadow-sm border hover:bg-slate-50">{language === 'ar' ? 'عرض غرفتي الحالية' : 'Show my current room'}</button>
                                            <button onClick={() => setActiveTab('schedule')} className="w-full text-left p-3 bg-white rounded-lg shadow-sm border hover:bg-slate-50">{language === 'ar' ? 'فتح جدول اليوم' : "Open today's schedule"}</button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col h-full min-h-0">
                                     <div className="flex-shrink-0 flex justify-between items-center mb-4 px-1">
                                        <div className="min-w-0">
                                            <h2 className="text-2xl font-bold font-montserrat text-kiosk-text-title truncate pr-4">
                                              {selection.type === 'group' ? `Group: ${selection.value}` : `Room: ${selection.value}`}
                                            </h2>
                                            <div className="text-sm text-kiosk-text-muted font-mono flex items-center gap-4 mt-1">
                                                <span>{nowNextInfo.now}</span>
                                                <span className="opacity-70">{nowNextInfo.next}</span>
                                                <span className="font-bold text-red-500 tabular-nums">{nowNextInfo.countdown}</span>
                                            </div>
                                        </div>
                                        <div className={`p-1 bg-kiosk-border/30 rounded-full flex items-center gap-1 ${language === 'ar' ? 'font-kufi' : ''}`}>
                                            <button 
                                                onClick={() => setActiveTab('schedule')} 
                                                className={`px-6 py-2 text-base font-bold rounded-full transition-colors ${activeTab === 'schedule' ? 'bg-white text-kiosk-primary shadow-sm' : 'text-kiosk-text-muted hover:bg-white/50'}`}
                                            >
                                                {language === 'ar' ? 'الجدول الأسبوعي' : 'Weekly Schedule'}
                                            </button>
                                            <button 
                                                onClick={() => setActiveTab('trainees')} 
                                                className={`px-6 py-2 text-base font-bold rounded-full transition-colors ${activeTab === 'trainees' ? 'bg-white text-kiosk-primary shadow-sm' : 'text-kiosk-text-muted hover:bg-white/50'}`}
                                            >
                                                {language === 'ar' ? 'قائمة المتدربين' : 'Trainee List'}
                                            </button>
                                        </div>
                                    </div>
                                     <div className="flex-grow min-h-0 rounded-lg bg-white shadow-inner relative overflow-y-auto">
                                        {activeTab === 'schedule' ? (
                                            <GroupWeeklyScheduleCard selection={selection} allAssignments={dashboardData.processedScheduleData} currentPeriodName={liveStatusData.currentPeriod?.name ?? null} today={today} language={language} />
                                        ) : (
                                          <div className="p-2 space-y-3">
                                              <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 p-2 flex gap-2">
                                                <input type="search" placeholder="Search by name or ID..." value={traineeSearch} onChange={e => setTraineeSearch(e.target.value)} className="w-full border p-2 rounded-lg text-sm" />
                                                <button onClick={() => setTraineeSort(s => s === 'asc' ? 'desc' : 'asc')} className="p-2 border rounded-lg text-sm font-semibold">A-Z {traineeSort === 'asc' ? '↑' : '↓'}</button>
                                              </div>
                                            {traineesForSelection.length > 0 ? (
                                              traineesForSelection.map(student => {
                                                const sessionType = groupSessionTypeMap.get(student.techGroup);
                                                return <StudentDetailCard key={student.navaId.toString()} student={student} viewMode="kiosk" sessionType={sessionType} />;
                                              })
                                            ) : ( <div className="text-center py-10 text-kiosk-text-muted"><h3 className="font-bold text-lg">No Trainees Found</h3><p className="text-sm mt-1">There are no trainees for this selection.</p></div> )}
                                          </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div style={{ flexBasis: '14%' }} className="flex-shrink-0">
                            <CampusNavigatorTabs 
                                liveClasses={liveStatusData.liveClasses}
                                dailyAssignments={dailyAssignments}
                                currentPeriod={liveStatusData.currentPeriod}
                                language={language}
                            />
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default KioskPage;