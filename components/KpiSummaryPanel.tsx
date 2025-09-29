import React, { useMemo } from 'react';
import type { EnhancedStudent, AptisScores } from '../types';

interface KpiSummaryPanelProps {
    students: EnhancedStudent[];
}

// Icons
const CheckCircleIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const UsersIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>;
const StarIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>;


const StatCard: React.FC<{ title: string; value: string; icon: React.ReactElement; }> = ({ title, value, icon }) => (
    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex items-center gap-4">
        <div className="flex-shrink-0 text-brand-secondary bg-teal-100 dark:bg-teal-900/50 p-3 rounded-lg">
            {icon}
        </div>
        <div>
            <p className="text-sm font-semibold text-text-muted dark:text-slate-400">{title}</p>
            <p className="text-3xl font-extrabold text-brand-secondary dark:text-teal-300">{value}</p>
        </div>
    </div>
);


const KpiSummaryPanel: React.FC<KpiSummaryPanelProps> = ({ students }) => {
    const analysis = useMemo(() => {
        const studentsWithScores = students.filter((s): s is EnhancedStudent & { aptisScores: AptisScores } => !!s.aptisScores);
        const count = studentsWithScores.length;

        if (count === 0) {
            return {
                count: 0,
                avgOverall: 0,
                proficientCount: 0,
                proficientPercent: 0,
            };
        }

        const scoreSums = studentsWithScores.reduce((acc, s) => {
            acc.overall += s.aptisScores.overall.score;
            return acc;
        }, { overall: 0 });

        const proficientCount = studentsWithScores.filter(s =>
            s.aptisScores.overall.cefr.startsWith('B') || s.aptisScores.overall.cefr.startsWith('C')
        ).length;

        return {
            count,
            avgOverall: scoreSums.overall / count,
            proficientCount,
            proficientPercent: (proficientCount / count) * 100,
        };
    }, [students]);
    
    return (
        <div className="bg-bg-panel dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-text-primary dark:text-slate-50 mb-4">APTIS Performance Summary</h3>
            {analysis.count > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard title="Students with Scores" value={analysis.count.toString()} icon={<UsersIcon className="h-6 w-6" />} />
                    <StatCard title="Average Overall Score" value={analysis.avgOverall.toFixed(1)} icon={<StarIcon className="h-6 w-6" />} />
                    <StatCard title="Proficient (B1+)" value={`${analysis.proficientPercent.toFixed(0)}%`} icon={<CheckCircleIcon className="h-6 w-6" />} />
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-text-muted dark:text-slate-400 py-10">
                   <p>No APTIS data available for the current selection.</p>
                </div>
            )}
        </div>
    );
};

export default KpiSummaryPanel;