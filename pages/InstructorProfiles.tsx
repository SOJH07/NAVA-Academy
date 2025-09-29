import React, { useState, useMemo } from 'react';
import type { GroupInfo, Assignment } from '../types';
import { allInstructors, processedScheduleData } from '../data/scheduleData';
import InstructorProfileCard from '../components/InstructorProfileCard';
import AutoSizer from 'react-virtualized-auto-sizer';
// @ts-ignore
import { FixedSizeList } from 'react-window';

export interface InstructorProfile {
    name: string;
    type: 'tech' | 'professional';
    load: { odd: number; even: number };
    groups: { odd: string[]; even: string[] };
}

interface InstructorProfilesPageProps {
    groupInfo: GroupInfo;
}

const InstructorProfilesPage: React.FC<InstructorProfilesPageProps> = ({ groupInfo }) => {
    const [selectedInstructor, setSelectedInstructor] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const instructorProfiles = useMemo<Record<string, InstructorProfile>>(() => {
        const profiles: Record<string, InstructorProfile> = {};

        const initializeProfile = (name: string, type: 'tech' | 'professional') => {
            if (!profiles[name]) {
                profiles[name] = {
                    name,
                    type,
                    load: { odd: 0, even: 0 },
                    groups: { odd: [], even: [] },
                };
            }
        };
        
        allInstructors.tech.forEach(name => initializeProfile(name, 'tech'));
        allInstructors.professional.forEach(name => initializeProfile(name, 'professional'));

        processedScheduleData.forEach(assignment => {
            assignment.instructors.forEach(instructorName => {
                const profile = profiles[instructorName];
                if (!profile) return;

                profile.load.odd += 1;
                if (!profile.groups.odd.includes(assignment.group)) {
                    profile.groups.odd.push(assignment.group);
                }
                profile.load.even += 1;
                if (!profile.groups.even.includes(assignment.group)) {
                    profile.groups.even.push(assignment.group);
                }
            });
        });
        
        // Sort groups
        Object.values(profiles).forEach(p => {
            p.groups.odd.sort();
            p.groups.even.sort();
        });

        return profiles;
    }, []);
    
    const filteredInstructors = useMemo(() => {
        // FIX: Add explicit type annotations for parameters in `filter` and `sort` to fix type inference issues.
        const instructors = Object.values(instructorProfiles)
            .filter((p: InstructorProfile) => p.type === 'tech')
            .sort((a: InstructorProfile, b: InstructorProfile) => a.name.localeCompare(b.name));
        if(!searchTerm) return instructors;
        
        const lowercasedSearch = searchTerm.toLowerCase();
        // FIX: Add explicit type annotation for parameter in `filter`.
        return instructors.filter((p: InstructorProfile) => p.name.toLowerCase().includes(lowercasedSearch));
    }, [instructorProfiles, searchTerm]);

    const handleSelectInstructor = (name: string) => {
        setSelectedInstructor(name);
    };

    const selectedProfile = selectedInstructor ? instructorProfiles[selectedInstructor] : null;
    
    const InstructorRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const profile = filteredInstructors[index];
        return (
            <div style={style}>
                 <button 
                    onClick={() => handleSelectInstructor(profile.name)}
                    className={`w-full text-left p-4 transition-colors h-full ${selectedInstructor === profile.name ? 'bg-brand-primary-light' : 'hover:bg-bg-panel-hover'}`}
                >
                    <p className={`font-semibold ${selectedInstructor === profile.name ? 'text-brand-primary-dark' : 'text-text-primary'}`}>{profile.name}</p>
                    <p className="text-xs text-text-muted">Total Load: {profile.load.odd + profile.load.even} periods</p>
                </button>
            </div>
        );
    };
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-full">
            {/* Instructor List */}
            <div className="md:col-span-1 lg:col-span-1 bg-bg-panel border border-slate-200 rounded-lg shadow-sm flex flex-col h-full">
                <div className="p-4 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-text-primary">Instructors</h3>
                    <input 
                        type="search"
                        placeholder="Search instructors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full mt-2 bg-slate-100 border border-slate-300 rounded-lg py-2 px-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                </div>
                <div className="flex border-b border-slate-200">
                    <div className={`flex-1 p-3 text-sm font-semibold text-center text-status-tech border-b-2 border-status-tech`}>
                        Technical ({filteredInstructors.length})
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto">
                    <AutoSizer>
                        {({ height, width }) => (
                            <FixedSizeList
                                height={height}
                                width={width}
                                itemCount={filteredInstructors.length}
                                itemSize={68}
                            >
                                {InstructorRow}
                            </FixedSizeList>
                        )}
                    </AutoSizer>
                </div>
            </div>

            {/* Profile View */}
            <div className="md:col-span-2 lg:col-span-3">
                {selectedProfile ? (
                    <InstructorProfileCard profile={selectedProfile} groupInfo={groupInfo} />
                ) : (
                    <div className="h-full flex items-center justify-center bg-bg-panel border border-slate-200 rounded-lg shadow-sm">
                        <div className="text-center text-text-muted">
                             <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            <h3 className="mt-4 text-xl font-bold text-text-primary">Select an Instructor</h3>
                            <p>Choose an instructor from the list to view their profile.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstructorProfilesPage;