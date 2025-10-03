import React from 'react';

const sessionItems = [
    { label: 'Active Classroom', color: 'bg-classroom-active-bg border-classroom-active-border text-classroom-active-text', isRing: false },
];

const breakItems = [
    { label: 'Lab / Workshop', color: 'bg-lab-bg border-lab-border text-lab-text', isRing: false },
    { label: 'Common Area', color: 'bg-common-bg border-common-border text-common-text', isRing: false },
];

const statusItems = [
    { label: 'Live Session Ring', color: 'ring-2 ring-offset-1 ring-brand-primary animate-glow', isRing: true },
    { label: 'Out of Service', color: 'bg-yellow-400 border-yellow-500', isRing: false },
]

const heatmapItems = [
    { label: 'Low', color: 'bg-green-500' },
    { label: 'Medium', color: 'bg-yellow-500' },
    { label: 'High', color: 'bg-red-500' },
];

const LegendItem: React.FC<{ label: string; color: string; isRing?: boolean; }> = ({ label, color, isRing }) => (
    <div className="flex items-center gap-2">
        {isRing 
            ? <span className={`w-4 h-4 rounded-full bg-slate-200 dark:bg-dark-panel ${color}`}></span>
            : <span className={`w-4 h-4 rounded-full border border-black/10 ${color}`}></span>
        }
        <span className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary">{label}</span>
    </div>
);

const LegendSection: React.FC<{title: string, items: {label: string, color: string, isRing?: boolean}[]}> = ({ title, items }) => (
    <div className="flex items-center gap-x-4 gap-y-2">
        <span className="text-sm font-semibold text-text-muted dark:text-dark-text-muted">{title}:</span>
        {items.map(item => <LegendItem key={item.label} {...item} />)}
    </div>
);

const FloorPlanLegend: React.FC = () => {
    return (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-dark-border/50 flex flex-col items-center justify-center gap-y-3">
            <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-2">
                <LegendSection title="In Session" items={sessionItems} />
                <LegendSection title="Break Time" items={breakItems} />
                <LegendSection title="Status" items={statusItems} />
            </div>
             <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-2">
                <div className="flex items-center gap-x-4 gap-y-2">
                    <span className="text-sm font-semibold text-text-muted dark:text-dark-text-muted">Heatmap:</span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary">Low</span>
                        <div className="flex h-4 w-12 rounded-full overflow-hidden border border-black/10">
                            <div className="w-1/3 bg-green-400"></div>
                            <div className="w-1/3 bg-yellow-400"></div>
                            <div className="w-1/3 bg-red-400"></div>
                        </div>
                        <span className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary">High</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FloorPlanLegend;