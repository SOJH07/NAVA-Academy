import React from 'react';
import type { LiveStudent } from '../types';
import { dailyPeriodsData } from '../data/dailyPeriods';

// Icons
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>;

interface TraineeRosterCardProps {
    student: LiveStudent;
}

const TraineeRosterCard: React.FC<TraineeRosterCardProps> = ({ student }) => {
    const trackBorderColor = student.trackName === 'Industrial Tech' ? 'border-status-industrial' : 'border-status-tech';

    const currentPeriodDetails = dailyPeriodsData.find(p => p.name === student.currentPeriod);
    const timeRange = currentPeriodDetails ? `${currentPeriodDetails.start} - ${currentPeriodDetails.end}` : 'N/A';

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

    return (
        <div className={`bg-white rounded-xl shadow-md overflow-hidden flex flex-col justify-between border-t-4 ${trackBorderColor} p-3 transition-all duration-200 hover:shadow-lg hover:-translate-y-1`}>
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
};

export default TraineeRosterCard;