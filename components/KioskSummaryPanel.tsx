import React, { useMemo } from 'react';
import type { LiveClass, GroupInfo, Assignment } from '../types';

const TheoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3.5a1 1 0 00.028 1.84l7 3.5a1 1 0 00.764 0l7-3.5a1 1 0 00.028-1.84l-7-3.5z" /><path d="M3 9.332V14a1 1 0 00.553.894l6 3a1 1 0 00.894 0l6-3A1 1 0 0017 14v-4.668-2.45l-7 3.5-7-3.5v2.45z" /></svg>;
const PracticalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.972.03 2.287-.948 2.287-1.56.38-1.56 2.6 0 2.98.978.238 1.488 1.559.948 2.286-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.948c.38 1.56 2.6 1.56 2.98 0a1.532 1.532 0 012.287-.948c1.372.836 2.942-.734-2.106-2.106a1.532 1.532 0 01.948-2.287c1.56-.38 1.56-2.6 0-2.98a1.532 1.532 0 01-.948-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.948zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;

const IndustrialIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V8.25a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 8.25v7.5a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>;
const ServiceIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.83-5.83M11.42 15.17A3 3 0 017.25 21m4.17-5.83c.02-.02.04-.04.06-.06a3 3 0 00-5.83 4.17M11.42 15.17c-.02.02-.04.04-.06.06m0 0a3 3 0 01-5.83 4.17M12.75 3.75l-4.125 4.125a3 3 0 00-4.17 5.83l-1.48 1.48a.75.75 0 000 1.06l6.125 6.125a.75.75 0 001.06 0l1.48-1.48a3 3 0 005.83-4.17l4.125-4.125a.75.75 0 00-1.06-1.06Z" /></svg>;
const ScheduleIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const getShortTopic = (topic: string) => {
    const match = topic.match(/^(U\d+|Unit-\d+|NAVA\s?\d+)/i);
    if (match) {
        return match[0].replace('Unit-', 'U').replace(/\s/g, '').toUpperCase();
    }
    return topic.split(' ')[0]; // fallback to first word
};

const GroupCard: React.FC<{
  liveInfo: LiveClass;
  onClick: () => void;
  isSelected: boolean;
  theme: 'blue' | 'red';
}> = ({ liveInfo, onClick, isSelected, theme }) => {
    
    const themeClasses = {
        blue: { text: 'text-status-industrial', selectedBorder: 'border-status-industrial', unitBg: 'bg-status-industrial-light' },
        red: { text: 'text-status-tech', selectedBorder: 'border-status-tech', unitBg: 'bg-status-tech-light' }
    };
    const selectedTheme = themeClasses[theme];
    const classroom = liveInfo.classroom.startsWith('WS-') ? liveInfo.classroom.replace('WS-0.', 'WS-') : `C-${liveInfo.classroom.replace('.', '')}`;
    const shortTopic = getShortTopic(liveInfo.topic);

    return (
        <button
            onClick={onClick}
            className={`w-full rounded-xl transition-all duration-200 flex items-stretch border bg-white shadow-sm hover:bg-slate-50 ${isSelected ? `ring-2 ${selectedTheme.selectedBorder}` : 'border-slate-200'}`}
        >
            <div className={`w-2/5 flex flex-col items-center justify-center p-2 font-extrabold text-lg border-r border-slate-200 ${selectedTheme.text}`}>
                {liveInfo.group.split('-')[0]}
                <span>{liveInfo.group.split('-')[1]}</span>
            </div>
            <div className="w-3/5 flex-grow p-2 text-xs flex flex-col justify-center">
                <div className="flex justify-between items-center">
                    <span className="text-kiosk-text-muted font-semibold">{classroom}</span>
                    <span className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${selectedTheme.unitBg} ${selectedTheme.text}`}>{shortTopic}</span>
                </div>
                <p className="text-kiosk-text-title font-semibold truncate mt-1">{liveInfo.instructors.join(', ')}</p>
            </div>
        </button>
    );
};

const TrackSection: React.FC<{
    title: string;
    icon: React.ReactElement;
    iconBgClass: string;
    data: { theory: LiveClass[], practical: LiveClass[] };
    theme: 'blue' | 'red';
    onGroupClick: (group: string) => void;
    selectedGroup: string | null;
}> = ({ title, icon, iconBgClass, data, theme, onGroupClick, selectedGroup }) => {
    const hasTheory = data.theory.length > 0;
    const hasPractical = data.practical.length > 0;

    if (!hasTheory && !hasPractical) return null;
    
    const iconColorClass = theme === 'blue' ? 'text-status-industrial' : 'text-status-tech';

    return (
        <div>
            <div className="flex items-center gap-3 mb-2">
                <div className={`${iconBgClass} p-2 rounded-lg`}>
                    {React.cloneElement(icon, { className: iconColorClass })}
                </div>
                <h3 className="font-bold text-lg text-kiosk-text-title">{title}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm font-bold uppercase text-kiosk-text-muted mb-2 px-1"><TheoryIcon /> Theory</div>
                    <div className="space-y-2">
                        {data.theory.map(lc => <GroupCard key={lc.group} liveInfo={lc} onClick={() => onGroupClick(lc.group)} isSelected={selectedGroup === lc.group} theme={theme}/>)}
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-2 text-sm font-bold uppercase text-kiosk-text-muted mb-2 px-1"><PracticalIcon /> Practical</div>
                    <div className="space-y-2">
                        {data.practical.map(lc => <GroupCard key={lc.group} liveInfo={lc} onClick={() => onGroupClick(lc.group)} isSelected={selectedGroup === lc.group} theme={theme}/>)}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface KioskSummaryPanelProps {
  liveClasses: LiveClass[];
  dailyAssignments: Assignment[];
  groupInfo: GroupInfo;
  onGroupClick: (group: string) => void;
  selectedGroup: string | null;
  language: 'en' | 'ar';
}

const KioskSummaryPanel: React.FC<KioskSummaryPanelProps> = ({ liveClasses, dailyAssignments, groupInfo, onGroupClick, selectedGroup, language }) => {

    const { industrial, service } = useMemo(() => {
        const industrial: { theory: LiveClass[], practical: LiveClass[] } = { theory: [], practical: [] };
        const service: { theory: LiveClass[], practical: LiveClass[] } = { theory: [], practical: [] };

        const sourceData = liveClasses.length > 0
            ? liveClasses // Use live data if available
            : dailyAssignments.map(assignment => { // Otherwise, create a summary from all day's assignments
                const trackName = groupInfo[assignment.group]?.track_name;
                const trackType = trackName === 'Industrial Tech' ? 'industrial' : 'service';
                const sessionType = assignment.classroom.startsWith('2.') || assignment.classroom.startsWith('3.') ? 'theory' : 'practical';
                return {
                    group: assignment.group,
                    trackType,
                    classroom: assignment.classroom,
                    instructors: assignment.instructors,
                    sessionType,
                    topic: assignment.topic
                };
            });

        // De-duplicate if we're using dailyAssignments as source, showing each group once
        const itemsToProcess = liveClasses.length > 0
            ? sourceData
            : Array.from(new Map(sourceData.map(item => [item.group, item])).values());
        
        for (const item of itemsToProcess) {
            const trackName = groupInfo[item.group]?.track_name;
            const target = trackName === 'Industrial Tech' ? 'industrial' : 'service';
            const isPractical = item.sessionType === 'practical';
            const liveClassItem = item as LiveClass;

            if (target === 'industrial') {
                if(isPractical) industrial.practical.push(liveClassItem);
                else industrial.theory.push(liveClassItem);
            } else {
                if(isPractical) service.practical.push(liveClassItem);
                else service.theory.push(liveClassItem);
            }
        }
        
        // Sort
        industrial.theory.sort((a,b) => a.group.localeCompare(b.group));
        industrial.practical.sort((a,b) => a.group.localeCompare(b.group));
        service.theory.sort((a,b) => a.group.localeCompare(b.group));
        service.practical.sort((a,b) => a.group.localeCompare(b.group));

        return { industrial, service };

    }, [liveClasses, dailyAssignments, groupInfo]);

    const renderContent = () => {
        const hasIndustrial = industrial.theory.length > 0 || industrial.practical.length > 0;
        const hasService = service.theory.length > 0 || service.practical.length > 0;

        if (!hasIndustrial && !hasService) {
            return (
                <div className="text-center text-kiosk-text-muted p-4 pt-16">
                    <p className="font-semibold">{language === 'ar' ? 'لا توجد فصول دراسية لهذا اليوم.' : 'No classes are scheduled for today.'}</p>
                </div>
            );
        }

        return (
            <>
                {hasIndustrial && <TrackSection 
                    title={language === 'ar' ? 'فني صناعي' : 'Industrial Technician'}
                    icon={<IndustrialIcon />}
                    iconBgClass="bg-status-industrial-light"
                    data={industrial} 
                    theme="blue" 
                    onGroupClick={onGroupClick} 
                    selectedGroup={selectedGroup}
                />}
                {hasService && <TrackSection 
                    title={language === 'ar' ? 'فني خدمات' : 'Service Technician'}
                    icon={<ServiceIcon />}
                    iconBgClass="bg-status-tech-light"
                    data={service} 
                    theme="red" 
                    onGroupClick={onGroupClick} 
                    selectedGroup={selectedGroup} 
                />}
            </>
        );
    };

    return (
        <div className="bg-kiosk-panel rounded-xl shadow-xl flex flex-col h-full min-h-0">
            <div className="flex items-center gap-3 p-4 rounded-t-xl bg-brand-primary-light flex-shrink-0">
                <div className="bg-brand-primary/20 p-2 rounded-lg">
                    <ScheduleIcon className="h-6 w-6 text-text-primary" />
                </div>
                <h2 className={`font-bold text-lg text-text-primary`}>
                    {language === 'ar' ? 'الجدول المباشر' : 'Live Schedule'}
                </h2>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default KioskSummaryPanel;