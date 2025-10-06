import React, { useState, useMemo } from 'react';
import type { AnalyzedStudent, FoundationGrades } from '../types';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import useAppStore from '../hooks/useAppStore';
import { useDebounce } from '../hooks/useDebounce';
import ChartContainer from '../components/ChartContainer';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, CartesianGrid } from 'recharts';
import GradeDistributionChart from '../components/GradeDistributionChart';

const NAVA_UNITS: (keyof FoundationGrades)[] = ['nava001', 'nava002', 'nava003', 'nava004', 'nava005', 'nava006', 'nava007', 'nava008'];
const COLORS = ['#707F98', '#62B766', '#f59e0b', '#E77373', '#3b82f6'];
const GRADE_COLORS: { [key: string]: string } = {
    'D': '#10b981', // Emerald-500
    'M': '#3b82f6', // Blue-500
    'P': '#6b7280', // Slate-500
    'UC': '#ef4444', // Red-500
};

// --- HELPER COMPONENTS ---

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const reversedPayload = [...payload].reverse();
        return (
            <div className="bg-bg-panel dark:bg-dark-panel p-2 border border-slate-300 dark:border-dark-border rounded-lg shadow-sm">
                <p className="font-semibold text-text-primary dark:text-dark-text-primary">{`${label}`}</p>
                {reversedPayload.map((pld: any) => (
                     <p key={pld.dataKey} style={{ color: pld.fill }}>{`${pld.name}: ${typeof pld.value === 'number' ? pld.value.toFixed(0) : pld.value}`}</p>
                ))}
            </div>
        );
    }
    return null;
};

const CustomScatterTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-bg-panel dark:bg-dark-panel p-2 border border-slate-300 dark:border-dark-border rounded-lg shadow-sm text-sm">
        <p className="font-bold text-text-primary dark:text-dark-text-primary">{data.name}</p>
        <p className="text-text-secondary dark:text-dark-text-secondary">APTIS: {data.aptis}</p>
        <p className="text-text-secondary dark:text-dark-text-secondary">NAVA Avg: {data.nava.toFixed(1)}</p>
      </div>
    );
  }
  return null;
};

const KpiCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-slate-100 dark:bg-dark-panel p-4 rounded-lg text-center shadow-sm border border-slate-200 dark:border-dark-border">
        <p className="text-3xl font-extrabold text-brand-secondary dark:text-brand-primary">{value}</p>
        <p className="text-sm font-semibold text-text-muted dark:text-dark-text-muted">{title}</p>
    </div>
);

const StudentList: React.FC<{ title: string; students: AnalyzedStudent[]; }> = ({ title, students }) => (
    <details className="bg-slate-50 dark:bg-dark-panel/50 p-3 rounded-lg">
        <summary className="font-semibold cursor-pointer text-text-primary dark:text-dark-text-secondary">{title} ({students.length})</summary>
        <ul className="mt-2 pl-4 max-h-48 overflow-y-auto text-sm space-y-1">
            {students.map(s => <li key={s.navaId} className="text-text-secondary dark:text-dark-text-muted">{s.fullName} ({s.navaId})</li>)}
        </ul>
    </details>
);

// --- MAIN PAGE COMPONENT ---

const AnalyticsPage: React.FC<{ allStudents: AnalyzedStudent[] }> = ({ allStudents }) => {
    const { filters, globalSearchTerm, setFilters } = useAppStore();
    const debouncedSearchTerm = useDebounce(globalSearchTerm, 300);

    const filteredStudents = useMemo(() => {
        let studentsToFilter = allStudents;
        if (filters.companies.length > 0) studentsToFilter = studentsToFilter.filter(s => filters.companies.includes(s.company));
        if (filters.techTracks.length > 0) studentsToFilter = studentsToFilter.filter(s => filters.techTracks.includes(s.trackName));
        if (filters.aptisCEFRLevels.length > 0) studentsToFilter = studentsToFilter.filter(s => s.aptisScores?.overall.cefr && filters.aptisCEFRLevels.includes(s.aptisScores.overall.cefr));
        if (filters.techGroups.length > 0) studentsToFilter = studentsToFilter.filter(s => filters.techGroups.includes(s.techGroup));
        if (filters.technicalGrades.length > 0) studentsToFilter = studentsToFilter.filter(s => s.grades && NAVA_UNITS.some(unit => { const grade = s.grades?.[unit]; return typeof grade === 'string' ? filters.technicalGrades.includes(grade) : false; }));
        if (filters.performanceSegments.length > 0) studentsToFilter = studentsToFilter.filter(s => filters.performanceSegments.includes(s.performanceSegment));
        if (filters.gpaRange[0] > 0 || filters.gpaRange[1] < 4) studentsToFilter = studentsToFilter.filter(s => s.gpa !== null && s.gpa >= filters.gpaRange[0] && s.gpa <= filters.gpaRange[1]);
        if (debouncedSearchTerm) { const lowercasedFilter = debouncedSearchTerm.toLowerCase(); studentsToFilter = studentsToFilter.filter(student => student.fullName.toLowerCase().includes(lowercasedFilter) || student.navaId.toString().includes(lowercasedFilter) || student.techGroup.toLowerCase().includes(lowercasedFilter)); }
        return studentsToFilter;
    }, [allStudents, debouncedSearchTerm, filters]);
    
    const { overallMetrics, companyMetrics, segmentMetrics, correlationData, technicalGradeDistribution, overallGradeDistribution } = useAnalyticsData(filteredStudents);
    const [activeDeepDiveTab, setActiveDeepDiveTab] = useState('companies');

    const handleSegmentClick = (data: any) => {
        const segmentName = data.name;
        setFilters(f => ({ ...f, performanceSegments: f.performanceSegments.includes(segmentName) ? [] : [segmentName] }));
    };
    
    const cefrDistribution = useMemo(() => {
        const counts = filteredStudents.reduce((acc, s) => {
            if(s.aptisScores) {
                const cefr = s.aptisScores.overall.cefr;
                if (cefr) acc[cefr] = (acc[cefr] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a,b) => a.name.localeCompare(b.name));
    }, [filteredStudents]);

    return (
        <div className="space-y-6 animate-fade-in">
             <div className="bg-bg-panel dark:bg-dark-panel border border-slate-200 dark:border-dark-border rounded-lg shadow-sm p-6">
                 <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-4">Performance Snapshot</h2>
                 <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <KpiCard title="Filtered Students" value={overallMetrics.studentCount.toString()} />
                    <KpiCard title="Avg. NAVA Score" value={overallMetrics.navaAverage.toFixed(1)} />
                    <KpiCard title="Avg. APTIS Score" value={overallMetrics.aptisAverage.toFixed(1)} />
                    <KpiCard title="Avg. Distinctions" value={overallMetrics.avgDistinctionCount.toFixed(2)} />
                    <KpiCard title="Total 'UC' Grades" value={overallMetrics.totalUcCount.toString()} />
                 </div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     <ChartContainer title="NAVA Technical Grade Distribution by Unit">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={technicalGradeDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" fontSize={10} angle={-30} textAnchor="end" height={50} />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="D" stackId="a" fill={GRADE_COLORS['D']} name="Distinction" />
                                <Bar dataKey="M" stackId="a" fill={GRADE_COLORS['M']} name="Merit" />
                                <Bar dataKey="P" stackId="a" fill={GRADE_COLORS['P']} name="Pass" />
                                <Bar dataKey="UC" stackId="a" fill={GRADE_COLORS['UC']} name="Unclassified" />
                            </BarChart>
                        </ResponsiveContainer>
                     </ChartContainer>
                     <ChartContainer title="CEFR Level Distribution"><BarChart data={cefrDistribution}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip content={<CustomTooltip />} /><Bar dataKey="value" name="Students">{cefrDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Bar></BarChart></ChartContainer>
                 </div>
            </div>
            <GradeDistributionChart data={overallGradeDistribution} />
            <div className="bg-bg-panel dark:bg-dark-panel border border-slate-200 dark:border-dark-border rounded-lg shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-dark-border">
                    <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">Deep Dive Analysis</h2>
                    <div className="mt-2 flex items-center gap-2 flex-wrap"><button onClick={() => setActiveDeepDiveTab('companies')} className={`px-4 py-2 text-sm font-semibold rounded-md ${activeDeepDiveTab === 'companies' ? 'bg-brand-secondary text-white' : 'bg-slate-100 dark:bg-dark-panel-hover'}`}>Companies</button><button onClick={() => setActiveDeepDiveTab('segments')} className={`px-4 py-2 text-sm font-semibold rounded-md ${activeDeepDiveTab === 'segments' ? 'bg-brand-secondary text-white' : 'bg-slate-100 dark:bg-dark-panel-hover'}`}>Segments</button><button onClick={() => setActiveDeepDiveTab('correlation')} className={`px-4 py-2 text-sm font-semibold rounded-md ${activeDeepDiveTab === 'correlation' ? 'bg-brand-secondary text-white' : 'bg-slate-100 dark:bg-dark-panel-hover'}`}>Correlation</button></div>
                </div>
                <div className="p-6">
                    {activeDeepDiveTab === 'companies' && <ChartContainer title="Average Scores by Sponsoring Company"><BarChart data={[{name: 'Ceer', ...companyMetrics.Ceer}, {name: 'Lucid', ...companyMetrics.Lucid}]}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis domain={[0, 100]} /><Tooltip content={<CustomTooltip />} /><Legend /><Bar dataKey="nava" name="Avg. NAVA" fill={COLORS[0]} /><Bar dataKey="aptis" name="Avg. APTIS" fill={COLORS[1]} /></BarChart></ChartContainer>}
                    {activeDeepDiveTab === 'segments' && <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><ChartContainer title="Student Performance Segments"><PieChart><Pie data={segmentMetrics.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" label onClick={handleSegmentClick} className="cursor-pointer">{segmentMetrics.pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ChartContainer><div className="space-y-3"><h3 className="text-lg font-bold">Student Lists by Segment</h3><StudentList title="High Achievers" students={filteredStudents.filter(s => s.performanceSegment === 'High Achievers')} /><StudentList title="Technically Strong" students={filteredStudents.filter(s => s.performanceSegment === 'Technically Strong')} /><StudentList title="Linguistically Strong" students={filteredStudents.filter(s => s.performanceSegment === 'Linguistically Strong')} /><StudentList title="Needs Support" students={filteredStudents.filter(s => s.performanceSegment === 'Needs Support')} /><StudentList title="Standard" students={filteredStudents.filter(s => s.performanceSegment === 'Standard')} /></div></div>}
                    {activeDeepDiveTab === 'correlation' && <ChartContainer title="Correlation: APTIS Score vs. NAVA Average Score"><ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" dataKey="aptis" name="APTIS Score" label={{ value: 'APTIS Score', position: 'insideBottom', offset: -10 }} /><YAxis type="number" dataKey="nava" name="NAVA Avg Score" unit="%" label={{ value: 'NAVA Avg. Score', angle: -90, position: 'insideLeft' }} /><ZAxis type="category" dataKey="name" /><Tooltip content={<CustomScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} /><Scatter name="Students" data={correlationData} fill="#707F98" /></ScatterChart></ChartContainer>}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
