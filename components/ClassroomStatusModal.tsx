import React, { useState } from 'react';
import type { OccupancyData, ClassroomState } from '../types';

interface ClassroomStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    classroomName: string | null;
    liveOccupancy: OccupancyData;
    classroomState: ClassroomState;
    setOutOfService: (classroomName: string, reason: string) => void;
    setAvailable: (classroomName: string) => void;
}

const OUT_OF_SERVICE_REASONS = [
    "AC Broken",
    "Projector Issue",
    "Cleaning",
    "Reserved for Event",
];

const TechIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-status-tech" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.972.03 2.287-.948 2.287-1.56.38-1.56 2.6 0 2.98.978.238 1.488 1.559.948 2.286-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.948c.38 1.56 2.6 1.56 2.98 0a1.532 1.532 0 012.287-.948c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01.948-2.287c1.56-.38 1.56-2.6 0-2.98a1.532 1.532 0 01-.948-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.948zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;
const ProfessionalIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" /></svg>;
const WarningIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.636-1.214 2.852-1.214 3.488 0l5.584 10.68c.636 1.214-.474 2.721-1.744 2.721H4.417c-1.27 0-2.38-1.507-1.744-2.721L8.257 3.099zM10 12a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 011 1v1a1 1 0 11-2 0V9a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
)

const ClassroomStatusModal: React.FC<ClassroomStatusModalProps> = ({ isOpen, onClose, classroomName, liveOccupancy, classroomState, setOutOfService, setAvailable }) => {
    const [reason, setReason] = useState(OUT_OF_SERVICE_REASONS[0]);
    const [otherReason, setOtherReason] = useState('');

    if (!isOpen || !classroomName) return null;

    const roomKey = classroomName.startsWith('C-') ? `2.${classroomName.substring(2)}` : classroomName;
    const occupiedInfo = liveOccupancy[roomKey];
    const manualState = classroomState[classroomName];

    const handleSetOutOfService = () => {
        const finalReason = reason === 'Other' ? otherReason : reason;
        if (finalReason.trim()) {
            setOutOfService(classroomName, finalReason);
            onClose();
            setReason(OUT_OF_SERVICE_REASONS[0]);
            setOtherReason('');
        }
    }
    
    const handleSetAvailable = () => {
        setAvailable(classroomName);
        onClose();
    }

    const renderContent = () => {
        if (manualState?.status === 'out-of-service') {
            return (
                <div>
                    <div className="flex items-center gap-3 bg-yellow-100 text-yellow-800 p-4 rounded-lg">
                        <WarningIcon className="h-8 w-8 flex-shrink-0" />
                        <div>
                             <h4 className="font-bold">This classroom is out of service.</h4>
                             <p className="text-sm">Reason: {manualState.reason}</p>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button onClick={handleSetAvailable} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
                            Mark as Available
                        </button>
                    </div>
                </div>
            );
        }
        
        if (occupiedInfo) {
             const isProfessional = occupiedInfo.type === 'professional';
             const Icon = isProfessional ? ProfessionalIcon : TechIcon;
             const color = isProfessional ? 'text-status-professional' : 'text-status-tech';
            return (
                 <div className="flex items-center gap-4">
                    <Icon />
                    <div>
                        <p className="text-sm text-text-muted">Currently occupied by</p>
                        <p className={`text-2xl font-bold ${color}`}>{occupiedInfo.group}</p>
                    </div>
                </div>
            )
        }

        // Available
        return (
            <div>
                <h4 className="font-semibold text-text-primary mb-3">Manage Classroom Status</h4>
                <div className="p-4 border border-slate-200 rounded-lg">
                    <h5 className="font-semibold text-text-secondary mb-2">Mark as "Out of Service"</h5>
                    <div className="space-y-2">
                         <select value={reason} onChange={e => setReason(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md bg-white">
                             {OUT_OF_SERVICE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                             <option value="Other">Other...</option>
                         </select>
                         {reason === 'Other' && (
                            <input 
                                type="text"
                                value={otherReason}
                                onChange={e => setOtherReason(e.target.value)}
                                placeholder="Please specify reason"
                                className="w-full p-2 border border-slate-300 rounded-md"
                            />
                         )}
                    </div>
                    <div className="mt-3 flex justify-end">
                        <button onClick={handleSetOutOfService} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        )

    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-text-primary">Classroom {classroomName}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default ClassroomStatusModal;
