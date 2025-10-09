import React from 'react';
import type { Assignment, GroupInfo } from '../types';

const ObjectiveIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" /></svg>;


interface DailySummaryPanelProps {
    dailyAssignments: Assignment[];
    groupInfo: GroupInfo;
    language: 'en' | 'ar';
}

const DailySummaryPanel: React.FC<DailySummaryPanelProps> = ({ dailyAssignments, groupInfo, language }) => {

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

    if (dailyAssignments.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-center text-kiosk-text-muted">
                <div>
                    <h3 className="font-bold text-lg">{language === 'ar' ? 'لا يوجد جدول لهذا اليوم' : 'No Schedule For Today'}</h3>
                    <p className="text-sm mt-1">{language === 'ar' ? 'يبدو أنه يوم عطلة.' : 'It appears to be a day off.'}</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="h-full flex flex-col p-6 animate-fade-in">
            <h2 className="text-3xl font-montserrat font-bold text-kiosk-text-title mb-6 flex-shrink-0">
                {language === 'ar' ? 'ملخص اليوم' : "Today's Summary"}
            </h2>
            <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                 <div>
                    <h3 className="font-montserrat font-semibold text-kiosk-text-title mb-3 text-xl text-status-industrial">
                        {language === 'ar' ? 'مسار فني صناعي' : 'Industrial Technician Track'}
                    </h3>
                    <div className="space-y-3">
                        {industrialTopics.length > 0 ? industrialTopics.map(topic => (
                             <div key={topic} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                <ObjectiveIcon className="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0" />
                                <p className="text-base text-kiosk-text-body">{topic}</p>
                            </div>
                        )) : <p className="text-kiosk-text-muted text-sm italic">No topics scheduled.</p>}
                    </div>
                </div>
                <div>
                    <h3 className="font-montserrat font-semibold text-kiosk-text-title mb-3 text-xl text-status-tech">
                        {language === 'ar' ? 'مسار فني خدمات' : 'Service Technician Track'}
                    </h3>
                     <div className="space-y-3">
                        {serviceTopics.length > 0 ? serviceTopics.map(topic => (
                             <div key={topic} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                <ObjectiveIcon className="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0" />
                                <p className="text-base text-kiosk-text-body">{topic}</p>
                            </div>
                        )) : <p className="text-kiosk-text-muted text-sm italic">No topics scheduled.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailySummaryPanel;