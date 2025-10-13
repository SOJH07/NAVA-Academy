import React, { useMemo } from 'react';
import UpcomingEvents from '../components/UpcomingEvents';
import { pacingScheduleData } from '../data/pacingSchedule';
import { format, isFuture, parse } from 'date-fns';

const parseLegacyDate = (dateStr: string) => {
    // This handles dates like '6-Oct-24'
    const parts = dateStr.split('-');
    if (parts.length !== 3) return new Date('invalid');
    const year = parseInt(parts[2], 10);
    const fullYear = year < 50 ? 2000 + year : 1900 + year; // Assumes years > 50 are 19xx
    return parse(`${parts[0]}-${parts[1]}-${fullYear}`, 'd-MMM-yyyy', new Date());
};


interface Assessment {
    group: string;
    unitName: string;
    type: string;
    date: Date;
    dateString: string;
}

const PerformanceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const UpcomingAssessments: React.FC = () => {
    const upcomingAssessments = useMemo(() => {
        const assessments: Assessment[] = [];
        const now = new Date();

        pacingScheduleData.forEach(event => {
            if (event.assessments) {
                Object.entries(event.assessments).forEach(([type, dateStr]) => {
                    if (dateStr) {
                        const date = parseLegacyDate(dateStr);
                        if (!isNaN(date.getTime()) && isFuture(date)) {
                            assessments.push({
                                group: event.group,
                                unitName: event.unitName.replace('(Unit Assessment)', '').trim(),
                                type,
                                date,
                                dateString: format(date, 'yyyy-MM-dd'),
                            });
                        }
                    }
                });
            }
        });

        assessments.sort((a, b) => a.date.getTime() - b.date.getTime());

        const groupedByDate: { [key: string]: Assessment[] } = {};
        // Get a reasonable number of assessments, not all of them
        assessments.slice(0, 6).forEach(asm => {
            if (!groupedByDate[asm.dateString]) {
                groupedByDate[asm.dateString] = [];
            }
            groupedByDate[asm.dateString].push(asm);
        });

        return Object.entries(groupedByDate).map(([dateString, assessments]) => ({
            date: assessments[0].date,
            assessments,
        }));
    }, []);

    return (
        <div className="rounded-xl shadow-lg overflow-hidden font-sans">
            <h2 className="bg-[#0A2A66] text-white text-center font-bold py-3 uppercase tracking-wider text-sm">
                Upcoming Assessments
            </h2>
            <div className="bg-white p-4 space-y-4 max-h-[400px] overflow-y-auto">
                {upcomingAssessments.length > 0 ? (
                    upcomingAssessments.map(group => (
                        <div key={group.date.toString()}>
                            <h3 className="text-center font-semibold text-text-muted mb-2 text-sm">{format(group.date, 'EEEE, MMM d')}</h3>
                            <div className="space-y-2">
                                {group.assessments.map((asm, index) => (
                                    <div key={index} className="bg-slate-100 p-3 rounded-lg flex items-center justify-between border-l-4 border-[#2563EB]">
                                        <div>
                                            <p className="font-bold text-[#2563EB] text-base">{asm.group}</p>
                                            <p className="text-sm font-medium text-text-primary">{asm.unitName}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm font-semibold text-[#2563EB]">
                                            <PerformanceIcon />
                                            <span>Performance</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-text-muted text-center py-8">No upcoming assessments scheduled.</p>
                )}
            </div>
        </div>
    );
};


const AdminDashboard: React.FC<{onLogout: () => void}> = ({ onLogout }) => {
    return (
        <div className="h-screen w-screen flex items-center justify-center bg-slate-100 p-4 sm:p-8">
            <div className="w-full max-w-sm space-y-8">
                <UpcomingEvents />
                <UpcomingAssessments />
            </div>
        </div>
    );
};

export default AdminDashboard;
