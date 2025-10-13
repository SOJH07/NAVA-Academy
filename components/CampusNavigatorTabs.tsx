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
const ClassroomIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3.5a1 1 0 00.028 1.84l7 3.5a1 1 0 00.764 0l7-3.5a1 1 0 00.028-1.84l-7-3.5z" /><path d="M3 9.332V14a1 1 0 00.553.894l6 3a1 1 0 00.894 0l6-3A1 1 0 0017 14v-4.668-2.45l-7 3.5-7-3.5v2.45z" /></svg>;
const LabIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.5 3a.5.5 0 00-.5.5v2.5a.5.5 0 00.5.5h.5a.5.5 0 00.5-.5V5.5a.5.5 0 00-.5-.5h-.5z" clipRule="evenodd" /></svg>;
const WorkshopIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.972.03 2.287-.948 2.287-1.56.38-1.56 2.6 0 2.98.978.238 1.488 1.559.948 2.286-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.948c.38 1.56 2.6 1.56 2.98 0a1.532 1.532 0 012.287-.948c1.372.836 2.942-.734-2.106-2.106a1.532 1.532 0 01.948-2.287c1.56-.38 1.56-2.6 0-2.98a1.532 1.532 0 01-.948-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.948zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;
const FacilityIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a2 2 0 00-2 2v2H7a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2v-8a2 2 0 00-2-2h-1V4a2 2 0 00-2-2zm-1 4V4a1 1 0 112 0v2H9z" clipRule="evenodd" /></svg>;
const ClockIconSearch = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>;

const getRoomIcon = (type: RoomType) => {
    switch (type) {
        case 'Classroom': return <ClassroomIcon className="h-3.5 w-3.5" />;
        case 'Lab': return <LabIcon className="h-3.5 w-3.5" />;
        case 'Workshop': return <WorkshopIcon className="h-3.5 w-3.5" />;
        default: return <FacilityIcon className="h-3.5 w-3.5 text-slate-400" />;
    }
};

const getStatusInfo = (status?: RoomStatus) => {
    if (!status) return { dot: 'bg-slate-400', tooltip: 'Status Unknown' };
    switch (status.status) {
        case 'inClass': return { dot: 'bg-emerald-500 animate-pulse', tooltip: `In Class • ${status.group} (${status.instructor})` };
        case 'staffOnly': return { dot: 'is-lock', tooltip: 'Staff Only' };
        default: return { dot: 'bg-slate-400', tooltip: 'Empty' };
    }
};

const RoomPill: React.FC<{ cell: Cell; }> = ({ cell }) => {
    const { selectedGroup, setSelectedGroup, selectedRoom, setSelectedRoom } = useKioskStore();
    const roomStatus = useKioskStore(state => state.roomStatusById[cell.code]);
    
    const isInteractive = cell.type !== 'Facility';

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
        return (
            <button
                onClick={handleClick}
                title={`In Class: ${roomStatus.group} in ${cell.code}`}
                className={`w-full h-[32px] pl-2 pr-3 rounded-lg flex items-center gap-2 border-l-4 border-emerald-500 transition-all duration-200 ${isSelected ? 'bg-sky-100 ring-2 ring-sky-400' : 'bg-white hover:bg-slate-50'}`}
            >
                <div className="flex-grow min-w-0">
                    <p className="font-bold text-xs text-slate-800 truncate">{roomStatus.group}</p>
                </div>
                <p className="text-[10px] text-slate-500 font-semibold flex-shrink-0">{cell.code.replace('LAP ','').replace('Computer Lab-','Comp ')}</p>
            </button>
        );
    }
    
    return (
        <button
            onClick={handleClick}
            disabled={!isInteractive}
            title={cell.code}
            className={`w-full h-[32px] px-3 rounded-lg flex items-center gap-2 transition-all duration-200 ${isSelected ? 'bg-sky-100 ring-2 ring-sky-400' : 'bg-slate-100 hover:bg-slate-200'} ${isInteractive ? 'cursor-pointer' : 'cursor-default opacity-70'}`}
        >
            <div className="text-slate-500">{getRoomIcon(cell.type)}</div>
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
            <div className="grid grid-cols-2 auto-rows-[32px] gap-2.5">
                {activeFloorData.rows.map((row, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                        <RoomPill cell={row[0]}/>
                        <RoomPill cell={row[1]}/>
                    </React.Fragment>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-bg-panel rounded-xl shadow-xl flex flex-col h-full min-h-0">
             <div className="flex items-center gap-3 p-4 rounded-t-xl bg-white flex-shrink-0 border-b border-slate-200">
                <div className="bg-brand-primary-light p-2 rounded-lg">
                    <MapPinIcon className="h-6 w-6 text-brand-primary" />
                </div>
                <h2 className={`font-bold text-lg text-black`}>
                    {language === 'ar' ? 'مستكشف الحرم الجامعي' : 'Campus Navigator'}
                </h2>
            </div>

            <div className="p-4 flex-grow flex flex-col min-h-0">
                {!showResults && (
                    <div className="flex-shrink-0 bg-slate-100 p-1 rounded-lg flex items-center justify-center gap-1 mb-3">
                        {(["Ground", "1st", "2nd", "3rd"] as const).map((floorName) => (
                            <button 
                                key={floorName} 
                                onClick={() => setSelectedFloor(floorName)} 
                                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors w-full ${selectedFloor === floorName ? 'bg-brand-primary-light text-text-primary shadow-sm' : 'text-text-muted hover:bg-slate-200'}`}
                            >
                                {floorName}
                            </button>
                        ))}
                    </div>
                )}
                <div className="flex-grow overflow-y-auto -mr-2 pr-2">
                    {renderMainContent()}
                </div>
            </div>
             <div className="flex-shrink-0 mt-auto p-4 border-t border-kiosk-border">
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