import React, { useMemo } from 'react';
import type { LiveClass, GroupInfo } from '../types';

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
        blue: { text: 'text-status-industrial', selectedRing: 'ring-status-industrial', unitBg: 'bg-status-industrial-light' },
        red: { text: 'text-status-tech', selectedRing: 'ring-status-tech', unitBg: 'bg-status-tech-light' }
    };
    const selectedTheme = themeClasses[theme];
    const classroom = liveInfo.classroom.startsWith('WS-') ? liveInfo.classroom.replace('WS-0.', 'WS-') : `C-${liveInfo.classroom.replace('.', '')}`;
    const shortTopic = getShortTopic(liveInfo.topic);

    return (
        <button
            onClick={onClick}
            className={`rounded-xl transition-all duration-200 flex items-stretch border bg-white shadow-sm hover:bg-slate-50 ${isSelected ? `ring-2 ${selectedTheme.selectedRing}` : 'border-slate-200'}`}
        >
            <div className={`w-1/3 flex items-center justify-center p-2 font-extrabold text-2xl border-r border-slate-200 ${selectedTheme.text}`}>
                {liveInfo.group.split('-')[1]}
            </div>
            <div className="w-2/3 flex-grow p-2 text-xs flex flex-col justify-center">
                <div className="flex justify-between items-center">
                    <span className="text-kiosk-text-muted font-semibold">{classroom}</span>
                    <span className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${selectedTheme.unitBg} ${selectedTheme.text}`}>{shortTopic}</span>
                </div>
                <p className="text-kiosk-text-title font-semibold truncate mt-1">{liveInfo.instructors.join(', ')}</p>
            </div>
        </button>
    );
};

const InactiveGroupCard: React.FC<{ groupName: string; onClick: () => void; isSelected: boolean; theme: 'blue' | 'red'; language: 'en' | 'ar' }> = ({ groupName, onClick, isSelected, theme, language }) => {
    const themeClasses = theme === 'blue'
        ? { text: 'text-slate-400', border: 'border-slate-200', selectedRing: 'ring-status-industrial' }
        : { text: 'text-slate-400', border: 'border-slate-200', selectedRing: 'ring-status-tech' };

    return (
        <button
            onClick={onClick}
            className={`rounded-xl transition-all duration-200 flex items-stretch border bg-slate-50/70 shadow-sm hover:bg-slate-100 ${isSelected ? `ring-2 ${themeClasses.selectedRing}` : themeClasses.border}`}
        >
            <div className={`w-1/3 flex items-center justify-center p-2 font-extrabold text-2xl border-r border-slate-200 ${themeClasses.text}`}>
                {groupName.split('-')[1]}
            </div>
            <div className="w-2/3 flex-grow p-2 text-xs flex flex-col justify-center items-center text-slate-500 font-semibold italic">
                {language === 'ar' ? 'لا توجد جلسة نشطة' : 'No active session'}
            </div>
        </button>
    );
};

const TrackSection: React.FC<{
    title: string;
    icon: React.ReactElement;
    iconBgClass: string;
    groupPrefix: string;
    groups: string[];
    liveClassMap: Map<string, LiveClass>;
    theme: 'blue' | 'red';
    onGroupClick: (group: string) => void;
    selectedGroup: string | null;
    language: 'en' | 'ar';
}> = ({ title, icon, iconBgClass, groupPrefix, groups, liveClassMap, theme, onGroupClick, selectedGroup, language }) => {
    
    const { theory, practical, inactive } = useMemo(() => {
        const theory: LiveClass[] = [];
        const practical: LiveClass[] = [];
        const inactive: string[] = [];

        for (const group of groups) {
            const liveInfo = liveClassMap.get(group);
            if (liveInfo) {
                if (liveInfo.sessionType === 'practical') practical.push(liveInfo);
                else theory.push(liveInfo);
            } else {
                inactive.push(group);
            }
        }
        return { theory, practical, inactive };
    }, [groups, liveClassMap]);

    if (groups.length === 0) return null;
    
    const iconColorClass = theme === 'blue' ? 'text-status-industrial' : 'text-status-tech';

    return (
        <div>
            <div className="flex items-center gap-3 mb-2">
                <div className={`${iconBgClass} p-2 rounded-lg`}>
                    {React.cloneElement(icon, { className: iconColorClass })}
                </div>
                 <div className="flex items-baseline gap-2">
                    <h3 className="font-bold text-lg text-kiosk-text-title">{title}</h3>
                    <span className={`font-bold text-base ${iconColorClass}`}>{groupPrefix}</span>
                </div>
            </div>
            
            {theory.length > 0 && (
                <div className="mt-2">
                    <div className="flex items-center gap-2 text-sm font-bold uppercase text-kiosk-text-muted mb-2 px-1"><TheoryIcon /> Theory</div>
                    <div className="grid grid-cols-2 gap-2">
                        {theory.map(lc => <GroupCard key={lc.group} liveInfo={lc} onClick={() => onGroupClick(lc.group)} isSelected={selectedGroup === lc.group} theme={theme}/>)}
                    </div>
                </div>
            )}
            
            {practical.length > 0 && (
                <div className="mt-4">
                    <div className="flex items-center gap-2 text-sm font-bold uppercase text-kiosk-text-muted mb-2 px-1"><PracticalIcon /> Practical</div>
                    <div className="grid grid-cols-2 gap-2">
                        {practical.map(lc => <GroupCard key={lc.group} liveInfo={lc} onClick={() => onGroupClick(lc.group)} isSelected={selectedGroup === lc.group} theme={theme}/>)}
                    </div>
                </div>
            )}
            
            {inactive.length > 0 && (
                <div className="mt-4">
                    <div className="text-sm font-bold uppercase text-kiosk-text-muted mb-2 px-1 opacity-60">{language === 'ar' ? 'غير نشط' : 'Inactive'}</div>
                    <div className="grid grid-cols-2 gap-2">
                        {inactive.map(group => <InactiveGroupCard key={group} groupName={group} onClick={() => onGroupClick(group)} isSelected={selectedGroup === group} theme={theme} language={language}/>)}
                    </div>
                </div>
            )}
        </div>
    );
};

interface KioskSummaryPanelProps {
  liveClasses: LiveClass[];
  allGroups: string[];
  groupInfo: GroupInfo;
  onGroupClick: (group: string) => void;
  selectedGroup: string | null;
  language: 'en' | 'ar';
}

const KioskSummaryPanel: React.FC<KioskSummaryPanelProps> = ({ liveClasses, allGroups, groupInfo, onGroupClick, selectedGroup, language }) => {

    const liveClassMap = useMemo(() => new Map(liveClasses.map(lc => [lc.group, lc])), [liveClasses]);
    
    const industrialGroups = useMemo(() => allGroups.filter(g => groupInfo[g]?.track_name === 'Industrial Tech').sort(), [allGroups, groupInfo]);
    const serviceGroups = useMemo(() => allGroups.filter(g => groupInfo[g]?.track_name === 'Service Tech').sort(), [allGroups, groupInfo]);

    const renderContent = () => {
        if (industrialGroups.length === 0 && serviceGroups.length === 0) {
            return (
                <div className="text-center text-kiosk-text-muted p-4 pt-16">
                    <p className="font-semibold">{language === 'ar' ? 'لا توجد فصول دراسية لهذا اليوم.' : 'No classes are scheduled for today.'}</p>
                </div>
            );
        }

        return (
            <>
                {industrialGroups.length > 0 && <TrackSection 
                    title={language === 'ar' ? 'فني صناعي' : 'Industrial Technician'}
                    icon={<IndustrialIcon />}
                    iconBgClass="bg-status-industrial-light"
                    groupPrefix="DPIT"
                    groups={industrialGroups} 
                    liveClassMap={liveClassMap}
                    theme="blue" 
                    onGroupClick={onGroupClick} 
                    selectedGroup={selectedGroup}
                    language={language}
                />}
                {serviceGroups.length > 0 && <TrackSection 
                    title={language === 'ar' ? 'فني خدمات' : 'Service Technician'}
                    icon={<ServiceIcon />}
                    iconBgClass="bg-status-tech-light"
                    groupPrefix="DPST"
                    groups={serviceGroups}
                    liveClassMap={liveClassMap}
                    theme="red" 
                    onGroupClick={onGroupClick} 
                    selectedGroup={selectedGroup}
                    language={language}
                />}
            </>
        );
    };

    return (
        <div className="bg-kiosk-panel rounded-xl shadow-xl flex flex-col h-full min-h-0">
            <div className="flex items-center gap-3 p-4 rounded-t-xl bg-brand-primary-light flex-shrink-0 border-b border-slate-200">
                <div className="bg-brand-primary/20 p-2 rounded-lg">
                    <ScheduleIcon className="h-6 w-6 text-text-primary" />
                </div>
                <h2 className={`font-bold text-lg text-text-primary`}>
                    {language === 'ar' ? 'الجدول المباشر' : 'Live Schedule'}
                </h2>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-8">
                {renderContent()}
            </div>
        </div>
    );
};

export default KioskSummaryPanel;