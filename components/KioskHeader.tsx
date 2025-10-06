import React, { useEffect, useState } from 'react';

interface KioskHeaderProps {
    onExitKiosk: () => void;
    language: 'en' | 'ar';
    setLanguage: (lang: 'en' | 'ar') => void;
    now: Date;
    weekNumber: number;
}

const KioskHeader: React.FC<KioskHeaderProps> = ({ onExitKiosk, language, setLanguage, now, weekNumber }) => {

    const gregorianDate = new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Riyadh',
    }).format(now);

    const hijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Riyadh',
    }).format(now);

    return (
        <header className="flex-shrink-0 flex justify-between items-center">
            <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-kiosk-primary rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.25278C12 6.25278 15.0163 3 19.5 3C22.5 3 24 4.5 24 7.5C24 10.5 22.5 12 19.5 12C15.0163 12 12 8.74722 12 8.74722" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.25278C12 6.25278 8.98375 3 4.5 3C1.5 3 0 4.5 0 7.5C0 10.5 1.5 12 4.5 12C8.98375 12 12 8.74722 12 8.74722" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.74722V21" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21H16.5" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-4xl font-black text-kiosk-text-title tracking-tight" lang="en">NAVA Academy Kiosk</h1>
                    <p className={`text-lg text-kiosk-text-body font-medium ${language === 'ar' ? 'font-kufi' : ''}`}>
                       {language === 'ar' ? 'عرض العمليات المباشرة' : 'Live Operations Display'}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className={`text-right ${language === 'ar' ? 'font-kufi' : ''}`}>
                    <p className="font-bold text-lg text-kiosk-text-title">{gregorianDate}</p>
                    <p className="font-semibold text-kiosk-text-body" dir="rtl">{hijriDate}</p>
                    <p className="font-semibold text-sm text-kiosk-text-muted">Week {weekNumber}</p>
                </div>
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
                <button onClick={onExitKiosk} className="bg-kiosk-panel text-kiosk-text-body text-xs font-semibold py-2 px-3 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 opacity-70 hover:opacity-100 z-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
            </div>
        </header>
    );
};

export default KioskHeader;
