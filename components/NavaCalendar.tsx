import React, { useState } from 'react';
import type { CalendarEvent } from '../types';
import GridView from './GridView';
import YearNavigator from './YearNavigator';

interface NavaCalendarProps {
    events: CalendarEvent[];
}

const NavaCalendar: React.FC<NavaCalendarProps> = ({ events }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    return (
        <div className="flex h-full">
            <YearNavigator 
                events={events}
                currentDate={currentDate}
                onDateSelect={setCurrentDate}
            />
            <div className="flex-1 flex flex-col min-w-0">
                <main className="flex-grow p-4 min-h-0 bg-slate-50">
                    <GridView 
                        events={events} 
                        currentDate={currentDate}
                        setCurrentDate={setCurrentDate}
                    />
                </main>
            </div>
        </div>
    );
};

export default NavaCalendar;
