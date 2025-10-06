import React, { useState, useMemo } from 'react';
import type { AnalyzedStudent, FoundationGrades } from '../types';
import useAppStore from '../hooks/useAppStore';
import { useDebounce } from '../hooks/useDebounce';
import ChartContainer from '../components/ChartContainer';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';
import AutoSizer from 'react-virtualized-auto-sizer';
// @ts-ignore
import { FixedSizeList as List } from 'react-window';

const NAVA_UNITS: (keyof FoundationGrades)[] = ['nava001', 'nava002', 'nava003', 'nava004', 'nava005', 'nava006', 'nava007', 'nava008'];

// --- HELPER COMPONENTS ---

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-bg-panel dark:bg-dark-panel p-2 border border-slate-300 dark:border-dark-border rounded-lg shadow-sm">
                <p className="font-semibold text-text-primary dark:text-dark-text-primary">{`${label}`}</p>
                <p style={{ color: payload[0].fill }}>{`${payload[0].name}: ${payload[0].value}`}</p>
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

const SortIcon: React.FC<{ direction?: 'ascending' | 'descending' }> = ({ direction }) => {
    if (!direction) return <svg className="h-4 w-4 text-slate-400 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>;
    if (direction === 'ascending') return <svg className="h-4 w-4 text-text-primary dark:text-dark-text-primary inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>;
    return <svg className="h-4 w-4 text-text-primary dark:text-dark-text-primary inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
};

// --- MAIN PAGE COMPONENT ---

const GpaAnalysisPage: React.FC<{ allStudents: AnalyzedStudent[] }> = ({ allStudents }) => {
    const { filters, globalSearchTerm } = useAppStore();
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

    const [sortConfig, setSortConfig] = useState<{ key: keyof AnalyzedStudent | 'gpa', direction: 'ascending' | 'descending' }>({ key: 'gpa', direction: 'descending' });

    const handleSort = (key: keyof AnalyzedStudent | 'gpa') => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'descending' ? 'ascending' : 'descending' }));
    };

    const sortedStudents = useMemo(() => {
        return [...filteredStudents].sort((a, b) => {
            const aVal = a[sortConfig.key] ?? (sortConfig.key === 'gpa' ? a.gpa : '');
            const bVal = b[sortConfig.key] ?? (sortConfig.key === 'gpa' ? b.gpa : '');
            if (aVal === null) return 1; if (bVal === null) return -1;
            if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
    }, [filteredStudents, sortConfig]);

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
        return <div style={style} className={`flex items-center text-sm p-2 border-b border-slate-100 dark:border-dark-panel-hover ${index % 2 === 0 ? 'bg-slate-50 dark:bg-dark-panel/50' : ''}`}><div className="w-2/5 font-semibold text-text-primary dark:text-dark-text-primary">{student.fullName} ({student.navaId})</div><div className="w-1/5 text-text-secondary dark:text-dark-text-secondary">{student.techGroup}</div><div className="w-1/5 text-text-secondary dark:text-dark-text-secondary">{student.company}</div><div className="w-1/5 font-bold text-lg text-brand-primary dark:text-brand-primary">{student.gpa?.toFixed(2) ?? 'N/A'}</div></div>;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="lg:col-span-2 flex flex-col gap-6"><ChartContainer title={`Student GPA Rankings (${sortedStudents.length})`}><div className="flex flex-col h-full"><div className="flex-shrink-0 flex p-2 bg-slate-100 dark:bg-dark-panel-hover font-semibold text-sm text-text-secondary dark:text-dark-text-secondary sticky top-0 z-10"><button className="w-2/5 text-left" onClick={() => handleSort('fullName')}>Student Name <SortIcon direction={sortConfig.key === 'fullName' ? sortConfig.direction : undefined} /></button><button className="w-1/5 text-left" onClick={() => handleSort('techGroup')}>Tech Group <SortIcon direction={sortConfig.key === 'techGroup' ? sortConfig.direction : undefined} /></button><button className="w-1/5 text-left" onClick={() => handleSort('company')}>Company <SortIcon direction={sortConfig.key === 'company' ? sortConfig.direction : undefined} /></button><button className="w-1/5 text-left" onClick={() => handleSort('gpa')}>GPA <SortIcon direction={sortConfig.key === 'gpa' ? sortConfig.direction : undefined} /></button></div><div className="flex-grow"><AutoSizer>{({ height, width }) => <List height={height} width={width} itemCount={sortedStudents.length} itemSize={50}>{Row}</List>}</AutoSizer></div></div></ChartContainer></div>
            <div className="lg:col-span-1 space-y-6"><div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4"><KpiCard title="Average GPA" value={gpaStats.avg.toFixed(2)} /><KpiCard title="Highest GPA" value={gpaStats.max.toFixed(2)} /><KpiCard title="Lowest GPA" value={gpaStats.min.toFixed(2)} /></div><ChartContainer title="GPA Distribution"><ResponsiveContainer width="100%" height="100%"><BarChart data={gpaDistributionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="range" /><YAxis allowDecimals={false} /><Tooltip content={<CustomTooltip />} /><Bar dataKey="count" name="Students">{gpaDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={['#ef4444', '#f59e0b', '#62B766', '#10b981'][index]} />)}</Bar></BarChart></ResponsiveContainer></ChartContainer></div>
        </div>
    );
};

export default GpaAnalysisPage;
