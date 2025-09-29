import React from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

interface KpiCardProps {
    title: string;
    value: string | number;
    icon: React.ReactElement;
    color: 'indigo' | 'teal' | 'amber';
    trendData?: { day: string; value: number }[];
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, color, trendData }) => {
    const colorClasses = {
        indigo: {
            text: 'text-indigo-600 dark:text-indigo-400',
            iconBg: 'bg-indigo-100 dark:bg-indigo-500/20',
            iconText: 'text-indigo-500 dark:text-indigo-400',
            stroke: 'text-indigo-400'
        },
        teal: {
            text: 'text-teal-600 dark:text-teal-400',
            iconBg: 'bg-teal-100 dark:bg-teal-500/20',
            iconText: 'text-teal-500 dark:text-teal-400',
            stroke: 'text-teal-400'
        },
        amber: {
            text: 'text-amber-600 dark:text-amber-400',
            iconBg: 'bg-amber-100 dark:bg-amber-500/20',
            iconText: 'text-amber-500 dark:text-amber-400',
            stroke: 'text-amber-400'
        }
    };
    
    const selectedColor = colorClasses[color];

    return (
        <div className="p-4 rounded-xl shadow-sm border border-slate-200 dark:border-dark-border bg-bg-panel dark:bg-dark-panel flex items-center gap-4 h-full">
            <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${selectedColor.iconBg}`}>
                {React.cloneElement<React.SVGProps<SVGSVGElement>>(icon, { className: `h-6 w-6 ${selectedColor.iconText}` })}
            </div>
            <div className="flex-grow">
                <p className="text-sm font-semibold text-text-muted dark:text-dark-text-muted">{title}</p>
                <p className={`text-3xl font-extrabold ${selectedColor.text}`}>{value}</p>
            </div>
            {trendData && (
                <div className="w-24 h-12 flex-shrink-0 -my-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                            <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke="currentColor"
                                className={selectedColor.stroke}
                                strokeWidth={2.5} 
                                dot={false} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default KpiCard;