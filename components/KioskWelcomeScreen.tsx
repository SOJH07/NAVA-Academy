import React, { useMemo } from 'react';
import { format, getDay, addDays, isAfter } from 'date-fns';
import { calendarEventsData } from '../data/calendarEvents';

// Icons for feature cards
const MapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-.553-.894L15 2m-6 5l6-3m-6 5l6 3" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

// Feature Card component
const FeatureCard: React.FC<{icon: React.ReactElement; title: string; description: string}> = ({ icon, title, description }) => (
    <div className="bg-white/40 backdrop-blur-lg p-5 rounded-2xl text-center border border-white/60 shadow-lg">
        <div className="inline-block p-3 bg-white/50 rounded-xl mb-3">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
        <p className="text-text-secondary text-base">{description}</p>
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
        <div className="w-full h-full flex flex-col p-4 md:p-8 kiosk-welcome-bg overflow-y-auto">
            <div className="w-full max-w-5xl m-auto text-center animate-fade-in">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-text-primary tracking-tighter">{greeting}</h1>
                <p className="text-lg sm:text-xl lg:text-2xl font-medium text-text-secondary mt-3">{subheading}</p>

                <div className="grid md:grid-cols-3 gap-8 my-6 text-wrap-balance">
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
                    className="bg-brand-primary text-black font-bold text-xl px-12 py-4 rounded-xl shadow-lg hover:bg-brand-primary-dark transition-all duration-300 transform hover:scale-105 animate-glow"
                >
                    View Live Operations
                </button>

                <p className="text-sm text-text-muted mt-4 italic">
                    We are continuously enhancing this platform to better serve you. Your experience is our blueprint for future improvements.
                </p>
            </div>
        </div>
    );
};

export default KioskWelcomeScreen;