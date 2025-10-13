import React, { useState, useEffect, useMemo } from 'react';
import { calendarEventsData } from '../data/calendarEvents';
import { format, differenceInSeconds, isPast, isToday, isFuture, parseISO } from 'date-fns';

const CountdownBlock: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="bg-slate-200/50 rounded-lg p-2 text-center w-full">
        <p className="text-2xl font-bold text-kiosk-text-title">{String(value).padStart(2, '0')}</p>
        <p className="text-xs text-kiosk-text-muted font-medium">{label}</p>
    </div>
);

interface UpcomingEventsCardProps {
    language: 'en' | 'ar';
}

const UpcomingEventsCard: React.FC<UpcomingEventsCardProps> = ({ language }) => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const upcomingEvents = useMemo(() => {
        return calendarEventsData
            .filter(event => !isPast(new Date(event.end)))
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
            .slice(0, 3);
    }, []);

    const nextEvent = upcomingEvents[0];

    const timeLeft = useMemo(() => {
        if (!nextEvent) return null;
        const eventStart = parseISO(nextEvent.start);
        const secondsTotal = differenceInSeconds(eventStart, now);
        if (secondsTotal <= 0) return null;
        
        const days = Math.floor(secondsTotal / (3600 * 24));
        const hours = Math.floor((secondsTotal % (3600 * 24)) / 3600);
        const minutes = Math.floor((secondsTotal % 3600) / 60);

        return { days, hours, minutes };
    }, [now, nextEvent]);

    return (
        <div className="space-y-4 h-full overflow-y-auto">
            {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, index) => {
                    const eventDate = parseISO(event.start);
                    const isFirst = index === 0;

                    return (
                        <div key={index} className="pb-3 border-b border-slate-200/70 last:border-b-0 last:pb-0">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 text-center w-12">
                                    <p className="text-xs font-bold text-brand-primary-dark uppercase">{format(eventDate, 'MMM')}</p>
                                    <p className="text-3xl font-bold text-kiosk-text-title leading-none">{format(eventDate, 'd')}</p>
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-kiosk-text-title text-base">{event.event}</p>
                                    {!event.event.toLowerCase().includes(event.type.toLowerCase()) && 
                                        <p className="text-sm text-kiosk-text-muted">{event.type}</p>
                                    }
                                </div>
                            </div>
                            {isFirst && timeLeft && (
                                <div className="mt-3 grid grid-cols-3 gap-2 pl-[64px]">
                                    <CountdownBlock value={timeLeft.days} label="Days" />
                                    <CountdownBlock value={timeLeft.hours} label="Hours" />
                                    <CountdownBlock value={timeLeft.minutes} label="Mins" />
                                </div>
                            )}
                        </div>
                    );
                })
            ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-kiosk-text-muted text-center text-sm">No upcoming events.</p>
                </div>
            )}
        </div>
    );
};

export default UpcomingEventsCard;