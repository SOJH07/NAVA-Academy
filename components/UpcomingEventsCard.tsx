import React, { useState, useEffect, useMemo } from 'react';
import { calendarEventsData } from '../data/calendarEvents';
import { format, differenceInSeconds, isFuture, parseISO } from 'date-fns';

const CountdownBlock: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="bg-brand-primary-light rounded-lg p-2 text-center w-full">
        <p className="text-xl font-bold text-brand-primary-dark">{String(value).padStart(2, '0')}</p>
        <p className="text-xs text-brand-primary font-medium">{label}</p>
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
            .filter(event => isFuture(parseISO(event.start)))
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
            .slice(0, 5);
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
        <div className="h-full flex flex-col p-4">
            {upcomingEvents.length > 0 ? (
                <div className="space-y-3 overflow-y-auto pr-2 flex-grow">
                    {upcomingEvents.map((event, index) => {
                        const eventDate = parseISO(event.start);
                        const isFirst = index === 0;

                        return (
                            <div key={index} className={`p-3 rounded-lg ${isFirst ? 'bg-brand-primary-light' : 'bg-slate-50'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`flex-shrink-0 text-center w-12 rounded-md p-1 ${isFirst ? 'bg-brand-primary' : 'bg-slate-200'}`}>
                                        <p className={`text-xs font-bold uppercase ${isFirst ? 'text-white/80' : 'text-text-muted'}`}>{format(eventDate, 'MMM')}</p>
                                        <p className={`text-2xl font-bold leading-none ${isFirst ? 'text-white' : 'text-text-primary'}`}>{format(eventDate, 'd')}</p>
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`font-bold text-sm ${isFirst ? 'text-brand-primary-dark' : 'text-text-primary'}`}>{event.event}</p>
                                        <p className={`text-xs ${isFirst ? 'text-brand-primary' : 'text-text-secondary'}`}>{event.type}</p>
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
                }
                </div>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-kiosk-text-muted text-center text-sm">No upcoming events.</p>
                </div>
            )}
        </div>
    );
};

export default UpcomingEventsCard;
