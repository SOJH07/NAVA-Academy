import React from 'react';
import type { LiveClass, GroupInfo } from '../types';

// Icons
const CheckCircleIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const PauseIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h1a1 1 0 001-1V8a1 1 0 00-1-1H8zm5 0a1 1 0 00-1 1v4a1 1 0 001 1h1a1 1 0 001-1V8a1 1 0 00-1-1h-1z" clipRule="evenodd" /></svg>;
const MinusCircleIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>;
const IndustrialIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426-1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c.94-1.543.826 3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ServiceIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.375 1.621S6.75 21 5.25 21H3.75m16.5 0h-1.5m-1.5 0H5.25m16.5 0v-1.007a3 3 0 00-1.622-2.624l-1.12-1.12-1.12-1.121a2.25 2.25 0 00-3.182 0l-1.12 1.12-1.12 1.121a2.25 2.25 0 01-3.182 0l-1.12-1.12-1.12-1.121a2.25 2.25 0 00-3.182 0l-1.12 1.12L3 17.25m6-14.25h6m-3-3v3" /></svg>;
const TheoryIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3.5a1 1 0 00.028 1.84l7 3.5a1 1 0 00.764 0l7-3.5a1 1 0 00.028-1.84l-7-3.5z" /><path d="M3 9.332V14a1 1 0 00.553.894l6 3a1 1 0 00.894 0l6-3A1 1 0 0017 14v-4.668-2.45l-7 3.5-7-3.5v2.45z" /></svg>;
const PracticalIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.972.03 2.287-.948 2.287-1.56.38-1.56 2.6 0 2.98.978.238 1.488 1.559.948 2.286-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.948c.38 1.56 2.6 1.56 2.98 0a1.532 1.532 0 012.287-.948c1.372.836 2.942-.734-2.106-2.106a1.532 1.532 0 01.948-2.287c1.56-.38 1.56-2.6 0-2.98a1.532 1.532 0 01-.948-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.948zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;


const StatusPill: React.FC<{status: 'In Class' | 'Break' | 'Not Active', language: 'en' | 'ar'}> = ({ status, language }) => {
    switch(status) {
        case 'In Class': return <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-200 px-2 py-1 rounded-full"><CheckCircleIcon className="h-4 w-4"/>{language === 'ar' ? 'في الفصل' : 'In Class'}</span>;
        case 'Break': return <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-200 px-2 py-1 rounded-full"><PauseIcon className="h-4 w-4"/>{language === 'ar' ? 'استراحة' : 'On Break'}</span>;
        default: return <span className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-200 px-2 py-1 rounded-full"><MinusCircleIcon className="h-4 w-4"/>{language === 'ar' ? 'غير نشط' : 'Not Active'}</span>;
    }
}

interface KioskSummaryPanelProps {
  allGroups: string[];
  liveClasses: LiveClass[];
  groupInfo: GroupInfo;
  overallStatus: string;
  onGroupClick: (group: string) => void;
  selectedGroup: string | null;
  language: 'en' | 'ar';
}

const KioskSummaryPanel: React.FC<KioskSummaryPanelProps> = ({ allGroups, liveClasses, groupInfo, overallStatus, onGroupClick, selectedGroup, language }) => {
    const liveClassMap = new Map<string, LiveClass>(liveClasses.map(lc => [lc.group, lc]));

    return (
        <div className="bg-kiosk-panel rounded-2xl shadow-xl flex flex-col p-6 h-full min-h-0">
            <h2 className={`text-2xl font-bold text-kiosk-text-title mb-4 flex-shrink-0 ${language === 'ar' ? 'font-kufi' : ''}`}>{language === 'ar' ? 'الجدول المباشر' : 'Live Schedule'}</h2>
            <div className="flex-grow overflow-y-auto -mr-3 pr-3 space-y-2">
                {allGroups.map(group => {
                    const liveInfo = liveClassMap.get(group);
                    const track = groupInfo[group]?.track_name;
                    const isIndustrial = track === 'Industrial Tech';
                    let status: 'In Class' | 'Break' | 'Not Active' = 'Not Active';
                    if (liveInfo) status = 'In Class';
                    else if (overallStatus.includes('Break')) status = 'Break';

                    return (
                        <button 
                            key={group}
                            onClick={() => onGroupClick(group)}
                            className={`w-full text-left p-3 rounded-xl border-l-8 transition-all duration-200 ${selectedGroup === group ? 'ring-2 ring-kiosk-primary bg-slate-50' : 'hover:bg-slate-50'} ${isIndustrial ? 'border-status-industrial' : 'border-status-tech'}`}
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    {isIndustrial ? <IndustrialIcon className="h-7 w-7 text-status-industrial"/> : <ServiceIcon className="h-7 w-7 text-status-tech"/>}
                                    <span className="font-black text-2xl text-kiosk-text-title">{group}</span>
                                </div>
                                <StatusPill status={status} language={language} />
                            </div>
                            {liveInfo && (
                                <div className="mt-2 pt-2 border-t border-slate-200 text-sm space-y-1">
                                    <div className="flex items-center gap-2 text-kiosk-text-body">
                                        {liveInfo.sessionType === 'theory' ? <TheoryIcon className="h-5 w-5"/> : <PracticalIcon className="h-5 w-5"/>}
                                        <span className="font-semibold capitalize">{liveInfo.sessionType}</span>
                                        <span className="truncate">{liveInfo.topic}</span>
                                    </div>
                                    <p className="text-kiosk-text-muted text-xs">
                                        <span className="font-semibold">{language === 'ar' ? 'المدرب:' : 'Instructor:'}</span> {liveInfo.instructors.join(', ')}
                                    </p>
                                    <p className="text-kiosk-text-muted text-xs">
                                        <span className="font-semibold">{language === 'ar' ? 'الموقع:' : 'Location:'}</span> {liveInfo.classroom.startsWith('WS-') ? liveInfo.classroom : `C-${liveInfo.classroom.replace('.', '')}`}
                                    </p>
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default KioskSummaryPanel;
