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

    return (
        <header className="flex-shrink-0 flex justify-between items-center">
            <div>
                <h1 className={`text-4xl font-black text-kiosk-text-title tracking-tight font-montserrat ${language === 'ar' ? 'font-kufi' : ''}`} lang={language === 'ar' ? 'ar' : 'en'}>
                    {language === 'ar' ? 'نافا اليوم' : 'NAVA Today'}
                </h1>
                <p className={`text-lg text-kiosk-text-body font-medium ${language === 'ar' ? 'font-kufi' : ''}`}>
                   {language === 'ar' ? `الأسبوع ${weekNumber} | يومك في لمحة` : `Week ${weekNumber} | Your Day at a Glance`}
                </p>
            </div>

            <div className="flex items-center gap-6">
                <div className="text-right">
                    <p className="font-black text-4xl text-kiosk-primary tabular-nums drop-shadow-md">
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
            </div>
        </header>
    );
};

export default KioskHeader;