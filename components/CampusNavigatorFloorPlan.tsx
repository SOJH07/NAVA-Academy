import React from 'react';
import useKioskStore, { RoomStatus } from '../store/kioskStore';
import { FLOOR_PLANS, Cell, RoomType } from '../data/floorPlanMatrix';
import type { FloorPlanItem } from '../types';

// Helper to get styles for room types
const getRoomStyles = (type: RoomType) => {
    switch (type) {
        case 'Classroom': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
        case 'Lab': return 'bg-violet-50 text-violet-800 border-violet-200';
        case 'Workshop': return 'bg-amber-50 text-amber-800 border-amber-200';
        default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
};

// Helper to get status dot and tooltip info
const getStatusInfo = (status?: RoomStatus) => {
    if (!status) return { dot: 'bg-slate-300', tag: 'Empty', tooltip: 'Status Unknown' };
    switch (status.status) {
        case 'inClass': return { dot: 'bg-emerald-500 animate-pulse', tag: 'Active', tooltip: `In Class • ${status.group} • ${status.period}` };
        case 'break': return { dot: 'bg-amber-400', tag: 'Break', tooltip: 'On Break' };
        case 'maintenance': return { dot: 'bg-rose-500', tag: 'Maint.', tooltip: 'Maintenance' };
        case 'staffOnly': return { dot: 'bg-violet-500', tag: 'Staff', tooltip: 'Staff Only' };
        default: return { dot: 'bg-slate-300', tag: 'Empty', tooltip: 'Empty' };
    }
};

// Sub-component for each room cell
const RoomCell: React.FC<{ cell: Cell; floorName: string }> = ({ cell, floorName }) => {
    const { selectedRoom, setSelectedRoom, roomStatusById } = useKioskStore();
    
    const isSelected = selectedRoom?.name === cell.code;
    const isInteractive = cell.type !== 'Facility';
    const roomStatus = roomStatusById[cell.code];
    const statusInfo = getStatusInfo(roomStatus);

    // Determine what text to display
    const displayText = roomStatus?.status === 'inClass' && roomStatus.group
        ? roomStatus.group
        : cell.code;


    const handleRoomClick = () => {
        if (!isInteractive) return;
        
        const fullRoom: FloorPlanItem = {
            name: cell.code,
            type: cell.type.toLowerCase() as FloorPlanItem['type'],
            gridColumn: '',
            gridRow: ''
        };
        setSelectedRoom(isSelected ? null : fullRoom);
    };

    return (
        <button
            role="button"
            tabIndex={isInteractive ? 0 : -1}
            disabled={!isInteractive}
            onClick={handleRoomClick}
            onKeyDown={(e) => isInteractive && (e.key === 'Enter' || e.key === ' ') && handleRoomClick()}
            title={statusInfo.tooltip}
            className={`h-[36px] w-full rounded-full px-3 text-[12px] font-medium inline-flex items-center justify-between border transition-all duration-200 ease-out ${getRoomStyles(cell.type)} ${isSelected ? 'ring-2 ring-sky-400 scale-105 shadow-md' : ''} ${isInteractive ? 'cursor-pointer hover:shadow-sm' : 'cursor-default opacity-80'}`}
        >
            <div className="flex items-center gap-2 truncate">
                <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${statusInfo.dot}`}></span>
                <span className="truncate">{displayText}</span>
            </div>
            {isInteractive && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>}
        </button>
    );
};

// The main component, redesigned
const CampusNavigatorFloorPlan: React.FC = () => {
    return (
        <div className="flex-shrink-0 bg-white/90 backdrop-blur-md border rounded-xl shadow-lg px-4 pt-2 pb-3">
            {/* Custom scrollbar styling to hide it */}
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {FLOOR_PLANS.map(floor => (
                    <div key={floor.name} className="min-w-0">
                        <div className="font-bold text-sm text-kiosk-text-muted px-2 mb-2">{floor.name}</div>
                        <div className="grid grid-cols-2 gap-2 auto-rows-[36px] max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                            {floor.rows.map((row, rowIndex) => (
                                <React.Fragment key={rowIndex}>
                                    <RoomCell cell={row[0]} floorName={floor.name} />
                                    <RoomCell cell={row[1]} floorName={floor.name} />
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CampusNavigatorFloorPlan;