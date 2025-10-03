import React from 'react';
import type { LiveClass } from '../types';

// Icons
const UsersIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.67c.12-.14.237-.282.35-.428M3.11 16.032a9.337 9.337 0 017.497-4.908 9.337 9.337 0 017.497 4.908M12 12a4.5 4.5 0 00-4.5 4.5v.088c0 1.121.285 2.16.786 3.07M12 12a4.5 4.5 0 01-4.5 4.5v.088c0 1.121.285 2.16.786 3.07" /></svg>;
const TechIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826 3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ProfessionalIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" /></svg>;


interface SessionCardProps {
    icon: React.ReactNode;
    title: string;
    count: number;
    colorClasses: string;
}

const SessionCard: React.FC<SessionCardProps> = ({ icon, title, count, colorClasses }) => (
    <div className={`p-4 rounded-xl flex items-center gap-4 ${colorClasses}`}>
        {icon}
        <div>
            <p className="text-2xl font-black">{count}</p>
            <p className="text-sm font-semibold opacity-80">{title}</p>
        </div>
    </div>
);

interface KioskSummaryPanelProps {
  liveStudentsCount: number;
  totalStudents: number;
  sessionInfo: {
    industrial: number;
    service: number;
    professional: number;
  };
  liveClasses: LiveClass[];
}

const KioskSummaryPanel: React.FC<KioskSummaryPanelProps> = ({ liveStudentsCount, totalStudents, sessionInfo, liveClasses }) => {
    return (
        <div className="flex flex-col h-full gap-6 animate-fade-in">
            {/* Live Student Count */}
            <div className="bg-gradient-to-br from-brand-secondary to-brand-primary text-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4">
                    <UsersIcon className="h-10 w-10 opacity-80" />
                    <p className="text-xl font-bold">Live Students</p>
                </div>
                <p className="text-7xl font-black mt-2">{liveStudentsCount} <span className="text-3xl font-semibold opacity-80">/ {totalStudents}</span></p>
            </div>
            
            {/* Session Breakdown */}
            <div className="space-y-4">
                 <h3 className="text-xl font-bold text-text-primary px-1">Active Sessions</h3>
                 <div className="space-y-3">
                    <SessionCard 
                        icon={<TechIcon className="h-8 w-8"/>}
                        title="Industrial Technician"
                        count={sessionInfo.industrial}
                        colorClasses="bg-status-industrial-light text-status-industrial"
                    />
                     <SessionCard 
                        icon={<TechIcon className="h-8 w-8"/>}
                        title="Service Technician"
                        count={sessionInfo.service}
                        colorClasses="bg-status-tech-light text-status-tech"
                    />
                 </div>
            </div>

            {/* Occupied Classrooms */}
             {liveClasses.length > 0 && (
                <div className="flex-grow flex flex-col min-h-0">
                    <h3 className="text-xl font-bold text-text-primary px-1 mb-3 flex-shrink-0">Occupied Rooms</h3>
                    <div className="flex-grow overflow-y-auto space-y-2 pr-2 -mr-2">
                        {liveClasses.map(({ group, classroom, type }) => (
                            <div key={group} className="bg-slate-100 rounded-lg p-3 flex justify-between items-center text-sm">
                                <p className="font-bold text-text-primary">{classroom.startsWith('C-') || classroom.startsWith('WS-') ? classroom : `C-${classroom.replace('.', '')}`}</p>
                                <p className={`font-semibold px-2 py-0.5 rounded-full text-xs ${type === 'industrial' ? 'bg-status-industrial-light text-status-industrial' : (type === 'service' ? 'bg-status-tech-light text-status-tech' : 'bg-status-professional-light text-status-professional')}`}>{group}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default KioskSummaryPanel;