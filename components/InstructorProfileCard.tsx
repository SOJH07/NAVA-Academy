import React from 'react';
import type { InstructorProfile } from '../pages/InstructorProfiles';
import type { GroupInfo } from '../types';

interface InstructorProfileCardProps {
    profile: InstructorProfile;
    groupInfo: GroupInfo;
}

const KpiCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-slate-100 p-4 rounded-lg text-center">
        <p className="text-3xl font-extrabold text-brand-secondary">{value}</p>
        <p className="text-sm font-semibold text-text-muted">{title}</p>
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
                             <div key={group} className="bg-white border border-slate-200 rounded-md p-2 text-sm">
                                <p className="font-bold text-text-primary">{group}</p>
                                <p className="text-xs text-text-muted">{track}</p>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <p className="text-sm text-text-muted italic">No assignments for this week.</p>
            )}
        </div>
    );
}

const InstructorProfileCard: React.FC<InstructorProfileCardProps> = ({ profile, groupInfo }) => {
    const totalGroups = new Set([...profile.groups.odd, ...profile.groups.even]).size;
    
    return (
        <div className="bg-bg-panel border border-slate-200 rounded-lg shadow-sm h-full overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-slate-200">
                <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white bg-status-tech`}>
                        {profile.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-text-primary">{profile.name}</h2>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full mt-1 inline-block bg-status-tech-light text-status-tech`}>
                            Technical Instructor
                        </span>
                    </div>
                </div>
            </div>

            {/* Contact Info (Placeholder) */}
            <div className="p-6 border-b border-slate-200">
                <h3 className="text-xl font-bold text-text-primary mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <p><strong className="font-semibold text-text-secondary w-24 inline-block">Email:</strong> <span className="text-text-muted italic">Unavailable</span></p>
                    <p><strong className="font-semibold text-text-secondary w-24 inline-block">Office Hours:</strong> <span className="text-text-muted italic">Unavailable</span></p>
                </div>
            </div>

            {/* Teaching Load */}
            <div className="p-6">
                <h3 className="text-xl font-bold text-text-primary mb-4">Weekly Teaching Load</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <KpiCard title="Odd Week Periods" value={profile.load.odd} />
                    <KpiCard title="Even Week Periods" value={profile.load.even} />
                    <KpiCard title="Total Unique Groups" value={totalGroups} />
                </div>
            </div>
            
            {/* Assigned Groups */}
            <div className="p-6 bg-slate-50 border-t border-slate-200">
                 <h3 className="text-xl font-bold text-text-primary mb-4">Assigned Groups</h3>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <GroupList title="Odd Week" groups={profile.groups.odd} groupInfo={groupInfo} />
                    <GroupList title="Even Week" groups={profile.groups.even} groupInfo={groupInfo} />
                 </div>
            </div>
        </div>
    );
};

export default InstructorProfileCard;