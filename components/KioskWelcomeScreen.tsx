import React, { useMemo } from 'react';
import { format, getDay, addDays, isAfter } from 'date-fns';
import { calendarEventsData } from '../data/calendarEvents';

// Cleaner, more modern solid-style icons
const MapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-kiosk-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1m1 2v5h5V5h-5m7 0v5h5V5h-5m-7 7v5h5v-5h-5m7 0v5h5v-5h-5Z"/></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-kiosk-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M19 19H5V8h14m-3-7v2H8V1H6v2H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-1V1m-1 11h-5v5h5v-5Z"/></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-kiosk-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.57 4.23l.27.28v.79l5 4.99L20.49 19l-4.99-5v-.79l-.27-.28A6.516 6.516 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5Z"/></svg>;


// More compact feature card with enhanced hover effect
const FeatureCard: React.FC<{icon: React.ReactElement; title: string; description: string}> = ({ icon, title, description }) => (
    <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl text-center border border-white/30 shadow-xl transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2">
        <div className="inline-block p-4 bg-kiosk-primary/10 rounded-2xl mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-kiosk-text-title mb-1">{title}</h3>
        <p className="text-kiosk-text-body text-base leading-relaxed">{description}</p>
    </div>
);

interface KioskWelcomeScreenProps {
  onEnter: () => void;
  now: Date;
}

const getDynamicContent = (now: Date) => {
    const dayOfWeek = getDay(now); // Sunday = 0, Saturday = 6

    const greeting = "Future Leaders";

    const nextWeek = addDays(now, 7);
    const upcomingEvent = calendarEventsData.find(event => {
        const eventStart = new Date(event.start);
        return isAfter(eventStart, now) && isAfter(nextWeek, eventStart);
    });

    let subheading = "Your daily guide to excellence at NAVA Academy.";
    if (upcomingEvent) {
        subheading = `Heads up: ${upcomingEvent.event} begins on ${format(new Date(upcomingEvent.start), 'MMMM d')}.`;
    } else if (dayOfWeek === 0) { // Sunday
        subheading = "A new week of innovation begins. Let's make it count.";
    } else if (dayOfWeek === 4) { // Thursday
        subheading = "Finish the week strong. Your dedication is shaping the future.";
    }

    return { greeting, subheading };
};

const KioskWelcomeScreen: React.FC<KioskWelcomeScreenProps> = ({ onEnter, now }) => {
    const { greeting, subheading } = useMemo(() => getDynamicContent(now), [now]);

    return (
        <div className="w-full h-full flex flex-col p-4 md:p-8 kiosk-welcome-bg overflow-hidden">
            <div className="w-full max-w-7xl m-auto text-center animate-fade-in">
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-kiosk-primary tracking-tighter drop-shadow-md">{greeting}</h1>
                <p className="text-lg sm:text-xl lg:text-2xl font-medium text-kiosk-text-body mt-4 max-w-3xl mx-auto leading-relaxed tracking-wide">{subheading}</p>

                <div className="grid md:grid-cols-3 gap-10 my-16 text-wrap-balance">
                    <FeatureCard 
                        icon={<MapIcon />}
                        title="Live Floor Plans"
                        description="Instantly view live floor plans to locate your next session."
                    />
                    <FeatureCard 
                        icon={<CalendarIcon />}
                        title="Daily Schedules"
                        description="Check your group's daily schedule and stay on track."
                    />
                    <FeatureCard 
                        icon={<SearchIcon />}
                        title="Trainee Information"
                        description="Quickly search for trainee details when needed."
                    />
                </div>

                <button 
                    onClick={onEnter} 
                    className="bg-kiosk-primary text-white font-bold text-xl px-16 py-4 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:brightness-110"
                >
                    Start Your Day
                </button>

                <p className="text-sm text-kiosk-text-muted mt-10 italic max-w-2xl mx-auto">
                    We are continuously enhancing this platform to better serve you. Your experience is our blueprint for future improvements.
                </p>
            </div>
        </div>
    );
};

export default KioskWelcomeScreen;