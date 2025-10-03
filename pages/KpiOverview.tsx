import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { AnalyzedStudent, LiveStudent, StudentGrades } from '../types';
import ChartContainer from '../components/ChartContainer';
import KpiSummaryPanel from '../components/KpiSummaryPanel';
import SmartSummary from '../components/SmartSummary';
import { useLiveStatus } from '../hooks/useLiveStatus';
import useAppStore from '../hooks/useAppStore';
import { useDebounce } from '../hooks/useDebounce';
import KpiCard from '../components/KpiCard';
import LiveStatusSummary from '../components/LiveStatusSummary';
import SelectionSummary from '../components/SelectionSummary';
import ActiveSessionsBreakdown from '../components/ActiveSessionsBreakdown';

// Icons
const UsersIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.67c.12-.14.237-.282.35-.428M3.11 16.032a9.337 9.337 0 017.497-4.908 9.337 9.337 0 017.497 4.908M12 12a4.5 4.5 0 00-4.5 4.5v.088c0 1.121.285 2.16.786 3.07M12 12a4.5 4.5 0 01-4.5 4.5v.088c0 1.121.285 2.16.786 3.07" /></svg>;
const WifiIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856a9 9 0 0113.788 0M1.924 8.674a12.75 12.75 0 0119.152 0M12 20.25h.008v.008H12v-.008z" /></svg>;
const PresentationChartBarIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" /></svg>;
const BeakerIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.5 1.586l-1.02 1.134a1.125 1.125 0 00-.504 1.074v3.125a3.375 3.375 0 006.75 0v-3.125a1.125 1.125 0 00-.504-1.074l-1.02-1.134a2.25 2.25 0 01-.5-1.586V3.104a2.25 2.25 0 00-3.218 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.375a2.25 2.25 0 012.25-2.25h.008a2.25 2.25 0 012.25 2.25v.375a2.25 2.25 0 01-2.25 2.25h-.008a2.25 2.25 0 01-2.25-2.25v-.375z" /></svg>;
const UserGroupIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.086 2.72c.243.05.488.082.73.111m-1.42 2.122a9.093 9.093 0 013.741-.479m-2.5-4.277a1.125 1.125 0 011.664 0l2.454 2.454a.675.675 0 01.21.53V17.5a3 3 0 01-3 3h-3a3 3 0 01-3-3v-2.162c0-.214.071-.424.21-.58l2.454-2.454a1.125 1.125 0 011.664 0zM3 18.72a9.094 9.094 0 013.741-.479 3 3 0 014.682-2.72m-7.086 2.72c-.243.05-.488.082-.73.111m1.42 2.122a9.093 9.093 0 003.741-.479m-2.5-4.277a1.125 1.125 0 00-1.664 0L6.546 12.45a.675.675 0 00-.21.53V15.5a3 3 0 003 3h3a3 3 0 003-3v-2.162c0-.214-.071-.424-.21-.58l-2.454-2.454a1.125 1.125 0 00-1.664 0z" /></svg>;


interface KpiOverviewPageProps {
    allStudents: AnalyzedStudent[];
    students: LiveStudent[];
    liveStatusData: ReturnType<typeof useLiveStatus>;
    sessionInfo: {
        sessionCounts: {
            tech: number;
            professional: number;
            instruction: number;
            application: number;
            collaboration: number;
        };
    };
}

const COLORS = ['#707F98', '#62B766', '#f59e0b', '#E77373', '#3b82f6'];
const RADIAN = Math.PI / 180;
// FIX: Changed StudentGrades to FoundationGrades to correctly type the NAVA_UNITS constant.
const NAVA_UNITS: (keyof StudentGrades)[] = ['nava001', 'nava002', 'nava003', 'nava004', 'nava005', 'nava006', 'nava007', 'nava008'];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (!percent || percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold pointer-events-none">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-bg-panel dark:bg-dark-panel p-2 border border-slate-300 dark:border-dark-border rounded-lg shadow-sm">
                <p className="font-semibold text-text-primary dark:text-dark-text-primary">{`${payload[0].name} : ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

// Mock data for sparkline trends
const liveStudentsTrend = [
  { day: 'Mon', value: 180 },
  { day: 'Tue', value: 190 },
  { day: 'Wed', value: 185 },
  { day: 'Thu', value: 195 },
  { day: 'Fri', value: 200 },
  { day: 'Sat', value: 198 },
  { day: 'Sun', value: 210 },
];

const KpiOverviewPage: React.FC<KpiOverviewPageProps> = ({ allStudents, students, liveStatusData, sessionInfo }) => {
    const { filters, globalSearchTerm, toggleArrayFilter, setFilters, activeFilterCount } = useAppStore();
    const debouncedSearchTerm = useDebounce(globalSearchTerm, 300);

    const isFiltered = useMemo(() => activeFilterCount > 0 || globalSearchTerm.trim() !== '', [activeFilterCount, globalSearchTerm]);

    // FIX: Removed unnecessary explicit types that were causing inference issues. `s` is correctly inferred as `AnalyzedStudent` and `liveInfo` as `LiveStudent | undefined`.
    const studentsWithLiveInfo = useMemo(() => {
        const liveStudentMap = new Map(students.map(s => [s.navaId, s]));
        return allStudents.map(s => {
            const liveInfo = liveStudentMap.get(s.navaId);
            return {
                ...s,
                status: liveInfo?.status || 'Finished',
                location: liveInfo?.location || 'N/A',
                currentPeriod: liveInfo?.currentPeriod || 'N/A',
            };
        });
    }, [allStudents, students]);

    const filteredStudents = useMemo(() => {
        let studentsToFilter = studentsWithLiveInfo;
        
        if (filters.status !== 'all') {
            studentsToFilter = studentsToFilter.filter(student => {
                const isLive = student.status === 'In Class' || student.status === 'Break';
                return filters.status === 'live' ? isLive : !isLive;
            });
        }
        
        if (filters.companies.length > 0) studentsToFilter = studentsToFilter.filter(s => filters.companies.includes(s.company));
        if (filters.techTracks.length > 0) studentsToFilter = studentsToFilter.filter(s => filters.techTracks.includes(s.trackName));
        if (filters.aptisCEFRLevels.length > 0) studentsToFilter = studentsToFilter.filter(s => s.aptisScores?.overall.cefr && filters.aptisCEFRLevels.includes(s.aptisScores.overall.cefr));
        if (filters.techGroups.length > 0) studentsToFilter = studentsToFilter.filter(s => filters.techGroups.includes(s.techGroup));
        if (filters.technicalGrades.length > 0) {
            studentsToFilter = studentsToFilter.filter(s => {
                if (!s.grades) return false;
                // A student matches if at least one of their NAVA grades is in the selected filter grades
                return NAVA_UNITS.some(unit => {
                    const grade = s.grades?.[unit];
                    // FIX: Added a `typeof` check to ensure `grade` is a string before calling `includes`.
                    return typeof grade === 'string' ? filters.technicalGrades.includes(grade) : false;
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
                student.navaId.toString().includes(lowercasedFilter) ||
                student.techGroup.toLowerCase().includes(lowercasedFilter)
            );
        }

        return studentsToFilter;
    }, [studentsWithLiveInfo, debouncedSearchTerm, filters]);

    const chartsData = useMemo(() => {
        const companyDistribution = Array.from(
            filteredStudents.reduce((acc, student) => {
                acc.set(student.company, (acc.get(student.company) || 0) + 1);
                return acc;
            }, new Map<string, number>()),
            ([name, value]) => ({ name, value })
        );

        const activityDistribution = [
            { name: 'Instruction', count: sessionInfo.sessionCounts.instruction, fill: '#818cf8' }, // indigo-400
            { name: 'Application', count: sessionInfo.sessionCounts.application, fill: '#2dd4bf' }, // teal-400
            { name: 'Collaboration', count: sessionInfo.sessionCounts.collaboration, fill: '#f59e0b' }, // amber-500
        ];
        
        return { companyDistribution, activityDistribution };
    }, [filteredStudents, sessionInfo]);

    const liveStudentsCount = useMemo(() => {
        return students.filter(s => s.status === 'In Class' || s.status === 'Break').length;
    }, [students]);

    const handleCompanyClick = (data: any) => {
        const companyName = data.name;
        if (filters.companies.length === 1 && filters.companies[0] === companyName) {
            toggleArrayFilter('companies', companyName);
        } else {
            setFilters(f => ({ ...f, companies: [companyName] }));
        }
    };

    return (
        <div className="space-y-6">
            {isFiltered && <SelectionSummary students={filteredStudents} totalStudents={allStudents.length} />}
            
            <div className="pb-2">
                <h2 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">Welcome, Director</h2>
                <p className="text-base text-text-muted dark:text-dark-text-muted">Here is your live overview of academy operations.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <KpiCard title="Total Students" value={allStudents.length.toString()} icon={<UsersIcon />} color="indigo" />
                <KpiCard title="Live Students" value={liveStudentsCount.toString()} icon={<WifiIcon />} color="teal" trendData={liveStudentsTrend} />
                <LiveStatusSummary liveStatusData={liveStatusData} />
                <ActiveSessionsBreakdown
                    total={sessionInfo.sessionCounts.instruction + sessionInfo.sessionCounts.application + sessionInfo.sessionCounts.collaboration}
                    instruction={sessionInfo.sessionCounts.instruction}
                    application={sessionInfo.sessionCounts.application}
                    collaboration={sessionInfo.sessionCounts.collaboration}
                    icons={{
                        total: <PresentationChartBarIcon />,
                        instruction: <PresentationChartBarIcon />,
                        application: <BeakerIcon />,
                        collaboration: <UserGroupIcon />
                    }}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                <div className="xl:col-span-3 space-y-6">
                    <ChartContainer title="Company Distribution">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={chartsData.companyDistribution} 
                                    cx="50%" 
                                    cy="50%" 
                                    labelLine={false} 
                                    label={renderCustomizedLabel} 
                                    outerRadius="85%" 
                                    fill="#8884d8" 
                                    dataKey="value" 
                                    nameKey="name"
                                    onClick={handleCompanyClick}
                                >
                                    {chartsData.companyDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="cursor-pointer" />
                                    ))}
                                </Pie>
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{fontSize: '0.875rem'}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                    <ChartContainer title="Live Activity Distribution">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartsData.activityDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" allowDecimals={false} />
                                <YAxis type="category" dataKey="name" width={80} />
                                <RechartsTooltip cursor={{fill: 'rgba(241, 245, 249, 0.5)'}} />
                                <Bar dataKey="count" name="Active Sessions" barSize={40}>
                                    {chartsData.activityDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>

                <div className="xl:col-span-2 space-y-6">
                    <SmartSummary kpis={{ totalStudents: allStudents.length }} liveStatusData={liveStatusData} sessionInfo={sessionInfo} />
                    <KpiSummaryPanel students={filteredStudents} />
                </div>
            </div>
        </div>
    );
};

export default KpiOverviewPage;