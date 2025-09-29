import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';
import ChartContainer from './ChartContainer';

interface GradeData {
    name: string;
    value: number;
    grade: string;
}

interface GradeDistributionChartProps {
    data: GradeData[];
}

const GRADE_COLORS: { [key: string]: string } = {
    'D': '#10b981', // Emerald-500
    'M': '#3b82f6', // Blue-500
    'P': '#6b7280', // Slate-500
    'UC': '#ef4444', // Red-500
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-bg-panel dark:bg-dark-panel p-2 border border-slate-300 dark:border-dark-border rounded-lg shadow-sm">
                <p className="font-semibold text-text-primary dark:text-dark-text-primary">{`${label}`}</p>
                <p style={{ color: payload[0].fill }}>{`Total Grades: ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};


const GradeDistributionChart: React.FC<GradeDistributionChartProps> = ({ data }) => {
    return (
        <ChartContainer title="Overall NAVA Grade Distribution">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={80} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} />
                    <Bar dataKey="value" name="Total Grades" barSize={30}>
                        {data.map((entry) => (
                            <Cell key={`cell-${entry.grade}`} fill={GRADE_COLORS[entry.grade]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
};

export default GradeDistributionChart;
