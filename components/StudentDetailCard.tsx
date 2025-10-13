import React, { useState } from 'react';
import type { LiveStudent } from '../types';
import useAppStore from '../hooks/useAppStore';
import { dailyPeriodsData } from '../data/dailyPeriods';

const CircuitBoardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.11-1.226.554-.22 1.197-.055 1.606.348.406.402.572 1.026.354 1.585l-1.42 2.128-2.13-1.42.34-1.407zM12 21a9 9 0 100-18 9 9 0 000 18z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
  </svg>
);
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 7.973.697.176.032.35.178.465.337L22.5 6.001c.115.158.176.354.176.55V8.65c0 .223-.07.435-.194.622l-6.236 9.354a.67.67 0 01-.521.274H8.275a.67.67 0 01-.521-.274L1.52 9.272a.67.67 0 01-.194-.622V6.551c0-.196.06-.392.176-.55L3.562 4.034a.67.67 0 01.465-.337A48.623 48.623 0 0112 3z" /></svg>;

const InClassIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-kiosk-primary flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-label="In Class" role="img">
    <path d="M10 2L1 6l9 4 9-4-9-4z"/>
    <path d="M2 7v7l8 4 8-4V7l-8 4-8-4z"/>
  </svg>
);

const OnBreakIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-status-break flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-label="On Break" role="img">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v1h-2V4a1 1 0 011-1zm5 2a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-2a.5.5 0 01.5.5h1zM4 5a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V6a1 1 0 00-1-1H4z" clipRule="evenodd" />
    <path d="M5 18a1 1 0 011-1h6a1 1 0 110 2H6a1 1 0 01-1-1z" />
  </svg>
);

const FinishedIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-status-out-of-service flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-label="Finished" role="img">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const UpcomingIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-status-upcoming flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-label="Upcoming" role="img">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
);

const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>;


interface StudentDetailCardProps {
    student: LiveStudent;
    isDimmed?: boolean;
    viewMode?: 'full' | 'kiosk';
    sessionType?: 'industrial' | 'service' | 'professional';
}

const StudentDetailCard: React.FC<StudentDetailCardProps> = ({ student, isDimmed, viewMode = 'full', sessionType }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { setActivePage, setGlobalSearchTerm, toggleArrayFilter } = useAppStore();

    const isKiosk = viewMode === 'kiosk';

    let statusPill;
    let location = student.location;
    let statusIconAndText;
    
    switch(student.status) {
        case 'In Class':
            statusIconAndText = <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div><span className="text-xs font-semibold text-green-700">In Class</span></div>;
            break;
        case 'Break':
            statusIconAndText = <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div><span className="text-xs font-semibold text-amber-700">On Break</span></div>;
            location = "On Break";
            break;
        case 'Finished':
             statusIconAndText = <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-400"></div><span className="text-xs font-semibold text-slate-500">Finished</span></div>;
            location = "N/A";
            break;
        case 'Upcoming':
            statusIconAndText = <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="text-xs font-semibold text-blue-700">Upcoming</span></div>;
            location = "Not Started";
            break;
        default:
            statusIconAndText = <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-400"></div><span className="text-xs font-semibold text-slate-500">{student.status}</span></div>;
            location = "N/A";
    }

    const companyColor = student.company === 'Ceer' ? 'bg-brand-ceer' : 'bg-brand-lucid';
    
    const cefr = student.aptisScores?.overall.cefr;
    let cefrColorClass = 'bg-slate-200 text-slate-800';
    if(cefr) {
        if (cefr.startsWith('A')) cefrColorClass = 'bg-red-100 text-red-800';
        else if (cefr.startsWith('B')) cefrColorClass = 'bg-blue-100 text-blue-800';
        else if (cefr.startsWith('C')) cefrColorClass = 'bg-green-100 text-green-800';
    }

    const handleViewProfile = () => {
        setGlobalSearchTerm(String(student.navaId));
        setActivePage('studentFinder');
    };

    const handleFilterGroup = () => {
        toggleArrayFilter('techGroups', student.techGroup);
    };

    let cardBgClass = 'bg-kiosk-panel';
    const trackBorderColor = student.trackName === 'Industrial Tech' ? 'border-status-industrial' : 'border-status-tech';
    const currentPeriodDetails = dailyPeriodsData.find(p => p.name === student.currentPeriod);
    const timeRange = currentPeriodDetails ? `${currentPeriodDetails.start} - ${currentPeriodDetails.end}` : 'N/A';

    if (isKiosk && student.status === 'In Class' && sessionType) {
        if (sessionType === 'industrial') cardBgClass = 'bg-status-industrial-light';
        if (sessionType === 'service') cardBgClass = 'bg-status-tech-light';
        if (sessionType === 'professional') cardBgClass = 'bg-status-professional-light';
    }
    
    if (isKiosk) {
        return (
            <div 
                className={`relative ${cardBgClass} text-kiosk-text-title border-t-4 ${trackBorderColor} rounded-xl shadow-md p-3 flex flex-col justify-between transition-all duration-300 ${isDimmed ? 'opacity-40' : 'opacity-100'} hover:shadow-lg hover:-translate-y-1`}
            >
                <div>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-extrabold text-2xl text-kiosk-text-title leading-tight">{student.navaId}</p>
                            <p className="text-sm font-semibold text-kiosk-text-muted">{student.techGroup}</p>
                        </div>
                        <div className="flex-shrink-0">
                            {statusIconAndText}
                        </div>
                    </div>
                </div>
                
                <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-text-secondary space-y-1">
                    <div className="flex items-center gap-1.5 truncate">
                        <MapPinIcon />
                        <span className="truncate" title={location}>{location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <ClockIcon />
                        <span>{timeRange}</span>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative bg-white text-kiosk-text-title border rounded-xl shadow-md p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-glow-sm hover:border-kiosk-primary overflow-hidden ${isDimmed ? 'opacity-40' : 'opacity-100'}`}
        >
             {isHovered && (
                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center gap-4 animate-fade-in z-10">
                    <button onClick={handleViewProfile} className="flex items-center gap-2 px-4 py-2 bg-white/90 text-slate-800 font-bold rounded-lg hover:bg-white transition-transform hover:scale-105">
                        <SearchIcon />
                        View Profile
                    </button>
                    <button onClick={handleFilterGroup} className="flex items-center gap-2 px-4 py-2 bg-white/90 text-slate-800 font-bold rounded-lg hover:bg-white transition-transform hover:scale-105">
                        <FilterIcon />
                        Filter Group
                    </button>
                </div>
            )}
            <div className={`absolute left-0 top-0 bottom-0 w-2 ${companyColor}`}></div>
            <div className="pl-4">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg leading-tight text-kiosk-text-title">{student.fullName}</h3>
                        </div>
                         <p className="text-xs text-kiosk-text-muted">ID: {student.navaId}</p>
                    </div>
                    {statusIconAndText}
                </div>

                <div className="mt-2 text-sm text-kiosk-text-muted border-t border-kiosk-border/50 pt-2">
                    <span className="font-semibold text-kiosk-text-body">{student.trackName}</span>
                    <span className="mx-1.5">&bull;</span>
                    <span>{student.techGroup}</span>
                </div>
            </div>
        </div>
    );
};

export default StudentDetailCard;