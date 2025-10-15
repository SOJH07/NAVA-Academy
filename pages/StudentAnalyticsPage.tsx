import React, { useState, useMemo, useEffect } from 'react';
import type { AnalyzedStudent, FoundationGrades } from '../types';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import useAppStore from '../hooks/useAppStore';
import { useDebounce } from '../hooks/useDebounce';
import ChartContainer from '../components/ChartContainer';
import SelectionSummary from '../components/SelectionSummary';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, CartesianGrid } from 'recharts';
import GradeDistributionChart from '../components/GradeDistributionChart';
import AutoSizer from 'react-virtualized-auto-sizer';
// @ts-ignore
import { FixedSizeList as List } from 'react-window';
import StudentSummaryCard from '../components/StudentSummaryCard';
import StudentDetailModal from '../components/StudentDetailModal';


const NAVA_UNITS: (keyof FoundationGrades)[] = ['nava001', 'nava002', 'nava003', 'nava004', 'nava005', 'nava006', 'nava007', 'nava008'];
const COLORS = ['#707F98', '#62B766', '#f59e0b', '#E77373', '#1D4CB6'];
const GRADE_COLORS: { [key: string]: string } = {
    'D': '#10b981', // Emerald-500
    'M': '#3b82f6', // Blue-500
    'P': '#6b7280', // Slate-500
    'UC': '#ef4444', // Red-500
};

// --- HELPER & TAB-SPECIFIC COMPONENTS ---

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const reversedPayload = [...payload].reverse();
        return (
            <div className="bg-panel p-2 border border-slate-300 rounded-lg shadow-sm">
                <p className="font-semibold text-text-primary">{`${label}`}</p>
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
      <div className="bg-panel p-2 border border-slate-300 rounded-lg shadow-sm text-sm">
        <p className="font-bold text-text-primary">{data.name}</p>
        <p className="text-text-secondary">APTIS: {data.aptis}</p>
        <p className="text-text-secondary">NAVA Avg: {data.nava.toFixed(1)}</p>
      </div>
    );
  }
  return null;
};

const KpiCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-slate-100 p-4 rounded-lg text-center shadow-sm border border-slate-200">
        <p className="text-3xl font-extrabold text-brand-primary">{value}</p>
        <p className="text-sm font-semibold text-text-muted">{title}</p>
    </div>
);

const StudentList: React.FC<{ title: string; students: AnalyzedStudent[]; }> = ({ title, students }) => (
    <details className="bg-slate-50 p-3 rounded-lg">
        <summary className="font-semibold cursor-pointer text-text-primary">{title} ({students.length})</summary>
        <ul className="mt-2 pl-4 max-h-48 overflow-y-auto text-sm space-y-1">
            {students.map(s => <li key={s.navaId} className="text-text-secondary">{s.fullName} ({s.navaId})</li>)}
        </ul>
    </details>
);

const SortIcon: React.FC<{ direction?: 'ascending' | 'descending' }> = ({ direction }) => {
    if (!direction) return <svg className="h-4 w-4 text-slate-400 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>;
    if (direction === 'ascending') return <svg className="h-4 w-4 text-text-primary inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>;
    return <svg className="h-4 w-4 text-text-primary inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
};

// --- TAB COMPONENTS ---

const OverviewTab: React.FC<{ students: AnalyzedStudent[] }> = ({ students }) => {
    const { overallMetrics, companyMetrics, segmentMetrics, correlationData, technicalGradeDistribution, overallGradeDistribution, unitMetrics } = useAnalyticsData(students);
    const { setFilters, toggleArrayFilter } = useAppStore();
    const [activeDeepDiveTab, setActiveDeepDiveTab] = useState('companies');

    const handleSegmentClick = (data: any) => {
        const segmentName = data.name;
        setFilters(f => ({ ...f, performanceSegments: f.performanceSegments.includes(segmentName) ? [] : [segmentName] }));
    };
    
    const cefrDistribution = useMemo(() => {
        const counts = students.reduce((acc, s) => {
            if(s.aptisScores) {
                const cefr = s.aptisScores.overall.cefr;
                if (cefr) acc[cefr] = (acc[cefr] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a,b) => a.name.localeCompare(b.name));
    }, [students]);

    return (
        <div className="space-y-6 animate-fade-in">
             <div className="bg-panel border border-slate-200 rounded-lg shadow-sm p-6">
                 <h2 className="text-xl font-bold text-text-primary mb-4">Performance Snapshot</h2>
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
            <div className="bg-panel border border-slate-200 rounded-lg shadow-sm">
                <div className="p-4 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-text-primary">Deep Dive Analysis</h2>
                    <div className="mt-2 flex items-center gap-2 flex-wrap"><button onClick={() => setActiveDeepDiveTab('companies')} className={`px-4 py-2 text-sm font-semibold rounded-md ${activeDeepDiveTab === 'companies' ? 'bg-brand-secondary text-white' : 'bg-slate-100'}`}>Companies</button><button onClick={() => setActiveDeepDiveTab('segments')} className={`px-4 py-2 text-sm font-semibold rounded-md ${activeDeepDiveTab === 'segments' ? 'bg-brand-secondary text-white' : 'bg-slate-100'}`}>Segments</button><button onClick={() => setActiveDeepDiveTab('correlation')} className={`px-4 py-2 text-sm font-semibold rounded-md ${activeDeepDiveTab === 'correlation' ? 'bg-brand-secondary text-white' : 'bg-slate-100'}`}>Correlation</button></div>
                </div>
                <div className="p-6">
                    {activeDeepDiveTab === 'companies' && <ChartContainer title="Average Scores by Sponsoring Company"><BarChart data={[{name: 'Ceer', ...companyMetrics.Ceer}, {name: 'Lucid', ...companyMetrics.Lucid}]}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis domain={[0, 100]} /><Tooltip content={<CustomTooltip />} /><Legend /><Bar dataKey="nava" name="Avg. NAVA" fill={COLORS[0]} /><Bar dataKey="aptis" name="Avg. APTIS" fill={COLORS[1]} /></BarChart></ChartContainer>}
                    {activeDeepDiveTab === 'segments' && <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><ChartContainer title="Student Performance Segments"><PieChart><Pie data={segmentMetrics.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" label onClick={handleSegmentClick} className="cursor-pointer">{segmentMetrics.pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ChartContainer><div className="space-y-3"><h3 className="text-lg font-bold">Student Lists by Segment</h3><StudentList title="High Achievers" students={students.filter(s => s.performanceSegment === 'High Achievers')} /><StudentList title="Technically Strong" students={students.filter(s => s.performanceSegment === 'Technically Strong')} /><StudentList title="Linguistically Strong" students={students.filter(s => s.performanceSegment === 'Linguistically Strong')} /><StudentList title="Needs Support" students={students.filter(s => s.performanceSegment === 'Needs Support')} /><StudentList title="Standard" students={students.filter(s => s.performanceSegment === 'Standard')} /></div></div>}
                    {activeDeepDiveTab === 'correlation' && <ChartContainer title="Correlation: APTIS Score vs. NAVA Average Score"><ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" dataKey="aptis" name="APTIS Score" label={{ value: 'APTIS Score', position: 'insideBottom', offset: -10 }} /><YAxis type="number" dataKey="nava" name="NAVA Avg Score" unit="%" label={{ value: 'NAVA Avg. Score', angle: -90, position: 'insideLeft' }} /><ZAxis type="category" dataKey="name" /><Tooltip content={<CustomScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} /><Scatter name="Students" data={correlationData} fill="#707F98" /></ScatterChart></ChartContainer>}
                </div>
            </div>
        </div>
    );
};

const GpaRankingsTab: React.FC<{ students: AnalyzedStudent[] }> = ({ students }) => {
    const [sortConfig, setSortConfig] = useState<{ key: keyof AnalyzedStudent | 'gpa', direction: 'ascending' | 'descending' }>({ key: 'gpa', direction: 'descending' });

    const handleSort = (key: keyof AnalyzedStudent | 'gpa') => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'descending' ? 'ascending' : 'descending' }));
    };

    const sortedStudents = useMemo(() => {
        return [...students].sort((a, b) => {
            const aVal = a[sortConfig.key] ?? (sortConfig.key === 'gpa' ? a.gpa : '');
            const bVal = b[sortConfig.key] ?? (sortConfig.key === 'gpa' ? b.gpa : '');
            if (aVal === null) return 1; if (bVal === null) return -1;
            if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
    }, [students, sortConfig]);

    const { gpaStats, gpaDistributionData } = useMemo(() => {
        const studentsWithGpa = sortedStudents.filter(s => s.gpa !== null);
        if (studentsWithGpa.length === 0) return { gpaStats: { avg: 0, max: 0, min: 0 }, gpaDistributionData: [] };
        const gpas = studentsWithGpa.map(s => s.gpa as number);
        const stats = { avg: gpas.reduce((a, b) => a + b, 0) / gpas.length, max: Math.max(...gpas), min: Math.min(...gpas) };
        const distribution = [{ range: '0.0-0.99', count: 0 }, { range: '1.0-1.99', count: 0 }, { range: '2.0-2.99', count: 0 }, { range: '3.0-4.0', count: 0 }];
        gpas.forEach(gpa => { if (gpa < 1) distribution[0].count++; else if (gpa < 2) distribution[1].count++; else if (gpa < 3) distribution[2].count++; else distribution[3].count++; });
        return { gpaStats: stats, gpaDistributionData: distribution };
    }, [sortedStudents]);

    const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => {
        const student = sortedStudents[index];
        return <div style={style} className={`flex items-center text-sm p-2 border-b border-slate-100 ${index % 2 === 0 ? 'bg-slate-50' : ''}`}><div className="w-2/5 font-semibold text-text-primary">{student.fullName} ({student.navaId})</div><div className="w-1/5 text-text-secondary">{student.techGroup}</div><div className="w-1/5 text-text-secondary">{student.company}</div><div className="w-1/5 font-bold text-lg text-brand-primary">{student.gpa?.toFixed(2) ?? 'N/A'}</div></div>;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="lg:col-span-2 flex flex-col gap-6"><ChartContainer title={`Student GPA Rankings (${sortedStudents.length})`}><div className="flex flex-col h-full"><div className="flex-shrink-0 flex p-2 bg-slate-100 font-semibold text-sm text-text-secondary sticky top-0 z-10"><button className="w-2/5 text-left" onClick={() => handleSort('fullName')}>Student Name <SortIcon direction={sortConfig.key === 'fullName' ? sortConfig.direction : undefined} /></button><button className="w-1/5 text-left" onClick={() => handleSort('techGroup')}>Tech Group <SortIcon direction={sortConfig.key === 'techGroup' ? sortConfig.direction : undefined} /></button><button className="w-1/5 text-left" onClick={() => handleSort('company')}>Company <SortIcon direction={sortConfig.key === 'company' ? sortConfig.direction : undefined} /></button><button className="w-1/5 text-left" onClick={() => handleSort('gpa')}>GPA <SortIcon direction={sortConfig.key === 'gpa' ? sortConfig.direction : undefined} /></button></div><div className="flex-grow"><AutoSizer>{({ height, width }) => <List height={height} width={width} itemCount={sortedStudents.length} itemSize={50}>{Row}</List>}</AutoSizer></div></div></ChartContainer></div>
            <div className="lg:col-span-1 space-y-6"><div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4"><KpiCard title="Average GPA" value={gpaStats.avg.toFixed(2)} /><KpiCard title="Highest GPA" value={gpaStats.max.toFixed(2)} /><KpiCard title="Lowest GPA" value={gpaStats.min.toFixed(2)} /></div><ChartContainer title="GPA Distribution"><ResponsiveContainer width="100%" height="100%"><BarChart data={gpaDistributionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="range" /><YAxis allowDecimals={false} /><Tooltip content={<CustomTooltip />} /><Bar dataKey="count" name="Students">{gpaDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={['#ef4444', '#f59e0b', '#62B766', '#10b981'][index]} />)}</Bar></BarChart></ResponsiveContainer></ChartContainer></div>
        </div>
    );
};

const StudentFinderTab: React.FC<{ students: AnalyzedStudent[], totalStudents: number, onStudentClick: (s: AnalyzedStudent) => void }> = ({ students, totalStudents, onStudentClick }) => {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => { const handleResize = () => setWidth(window.innerWidth); window.addEventListener('resize', handleResize); return () => window.removeEventListener('resize', handleResize); }, []);
    const columnCount = useMemo(() => { if (width < 768) return 1; if (width < 1280) return 2; if (width < 1536) return 3; return 4; }, [width]);
    const studentRows = useMemo(() => { const rows = []; for (let i = 0; i < students.length; i += columnCount) { rows.push(students.slice(i, i + columnCount)); } return rows; }, [students, columnCount]);
    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const row = studentRows[index]; if (!row) return null;
        const adjustedStyle = { ...style, top: `${(style.top as number) + 12}px`, height: `${(style.height as number) - 24}px` };
        return <div style={adjustedStyle} className="flex items-stretch justify-start gap-6 px-3">{row.map(student => <div key={student.navaId} className="w-full h-full"><StudentSummaryCard student={student} onClick={() => onStudentClick(student)} /></div>)}{Array.from({ length: columnCount - row.length }).map((_, i) => <div key={`ph-${i}`} className="w-full h-full" />)}</div>;
    };
    return <div className="flex flex-col h-full animate-fade-in"><div className="flex-shrink-0 mb-4"><p className="text-text-muted">{`Showing ${students.length} of ${totalStudents} students.`}</p></div><div className="flex-grow min-h-0">{students.length > 0 ? <AutoSizer>{({ height, width }) => <List height={height} width={width} itemCount={studentRows.length} itemSize={160 + 24} itemKey={(index: number) => studentRows[index]?.map(s => s.navaId).join('-') || index}>{Row}</List>}</AutoSizer> : <div className="flex-grow text-center py-20 text-text-muted bg-panel border border-slate-200 rounded-lg shadow-sm flex items-center justify-center"><div><h3 className="text-xl font-bold">No Students Found</h3><p className="text-base mt-1">No students match the current search or filter criteria.</p></div></div>}</div></div>;
};


// --- MAIN PAGE COMPONENT ---

interface StudentAnalyticsPageProps {
    allStudents: AnalyzedStudent[];
}

const StudentAnalyticsPage: React.FC<StudentAnalyticsPageProps> = ({ allStudents }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedStudent, setSelectedStudent] = useState<AnalyzedStudent | null>(null);

    const { filters, globalSearchTerm, activeFilterCount } = useAppStore();
    const debouncedSearchTerm = useDebounce(globalSearchTerm, 300);
    const isFiltered = activeFilterCount > 0 || globalSearchTerm.trim() !== '';

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

    const TabButton: React.FC<{tabId: string; label: string}> = ({ tabId, label }) => (
        <button onClick={() => setActiveTab(tabId)} className={`px-4 py-3 font-semibold text-sm transition-colors ${activeTab === tabId ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-text-muted hover:text-text-primary'}`}>{label}</button>
    );

    return (
        <div className="space-y-6">
            <StudentDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
            
            {isFiltered && <SelectionSummary students={filteredStudents} totalStudents={allStudents.length} />}
            
            <div className="bg-panel border border-slate-200 rounded-lg shadow-sm">
                 <div className="border-b border-slate-200 flex items-center">
                    <TabButton tabId="overview" label="Analytics Overview" />
                    <TabButton tabId="rankings" label="GPA Rankings" />
                    <TabButton tabId="finder" label="Student Finder" />
                </div>
                <div className="p-6">
                    {activeTab === 'overview' && <OverviewTab students={filteredStudents} />}
                    {activeTab === 'rankings' && <GpaRankingsTab students={filteredStudents} />}
                    {activeTab === 'finder' && <StudentFinderTab students={filteredStudents} totalStudents={allStudents.length} onStudentClick={setSelectedStudent} />}
                </div>
            </div>
        </div>
    );
};

export default StudentAnalyticsPage;