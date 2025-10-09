import React from 'react';

interface EndOfDayBannerProps {
    language: 'en' | 'ar';
    onRestore: () => void;
}

const EndOfDayBanner: React.FC<EndOfDayBannerProps> = ({ language, onRestore }) => {
    return (
        <div className="flex-shrink-0 w-full bg-emerald-100 border border-emerald-300 rounded-lg p-3 flex items-center justify-between mb-4 animate-fade-in">
            <div className="flex items-center gap-4">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="font-bold text-emerald-800">
                    <p className="text-base">{language === 'ar' ? 'انتهى اليوم الدراسي' : 'Day Complete'}</p>
                    <p className="text-xs">{language === 'ar' ? 'نراكم قريباً!' : 'See you soon!'}</p>
                </div>
            </div>
            <button
                onClick={onRestore}
                className="bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg shadow-sm transition-transform hover:scale-105"
            >
                {language === 'ar' ? 'إظهار الرسالة' : 'Show Message'}
            </button>
        </div>
    );
};

export default EndOfDayBanner;
