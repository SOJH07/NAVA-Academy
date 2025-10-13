import React, { useState, useMemo, useEffect } from 'react';
import AnnouncementsMarquee from '../components/AnnouncementsMarquee';
import UpcomingEventsCard from '../components/UpcomingEventsCard';
import type { Assignment, GroupInfo } from '../types';
import type { useLiveStatus } from '../hooks/useLiveStatus';
import { learningOutcomesData } from '../data/learningOutcomes';
import { format, getISOWeek } from 'date-fns';
import parse from 'date-fns/parse';
import { pacingScheduleData } from '../data/pacingSchedule';

// Icons
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-kiosk-primary" viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" /></svg>;
const LearningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-kiosk-primary" viewBox="0 0 20 20" fill="currentColor"><path d="M10.21 4.21a1 1 0 00-1.42 0l-5 5a1 1 0 000 1.42L8.5 15.34a1 1 0 001.42 0l5-5a1 1 0 000-1.42l-4.71-4.71z" /></svg>;
const GearIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c.94-1.543.826 3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const WrenchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.83-5.83M11.42 15.17A3 3 0 017.25 21m4.17-5.83c.02-.02.04-.04.06-.06a3 3 0 00-5.83 4.17M11.42 15.17c-.02.02-.04.04-.06.06m0 0a3 3 0 01-5.83 4.17M12.75 3.75l-4.125 4.125a3 3 0 00-4.17 5.83l-1.48 1.48a.75.75 0 000 1.06l6.125 6.125a.75.75 0 001.06 0l1.48-1.48a3 3 0 005.83-4.17l4.125-4.125a.75.75 0 00-1.06-1.06Z" /></svg>;
const TheoreticalIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" /></svg>;
const PerformanceIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.972.03 2.287-.948 2.287-1.56.38-1.56 2.6 0 2.98.978.238 1.488 1.559.948 2.286-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.948c.38 1.56 2.6 1.56 2.98 0a1.532 1.532 0 012.287-.948c1.372.836 2.942-.734-2.106-2.106a1.532 1.532 0 01.948-2.287c1.56-.38 1.56-2.6 0-2.98a1.532 1.532 0 01-.948-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.948zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;
const CheckCircleIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.75 3a.75.75 0 01.75.75V4h7V3.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V3.75A.75.75 0 015.75 3zM4.5 8.25a.75.75 0 000 1.5h11a.75.75 0 000-1.5h-11z" clipRule="evenodd" /></svg>;


const getCleanTopicName = (topic: string) => {
    return topic
        .replace(/\s*\([^)]*\)$/, '') // Remove (Unit Assessment) etc.
        .trim();
};

const getFullCleanTopicName = (topic: string) => {
    return topic
        .replace('Unit-', 'U')
        .replace(/\s*\([^)]*\)$/, '')
        .trim();
};

const parseLegacyDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return new Date('invalid');
    const year = parseInt(parts[2], 10);
    const fullYear = year < 50 ? 2000 + year : 1900 + year;
    return parse(`${parts[0]}-${parts[1]}-${fullYear}`, 'd-MMM-yyyy', new Date());
};

const AssessmentItem: React.FC<{ asm: {group: string; unitName: string; type: string; track: 'Industrial' | 'Service' | 'Unknown'} }> = ({ asm }) => {
    const isTheoretical = asm.type === 'Theoretical';
    const Icon = isTheoretical ? TheoreticalIcon : PerformanceIcon;
    const trackColor = asm.track === 'Industrial' ? 'status-industrial' : 'status-tech';
    
    // Extract unit code and clean name
    const unitCodeMatch = asm.unitName.match(/(U\d+|Unit-\d+)/i);
    const unitCode = unitCodeMatch ? unitCodeMatch[0].replace('Unit-', 'U').toUpperCase() : '';
    const cleanUnitName = asm.unitName.replace(/(U\d+|Unit-\d+)\s*-\s*/i, '').replace(/\(Unit Assessment\)/i, '').trim();

    return (
        <div className={`bg-slate-50 dark:bg-dark-panel-hover/50 p-2 rounded-lg border-l-4 border-${trackColor}`}>
            <div className="flex justify-between items-start">
                <div className="min-w-0">
                    <p className={`font-bold text-sm text-${trackColor}`}>{asm.group} {unitCode && `- ${unitCode}`}</p>
                    <p className="text-xs text-kiosk-text-muted truncate mt-0.5">{cleanUnitName}</p>
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold text-${trackColor} flex-shrink-0 ml-2`}>
                    <Icon className="h-4 w-4" />
                    <span>{asm.type}</span>
                </div>
            </div>
        </div>
    );
};

interface InfoCardProps {
    title: string;
    icon: React.ReactElement;
    children: React.ReactNode;
    bodyClassName?: string;
    containerClassName?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, icon, children, bodyClassName = "", containerClassName = "" }) => (
    <div className={`bg-white rounded-xl border border-kiosk-border shadow-md flex flex-col h-full min-h-0 ${containerClassName}`}>
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

const KioskWelcomeMessage: React.FC<KioskWelcomeMessageProps> = ({ language, liveStatusData, dailyAssignments, groupInfo }) => {
    const { overallStatus, currentPeriod, now } = liveStatusData;
    const dayOfWeek = now.getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

    const [isFading, setIsFading] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);
    const [activeTopicIndex, setActiveTopicIndex] = useState(0);

    const { industrialTopics, serviceTopics, activeTopics, topicToFullNameMap } = useMemo(() => {
        const industrial = new Map<string, string>();
        const service = new Map<string, string>();
        const fullMap = new Map<string, string>();

        dailyAssignments.forEach(a => {
            const cleanName = getCleanTopicName(a.topic);
            if (!fullMap.has(cleanName)) {
                fullMap.set(cleanName, a.topic);
            }
            if (groupInfo[a.group]?.track_name === 'Industrial Tech' && !industrial.has(cleanName)) {
                industrial.set(cleanName, a.topic);
            } else if (groupInfo[a.group]?.track_name === 'Service Tech' && !service.has(cleanName)) {
                service.set(cleanName, a.topic);
            }
        });
        
        let active;
        if (currentPeriod?.type === 'class') {
            active = Array.from(new Set(liveStatusData.liveClasses.map(lc => getCleanTopicName(lc.topic))));
        } else {
            active = Array.from(industrial.keys()).concat(Array.from(service.keys()));
        }
        
        return { 
            industrialTopics: Array.from(industrial.keys()).sort(), 
            serviceTopics: Array.from(service.keys()).sort(), 
            activeTopics: active.length > 0 ? active.sort() : Array.from(fullMap.keys()).sort(),
            topicToFullNameMap: fullMap,
        };
    }, [dailyAssignments, groupInfo, currentPeriod, liveStatusData.liveClasses]);

    const displayTopic = hoveredTopic || (activeTopics.length > 0 ? activeTopics[activeTopicIndex % activeTopics.length] : null);
    
    const outcomesForTopic = displayTopic ? (learningOutcomesData[getCleanTopicName(topicToFullNameMap.get(displayTopic) || displayTopic)] || []) : [];
    
    // Ensure every topic has 3 outcomes for consistent UI
    const displayOutcomes = outcomesForTopic.length > 0
        ? [...outcomesForTopic, "Adhere to safety protocols.", "Collaborate effectively with team members.", "Apply problem-solving skills."].slice(0, 3)
        : [];


    useEffect(() => {
        if (isPaused || activeTopics.length <= 1) return;
        const timer = setInterval(() => {
            if (document.hasFocus()) {
                setIsFading(true);
                setTimeout(() => {
                    setActiveTopicIndex(prev => prev + 1);
                    setHoveredTopic(null);
                    setIsFading(false);
                }, 300);
            }
        }, 10000);
        return () => clearInterval(timer);
    }, [isPaused, activeTopics.length]);
    
    const handleMouseLeaveContainer = () => { setIsPaused(false); setHoveredTopic(null); };

    const week42Assessments = useMemo(() => {
        const allAssessments = [];
        for (const event of pacingScheduleData) {
            const track = groupInfo[event.group]?.track_name;
            const trackType = track === 'Industrial Tech' ? 'Industrial' : (track === 'Service Tech' ? 'Service' : 'Unknown');

            if (event.assessments) {
                if (event.assessments.theoretical) {
                    const date = parseLegacyDate(event.assessments.theoretical);
                    if (!isNaN(date.getTime()) && getISOWeek(date) === 42) {
                        allAssessments.push({ group: event.group, unitName: event.unitName, type: 'Theoretical', date, track: trackType });
                    }
                }
                if (event.assessments.performance) {
                     const date = parseLegacyDate(event.assessments.performance);
                    if (!isNaN(date.getTime()) && getISOWeek(date) === 42) {
                        allAssessments.push({ group: event.group, unitName: event.unitName, type: 'Performance', date, track: trackType });
                    }
                }
            }
        }
        return allAssessments.sort((a,b) => a.date.getTime() - b.date.getTime());
    }, [groupInfo]);

    const assessmentsByDay = useMemo(() => {
        const grouped: Record<string, { date: Date; assessments: typeof week42Assessments }> = {};
        for (const asm of week42Assessments) {
            const dayKey = format(asm.date, 'yyyy-MM-dd');
            if (!grouped[dayKey]) grouped[dayKey] = { date: asm.date, assessments: [] };
            grouped[dayKey].assessments.push(asm);
        }
        return Object.values(grouped).sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [week42Assessments]);

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
        <div 
            className="h-full flex flex-col gap-4"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={handleMouseLeaveContainer}
        >
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
                            <ul className="space-y-1">
                                {industrialTopics.map(topic => {
                                    const isActive = displayTopic === topic;
                                    return (
                                        <li 
                                            key={`ind-${topic}`} 
                                            onMouseEnter={() => setHoveredTopic(topic)} 
                                            className={`p-2 rounded-lg text-sm cursor-pointer transition-colors ${isActive ? 'bg-yellow-200' : 'bg-transparent'}`}
                                        >
                                            <div className="flex items-start">
                                                <span className="w-2 h-2 rounded-full mr-2.5 mt-1.5 flex-shrink-0 bg-status-industrial"></span>
                                                <span className={`text-kiosk-text-body ${isActive ? 'font-bold' : 'font-medium'}`}>{topic}</span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                        <div>
                            <p className="flex items-center gap-2 font-bold text-sm text-status-tech uppercase tracking-wider mb-2"><WrenchIcon/><span>{language === 'ar' ? "تقنية خدمات" : "SERVICE TECH"}</span></p>
                            <ul className="space-y-1">
                                {serviceTopics.map(topic => {
                                    const isActive = displayTopic === topic;
                                    return (
                                        <li 
                                            key={`ser-${topic}`} 
                                            onMouseEnter={() => setHoveredTopic(topic)} 
                                            className={`p-2 rounded-lg text-sm cursor-pointer transition-colors ${isActive ? 'bg-yellow-200' : 'bg-transparent'}`}
                                        >
                                            <div className="flex items-start">
                                                <span className="w-2 h-2 rounded-full mr-2.5 mt-1.5 flex-shrink-0 bg-status-tech"></span>
                                                <span className={`text-kiosk-text-body ${isActive ? 'font-bold' : 'font-medium'}`}>{topic}</span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                    <div className="flex-shrink-0 border-t border-slate-200 mt-3 pt-3">
                        <h4 className="flex items-center gap-2 font-bold text-xl text-kiosk-primary mb-2">
                            <LearningIcon /> <span>{language === 'ar' ? "مخرجات التعلم" : "Learning Outcomes"}</span>
                        </h4>
                        <div className={`transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'} min-h-[100px]`}>
                            {displayTopic ? (
                                <>
                                    <h5 className="font-bold text-lg text-kiosk-text-title mb-2">{getFullCleanTopicName(topicToFullNameMap.get(displayTopic) || displayTopic)}</h5>
                                    {displayOutcomes.length > 0 ? (
                                        <ul className="space-y-1.5 text-kiosk-text-body font-medium text-base">
                                            {displayOutcomes.map((outcome, index) => <li key={index} className="flex items-start gap-2"><CheckCircleIcon className="h-6 w-6 text-brand-primary flex-shrink-0" /><span>{outcome}</span></li>)}
                                        </ul>
                                    ) : <p className="text-sm text-kiosk-text-muted italic">Focus on practical application and safety procedures.</p>}
                                </>
                            ) : <p className="text-sm text-kiosk-text-muted italic">Hover over a subject to see its learning outcomes.</p>}
                        </div>
                    </div>
                </InfoCard>

                <div className="flex flex-col gap-4 min-h-0">
                    <InfoCard 
                        title={language === 'ar' ? 'الأحداث الأكاديمية' : 'Academy Events'}
                        icon={<CalendarIcon />}
                        bodyClassName="overflow-hidden p-0"
                    >
                        <UpcomingEventsCard language={language} />
                    </InfoCard>

                    <InfoCard
                        title="Upcoming Assessments"
                        icon={<PerformanceIcon />}
                        bodyClassName="overflow-y-auto"
                    >
                       {assessmentsByDay.length > 0 ? (
                            <div className="space-y-3">
                                {assessmentsByDay.map(({ date, assessments }) => (
                                    <div key={date.toString()}>
                                        <h4 className="font-bold text-sm text-center text-kiosk-text-muted mb-1.5">{format(date, 'EEEE, MMM d')}</h4>
                                        <div className="space-y-2">{assessments.map((asm, i) => <AssessmentItem key={i} asm={asm} />)}</div>
                                    </div>
                                ))}
                            </div>
                        ) : <div className="flex items-center justify-center h-full"><p className="text-center text-sm text-kiosk-text-muted">No assessments scheduled for this week.</p></div>}
                    </InfoCard>
                </div>
            </div>
        </div>
    );
};

export default KioskWelcomeMessage;