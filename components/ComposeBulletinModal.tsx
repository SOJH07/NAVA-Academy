import React, { useState } from 'react';
import useBulletinsStore, { BulletinType } from '../store/bulletinsStore';

interface ComposeBulletinModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ComposeBulletinModal: React.FC<ComposeBulletinModalProps> = ({ isOpen, onClose }) => {
    const { addBulletin } = useBulletinsStore();
    const [body, setBody] = useState('');
    const [title, setTitle] = useState('');
    const [type, setType] = useState<BulletinType>('announcement');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!body.trim()) return;
        addBulletin({
            type,
            headline: { en: title.trim() || undefined },
            body: { en: body.trim() },
            createdBy: 'Admin', // In a real app, this would come from user session
        });
        onClose();
        setBody('');
        setTitle('');
        setType('announcement');
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">Compose New Bulletin</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Type</label>
                        <select value={type} onChange={e => setType(e.target.value as BulletinType)} className="w-full border p-2 rounded mt-1">
                            <option value="announcement">Announcement</option>
                            <option value="visit">Visit</option>
                            <option value="event">Event</option>
                            <option value="news">News</option>
                            <option value="quote">Quote</option>
                        </select>
                    </div>
                     <div>
                        <label className="text-sm font-medium">Headline (Optional)</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border p-2 rounded mt-1" placeholder="e.g., Special Visit Today" />
                    </div>
                     <div>
                        <label className="text-sm font-medium">Body</label>
                        <textarea value={body} onChange={e => setBody(e.target.value)} className="w-full border p-2 rounded mt-1 h-32" placeholder="Message body..." required />
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-lg font-semibold">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold">Post Bulletin</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ComposeBulletinModal;