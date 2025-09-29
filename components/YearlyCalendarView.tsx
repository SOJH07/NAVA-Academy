import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { CalendarEvent } from '../types';
import { format, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns';

const ACADEMIC_YEARS = ['2024-2025', '2025-2026'];

const YearlyCalendarView: React.FC<{ events: CalendarEvent[] }> = ({ events }) => {
    const [academicYear, setAcademicYear] = useState('2024-2025');
    const activeMonthRowRef = useRef<HTMLTableRowElement>(null);
    const today = new Date(); // Dynamic 'today'

    const { months, eventsByDate } = useMemo(() => {
        const [startYearStr] = academicYear.split('-');
        const startYear = parseInt(startYearStr, 10);
        
        const academicStartDate = new Date(startYear, 9, 1); // October 1st
        
        const months = Array.from({ length: 12 }).map((_, i) => {
            const date = new Date(academicStartDate.getFullYear(), academicStartDate.getMonth() + i, 1);
            return date;
        });

        const map = new Map<string, CalendarEvent>();
        for (const event of events) {
            const start = new Date(event.start);
            const end = new Date(event.end);
            const interval = eachDayOfInterval({ start, end });
            for (const day of interval) {
                const dateStr = format(day, 'yyyy-MM-dd');
                map.set(dateStr, event);
            }
        }
        return { months, eventsByDate: map };

    }, [academicYear, events]);
    
    useEffect(() => {
        activeMonthRowRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
    }, [academicYear]);


    return (
        <div className="h-full flex flex-col bg-slate-50 relative">
            <header className="flex-shrink-0 flex justify-center items-center p-3 gap-4">
                 <div className="flex items-center bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden">
                    <span className="px-3 py-2 text-sm font-bold text-green-800 bg-green-200">Academic Year</span>
                     <select 
                        value={academicYear} 
                        onChange={e => setAcademicYear(e.target.value)} 
                        className="font-bold text-lg text-text-primary bg-transparent pl-3 pr-4 py-1.5 focus:outline-none appearance-none cursor-pointer"
                    >
                        {ACADEMIC_YEARS.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </header>

            <div className="flex-grow min-h-0 overflow-auto p-2">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="sticky top-0 bg-slate-200 z-20 p-2 text-sm font-semibold text-text-primary w-32 min-w-[8rem]">Month</th>
                            {Array.from({ length: 31 }).map((_, i) => (
                                <th key={i} className="sticky top-0 bg-slate-100 z-10 p-2 text-center font-normal text-text-secondary w-10 min-w-[2.5rem]">{i + 1}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {months.map(monthDate => {
                            const isCurrentMonthRow = isSameMonth(monthDate, today);
                            return (
                                <tr key={format(monthDate, 'yyyy-MM')} ref={isCurrentMonthRow ? activeMonthRowRef : null}>
                                    <td className={`sticky left-0 z-10 p-2 text-sm font-bold text-center text-text-primary whitespace-nowrap transition-colors ${isCurrentMonthRow ? 'bg-amber-100' : 'bg-slate-200'}`}>
                                        {format(monthDate, 'MMMM-yy')}
                                    </td>
                                    {Array.from({ length: 31 }).map((_, dayIndex) => {
                                        const day = dayIndex + 1;
                                        const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
                                        
                                        if (date.getMonth() !== monthDate.getMonth()) {
                                            return <td key={day} className="bg-slate-100/50"></td>;
                                        }
                                        
                                        const dateStr = format(date, 'yyyy-MM-dd');
                                        const event = eventsByDate.get(dateStr);
                                        const isTodayCell = isSameDay(date, today);

                                        return (
                                            <td 
                                                key={day} 
                                                className={`h-10 w-10 text-center font-medium text-xs border border-slate-200/80 transition-shadow hover:shadow-lg hover:z-30 ${event ? event.color : 'bg-white'}`}
                                                title={event ? event.event : ''}
                                            >
                                                <span className={`inline-block px-1 rounded ${isTodayCell ? 'bg-red-500 text-white font-bold' : ''}`}>
                                                    {day}
                                                </span>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default YearlyCalendarView;