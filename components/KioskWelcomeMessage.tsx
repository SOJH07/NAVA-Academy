import React, { useState, useMemo, useEffect } from 'react';
import AnnouncementsMarquee from './AnnouncementsMarquee';
import UpcomingEventsCard from './UpcomingEventsCard';
import type { Assignment, GroupInfo } from '../types';
import type { useLiveStatus } from '../hooks/useLiveStatus';
import { dailyPeriodsData } from '../data/dailyPeriods';

// Icons
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-kiosk-primary" viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" /></svg>;
const DetailsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-kiosk-primary" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>;
const GearIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c.94-1.543.826 3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const WrenchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.83-5.83M11.42 15.17A3 3 0 017.25 21m4.17-5.83c.02-.02.04-.04.06-.06a3 3 0 00-5.83 4.17M11.42 15.17c-.02.02-.04.04-.06.06m0 0a3 3 0 01-5.83 4.17M12.75 3.75l-4.125 4.125a3 3 0 00-4.17 5.83l-1.48 1.48a.75.75 0 000 1.06l6.125 6.125a.75.75 0 001.06 0l1.48-1.48a3 3 0 005.83-4.17l4.125-4.125a.75.75 0 00-1.06-1.06Z" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.75 3a.75.75 0 01.75.75V4h7V3.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V3.75A.75.75 0 015.75 3zM4.5 8.25a.75.75 0 000 1.5h11a.75.75 0 000-1.5h-11z" clipRule="evenodd" /></svg>;
const CompletedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;

const getCleanTopicName = (topic: string) => {
    return topic
        .replace(/\s*\([^)]*\)$/, '') // Remove (Unit Assessment) etc.
        .trim();
};

const formatLocation = (classroom: string) => {
    if (classroom.startsWith('WS-')) {
        return classroom.replace('WS-0.', 'WS-');
    }
    if (classroom.match(/^\d\.\d+$/)) {
        const prefix = classroom.startsWith('2.') ? 'C-' : 'L-';
        return prefix + classroom.replace('.', '');
    }
    return classroom;
};

const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

interface InfoCardProps {
    title: string;
    icon: React.ReactElement;
    children: React.ReactNode;
    bodyClassName?: string;
    containerClassName?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, icon, children, bodyClassName = "", containerClassName = "" }) => (
    <div 
        className={`bg-white rounded-xl border border-kiosk-border shadow-md flex flex-col h-full min-h-0 ${containerClassName}`}
    >
        <h3 className="flex items-center gap-3 font-bold text-base text-black p-3 flex-shrink-0 bg-brand-primary-light rounded-t-xl border-b border-kiosk-border">
            {React.cloneElement(icon, { className: "h-5 w-5" })}
            <span className="uppercase tracking-wider">{title}</span>
        </h3>
        <div className={`flex-grow p-4 min-h-0 ${bodyClassName}`}>
            {children}
        </div>
    </div>
);

interface KioskWelcomeMessageProps {
    language: 'en' | 'ar';
    liveStatusData: ReturnType<typeof useLiveStatus>;
    dailyAssignments: Assignment[];
    groupInfo: GroupInfo;
}

type SubjectStatus = 'live' | 'completed' | 'upcoming';
interface SubjectInfo {
    code: string;
    fullName: string;
    status: SubjectStatus;
    period: string;
}

const KioskWelcomeMessage: React.FC<KioskWelcomeMessageProps> = ({ language, liveStatusData, dailyAssignments, groupInfo }) => {
    const { overallStatus, currentPeriod, now } = liveStatusData;
    const dayOfWeek = now.getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

    const [activeSubjectIndex, setActiveSubjectIndex] = useState(0);
    
    const { todaysUniqueSubjects } = useMemo(() => {
        const subjectsMap = new Map<string, Pick<SubjectInfo, 'code' | 'fullName' | 'period'>>();
        
        for (const assignment of dailyAssignments) {
            const cleanName = getCleanTopicName(assignment.topic);
            if (!subjectsMap.has(cleanName)) {
                subjectsMap.set(cleanName, {
                    code: cleanName,
                    fullName: assignment.topic,
                    period: assignment.period
                });
            }
        }
        
        const sortedSubjects = Array.from(subjectsMap.values()).sort((a, b) => {
            const periodA = dailyPeriodsData.find(p => p.name === a.period)!;
            const periodB = dailyPeriodsData.find(p => p.name === b.period)!;
            return timeToMinutes(periodA.start) - timeToMinutes(periodB.start);
        });

        return { todaysUniqueSubjects: sortedSubjects };
    }, [dailyAssignments]);

    const allTodaysSubjectsWithStatus = useMemo(() => {
        const nowMinutes = timeToMinutes(`${now.getHours()}:${now.getMinutes()}`);
        return todaysUniqueSubjects.map(s => {
            const periodDetails = dailyPeriodsData.find(p => p.name === s.period);
            const periodEndMinutes = periodDetails ? timeToMinutes(periodDetails.end) : 0;
            const periodStartMinutes = periodDetails ? timeToMinutes(periodDetails.start) : 0;
            
            let status: SubjectStatus = 'upcoming';
            if (nowMinutes >= periodStartMinutes && nowMinutes < periodEndMinutes) {
                status = 'live';
            } else if (nowMinutes >= periodEndMinutes) {
                status = 'completed';
            }
            return {...s, status};
        });
    }, [todaysUniqueSubjects, now]);

    const activeSubject = useMemo(() => {
        if (todaysUniqueSubjects.length === 0) return null;
        return allTodaysSubjectsWithStatus[activeSubjectIndex] ?? null;
    }, [activeSubjectIndex, allTodaysSubjectsWithStatus, todaysUniqueSubjects.length]);
    
    const assignmentForSubject = useMemo(() => {
        if (!activeSubject) return null;
        return dailyAssignments.find(a => getCleanTopicName(a.topic) === activeSubject.code) || null;
    }, [activeSubject, dailyAssignments]);

    useEffect(() => {
        if (todaysUniqueSubjects.length === 0) return;
        const liveOrUpcomingIndex = allTodaysSubjectsWithStatus.findIndex(s => s.status === 'live' || s.status === 'upcoming');
        setActiveSubjectIndex(liveOrUpcomingIndex !== -1 ? liveOrUpcomingIndex : (todaysUniqueSubjects.length > 0 ? todaysUniqueSubjects.length - 1 : 0));
    }, [todaysUniqueSubjects, allTodaysSubjectsWithStatus]);

    const handleSubjectClick = (code: string) => {
        const newIndex = todaysUniqueSubjects.findIndex(s => s.code === code);
        if (newIndex !== -1) {
            setActiveSubjectIndex(newIndex);
        }
    };

    const todaysSubjectsLists = useMemo(() => {
        const industrial: SubjectInfo[] = [];
        const service: SubjectInfo[] = [];
        allTodaysSubjectsWithStatus.forEach(s => {
            const assignment = dailyAssignments.find(a => getCleanTopicName(a.topic) === s.code);
            const track = assignment ? groupInfo[assignment.group]?.track_name : undefined;
            if (track === 'Industrial Tech') industrial.push(s);
            else if (track === 'Service Tech') service.push(s);
        });
        return { industrial, service };
    }, [allTodaysSubjectsWithStatus, groupInfo, dailyAssignments]);
    
    const renderSubjectList = (subjects: SubjectInfo[]) => (
        <ul className="space-y-1">
            {subjects.map(subject => {
                const isSelected = activeSubject?.code === subject.code;
                let StatusIcon: React.ReactNode;
                switch(subject.status) {
                    case 'live': StatusIcon = <div className={'w-2 h-2 rounded-full mr-2.5 mt-1.5 flex-shrink-0 bg-green-500 animate-pulse'}></div>; break;
                    case 'completed': StatusIcon = <CompletedIcon />; break;
                    default: StatusIcon = <div className={`w-2 h-2 rounded-full mr-2.5 mt-1.5 flex-shrink-0 border-2 border-slate-400`}></div>;
                }

                return (
                    <li key={`${subject.code}-${subject.period}`}>
                        <button
                            onClick={() => handleSubjectClick(subject.code)}
                            className={`w-full text-left p-2 rounded-lg transition-colors ${isSelected ? 'bg-yellow-100' : 'hover:bg-slate-50'} ${subject.status === 'completed' ? 'text-slate-400' : 'text-black'}`}
                        >
                            <div className="flex items-start">
                                <div className="flex-shrink-0 mr-2 mt-1">{StatusIcon}</div>
                                <p className={`font-semibold ${isSelected ? 'font-bold' : 'font-semibold'}`}>
                                    {getCleanTopicName(subject.fullName)}
                                </p>
                            </div>
                        </button>
                    </li>
                );
            })}
        </ul>
    );

    if (isWeekend || (overallStatus === 'Finished' && !isWeekend)) {
        const message = isWeekend
            ? { title: language === 'ar' ? "استمتعوا بعطلة نهاية الأسبوع!" : "Enjoy the Weekend!", body: language === 'ar' ? "استريحوا وأعيدوا شحن طاقتكم. نتطلع لرؤيتكم يوم الأحد." : "Rest and recharge. We look forward to seeing you on Sunday." }
            : { title: language === 'ar' ? "اكتمل اليوم الدراسي!" : "Day Complete!", body: language === 'ar' ? "عمل رائع اليوم! نراكم غدًا ليوم آخر مثمر." : "Great work today! See you tomorrow for another productive day." };
        return (
             <div className="flex items-center justify-center h-full">
                <div className="bg-white p-8 rounded-2xl border border-kiosk-border shadow-lg text-center">
                    <h3 className="font-bold text-2xl text-kiosk-text-title mb-2">{message.title}</h3>
                    <p className="text-base text-kiosk-text-muted">{message.body}</p>
                </div>
             </div>
        );
    }

    return (
        <div className="h-full flex flex-col gap-4">
            <div className="flex-shrink-0">
                <AnnouncementsMarquee language={language} />
            </div>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
                <InfoCard 
                    title={language === 'ar' ? "مواضيع اليوم" : "TODAY'S SUBJECTS"}
                    icon={<BookIcon />}
                    bodyClassName="flex flex-col"
                >
                    <div className="flex-grow grid grid-cols-2 gap-x-4 overflow-y-auto pr-2">
                        <div>
                            <p className="flex items-center gap-2 font-bold text-sm text-status-industrial uppercase tracking-wider mb-2"><GearIcon /><span>{language === 'ar' ? "تقنية صناعية" : "INDUSTRIAL TECH"}</span></p>
                            {renderSubjectList(todaysSubjectsLists.industrial)}
                        </div>
                        <div>
                            <p className="flex items-center gap-2 font-bold text-sm text-status-tech uppercase tracking-wider mb-2"><WrenchIcon/><span>{language === 'ar' ? "تقنية خدمات" : "SERVICE TECH"}</span></p>
                            {renderSubjectList(todaysSubjectsLists.service)}
                        </div>
                    </div>
                     <div className="flex-shrink-0 border-t border-kiosk-border mt-4 pt-4">
                        <h4 className="flex items-center gap-2 font-bold text-lg text-kiosk-primary mb-2">
                           <DetailsIcon />
                           <span>{language === 'ar' ? 'تفاصيل الجلسة' : 'Session Details'}</span>
                        </h4>
                        <div className="min-h-[70px]">
                           {activeSubject && assignmentForSubject ? (
                                <>
                                    <h5 className="font-bold text-base text-kiosk-text-title mb-2">
                                        {getCleanTopicName(activeSubject.fullName)}
                                    </h5>
                                    <div className="space-y-1.5 text-sm font-medium text-kiosk-text-body">
                                        <div className="flex items-center gap-2">
                                            <UserIcon />
                                            <span>{assignmentForSubject.instructors.join(', ')}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <LocationIcon />
                                            <span>{formatLocation(assignmentForSubject.classroom)}</span>
                                        </div>
                                    </div>
                                </>
                            ) : <p className="text-sm text-kiosk-text-muted italic">Select a subject to see its details.</p>}
                        </div>
                    </div>
                </InfoCard>
                <div className="flex flex-col min-h-0">
                     <InfoCard 
                        title={language === 'ar' ? 'الأحداث الأكاديمية' : 'Academy Events'}
                        icon={<CalendarIcon />}
                        bodyClassName="overflow-hidden p-0"
                        containerClassName="h-full"
                    >
                        <UpcomingEventsCard language={language} />
                    </InfoCard>
                </div>
            </div>
        </div>
    );
};

export default KioskWelcomeMessage;