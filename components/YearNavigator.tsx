import React, { useMemo, useRef, useEffect } from 'react';
import type { CalendarEvent } from '../types';
import { format, endOfYear, eachDayOfInterval, getDay, isSameDay, isSameMonth } from 'date-fns';

interface YearNavigatorProps {
    events: CalendarEvent[];
    currentDate: Date;
    onDateSelect: (date: Date) => void;
}

const EVENT_COLOR_MAP: Record<string, string> = {
    'CH': 'bg-blue-500',
    'NAVA': 'bg-yellow-400',
    'National': 'bg-purple-500',
    'Ramadan': 'bg-green-400',
    'Eid': 'bg-sky-400',
    'Annual': 'bg-orange-500',
};

const EVENT_TYPE_PRIORITY: (CalendarEvent['type'])[] = ['National', 'Eid', 'Annual', 'NAVA', 'CH', 'Ramadan'];

const YearNavigator: React.FC<YearNavigatorProps> = ({ events, currentDate, onDateSelect }) => {
    const years = useMemo(() => {
        const yearSet = new Set(events.flatMap(e => [new Date(e.start).getFullYear(), new Date(e.end).getFullYear()]));
        return Array.from(yearSet).sort();
    }, [events]);

    const eventsByDate = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>();
        for (const event of events) {
            const start = new Date(event.start);
            const end = new Date(event.end);
            const interval = eachDayOfInterval({ start, end });
            for (const day of interval) {
                const dateStr = format(day, 'yyyy-MM-dd');
                if (!map.has(dateStr)) {
                    map.set(dateStr, []);
                }
                map.get(dateStr)!.push(event);
            }
        }
        return map;
    }, [events]);

    const activeMonthRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (activeMonthRef.current) {
            activeMonthRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [currentDate]);

    const getEventDotColor = (day: Date): string => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dailyEvents = eventsByDate.get(dayStr);

        if (!dailyEvents || dailyEvents.length === 0) {
            return '';
        }

        const topEvent = dailyEvents.reduce((prev, curr) => {
            const prevPriority = EVENT_TYPE_PRIORITY.indexOf(prev.type);
            const currPriority = EVENT_TYPE_PRIORITY.indexOf(curr.type);
            return currPriority < prevPriority ? curr : prev;
        });

        return EVENT_COLOR_MAP[topEvent.type] || 'bg-slate-400';
    };


    return (
        <aside className="w-64 bg-bg-panel border-r border-slate-200 flex-shrink-0 flex flex-col h-full">
            <header className="p-4 border-b border-slate-200 flex-shrink-0">
                <h3 className="text-lg font-bold text-text-primary">Year at a Glance</h3>
            </header>
            <div className="flex-grow overflow-y-auto p-3">
                {years.map(year => (
                    <div key={year} className="mb-4">
                        <h4 className="font-bold text-xl text-text-secondary text-center mb-3">{year}</h4>
                        <div className="space-y-3">
                            {Array.from({ length: 12 }).map((_, monthIndex) => {
                                const monthDate = new Date(year, monthIndex);
                                const firstDayOfMonth = new Date(year, monthIndex, 1);
                                const daysInMonth = eachDayOfInterval({start: firstDayOfMonth, end: new Date(year, monthIndex + 1, 0)});
                                const startingDay = getDay(firstDayOfMonth); // 0 for Sunday
                                const isActive = isSameMonth(monthDate, currentDate);

                                return (
                                    <button 
                                        key={monthIndex}
                                        ref={isActive ? activeMonthRef : null}
                                        onClick={() => onDateSelect(monthDate)}
                                        className={`w-full p-2 text-left rounded-lg transition-colors ${isActive ? 'bg-brand-primary-light ring-2 ring-brand-primary' : 'hover:bg-slate-100'}`}
                                    >
                                        <p className={`font-bold text-sm mb-1 ${isActive ? 'text-brand-primary' : 'text-text-primary'}`}>{format(monthDate, 'MMMM')}</p>
                                        <div className="grid grid-cols-7 gap-px">
                                            {/* Empty placeholders for days before the 1st */}
                                            {Array.from({ length: startingDay }).map((_, i) => <div key={`empty-${i}`} className="w-full aspect-square"></div>)}
                                            
                                            {daysInMonth.map(day => {
                                                const dayStr = format(day, 'yyyy-MM-dd');
                                                const eventColorClass = getEventDotColor(day);
                                                const isTodayMarker = isSameDay(day, new Date());

                                                return (
                                                    <div key={dayStr} className="w-full aspect-square flex items-center justify-center">
                                                        {isTodayMarker ? (
                                                            <span className={`w-2 h-2 rounded-full ring-2 ring-offset-1 ring-red-500 ${eventColorClass || 'bg-transparent'}`}></span>
                                                        ) : (
                                                            eventColorClass && <span className={`w-1.5 h-1.5 rounded-full ${eventColorClass}`}></span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default YearNavigator;