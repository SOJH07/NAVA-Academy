import React, { useState, useMemo } from 'react';
import type { Assignment } from '../types';
import AnnouncementsMarquee from './AnnouncementsMarquee';
import { GoogleGenAI } from "@google/genai";
import { pacingScheduleData } from '../data/pacingSchedule';
import { differenceInDays, isAfter, parse, format } from 'date-fns';

interface KioskWelcomeMessageProps {
    language: 'en' | 'ar';
    dailyAssignments: Assignment[];
    now: Date;
}

// --- ICONS ---
const SubjectIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-primary" viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" /></svg>;
const SkillIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-primary" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.972.03 2.287-.948 2.287-1.56.38-1.56 2.6 0 2.98.978.238 1.488 1.559.948 2.286-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.948c.38 1.56 2.6 1.56 2.98 0a1.532 1.532 0 012.287-.948c1.372.836 2.942-.734-2.106-2.106a1.532 1.532 0 01.948-2.287c1.56-.38 1.56-2.6 0-2.98a1.532 1.532 0 01-.948-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.948zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;
const AssessmentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-primary" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm6 4a1 1 0 100-2 1 1 0 000 2zm-3 1a1 1 0 11-2 0 1 1 0 012 0zm3 1a1 1 0 100-2 1 1 0 000 2zm-3 1a1 1 0 11-2 0 1 1 0 012 0zm3 1a1 1 0 100-2 1 1 0 000 2zm3-3a1 1 0 11-2 0 1 1 0 012 0zm-6 3a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>;
const AiIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-primary" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v.25a.75.75 0 01-1.5 0V2.75A.75.75 0 0110 2zM5.404 4.343a.75.75 0 010 1.06l-.25.25a.75.75 0 11-1.06-1.06l.25-.25a.75.75 0 011.06 0zm9.192 0a.75.75 0 011.06 0l.25.25a.75.75 0 11-1.06 1.06l-.25-.25a.75.75 0 010-1.06zM2 10a.75.75 0 01.75-.75h.25a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm15 0a.75.75 0 01.75-.75h.25a.75.75 0 010 1.5h-.25a.75.75 0 01-.75-.75zM5.404 15.657a.75.75 0 010-1.06l-.25-.25a.75.75 0 11-1.06 1.06l.25.25a.75.75 0 011.06 0zm9.192 0a.75.75 0 011.06 0l.25-.25a.75.75 0 11-1.06-1.06l-.25.25a.75.75 0 010 1.06zM10 18a.75.75 0 01-.75-.75v-.25a.75.75 0 011.5 0v.25A.75.75 0 0110 18z" clipRule="evenodd" /></svg>;

const parseLegacyDate = (dateStr: string): Date => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return new Date(NaN);
    const year = parseInt(parts[2], 10);
    const fullYear = year < 50 ? 2000 + year : 1900 + year;
    return parse(`${parts[0]}-${parts[1]}-${fullYear}`, 'd-MMM-yy', new Date());
};

const getSkillForTopic = (topics: string[], lang: 'en' | 'ar'): string => {
    const topic = topics[0] || '';
    const lowerTopic = topic.toLowerCase();
    if (lowerTopic.includes('pneumatic') || lowerTopic.includes('hydraulic')) {
        return lang === 'ar' ? 'معايرة منظمات الضغط الهوائية لتحقيق كفاءة الدائرة.' : "Calibrating pneumatic pressure regulators for circuit efficiency.";
    }
    if (lowerTopic.includes('electro-mechanical')) {
        return lang === 'ar' ? 'تشخيص الأعطال في دائرة منطق المرحلات (Relay Logic).' : "Diagnosing faults in a relay logic circuit.";
    }
    if (lowerTopic.includes('hvac')) {
        return lang === 'ar' ? 'إجراء اختبار تسرب غاز التبريد باستخدام أجهزة الكشف الإلكترونية.' : "Performing a refrigerant leak test using electronic detectors.";
    }
    if (lowerTopic.includes('mechanical')) {
        return lang === 'ar' ? 'استخدام الفرجار (Caliper) لقياس الأبعاد الخارجية بدقة.' : 'Using a caliper to accurately measure external dimensions.';
    }
    return lang === 'ar' ? 'تطبيق المعرفة النظرية لحل مشكلة عملية.' : "Applying theoretical knowledge to solve a practical problem.";
};


const KioskWelcomeMessage: React.FC<KioskWelcomeMessageProps> = ({ language, dailyAssignments, now }) => {
    const [aiTip, setAiTip] = useState({ loading: false, content: '', error: '' });
    
    const todaysTopics = useMemo(() => {
        const topics = new Set<string>();
        dailyAssignments.forEach(a => topics.add(a.topic));
        return Array.from(topics);
    }, [dailyAssignments]);
    
    const upcomingAssessments = useMemo(() => {
        const today = now;
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        const assessments: ({ event: any; date: Date; type: string; })[] = [];
        const uniqueKeys = new Set<string>();

        for (const event of pacingScheduleData) {
            const processAssessment = (dateStr: string | undefined, type: 'Theoretical' | 'Performance') => {
                if (dateStr) {
                    const date = parseLegacyDate(dateStr);
                    if (isAfter(date, today) && isAfter(nextWeek, date)) {
                        const key = `${event.unitCode}-${type}-${dateStr}`;
                        if (!uniqueKeys.has(key)) {
                            assessments.push({ event, date, type });
                            uniqueKeys.add(key);
                        }
                    }
                }
            };
            processAssessment(event.assessments?.theoretical, 'Theoretical');
            processAssessment(event.assessments?.performance, 'Performance');
        }
        return assessments.sort((a,b) => a.date.getTime() - b.date.getTime());
    }, [now]);
    
    const skillOfTheDay = useMemo(() => getSkillForTopic(todaysTopics, language), [todaysTopics, language]);

    const handleGenerateTip = async () => {
        if (!todaysTopics[0]) {
            setAiTip({ loading: false, content: '', error: 'No topics for today to generate a tip.' });
            return;
        }
        setAiTip({ loading: true, content: '', error: '' });
        
        const prompt = `As an expert vocational instructor, provide a short, actionable study tip for a student learning about "${todaysTopics[0]}". The tip should be professional, easy to understand, and no more than two sentences.`;

        try {
            if (!process.env.API_KEY) throw new Error("API key is not configured.");
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setAiTip({ loading: false, content: response.text, error: '' });
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setAiTip({ loading: false, content: '', error: `Failed to generate tip: ${errorMessage}` });
        }
    };

    return (
        <div className="flex flex-col items-center justify-start h-full text-center text-kiosk-text-muted px-4 md:px-8 pt-8 overflow-y-auto">
            <div className="w-full max-w-5xl">
                <AnnouncementsMarquee language={language} />

                <div className="mt-8 text-left">
                    <h4 className="font-bold text-lg text-kiosk-text-title mb-4">
                        {language === 'ar' ? "التركيز اليومي" : "Today's Focus"}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Key Subjects */}
                        <div className="bg-white p-4 rounded-xl border border-kiosk-border shadow-sm">
                             <h5 className="font-semibold text-kiosk-text-body mb-3 flex items-center gap-2"><SubjectIcon />{language === 'ar' ? "المواضيع الرئيسية" : "Key Subjects"}</h5>
                             {todaysTopics.length > 0 ? (
                                 <div className="flex flex-wrap gap-2">{todaysTopics.slice(0, 5).map(topic => (<span key={topic} className="px-3 py-1 text-sm font-medium rounded-full bg-slate-100 text-slate-700">{topic}</span>))}</div>
                             ) : (<p className="text-sm text-kiosk-text-muted">{language === 'ar' ? 'لا توجد مواضيع مجدولة لهذا اليوم.' : 'No subjects scheduled for today.'}</p>)}
                        </div>
                        {/* Skill of the Day */}
                        <div className="bg-white p-4 rounded-xl border border-kiosk-border shadow-sm">
                             <h5 className="font-semibold text-kiosk-text-body mb-3 flex items-center gap-2"><SkillIcon />{language === 'ar' ? "مهارة اليوم" : "Skill of the Day"}</h5>
                             <p className="text-sm text-kiosk-text-body font-medium">{skillOfTheDay}</p>
                        </div>
                        {/* Upcoming Assessments */}
                        <div className="bg-white p-4 rounded-xl border border-kiosk-border shadow-sm">
                             <h5 className="font-semibold text-kiosk-text-body mb-3 flex items-center gap-2"><AssessmentIcon />{language === 'ar' ? "التقييمات القادمة" : "Upcoming Assessments"}</h5>
                             {upcomingAssessments.length > 0 ? (
                                 <ul className="space-y-1.5 text-sm">{upcomingAssessments.slice(0, 2).map(a => (<li key={a.event.unitCode + a.type} className="font-medium text-kiosk-text-body"><span className="font-bold">{a.event.unitCode}:</span> {a.type} on {format(a.date, 'EEEE, MMM d')}</li>))}</ul>
                             ) : (<p className="text-sm text-kiosk-text-muted">{language === 'ar' ? 'لا توجد تقييمات قادمة خلال الـ 7 أيام القادمة.' : 'No assessments due in the next 7 days.'}</p>)}
                        </div>
                        {/* AI Study Tip */}
                         <div className="bg-white p-4 rounded-xl border border-kiosk-border shadow-sm flex flex-col">
                             <h5 className="font-semibold text-kiosk-text-body mb-3 flex items-center gap-2"><AiIcon />{language === 'ar' ? "نصيحة دراسية بالذكاء الاصطناعي" : "AI Study Tip"}</h5>
                             <div className="flex-grow text-sm text-kiosk-text-body font-medium min-h-[60px]">
                                {aiTip.loading && <p className="animate-pulse text-kiosk-text-muted">Generating tip...</p>}
                                {aiTip.error && <p className="text-red-500">{aiTip.error}</p>}
                                {aiTip.content && <p>{aiTip.content}</p>}
                                {!aiTip.loading && !aiTip.content && !aiTip.error && <p className="text-kiosk-text-muted">{language === 'ar' ? `احصل على نصيحة مخصصة لـ ${todaysTopics[0] || 'مواضيع اليوم'}.` : `Get a custom tip for ${todaysTopics[0] || 'today\'s topics'}.`}</p>}
                             </div>
                             <button onClick={handleGenerateTip} disabled={aiTip.loading} className="mt-2 w-full bg-kiosk-primary/10 text-kiosk-primary font-bold text-sm py-2 rounded-lg hover:bg-kiosk-primary/20 transition-colors disabled:opacity-50">
                                {language === 'ar' ? "توليد نصيحة" : "Generate Tip"}
                             </button>
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
