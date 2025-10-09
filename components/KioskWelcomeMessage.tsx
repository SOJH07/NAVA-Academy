import React, { useState, useMemo, useEffect } from 'react';
import type { Assignment, GroupInfo } from '../types';
import AnnouncementsMarquee from './AnnouncementsMarquee';
import { format } from 'date-fns';

// --- ICONS ---
const SubjectIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-primary" viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" /></svg>;
const LearningOutcomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-primary" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3.5a1 1 0 00.028 1.84l7 3.5a1 1 0 00.764 0l7-3.5a1 1 0 00.028-1.84l-7-3.5z" /><path d="M3 9.332V14a1 1 0 00.553.894l6 3a1 1 0 00.894 0l6-3A1 1 0 0017 14v-4.668-2.45l-7 3.5-7-3.5v2.45z" /></svg>;
const TheoreticalSkillIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3.5a1 1 0 00.028 1.84l7 3.5a1 1 0 00.764 0l7-3.5a1 1 0 00.028-1.84l-7-3.5z" /><path d="M3 9.332V14a1 1 0 00.553.894l6 3a1 1 0 00.894 0l6-3A1 1 0 0017 14v-4.668-2.45l-7 3.5-7-3.5v2.45z" /></svg>;
const PracticalSkillIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.972.03 2.287-.948 2.287-1.56.38-1.56 2.6 0 2.98.978.238 1.488 1.559.948 2.286-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.948c.38 1.56 2.6 1.56 2.98 0a1.532 1.532 0 012.287-.948c1.372.836 2.942-.734-2.106-2.106a1.532 1.532 0 01.948-2.287c1.56-.38 1.56-2.6 0-2.98a1.532 1.532 0 01-.948-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.948zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;
const DiagnosticSkillIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8zm10.25 2.25a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5a.75.75 0 01.75-.75z" clipRule="evenodd" /></svg>;
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-primary-dark" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;

type SkillType = 'Practical' | 'Theoretical' | 'Diagnostic';
const SKILLS_MAP: { [key: string]: { en: string; ar: string; type: SkillType } } = {
    'pneumatic fundamentals': { en: "Identifying and explaining the function of basic pneumatic components.", ar: "تحديد وشرح وظيفة المكونات الهوائية الأساسية.", type: 'Theoretical' },
    'pneumatics-hydraulics advanced': { en: "Calibrating pressure regulators for circuit efficiency.", ar: "معايرة منظمات الضغط الهوائية لتحقيق كفاءة الدائرة.", type: 'Practical' },
    'hydraulic': { en: "Assembling and testing a basic hydraulic circuit.", ar: "تجميع واختبار دائرة هيدروليكية أساسية.", type: 'Practical' },
    'electro-mechanical': { en: "Diagnosing faults in a relay logic control circuit.", ar: "تشخيص الأعطال في دائرة التحكم بالمنطق التتابعي (Relay Logic).", type: 'Diagnostic' },
    'hvac': { en: "Performing a refrigerant leak test using electronic detectors.", ar: "إجراء اختبار تسرب غاز التبريد باستخدام أجهزة الكشف الإلكترونية.", type: 'Practical' },
    'mechanical fundamental': { en: "Using a caliper to accurately measure external dimensions.", ar: "استخدام الفرجار (Caliper) لقياس الأبعاد الخارجية بدقة.", type: 'Practical' },
    'electrical fundamental': { en: "Measuring voltage, current, and resistance with a multimeter.", ar: "قياس الجهد والتيار والمقاومة باستخدام الملتيميتر.", type: 'Practical' },
    'fire system': { en: "Identifying components of a conventional fire alarm system.", ar: "التعرف على مكونات نظام إنذار الحريق التقليدي.", type: 'Theoretical' },
    'lean manufacturing': { en: "Applying the 5S methodology to organize a workspace.", ar: "تطبيق منهجية 5S لتنظيم مساحة العمل.", type: 'Theoretical' },
    'vehicle construction': { en: "Locating and identifying key structural components of an EV chassis.", ar: "تحديد المكونات الهيكلية الرئيسية لشاسيه السيارة الكهربائية.", type: 'Theoretical' },
    'tires and wheel': { en: "Performing a wheel balance check using a dynamic balancer.", ar: "إجراء فحص موازنة العجلات باستخدام جهاز موازنة ديناميكي.", type: 'Practical' },
    'accessories, lighting, and wiper': { en: "Diagnosing a CAN bus fault in the vehicle's lighting system.", ar: "تشخيص خطأ في ناقل CAN في نظام إضاءة السيارة.", type: 'Diagnostic' },
    'hv safety': { en: "Demonstrating the correct procedure for de-energizing a high-voltage battery.", ar: "شرح الإجراء الصحيح لتفريغ طاقة بطارية الجهد العالي.", type: 'Practical' },
};

interface SkillInfo {
    outcome: string;
    type: SkillType | null;
}
const getLearningOutcomeForTopic = (topic: string, lang: 'en' | 'ar'): SkillInfo => {
    const lowerTopic = topic.toLowerCase();
    for (const key in SKILLS_MAP) {
        if (lowerTopic.includes(key)) {
            return {
                outcome: SKILLS_MAP[key][lang],
                type: SKILLS_MAP[key].type,
            };
        }
    }
    return { outcome: '', type: null };
};

interface KioskWelcomeMessageProps {
    language: 'en' | 'ar';
    allDailyAssignments: Assignment[];
    now: Date;
    groupInfo: GroupInfo;
}

const KioskWelcomeMessage: React.FC<KioskWelcomeMessageProps> = ({ language, allDailyAssignments, now, groupInfo }) => {
    const [outcomeIndex, setOutcomeIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);

    const extractUnitNumber = (topic: string): number => {
        const match = topic.match(/(U|Unit-)(\d+)/i);
        return match ? parseInt(match[2], 10) : 999;
    };

    const { industrialSubjects, serviceSubjects, groupsByTopicToday } = useMemo(() => {
        const todayStr = format(now, 'EEEE') as Assignment['day'];
        const dailyAssignments = allDailyAssignments.filter(a => a.day === todayStr);
        const subjectsMap = new Map<string, { topic: string; trackName: string }>();
        const topicGroupMap = new Map<string, string[]>();
        
        dailyAssignments.forEach(a => {
            const track = groupInfo[a.group]?.track_name;
            if (track && (track === 'Industrial Tech' || track === 'Service Tech')) {
                if (!subjectsMap.has(a.topic)) {
                    subjectsMap.set(a.topic, { topic: a.topic, trackName: track });
                }
                if (!topicGroupMap.has(a.topic)) {
                    topicGroupMap.set(a.topic, []);
                }
                const groups = topicGroupMap.get(a.topic)!;
                if (!groups.includes(a.group)) {
                    groups.push(a.group);
                }
            }
        });

        topicGroupMap.forEach(groups => groups.sort());

        const allSubjects = Array.from(subjectsMap.values());
        const industrial = allSubjects.filter(s => s.trackName === 'Industrial Tech');
        const service = allSubjects.filter(s => s.trackName === 'Service Tech');
        
        industrial.sort((a, b) => extractUnitNumber(a.topic) - extractUnitNumber(b.topic));
        service.sort((a, b) => extractUnitNumber(a.topic) - extractUnitNumber(b.topic));

        return { industrialSubjects: industrial, serviceSubjects: service, groupsByTopicToday: topicGroupMap };
    }, [allDailyAssignments, now, groupInfo]);

    const learningOutcomes = useMemo(() => {
        return [...industrialSubjects, ...serviceSubjects].map(subject => ({
            topic: subject.topic,
            trackName: subject.trackName,
            ...getLearningOutcomeForTopic(subject.topic, language),
        })).filter(item => item.outcome);
    }, [industrialSubjects, serviceSubjects, language]);

    useEffect(() => {
        if (learningOutcomes.length <= 1) return;
        const interval = setInterval(() => {
            setIsFading(true);
            setTimeout(() => {
                setOutcomeIndex(prev => (prev + 1) % learningOutcomes.length);
                setIsFading(false);
            }, 500);
        }, 8000);

        return () => clearInterval(interval);
    }, [learningOutcomes.length]);

    const currentOutcome = learningOutcomes[outcomeIndex] ?? null;
    const groupsForCurrentOutcome = currentOutcome ? groupsByTopicToday.get(currentOutcome.topic) || [] : [];
    
    const SkillIcon = currentOutcome?.type === 'Practical' ? PracticalSkillIcon :
                      currentOutcome?.type === 'Diagnostic' ? DiagnosticSkillIcon :
                      TheoreticalSkillIcon;

    return (
        <div className="flex flex-col items-center justify-start h-full text-center text-kiosk-text-muted px-4 md:px-8 pt-8 overflow-y-auto">
            <div className="w-full max-w-7xl mx-auto">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
                    <AnnouncementsMarquee language={language} />
                </div>

                <div className="mt-8">
                     <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-primary-light mb-6 w-max mx-auto">
                        <div className="bg-brand-primary/20 p-2 rounded-lg">
                            <StarIcon />
                        </div>
                        <h2 className={`font-bold text-lg text-text-primary`}>
                            {language === 'ar' ? "التركيز اليومي" : "Today's Focus"}
                        </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* Today's Subjects */}
                        <div className={`lg:col-span-3 bg-white p-6 rounded-xl border border-kiosk-border shadow-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                             <h5 className="font-bold text-lg text-kiosk-text-body mb-4 flex items-center gap-2">
                                <SubjectIcon />
                                {language === 'ar' ? "مواضيع اليوم" : "Today's Subjects"}
                            </h5>
                             <div className="grid grid-cols-2 gap-x-6">
                                <div>
                                    <h6 className="text-sm font-bold uppercase tracking-wider text-status-industrial mb-3">Industrial Tech</h6>
                                    {industrialSubjects.length > 0 ? (
                                        <ul className="space-y-3">
                                            {industrialSubjects.map(subject => {
                                                const isHighlighted = subject.topic === currentOutcome?.topic;
                                                return (
                                                    <li key={subject.topic} className={`p-2 rounded-lg flex items-center gap-3 transition-all duration-300 ${isHighlighted ? 'bg-amber-100 ring-2 ring-amber-400' : ''}`}>
                                                        <span className="w-2.5 h-2.5 rounded-full bg-status-industrial flex-shrink-0"></span>
                                                        <span className="font-semibold text-text-primary text-sm">{subject.topic}</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-kiosk-text-muted italic">No sessions today.</p>
                                    )}
                                </div>
                                 <div>
                                    <h6 className="text-sm font-bold uppercase tracking-wider text-status-tech mb-3">Service Tech</h6>
                                     {serviceSubjects.length > 0 ? (
                                        <ul className="space-y-3">
                                            {serviceSubjects.map(subject => {
                                                const isHighlighted = subject.topic === currentOutcome?.topic;
                                                return (
                                                    <li key={subject.topic} className={`p-2 rounded-lg flex items-center gap-3 transition-all duration-300 ${isHighlighted ? 'bg-amber-100 ring-2 ring-amber-400' : ''}`}>
                                                        <span className="w-2.5 h-2.5 rounded-full bg-status-tech flex-shrink-0"></span>
                                                        <span className="font-semibold text-text-primary text-sm">{subject.topic}</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                     ) : (
                                        <p className="text-sm text-kiosk-text-muted italic">No sessions today.</p>
                                     )}
                                </div>
                             </div>
                        </div>
                        
                        {/* Learning Outcomes */}
                        <div className={`lg:col-span-2 bg-white p-6 rounded-xl border-l-8 shadow-lg flex flex-col transition-all duration-300 ${language === 'ar' ? 'text-right' : 'text-left'} ${currentOutcome?.trackName === 'Industrial Tech' ? 'border-status-industrial' : (currentOutcome?.trackName === 'Service Tech' ? 'border-status-tech' : 'border-kiosk-border')}`}>
                            <h5 className="font-bold text-lg text-kiosk-text-body mb-4 flex items-center gap-2">
                                <LearningOutcomeIcon />
                                {language === 'ar' ? "مخرجات التعلم" : "Learning Outcomes"}
                            </h5>
                            <div className={`flex-grow transition-opacity duration-500 min-h-[90px] flex flex-col justify-center ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                                {currentOutcome ? (
                                    <div>
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="font-bold text-base text-kiosk-text-title pr-2">{currentOutcome.topic}</p>
                                            {currentOutcome.type && (
                                                <span className="flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600 flex-shrink-0">
                                                    <SkillIcon /> {currentOutcome.type}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-lg text-kiosk-text-body font-medium text-wrap-balance">{currentOutcome.outcome}</p>
                                    </div>
                                ) : (
                                    <p className="text-base text-kiosk-text-muted">{language === 'ar' ? 'لا توجد مخرجات تعلم محددة لهذا اليوم.' : 'No specific learning outcomes for today.'}</p>
                                )}
                            </div>
                            {groupsForCurrentOutcome.length > 0 && (
                                <div className="mt-auto pt-3 border-t border-kiosk-border/50">
                                    <h6 className="text-sm font-bold uppercase tracking-wider text-kiosk-text-muted mb-2">
                                        {language === 'ar' ? 'تدرسها اليوم' : 'Studied By Today'}
                                    </h6>
                                    <div className="flex flex-wrap gap-2">
                                        {groupsForCurrentOutcome.map(group => {
                                            const isIndustrial = group.startsWith('DPIT');
                                            const pillClass = isIndustrial
                                                ? 'bg-status-industrial-light text-status-industrial'
                                                : 'bg-status-tech-light text-status-tech';
                                            return (
                                                <span key={group} className={`px-2 py-1 text-xs font-bold rounded-full ${pillClass}`}>
                                                    {group}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                 <p className="mt-8 text-base max-w-2xl mx-auto">
                    {language === 'ar' 
                        ? 'حدد مجموعة من القائمة اليسرى أو غرفة من المستكشف لعرض جدولها الزمني وقائمة المتدربين.' 
                        : 'Select a group from the left menu or a room from the navigator to view its schedule and trainee list.'}
                </p>
            </div>
        </div>
    );
};

export default KioskWelcomeMessage;