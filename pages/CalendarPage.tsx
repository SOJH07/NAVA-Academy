import React, { useState, useMemo } from 'react';
import YearlyCalendarView from '../components/YearlyCalendarView';
import NavaCalendar from '../components/NavaCalendar';
import { calendarEventsData } from '../data/calendarEvents';
import { instructorEventsData } from '../data/instructorEvents';
import { facilityEventsData } from '../data/facilityEvents';
import type { CalendarEvent } from '../types';

const ToggleButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
            isActive
                ? 'bg-brand-secondary text-white shadow'
                : 'bg-white text-text-muted hover:bg-slate-100'
        }`}
    >
        {label}
    </button>
);

const LEGEND_ITEMS = [
    { type: 'CH', label: 'Cohort', color: 'bg-blue-500' },
    { type: 'NAVA', label: 'NAVA Holiday', color: 'bg-yellow-400' },
    { type: 'National', label: 'National Holiday', color: 'bg-purple-500' },
    { type: 'Ramadan', label: 'Ramadan', color: 'border-green-400 border-2 bg-white' },
    { type: 'Eid', label: 'Eid', color: 'bg-sky-400' },
    { type: 'Annual', label: 'Annual Vacation', color: 'bg-orange-500' },
    { type: 'Instructor', label: 'Instructor', color: 'bg-teal-500' },
    { type: 'Facility', label: 'Facility', color: 'bg-slate-500' },
];

const Legend: React.FC<{ activeFilters: Set<string>, onToggle: (type: string) => void }> = ({ activeFilters, onToggle }) => {
    return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-sm font-semibold text-text-muted">Filter by type:</span>
            {LEGEND_ITEMS.map(item => (
                <button 
                    key={item.type}
                    onClick={() => onToggle(item.type)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 border
                        ${activeFilters.has(item.type) || activeFilters.size === 0 ? 'bg-white border-slate-300 text-text-secondary' : 'bg-slate-100 border-slate-200 text-slate-400 opacity-70'}
                        hover:border-slate-400 hover:opacity-100
                    `}
                >
                    <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                    {item.label}
                </button>
            ))}
        </div>
    );
};


const CalendarPage: React.FC = () => {
    const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });
    const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

    const allEvents = useMemo(() => [...calendarEventsData, ...instructorEventsData, ...facilityEventsData], []);

    const handleToggleFilter = (eventType: string) => {
        setActiveFilters(prev => {
            const newSet = new Set(prev);
            if (newSet.has(eventType)) {
                newSet.delete(eventType);
            } else {
                newSet.add(eventType);
            }
            return newSet;
        });
    };

    const filteredEvents = useMemo(() => {
        let tempEvents = allEvents;

        // Type filter
        if (activeFilters.size > 0) {
            tempEvents = tempEvents.filter(e => activeFilters.has(e.type));
        }

        // Search term filter
        if (searchTerm.trim() !== '') {
            const lowercasedSearch = searchTerm.toLowerCase();
            tempEvents = tempEvents.filter(e => e.event.toLowerCase().includes(lowercasedSearch));
        }

        // Date range filter
        const { start, end } = dateRange;
        if (start || end) {
            const startDate = start ? new Date(start) : null;
            const endDate = end ? new Date(end) : null;
            
            if(startDate) startDate.setUTCHours(0,0,0,0);
            if(endDate) endDate.setUTCHours(0,0,0,0);

            tempEvents = tempEvents.filter(e => {
                const eventStart = new Date(e.start);
                eventStart.setUTCHours(0,0,0,0);
                const eventEnd = new Date(e.end);
                eventEnd.setUTCHours(0,0,0,0);

                const afterFilterStart = startDate ? eventEnd >= startDate : true;
                const beforeFilterEnd = endDate ? eventStart <= endDate : true;
                
                return afterFilterStart && beforeFilterEnd;
            });
        }

        return tempEvents;
    }, [allEvents, activeFilters, searchTerm, dateRange]);

    const handleDateChange = (part: 'start' | 'end', value: string | null) => {
        setDateRange(prev => {
            const newRange = { ...prev, [part]: value };
            if (part === 'start' && value && prev.end && new Date(prev.end) < new Date(value)) {
                newRange.end = value;
            }
            if (part === 'start' && !value) {
                newRange.end = null;
            }
            return newRange;
        });
    };

    return (
        <div className="bg-bg-panel border border-slate-200 rounded-lg shadow-sm h-full overflow-hidden flex flex-col">
            <header className="flex-shrink-0 flex flex-col p-4 gap-4 border-b border-slate-200">
                <div className="flex flex-wrap justify-between items-center gap-4">
                     <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                        <ToggleButton label="Monthly" isActive={viewMode === 'monthly'} onClick={() => setViewMode('monthly')} />
                        <ToggleButton label="Yearly" isActive={viewMode === 'yearly'} onClick={() => setViewMode('yearly')} />
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                            </span>
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-48 pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            />
                        </div>
                         {/* Date Range */}
                        <div className="flex items-center gap-2 text-sm text-text-secondary font-medium">
                            <input 
                                type="date"
                                value={dateRange.start || ''}
                                onChange={e => handleDateChange('start', e.target.value || null)}
                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                title="Start date"
                            />
                            <span className="text-text-muted">-</span>
                            <input 
                                type="date"
                                value={dateRange.end || ''}
                                onChange={e => handleDateChange('end', e.target.value || null)}
                                min={dateRange.start || ''}
                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                disabled={!dateRange.start}
                                title="End date"
                            />
                             {(dateRange.start || dateRange.end) && (
                                <button onClick={() => setDateRange({start: null, end: null})} title="Clear dates" className="p-1 rounded-full hover:bg-slate-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div>
                     <Legend activeFilters={activeFilters} onToggle={handleToggleFilter} />
                </div>
            </header>
            <div className="flex-grow min-h-0">
                {viewMode === 'yearly' ? (
                     <YearlyCalendarView events={filteredEvents} />
                ) : (
                    <NavaCalendar events={filteredEvents} />
                )}
            </div>
        </div>
    );
};

export default CalendarPage;