import React, { useState, useEffect } from 'react';
import type { AnalyzedStudent, DailyPeriod, GroupInfo } from '../types';
import InstructorProfilesTab from './InstructorProfiles';
import InstructorScheduleTab from './InstructorSchedule';
import NavaAcademyInfoTab from '../components/AboutNavaPanel';

type Tab = 'instructors' | 'schedule' | 'academy';

interface TeamAndAcademyPageProps {
    groupInfo: GroupInfo;
    groupCompanyMap: Record<string, string[]>;
    dailySchedule: DailyPeriod[];
    currentPeriod: DailyPeriod | null;
    now: Date;
    allStudents: AnalyzedStudent[];
    defaultTab?: Tab;
}

const TeamAndAcademyPage: React.FC<TeamAndAcademyPageProps> = (props) => {
    const { defaultTab = 'instructors' } = props;
    const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

    useEffect(() => {
        setActiveTab(defaultTab);
    }, [defaultTab]);


    const TabButton: React.FC<{tabId: Tab; label: string}> = ({ tabId, label }) => (
        <button 
            onClick={() => setActiveTab(tabId)} 
            className={`px-4 py-3 font-semibold text-sm transition-colors ${
                activeTab === tabId 
                    ? 'text-brand-primary border-b-2 border-brand-primary' 
                    : 'text-text-muted hover:text-text-primary dark:hover:text-dark-text-primary'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="bg-bg-panel dark:bg-dark-panel border border-slate-200 dark:border-dark-border rounded-lg shadow-sm h-full flex flex-col">
            <div className="border-b border-slate-200 dark:border-dark-border flex items-center px-4">
                <TabButton tabId="instructors" label="Instructors" />
                <TabButton tabId="schedule" label="Schedule" />
                <TabButton tabId="academy" label="NAVA Academy" />
            </div>
            <div className="flex-grow p-6 min-h-0">
                {activeTab === 'instructors' && <InstructorProfilesTab groupInfo={props.groupInfo} />}
                {activeTab === 'schedule' && <InstructorScheduleTab {...props} />}
                {activeTab === 'academy' && <NavaAcademyInfoTab />}
            </div>
        </div>
    );
};

export default TeamAndAcademyPage;