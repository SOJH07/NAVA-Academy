import React, { useState } from 'react';
import { allFloorLayouts } from '../data/floorPlan';
import useClassroomStore from '../hooks/useClassroomStore';
import ClassroomStatusModal from '../components/ClassroomStatusModal';
import type { FloorPlanItem } from '../types';

const WarningIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.636-1.214 2.852-1.214 3.488 0l5.584 10.68c.636 1.214-.474 2.721-1.744 2.721H4.417c-1.27 0-2.38-1.507-1.744-2.721L8.257 3.099zM10 12a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 011 1v1a1 1 0 11-2 0V9a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
)

const CheckIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
)

const ClassroomCard: React.FC<{ item: FloorPlanItem, onClick: () => void }> = ({ item, onClick }) => {
    const { classrooms } = useClassroomStore();
    const status = classrooms[item.name];

    const isOutOfService = status?.status === 'out-of-service';

    return (
        <button 
            onClick={onClick}
            className={`w-full p-4 rounded-lg shadow-sm border-l-4 flex items-center justify-between transition-all hover:shadow-md hover:scale-105 ${isOutOfService ? 'bg-amber-50 border-amber-500' : 'bg-green-50 border-green-500'}`}
        >
            <div>
                <p className="font-bold text-text-primary text-left">{item.name}</p>
                <p className="text-sm text-text-muted text-left capitalize">{item.type}</p>
            </div>
            <div className="flex items-center gap-2">
                {isOutOfService ? (
                    <>
                        <WarningIcon className="h-6 w-6 text-amber-500" />
                        <div className="text-right">
                           <p className="font-semibold text-amber-600">Out of Service</p>
                           <p className="text-xs text-amber-500 truncate max-w-[120px]">{status.reason}</p>
                        </div>
                    </>
                ) : (
                    <>
                        <CheckIcon className="h-6 w-6 text-green-500" />
                        <p className="font-semibold text-green-600">Available</p>
                    </>
                )}
            </div>
        </button>
    )
};

const FloorSection: React.FC<{ title: string; layout: FloorPlanItem[]; onClassroomClick: (name: string) => void; }> = ({ title, layout, onClassroomClick }) => (
    <div className="bg-bg-panel border border-slate-200 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold text-text-primary p-4 border-b border-slate-200">{title}</h3>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {layout.filter(item => item.type !== 'static').map(item => (
                <ClassroomCard key={item.name} item={item} onClick={() => onClassroomClick(item.name)} />
            ))}
        </div>
    </div>
);


const FacilityManagementPage: React.FC = () => {
    const { classrooms, setOutOfService, setAvailable } = useClassroomStore();
    const [modalState, setModalState] = useState<{isOpen: boolean, classroomName: string | null}>({ isOpen: false, classroomName: null });

    const handleClassroomClick = (classroomName: string) => {
        setModalState({ isOpen: true, classroomName });
    };

    const handleCloseModal = () => {
        setModalState({ isOpen: false, classroomName: null });
    };

    return (
        <>
            <ClassroomStatusModal 
                isOpen={modalState.isOpen}
                onClose={handleCloseModal}
                classroomName={modalState.classroomName}
                liveOccupancy={{}} // No live occupancy on this page
                classroomState={classrooms}
                setOutOfService={setOutOfService}
                setAvailable={setAvailable}
            />
            <div className="space-y-6">
                <FloorSection title="2nd Floor" layout={allFloorLayouts.second} onClassroomClick={handleClassroomClick} />
                <FloorSection title="1st Floor" layout={allFloorLayouts.first} onClassroomClick={handleClassroomClick} />
                <FloorSection title="Ground Floor" layout={allFloorLayouts.ground} onClassroomClick={handleClassroomClick} />
            </div>
        </>
    );
};

export default FacilityManagementPage;