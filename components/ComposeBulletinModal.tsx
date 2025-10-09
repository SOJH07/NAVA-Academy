import React, { useState } from 'react';
import useBulletinsStore, { BulletinType } from '../store/bulletinsStore';

interface ComposeBulletinModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ComposeBulletinModal: React.FC<ComposeBulletinModalProps> = ({ isOpen, onClose }) => {
    const { addBulletin } = useBulletinsStore();
    const [bodyEn, setBodyEn] = useState('');
    const [bodyAr, setBodyAr] = useState('');
    const [headlineEn, setHeadlineEn] = useState('');
    const [headlineAr, setHeadlineAr] = useState('');
    const [type, setType] = useState<BulletinType>('announcement');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!bodyEn.trim() && !bodyAr.trim()) return;
        
        addBulletin({
            type,
            headline: { 
                en: headlineEn.trim() || undefined,
                ar: headlineAr.trim() || undefined
            },
            body: { 
                en: bodyEn.trim(),
                ar: bodyAr.trim()
            },
            audience: 'all', // Simplified for now
            createdBy: 'Admin', // In a real app, this would come from user session
        });

        // Reset form and close
        onClose();
        setBodyEn('');
        setBodyAr('');
        setHeadlineEn('');
        setHeadlineAr('');
        setType('announcement');
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-panel p-6 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-4">Compose New Bulletin</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Type</label>
                        <select value={type} onChange={e => setType(e.target.value as BulletinType)} className="w-full border border-slate-300 dark:border-dark-border p-2 rounded mt-1 bg-white dark:bg-dark-body">
                            <option value="announcement">Announcement</option>
                            <option value="visit">Visit</option>
                            <option value="event">Event</option>
                            <option value="news">News</option>
                            <option value="quote">Quote</option>
                        </select>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Headline (English/Arabic)</label>
                        <div className="flex gap-2">
                            <input type="text" value={headlineEn} onChange={e => setHeadlineEn(e.target.value)} className="w-full border border-slate-300 dark:border-dark-border p-2 rounded mt-1 bg-white dark:bg-dark-body" placeholder="English Headline (Optional)" />
                            <input type="text" dir="rtl" value={headlineAr} onChange={e => setHeadlineAr(e.target.value)} className="w-full border border-slate-300 dark:border-dark-border p-2 rounded mt-1 bg-white dark:bg-dark-body" placeholder="العنوان بالعربية (اختياري)" />
                        </div>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Body (English/Arabic)</label>
                        <div className="flex gap-2">
                           <textarea value={bodyEn} onChange={e => setBodyEn(e.target.value)} className="w-full border border-slate-300 dark:border-dark-border p-2 rounded mt-1 h-24 bg-white dark:bg-dark-body" placeholder="English message..." required />
                           <textarea dir="rtl" value={bodyAr} onChange={e => setBodyAr(e.target.value)} className="w-full border border-slate-300 dark:border-dark-border p-2 rounded mt-1 h-24 bg-white dark:bg-dark-body" placeholder="الرسالة بالعربية..." />
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-dark-panel-hover rounded-lg font-semibold">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold">Post Bulletin</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ComposeBulletinModal;
