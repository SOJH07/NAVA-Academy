import React from 'react';
import type { LiveClass, GroupInfo } from '../types';
import useKioskStore from '../store/kioskStore';

const StatusBadge: React.FC<{ status: 'In Class' | 'On Break' | 'Not Active' }> = ({ status }) => {
    let styles = 'bg-slate-200 text-slate-700';
    if (status === 'In Class') styles = 'bg-nava-green text-white';
    if (status === 'On Break') styles = 'bg-nava-gold text-slate-800';
    return <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${styles}`}>{status}</span>;
}

const GroupCard: React.FC<{
  group: string;
  liveInfo: LiveClass | undefined;
  overallStatus: string;
  onClick: () => void;
  isSelected: boolean;
  theme: 'blue' | 'red';
}> = ({ group, liveInfo, overallStatus, onClick, isSelected, theme }) => {
    let status: 'In Class' | 'On Break' | 'Not Active' = 'Not Active';
    if (liveInfo) status = 'In Class';
    else if (overallStatus.includes('Break')) status = 'On Break';

    const themeClasses = {
        blue: {
            bg: 'bg-white',
            border: 'border-nava-blue',
            hover: 'hover:bg-blue-50',
            selected: 'ring-2 ring-nava-blue bg-blue-100 shadow-lg scale-105'
        },
        red: {
            bg: 'bg-white',
            border: 'border-nava-red',
            hover: 'hover:bg-red-50',
            selected: 'ring-2 ring-nava-red bg-red-100 shadow-lg scale-105'
        }
    };
    const selectedTheme = themeClasses[theme];

    return (
        <button
            onClick={onClick}
            className={`p-3 rounded-xl border-l-4 text-left transition-all duration-200 ${selectedTheme.bg} ${selectedTheme.border} ${selectedTheme.hover} ${isSelected ? selectedTheme.selected : 'shadow-md hover:shadow-lg'}`}
        >
            <div className="flex justify-between items-start">
                <span className="font-montserrat font-semibold text-lg text-text-primary">{group}</span>
                <StatusBadge status={status} />
            </div>
            <p className="text-sm text-text-muted mt-2 truncate">
                {liveInfo ? liveInfo.instructors.join(', ') : (status === 'Not Active' ? 'Finished for Today' : 'Unscheduled')}
            </p>
        </button>
    );
};


interface KioskSummaryPanelProps {
  allGroups: string[];
  liveClasses: LiveClass[];
  groupInfo: GroupInfo;
  overallStatus: string;
  language: 'en' | 'ar';
}

const KioskSummaryPanel: React.FC<KioskSummaryPanelProps> = ({ allGroups, liveClasses, groupInfo, overallStatus, language }) => {
    const { selectedGroup, setSelectedGroup } = useKioskStore();
    const liveClassMap = new Map<string, LiveClass>(liveClasses.map(lc => [lc.group, lc]));
    
    const industrialGroups = allGroups.filter(g => groupInfo[g]?.track_name === 'Industrial Tech').sort();
    const serviceGroups = allGroups.filter(g => groupInfo[g]?.track_name === 'Service Tech').sort();

    const handleGroupClick = (group: string) => {
        setSelectedGroup(selectedGroup === group ? null : group);
    };

    return (
        <div className="bg-nava-neutral rounded-xl shadow-lg flex flex-col p-4 h-full min-h-0">
            <h2 className="text-2xl font-montserrat font-semibold text-text-primary mb-4 flex-shrink-0">Live Schedule</h2>
            <div className="flex-grow overflow-y-auto -mr-2 pr-2 space-y-6">
                <div>
                    <h3 className="font-montserrat font-semibold text-nava-blue mb-3 px-1">Industrial Technician</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {industrialGroups.map(group => (
                             <GroupCard 
                                key={group} 
                                group={group} 
                                liveInfo={liveClassMap.get(group)}
                                overallStatus={overallStatus}
                                onClick={() => handleGroupClick(group)}
                                isSelected={selectedGroup === group}
                                theme="blue"
                            />
                        ))}
                    </div>
                </div>
                 <div>
                    <h3 className="font-montserrat font-semibold text-nava-red mb-3 px-1">Service Technician</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                         {serviceGroups.map(group => (
                             <GroupCard 
                                key={group} 
                                group={group} 
                                liveInfo={liveClassMap.get(group)}
                                overallStatus={overallStatus}
                                onClick={() => handleGroupClick(group)}
                                isSelected={selectedGroup === group}
                                theme="red"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KioskSummaryPanel;
