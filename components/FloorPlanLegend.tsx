import React from 'react';

const legendItems = [
    { label: 'Industrial Tech', color: 'bg-status-industrial' },
    { label: 'Service Tech', color: 'bg-status-tech' },
    { label: 'Professional Development', color: 'bg-status-professional' },
    { label: 'Vacant', color: 'bg-status-vacant' },
];

const FloorPlanLegend: React.FC = () => {
    return (
        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-center flex-wrap gap-x-6 gap-y-2">
            {legendItems.map(item => (
                <div key={item.label} className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-md ${item.color}`}></span>
                    <span className="text-sm text-text-secondary">{item.label}</span>
                </div>
            ))}
        </div>
    );
};

export default FloorPlanLegend;