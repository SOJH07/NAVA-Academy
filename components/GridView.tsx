import React, { useState, useMemo, Dispatch, SetStateAction } from 'react';
import type { CalendarEvent, ProcessedGridEvent } from '../types';
import {
    format,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isToday,
    addMonths,
    isWithinInterval,
    endOfWeek,
    differenceInDays,
    getDay,
    isSameDay,
} from 'date-fns';


// FIX: 'max' and 'min' are not exported from 'date-fns' in some environments.
// Providing local implementations for date comparison.
const max = (dates: (Date | number)[]): Date => {
    if (dates.length === 0) {
        throw new Error('Cannot determine the max of an empty array of dates.');
    }
    return new Date(Math.max(...dates.map(date => new Date(date).getTime())));
};

const min = (dates: (Date | number)[]): Date => {
    if (dates.length === 0) {
        throw new Error('Cannot determine the min of an empty array of dates.');
    }
    return new Date(Math.min(...dates.map(date => new Date(date).getTime())));
};

const EventPopover: React.FC<{ event: CalendarEvent, position: DOMRect | null, onClose: () => void }> = ({ event, position, onClose }) => {
    if (!position) return null;
    const duration = differenceInDays(new Date(event.end), new Date(event.start)) + 1;
    return (
        <div 
            className="fixed z-50 bg-white rounded-lg shadow-xl border border-slate-200 p-4 w-64 animate-fade-in-fast"
            style={{ top: position.bottom + 8, left: position.left }}
            onClick={e => e.stopPropagation()}
        >
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-text-primary pr-2">{event.event}</h4>
                <button onClick={onClose} className="text-text-muted hover:text-text-primary -mt-1 -mr-1 p-1 rounded-full hover:bg-slate-100">&times;</button>
            </div>
            <p className="text-sm text-text-secondary">{format(new Date(event.start), 'MMMM d, yyyy')} - {format(new Date(event.end), 'MMMM d, yyyy')}</p>
            <p className="text-xs text-text-muted italic mt-1">{duration} day{duration !== 1 ? 's' : ''}</p>
        </div>
    );
};

const DayPopover: React.FC<{ date: Date, events: CalendarEvent[], position: DOMRect | null, onClose: () => void, onEventClick: (event: CalendarEvent, target: HTMLElement) => void }> = ({ date, events, position, onClose, onEventClick }) => {
    if (!position) return null;
    return (
        <div 
            className="fixed z-50 bg-white rounded-lg shadow-xl border border-slate-200 p-3 w-72 animate-fade-in-fast"
            style={{ top: position.top, left: position.left + position.width + 8 }}
            onClick={e => e.stopPropagation()}
        >
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-text-primary">{format(date, 'EEEE, MMMM d')}</h4>
                <button onClick={onClose} className="text-text-muted hover:text-text-primary -mt-1 -mr-1 p-1 rounded-full hover:bg-slate-100">&times;</button>
            </div>
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {events.map(event => (
                    <button 
                        key={`${event.event}-${event.start}`} 
                        onClick={(e) => onEventClick(event, e.currentTarget)} 
                        className={`w-full text-left text-xs font-semibold p-2 rounded-md transition-transform hover:scale-[1.02] ${event.color} truncate`}
                    >
                        {event.event}
                    </button>
                ))}
            </div>
        </div>
    );
}

const MonthYearPicker: React.FC<{ currentDate: Date, onSelect: (date: Date) => void, onClose: () => void }> = ({ currentDate, onSelect, onClose }) => {
    const years = [2024, 2025, 2026];
    const months = Array.from({ length: 12 }, (_, i) => i);
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

    const handleMonthSelect = (month: number) => {
        onSelect(new Date(selectedYear, month, 1));
    };

    return (
        <div className="absolute z-20 top-full mt-2 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-lg shadow-xl p-4 w-72" onClick={e => e.stopPropagation()}>
            <div className="flex justify-around items-center mb-3">
                {years.map(year => (
                    <button key={year} onClick={() => setSelectedYear(year)} className={`px-4 py-1 text-sm font-semibold rounded-full ${selectedYear === year ? 'bg-brand-primary text-white' : 'hover:bg-slate-100'}`}>
                        {year}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-4 gap-1">
                {months.map(month => (
                    <button key={month} onClick={() => handleMonthSelect(month)} className={`p-2 text-sm rounded-lg hover:bg-slate-100 text-center ${currentDate.getFullYear() === selectedYear && currentDate.getMonth() === month ? 'bg-brand-primary-light text-brand-primary font-bold' : ''}`}>
                        {format(new Date(selectedYear, month), 'MMM')}
                    </button>
                ))}
            </div>
        </div>
    );
}

const GridView: React.FC<{ events: CalendarEvent[], currentDate: Date, setCurrentDate: Dispatch<SetStateAction<Date>> }> = ({ events, currentDate, setCurrentDate }) => {
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<{event: CalendarEvent, target: HTMLElement} | null>(null);
    const [dayPopover, setDayPopover] = useState<{date: Date, events: CalendarEvent[], target: HTMLElement} | null>(null);

    const { weeks, eventsByWeek, eventsByDate } = useMemo(() => {
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = endOfMonth(currentDate);
        
        const startOfGrid = new Date(firstDayOfMonth);
        startOfGrid.setDate(startOfGrid.getDate() - startOfGrid.getDay()); // Manual startOfWeek with Sunday as 0

        const gridDays = eachDayOfInterval({ start: startOfGrid, end: endOfWeek(lastDayOfMonth, { weekStartsOn: 0 }) });

        const weeks: Date[][] = [];
        for (let i = 0; i < gridDays.length; i += 7) {
            weeks.push(gridDays.slice(i, i + 7));
        }

        const eventsByWeek: ProcessedGridEvent[][] = Array(weeks.length).fill(0).map(() => []);
        const eventsByDate: Map<string, CalendarEvent[]> = new Map();
        
        const sortedEvents = [...events].sort((a,b) => differenceInDays(new Date(b.end), new Date(b.start)) - differenceInDays(new Date(a.end), new Date(a.start)));
        
        sortedEvents.forEach((event, eventIndex) => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);
            
            const daysOfEvent = eachDayOfInterval({start: eventStart, end: eventEnd});
            daysOfEvent.forEach(day => {
                const dayStr = format(day, 'yyyy-MM-dd');
                if(!eventsByDate.has(dayStr)) eventsByDate.set(dayStr, []);
                eventsByDate.get(dayStr)!.push(event);
            });

            for (let weekIndex = 0; weekIndex < weeks.length; weekIndex++) {
                const week = weeks[weekIndex];
                const weekStart = week[0];
                const weekEnd = week[6];

                if (isWithinInterval(eventStart, { start: weekStart, end: weekEnd }) || isWithinInterval(weekStart, { start: eventStart, end: eventEnd })) {
                    const startDayOfWeek = getDay(max([eventStart, weekStart])); // 0 for Sunday
                    const endDayOfWeek = getDay(min([eventEnd, weekEnd]));

                    const lane = eventsByWeek[weekIndex]
                        .filter(e => e.startCol <= endDayOfWeek && e.startCol + e.span -1 >= startDayOfWeek)
                        .reduce((maxLane, e) => Math.max(maxLane, e.lane), -1) + 1;
                    
                    eventsByWeek[weekIndex].push({
                        ...event,
                        id: `${event.event}-${event.start}-${weekIndex}-${eventIndex}`,
                        lane,
                        startCol: startDayOfWeek,
                        span: endDayOfWeek - startDayOfWeek + 1,
                        startsInWeek: isSameDay(eventStart, max([eventStart, weekStart])),
                        endsInWeek: isSameDay(eventEnd, min([eventEnd, weekEnd])),
                    });
                }
            }
        });

        return { weeks, eventsByWeek, eventsByDate };
    }, [currentDate, events]);
    
    const handleEventClick = (event: CalendarEvent, target: HTMLElement) => {
        setSelectedEvent({ event, target });
        setDayPopover(null);
    }
    
    const handleDayClick = (day: Date, target: HTMLElement) => {
        const dailyEvents = eventsByDate.get(format(day, 'yyyy-MM-dd')) || [];
        if (dailyEvents.length > 0) {
            setDayPopover({ date: day, events: dailyEvents, target });
            setSelectedEvent(null);
        }
    }

    const closePopovers = () => {
        setSelectedEvent(null);
        setDayPopover(null);
    }

    const maxLanesPerWeek = useMemo(() => {
        return eventsByWeek.map(weekEvents => {
            return weekEvents.reduce((max, e) => Math.max(max, e.lane), -1) + 1;
        });
    }, [eventsByWeek]);
    
    return (
        <div className="flex flex-col h-full" onClick={closePopovers}>
            {selectedEvent && <EventPopover event={selectedEvent.event} position={selectedEvent.target.getBoundingClientRect()} onClose={closePopovers} />}
            {dayPopover && <DayPopover date={dayPopover.date} events={dayPopover.events} position={dayPopover.target.getBoundingClientRect()} onClose={closePopovers} onEventClick={handleEventClick} />}
            <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-slate-200">
                <button 
                    onClick={() => setIsPickerOpen(prev => !prev)} 
                    className="relative text-2xl font-bold text-text-primary hover:text-brand-primary"
                >
                    {format(currentDate, 'MMMM yyyy')}
                    {isPickerOpen && <MonthYearPicker currentDate={currentDate} onSelect={(d) => { setCurrentDate(d); setIsPickerOpen(false); }} onClose={() => setIsPickerOpen(false)} />}
                </button>
                <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentDate(addMonths(currentDate, -1))} className="p-2 rounded-lg hover:bg-slate-100 text-text-muted">&lt;</button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-sm font-semibold border border-slate-300 rounded-lg hover:bg-slate-100">Today</button>
                    <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 rounded-lg hover:bg-slate-100 text-text-muted">&gt;</button>
                </div>
            </header>
            <div className="flex-grow min-h-0 overflow-y-auto">
                <div className="grid grid-cols-7 flex-shrink-0 sticky top-0 bg-white z-10 border-b border-slate-200">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center font-semibold text-sm text-text-secondary p-3">{day}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 grid-flow-row auto-rows-[minmax(8rem,1fr)]">
                    {weeks.map((week, weekIndex) => (
                        week.map((day, dayIndex) => {
                            const isCurrentMonth = isSameMonth(day, currentDate);
                            const isTodayMarker = isToday(day);
                            const dailyEvents = eventsByDate.get(format(day, 'yyyy-MM-dd')) || [];
                            const weekEvents = eventsByWeek[weekIndex] || [];
                            const maxLanes = maxLanesPerWeek[weekIndex] || 0;
                            const displayedEvents = weekEvents.filter(e => e.startCol === dayIndex).slice(0, 3);
                            const hiddenCount = dailyEvents.length - displayedEvents.length;

                            return (
                                <div key={day.toString()} className="relative p-2 border-r border-b border-slate-200 flex flex-col" style={{gridRow: weekIndex + 1}}>
                                    <time dateTime={format(day, 'yyyy-MM-dd')} className={`text-sm font-semibold ${isCurrentMonth ? 'text-text-primary' : 'text-slate-400'} ${isTodayMarker ? 'relative z-10 bg-brand-primary text-white rounded-full w-7 h-7 flex items-center justify-center' : ''}`}>
                                        {format(day, 'd')}
                                    </time>
                                    <div className="mt-2 space-y-px" style={{minHeight: `${maxLanes * 22}px`}}>
                                        {displayedEvents.map(event => (
                                            <button 
                                                key={event.id}
                                                onClick={(e) => {e.stopPropagation(); handleEventClick(event, e.currentTarget)}}
                                                className={`w-full text-left text-xs font-semibold p-1 rounded transition-transform hover:scale-[1.02] truncate ${event.color} ${event.startsInWeek ? 'rounded-l-md' : 'rounded-l-none'} ${event.endsInWeek ? 'rounded-r-md' : 'rounded-r-none'}`}
                                                style={{ gridColumn: `${event.startCol + 1} / span ${event.span}`, top: `${event.lane * 22}px`, position: "absolute", left: '0.125rem', width: `calc(${event.span * 100}% - 0.25rem)`}}
                                            >
                                               {event.event}
                                            </button>
                                        ))}
                                    </div>
                                    {hiddenCount > 0 && (
                                        <button onClick={(e) => {e.stopPropagation(); handleDayClick(day, e.currentTarget)}} className="text-xs font-semibold text-text-muted hover:underline mt-auto pt-1">
                                            +{hiddenCount} more
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GridView;