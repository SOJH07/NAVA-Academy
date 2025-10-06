import React from 'react';
import type { InstructorProfile } from '../pages/InstructorProfiles';
import type { GroupInfo } from '../types';

interface InstructorProfileCardProps {
    profile: InstructorProfile;
    groupInfo: GroupInfo;
}

const KpiCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-slate-100 dark:bg-dark-panel p-4 rounded-lg text-center shadow-sm">
        <p className="text-3xl font-extrabold text-brand-secondary dark:text-dark-text-primary">{value}</p>
        <p className="text-sm font-semibold text-text-muted dark:text-dark-text-muted">{title}</p>
    </div>
);

const GroupList: React.FC<{ title: string; groups: string[]; groupInfo: GroupInfo; }> = ({ title, groups, groupInfo }) => {
    const color = 'border-status-tech text-status-tech';

    return (
        <div>
            <h4 className={`text-lg font-bold mb-3 pb-2 border-b-2 ${color}`}>{title}</h4>
            {groups.length > 0 ? (
                 <div className="flex flex-wrap gap-2">
                    {groups.map(group => {
                        const track = groupInfo[group]?.track_name;
                        return (
                             <div key={group} className="bg-white dark:bg-dark-panel-hover border border-slate-200 dark:border-dark-border rounded-md p-2 text-sm">
                                <p className="font-bold text-text-primary dark:text-dark-text-primary">{group}</p>
                                <p className="text-xs text-text-muted dark:text-dark-text-muted">{track}</p>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <p className="text-sm text-text-muted dark:text-dark-text-muted italic">No assignments for this week.</p>
            )}
        </div>
    );
}

const InstructorProfileCard: React.FC<InstructorProfileCardProps> = ({ profile, groupInfo }) => {
    const totalGroups = profile.groups.length;
    
    return (
        <div className="bg-bg-panel dark:bg-dark-panel border border-slate-200 dark:border-dark-border rounded-lg shadow-sm h-full overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-dark-border">
                <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white ${profile.type === 'tech' ? 'bg-status-tech' : 'bg-status-professional'}`}>
                        {profile.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">{profile.name}</h2>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full mt-1 inline-block ${profile.type === 'tech' ? 'bg-status-tech-light text-status-tech' : 'bg-status-professional-light text-status-professional'}`}>
                            {profile.type === 'tech' ? 'Technical Instructor' : 'PD Instructor'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Contact Info (Placeholder) */}
            <div className="p-6 border-b border-slate-200 dark:border-dark-border">
                <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <p><strong className="font-semibold text-text-secondary dark:text-dark-text-secondary w-24 inline-block">Email:</strong> <span className="text-text-muted dark:text-dark-text-muted italic">Unavailable</span></p>
                    <p><strong className="font-semibold text-text-secondary dark:text-dark-text-secondary w-24 inline-block">Office Hours:</strong> <span className="text-text-muted dark:text-dark-text-muted italic">Unavailable</span></p>
                </div>
            </div>

            {/* Teaching Load */}
            <div className="p-6">
                <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-4">Weekly Teaching Load</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <KpiCard title="Technical Load" value={`${profile.load.tech} periods`} />
                    <KpiCard title="PD Load" value={`${profile.load.pd} periods`} />
                    <KpiCard title="Total Unique Groups" value={totalGroups} />
                </div>
            </div>
            
            {/* Assigned Groups */}
            <div className="p-6 bg-slate-50 dark:bg-dark-panel border-t border-slate-200 dark:border-dark-border">
                 <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-4">Assigned Groups</h3>
                 <div className="grid grid-cols-1 gap-8">
                    <GroupList title="Weekly Assignments" groups={profile.groups} groupInfo={groupInfo} />
                 </div>
            </div>
        </div>
    );
};

export default InstructorProfileCard;