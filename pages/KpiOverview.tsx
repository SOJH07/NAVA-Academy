import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, Cell, PieChart, Pie } from 'recharts';
import type { AnalyzedStudent, LiveStudent } from '../types';
import ChartContainer from '../components/ChartContainer';
import useAppStore from '../hooks/useAppStore';
import { useLiveStatus } from '../hooks/useLiveStatus';
import { processedScheduleData } from '../data/scheduleData';
import SelectionSummary from '../components/SelectionSummary';
import UpcomingEvents from '../components/UpcomingEvents';

// --- ICONS ---
const UsersIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>);
const PresentationChartLineIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25a2.25 2.25 0 01-2.25 2.25h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" /></svg>;
const ClipboardDocumentCheckIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CalendarDaysIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" /></svg>;
const ComputerDesktopIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" /></svg>

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
const COLORS = { ceer: '#707F98', lucid: '#E77373', gpa: '#1D4CB6', aptis: '#10b981', nava: '#f59e0b' };
const CEFR_COLORS: { [key: string]: string } = { 'A1': '#ef4444', 'A2': '#f97316', 'B1': '#f59e0b', 'B2': '#1D4CB6', 'C': '#10b981', };


// --- LOCAL COMPONENTS ---

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-panel/90 backdrop-blur-sm p-3 border border-slate-200 rounded-lg shadow-lg text-sm">
                <p className="font-bold text-text-primary mb-2">{label}</p>
                <ul className="space-y-1">
                    {payload.map((pld: any, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                            <span style={{ backgroundColor: pld.color || pld.fill }} className="w-2.5 h-2.5 rounded-full" />
                            <span className="text-text-secondary">{`${pld.name}: `}</span>
                            <span className="font-semibold text-text-primary">{pld.value}{pld.unit}</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
    return null;
};

const MetricCard: React.FC<{ title: string, value: string, icon: React.ReactElement, color: 'industrial' | 'teal' | 'amber' | 'green' }> = ({ title, value, icon, color }) => {
    const colorClasses = {
        industrial: { text: 'text-status-industrial', line: 'bg-status-industrial' },
        teal: { text: 'text-teal-600', line: 'bg-teal-500' },
        amber: { text: 'text-amber-600', line: 'bg-amber-500' },
        green: { text: 'text-green-600', line: 'bg-green-500' },
    };
    const selectedColor = colorClasses[color];

    return (
        <div className="bg-panel border border-slate-200 rounded-xl shadow-sm p-4 h-full relative">
            <div className={`absolute top-4 right-4 h-1 w-12 rounded-full ${selectedColor.line}`}></div>
            <div className="flex flex-col justify-between h-full">
                <div>
                    {React.cloneElement(icon, { className: `h-8 w-8 text-text-secondary` })}
                </div>
                <div className="mt-4">
                     <p className={`text-5xl font-extrabold ${selectedColor.text}`}>{value}</p>
                     <p className="text-base font-semibold text-text-secondary mt-1">{title}</p>
                </div>
            </div>
        </div>
    );
};

const ListItem: React.FC<{ rank: number, name: string, value: string | number, maxValue: number, onNameClick: () => void }> = ({ rank, name, value, maxValue, onNameClick }) => (
    <li className="space-y-1">
        <div className="flex justify-between items-center text-sm">
            <button onClick={onNameClick} className="font-semibold text-text-primary hover:underline truncate">
                <span className="text-text-muted mr-2">{rank}.</span>{name}
            </button>
            <span className="font-bold text-text-secondary">{value}</span>
        </div>
        <div className="bg-slate-100 rounded-full h-1.5 w-full"><div className="bg-slate-400 h-full rounded-full" style={{ width: `${(Number(value) / maxValue) * 100}%` }}></div></div>
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
                <h2 className="text-3xl font-bold text-text-primary">Today's Briefing</h2>
                <p className="text-base text-text-secondary">{format(liveStatusData.now, 'EEEE, MMMM d, yyyy')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <MetricCard title="Daily Attendance" value={kpiData.attendance} icon={<UsersIcon />} color="industrial" />
                <MetricCard title="Student Engagement" value={kpiData.engagement} icon={<PresentationChartLineIcon />} color="teal" />
                <MetricCard title="Active Sessions" value={kpiData.activeSessions.toString()} icon={<ComputerDesktopIcon />} color="amber" />
                <MetricCard title="Module Completion" value={kpiData.moduleCompletion} icon={<ClipboardDocumentCheckIcon />} color="green" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <ChartContainer title="Company Performance Comparison">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={companyComparisonData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0, 0.05)" />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0, 0.03)' }} />
                                <Legend verticalAlign="top" wrapperStyle={{fontSize: '12px', top: -5, color: '#1F2937'}} iconSize={10} />
                                <Bar dataKey="Ceer" fill={COLORS.ceer} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Lucid" fill={COLORS.lucid} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                    <ChartContainer title="Weekly Improvement Trends">
                        <ResponsiveContainer width="100%" height={300}>
                             <LineChart data={weeklyImprovementData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0, 0.05)" />
                                <XAxis dataKey="week" tickFormatter={(tick) => `W${tick}`} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
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
                    <ChartContainer title="Upcoming Events" headerContent={<CalendarDaysIcon className="h-5 w-5 text-text-muted" />}>
                        <UpcomingEvents />
                    </ChartContainer>
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
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0, 0.05)" />
                        <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
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