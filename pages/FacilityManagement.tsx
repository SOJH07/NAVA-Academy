import React from 'react';
import { staticFloorPlanData, Floor } from '../data/staticFloorPlanData';

const categoryStyles = {
    'ev-service': 'bg-fp-ev-service-bg text-fp-ev-service-text',
    'ev-industrial': 'bg-fp-ev-industrial-bg text-fp-ev-industrial-text',
    'facilities': 'bg-fp-facilities-bg text-fp-facilities-text',
    'admin': 'bg-fp-admin-bg text-fp-admin-text',
    'other': 'bg-fp-other-bg text-fp-other-text border border-fp-other-border dark:border-dark-border',
};

const FloorCard: React.FC<{ floor: Floor }> = ({ floor }) => (
    <div className="bg-white dark:bg-dark-panel rounded-xl shadow-lg overflow-hidden flex flex-col">
        <h3 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary p-4 bg-slate-50 dark:bg-dark-panel-hover text-center">{floor.name}</h3>
        <div className="grid grid-cols-2 flex-grow">
            {floor.layout.map((row, rowIndex) => (
                <React.Fragment key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                        <div 
                            key={cellIndex} 
                            className={`flex items-center justify-center text-center p-2 border-t border-slate-200 dark:border-dark-border h-24 text-xs font-semibold whitespace-pre-wrap text-wrap-balance ${categoryStyles[cell.category]} ${cellIndex === 0 ? 'border-r' : ''}`}
                        >
                            {cell.text}
                        </div>
                    ))}
                </React.Fragment>
            ))}
        </div>
    </div>
);

const LegendItem: React.FC<{ colorClass: string; label: string; description: string }> = ({ colorClass, label, description }) => (
    <div className="flex items-start">
        <div className={`w-5 h-5 rounded-md mr-3 flex-shrink-0 ${colorClass}`}></div>
        <div>
            <p className="font-bold text-text-primary dark:text-dark-text-primary">{label}</p>
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{description}</p>
        </div>
    </div>
);

const FacilityManagementPage: React.FC = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {staticFloorPlanData.map(floor => (
                    <FloorCard key={floor.name} floor={floor} />
                ))}
            </div>

            <div className="bg-white dark:bg-dark-panel rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-6 text-center">Legend & Floor Guide</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
                    <LegendItem colorClass="bg-fp-ev-service-bg" label="EV-Service (Brown)" description="LAP / WS – practical areas, DPST – theory classes" />
                    <LegendItem colorClass="bg-fp-ev-industrial-bg" label="EV-Industrial (Dark Blue)" description="LAP / WS – workshops, DPIT – theory classes" />
                    <LegendItem colorClass="bg-fp-facilities-bg" label="Facilities (Green)" description="Dining Hall, Gym, Recreational Room, Cafeteria" />
                    <LegendItem colorClass="bg-fp-admin-bg" label="Admin & Support (Gray)" description="Prayer Area, Student Affairs, Dean & Staff Offices" />
                </div>
                <div className="border-t border-slate-200 dark:border-dark-border pt-4">
                     <p className="text-sm text-text-secondary dark:text-dark-text-secondary"><strong className="text-text-primary dark:text-dark-text-primary">Floor Guide:</strong> 3rd Floor – mostly classes; 2nd Floor – all classes; 1st Floor – all LAP / WS; Ground Floor – workshops.</p>
                </div>
            </div>
        </div>
    );
};

export default FacilityManagementPage;
