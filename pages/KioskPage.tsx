import React, { useState, useMemo, useEffect } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { useLiveStatus } from '../hooks/useLiveStatus';
import TraineeRosterCard from '../components/TraineeRosterCard';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import GroupDailyScheduleCard from '../components/GroupDailyScheduleCard';
import type { Assignment, AnalyzedStudent, LiveStudent } from '../types';
import KioskSummaryPanel from '../components/KioskSummaryPanel';
import KioskHeader from '../components/KioskHeader';
import useKioskStore, { RoomStatus } from '../store/kioskStore';
import KioskWelcomeMessage from '../components/KioskWelcomeMessage';
import CampusNavigatorTabs from '../components/CampusNavigatorTabs';
import BreakTimeDisplay from '../components/BreakTimeDisplay';
import BreakBanner from '../components/BreakBanner';
import EndOfDayDisplay from '../components/EndOfDayDisplay';
import EndOfDayBanner from '../components/EndOfDayBanner';
import FocusModeToggle from '../components/FocusModeToggle';
import StudentDetailModal from '../components/StudentDetailModal';
import { FLOOR_PLANS } from '../data/floorPlanMatrix';

interface KioskPageProps {
    onExitKiosk: () => void;
}

const scheduleCodeToId = (code: string): string => {
    return code.replace('0.', '').replace('.', '');
};

const schematicNameToId = (name: string): string => {
    const match = name.match(/(C|LAP|L|WS)-?\s?(\d+)/i);
    if (!match) return name;
    const prefix = match[1].toUpperCase();
    const number = match[2];
    if (prefix === 'WS') {
        return `WS-${parseInt(number, 10)}`;
    }
    const numericPart = parseInt(number, 10);
    if (numericPart > 100) return String(numericPart);
    return number;
};

const formatPeriodTime = (time24: string): string => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':').map(Number);
    const d = new Date(0);
    d.setHours(hours, minutes);
    return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).replace(/\s/g, '');
};

const Countdown: React.FC<{ seconds: number }> = ({ seconds }) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return (
        <div className="text-2xl font-mono font-bold text-red-500 tabular-nums">
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>
    );
};


const KioskPage: React.FC<KioskPageProps> = ({ onExitKiosk }) => {
    // FIX: Changed language from a hardcoded const to a state to enable language switching, resolving the comparison error.
    const [language, setLanguage] = useState<'en' | 'ar'>('en');

    const dashboardData = useDashboardData();
    const { analyzedStudents } = useAnalyticsData(dashboardData.enhancedStudents);
    const liveStatusData = useLiveStatus(analyzedStudents, dashboardData.dailySchedule, dashboardData.groupInfo, dashboardData.processedScheduleData, null);
    
    const { selectedGroup, setSelectedGroup, clearSelection, setRoomStatuses } = useKioskStore();
    
    const [traineeSort, setTraineeSort] = useState<'asc' | 'desc'>('asc');
    const [isBreakScreenDismissed, setIsBreakScreenDismissed] = useState(false);
    const [isEndOfDayDismissed, setIsEndOfDayDismissed] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<AnalyzedStudent | null>(null);
    const [activeTab, setActiveTab] = useState<'schedule' | 'trainees'>('schedule');

    useEffect(() => {
        // FIX: Update document language and direction based on the language state.
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }, [language]);

    useEffect(() => {
        const newStatuses: Record<string, RoomStatus> = {};
        const allCells = FLOOR_PLANS.flatMap(f => f.rows.flat());
        
        allCells.forEach(cell => {
            if (cell.type !== 'Facility') {
                newStatuses[cell.code] = { status: 'empty' };
            }
        });

        if (liveStatusData.currentPeriod?.type === 'class') {
            liveStatusData.liveClasses.forEach(liveClass => {
                const scheduleId = scheduleCodeToId(liveClass.classroom);
                const matchingCell = allCells.find(cell => schematicNameToId(cell.code) === scheduleId);
                
                if (matchingCell) {
                    newStatuses[matchingCell.code] = {
                        status: 'inClass',
                        group: liveClass.group,
                        instructor: liveClass.instructors.join(', '),
                        period: liveStatusData.currentPeriod!.name,
                        topic: liveClass.topic,
                    };
                }
            });
        }
        
        setRoomStatuses(newStatuses);
    }, [liveStatusData.liveClasses, liveStatusData.currentPeriod, setRoomStatuses]);

    const handleGroupSelect = (group: string) => {
        if (selectedGroup === group) {
            clearSelection();
        } else {
            setSelectedGroup(group);
            setActiveTab('schedule');
        }
    };
    
    const handleStudentSelect = (student: LiveStudent) => {
        if (student.techGroup) {
            setSelectedGroup(student.techGroup);
        }
    };

    const today: Assignment['day'] = useMemo(() => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][liveStatusData.now.getDay()] as Assignment['day'], [liveStatusData.now]);

    const selection = useMemo(() => {
        if (selectedGroup) return { type: 'group' as const, value: selectedGroup };
        return null;
    }, [selectedGroup]);

    const { now, currentPeriod, overallStatus } = liveStatusData;
    const dayOfWeek = now.getDay();
    const isBreak = overallStatus.toLowerCase().includes('break');
    const isFinished = overallStatus === 'Finished' || dayOfWeek === 5 || dayOfWeek === 6;

    useEffect(() => {
        if (!isBreak) setIsBreakScreenDismissed(false);
        if (!isFinished) setIsEndOfDayDismissed(false);
    }, [isBreak, isFinished]);
    
    const traineesForSelection = useMemo(() => {
        if (!selectedGroup) return [];
        let students = liveStatusData.liveStudents.filter(s => s.techGroup === selectedGroup);
        
        students.sort((a, b) => {
            if (traineeSort === 'asc') return a.navaId - b.navaId;
            return b.navaId - a.navaId;
        });

        return students;
    }, [selectedGroup, liveStatusData.liveStudents, traineeSort]);
    
    const shouldShowImmersiveBreak = isBreak && currentPeriod && !isBreakScreenDismissed;
    const shouldShowImmersiveEndOfDay = isFinished && !isEndOfDayDismissed;

    return (
        <div className="h-screen w-screen bg-kiosk-bg flex flex-col px-4 py-4 overflow-hidden">
            <StudentDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
            <KioskHeader 
                onExitKiosk={onExitKiosk}
                language={language}
                setLanguage={setLanguage}
                now={liveStatusData.now}
                weekNumber={liveStatusData.weekNumber}
                dailySchedule={dashboardData.dailySchedule}
                currentPeriod={liveStatusData.currentPeriod}
            />
            
             <main className={`flex-grow flex gap-4 min-h-0 mt-4 ${shouldShowImmersiveBreak || shouldShowImmersiveEndOfDay ? 'items-center justify-center' : ''}`}>
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
                ) : shouldShowImmersiveEndOfDay ? (
                     <div className="w-full h-full">
                        <EndOfDayDisplay
                            language={language}
                            now={now}
                            onDismiss={() => setIsEndOfDayDismissed(true)}
                        />
                    </div>
                ) : (
                    <>
                        {/* Left Panel */}
                        <div className={`flex-shrink-0 transition-all duration-500 ease-in-out ${isFocusMode ? 'w-0 opacity-0' : 'w-96 opacity-100'}`}>
                            <div className={`h-full overflow-hidden`}>
                                <KioskSummaryPanel 
                                    liveClasses={liveStatusData.liveClasses}
                                    groupInfo={dashboardData.groupInfo} 
                                    language={language} 
                                    onGroupClick={handleGroupSelect} 
                                    selectedGroup={selectedGroup} 
                                    allGroups={dashboardData.allFilterOptions.allTechGroups}
                                />
                            </div>
                        </div>
                        
                        {/* Center Panel */}
                        <div className="flex-grow bg-kiosk-panel/80 backdrop-blur-sm transition-all duration-300 ease-in-out rounded-2xl flex flex-col min-h-0 relative border border-white/50">
                            <div className="absolute top-3 right-3 z-20">
                                <FocusModeToggle isFocusMode={isFocusMode} onToggle={() => setIsFocusMode(!isFocusMode)} language={language}/>
                            </div>
                            {isBreak && isBreakScreenDismissed && currentPeriod && (<BreakBanner breakName={overallStatus} endTime={currentPeriod.end} now={now} language={language} onRestore={() => setIsBreakScreenDismissed(false)} />)}
                            {isFinished && isEndOfDayDismissed && (<EndOfDayBanner language={language} onRestore={() => setIsEndOfDayDismissed(false)} />)}
                            
                            <div className="flex-grow min-h-0 p-4 flex flex-col">
                                {!selection ? (
                                    <KioskWelcomeMessage
                                        language={language}
                                        liveStatusData={liveStatusData}
                                        dailyAssignments={dashboardData.processedScheduleData.filter(a => a.day === today)}
                                        groupInfo={dashboardData.groupInfo}
                                    />
                                ) : (
                                    <div className="flex flex-col h-full min-h-0">
                                        <div className="flex-shrink-0 flex justify-between items-start mb-2 pl-1 pr-14">
                                            <div className="min-w-0 pr-4">
                                                <h2 className="text-2xl font-bold text-text-primary truncate">
                                                    Group: {selection.value}
                                                </h2>
                                                <div className="flex items-center gap-4 text-sm text-kiosk-text-muted mt-1 font-medium">
                                                    {liveStatusData.currentPeriod && (
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="font-bold text-kiosk-text-body">Now:</span>
                                                            <span className="truncate">{liveStatusData.currentPeriod.name} • ends {formatPeriodTime(liveStatusData.currentPeriod.end)}</span>
                                                        </div>
                                                    )}
                                                    {liveStatusData.nextPeriod && (
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="font-bold text-kiosk-text-body">Next:</span>
                                                            <span className="truncate">{liveStatusData.nextPeriod.name} at {formatPeriodTime(liveStatusData.nextPeriod.start)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {liveStatusData.currentPeriod && liveStatusData.secondsUntilEndOfPeriod !== null && liveStatusData.secondsUntilEndOfPeriod > 0 && (
                                                <Countdown seconds={liveStatusData.secondsUntilEndOfPeriod} />
                                            )}
                                        </div>

                                        <div className="flex-shrink-0 flex items-center border-b border-kiosk-border mb-3">
                                            <button onClick={() => setActiveTab('schedule')} className={`px-4 py-2 font-semibold ${activeTab === 'schedule' ? 'text-kiosk-primary border-b-2 border-kiosk-primary' : 'text-kiosk-text-muted'}`}>Weekly Schedule</button>
                                            <button onClick={() => setActiveTab('trainees')} className={`px-4 py-2 font-semibold ${activeTab === 'trainees' ? 'text-kiosk-primary border-b-2 border-kiosk-primary' : 'text-kiosk-text-muted'}`}>Trainee Roster ({traineesForSelection.length})</button>
                                        </div>
                                        
                                        <div className="flex-grow min-h-0 relative">
                                            {activeTab === 'schedule' && (
                                                <div className="absolute inset-0 rounded-lg bg-white/50 shadow-inner overflow-hidden">
                                                    <GroupDailyScheduleCard selection={selection} allAssignments={dashboardData.processedScheduleData} currentPeriodName={liveStatusData.currentPeriod?.name ?? null} today={today} language={language} now={liveStatusData.now} />
                                                </div>
                                            )}
                                            {activeTab === 'trainees' && (
                                                <div className="absolute inset-0 flex flex-col">
                                                    <div className="flex-grow overflow-y-auto pt-1">
                                                        {traineesForSelection.length > 0 ? (
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                                                {traineesForSelection.map(student => (
                                                                    <TraineeRosterCard key={student.navaId.toString()} student={student} />
                                                                ))}
                                                            </div>
                                                        ) : ( <div className="text-center py-10 text-text-muted"><h3 className="font-bold text-lg">{language === 'ar' ? "لم يتم العثور على متدربين" : "No Trainees Found"}</h3><p className="text-sm mt-1">{language === 'ar' ? "لا يوجد متدربين يطابقون هذا الاختيار." : "There are no trainees for this selection."}</p></div> )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Right Panel */}
                        <div className={`flex-shrink-0 transition-all duration-500 ease-in-out ${isFocusMode ? 'w-0 opacity-0' : 'w-96 opacity-100'}`}>
                             <div className={`h-full flex flex-col overflow-hidden`}>
                                <CampusNavigatorTabs 
                                    liveClasses={liveStatusData.liveClasses}
                                    dailyAssignments={dashboardData.processedScheduleData.filter(a => a.day === today)}
                                    currentPeriod={liveStatusData.currentPeriod}
                                    language={language}
                                    liveStudents={liveStatusData.liveStudents}
                                    onStudentSelect={handleStudentSelect}
                                />
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default KioskPage;