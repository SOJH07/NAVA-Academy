import React, { useMemo, useState, useRef, useEffect } from 'react';
import type { CalendarEvent, ProcessedCalendarEvent } from '../types';
import { differenceInDays, addMonths, format, eachDayOfInterval, isSameDay, getDay } from 'date-fns';

const ZOOM_LEVELS = [2, 4, 8, 16, 24]; // Represents day width in pixels

const getEventType = (eventName: string) => eventName.split(" ")[0].replace(/CH[1-3]/, 'CH');

const LEGEND_COLOR_MAP: { [key: string]: string } = {
    'CH': 'bg-blue-500',
    'NAVA': 'bg-yellow-500',
    'National': 'bg-purple-600',
    'Ramadan': 'border-green-400 border-2',
    'Eid': 'bg-sky-400',
    'Annual': 'bg-orange-500',
};

const EventTooltip: React.FC<{ event: ProcessedCalendarEvent, position: {x: number, y: number} }> = ({ event, position }) => {
    return (
        <div 
            className="absolute z-30 bg-gray-800 text-white p-3 rounded-lg shadow-xl transition-opacity duration-200"
            style={{ top: position.y + 15, left: position.x + 15, pointerEvents: 'none' }}
        >
            <h4 className="font-bold">{event.event}</h4>
            <p className="text-sm">{format(new Date(event.start), 'MMM d, yyyy')} - {format(new Date(event.end), 'MMM d, yyyy')}</p>
            <p className="text-xs italic">{event.duration} day{event.duration > 1 ? 's' : ''}</p>
        </div>
    );
};

const TimelineView: React.FC<{ events: CalendarEvent[] }> = ({ events }) => {
    const [zoomLevel, setZoomLevel] = useState(1); // Index of ZOOM_LEVELS
    const DAY_WIDTH = ZOOM_LEVELS[zoomLevel];

    const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
    const [hoveredEvent, setHoveredEvent] = useState<ProcessedCalendarEvent | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{x: number, y: number} | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ scrollX: 0, clientX: 0 });

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const todayRef = useRef<HTMLDivElement>(null);
    const today = new Date();

    const {
        startDate,
        endDate,
        totalDays,
        months,
        years,
        allDays,
        processedEvents,
        eventTypes,
        timelineHeight
    } = useMemo(() => {
        const startDate = new Date('2024-09-01');
        const endDate = new Date('2026-12-31');
        const totalDays = differenceInDays(endDate, startDate) + 1;

        const allEventTypes = Array.from(new Set(events.map(e => getEventType(e.event))));
        const holidayDates = new Set<string>();
        events.forEach(e => {
            if (e.event === 'National Holiday') {
                const dates = eachDayOfInterval({start: new Date(e.start), end: new Date(e.end)});
                dates.forEach(d => holidayDates.add(format(d, 'yyyy-MM-dd')));
            }
        });

        const allDays = eachDayOfInterval({ start: startDate, end: endDate }).map(day => {
            const dayOfWeek = getDay(day);
            return {
                date: day,
                isWeekend: dayOfWeek === 5 || dayOfWeek === 6, // Friday or Saturday
                isHoliday: holidayDates.has(format(day, 'yyyy-MM-dd')),
                left: differenceInDays(day, startDate) * DAY_WIDTH,
            };
        });

        const monthMarkers = [];
        let currentMonth = new Date(startDate);
        while (currentMonth <= endDate) {
            const monthStartDay = differenceInDays(currentMonth, startDate);
            monthMarkers.push({
                name: format(currentMonth, 'MMM'),
                year: format(currentMonth, 'yyyy'),
                left: monthStartDay * DAY_WIDTH,
            });
            currentMonth = addMonths(currentMonth, 1);
        }

        const yearMarkers = monthMarkers.reduce((acc, month) => {
            if (!acc.find(y => y.year === month.year)) {
                acc.push({ year: month.year, left: month.left });
            }
            return acc;
        }, [] as { year: string, left: number }[]);

        const filteredEvents = events.filter(e => activeFilters.size === 0 || activeFilters.has(getEventType(e.event)));

        const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
        const lanes: Date[] = [];
        const processedEvents = sortedEvents.map((event, i): ProcessedCalendarEvent => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);
            const duration = differenceInDays(eventEnd, eventStart) + 1;

            let laneIndex = lanes.findIndex(laneEndDate => eventStart > laneEndDate);
            if (laneIndex === -1) {
                laneIndex = lanes.length;
            }
            lanes[laneIndex] = eventEnd;

            return {
                ...event,
                id: `${event.event}-${event.start}-${i}`,
                left: differenceInDays(eventStart, startDate) * DAY_WIDTH,
                width: duration * DAY_WIDTH - 2, // a little padding
                top: laneIndex * 36 + 10,
                isMilestone: duration === 1,
                isInProgress: isSameDay(today, eventStart) || (today > eventStart && today < eventEnd),
                duration,
            };
        });

        const newTimelineHeight = lanes.length > 0 ? (lanes.length * 36 + 40) : 100;

        return { startDate, endDate, totalDays, months: monthMarkers, years: yearMarkers, allDays, processedEvents, eventTypes: allEventTypes, timelineHeight: newTimelineHeight };
    }, [events, DAY_WIDTH, activeFilters]);

    const timelineWidth = totalDays * DAY_WIDTH;

    const handleZoom = (direction: 'in' | 'out') => {
        setZoomLevel(current => {
            if (direction === 'in') return Math.min(current + 1, ZOOM_LEVELS.length - 1);
            return Math.max(current - 1, 0);
        });
    };

    const handleGoToToday = () => {
        if (todayRef.current && scrollContainerRef.current) {
            const containerWidth = scrollContainerRef.current.offsetWidth;
            const scrollPos = todayRef.current.offsetLeft - (containerWidth / 2);
            scrollContainerRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
        }
    };
    
    useEffect(handleGoToToday, []); // Scroll to today on initial load

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

    const handleEventMouseEnter = (event: ProcessedCalendarEvent, e: React.MouseEvent) => {
        setHoveredEvent(event);
        setTooltipPosition({ x: e.clientX, y: e.clientY });
    };

    const handleEventMouseMove = (e: React.MouseEvent) => {
        if (hoveredEvent) {
            setTooltipPosition({ x: e.clientX, y: e.clientY });
        }
    };
    const handleEventMouseLeave = () => setHoveredEvent(null);
    
    const onMouseDown = (e: React.MouseEvent) => {
        if (scrollContainerRef.current) {
            setIsDragging(true);
            setDragStart({
                scrollX: scrollContainerRef.current.scrollLeft,
                clientX: e.clientX,
            });
            scrollContainerRef.current.style.cursor = 'grabbing';
            scrollContainerRef.current.style.userSelect = 'none';
        }
    };
    const onMouseUp = () => {
        setIsDragging(false);
         if (scrollContainerRef.current) {
            scrollContainerRef.current.style.cursor = 'grab';
            scrollContainerRef.current.style.userSelect = 'auto';
        }
    };
    const onMouseMove = (e: React.MouseEvent) => {
        if (isDragging && scrollContainerRef.current) {
            const dx = e.clientX - dragStart.clientX;
            scrollContainerRef.current.scrollLeft = dragStart.scrollX - dx;
        }
    };


    return (
        <div className="w-full h-full flex flex-col gap-4">
            {/* Controls */}
            <div className="flex-shrink-0 bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-wrap gap-4 justify-between items-center">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="font-bold text-sm text-text-secondary">Legend:</span>
                    {eventTypes.map(type => {
                        const isActive = activeFilters.size === 0 || activeFilters.has(type);
                        const colorClass = LEGEND_COLOR_MAP[type] || 'bg-gray-400';
                        const isBordered = colorClass.includes('border');
                        return (
                             <button
                                key={type}
                                onClick={() => handleToggleFilter(type)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all border ${
                                    activeFilters.has(type)
                                        ? 'bg-brand-primary border-brand-primary text-white shadow'
                                        : `bg-white border-slate-300 text-text-secondary hover:border-slate-400`
                                }`}
                            >
                                <span className={`w-3 h-3 rounded-full ${colorClass} ${isBordered ? 'bg-transparent' : ''}`}></span>
                                {type}
                            </button>
                        );
                    })}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleGoToToday} className="px-3 py-1.5 text-sm font-semibold text-brand-primary bg-brand-primary-light rounded-md hover:bg-indigo-200 transition">Go to Today</button>
                    <div className="flex items-center">
                        <button onClick={() => handleZoom('out')} disabled={zoomLevel === 0} className="p-1.5 bg-slate-200 rounded-l-md hover:bg-slate-300 disabled:opacity-50">-</button>
                        <button onClick={() => handleZoom('in')} disabled={zoomLevel === ZOOM_LEVELS.length - 1} className="p-1.5 bg-slate-200 rounded-r-md hover:bg-slate-300 border-l border-slate-400 disabled:opacity-50">+</button>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div
                ref={scrollContainerRef}
                className="w-full h-full overflow-auto bg-white border border-slate-200 rounded-lg relative cursor-grab"
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                onMouseMove={onMouseMove}
            >
                <div style={{ width: timelineWidth, height: timelineHeight + 80 }} className="relative">
                    {/* Background Day Shading */}
                    <div className="absolute top-0 left-0 w-full h-full">
                        {allDays.map(day => (
                            <div key={day.date.toISOString()} className={`absolute h-full ${day.isHoliday ? 'bg-purple-100/50' : day.isWeekend ? 'bg-slate-100/70' : ''}`} style={{ left: day.left, width: DAY_WIDTH }}></div>
                        ))}
                    </div>

                    {/* Year Markers */}
                    {years.map(({ year, left }) => (
                        <div key={year} className="absolute top-4 text-lg font-bold text-slate-700" style={{ left }}>
                            {year}
                        </div>
                    ))}
                    
                    {/* Month Markers */}
                    {months.map(({ name, left }) => (
                        <div key={`${name}-${left}`} className="absolute top-12 h-full z-10" style={{ left }}>
                            <span className="text-xs font-semibold text-slate-500">{name}</span>
                            <div className="absolute top-6 w-px h-full bg-slate-200"></div>
                        </div>
                    ))}
                    
                    {/* Today Marker */}
                     <div ref={todayRef} className="absolute top-12 h-full z-20" style={{ left: (differenceInDays(today, startDate) * DAY_WIDTH) + (DAY_WIDTH/2) }}>
                        <div className="w-0.5 h-full bg-red-500"></div>
                        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                    </div>

                    {/* Events */}
                    <div className="absolute top-[80px] w-full h-full">
                        {processedEvents.map(event => (
                            <div 
                                key={event.id}
                                onMouseEnter={(e) => handleEventMouseEnter(event, e)}
                                onMouseMove={handleEventMouseMove}
                                onMouseLeave={handleEventMouseLeave}
                            >
                                {event.isMilestone ? (
                                    <div 
                                        className={`absolute z-20 ${event.isInProgress ? 'animate-pulse' : ''}`}
                                        style={{ top: event.top + 8, left: event.left + (event.width/2), transform: 'translateX(-50%)' }}
                                        title={`${event.event} (${format(new Date(event.start), 'MMM d')})`}
                                    >
                                        <div className={`w-4 h-4 ${event.color} transform rotate-45 rounded-sm`}></div>
                                    </div>
                                ) : (
                                    <div
                                        className={`absolute z-20 ${event.color.includes('text-gray-800') ? 'text-gray-800' : 'text-white'} ${event.color} rounded text-xs font-semibold px-2 py-1 overflow-hidden whitespace-nowrap flex items-center transition-all duration-200 hover:scale-105 hover:shadow-lg
                                            ${event.isInProgress ? 'ring-2 ring-offset-1 ring-blue-500' : ''}
                                        `}
                                        style={{ left: event.left, width: event.width, top: event.top, height: 28 }}
                                        title={`${event.event} (${format(new Date(event.start), 'MMM d')} - ${format(new Date(event.end), 'MMM d')})`}
                                    >
                                        {event.width > 50 && <span className="truncate">{event.event}</span>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                {hoveredEvent && tooltipPosition && <EventTooltip event={hoveredEvent} position={tooltipPosition}/>}
            </div>
        </div>
    );
};

export default TimelineView;