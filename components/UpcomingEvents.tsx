import React, { useMemo } from 'react';
import useBulletinsStore, { Bulletin, quotesBank } from '../store/bulletinsStore';
import { isToday, isTomorrow, parseISO } from 'date-fns';

const CalendarIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>;
const BuildingIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-2 0v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" /></svg>;
const BellIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 12.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>;
const QuoteIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M6 2a2 2 0 00-2 2v8a2 2 0 002 2h2a2 2 0 002-2v-2H7a1 1 0 110-2h3V4a2 2 0 00-2-2H6zM14 2a2 2 0 00-2 2v8a2 2 0 002 2h2a2 2 0 002-2v-2h-3a1 1 0 110-2h3V4a2 2 0 00-2-2h-2z" /></svg>;

const getIconForType = (type: Bulletin['type']) => {
    switch(type) {
        case 'event': return <CalendarIcon />;
        case 'visit': return <BuildingIcon />;
        case 'announcement': return <BellIcon />;
        default: return <BellIcon />;
    }
}

const getAccentClasses = (accent?: string) => {
    switch (accent) {
        case 'blue': return { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-700', textLight: 'text-blue-600', title: 'text-blue-800', icon: 'text-blue-600' };
        case 'green': return { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-700', textLight: 'text-green-600', title: 'text-green-800', icon: 'text-green-600' };
        case 'amber': return { bg: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-700', textLight: 'text-amber-600', title: 'text-amber-800', icon: 'text-amber-600' };
        case 'violet': return { bg: 'bg-violet-50', border: 'border-violet-400', text: 'text-violet-700', textLight: 'text-violet-600', title: 'text-violet-800', icon: 'text-violet-600' };
        case 'emerald': return { bg: 'bg-emerald-50', border: 'border-emerald-400', text: 'text-emerald-700', textLight: 'text-emerald-600', title: 'text-emerald-800', icon: 'text-emerald-600' };
        default: return { bg: 'bg-slate-50', border: 'border-slate-400', text: 'text-slate-700', textLight: 'text-slate-600', title: 'text-slate-800', icon: 'text-slate-600' };
    }
}

interface UpcomingEventsProps {
    language: 'en' | 'ar';
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ language }) => {
    const { getActiveBulletins } = useBulletinsStore();

    const displayItem = useMemo(() => {
        const now = new Date();
        const activeBulletins = getActiveBulletins(now, 'all').filter(b => b.type !== 'news');
        
        const todayEvents = activeBulletins.filter(b => b.date && isToday(parseISO(b.date)));
        const tomorrowEvents = activeBulletins.filter(b => b.date && isTomorrow(parseISO(b.date)));
        const announcements = activeBulletins.filter(b => b.type === 'announcement');

        const highPriorityToday = todayEvents.find(b => b.priority === 'high');
        if (highPriorityToday) return highPriorityToday;

        const normalPriorityToday = todayEvents.find(b => b.priority !== 'high');
        if (normalPriorityToday) return normalPriorityToday;
        
        const highPriorityTomorrow = tomorrowEvents.find(b => b.priority === 'high');
        if (highPriorityTomorrow) return highPriorityTomorrow;

        const highPriorityAnnouncement = announcements.find(b => b.priority === 'high');
        if (highPriorityAnnouncement) return highPriorityAnnouncement;
        
        const normalPriorityTomorrow = tomorrowEvents.find(b => b.priority !== 'high');
        if (normalPriorityTomorrow) return normalPriorityTomorrow;

        if (announcements.length > 0) return announcements[0];
        
        return null; // Fallback to quote
    }, [getActiveBulletins]);
    
    const quoteOfTheDay = useMemo(() => {
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
        return quotesBank[dayOfYear % quotesBank.length];
    }, []);

    const renderBulletin = (bulletin: Bulletin) => {
        const icon = getIconForType(bulletin.type);
        const title = bulletin.headline?.[language] || bulletin.headline?.en;
        const body = bulletin.body[language] || bulletin.body.en;
        const accentClasses = getAccentClasses(bulletin.accent);
        
        let timeString = '';
        if (bulletin.date) {
            const date = parseISO(bulletin.date);
            if (isToday(date)) {
                timeString = language === 'ar' ? 'اليوم' : 'Today';
            } else if (isTomorrow(date)) {
                timeString = language === 'ar' ? 'غداً' : 'Tomorrow';
            }
            if (bulletin.timeStart) {
                timeString += ` @ ${bulletin.timeStart}`;
            }
        }

        return (
            <div className={`flex flex-col h-full ${accentClasses.bg} ${accentClasses.border} border-l-4 p-4 rounded-r-lg`}>
                <div className="flex items-center gap-3 mb-2">
                    <div className={accentClasses.icon}>{icon}</div>
                    <h4 className={`font-bold text-lg ${accentClasses.title}`}>{title}</h4>
                </div>
                <p className={`flex-grow text-base ${accentClasses.text}`}>{body}</p>
                {timeString && <p className={`mt-2 text-sm font-bold ${accentClasses.textLight} ${language === 'ar' ? 'self-start' : 'self-end'}`}>{timeString}</p>}
            </div>
        );
    }
    
    const renderQuote = () => {
        return (
             <div className="flex flex-col h-full justify-center p-4">
                <div className="flex items-start gap-3 mb-2">
                    <div className="text-slate-400"><QuoteIcon /></div>
                     <p className="flex-grow text-lg italic text-kiosk-text-body font-medium text-wrap-balance">
                        {quoteOfTheDay[language] || quoteOfTheDay.en}
                    </p>
                </div>
                <p className={`font-semibold text-kiosk-text-muted mt-2 ${language === 'ar' ? 'self-start' : 'self-end'}`}>&mdash; {quoteOfTheDay.author}</p>
            </div>
        )
    }

    return (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg animate-fade-in border border-slate-200 flex flex-col flex-grow min-h-[180px]">
            <h3 className="font-bold text-lg text-kiosk-text-title p-4 border-b border-slate-200 flex-shrink-0">
                {language === 'ar' ? 'على جدول الأعمال' : "What's On"}
            </h3>
            <div className="flex-grow">
                {displayItem ? renderBulletin(displayItem) : renderQuote()}
            </div>
        </div>
    );
};

export default UpcomingEvents;