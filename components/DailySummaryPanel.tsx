import React, { useState, useEffect } from 'react';
import type { useLiveStatus } from '../hooks/useLiveStatus';
import type { Assignment, GroupInfo } from '../types';

// Icons
// FIX: Update icon components to be React.FC that accept a className prop.
const ClassroomIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3.5a1 1 0 00.028 1.84l7 3.5a1 1 0 00.764 0l7-3.5a1 1 0 00.028-1.84l-7-3.5z" /><path d="M3 9.332V14a1 1 0 00.553.894l6 3a1 1 0 00.894 0l6-3A1 1 0 0017 14v-4.668-2.45l-7 3.5-7-3.5v2.45z" /></svg>;
const LabIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.5 3a.5.5 0 00-.5.5v2.5a.5.5 0 00.5.5h.5a.5.5 0 00.5-.5V5.5a.5.5 0 00-.5-.5h-.5z" clipRule="evenodd" /></svg>;
const WorkshopIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.972.03 2.287-.948 2.287-1.56.38-1.56 2.6 0 2.98.978.238 1.488 1.559.948 2.286-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.948c.38 1.56 2.6 1.56 2.98 0a1.532 1.532 0 012.287-.948c1.372.836 2.942-.734-2.106-2.106a1.532 1.532 0 01.948-2.287c1.56-.38 1.56-2.6 0-2.98a1.532 1.532 0 01-.948-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.948zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;
const ObjectiveIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" /></svg>;


const StatCard: React.FC<{ icon: React.ReactElement, value: string | number, label: string, color: string }> = ({ icon, value, label, color }) => (
    <div className="flex items-center gap-4 p-3 bg-white rounded-xl">
        <div className={`p-3 rounded-lg ${color}`}>
            {/* FIX: Add generic type to React.cloneElement to specify the props for the icon component, resolving the type error. */}
            {React.cloneElement<React.SVGProps<SVGSVGElement>>(icon, { className: "h-6 w-6 text-white" })}
        </div>
        <div>
            <p className="font-montserrat font-bold text-2xl text-text-primary">{value}</p>
            <p className="text-sm font-semibold text-text-muted">{label}</p>
        </div>
    </div>
);

interface TodaysBriefingPanelProps {
    liveStatusData: ReturnType<typeof useLiveStatus>;
    dailyAssignments: Assignment[];
    groupInfo: GroupInfo;
    language: 'en' | 'ar';
}

const DailySummaryPanel: React.FC<TodaysBriefingPanelProps> = ({ liveStatusData, dailyAssignments, groupInfo, language }) => {
    const { overallStatus, liveClasses, currentPeriod } = liveStatusData;

    const { industrialTopics, serviceTopics } = React.useMemo(() => {
        const industrial = new Set<string>();
        const service = new Set<string>();
        dailyAssignments.forEach(a => {
            const track = groupInfo[a.group]?.track_name;
            if (track === 'Industrial Tech') industrial.add(a.topic);
            else if (track === 'Service Tech') service.add(a.topic);
        });
        return { industrialTopics: Array.from(industrial), serviceTopics: Array.from(service) };
    }, [dailyAssignments, groupInfo]);

    const locationCounts = React.useMemo(() => {
        const counts = { classroom: 0, lab: 0, workshop: 0 };
        liveClasses.forEach(c => {
            if (c.classroom.startsWith('2.') || c.classroom.startsWith('3.')) counts.classroom++;
            else if (c.classroom.startsWith('1.')) counts.lab++;
            else if (c.classroom.startsWith('WS-') || c.classroom.startsWith('0.')) counts.workshop++;
        });
        return counts;
    }, [liveClasses]);
    
    return (
        <div className="bg-nava-neutral rounded-xl shadow-lg flex flex-col p-4 h-full min-h-0">
            <h2 className="text-2xl font-montserrat font-semibold text-text-primary mb-4 flex-shrink-0">Today's Briefing</h2>
            <div className="flex-grow overflow-y-auto -mr-2 pr-2 space-y-5">
                <div className="p-4 bg-white rounded-xl">
                    <p className="text-sm font-semibold text-text-muted mb-1">Current Status</p>
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-nava-green">{overallStatus}</p>
                        {overallStatus === 'In Class' && <span className="px-2 py-0.5 text-xs font-bold text-white rounded-full bg-nava-red animate-pulse">LIVE</span>}
                    </div>
                    {currentPeriod && <p className="text-xs text-text-muted font-semibold">{currentPeriod.name}</p>}
                </div>

                <div className="space-y-3">
                    <StatCard icon={<ClassroomIcon />} value={locationCounts.classroom} label="Groups in Classrooms" color="bg-nava-green" />
                    <StatCard icon={<LabIcon />} value={locationCounts.lab} label="Groups in Labs" color="bg-purple-500" />
                    <StatCard icon={<WorkshopIcon />} value={locationCounts.workshop} label="Groups in Workshops" color="bg-amber-600" />
                </div>
                
                <div>
                    <h3 className="font-montserrat font-semibold text-text-primary mb-3 text-lg">Today's Learning Objectives</h3>
                    <div className="space-y-4">
                        {industrialTopics.length > 0 && (
                            <div className="text-sm">
                                <h4 className="font-bold text-nava-blue mb-2">Industrial Track</h4>
                                <ul className="space-y-1.5 text-text-secondary">
                                    {/* FIX: Pass className to ObjectiveIcon */}
                                    {industrialTopics.map(topic => <li key={topic} className="flex items-start gap-2"><ObjectiveIcon className="h-4 w-4 text-slate-500" />{topic}</li>)}
                                </ul>
                            </div>
                        )}
                        {serviceTopics.length > 0 && (
                             <div className="text-sm">
                                <h4 className="font-bold text-nava-red mb-2">Service Track</h4>
                                <ul className="space-y-1.5 text-text-secondary">
                                    {/* FIX: Pass className to ObjectiveIcon */}
                                    {serviceTopics.map(topic => <li key={topic} className="flex items-start gap-2"><ObjectiveIcon className="h-4 w-4 text-slate-500" />{topic}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailySummaryPanel;