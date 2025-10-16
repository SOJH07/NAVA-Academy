import React, { useState, useMemo, useEffect } from 'react';
import useKioskStore, { RoomStatus } from '../store/kioskStore';
import { FLOOR_PLANS, Cell, RoomType, FloorMatrix } from '../data/floorPlanMatrix';
import type { FloorPlanItem, LiveClass, Assignment, DailyPeriod, LiveStudent } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { dailyPeriodsData } from '../data/dailyPeriods';


// --- ICONS & SUB-COMPONENTS --- //

const getFloorFromClassroomCode = (code: string): FloorMatrix['name'] | null => {
    if (code.startsWith('WS-') || code.startsWith('0.')) return 'Ground';
    if (code.startsWith('1.')) return '1st';
    if (code.startsWith('2.')) return '2nd';
    if (code.startsWith('3.')) return '3rd';
    return null;
}

const MapPinIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;
const ClassroomIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>;
const LabIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v13.5A2.5 2.5 0 006.5 20h11a2.5 2.5 0 002.5-2.5V4" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 4h8" /><path strokeLinecap="round" strokeLinejoin="round" d="M10 12h4" /></svg>;
const WorkshopIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c.94-1.543.826 3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const FacilityIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a2 2 0 00-2 2v2H7a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2v-8a2 2 0 00-2-2h-1V4a2 2 0 00-2-2zm-1 4V4a1 1 0 112 0v2H9z" clipRule="evenodd" /></svg>;
const ClockIconSearch = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>;

const floors = [
    { name: 'Ground', label: 'Ground', description: 'WORKSHOPS', icon: <WorkshopIcon />, activeClasses: 'bg-[#FEF3C7] border-amber-300 text-amber-900' },
    { name: '1st', label: '1st', description: 'LABS', icon: <LabIcon />, activeClasses: 'bg-[#EDE9FE] border-purple-300 text-purple-900' },
    { name: '2nd', label: '2nd', description: 'CLASSROOMS', icon: <ClassroomIcon />, activeClasses: 'bg-[#D1FAE5] border-emerald-300 text-emerald-900' },
    { name: '3rd', label: '3rd', description: 'LABS', icon: <LabIcon />, activeClasses: 'bg-[#EDE9FE] border-purple-300 text-purple-900' },
] as const;

type FloorInfo = typeof floors[number];

const FloorTab: React.FC<{ floor: FloorInfo; isActive: boolean; onClick: () => void; }> = ({ floor, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex flex-col items-center justify-center p-1.5
      w-full rounded-lg border-2 transition-all duration-300 transform
      ${isActive
        ? `${floor.activeClasses} shadow-md scale-105`
        : 'bg-slate-100 border-transparent text-slate-500'
      }
    `}
  >
    <div className={isActive ? 'font-black' : 'opacity-70'}>
      {React.cloneElement(floor.icon, { className: 'h-4 w-4' })}
    </div>
    <span className={`font-bold text-xs leading-tight mt-1 ${isActive ? 'font-extrabold' : 'font-semibold'}`}>{floor.label}</span>
    <span className="text-[7px] font-bold uppercase tracking-wider">{floor.description}</span>
  </button>
);


const getRoomIcon = (type: RoomType) => {
    switch (type) {
        case 'Classroom': return <ClassroomIcon className="h-4 w-4 text-status-professional" />;
        case 'Lab': return <LabIcon className="h-4 w-4 text-status-industrial" />;
        case 'Workshop': return <WorkshopIcon className="h-4 w-4 text-status-tech" />;
        default: return <FacilityIcon className="h-4 w-4 text-slate-400" />;
    }
};

const getStatusInfo = (status?: RoomStatus) => {
    if (!status) return { dot: 'bg-green-400 shadow-glow-sm animate-glow', tooltip: 'Available' };
    switch (status.status) {
        case 'inClass': return { dot: 'bg-blue-500 animate-pulse-slow', tooltip: `In Class • ${status.group} • ${status.period}` };
        case 'break': return { dot: 'bg-amber-400 animate-pulse-slow', tooltip: 'On Break' };
        case 'maintenance': return { dot: 'bg-rose-500', tag: 'Maint.', tooltip: 'Maintenance' };
        case 'staffOnly': return { dot: 'bg-violet-500', tag: 'Staff', tooltip: 'Staff Only' };
        default: return { dot: 'bg-green-400 shadow-glow-sm animate-glow', tooltip: 'Available' };
    }
};

const RoomPill: React.FC<{ cell: Cell; liveClasses: LiveClass[] }> = ({ cell, liveClasses }) => {
    const { selectedGroup, setSelectedGroup, selectedRoom, setSelectedRoom } = useKioskStore();
    const roomStatus = useKioskStore(state => state.roomStatusById[cell.code]);
    
    const isInteractive = cell.type !== 'Facility';
    const statusInfo = getStatusInfo(roomStatus);

    const isSelectedByRoom = selectedRoom?.name === cell.code;
    const isSelectedByGroup = selectedGroup && roomStatus?.group === selectedGroup;
    const isSelected = isSelectedByRoom || isSelectedByGroup;

    const handleClick = () => {
        if (!isInteractive) return;
        if (roomStatus?.status === 'inClass' && roomStatus.group) {
            setSelectedGroup(selectedGroup === roomStatus.group ? null : roomStatus.group);
        } else {
            const fullRoom: FloorPlanItem = {
                name: cell.code, type: cell.type.toLowerCase() as FloorPlanItem['type'],
                gridColumn: '', gridRow: ''
            };
            setSelectedRoom(isSelectedByRoom ? null : fullRoom);
        }
    };
    
    if (roomStatus?.status === 'inClass' && roomStatus.group) {
        const liveClass = liveClasses.find(lc => lc.group === roomStatus.group);
        let trackBorderColor = 'border-slate-400';
        if (liveClass?.trackType === 'industrial') trackBorderColor = 'border-status-industrial';
        else if (liveClass?.trackType === 'service') trackBorderColor = 'border-status-tech';

        return (
            <button
                onClick={handleClick}
                title={`In Class: ${roomStatus.group} in ${cell.code}`}
                className={`w-full h-[36px] px-3 rounded-full flex items-center justify-between gap-2 border-l-4 ${trackBorderColor} transition-all duration-300 ease-out transform hover:-translate-y-0.5 ${isSelected ? 'bg-sky-100 ring-2 ring-sky-400 shadow-lg' : 'bg-white hover:bg-slate-50 shadow-md'}`}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${statusInfo.dot}`}></div>
                    <p className="font-bold text-xs text-slate-800 truncate">{roomStatus.group}</p>
                </div>
                <p className="text-[10px] text-slate-500 font-semibold flex-shrink-0">{cell.code.replace('LAP ','').replace('Computer Lab-','Comp ')}</p>
            </button>
        );
    }
    
    return (
        <button
            disabled={!isInteractive}
            onClick={handleClick}
            title={cell.code}
            className={`w-full h-[36px] px-3 rounded-full flex items-center gap-2 border transition-all duration-300 ease-out transform hover:-translate-y-0.5 ${isSelected ? 'bg-sky-100 ring-2 ring-sky-400 shadow-lg' : 'bg-slate-100 hover:bg-slate-200 shadow-sm'} ${isInteractive ? 'cursor-pointer' : 'cursor-default opacity-70'}`}
        >
            <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${statusInfo.dot}`}></div>
            {getRoomIcon(cell.type)}
            <p className="font-semibold text-xs text-slate-600 truncate">{cell.code}</p>
        </button>
    );
};

const SearchResultCard: React.FC<{ student: LiveStudent; onSelect: (student: LiveStudent) => void; }> = ({ student, onSelect }) => {
    const period = dailyPeriodsData.find(p => p.name === student.currentPeriod);
    const timeRange = period ? `${period.start} - ${period.end}` : 'N/A';
    const trackColor = student.trackName === 'Industrial Tech' ? 'bg-status-industrial' : 'bg-status-tech';

    return (
        <button
            onClick={() => onSelect(student)}
            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl shadow-sm p-3 text-left w-full h-full hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-kiosk-primary transition-all duration-200 ease-in-out hover:shadow-md"
            aria-label={`Select student ID ${student.navaId}`}
        >
            <div className="flex justify-between items-start">
                <p className="font-bold text-kiosk-text-title">{student.navaId}</p>
                <div className={`w-2 h-2 rounded-full mt-1 ${trackColor}`} title={student.trackName}></div>
            </div>
            <p className="text-xs font-medium text-kiosk-text-muted mt-1">{student.techGroup}</p>
            
            <div className="mt-2 pt-2 border-t border-[#E2E8F0] text-xs text-kiosk-text-body space-y-1">
                <div className="flex items-center gap-1.5 text-kiosk-text-muted">
                    <MapPinIcon className="h-3.5 w-3.5" />
                    <span className="truncate" title={student.location}>{student.location}</span>
                </div>
                <div className="flex items-center gap-1.5 text-kiosk-text-muted">
                    <ClockIconSearch />
                    <span>{timeRange}</span>
                </div>
            </div>
        </button>
    );
};

const SearchResultCardSkeleton: React.FC = () => (
    <div className="bg-slate-100 p-3 rounded-xl w-full min-h-[124px] animate-pulse">
        <div className="flex justify-between items-start">
            <div className="h-4 w-12 bg-slate-200 rounded"></div>
            <div className="h-2 w-2 bg-slate-200 rounded-full"></div>
        </div>
        <div className="h-3 w-16 bg-slate-200 rounded mt-1.5"></div>
        <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
            <div className="h-3 w-full bg-slate-200 rounded"></div>
            <div className="h-3 w-1/2 bg-slate-200 rounded"></div>
        </div>
    </div>
);


// --- MAIN COMPONENT --- //

interface CampusNavigatorTabsProps {
    liveClasses: LiveClass[];
    dailyAssignments: Assignment[];
    currentPeriod: DailyPeriod | null;
    language: 'en' | 'ar';
    liveStudents: LiveStudent[];
    onStudentSelect: (student: LiveStudent) => void;
}

const CampusNavigatorTabs: React.FC<CampusNavigatorTabsProps> = ({ liveClasses, dailyAssignments, currentPeriod, language, liveStudents, onStudentSelect }) => {
    const { selectedFloor, setSelectedFloor, selectedGroup } = useKioskStore();
    const activeFloorData = FLOOR_PLANS.find(f => f.name === selectedFloor) || FLOOR_PLANS[2];

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 300);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (selectedGroup && currentPeriod) {
            const assignment = dailyAssignments.find(a => a.group === selectedGroup && a.period === currentPeriod.name);
            if (assignment) {
                const floor = getFloorFromClassroomCode(assignment.classroom);
                if (floor && floor !== selectedFloor) {
                    setSelectedFloor(floor);
                }
            }
        }
    }, [selectedGroup, currentPeriod, dailyAssignments, setSelectedFloor, selectedFloor]);

    const searchResults = useMemo(() => {
        if (debouncedSearch.length < 2) return [];
        const lowerSearch = debouncedSearch.toLowerCase();
        return liveStudents.filter(s =>
            s.fullName.toLowerCase().includes(lowerSearch) ||
            String(s.navaId).includes(lowerSearch) ||
            s.techGroup.toLowerCase().includes(lowerSearch)
        );
    }, [debouncedSearch, liveStudents]);
    
    useEffect(() => {
        if (debouncedSearch.length >= 2) {
            setIsLoading(true);
            const timer = setTimeout(() => setIsLoading(false), 250);
            return () => clearTimeout(timer);
        } else {
            setIsLoading(false);
        }
    }, [debouncedSearch]);

    const showResults = debouncedSearch.length >= 2;

    const renderMainContent = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: 8 }).map((_, i) => <SearchResultCardSkeleton key={i} />)}
                </div>
            );
        }
        if (showResults) {
            if (searchResults.length === 0) {
                return (
                    <div className="text-center py-10 text-kiosk-text-muted">
                        <h3 className="font-bold text-base">{language === 'ar' ? "لم يتم العثور على متدربين" : "No matching trainees"}</h3>
                        <p className="text-sm mt-1">{language === 'ar' ? "يرجى تجربة اسم أو رقم تعريف مختلف." : "Please try a different name or ID."}</p>
                    </div>
                );
            }
            return (
                 <div className="grid grid-cols-2 gap-3">
                    {searchResults.map(student => (
                        <SearchResultCard key={student.navaId} student={student} onSelect={onStudentSelect} />
                    ))}
                </div>
            );
        }
        return (
            <div key={selectedFloor} className="grid grid-cols-2 auto-rows-[36px] gap-2.5 animate-fade-in">
                {activeFloorData.rows.map((row, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                        <RoomPill cell={row[0]} liveClasses={liveClasses}/>
                        <RoomPill cell={row[1]} liveClasses={liveClasses}/>
                    </React.Fragment>
                ))}
            </div>
        );
    };

    return (
        <div className="border border-slate-200 rounded-2xl shadow-sm bg-white flex flex-col h-full min-h-0">
             <div className="flex items-center gap-3 p-4 md:p-5 rounded-t-2xl bg-white flex-shrink-0 border-b border-slate-200">
                <div className="bg-kiosk-primary/10 p-2 rounded-lg">
                    <MapPinIcon className="h-6 w-6 text-kiosk-primary" />
                </div>
                <h2 className={`font-bold text-lg text-black`}>
                    {language === 'ar' ? 'مستكشف الحرم الجامعي' : 'Campus Navigator'}
                </h2>
            </div>

            <div className="p-4 md:p-5 flex-grow flex flex-col min-h-0">
                {!showResults && (
                    <div className="flex-shrink-0 grid grid-cols-4 gap-2 mb-4">
                        {floors.map((floor) => (
                            <FloorTab 
                                key={floor.name} 
                                floor={floor}
                                isActive={selectedFloor === floor.name} 
                                onClick={() => setSelectedFloor(floor.name as "Ground" | "1st" | "2nd" | "3rd")} 
                            />
                        ))}
                    </div>
                )}
                <div className="flex-grow overflow-y-auto -mr-2 pr-2">
                    {renderMainContent()}
                </div>
            </div>
             <div className="flex-shrink-0 mt-auto p-4 md:p-5 border-t border-kiosk-border">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-kiosk-text-muted" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                    </span>
                    <input 
                        type="search" 
                        placeholder={language === 'ar' ? "البحث عن متدرب..." : "Search Trainee..."}
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        className="w-full bg-white border border-kiosk-border rounded-lg py-3 px-4 pl-10 text-base text-kiosk-text-title focus:outline-none focus:ring-2 focus:ring-kiosk-primary"
                        aria-label={language === 'ar' ? "البحث عن متدرب" : "Search Trainee"}
                    />
                     {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 flex items-center pr-3 text-kiosk-text-muted hover:text-kiosk-text-title">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CampusNavigatorTabs;
