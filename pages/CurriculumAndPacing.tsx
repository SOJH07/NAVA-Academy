import React, { useMemo, useRef, useEffect, useState } from 'react';
import { curriculumData } from '../data/curriculum';
import { pacingScheduleData } from '../data/pacingSchedule';
import { foundationSubjects, year2IndustrialSubjects, year2ServiceSubjects, Subject } from '../data/subjects';
import type { PacingEvent } from '../types';
import useAppStore, { INITIAL_FILTERS } from '../hooks/useAppStore';
import { useDebounce } from '../hooks/useDebounce';
// FIX: 'parse' is not a top-level export in the project's date-fns setup. Importing from submodule.
import { format, addDays, startOfISOWeek, differenceInDays, getISOWeek } from 'date-fns';
import parse from 'date-fns/parse';

// --- ICONS ---
const AssessmentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2.166 4.616a2.25 2.25 0 012.25 0l5.166 2.583a2.25 2.25 0 010 4.162l-5.166 2.583a2.25 2.25 0 01-2.25 0V4.616zm10.5 0a2.25 2.25 0 012.25 0l2.834 1.417a2.25 2.25 0 010 4.162l-2.834 1.417a2.25 2.25 0 01-2.25 0V4.616z" clipRule="evenodd" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>;
const CheckmarkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;


const unitColors: Record<string, string> = {};
const colorPalette = [ 'bg-red-200 border-red-400 text-red-800', 'bg-orange-200 border-orange-400 text-orange-800', 'bg-amber-200 border-amber-400 text-amber-800', 'bg-yellow-200 border-yellow-400 text-yellow-800', 'bg-lime-200 border-lime-400 text-lime-800', 'bg-green-200 border-green-400 text-green-800', 'bg-emerald-200 border-emerald-400 text-emerald-800', 'bg-teal-200 border-teal-400 text-teal-800', 'bg-cyan-200 border-cyan-400 text-cyan-800', 'bg-sky-200 border-sky-400 text-sky-800', 'bg-blue-200 border-blue-400 text-blue-800', 'bg-indigo-200 border-indigo-400 text-indigo-800', 'bg-violet-200 border-violet-400 text-violet-800', 'bg-purple-200 border-purple-400 text-purple-800', 'bg-fuchsia-200 border-fuchsia-400 text-fuchsia-800', 'bg-pink-200 border-pink-400 text-pink-800', 'bg-rose-200 border-rose-400 text-rose-800' ];

const getUnitColor = (unitCode: string) => {
    if (!unitColors[unitCode]) {
        let hash = 0;
        for (let i = 0; i < unitCode.length; i++) { hash = unitCode.charCodeAt(i) + ((hash << 5) - hash); }
        unitColors[unitCode] = colorPalette[Math.abs(hash) % colorPalette.length];
    }
    return unitColors[unitCode];
};

const Tooltip: React.FC<{ content: React.ReactNode; position: { x: number, y: number } | null }> = ({ content, position }) => {
    if (!position) return null;
    return (
        <div className="fixed z-50 bg-gray-800 text-white p-2 text-sm rounded-lg shadow-xl transition-opacity duration-200 pointer-events-none" style={{ top: position.y + 15, left: position.x + 15 }}>
            {content}
        </div>
    );
};

const Legend: React.FC = () => (
    <div className="flex-shrink-0 flex items-center justify-center gap-6 p-3 border-t border-slate-200 dark:border-dark-border text-xs text-text-muted dark:text-dark-text-muted">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-blue-200 border border-blue-400"></div><span>Theory Unit</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-blue-200 border border-blue-400 bg-repeat bg-center" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-2 10L10 -2M-2 2L2 -2M6 10L10 6' stroke='%23000' stroke-width='1' stroke-opacity='0.1'/%3E%3C/svg%3E")`}}></div><span>Practical Unit</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-slate-200 border border-slate-400 flex items-center justify-center text-slate-600"><AssessmentIcon /></div><span>Assessment</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-gray-200 border-gray-400 bg-[repeating-linear-gradient(-45deg,_#e5e7eb,_#e5e7eb_4px,_transparent_4px,_transparent_8px)]"></div><span>Review Week</span></div>
        <div className="flex items-center gap-2"><div className="h-4 w-0.5 bg-red-500 relative"><div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-red-500 rounded-full"></div></div><span>Current Week</span></div>
    </div>
);

const CurriculumSection: React.FC<{ title: string; subjects: Subject[]; onHover: (code: string | null) => void; hoveredCode: string | null; trackName?: string; trackFilter: string; }> = ({ title, subjects, onHover, hoveredCode, trackName, trackFilter }) => {
    const isDimmed = trackFilter !== 'all' && trackName !== trackFilter;
    return (
        <div className={`p-4 transition-opacity ${isDimmed ? 'opacity-40' : ''}`}>
            <h4 className="font-bold text-text-primary dark:text-dark-text-primary mb-2">{title}</h4>
            <div className="space-y-1">
                {subjects.map(subject => (
                    <div
                        key={subject.code}
                        onMouseEnter={() => onHover(subject.code)}
                        onMouseLeave={() => onHover(null)}
                        className={`p-2 rounded-md text-sm cursor-pointer ${hoveredCode === subject.code ? 'bg-indigo-100 dark:bg-indigo-500/20' : 'hover:bg-slate-100 dark:hover:bg-dark-panel-hover'}`}
                    >
                        <p className="font-semibold text-text-secondary dark:text-dark-text-secondary">{subject.code}</p>
                        <p className="text-xs text-text-muted dark:text-dark-text-muted">{subject.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const parseLegacyDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    const year = parseInt(parts[2], 10);
    const fullYear = year < 50 ? 2000 + year : 1900 + year;
    return parse(`${parts[0]}-${parts[1]}-${fullYear}`, 'd-MMM-yyyy', new Date());
};

interface CurriculumAndPacingPageProps {
  weekNumber: number;
}

const CurriculumAndPacingPage: React.FC<CurriculumAndPacingPageProps> = ({ weekNumber }) => {
    const { setActivePage, setFilters } = useAppStore();
    const [trackFilter, setTrackFilter] = useState<'all' | 'Industrial Tech' | 'Service Tech'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const todayMarkerRef = useRef<HTMLDivElement>(null);
    
    const [hoveredUnitCode, setHoveredUnitCode] = useState<string | null>(null);
    const [tooltipState, setTooltipState] = useState<{ content: React.ReactNode, position: {x: number, y: number} } | null>(null);
    
    const WEEK_CELL_WIDTH = 72;
    const TIMELINE_START_DATE = useMemo(() => startOfISOWeek(parseLegacyDate('6-Oct-24')), []);
    const TIMELINE_END_DATE = new Date('2026-10-01');

    const totalDays = useMemo(() => differenceInDays(TIMELINE_END_DATE, TIMELINE_START_DATE), [TIMELINE_START_DATE, TIMELINE_END_DATE]);
    const totalWeeks = useMemo(() => Math.ceil(totalDays / 7), [totalDays]);

    const markerDate = useMemo(() => startOfISOWeek(new Date('2025-10-06')), []); // ISO Week 41, 2025
    const currentDayOffset = useMemo(() => differenceInDays(markerDate, TIMELINE_START_DATE), [markerDate, TIMELINE_START_DATE]);

    const processedPacingData = useMemo(() => {
        return pacingScheduleData.map(event => {
            const eventStartDate = parseLegacyDate(event.startDate);
            const eventEndDate = parseLegacyDate(event.endDate);
            const startDayOffset = differenceInDays(eventStartDate, TIMELINE_START_DATE);
            const durationInDays = differenceInDays(eventEndDate, eventStartDate) + 1;

            const progressDays = currentDayOffset - startDayOffset;
            const progress = durationInDays > 0 ? Math.max(0, Math.min(1, progressDays / durationInDays)) : 0;
            return { ...event, eventStartDate, eventEndDate, startDayOffset, durationInDays, progress };
        });
    }, [TIMELINE_START_DATE, currentDayOffset]);

    const { industrialGroups, serviceGroups } = useMemo(() => {
        let industrial = curriculumData.filter(c => c.track_name === 'Industrial Tech').map(c => c.group_name).sort();
        let service = curriculumData.filter(c => c.track_name === 'Service Tech').map(c => c.group_name).sort();
        
        const lowerSearch = debouncedSearchTerm.toLowerCase();
        if(lowerSearch) {
            industrial = industrial.filter(g => g.toLowerCase().includes(lowerSearch));
            service = service.filter(g => g.toLowerCase().includes(lowerSearch));
        }
        
        if(trackFilter !== 'all') {
            if (trackFilter === 'Industrial Tech') service = [];
            else industrial = [];
        }

        return { industrialGroups: industrial, serviceGroups: service };
    }, [trackFilter, debouncedSearchTerm]);

    const handleGoToToday = () => {
        if (todayMarkerRef.current && scrollContainerRef.current) {
            const containerWidth = scrollContainerRef.current.offsetWidth;
            const scrollPos = todayMarkerRef.current.offsetLeft - (containerWidth / 4);
            scrollContainerRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
        }
    };
    
    const handleGroupClick = (group: string) => {
        setFilters(f => ({ ...INITIAL_FILTERS, techGroups: [group] }));
        setActivePage('studentFinder');
    };

    const showTooltip = (content: React.ReactNode, e: React.MouseEvent) => setTooltipState({ content, position: { x: e.clientX, y: e.clientY } });
    const hideTooltip = () => setTooltipState(null);

    useEffect(handleGoToToday, [trackFilter]);

    const renderGroupRows = (groups: string[]) => {
        return groups.map((group, groupIndex) => (
            <div key={group} className={`flex h-14 items-center border-b border-slate-200 dark:border-dark-border ${groupIndex % 2 === 0 ? 'bg-white dark:bg-dark-panel' : 'bg-slate-50/50 dark:bg-dark-panel/50'}`}>
                <button onClick={() => handleGroupClick(group)} className="sticky left-0 w-[150px] flex-shrink-0 px-3 py-2 font-bold text-sm text-text-primary dark:text-dark-text-primary bg-inherit border-r border-slate-200 dark:border-dark-border h-full text-left hover:bg-slate-100 dark:hover:bg-dark-panel-hover" title={`Filter for group ${group}`}>
                    {group}
                </button>
                <div className="relative h-full" style={{ width: totalWeeks * WEEK_CELL_WIDTH}}>
                    {processedPacingData.filter(p => p.group === group).map(event => {
                        const isHighlighted = hoveredUnitCode === event.unitCode;
                        const isDimmed = hoveredUnitCode !== null && !isHighlighted;

                        let colorClasses = '';
                        let content: React.ReactNode = <span className="truncate">{event.unitCode}: {event.unitName}</span>;
                        const isPractical = event.deliveryType === 'practical';
                        
                        switch(event.type) {
                            case 'assessment':
                                colorClasses = 'bg-slate-200 border-slate-400 text-slate-600';
                                content = <div className="flex items-center gap-1.5 w-full"><AssessmentIcon /> <span className="truncate">{event.unitName}</span></div>;
                                break;
                            case 'review':
                                colorClasses = 'bg-gray-200 border-gray-400 text-gray-800 bg-[repeating-linear-gradient(-45deg,_#e5e7eb,_#e5e7eb_4px,_transparent_4px,_transparent_8px)]';
                                content = <span className="truncate">{event.unitName}</span>;
                                break;
                            default:
                                colorClasses = getUnitColor(event.unitCode);
                        }

                        const left = (event.startDayOffset / 7) * WEEK_CELL_WIDTH;
                        const width = (event.durationInDays / 7) * WEEK_CELL_WIDTH;
                        if (left + width < 0 || left > totalWeeks * WEEK_CELL_WIDTH) return null;

                        const tooltipContent = (
                            <div>
                                <p className="font-bold">{event.unitCode}: {event.unitName}</p>
                                <p className="text-xs">{format(event.eventStartDate, 'MMM d, yyyy')} - {format(event.eventEndDate, 'MMM d, yyyy')}</p>
                                <p className="text-xs text-slate-300">({event.durationInDays} days)</p>
                                {event.type === 'unit' && typeof event.progress === 'number' && (
                                    <p className="text-xs">Progress: {Math.round(event.progress * 100)}%</p>
                                )}
                            </div>
                        );

                        return (
                            <div 
                                key={`${event.group}-${event.unitCode}-${event.startWeek}`} 
                                className={`absolute top-2 bottom-2 rounded-md border overflow-hidden cursor-pointer transition-all duration-200 ${colorClasses} ${isHighlighted ? 'ring-2 ring-indigo-500 ring-offset-1 z-10 scale-105' : ''} ${isDimmed ? 'opacity-30' : ''}`}
                                style={{ left, width: width - 4 }} 
                                onMouseEnter={(e) => showTooltip(tooltipContent, e)} 
                                onMouseLeave={hideTooltip}
                            >
                                {isPractical && <div className="absolute inset-0 bg-repeat bg-center" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-2 10L10 -2M-2 2L2 -2M6 10L10 6' stroke='%23000' stroke-width='1' stroke-opacity='0.1'/%3E%3C/svg%3E")`}}></div>}
                                <div className="relative h-full w-full flex items-center justify-between px-2 text-xs font-semibold">
                                    <div className="flex-grow truncate">{content}</div>
                                    {event.type === 'unit' && typeof event.progress === 'number' && event.progress > 0 && (
                                        <div className="flex-shrink-0 ml-2">
                                            {event.progress >= 1 ? (
                                                <span className="bg-black/20 rounded-full p-0.5 text-white">
                                                    <CheckmarkIcon />
                                                </span>
                                            ) : (
                                                <span className="font-bold text-black/60 text-sm">
                                                    {Math.floor(event.progress * 100)}%
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        ));
    };

    return (
        <div className="bg-bg-panel dark:bg-dark-panel border border-slate-200 dark:border-dark-border rounded-lg shadow-sm h-full flex flex-col overflow-hidden">
            <Tooltip content={tooltipState?.content} position={tooltipState?.position} />
            <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-slate-200 dark:border-dark-border flex-wrap gap-4">
                 <div>
                    <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">Curriculum & Pacing</h2>
                    <p className="text-sm text-text-muted dark:text-dark-text-muted">Integrated view of subjects and group schedules.</p>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><SearchIcon/></span><input type="search" placeholder="Filter groups..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-white dark:bg-dark-body border border-slate-300 dark:border-dark-border rounded-lg py-2 pl-10 pr-3 w-48"/></div>
                     <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-dark-panel-hover rounded-lg">
                        <button onClick={() => setTrackFilter('all')} className={`px-3 py-1 text-sm font-semibold rounded ${trackFilter === 'all' ? 'bg-white dark:bg-dark-panel shadow-sm' : ''}`}>All Tracks</button>
                        <button onClick={() => setTrackFilter('Industrial Tech')} className={`px-3 py-1 text-sm font-semibold rounded ${trackFilter === 'Industrial Tech' ? 'bg-white dark:bg-dark-panel shadow-sm' : ''}`}>Industrial</button>
                        <button onClick={() => setTrackFilter('Service Tech')} className={`px-3 py-1 text-sm font-semibold rounded ${trackFilter === 'Service Tech' ? 'bg-white dark:bg-dark-panel shadow-sm' : ''}`}>Service</button>
                    </div>
                    <button onClick={handleGoToToday} className="px-3 py-1.5 text-sm font-semibold text-brand-primary bg-brand-primary-light rounded-md hover:bg-indigo-200 transition">Go to Current Week</button>
                </div>
            </header>
            <div className="flex-grow flex min-h-0">
                <aside className="w-[300px] flex-shrink-0 border-r border-slate-200 dark:border-dark-border overflow-y-auto">
                    <CurriculumSection title="Year 1: Foundation" subjects={foundationSubjects} onHover={setHoveredUnitCode} hoveredCode={hoveredUnitCode} trackFilter={trackFilter}/>
                    <CurriculumSection title="Year 2: Industrial Tech" subjects={year2IndustrialSubjects} onHover={setHoveredUnitCode} hoveredCode={hoveredUnitCode} trackName="Industrial Tech" trackFilter={trackFilter}/>
                    <CurriculumSection title="Year 2: Service Tech" subjects={year2ServiceSubjects} onHover={setHoveredUnitCode} hoveredCode={hoveredUnitCode} trackName="Service Tech" trackFilter={trackFilter}/>
                </aside>
                <main ref={scrollContainerRef} className="flex-grow overflow-auto">
                    <div className="relative" style={{ width: 150 + totalWeeks * WEEK_CELL_WIDTH }}>
                        <div className="sticky top-0 z-20 flex bg-slate-50 dark:bg-dark-panel-hover border-b border-slate-200 dark:border-dark-border">
                            <div className="sticky left-0 w-[150px] flex-shrink-0 p-2 font-semibold text-sm bg-slate-100 dark:bg-dark-panel text-text-secondary dark:text-dark-text-secondary border-r border-slate-200 dark:border-dark-border flex items-center justify-center">Group</div>
                            {Array.from({ length: totalWeeks }).map((_, i) => {
                                const weekStartDate = addDays(TIMELINE_START_DATE, i * 7);
                                const isoWeekForDisplay = getISOWeek(weekStartDate);
                                const formattedDate = format(weekStartDate, 'MMM d');
                                return (
                                    <div key={i} className="w-[72px] flex-shrink-0 text-center text-xs font-semibold text-text-muted dark:text-dark-text-muted py-1 border-r border-slate-200 dark:border-dark-border flex flex-col justify-center">
                                        <span className="font-bold text-sm">W{isoWeekForDisplay}</span>
                                        <span className="text-[10px]">{formattedDate}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div ref={todayMarkerRef} className="absolute top-0 bottom-0 z-10 w-0.5 bg-red-500" style={{ left: 150 + (currentDayOffset / 7) * WEEK_CELL_WIDTH }}><div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-red-500 rounded-full"></div></div>
                        {industrialGroups.length > 0 && ( <> <div className="sticky left-0 w-full z-10 pl-[150px]"><div className="bg-status-industrial-light text-status-industrial font-bold text-sm p-2">Industrial Technician Track</div></div> {renderGroupRows(industrialGroups)} </> )}
                        {serviceGroups.length > 0 && ( <> <div className="sticky left-0 w-full z-10 pl-[150px]"><div className="bg-status-tech-light text-status-tech font-bold text-sm p-2">Service Technician Track</div></div> {renderGroupRows(serviceGroups)} </> )}
                    </div>
                </main>
            </div>
            <Legend />
        </div>
    );
};

export default CurriculumAndPacingPage;