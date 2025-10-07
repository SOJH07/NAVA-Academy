import React, { useState, useEffect, useRef } from 'react';
import type { OccupancyData, ClassroomState } from '../types';

interface ClassroomDetailPopoverProps {
    isOpen: boolean;
    onClose: () => void;
    targetRect: DOMRect | null;
    classroomName: string | null;
    liveOccupancy: OccupancyData;
    classroomState: ClassroomState;
    isManagable: boolean;
    setOutOfService?: (classroomName: string, reason: string) => void;
    setAvailable?: (classroomName: string) => void;
}

const OUT_OF_SERVICE_REASONS = [
    "AC Broken",
    "Projector Issue",
    "Cleaning",
    "Reserved for Event",
];

const TechIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.972.03 2.287-.948 2.287-1.56.38-1.56 2.6 0 2.98.978.238 1.488 1.559.948 2.286-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.948c.38 1.56 2.6 1.56 2.98 0a1.532 1.532 0 012.287-.948c1.372.836 2.942-.734-2.106-2.106a1.532 1.532 0 01.948-2.287c1.56-.38 1.56-2.6 0-2.98a1.532 1.532 0 01-.948-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.948zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;
const ProfessionalIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" /></svg>;
const WarningIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.636-1.214 2.852-1.214 3.488 0l5.584 10.68c.636 1.214-.474 2.721-1.744 2.721H4.417c-1.27 0-2.38-1.507-1.744-2.721L8.257 3.099zM10 12a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 011 1v1a1 1 0 11-2 0V9a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);

const scheduleCodeToId = (code: string): string => {
    return code.replace('0.', '').replace('.', '');
};

const schematicNameToId = (name: string): string => {
    const match = name.match(/(C|Lab|L|WS)-?\s?(\d+)/);
    if (!match) return name; 
    const prefix = match[1];
    const number = match[2];
    if (prefix === 'WS') {
        return `WS${parseInt(number, 10)}`;
    }
    return number;
};

const ClassroomDetailPopover: React.FC<ClassroomDetailPopoverProps> = ({ isOpen, onClose, targetRect, classroomName, liveOccupancy, classroomState, isManagable, setOutOfService, setAvailable }) => {
    const [reason, setReason] = useState(OUT_OF_SERVICE_REASONS[0]);
    const [otherReason, setOtherReason] = useState('');
    const popoverRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (targetRect && popoverRef.current) {
            const popover = popoverRef.current;
            let top = targetRect.bottom + window.scrollY + 8;
            let left = targetRect.left + window.scrollX;

            if (left + popover.offsetWidth > window.innerWidth - 16) {
                left = window.innerWidth - popover.offsetWidth - 16;
            }
            if (top + popover.offsetHeight > window.innerHeight - 16) {
                top = targetRect.top + window.scrollY - popover.offsetHeight - 8;
            }
            setPosition({ top, left });
        }
    }, [targetRect]);
    
    if (!isOpen || !targetRect || !classroomName) return null;

    const schematicId = schematicNameToId(classroomName);
    const occupancyKey = Object.keys(liveOccupancy).find(key => {
        const scheduleId = scheduleCodeToId(key);
        if (!schematicId || !scheduleId) return false;
        if (scheduleId.startsWith('WS')) {
            return schematicId === scheduleId;
        }
        if (schematicId.length === 3 && scheduleId.length === 3 && schematicId === scheduleId) {
            return true;
        }
        return false;
    });
    const assignment = occupancyKey ? liveOccupancy[occupancyKey] : undefined;
    
    const manualState = classroomState[classroomName];

    const handleSetOutOfService = () => {
        const finalReason = reason === 'Other' ? otherReason : reason;
        if (finalReason.trim() && setOutOfService) {
            setOutOfService(classroomName, finalReason);
            onClose();
            setReason(OUT_OF_SERVICE_REASONS[0]);
            setOtherReason('');
        }
    }
    
    const handleSetAvailable = () => {
        if (setAvailable) {
            setAvailable(classroomName);
            onClose();
        }
    }

    const renderLiveInfo = () => {
        if (manualState?.status === 'out-of-service') {
            return (
                 <div className="flex items-center gap-3 bg-yellow-100 text-yellow-800 p-3 rounded-lg">
                    <WarningIcon className="h-6 w-6 flex-shrink-0" />
                    <div>
                         <h4 className="font-bold text-sm">Out of Service</h4>
                         <p className="text-xs">Reason: {manualState.reason}</p>
                    </div>
                </div>
            )
        }
        if (assignment) {
             const isProfessional = assignment.trackType === 'professional';
             const Icon = isProfessional ? ProfessionalIcon : TechIcon;
             const color = isProfessional ? 'text-status-professional' : (assignment.trackType === 'industrial' ? 'text-status-industrial' : 'text-status-tech');
            return (
                 <div className="space-y-2">
                    <p className={`text-xl font-bold ${color}`}>{assignment.group}</p>
                    <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">{assignment.topic}</p>
                    <div className="text-xs text-text-muted dark:text-dark-text-muted pt-2 border-t border-slate-200 dark:border-dark-border mt-2">
                        <p><span className="font-semibold">Instructor:</span> {assignment.instructors.join(', ')}</p>
                        <p><span className="font-semibold">Session:</span> <span className="capitalize">{assignment.sessionType}</span></p>
                    </div>
                </div>
            )
        }
        return <p className="text-sm text-text-muted dark:text-dark-text-muted">This room is currently available.</p>
    }
    
    const renderManagement = () => {
        if (!isManagable) return null;
        if (manualState?.status === 'out-of-service') {
             return (
                <div className="mt-4">
                    <button onClick={handleSetAvailable} className="w-full px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors">
                        Mark as Available
                    </button>
                </div>
             );
        }
        return (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-dark-border">
                <h5 className="font-semibold text-text-secondary dark:text-dark-text-secondary text-xs mb-2">Mark as "Out of Service"</h5>
                <div className="space-y-2">
                     <select value={reason} onChange={e => setReason(e.target.value)} className="w-full p-2 border border-slate-300 dark:border-dark-border rounded-md bg-white dark:bg-dark-body text-sm">
                         {OUT_OF_SERVICE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                         <option value="Other">Other...</option>
                     </select>
                     {reason === 'Other' && (
                        <input 
                            type="text"
                            value={otherReason}
                            onChange={e => setOtherReason(e.target.value)}
                            placeholder="Please specify reason"
                            className="w-full p-2 border border-slate-300 dark:border-dark-border rounded-md text-sm bg-white dark:bg-dark-body"
                        />
                     )}
                </div>
                <div className="mt-3">
                    <button onClick={handleSetOutOfService} className="w-full px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors">
                        Confirm
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-40" onClick={onClose}>
            <div
                ref={popoverRef}
                style={position}
                className="absolute bg-white dark:bg-dark-panel rounded-xl shadow-2xl p-4 w-64 animate-fade-in"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-bold text-text-primary dark:text-dark-text-primary truncate">{classroomName}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-text-muted dark:text-dark-text-muted hover:bg-slate-200 dark:hover:bg-dark-panel-hover">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                {renderLiveInfo()}
                {renderManagement()}
            </div>
        </div>
    );
};

export default ClassroomDetailPopover;