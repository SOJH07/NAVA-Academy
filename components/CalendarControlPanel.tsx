import React from 'react';
import type { CalendarLayer } from '../types';

interface CalendarControlPanelProps {
    layers: CalendarLayer[];
    activeLayers: Set<string>;
    setActiveLayers: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const CalendarControlPanel: React.FC<CalendarControlPanelProps> = ({ layers, activeLayers, setActiveLayers }) => {

    const handleLayerToggle = (layerId: string) => {
        setActiveLayers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(layerId)) {
                newSet.delete(layerId);
            } else {
                newSet.add(layerId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        setActiveLayers(new Set(layers.map(l => l.id)));
    };

    const handleClearAll = () => {
        setActiveLayers(new Set());
    };

    return (
        <aside className="w-64 flex-shrink-0 p-4 flex flex-col">
            <h3 className="text-lg font-bold text-text-primary mb-4">Calendar Layers</h3>
            <div className="flex-grow space-y-3">
                {layers.map(layer => (
                    <label key={layer.id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-100">
                        <input
                            type="checkbox"
                            checked={activeLayers.has(layer.id)}
                            onChange={() => handleLayerToggle(layer.id)}
                            className="h-5 w-5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                        />
                        <div className={`w-4 h-4 rounded-sm ${layer.color} border border-black/10`}></div>
                        <span className="text-sm font-semibold text-text-secondary">{layer.label}</span>
                    </label>
                ))}
            </div>
            <div className="flex-shrink-0 pt-4 border-t border-slate-200 flex items-center justify-between">
                 <button onClick={handleSelectAll} className="text-sm font-semibold text-brand-primary hover:underline">Select All</button>
                 <button onClick={handleClearAll} className="text-sm font-semibold text-red-500 hover:underline">Clear All</button>
            </div>
        </aside>
    );
};

export default CalendarControlPanel;