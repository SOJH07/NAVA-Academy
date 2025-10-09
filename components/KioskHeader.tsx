import React from 'react';

interface KioskHeaderProps {
    onExitKiosk: () => void;
    language: 'en' | 'ar';
    setLanguage: (lang: 'en' | 'ar') => void;
    now: Date;
    weekNumber: number;
}

const KioskHeader: React.FC<KioskHeaderProps> = ({ onExitKiosk, language, setLanguage, now, weekNumber }) => {
    const formatTime = (date: Date) => new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Riyadh',
    }).format(date);

    const formattedDate = new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Riyadh',
    }).format(now);

    return (
        <header className="flex-shrink-0 flex justify-between items-center">
            <div className="flex items-center gap-6">
                <div>
                    <h1 className={`text-4xl font-black text-kiosk-text-title tracking-tight ${language === 'ar' ? 'font-bukra' : 'font-sans'}`} lang={language === 'ar' ? 'ar' : 'en'}>
                        {language === 'ar' ? 'نافا اليوم' : 'NAVA Today'}
                    </h1>
                    <p className={`text-lg text-kiosk-text-body font-medium`}>
                       {language === 'ar' ? `الأسبوع ${weekNumber} | يومك في لمحة` : `Week ${weekNumber} | Your Day at a Glance`}
                    </p>
                </div>
                <div className="pl-6 border-l-2 border-kiosk-border">
                    <p className={`text-2xl font-bold text-kiosk-text-title ${language === 'ar' ? 'font-bukra' : 'font-sans'}`}>{formattedDate}</p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="text-right">
                    <p className="font-black text-4xl text-kiosk-text-title tabular-nums drop-shadow-md">
                        {formatTime(now)}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 p-1 bg-kiosk-border rounded-xl">
                        <button 
                            onClick={() => setLanguage('en')}
                            className={`px-4 py-2 font-bold rounded-lg transition-colors ${language === 'en' ? 'bg-white text-kiosk-primary shadow-sm' : 'text-kiosk-text-muted'}`}
                            lang="en">EN</button>
                        <button 
                            onClick={() => setLanguage('ar')}
                            className={`px-4 py-2 font-bold rounded-lg transition-colors ${language === 'ar' ? 'bg-white text-kiosk-primary shadow-sm' : 'text-kiosk-text-muted'}`}
                            lang="ar">AR</button>
                    </div>
                    <button
                        onClick={onExitKiosk}
                        title={language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                        className="p-3 bg-white rounded-xl shadow-md hover:bg-slate-100 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-kiosk-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default KioskHeader;