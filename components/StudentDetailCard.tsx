import React, { useState } from 'react';
import type { LiveStudent } from '../types';
import useAppStore from '../hooks/useAppStore';

const CircuitBoardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.11-1.226.554-.22 1.197-.055 1.606.348.406.402.572 1.026.354 1.585l-1.42 2.128-2.13-1.42.34-1.407zM12 21a9 9 0 100-18 9 9 0 000 18z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
  </svg>
);
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 7.973.697.176.032.35.178.465.337L22.5 6.001c.115.158.176.354.176.55V8.65c0 .223-.07.435-.194.622l-6.236 9.354a.67.67 0 01-.521.274H8.275a.67.67 0 01-.521-.274L1.52 9.272a.67.67 0 01-.194-.622V6.551c0-.196.06-.392.176-.55L3.562 4.034a.67.67 0 01.465-.337A48.623 48.623 0 0112 3z" /></svg>;

const InClassIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-primary flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-label="In Class" role="img">
    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
  </svg>
);

const OnBreakIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-status-break flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-label="On Break" role="img">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v1h-2V4a1 1 0 011-1zm5 2a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-2a.5.5 0 01.5.5h1zM4 5a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V6a1 1 0 00-1-1H4z" clipRule="evenodd" />
    <path d="M5 18a1 1 0 011-1h6a1 1 0 110 2H6a1 1 0 01-1-1z" />
  </svg>
);


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
    switch(student.status) {
        case 'In Class':
            statusPill = <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-brand-primary text-black shadow-sm">{student.location}</span>;
            break;
        case 'Break':
            statusPill = <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-status-break-light text-status-break">{student.status}</span>;
            break;
        case 'Finished':
             statusPill = <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-status-out-of-service-light text-status-out-of-service">{student.status}</span>;
            break;
        case 'Upcoming':
            statusPill = <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-status-upcoming-light text-status-upcoming">{student.status}</span>;
            break;
        default:
            statusPill = <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-200 text-slate-800">{student.status}</span>;
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
        // Optionally, could also switch to a relevant page
        // setActivePage('liveOps'); 
    };

    let statusIndicator = null;
    let borderColorClass = 'border-slate-200 dark:border-dark-border';
    let cardBgClass = 'bg-bg-panel dark:bg-dark-panel';

    if (isKiosk && student.status === 'In Class' && sessionType) {
        if (sessionType === 'industrial') cardBgClass = 'bg-status-industrial-light dark:bg-status-industrial/20';
        if (sessionType === 'service') cardBgClass = 'bg-status-tech-light dark:bg-status-tech/20';
        if (sessionType === 'professional') cardBgClass = 'bg-status-professional-light dark:bg-status-professional/20';
    }

    if (student.status === 'In Class') {
        statusIndicator = <InClassIcon />;
        borderColorClass = 'border-brand-primary dark:border-brand-primary';
    } else if (student.status === 'Break') {
        statusIndicator = <OnBreakIcon />;
        borderColorClass = 'border-status-break dark:border-status-break';
    }

    return (
        <div 
            onMouseEnter={isKiosk ? undefined : () => setIsHovered(true)}
            onMouseLeave={isKiosk ? undefined : () => setIsHovered(false)}
            className={`relative ${cardBgClass} text-text-primary border ${borderColorClass} rounded-xl shadow-md p-4 flex flex-col justify-between transition-all duration-300 ${!isKiosk ? 'hover:shadow-glow-sm hover:border-brand-primary' : ''} overflow-hidden ${isDimmed ? 'opacity-40' : 'opacity-100'}`}
        >
             {isHovered && !isKiosk && (
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
            {!isKiosk && <div className={`absolute left-0 top-0 bottom-0 w-2 ${companyColor}`}></div>}
            <div className={!isKiosk ? "pl-4" : ""}>
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <div className="flex items-center gap-2">
                            {statusIndicator}
                             {isKiosk ? (
                                <h3 className="font-bold text-xl leading-tight text-text-primary dark:text-dark-text-primary">ID: {student.navaId}</h3>
                            ) : (
                                <h3 className="font-bold text-lg leading-tight text-text-primary dark:text-dark-text-primary">{student.fullName}</h3>
                            )}
                        </div>
                         {!isKiosk && (
                            <p className="text-xs text-text-muted dark:text-dark-text-muted">ID: {student.navaId} | {student.company}</p>
                        )}
                    </div>
                    {statusPill}
                </div>

                <div className="grid grid-cols-1 gap-4 text-sm mt-4">
                    {/* Technical Column */}
                    <div>
                        <div className="flex items-center gap-2 mb-2 font-semibold text-text-secondary dark:text-dark-text-secondary">
                            <CircuitBoardIcon/>
                            <span>Technical Program</span>
                        </div>
                        <div className="space-y-1 pl-1 text-xs text-text-muted dark:text-dark-text-muted">
                            <p><strong className="font-medium text-text-secondary dark:text-dark-text-primary w-20 inline-block">Track:</strong> {student.trackName}</p>
                            <p><strong className="font-medium text-text-secondary dark:text-dark-text-primary w-20 inline-block">Group:</strong> {student.techGroup}</p>
                             {!isKiosk && student.aptisScores && (
                                <>
                                 <p className="mt-2 pt-2 border-t border-slate-200/60 dark:border-dark-border">
                                     <strong className="font-medium text-text-secondary dark:text-dark-text-primary w-20 inline-block">Aptis CEFR:</strong> 
                                     <span className={`px-1.5 py-0.5 rounded font-bold ${cefrColorClass}`}>{cefr}</span>
                                     <span className="ml-2 font-semibold text-text-primary dark:text-dark-text-primary">{student.aptisScores.overall.score}</span>
                                 </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetailCard;