import React from 'react';

interface StatPillProps {
    icon: React.ReactElement;
    label: string;
    value: number;
    color: string;
}
const StatPill: React.FC<StatPillProps> = ({ icon, label, value, color }) => (
    <div className={`flex items-center gap-2 p-2 rounded-lg ${color}`}>
        {React.cloneElement<React.SVGProps<SVGSVGElement>>(icon, { className: 'h-5 w-5' })}
        <span className="font-semibold text-sm">{label}:</span>
        <span className="font-bold text-base">{value}</span>
    </div>
);

interface ActiveSessionsBreakdownProps {
    total: number;
    instruction: number;
    application: number;
    collaboration: number;
    icons: {
        total: React.ReactElement;
        instruction: React.ReactElement;
        application: React.ReactElement;
        collaboration: React.ReactElement;
    };
}

const ActiveSessionsBreakdown: React.FC<ActiveSessionsBreakdownProps> = ({ total, instruction, application, collaboration, icons }) => {
    return (
        <div className="p-4 rounded-xl shadow-sm border border-slate-200 dark:border-dark-border bg-bg-panel dark:bg-dark-panel flex flex-col justify-between h-full">
            <div className="flex items-center gap-4 mb-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-amber-100 dark:bg-amber-500/20">
                    {React.cloneElement<React.SVGProps<SVGSVGElement>>(icons.total, { className: 'h-7 w-7 text-amber-500 dark:text-amber-400' })}
                </div>
                 <div className="flex-grow min-w-0">
                    <p className="text-sm font-semibold text-text-muted dark:text-dark-text-muted">Active Sessions</p>
                    <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{total}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
                <StatPill icon={icons.instruction} label="Instruction" value={instruction} color="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300" />
                <StatPill icon={icons.application} label="Application" value={application} color="bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300" />
                <StatPill icon={icons.collaboration} label="Collaboration" value={collaboration} color="bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300" />
            </div>
        </div>
    );
};
export default ActiveSessionsBreakdown;