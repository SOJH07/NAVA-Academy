import React, { useState, useEffect } from 'react';

// Icons to match user's aesthetic request
const BellIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 12.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>;
const QuoteIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M6 2a2 2 0 00-2 2v8a2 2 0 002 2h2a2 2 0 002-2v-2H7a1 1 0 110-2h3V4a2 2 0 00-2-2H6zM14 2a2 2 0 00-2 2v8a2 2 0 002 2h2a2 2 0 002-2v-2h-3a1 1 0 110-2h3V4a2 2 0 00-2-2h-2z" /></svg>;
const SafetyIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1.944c1.664 0 3.206.5 4.582 1.342C16.356 4.28 17.5 5.89 17.5 7.916v3.25c0 .99-.344 1.933-.963 2.684l-.163.197c-.368.444-.666.953-.865 1.498a.75.75 0 01-1.342-.582c.153-.42.39-.813.67-1.15.22-.267.394-.56.505-.865a3.6 3.6 0 00.358-.882V7.916c0-1.424-.86-2.61-2.192-3.218C13.12 4.02 11.61 3.444 10 3.444c-1.61 0-3.12.576-4.192 1.054C4.368 5.305 3.5 6.492 3.5 7.916v3.25c0 .323.059.638.17.938.107.29.274.57.48.824.28.337.518.73.67 1.15a.75.75 0 11-1.342.582c-.2-.545-.497-1.054-.865-1.498l-.163-.197A3.97 3.97 0 012.5 11.166v-3.25c0-2.026 1.144-3.636 2.918-4.624C6.794 2.444 8.336 1.944 10 1.944z" clipRule="evenodd" /><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.23 8.23a.75.75 0 011.06 0L10 8.94l.71-.71a.75.75 0 111.06 1.06L11.06 10l.71.71a.75.75 0 11-1.06 1.06L10 11.06l-.71.71a.75.75 0 11-1.06-1.06l.71-.71-.71-.71a.75.75 0 010-1.06z" /></svg>;
const TipIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 3zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM5.75 8.75a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H5.75zm6 1.5a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zm.75 3.25a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5zM8.75 13a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 018.75 13zM10 8a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>;

interface AnnouncementItem {
    type: 'ANNOUNCEMENT' | 'QUOTE' | 'TIP' | 'SAFETY';
    content: {
        en: string;
        ar: string;
    };
    author?: string;
}

const announcements: AnnouncementItem[] = [
    {
        type: 'TIP',
        content: {
            en: "Engage actively in your classes, ask questions, and collaborate with your peers.",
            ar: "تفاعل بنشاط في الفصول الدراسية، اطرح الأسئلة، وتعاون مع زملائك."
        },
        author: "Tips for Success"
    },
    {
        type: 'SAFETY',
        content: {
            en: "Daily Safety Tip: Always wear appropriate PPE in designated workshop areas.",
            ar: "نصيحة السلامة اليومية: احرص دائمًا على ارتداء معدات الوقاية الشخصية المناسبة في مناطق الورش المحددة."
        },
        author: "NAVA Safety"
    },
    {
        type: 'QUOTE',
        content: {
            en: "The best way to predict the future is to create it.",
            ar: "أفضل طريقة لتنبؤ المستقبل هي أن تصنعه."
        },
        author: "Peter Drucker"
    },
    {
        type: 'ANNOUNCEMENT',
        content: {
            en: "Welcome to NAVA Today! We hope you have a pleasant experience and welcome all feedback for future improvements.",
            ar: "أهلاً بكم في نافا اليوم! نتمنى لكم تجربة ممتعة ونرحب بجميع ملاحظاتكم للتحسينات المستقبلية."
        }
    },
];

const getIconForType = (type: AnnouncementItem['type'], className: string) => {
    switch (type) {
        case 'ANNOUNCEMENT': return <BellIcon className={className} />;
        case 'QUOTE': return <QuoteIcon className={className} />;
        case 'TIP': return <TipIcon className={className} />;
        case 'SAFETY': return <SafetyIcon className={className} />;
    }
}

interface AnnouncementsMarqueeProps {
    language: 'en' | 'ar';
}

const AnnouncementsMarquee: React.FC<AnnouncementsMarqueeProps> = ({ language }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setIsFading(true);
            setTimeout(() => {
                setCurrentIndex(prev => (prev + 1) % announcements.length);
                setIsFading(false);
            }, 500); // fade out duration
        }, 20000); // 20 seconds per item

        return () => clearInterval(interval);
    }, []);

    const currentItem = announcements[currentIndex];
    const isAr = language === 'ar';

    let tagStyles = 'bg-indigo-100 text-indigo-600';
    // FIX: Explicitly type `tagLabel` as a string to allow assigning different string values (English/Arabic).
    let tagLabel: string = currentItem.type;

    switch (currentItem.type) {
        case 'QUOTE':
            tagStyles = 'bg-emerald-100 text-emerald-700';
            tagLabel = isAr ? 'اقتباس' : 'QUOTE';
            break;
        case 'TIP':
            tagStyles = 'bg-sky-100 text-sky-700';
            tagLabel = isAr ? 'نصيحة' : 'TIP';
            break;
        case 'SAFETY':
            tagStyles = 'bg-amber-100 text-amber-700';
            tagLabel = isAr ? 'سلامة' : 'SAFETY';
            break;
    }

    const iconStyles = `h-5 w-5`;

    return (
        <div 
            className="w-full flex flex-col items-center justify-center min-h-[150px]"
            dir={isAr ? 'rtl' : 'ltr'}
        >
            <div className={`w-full transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                <div className="flex flex-col items-center text-center">
                    
                    <div className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg shadow-md ${tagStyles}`}>
                        {getIconForType(currentItem.type, iconStyles)}
                        <span className="tracking-wide">{tagLabel}</span>
                    </div>

                    <p className="text-2xl font-semibold text-kiosk-text-title text-wrap-balance mt-4">
                        {currentItem.content[language] || currentItem.content['en']}
                    </p>
                    
                    {currentItem.author && (
                        <p className={`w-full text-base font-medium text-kiosk-text-muted mt-4 ${isAr ? 'text-left' : 'text-right'}`}>
                            &mdash; {currentItem.author}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnnouncementsMarquee;