import React, { useMemo } from 'react';
import { getDay } from 'date-fns';

interface EndOfDayDisplayProps {
    language: 'en' | 'ar';
    now: Date;
    onDismiss: () => void;
}

const EndOfDayDisplay: React.FC<EndOfDayDisplayProps> = ({ language, now, onDismiss }) => {
    const { title, message } = useMemo(() => {
        const dayOfWeek = getDay(now); // Sunday: 0, Thursday: 4, Friday: 5, Saturday: 6
        const isThursday = dayOfWeek === 4;
        const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

        if (isThursday) {
            return {
                title: language === 'ar' ? 'أسبوع رائع!' : 'Great Week!',
                message: language === 'ar' ? 'أحسنتم في أسبوع حافل بالإنجازات! استمتعوا بعطلة نهاية أسبوع مستحقة. نراكم يوم الأحد!' : 'Well done on a productive week! Enjoy your well-deserved weekend. See you on Sunday!',
            };
        }
        if (isWeekend) {
            return {
                title: language === 'ar' ? 'عطلة نهاية أسبوع سعيدة!' : 'Enjoy the Weekend!',
                message: language === 'ar' ? 'نتمنى لكم عطلة نهاية أسبوع سعيدة! نتطلع لرؤيتكم يوم الأحد.' : 'Enjoy your weekend! We look forward to seeing you on Sunday.',
            };
        }
        return {
            title: language === 'ar' ? 'اكتمل اليوم الدراسي' : 'Day Complete',
            message: language === 'ar' ? 'عمل رائع اليوم! خذوا قسطاً من الراحة ونراكم غداً في يوم حافل آخر.' : "Great work today! Rest up and we'll see you tomorrow for another exciting day.",
        };
    }, [language, now]);

    return (
        <div className="relative flex flex-col items-center justify-center h-full w-full text-center text-kiosk-text-title p-8 kiosk-welcome-bg animate-fade-in">
            <div className="flex flex-col items-center" style={{ textShadow: '0 3px 10px rgba(0,0,0,0.1)' }}>
                <h2 className="text-5xl lg:text-6xl font-black font-montserrat text-kiosk-text-title drop-shadow-md">
                    {title}
                </h2>
                <p className="text-xl font-medium text-kiosk-text-body mt-6 drop-shadow-sm text-wrap-balance max-w-2xl">
                    {message}
                </p>
                <div className="mt-12">
                    <button
                        onClick={onDismiss}
                        className="bg-white/80 text-kiosk-text-title font-bold px-8 py-4 rounded-full shadow-xl backdrop-blur-sm border border-white/50 transition-all hover:bg-white hover:scale-105"
                    >
                        {language === 'ar' ? 'عرض الجدول' : 'View Schedule'} &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EndOfDayDisplay;
