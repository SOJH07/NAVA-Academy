import React from 'react';

// Icons for feature cards
const MapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-.553-.894L15 2m-6 5l6-3m-6 5l6 3" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

// Feature Card component
const FeatureCard: React.FC<{icon: React.ReactElement; title: string; description: string}> = ({ icon, title, description }) => (
    <div className="bg-white/40 backdrop-blur-lg p-6 rounded-2xl text-center border border-white/60 shadow-lg">
        <div className="inline-block p-4 bg-white/50 rounded-xl mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
        <p className="text-text-secondary text-base">{description}</p>
    </div>
);


const KioskWelcomeScreen: React.FC<{ onEnter: () => void }> = ({ onEnter }) => {
  return (
    <div className="w-full h-full flex items-center justify-center p-8 kiosk-welcome-bg">
      <div className="w-full max-w-5xl mx-auto text-center animate-fade-in">
        <div className="inline-block mb-6 bg-white/50 backdrop-blur-sm p-4 rounded-2xl shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.25278C12 6.25278 15.0163 3 19.5 3C22.5 3 24 4.5 24 7.5C24 10.5 22.5 12 19.5 12C15.0163 12 12 8.74722 12 8.74722" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.25278C12 6.25278 8.98375 3 4.5 3C1.5 3 0 4.5 0 7.5C0 10.5 1.5 12 4.5 12C8.98375 12 12 8.74722 12 8.74722" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.74722V21" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21H16.5" />
            </svg>
        </div>
        
        <h1 className="text-6xl font-black text-text-primary tracking-tighter">Welcome, Future Leaders</h1>
        <p className="text-2xl font-medium text-text-secondary mt-2">Your daily guide to NAVA Academy.</p>

        <div className="grid md:grid-cols-3 gap-8 my-16 text-wrap-balance">
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

        <p className="text-sm text-text-muted mt-8 italic">
          We are continuously enhancing this platform to better serve you. Your experience is our blueprint for future improvements.
        </p>

      </div>
    </div>
  );
};

export default KioskWelcomeScreen;