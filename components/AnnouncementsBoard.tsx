import React, { useState } from 'react';
import useBulletinsStore, { Bulletin } from '../store/bulletinsStore';
import useKioskStore from '../store/kioskStore';
import ComposeBulletinModal from './ComposeBulletinModal';

const BulletinCard: React.FC<{ bulletin: Bulletin }> = ({ bulletin }) => {
    return (
        // FIX: Replaced 'bulletin.title' with 'bulletin.headline.en' to match the 'Bulletin' type definition.
        <div className={`p-3 rounded-lg border-l-4 border-${bulletin.accent}-400 bg-${bulletin.accent}-50 text-${bulletin.accent}-800`}>
            {bulletin.headline?.en && <h4 className="font-bold">{bulletin.headline.en}</h4>}
            {/* FIX: Replaced 'bulletin.body' with 'bulletin.body.en' to render the string content instead of the I18N object. */}
            <p className="text-sm">{bulletin.body.en}</p>
        </div>
    )
}

const AnnouncementsBoard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'announcements' | 'news' | 'quotes'>('announcements');
    const { bulletins } = useBulletinsStore();
    const { kioskMode } = useKioskStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const visibleBulletins = bulletins.filter(b => {
        const now = new Date();
        const start = b.startAt ? new Date(b.startAt) : null;
        const end = b.endAt ? new Date(b.endAt) : null;
        if (start && now < start) return false;
        if (end && now > end) return false;
        
        switch (activeTab) {
            case 'announcements': return b.type === 'announcement' || b.type === 'visit' || b.type === 'event';
            case 'news': return b.type === 'news';
            case 'quotes': return b.type === 'quote';
            default: return false;
        }
    });

    return (
        <div className="bg-white/90 backdrop-blur-md border rounded-xl shadow-lg p-3 flex-shrink-0">
            {kioskMode === 'admin' && <ComposeBulletinModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1 p-1 bg-slate-200 rounded-lg">
                    <button onClick={() => setActiveTab('announcements')} className={`px-3 py-1 text-sm font-semibold rounded ${activeTab === 'announcements' ? 'bg-white shadow' : 'text-slate-500 hover:bg-white/60'}`}>Announcements</button>
                    <button onClick={() => setActiveTab('news')} className={`px-3 py-1 text-sm font-semibold rounded ${activeTab === 'news' ? 'bg-white shadow' : 'text-slate-500 hover:bg-white/60'}`}>News</button>
                    <button onClick={() => setActiveTab('quotes')} className={`px-3 py-1 text-sm font-semibold rounded ${activeTab === 'quotes' ? 'bg-white shadow' : 'text-slate-500 hover:bg-white/60'}`}>Quotes</button>
                </div>
                {kioskMode === 'admin' && (
                    <button onClick={() => setIsModalOpen(true)} className="px-3 py-1 text-sm font-bold bg-nava-blue text-white rounded-lg shadow hover:bg-nava-blue/90">+</button>
                )}
            </div>
            <div className="h-24 overflow-y-auto space-y-2 pr-1">
                {visibleBulletins.length > 0 
                    ? visibleBulletins.map(b => <BulletinCard key={b.id} bulletin={b} />)
                    : <p className="text-sm text-center text-slate-500 pt-8">No items to display.</p>
                }
            </div>
        </div>
    )
}

export default AnnouncementsBoard;