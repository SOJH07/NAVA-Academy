import React, { useEffect } from 'react';
import useKioskStore, { RoomStatus } from '../store/kioskStore';
import { FLOOR_PLANS, Cell, RoomType, FloorMatrix } from '../data/floorPlanMatrix';
import type { FloorPlanItem, LiveClass, Assignment, DailyPeriod } from '../types';

const getFloorFromClassroomCode = (code: string): FloorMatrix['name'] | null => {
    if (code.startsWith('WS-') || code.startsWith('0.')) return 'Ground';
    if (code.startsWith('1.')) return '1st';
    if (code.startsWith('2.')) return '2nd';
    if (code.startsWith('3.')) return '3rd';
    return null;
}

const ClassroomIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3.5a1 1 0 00.028 1.84l7 3.5a1 1 0 00.764 0l7-3.5a1 1 0 00.028-1.84l-7-3.5z" /><path d="M3 9.332V14a1 1 0 00.553.894l6 3a1 1 0 00.894 0l6-3A1 1 0 0017 14v-4.668-2.45l-7 3.5-7-3.5v2.45z" /></svg>;
const LabIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.5 3a.5.5 0 00-.5.5v2.5a.5.5 0 00.5.5h.5a.5.5 0 00.5-.5V5.5a.5.5 0 00-.5-.5h-.5z" clipRule="evenodd" /></svg>;
const WorkshopIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.972.03 2.287-.948 2.287-1.56.38-1.56 2.6 0 2.98.978.238 1.488 1.559.948 2.286-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.948c.38 1.56 2.6 1.56 2.98 0a1.532 1.532 0 012.287-.948c1.372.836 2.942-.734-2.106-2.106a1.532 1.532 0 01.948-2.287c1.56-.38 1.56-2.6 0-2.98a1.532 1.532 0 01-.948-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.948zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;
const FacilityIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a2 2 0 00-2 2v2H7a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2v-8a2 2 0 00-2-2h-1V4a2 2 0 00-2-2zm-1 4V4a1 1 0 112 0v2H9z" clipRule="evenodd" /></svg>;

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
                className={`w-full h-[28px] pl-2 pr-3 rounded-lg flex items-center gap-2 text-left border-l-4 border-emerald-500 transition-all duration-200 ${isSelected ? 'bg-sky-100 ring-2 ring-sky-400' : 'bg-white hover:bg-slate-50'}`}
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
            className={`w-full h-[28px] px-3 rounded-lg flex items-center gap-2 text-left transition-all duration-200 ${isSelected ? 'bg-sky-100 ring-2 ring-sky-400' : 'bg-slate-100 hover:bg-slate-200'} ${isInteractive ? 'cursor-pointer' : 'cursor-default opacity-70'}`}
        >
            <div className="text-slate-500">{getRoomIcon(cell.type)}</div>
            <p className="font-semibold text-xs text-slate-600 truncate">{cell.code}</p>
        </button>
    );
};

interface CampusNavigatorTabsProps {
    liveClasses: LiveClass[];
    dailyAssignments: Assignment[];
    currentPeriod: DailyPeriod | null;
    language: 'en' | 'ar';
}

const CampusNavigatorTabs: React.FC<CampusNavigatorTabsProps> = ({ liveClasses, dailyAssignments, currentPeriod, language }) => {
    const { selectedFloor, setSelectedFloor, selectedGroup } = useKioskStore();
    const activeFloorData = FLOOR_PLANS.find(f => f.name === selectedFloor) || FLOOR_PLANS[2];

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

    return (
        <div className="bg-nava-neutral rounded-xl shadow-lg flex flex-col p-4 h-full min-h-0">
            <h2 className={`text-3xl font-extrabold font-montserrat text-kiosk-text-title mb-6 flex-shrink-0 px-1 ${language === 'ar' ? 'font-kufi' : ''}`}>
                {language === 'ar' ? 'مستكشف الحرم الجامعي' : 'Campus Navigator'}
            </h2>
            <div className="flex-shrink-0 bg-kiosk-bg p-1 rounded-lg flex items-center justify-center gap-1 mb-3">
                {(["Ground", "1st", "2nd", "3rd"] as const).map((floorName) => (
                     <button 
                        key={floorName} 
                        onClick={() => setSelectedFloor(floorName)} 
                        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors w-full ${selectedFloor === floorName ? 'bg-white text-kiosk-primary shadow-sm' : 'text-kiosk-text-muted hover:bg-slate-200'}`}
                    >
                        {floorName}
                    </button>
                ))}
            </div>
            <div className="flex-grow overflow-y-auto -mr-2 pr-2">
                <div className="grid grid-cols-2 auto-rows-[28px] gap-2">
                    {activeFloorData.rows.map((row, rowIndex) => (
                        <React.Fragment key={rowIndex}>
                            <RoomPill cell={row[0]}/>
                            <RoomPill cell={row[1]}/>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CampusNavigatorTabs;