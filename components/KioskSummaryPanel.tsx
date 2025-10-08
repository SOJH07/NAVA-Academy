import React, { useMemo } from 'react';
import type { LiveClass, GroupInfo, DailyPeriod } from '../types';

const TheoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3.5a1 1 0 00.028 1.84l7 3.5a1 1 0 00.764 0l7-3.5a1 1 0 00.028-1.84l-7-3.5z" /><path d="M3 9.332V14a1 1 0 00.553.894l6 3a1 1 0 00.894 0l6-3A1 1 0 0017 14v-4.668-2.45l-7 3.5-7-3.5v2.45z" /></svg>;
const PracticalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.972.03 2.287-.948 2.287-1.56.38-1.56 2.6 0 2.98.978.238 1.488 1.559.948 2.286-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.948c.38 1.56 2.6 1.56 2.98 0a1.532 1.532 0 012.287-.948c1.372.836 2.942-.734-2.106-2.106a1.532 1.532 0 01.948-2.287c1.56-.38 1.56-2.6 0-2.98a1.532 1.532 0 01-.948-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.948zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;

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
            className={`w-full rounded-xl text-left transition-all duration-200 flex items-stretch border bg-white shadow-sm hover:shadow-md ${isSelected ? `border-2 ${selectedTheme.selectedBorder}` : 'border-slate-200'}`}
        >
            <div className={`w-2/5 flex items-center justify-center p-2 font-extrabold text-lg border-r border-slate-200 ${selectedTheme.text}`}>
                {liveInfo.group}
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

interface KioskSummaryPanelProps {
  liveClasses: LiveClass[];
  groupInfo: GroupInfo;
  onGroupClick: (group: string) => void;
  selectedGroup: string | null;
  language: 'en' | 'ar';
  allGroups: string[];
  overallStatus: string;
}

const KioskSummaryPanel: React.FC<KioskSummaryPanelProps> = ({ liveClasses, groupInfo, onGroupClick, selectedGroup, language, allGroups, overallStatus }) => {
    const isBreak = overallStatus.toLowerCase().includes('break');

    const { industrial, service } = useMemo(() => {
        const industrial: { theory: LiveClass[], practical: LiveClass[] } = { theory: [], practical: [] };
        const service: { theory: LiveClass[], practical: LiveClass[] } = { theory: [], practical: [] };

        for (const liveClass of liveClasses) {
            const track = groupInfo[liveClass.group]?.track_name;
            const target = track === 'Industrial Tech' ? industrial : service;
            const isPractical = liveClass.sessionType === 'practical';
            
            if (isPractical) {
                target.practical.push(liveClass);
            } else { // Theory or Assessment
                target.theory.push(liveClass);
            }
        }
        
        industrial.theory.sort((a,b) => a.group.localeCompare(b.group));
        industrial.practical.sort((a,b) => a.group.localeCompare(b.group));
        service.theory.sort((a,b) => a.group.localeCompare(b.group));
        service.practical.sort((a,b) => a.group.localeCompare(b.group));

        return { industrial, service };
    }, [liveClasses, groupInfo]);

    const TrackSection: React.FC<{
        title: string;
        data: { theory: LiveClass[], practical: LiveClass[] };
        theme: 'blue' | 'red';
    }> = ({ title, data, theme }) => {
        const hasTheory = data.theory.length > 0;
        const hasPractical = data.practical.length > 0;

        if (!hasTheory && !hasPractical) return null;

        const titleColor = theme === 'blue' ? 'text-status-industrial' : 'text-status-tech';

        return (
            <div>
                <h3 className={`font-extrabold text-xl mb-3 ${titleColor}`}>{title}</h3>
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
        )
    };
    
    const BreakGroupList: React.FC = () => (
        <div>
             <h3 className="font-montserrat font-semibold text-lg mb-3 px-1 text-amber-600">
                {language === 'ar' ? 'جميع المجموعات في استراحة' : 'All Groups on Break'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {allGroups.map(group => (
                    <button 
                        key={group}
                        onClick={() => onGroupClick(group)}
                        className={`p-2 text-center rounded-lg text-sm font-bold transition-all ${selectedGroup === group ? 'bg-amber-500 text-white ring-2 ring-white' : 'bg-white shadow-sm hover:bg-amber-50'}`}
                    >
                        {group}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="bg-nava-neutral/80 backdrop-blur-sm rounded-xl shadow-lg flex flex-col p-4 h-full">
            <h2 className={`text-3xl font-extrabold font-montserrat text-kiosk-text-title mb-6 flex-shrink-0 px-1 ${language === 'ar' ? 'font-kufi' : ''}`}>
                {isBreak ? (language === 'ar' ? 'حالة المجموعات' : 'Group Status') : (language === 'ar' ? 'الجدول المباشر' : 'Live Schedule')}
            </h2>
            <div className="flex-grow overflow-y-auto -mr-2 pr-2 space-y-6">
                {isBreak ? (
                    <BreakGroupList />
                ) : (
                    <>
                        <TrackSection title={language === 'ar' ? 'فني صناعي' : 'Industrial Technician'} data={industrial} theme="blue" />
                        <TrackSection title={language === 'ar' ? 'فني خدمات' : 'Service Technician'} data={service} theme="red" />
                    </>
                )}
            </div>
        </div>
    );
};

export default KioskSummaryPanel;