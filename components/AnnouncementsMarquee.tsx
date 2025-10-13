import React, { useState, useEffect, useMemo } from 'react';
import useBulletinsStore, { Bulletin } from '../store/bulletinsStore';

const BellIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 12.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>;

const getAccentClasses = (accent: Bulletin['accent']) => {
    switch (accent) {
        case 'green':
        case 'emerald':
            return 'bg-emerald-100 text-emerald-800';
        case 'blue':
            return 'bg-blue-100 text-blue-800';
        case 'amber':
            return 'bg-amber-100 text-amber-800';
        case 'violet':
            return 'bg-violet-100 text-violet-800';
        default:
            return 'bg-slate-200 text-slate-800';
    }
};

const defaultBulletin: Bulletin = {
    id: 'default-welcome',
    type: 'announcement',
    headline: { en: "Welcome to NAVA Today!", ar: "أهلاً بكم في نافا اليوم!" },
    body: { en: "We hope you have a pleasant experience and welcome all feedback for future improvements.", ar: "نتمنى لكم تجربة ممتعة ونرحب بجميع ملاحظاتكم للتحسينات المستقبلية." },
    accent: 'blue',
    createdBy: 'System',
    createdAt: new Date().toISOString()
};


interface AnnouncementsMarqueeProps {
    language: 'en' | 'ar';
}

const AnnouncementsMarquee: React.FC<AnnouncementsMarqueeProps> = ({ language }) => {
    const getActiveBulletins = useBulletinsStore(state => state.getActiveBulletins);
    const [now, setNow] = useState(new Date());
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        // This timer is just to re-evaluate active bulletins periodically
        const timer = setInterval(() => setNow(new Date()), 30000); // Every 30 seconds
        return () => clearInterval(timer);
    }, []);

    const bulletins = useMemo(() => {
        const active = getActiveBulletins(now);
        return active.length > 0 ? active : [defaultBulletin];
    }, [now, getActiveBulletins]);

    useEffect(() => {
        if (bulletins.length <= 1) return;

        const timer = setInterval(() => {
            setIsFading(true);
            setTimeout(() => {
                setCurrentIndex(prev => (prev + 1) % bulletins.length);
                setIsFading(false);
            }, 300); // Transition duration
        }, 10000); // Change every 10 seconds

        return () => clearInterval(timer);
    }, [bulletins.length]);
    
    const currentBulletin = bulletins[currentIndex];
    const isAr = language === 'ar';
    const headline = (isAr && currentBulletin.headline?.ar) || currentBulletin.headline?.en;
    const body = (isAr && currentBulletin.body.ar) || currentBulletin.body.en;

    return (
        <div className="w-full bg-slate-50/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200/80 shadow-md flex flex-col justify-center min-h-[140px]">
            <div 
                className={`transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}
                dir={isAr ? 'rtl' : 'ltr'}
            >
                <div className="flex flex-col items-center text-center">
                    <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg ${getAccentClasses(currentBulletin.accent)}`}>
                        <BellIcon className="h-4 w-4" />
                        <span className="tracking-wide uppercase">{currentBulletin.type}</span>
                    </div>
                    {headline && (
                        <h3 className="text-xl font-bold text-kiosk-text-title text-wrap-balance mt-3">
                            {headline}
                        </h3>
                    )}
                    <p className={`font-medium text-kiosk-text-body text-wrap-balance ${headline ? 'mt-1 text-base' : 'mt-3 text-lg'}`}>
                        {body}
                    </p>
                </div>
            </div>

            {bulletins.length > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                    {bulletins.map((_, index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-kiosk-primary' : 'bg-slate-300'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AnnouncementsMarquee;