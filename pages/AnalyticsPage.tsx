import React, { useState, useMemo } from 'react';
import type { EnhancedStudent, AnalyzedStudent, StudentGrades } from '../types';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import useAppStore from '../hooks/useAppStore';
import { useDebounce } from '../hooks/useDebounce';
import ChartContainer from '../components/ChartContainer';
import SelectionSummary from '../components/SelectionSummary';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, CartesianGrid } from 'recharts';
import GradeDistributionChart from '../components/GradeDistributionChart';

const COLORS = ['#707F98', '#62B766', '#f59e0b', '#E77373', '#3b82f6'];
const NAVA_UNITS: (keyof StudentGrades)[] = ['nava001', 'nava002', 'nava003', 'nava004', 'nava005', 'nava006', 'nava007', 'nava008'];

const KpiCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-slate-100 dark:bg-dark-panel p-4 rounded-lg text-center shadow-sm border border-slate-200 dark:border-dark-border">
        <p className="text-3xl font-extrabold text-brand-secondary dark:text-brand-primary">{value}</p>
        <p className="text-sm font-semibold text-text-muted dark:text-dark-text-muted">{title}</p>
    </div>
);

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

const StudentList: React.FC<{ title: string; students: AnalyzedStudent[]; }> = ({ title, students }) => {
    return (
         <details className="bg-slate-50 dark:bg-dark-panel/50 p-3 rounded-lg">
            <summary className="font-semibold cursor-pointer text-text-primary dark:text-dark-text-secondary">{title} ({students.length})</summary>
            <ul className="mt-2 pl-4 max-h-48 overflow-y-auto text-sm space-y-1">
                {students.map(s => <li key={s.navaId} className="text-text-secondary dark:text-dark-text-muted">{s.fullName} ({s.navaId})</li>)}
            </ul>
        </details>
    )
}

interface AnalyticsPageProps {
    allStudents: AnalyzedStudent[];
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ allStudents }) => {
    const { filters, globalSearchTerm, setFilters, toggleArrayFilter } = useAppStore();
    const debouncedSearchTerm = useDebounce(globalSearchTerm, 300);
    
    const allAnalyzedStudents = allStudents;

    const filteredAnalyzedStudents = useMemo(() => {
        let studentsToFilter = allAnalyzedStudents;
        
        if (filters.performanceSegments.length > 0) {
            studentsToFilter = studentsToFilter.filter(s => filters.performanceSegments.includes(s.performanceSegment));
        }

        if (filters.companies.length > 0) studentsToFilter = studentsToFilter.filter(s => filters.companies.includes(s.company));
        if (filters.techTracks.length > 0) studentsToFilter = studentsToFilter.filter(s => filters.techTracks.includes(s.trackName));
        // FIX: Added a check to ensure `s.aptisScores.overall.cefr` is not undefined before calling `includes`.
        if (filters.aptisCEFRLevels.length > 0) studentsToFilter = studentsToFilter.filter(s => s.aptisScores?.overall.cefr && filters.aptisCEFRLevels.includes(s.aptisScores.overall.cefr));
        if (filters.techGroups.length > 0) studentsToFilter = studentsToFilter.filter(s => filters.techGroups.includes(s.techGroup));
        
        if (filters.technicalGrades.length > 0) {
            studentsToFilter = studentsToFilter.filter(s => {
                if (!s.grades) return false;
                return NAVA_UNITS.some(unit => {
                    const grade = s.grades?.[unit];
                    return grade ? filters.technicalGrades.includes(grade) : false;
                });
            });
        }
        if (filters.gpaRange[0] > 0 || filters.gpaRange[1] < 4) {
            studentsToFilter = studentsToFilter.filter(s => {
                if (s.gpa === null) return false;
                return s.gpa >= filters.gpaRange[0] && s.gpa <= filters.gpaRange[1];
            });
        }

        if (debouncedSearchTerm) {
            const lowercasedFilter = debouncedSearchTerm.toLowerCase();
            studentsToFilter = studentsToFilter.filter(student =>
              student.fullName.toLowerCase().includes(lowercasedFilter) ||
              // FIX: Used `toString()` to ensure the search is performed on a string representation of the navaId.
              student.navaId.toString().includes(lowercasedFilter) ||
              student.techGroup.toLowerCase().includes(lowercasedFilter)
            );
        }

        return studentsToFilter;
    }, [allAnalyzedStudents, debouncedSearchTerm, filters]);
    
    const { overallMetrics, companyMetrics, groupMetrics, unitMetrics, segmentMetrics, correlationData, technicalGradeDistribution, overallGradeDistribution } = useAnalyticsData(filteredAnalyzedStudents);
    const [activeTab, setActiveTab] = useState('companies');

    const handleSegmentClick = (data: any) => {
        const segmentName = data.name;
        if (filters.performanceSegments.length === 1 && filters.performanceSegments[0] === segmentName) {
            toggleArrayFilter('performanceSegments', segmentName);
        } else {
            setFilters(f => ({...f, performanceSegments: [segmentName]}));
        }
    };
    
    const cefrDistribution = useMemo(() => {
        const counts = filteredAnalyzedStudents.reduce((acc, s) => {
            if(s.aptisScores) {
                const cefr = s.aptisScores.overall.cefr;
                if (cefr) {
                    acc[cefr] = (acc[cefr] || 0) + 1;
                }
            }
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a,b) => a.name.localeCompare(b.name));
    }, [filteredAnalyzedStudents]);
    
    const hardestUnit = unitMetrics.length > 0 ? unitMetrics[0] : null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold text-text-primary dark:text-dark-text-primary">Student Performance Analysis</h1>
                <p className="text-base text-text-muted dark:text-dark-text-muted">An overview of academic and language proficiency metrics.</p>
            </div>
            
            <SelectionSummary students={filteredAnalyzedStudents} totalStudents={allStudents.length} />

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
                            <BarChart data={technicalGradeDistribution} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="UC" stackId="a" name="Unclassified (UC/F)" fill="#ef4444" />
                                <Bar dataKey="P" stackId="a" name="Pass (P)" fill="#6b7280" />
                                <Bar dataKey="M" stackId="a" name="Merit (M)" fill="#3b82f6" />
                                <Bar dataKey="D" stackId="a" name="Distinction (D)" fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                     <ChartContainer title="CEFR Level Distribution">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={cefrDistribution}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" name="Students" barSize={40}>
                                    {cefrDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                     </ChartContainer>
                 </div>
            </div>

            <GradeDistributionChart data={overallGradeDistribution} />
            
            <div className="bg-bg-panel dark:bg-dark-panel border border-slate-200 dark:border-dark-border rounded-lg shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-dark-border">
                    <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">Deep Dive Analysis</h2>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <button onClick={() => setActiveTab('companies')} className={`px-4 py-2 text-sm font-semibold rounded-md ${activeTab === 'companies' ? 'bg-brand-secondary text-white' : 'bg-slate-100 dark:bg-dark-panel-hover'}`}>Sponsoring Companies</button>
                        <button onClick={() => setActiveTab('groups')} className={`px-4 py-2 text-sm font-semibold rounded-md ${activeTab === 'groups' ? 'bg-brand-secondary text-white' : 'bg-slate-100 dark:bg-dark-panel-hover'}`}>Tech Groups</button>
                        <button onClick={() => setActiveTab('units')} className={`px-4 py-2 text-sm font-semibold rounded-md ${activeTab === 'units' ? 'bg-brand-secondary text-white' : 'bg-slate-100 dark:bg-dark-panel-hover'}`}>Academic Units</button>
                        <button onClick={() => setActiveTab('segments')} className={`px-4 py-2 text-sm font-semibold rounded-md ${activeTab === 'segments' ? 'bg-brand-secondary text-white' : 'bg-slate-100 dark:bg-dark-panel-hover'}`}>Student Segments</button>
                        <button onClick={() => setActiveTab('correlation')} className={`px-4 py-2 text-sm font-semibold rounded-md ${activeTab === 'correlation' ? 'bg-brand-secondary text-white' : 'bg-slate-100 dark:bg-dark-panel-hover'}`}>Correlation</button>
                    </div>
                </div>
                <div className="p-6">
                    {activeTab === 'companies' && (
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ChartContainer title="Avg. NAVA Score by Company">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[{name: 'Ceer', score: companyMetrics.Ceer.nava}, {name: 'Lucid', score: companyMetrics.Lucid.nava}]}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip cursor={{fill: 'hsl(var(--muted))', opacity: 0.3}} />
                                        <Bar dataKey="score" name="Avg. NAVA Score">
                                            <Cell fill={COLORS[0]} />
                                            <Cell fill={COLORS[1]} />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                             <ChartContainer title="Avg. APTIS Score by Company">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[{name: 'Ceer', score: companyMetrics.Ceer.aptis}, {name: 'Lucid', score: companyMetrics.Lucid.aptis}]}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip cursor={{fill: 'hsl(var(--muted))', opacity: 0.3}} />
                                        <Bar dataKey="score" name="Avg. APTIS Score">
                                            <Cell fill={COLORS[0]} />
                                            <Cell fill={COLORS[1]} />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </div>
                    )}
                    {activeTab === 'groups' && (
                        <ChartContainer title="Average Scores by Tech Group">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={groupMetrics} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend verticalAlign="top" />
                                    <Bar dataKey="nava" name="Avg. NAVA" fill={COLORS[0]} />
                                    <Bar dataKey="aptis" name="Avg. APTIS" fill={COLORS[1]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    )}
                    {activeTab === 'units' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <ChartContainer title="NAVA Unit Performance (Hardest to Easiest)">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={unitMetrics} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" domain={[0, 100]} />
                                            <YAxis type="category" dataKey="name" width={80} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="average" name="Avg. Score" fill={COLORS[1]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold">Most Challenging Unit</h3>
                                {hardestUnit ? (
                                    <div className="bg-red-50 dark:bg-status-tech/20 text-red-700 dark:text-status-tech p-4 rounded-lg border border-red-200 dark:border-status-tech/30">
                                        <p className="text-xl font-black">{hardestUnit.name}</p>
                                        <p>Average Score: <span className="font-bold">{hardestUnit.average.toFixed(1)}</span></p>
                                        <p>Failure (UC) Rate: <span className="font-bold">{hardestUnit.ucRate.toFixed(1)}%</span></p>
                                    </div>
                                ) : <p>N/A</p>}
                            </div>
                        </div>
                    )}
                     {activeTab === 'segments' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                             <ChartContainer title="Student Performance Segments">
                                 <ResponsiveContainer width="100%" height="100%">
                                     <PieChart>
                                         <Pie 
                                            data={segmentMetrics.pieData} 
                                            dataKey="value" 
                                            nameKey="name" 
                                            cx="50%" 
                                            cy="50%" 
                                            outerRadius="80%" 
                                            label
                                            onClick={handleSegmentClick}
                                            className="cursor-pointer"
                                         >
                                             {segmentMetrics.pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                         </Pie>
                                         <Tooltip />
                                         <Legend />
                                     </PieChart>
                                 </ResponsiveContainer>
                            </ChartContainer>
                            <div className="space-y-3">
                                 <h3 className="text-lg font-bold">Student Lists by Segment</h3>
                                 <StudentList title="High Achievers" students={filteredAnalyzedStudents.filter(s => s.performanceSegment === 'High Achievers')} />
                                 <StudentList title="Technically Strong" students={filteredAnalyzedStudents.filter(s => s.performanceSegment === 'Technically Strong')} />
                                 <StudentList title="Linguistically Strong" students={filteredAnalyzedStudents.filter(s => s.performanceSegment === 'Linguistically Strong')} />
                                 <StudentList title="Needs Support" students={filteredAnalyzedStudents.filter(s => s.performanceSegment === 'Needs Support')} />
                                 <StudentList title="Standard" students={filteredAnalyzedStudents.filter(s => s.performanceSegment === 'Standard')} />
                            </div>
                        </div>
                    )}
                    {activeTab === 'correlation' && (
                         <ChartContainer title="Correlation: APTIS Score vs. NAVA Average Score">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" dataKey="aptis" name="APTIS Score" label={{ value: 'APTIS Score', position: 'insideBottom', offset: -10 }} />
                                <YAxis type="number" dataKey="nava" name="NAVA Avg Score" unit="%" label={{ value: 'NAVA Avg. Score', angle: -90, position: 'insideLeft' }} />
                                <ZAxis type="category" dataKey="name" />
                                <Tooltip content={<CustomScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                                <Scatter name="Students" data={correlationData} fill="#707F98" />
                            </ScatterChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
