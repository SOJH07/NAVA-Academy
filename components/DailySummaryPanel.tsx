import React from 'react';
import type { useLiveStatus } from '../hooks/useLiveStatus';
import type { Assignment, GroupInfo } from '../types';
import { format } from 'date-fns';

const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>;

const TheoryIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3.5a1 1 0 00.028 1.84l7 3.5a1 1 0 00.764 0l7-3.5a1 1 0 00.028-1.84l-7-3.5z" /><path d="M3 9.332V14a1 1 0 00.553.894l6 3a1 1 0 00.894 0l6-3A1 1 0 0017 14v-4.668-2.45l-7 3.5-7-3.5v2.45z" /></svg>;
const CircuitBoardIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.11-1.226.554-.22 1.197-.055 1.606.348.406.402.572 1.026.354 1.585l-1.42 2.128-2.13-1.42.34-1.407zM12 21a9 9 0 100-18 9 9 0 000 18z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" /></svg>;
const PracticalIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.972.03 2.287-.948 2.287-1.56.38-1.56 2.6 0 2.98.978.238 1.488 1.559.948 2.286-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.948c.38 1.56 2.6 1.56 2.98 0a1.532 1.532 0 012.287-.948c1.372.836 2.942-.734-2.106-2.106a1.532 1.532 0 01.948-2.287c1.56-.38 1.56-2.6 0-2.98a1.532 1.532 0 01-.948-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.948zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;


interface DailySummaryPanelProps {
    liveStatusData: ReturnType<typeof useLiveStatus>;
    dailyAssignments: Assignment[];
    groupInfo: GroupInfo;
    language: 'en' | 'ar';
}

const NewStatCard: React.FC<{ icon: React.ReactElement, value: string | number, label: string, color: 'blue' | 'purple' | 'orange', language: 'en' | 'ar' }> = ({ icon, value, label, color, language }) => {
    const colorClasses = {
        blue: { bg: 'bg-status-industrial-light dark:bg-status-industrial/20', text: 'text-status-industrial' },
        purple: { bg: 'bg-purple-100 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400' },
        orange: { bg: 'bg-orange-100 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400' },
    };
    const selectedColor = colorClasses[color];
    return (
        <div className="flex items-center gap-4 p-3 bg-kiosk-bg dark:bg-dark-panel rounded-lg">
            <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg ${selectedColor.bg}`}>
                {/* FIX: Explicitly cast the icon's props type to SVGProps to resolve the TypeScript error. */}
                {React.cloneElement<React.SVGProps<SVGSVGElement>>(icon, { className: `h-7 w-7 ${selectedColor.text}` })}
            </div>
            <div>
                <p className={`font-black text-3xl ${selectedColor.text}`}>{value}</p>
                <p className={`font-semibold text-sm text-kiosk-text-body dark:text-dark-text-secondary ${language === 'ar' ? 'font-kufi' : ''}`}>{label}</p>
            </div>
        </div>
    );
};

const DailySummaryPanel: React.FC<DailySummaryPanelProps> = ({ liveStatusData, dailyAssignments, groupInfo, language }) => {
    const { now, overallStatus, currentPeriod, liveClasses } = liveStatusData;

    const { industrialTopics, serviceTopics } = React.useMemo(() => {
        const industrial = new Set<string>();
        const service = new Set<string>();
        dailyAssignments.forEach(a => {
            const track = groupInfo[a.group]?.track_name;
            if (track === 'Industrial Tech') industrial.add(a.topic);
            else if (track === 'Service Tech') service.add(a.topic);
        });
        return {
            industrialTopics: Array.from(industrial).sort(),
            serviceTopics: Array.from(service).sort()
        };
    }, [dailyAssignments, groupInfo]);

    const locationCounts = React.useMemo(() => {
        const counts = { classroom: 0, lab: 0, workshop: 0, };
        liveClasses.forEach(c => {
            if (c.classroom.startsWith('2.') || c.classroom.startsWith('3.')) {
                counts.classroom++;
            } else if (c.classroom.startsWith('1.')) {
                counts.lab++;
            } else if (c.classroom.startsWith('WS-') || c.classroom.startsWith('0.')) {
                counts.workshop++;
            }
        });
        return counts;
    }, [liveClasses]);
    
    return (
        <div className="flex flex-col h-full animate-fade-in p-2">
            <header className="flex-shrink-0 mb-4">
                <h3 className={`text-2xl font-black text-kiosk-text-title ${language === 'ar' ? 'font-kufi' : ''}`}>{language === 'ar' ? 'موجز اليوم' : "Today's Briefing"}</h3>
                <p className={`font-semibold text-kiosk-text-muted ${language === 'ar' ? 'font-kufi' : ''}`}>{format(now, 'EEEE, MMMM d, yyyy')}</p>
            </header>

            <div className="space-y-4">
                <div className="p-4 bg-kiosk-bg rounded-lg">
                    <div className="flex items-center gap-3">
                        <ClockIcon />
                        <h4 className={`font-bold text-lg text-kiosk-text-title ${language === 'ar' ? 'font-kufi' : ''}`}>{language === 'ar' ? 'الحالة الحالية' : 'Current Status'}</h4>
                    </div>
                    <p className="font-bold text-2xl text-kiosk-primary mt-1">{overallStatus}</p>
                    {currentPeriod && <p className="text-sm text-kiosk-text-body">{currentPeriod.name} ({currentPeriod.start} - {currentPeriod.end})</p>}
                </div>

                <div className="space-y-2">
                    <NewStatCard icon={<TheoryIcon className="h-6 w-6" />} value={locationCounts.classroom} label={language === 'ar' ? 'مجموعات في الفصول' : "Groups in Classrooms"} color="blue" language={language} />
                    <NewStatCard icon={<CircuitBoardIcon className="h-6 w-6" />} value={locationCounts.lab} label={language === 'ar' ? 'مجموعات في المعامل' : "Groups in Labs"} color="purple" language={language} />
                    <NewStatCard icon={<PracticalIcon className="h-6 w-6"/>} value={locationCounts.workshop} label={language === 'ar' ? 'مجموعات في الورش' : "Groups in Workshops"} color="orange" language={language} />
                </div>
            </div>

            <div className="flex-grow mt-4 overflow-hidden flex flex-col">
                 <div className="flex items-center gap-3 mb-2 flex-shrink-0">
                    <ListIcon />
                    <h4 className={`font-bold text-lg text-kiosk-text-title ${language === 'ar' ? 'font-kufi' : ''}`}>{language === 'ar' ? 'أهداف التعلم اليومية' : "Today's Learning Objectives"}</h4>
                </div>
                <div className="overflow-y-auto space-y-4 pr-2">
                    {industrialTopics.length > 0 && (
                        <div>
                            <h5 className={`font-semibold text-status-industrial mb-1 ${language === 'ar' ? 'font-kufi' : ''}`}>{language === 'ar' ? 'المسار الصناعي' : 'Industrial Track'}</h5>
                            <ul className={`space-y-1 list-disc list-inside text-sm text-kiosk-text-body ${language === 'ar' ? 'font-kufi' : ''}`}>
                                {industrialTopics.map(topic => <li key={topic}>{topic}</li>)}
                            </ul>
                        </div>
                    )}
                    {serviceTopics.length > 0 && (
                        <div>
                             <h5 className={`font-semibold text-status-tech mb-1 ${language === 'ar' ? 'font-kufi' : ''}`}>{language === 'ar' ? 'مسار الخدمة' : 'Service Track'}</h5>
                            <ul className={`space-y-1 list-disc list-inside text-sm text-kiosk-text-body ${language === 'ar' ? 'font-kufi' : ''}`}>
                                {serviceTopics.map(topic => <li key={topic}>{topic}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DailySummaryPanel;