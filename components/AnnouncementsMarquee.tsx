import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import useBulletinsStore, { Bulletin, quotesForPeriod } from '../store/bulletinsStore';
import useKioskStore from '../store/kioskStore';
import ComposeBulletinModal from './ComposeBulletinModal';

// --- ICONS ---
const QuoteIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-emerald-400" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-9.57v3.543c-2.782 0-4.017 1.349-4.017 3.543v3.305H23V21h-8.983zM.017 21v-7.391c0-5.704 3.731-9.57 8.983-9.57v3.543C6.218 7.582 5.017 8.931 5.017 11.125v3.305H14V21H.017z" /></svg>;
const MegaphoneIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 12.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>;
const BuildingIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-2 0v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" /></svg>;
const NewspaperIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" /><path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" /></svg>;
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
const ArrowRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>;


const getIconForBulletin = (bulletin: Bulletin) => {
    let accentClass = 'text-slate-400';
    if(bulletin.accent) {
        accentClass = `text-${bulletin.accent}-400`;
    }
    const className = `h-5 w-5 flex-shrink-0 ${accentClass}`;

    switch (bulletin.type) {
        case 'visit': return <BuildingIcon className={className} />;
        case 'event': return <MegaphoneIcon className={className} />;
        case 'news':
        case 'announcement': return <NewspaperIcon className={className} />;
        case 'quote': return <QuoteIcon />;
        default: return <NewspaperIcon className={className} />;
    }
};

const AnnouncementsMarquee: React.FC<{ language: 'en' | 'ar', currentPeriod: {name: string} | null }> = ({ language, currentPeriod }) => {
    const { getActiveBulletins } = useBulletinsStore();
    const { kioskMode } = useKioskStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const timerRef = useRef<number | null>(null);

    const visibleItems = useMemo(() => {
        const now = new Date();
        const activeAnnouncements: Bulletin[] = getActiveBulletins(now, 'students');

        if (activeAnnouncements.length > 0) {
            return activeAnnouncements;
        }

        const periodName = currentPeriod?.name;
        const periodIndex = periodName && periodName.startsWith('P') ? parseInt(periodName.substring(1), 10) : 0;
        const periodQuotes = quotesForPeriod(periodIndex, now);
        
        return periodQuotes.map((q, i): Bulletin => ({
            id: `quote-${periodName || 'break'}-${i}-${now.getDate()}`,
            type: 'quote',
            body: { en: q.en, ar: q.ar },
            author: q.author,
            audience: 'all',
            createdBy: q.author || 'NAVA',
            createdAt: now.toISOString(),
            accent: 'emerald'
        }));
    }, [getActiveBulletins, currentPeriod]);

    const handleNext = useCallback(() => {
        setCurrentIndex(prev => (prev + 1) % (visibleItems.length || 1));
    }, [visibleItems.length]);

    const handlePrev = () => {
        setCurrentIndex(prev => (prev - 1 + visibleItems.length) % (visibleItems.length || 1));
    };

    const resetTimer = useCallback(() => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
        if (!isPaused && visibleItems.length > 1) {
            const currentItem = visibleItems[currentIndex];
            const duration = currentItem?.priority === 'high' ? 13000 : 9000;
            timerRef.current = window.setTimeout(handleNext, duration);
        }
    }, [isPaused, handleNext, visibleItems, currentIndex]);
    
    useEffect(() => {
        resetTimer();
        return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
    }, [currentIndex, isPaused, resetTimer]);
    
    useEffect(() => {
        // Reset to first item when the list of items changes
        setCurrentIndex(0);
    }, [visibleItems]);

    const isAr = language === 'ar';

    return (
        <div 
            className="min-h-[56px] rounded-2xl bg-slate-900 text-slate-50 px-5 py-3 border border-slate-700 shadow-sm flex items-center justify-between gap-4"
            onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}
            dir={isAr ? 'rtl' : 'ltr'}
        >
            {kioskMode === 'admin' && <ComposeBulletinModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
            
            <div className="flex-grow h-full overflow-hidden relative">
                {visibleItems.length > 0 ? (
                    visibleItems.map((item, index) => {
                        const headline = item.headline?.[language] || item.headline?.en;
                        const body = item.body[language] || item.body.en;
                        const isQuote = item.type === 'quote';

                        return (
                            <div 
                                key={item.id}
                                className="absolute inset-0 flex items-center transition-opacity duration-500"
                                style={{ opacity: index === currentIndex ? 1 : 0 }}
                                aria-hidden={index !== currentIndex}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    {getIconForBulletin(item)}
                                    <div className="flex-grow min-w-0">
                                        {headline && <p className="font-bold text-slate-100 truncate text-sm">{headline}</p>}
                                        <p className={`text-slate-200 truncate ${headline ? 'text-xs' : 'text-sm'}`}>
                                            {body}
                                            {isQuote && item.author && <span className="font-semibold tracking-wide ml-2 text-slate-400">&mdash; {item.author}</span>}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex items-center h-full text-slate-400">No announcements available.</div>
                )}
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
                 {visibleItems.length > 1 && (
                    <div className="flex items-center gap-3">
                        <button onClick={() => { handlePrev(); resetTimer(); }} className="p-1 text-slate-400 hover:text-white" aria-label="Previous"><ArrowLeftIcon/></button>
                        <div className="flex items-center gap-1.5">
                            {visibleItems.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? 'bg-white' : 'bg-slate-600 hover:bg-slate-400'}`}
                                    aria-label={`Go to item ${index + 1}`}
                                />
                            ))}
                        </div>
                        <button onClick={() => { handleNext(); resetTimer(); }} className="p-1 text-slate-400 hover:text-white" aria-label="Next"><ArrowRightIcon/></button>
                    </div>
                )}
                {kioskMode === 'admin' && (
                    <button onClick={() => setIsModalOpen(true)} className="px-3 py-1 text-sm font-bold bg-brand-primary text-slate-900 rounded-lg shadow hover:bg-brand-primary/90" title="Compose New Bulletin">+</button>
                )}
            </div>
        </div>
    );
};

export default AnnouncementsMarquee;
