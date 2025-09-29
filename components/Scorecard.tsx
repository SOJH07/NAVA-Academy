import React from 'react';

interface ScorecardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    colorClass?: string;
}

const Scorecard: React.FC<ScorecardProps> = ({ title, value, icon, colorClass = 'text-brand-primary' }) => {
    return (
        <div className="bg-bg-panel border border-slate-200 rounded-lg shadow-sm p-4 flex items-center gap-4">
            <div className="flex-shrink-0 text-brand-primary bg-brand-primary-light p-3 rounded-lg">
                {icon}
            </div>
            <div>
                <p className="text-sm font-semibold text-text-muted">{title}</p>
                <p className={`text-2xl font-extrabold ${colorClass}`}>{value}</p>
            </div>
        </div>
    );
};

export default Scorecard;
