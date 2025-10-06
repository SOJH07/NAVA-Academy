import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, Cell, PieChart, Pie } from 'recharts';
import type { AnalyzedStudent, LiveStudent } from '../types';
import ChartContainer from '../components/ChartContainer';
import useAppStore from '../hooks/useAppStore';
import { useLiveStatus } from '../hooks/useLiveStatus';
import { processedScheduleData } from '../data/scheduleData';
import SelectionSummary from '../components/SelectionSummary';

// --- ICONS ---
const UserCheckIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.092 1.21-.138 2.43-.138 3.662" /></svg>;
const RocketLaunchIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56v4.82a6 6 0 01-1.332 3.935m-4.508-2.56a6 6 0 01-5.84-7.38v-4.82m5.84 2.56v-4.82a6 6 0 011.332-3.935m-4.508 2.56a6 6 0 015.84 7.38m-1.332-3.935a6 6 0 01-1.332-3.935" /></svg>;
const PresentationChartLineIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25a2.25 2.25 0 01-2.25 2.25h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" /></svg>;
const ClipboardDocumentCheckIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

// --- PROPS & MOCK DATA ---
interface KpiOverviewPageProps {
    allStudents: AnalyzedStudent[];
    students: LiveStudent[];
    liveStatusData: ReturnType<typeof useLiveStatus>;
    sessionInfo: { sessionCounts: { instruction: number; application: number; collaboration: number; }; };
}

const weeklyAttendanceData = [ { name: 'W1', value: 95 }, { name: 'W2', value: 96 }, { name: 'W3', value: 94 }, { name: 'W4', value: 97 }, { name: 'W5', value: 98 } ];
const studentEngagementData = [ { name: 'W1', value: 82 }, { name: 'W2', value: 85 }, { name: 'W3', value: 83 }, { name: 'W4', value: 88 }, { name: 'W5', value: 90 } ];
const moduleCompletionData = [ { name: 'NAVA001', completion: 98 }, { name: 'NAVA002', completion: 95 }, { name: 'NAVA003', completion: 92 }, { name: 'NAVA004', completion: 88 }, { name: 'NAVA005', completion: 85 }, { name: 'NAVA006', completion: 78 } ];
const weeklyImprovementData = [ { week: 43, gpa: 2.8, aptis: 110 }, { week: 44, gpa: 2.85, aptis: 112 }, { week: 45, gpa: 2.9, aptis: 115 }, { week: 46, gpa: 3.0, aptis: 118 }, { week: 47, gpa: 3.05, aptis: 121 } ];
const COLORS = { ceer: '#707F98', lucid: '#E77373', gpa: '#3b82f6', aptis: '#10b981', nava: '#f59e0b' };
const CEFR_COLORS: { [key: string]: string } = { 'A1': '#ef4444', 'A2': '#f97316', 'B1': '#f59e0b', 'B2': '#3b82f6', 'C': '#10b981', };


// --- LOCAL COMPONENTS ---

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-bg-panel/80 dark:bg-dark-panel/80 backdrop-blur-sm p-3 border border-slate-300 dark:border-dark-border rounded-lg shadow-lg text-sm">
                <p className="font-bold text-text-primary dark:text-dark-text-primary mb-2">{label}</p>
                <ul className="space-y-1">
                    {payload.map((pld: any, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                            <span style={{ backgroundColor: pld.color || pld.fill }} className="w-2.5 h-2.5 rounded-full" />
                            <span className="text-text-secondary dark:text-dark-text-secondary">{`${pld.name}: `}</span>
                            <span className="font-semibold text-text-primary dark:text-dark-text-primary">{pld.value}{pld.unit}</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
    return null;
};

const MetricCard: React.FC<{ title: string, value: string, icon: React.ReactElement, trendData?: {name: string, value: number}[], color: 'indigo' | 'green' | 'amber' | 'sky' }> = ({ title, value, icon, trendData, color }) => {
    const colorClasses = {
        indigo: { text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30', stroke: 'text-indigo-500' },
        green: { text: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', stroke: 'text-green-500' },
        amber: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', stroke: 'text-amber-500' },
        sky: { text: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-100 dark:bg-sky-900/30', stroke: 'text-sky-500' },
    };
    const selectedColor = colorClasses[color];

    return (
        <div className="bg-bg-panel dark:bg-dark-panel border border-slate-200 dark:border-dark-border rounded-xl shadow-sm p-4 h-full flex flex-col justify-between">
            <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedColor.bg}`}>{icon}</div>
                {trendData && <div className="w-20 h-8 -mr-2"><ResponsiveContainer width="100%" height="100%"><LineChart data={trendData}><Line type="monotone" dataKey="value" stroke="currentColor" strokeWidth={2.5} dot={false} className={selectedColor.stroke} /></LineChart></ResponsiveContainer></div>}
            </div>
            <div>
                <p className={`text-4xl font-extrabold ${selectedColor.text}`}>{value}</p>
                <p className="text-sm font-semibold text-text-muted dark:text-dark-text-muted">{title}</p>
            </div>
        </div>
    );
};

const ListItem: React.FC<{ rank: number, name: string, value: string | number, maxValue: number, onNameClick: () => void }> = ({ rank, name, value, maxValue, onNameClick }) => (
    <li className="space-y-1">
        <div className="flex justify-between items-center text-sm">
            <button onClick={onNameClick} className="font-semibold text-text-primary dark:text-dark-text-primary hover:underline truncate">
                <span className="text-text-muted dark:text-dark-text-muted mr-2">{rank}.</span>{name}
            </button>
            <span className="font-bold text-text-secondary dark:text-dark-text-secondary">{value}</span>
        </div>
        <div className="bg-slate-200 dark:bg-dark-panel-hover rounded-full h-1.5 w-full"><div className="bg-brand-secondary h-full rounded-full" style={{ width: `${(Number(value) / maxValue) * 100}%` }}></div></div>
    </li>
);

// --- MAIN PAGE COMPONENT ---
const KpiOverviewPage: React.FC<KpiOverviewPageProps> = ({ allStudents, liveStatusData, sessionInfo }) => {
    const { activeFilterCount } = useAppStore();
    const isFiltered = activeFilterCount > 0;

    const liveStudentsCount = useMemo(() => liveStatusData.liveStudents.filter(s => s.status === 'In Class' || s.status === 'Break').length, [liveStatusData.liveStudents]);

    const kpiData = useMemo(() => ({
        attendance: allStudents.length > 0 ? ((liveStudentsCount / allStudents.length) * 100).toFixed(0) + '%' : '0%',
        engagement: '88', // Mock data
        activeSessions: liveStatusData.liveClasses.length,
        moduleCompletion: '92%', // Mock data
    }), [allStudents.length, liveStudentsCount, liveStatusData.liveClasses.length]);

    const companyComparisonData = useMemo(() => {
        const ceerStudents = allStudents.filter(s => s.company === 'Ceer');
        const lucidStudents = allStudents.filter(s => s.company === 'Lucid');
        const calcAvgs = (students: AnalyzedStudent[]) => {
            if (students.length === 0) return { gpa: 0, aptis: 0, nava: 0 };
            const gpa = students.reduce((acc, s) => acc + (s.gpa ?? 0), 0) / students.filter(s => s.gpa !== null).length || 0;
            const aptis = students.reduce((acc, s) => acc + (s.aptisScores?.overall.score ?? 0), 0) / students.filter(s => s.aptisScores).length || 0;
            const nava = students.reduce((acc, s) => acc + (s.navaAverageScore ?? 0), 0) / students.filter(s => s.navaAverageScore !== null).length || 0;
            return { gpa, aptis, nava };
        };
        const ceerAvgs = calcAvgs(ceerStudents);
        const lucidAvgs = calcAvgs(lucidStudents);
        return [
            { name: 'Avg GPA', Ceer: ceerAvgs.gpa.toFixed(2), Lucid: lucidAvgs.gpa.toFixed(2) },
            { name: 'Avg APTIS', Ceer: ceerAvgs.aptis.toFixed(1), Lucid: lucidAvgs.aptis.toFixed(1) },
            { name: 'Avg NAVA', Ceer: ceerAvgs.nava.toFixed(1), Lucid: lucidAvgs.nava.toFixed(1) }
        ];
    }, [allStudents]);

    const instructorActivityData = useMemo(() => {
        const activity: Record<string, number> = {};
        processedScheduleData.forEach(assignment => {
            assignment.instructors.forEach(instructor => {
                activity[instructor] = (activity[instructor] || 0) + 1;
            });
        });
        return Object.entries(activity).map(([name, periods]) => ({ name, periods })).sort((a, b) => b.periods - a.periods);
    }, []);

    const groupsToWatchData = useMemo(() => {
        const groupGpas: Record<string, { totalGpa: number, count: number }> = {};
        allStudents.forEach(student => {
            if (student.gpa !== null) {
                if (!groupGpas[student.techGroup]) groupGpas[student.techGroup] = { totalGpa: 0, count: 0 };
                groupGpas[student.techGroup].totalGpa += student.gpa;
                groupGpas[student.techGroup].count++;
            }
        });
        return Object.entries(groupGpas)
            .map(([name, data]) => ({ name, avgGpa: data.count > 0 ? data.totalGpa / data.count : 0 }))
            .filter(g => g.avgGpa > 0)
            .sort((a, b) => a.avgGpa - b.avgGpa)
            .slice(0, 5);
    }, [allStudents]);

    const { setFilters, setActivePage, setGlobalSearchTerm } = useAppStore();
    const handleGroupClick = (group: string) => { setFilters(f => ({...f, techGroups: [group]})); setActivePage('studentAnalytics'); };
    const handleInstructorClick = (instructor: string) => { setGlobalSearchTerm(instructor); setActivePage('teamAndAcademy'); };
    
    const cefrDistribution = useMemo(() => {
        const counts = allStudents.reduce((acc, s) => {
            if (s.aptisScores?.overall.cefr) {
                const cefr = s.aptisScores.overall.cefr;
                acc[cefr] = (acc[cefr] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
        
        const cefrOrder = ['A1', 'A2', 'B1', 'B2', 'C'];
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a,b) => cefrOrder.indexOf(a.name) - cefrOrder.indexOf(b.name));
    }, [allStudents]);

    return (
        <div className="space-y-6 animate-fade-in">
            {isFiltered && <SelectionSummary students={allStudents} totalStudents={allStudents.length} />}
            
            <div className="pb-2">
                <h2 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">Welcome, Director</h2>
                <p className="text-base text-text-muted dark:text-dark-text-muted">Here is your live overview of academy operations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <MetricCard title="Daily Attendance" value={kpiData.attendance} icon={<UserCheckIcon className="h-6 w-6"/>} trendData={weeklyAttendanceData} color="sky" />
                <MetricCard title="Student Engagement" value={kpiData.engagement} icon={<RocketLaunchIcon className="h-6 w-6"/>} trendData={studentEngagementData} color="indigo" />
                <MetricCard title="Active Sessions" value={kpiData.activeSessions.toString()} icon={<PresentationChartLineIcon className="h-6 w-6"/>} color="amber" />
                <MetricCard title="Module Completion" value={kpiData.moduleCompletion} icon={<ClipboardDocumentCheckIcon className="h-6 w-6"/>} trendData={moduleCompletionData.map(m => ({name: m.name, value: m.completion}))} color="green" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <ChartContainer title="Company Performance Comparison">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={companyComparisonData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220 13% 91% / 1)" />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'hsl(224 23% 55% / 1)' }} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'hsl(224 23% 55% / 1)' }} />
                                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
                                <Legend verticalAlign="top" wrapperStyle={{fontSize: '12px', top: -5}} iconSize={10} />
                                <Bar dataKey="Ceer" fill={COLORS.ceer} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Lucid" fill={COLORS.lucid} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                    <ChartContainer title="Weekly Improvement Trends">
                        <ResponsiveContainer width="100%" height={300}>
                             <LineChart data={weeklyImprovementData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91% / 1)" />
                                <XAxis dataKey="week" tickFormatter={(tick) => `W${tick}`} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'hsl(224 23% 55% / 1)' }} />
                                <YAxis yAxisId="left" orientation="left" stroke={COLORS.gpa} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                                <YAxis yAxisId="right" orientation="right" stroke={COLORS.aptis} tickLine={false} axisLine={false} tick={{ fontSize: 12 }}/>
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="top" wrapperStyle={{fontSize: '12px', top: -5}} iconSize={10} />
                                <Line yAxisId="left" type="monotone" dataKey="gpa" name="Avg GPA" stroke={COLORS.gpa} strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line yAxisId="right" type="monotone" dataKey="aptis" name="Avg APTIS" stroke={COLORS.aptis} strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <ChartContainer title="Instructor Activity (Weekly)">
                        <ul className="space-y-4">
                            {instructorActivityData.slice(0, 7).map((inst, idx) => (
                                <ListItem key={inst.name} rank={idx + 1} name={inst.name} value={`${inst.periods} pds`} maxValue={instructorActivityData[0].periods} onNameClick={() => handleInstructorClick(inst.name)} />
                            ))}
                        </ul>
                    </ChartContainer>
                    <ChartContainer title="Groups to Watch (by GPA)">
                        <ul className="space-y-4">
                            {groupsToWatchData.map((group, idx) => (
                                <ListItem key={group.name} rank={idx + 1} name={group.name} value={group.avgGpa.toFixed(2)} maxValue={4} onNameClick={() => handleGroupClick(group.name)} />
                            ))}
                        </ul>
                    </ChartContainer>
                    <ChartContainer title="APTIS CEFR Levels">
                         <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={cefrDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2}>
                                    {cefrDistribution.map((entry) => <Cell key={`cell-${entry.name}`} fill={CEFR_COLORS[entry.name] || '#6b7280'} />)}
                                </Pie>
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Legend layout="vertical" verticalAlign="middle" align="right" iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            </div>
             <ChartContainer title="Module Completion Rate">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={moduleCompletionData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(220 13% 91% / 1)" />
                        <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: 'hsl(224 23% 55% / 1)' }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12, fill: 'hsl(224 23% 55% / 1)' }} axisLine={false} tickLine={false} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Bar dataKey="completion" name="Completion Rate" barSize={20}>
                            {moduleCompletionData.map((entry) => (
                                <Cell key={entry.name} fill={entry.completion > 90 ? COLORS.aptis : entry.completion > 70 ? COLORS.nava : COLORS.lucid} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    );
};

export default KpiOverviewPage;