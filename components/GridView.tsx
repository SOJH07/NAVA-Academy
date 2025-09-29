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
const max = (dates: Date[]): Date => {
    if (dates.length === 0) {
        throw new Error('Cannot determine the max of an empty array of dates.');
    }
    return new Date(Math.max(...dates.map(date => date.getTime())));
};

const min = (dates: Date[]): Date => {
    if (dates.length === 0) {
        throw new Error('Cannot determine the min of an empty array of dates.');
    }
    return new Date(Math.min(...dates.map(date => date.getTime())));
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

        const eventsByDate = new Map<string, CalendarEvent[]>();
        gridDays.forEach(day => {
             const dateStr = format(day, 'yyyy-MM-dd');
             const dailyEvents = events.filter(event => isWithinInterval(day, { start: new Date(event.start), end: new Date(event.end) }));
             if (dailyEvents.length > 0) {
                 eventsByDate.set(dateStr, dailyEvents);
             }
        });

        const eventsByWeek = new Map<string, ProcessedGridEvent[]>();

        weeks.forEach((week, weekIndex) => {
            const weekStart = week[0];
            const weekEnd = week[6];
            const weekKey = format(weekStart, 'yyyy-MM-dd');

            const weekEvents = events
                .filter(event => max([new Date(event.start), weekStart]) <= min([new Date(event.end), weekEnd]))
                .sort((a, b) => {
                    const diff = differenceInDays(new Date(a.start), new Date(b.start));
                    if(diff !== 0) return diff;
                    return differenceInDays(new Date(b.end), new Date(a.end));
                });

            const lanes: Date[] = [];
            const processedWeekEvents: ProcessedGridEvent[] = [];

            for (const event of weekEvents) {
                const eventStart = new Date(event.start);
                let assignedLane = false;
                for (let i = 0; i < lanes.length; i++) {
                    if (eventStart > lanes[i]) {
                        lanes[i] = new Date(event.end);
                        
                        const startCol = getDay(max([eventStart, weekStart])) + 1;
                        const endCol = getDay(min([new Date(event.end), weekEnd])) + 1;
                        
                        processedWeekEvents.push({
                            ...event,
                            id: `${event.event}-${event.start}-${weekIndex}-${i}`,
                            lane: i,
                            startCol,
                            span: endCol - startCol + 1,
                            startsInWeek: isSameDay(eventStart, max([eventStart, weekStart])),
                            endsInWeek: isSameDay(new Date(event.end), min([new Date(event.end), weekEnd])),
                        });
                        assignedLane = true;
                        break;
                    }
                }
                
                if (!assignedLane) {
                    const newLaneIndex = lanes.length;
                    lanes.push(new Date(event.end));
                    const startCol = getDay(max([eventStart, weekStart])) + 1;
                    const endCol = getDay(min([new Date(event.end), weekEnd])) + 1;
                    
                     processedWeekEvents.push({
                        ...event,
                        id: `${event.event}-${event.start}-${weekIndex}-${newLaneIndex}`,
                        lane: newLaneIndex,
                        startCol,
                        span: endCol - startCol + 1,
                        startsInWeek: isSameDay(eventStart, max([eventStart, weekStart])),
                        endsInWeek: isSameDay(new Date(event.end), min([new Date(event.end), weekEnd])),
                    });
                }
            }
            eventsByWeek.set(weekKey, processedWeekEvents);
        });

        return { weeks, eventsByWeek, eventsByDate };
    }, [events, currentDate]);
    
    const handleEventClick = (event: CalendarEvent, target: HTMLElement) => {
        setDayPopover(null);
        setSelectedEvent({ event, target });
    };

    const handleDayPopoverOpen = (date: Date, events: CalendarEvent[], target: HTMLElement) => {
        handleClosePopovers();
        setDayPopover({ date, events, target });
    }
    
    const handleClosePopovers = () => {
        setSelectedEvent(null); 
        setDayPopover(null);
    }

    const changeMonth = (amount: number) => {
        handleClosePopovers();
        setCurrentDate(current => addMonths(current, amount));
    };
    
    const goToToday = () => {
        handleClosePopovers();
        setCurrentDate(new Date());
        setIsPickerOpen(false);
    };

    const handlePickerSelect = (date: Date) => {
        handleClosePopovers();
        setCurrentDate(date);
        setIsPickerOpen(false);
    }
    
    const eventsLaneOffset = 32;
    const eventLaneHeight = 28;
    const MAX_LANES_VISIBLE = 4;

    return (
        <div className="bg-white border border-slate-200 rounded-lg h-full flex flex-col" onClick={handleClosePopovers}>
            <div className="flex-shrink-0 flex justify-between items-center mb-3 px-2 py-1 relative">
                <div className="flex items-center gap-1">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
                 <div className="absolute left-1/2 -translate-x-1/2">
                     <button onClick={() => setIsPickerOpen(p => !p)} className="text-xl font-bold text-text-primary px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                        {format(currentDate, 'MMMM yyyy')}
                     </button>
                      {isPickerOpen && <MonthYearPicker currentDate={currentDate} onSelect={handlePickerSelect} onClose={() => setIsPickerOpen(false)} />}
                 </div>
                <button onClick={goToToday} className="px-4 py-2 text-sm font-semibold text-brand-primary bg-brand-primary-light rounded-md hover:bg-indigo-200 transition">Today</button>
            </div>
            
            <div className="grid grid-cols-7 text-center font-semibold text-sm text-text-secondary border-b-2 border-slate-200 flex-shrink-0">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2">{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 flex-grow min-h-0">
                {weeks.map((week, weekIndex) => {
                    const weekKey = format(week[0], 'yyyy-MM-dd');
                    const weekEvents = eventsByWeek.get(weekKey) || [];

                    return (
                        <div key={weekKey} className="grid grid-cols-7 col-span-7 border-b border-slate-200 last:border-b-0 relative" style={{ gridRow: weekIndex + 1 }}>
                            {week.map((day, dayIndex) => {
                                 const dateStr = format(day, 'yyyy-MM-dd');
                                 const isCurrentMonth = isSameMonth(day, currentDate);
                                 const isWknd = getDay(day) === 5 || getDay(day) === 6;
                                 const dailyEvents = eventsByDate.get(dateStr) || [];
                                 
                                 const visibleEventsCount = weekEvents.filter(e => e.startCol <= dayIndex + 1 && e.startCol + e.span > dayIndex + 1 && e.lane < MAX_LANES_VISIBLE).length;
                                 const hiddenEventsCount = dailyEvents.length - visibleEventsCount;

                                 return (
                                    <div key={dateStr} className={`border-r border-slate-200 last:border-r-0 p-2 relative ${isCurrentMonth ? (isWknd ? 'bg-slate-50/50' : 'bg-white') : 'bg-slate-100/70'}`}>
                                        <time dateTime={dateStr} className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ml-auto transition-colors
                                            ${isToday(day) ? 'bg-brand-primary text-white' : (isCurrentMonth ? 'text-text-secondary' : 'text-slate-400')}`}>
                                            {format(day, 'd')}
                                        </time>
                                         {hiddenEventsCount > 0 && (
                                            <button onClick={(e) => { e.stopPropagation(); handleDayPopoverOpen(day, dailyEvents, e.currentTarget);}} className="text-xs font-bold text-brand-primary hover:underline mt-1 float-right">
                                                + {hiddenEventsCount} more
                                            </button>
                                        )}
                                    </div>
                                 );
                            })}
                         
                            <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
                                {weekEvents.filter(e => e.lane < MAX_LANES_VISIBLE).map(event => (
                                     <button
                                        key={event.id}
                                        onClick={(e) => { e.stopPropagation(); handleEventClick(event, e.currentTarget); }}
                                        className={`pointer-events-auto absolute h-[24px] text-xs font-semibold p-1 overflow-hidden whitespace-nowrap z-10 rounded-md transition-all duration-200 hover:ring-2 hover:ring-offset-1 hover:ring-brand-primary/80
                                            ${event.color}
                                            ${event.startsInWeek ? '' : 'rounded-l-none'}
                                            ${event.endsInWeek ? '' : 'rounded-r-none'}
                                        `}
                                        style={{ 
                                            top: eventsLaneOffset + event.lane * eventLaneHeight, 
                                            gridColumnStart: event.startCol, 
                                            gridColumnEnd: `span ${event.span}`,
                                            width: `calc(100% * ${event.span} - 8px)`,
                                            left: '4px'
                                        }}
                                     >
                                        <span className="truncate pl-1">{event.event}</span>
                                     </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
             {selectedEvent && <EventPopover event={selectedEvent.event} position={selectedEvent.target.getBoundingClientRect()} onClose={handleClosePopovers} />}
             {dayPopover && <DayPopover date={dayPopover.date} events={dayPopover.events} position={dayPopover.target.getBoundingClientRect()} onClose={handleClosePopovers} onEventClick={(e, t) => handleEventClick(e, t)} />}
        </div>
    );
};

export default GridView;