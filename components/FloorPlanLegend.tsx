import React from 'react';

interface FloorPlanLegendProps {
    language: 'en' | 'ar';
}

const LegendItem: React.FC<{ label: string; children: React.ReactNode; }> = ({ label, children }) => (
    <div className="flex items-center gap-2">
        {children}
        <span className="text-xs font-medium text-kiosk-text-body">{label}</span>
    </div>
);

const LegendSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div className="flex items-center gap-x-4 gap-y-2">
        <span className="text-sm font-semibold text-kiosk-text-muted">{title}:</span>
        <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
            {children}
        </div>
    </div>
);

const FloorPlanLegend: React.FC<FloorPlanLegendProps> = ({ language }) => {
    const isArabic = language === 'ar';

    return (
        <div className={`mt-4 pt-4 border-t border-kiosk-border flex flex-col items-center justify-center gap-y-3 ${isArabic ? 'font-kufi' : ''}`}>
            <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-2" dir={isArabic ? 'rtl' : 'ltr'}>
                
                <LegendSection title={isArabic ? 'نوع الجلسة' : 'Session Type'}>
                    <LegendItem label={isArabic ? 'صناعي' : 'Industrial'}>
                        <div className="w-8 h-5 rounded-sm bg-kiosk-panel border-l-4 border-status-industrial shadow-sm"></div>
                    </LegendItem>
                    <LegendItem label={isArabic ? 'خدمات' : 'Service'}>
                        <div className="w-8 h-5 rounded-sm bg-kiosk-panel border-l-4 border-status-tech shadow-sm"></div>
                    </LegendItem>
                </LegendSection>

                <LegendSection title={isArabic ? 'الحالة' : 'Status'}>
                     <LegendItem label={isArabic ? 'متاح' : 'Available'}>
                        <div className="w-8 h-5 rounded-sm bg-white border border-slate-200 shadow-sm"></div>
                     </LegendItem>
                     <LegendItem label={isArabic ? 'خارج الخدمة' : 'Out of Service'}>
                        <div className="w-8 h-5 rounded-sm bg-amber-100 border border-amber-400 shadow-sm"></div>
                     </LegendItem>
                     <LegendItem label={isArabic ? 'محدد' : 'Selected'}>
                        <div className="w-8 h-5 rounded-sm bg-kiosk-panel ring-2 ring-offset-1 ring-kiosk-primary shadow-sm"></div>
                     </LegendItem>
                </LegendSection>

            </div>
        </div>
    );
};

export default FloorPlanLegend;