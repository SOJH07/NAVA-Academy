import React from 'react';

const LegendItem: React.FC<{ label: string; children: React.ReactNode; }> = ({ label, children }) => (
    <div className="flex items-center gap-2">
        {children}
        <span className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary">{label}</span>
    </div>
);

const LegendSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div className="flex items-center gap-x-4 gap-y-2">
        <span className="text-sm font-semibold text-text-muted dark:text-dark-text-muted">{title}:</span>
        <div className="flex items-center gap-x-4 gap-y-2">
            {children}
        </div>
    </div>
);

const FloorPlanLegend: React.FC = () => {
    return (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-dark-border/50 flex flex-col items-center justify-center gap-y-3">
            <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-2">
                <LegendSection title="Session Type">
                    <LegendItem label="Industrial"><span className="w-4 h-4 rounded-sm bg-classroom-live-bg dark:bg-classroom-live-dark-bg border-l-4 border-status-industrial"></span></LegendItem>
                    <LegendItem label="Service"><span className="w-4 h-4 rounded-sm bg-classroom-live-bg dark:bg-classroom-live-dark-bg border-l-4 border-status-tech"></span></LegendItem>
                    <LegendItem label="Professional"><span className="w-4 h-4 rounded-sm bg-classroom-live-bg dark:bg-classroom-live-dark-bg border-l-4 border-status-professional"></span></LegendItem>
                </LegendSection>
                <LegendSection title="Status">
                     <LegendItem label="Out of Service"><span className="w-4 h-4 rounded-sm bg-yellow-100 border-l-4 border-yellow-500"></span></LegendItem>
                     <LegendItem label="Selected"><span className="w-4 h-4 rounded-sm bg-classroom-live-bg dark:bg-classroom-live-dark-bg shadow-glow-sm"></span></LegendItem>
                </LegendSection>
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
