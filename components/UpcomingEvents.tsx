import React, { useState, useEffect, useMemo } from 'react';
import { calendarEventsData } from '../data/calendarEvents';
import { format, differenceInSeconds, isFuture, parseISO } from 'date-fns';

const CountdownBlock: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center w-[70px]">
        <p className="text-2xl font-bold text-white">{String(value).padStart(2, '0')}</p>
        <p className="text-xs text-white/70 font-medium">{label}</p>
    </div>
);

const UpcomingEvents: React.FC = () => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const upcomingEvents = useMemo(() => {
        // Use parseISO because the dates are in 'YYYY-MM-DD' format
        return calendarEventsData
            .filter(event => isFuture(parseISO(event.start)))
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
            .slice(0, 3);
    }, []);

    const nextEvent = upcomingEvents[0];

    const timeLeft = useMemo(() => {
        if (!nextEvent) return null;
        const eventStart = parseISO(nextEvent.start);
        const secondsTotal = differenceInSeconds(eventStart, now);
        if (secondsTotal <= 0) return { days: 0, hours: 0, minutes: 0 };
        
        const days = Math.floor(secondsTotal / (3600 * 24));
        const hours = Math.floor((secondsTotal % (3600 * 24)) / 3600);
        const minutes = Math.floor((secondsTotal % 3600) / 60);

        return { days, hours, minutes };
    }, [now, nextEvent]);

    return (
        <div className="rounded-xl shadow-lg overflow-hidden font-sans">
            <h2 className="bg-[#0A2A66] text-white text-center font-bold py-3 uppercase tracking-wider text-sm">
                Academy Events
            </h2>
            <div className="bg-[#4A6D4A] p-4 space-y-4 max-h-[400px] overflow-y-auto">
                {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event, index) => {
                        const eventDate = parseISO(event.start);
                        const isFirst = index === 0;

                        return (
                            <div key={index} className="pb-4 border-b border-white/20 last:border-b-0 last:pb-0">
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0 text-center w-12">
                                        <p className="text-xs font-bold text-teal-300 uppercase">{format(eventDate, 'MMM')}</p>
                                        <p className="text-3xl font-bold text-white leading-none">{format(eventDate, 'd')}</p>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-white text-base">{event.event}</p>
                                        <p className="text-sm text-white/70">{event.type}</p>
                                    </div>
                                </div>
                                {isFirst && timeLeft && (
                                    <div className="mt-3 flex justify-start gap-2 pl-[64px]">
                                        <CountdownBlock value={timeLeft.days} label="Days" />
                                        <CountdownBlock value={timeLeft.hours} label="Hours" />
                                        <CountdownBlock value={timeLeft.minutes} label="Mins" />
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <p className="text-white/80 text-center py-8">No upcoming events.</p>
                )}
            </div>
        </div>
    );
};

export default UpcomingEvents;