import React from 'react';

interface KioskHeaderProps {
    onExitKiosk: () => void;
    language: 'en' | 'ar';
    setLanguage: (lang: 'en' | 'ar') => void;
    // FIX: Add 'now' and 'weekNumber' props to support displaying time and week in the header.
    now: Date;
    weekNumber: number;
}

const KioskHeader: React.FC<KioskHeaderProps> = ({ onExitKiosk, language, setLanguage, now, weekNumber }) => {
    const formatTime = (date: Date) => new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'Asia/Riyadh',
    }).format(date);

    return (
        <header className="flex-shrink-0 flex justify-between items-center">
            <div>
                <h1 className={`text-4xl font-black text-kiosk-text-title tracking-tight ${language === 'ar' ? 'font-kufi' : ''}`} lang={language === 'ar' ? 'ar' : 'en'}>
                    {language === 'ar' ? 'نافا اليوم' : 'NAVA Today'}
                </h1>
                <p className={`text-lg text-kiosk-text-body font-medium ${language === 'ar' ? 'font-kufi' : ''}`}>
                   {language === 'ar' ? `الأسبوع ${weekNumber} | يومك في لمحة` : `Week ${weekNumber} | Your Day at a Glance`}
                </p>
            </div>

            <div className="flex items-center gap-6">
                <div className="text-right">
                    <p className="font-black text-4xl text-kiosk-text-title tabular-nums drop-shadow-md">
                        {formatTime(now)}
                    </p>
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
