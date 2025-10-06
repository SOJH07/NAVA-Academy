import React from 'react';

interface LoadDataItem {
    instructor: string;
    tech: number;
    pd: number;
    type: 'tech' | 'professional';
}

interface TeachingLoadProps {
    loadData: LoadDataItem[];
    focusedInstructor: string | null;
    setFocusedInstructor: (instructor: string | null) => void;
}

const LoadSection: React.FC<{
    title: string;
    data: LoadDataItem[];
    colorClass: string;
    max: number;
    focusedInstructor: string | null;
    setFocusedInstructor: (instructor: string | null) => void;
}> = ({ title, data, colorClass, max, focusedInstructor, setFocusedInstructor }) => {
    
    if (data.length === 0) return null;

    const isTech = colorClass.includes('tech');
    const borderClass = isTech ? 'border-status-tech' : 'border-status-professional';

    return (
        <div>
            <h4 className={`font-bold text-lg mb-4 px-1 pb-2 border-b-2 ${borderClass} ${colorClass}`}>{title}</h4>
            <ul className="space-y-4">
                {data.map(({ instructor, tech, pd }) => {
                    const isFocused = focusedInstructor === instructor;
                    const isDimmed = focusedInstructor && !isFocused;
                    const totalCount = tech + pd;
                    const widthPercent = max > 0 ? (totalCount / max) * 100 : 0;
                    
                    return (
                        <li key={instructor} className={`transition-opacity duration-300 ${isDimmed ? 'opacity-40 hover:opacity-100' : 'opacity-100'}`}>
                            <button
                                className="w-full text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary rounded-lg p-1"
                                onClick={() => setFocusedInstructor(isFocused ? null : instructor)}
                                title={`Focus on ${instructor}`}
                            >
                                <div className="flex justify-between items-center text-sm mb-1 px-1">
                                    <span className={`font-semibold ${isFocused ? colorClass : 'text-text-primary dark:text-dark-text-primary'}`}>{instructor}</span>
                                    <span className={`font-bold ${isFocused ? colorClass : 'text-text-primary dark:text-dark-text-primary'}`}>{totalCount} {totalCount === 1 ? 'period' : 'periods'}</span>
                                </div>
                                <div className={`bg-slate-200 dark:bg-dark-panel-hover rounded-full h-2.5 w-full overflow-hidden ${isFocused ? 'ring-2 ring-offset-1 ring-brand-primary/50' : ''}`}>
                                    <div
                                        className={`${isFocused ? colorClass.replace('text-', 'bg-') : 'bg-slate-400 dark:bg-slate-500'} h-full rounded-full transition-all duration-500`}
                                        style={{ width: `${widthPercent}%` }}
                                    ></div>
                                </div>
                                {(tech > 0 && pd > 0) && (
                                    <div className="text-xs text-right mt-1 px-1 text-text-muted dark:text-dark-text-muted">
                                        {tech} Tech, {pd} PD
                                    </div>
                                )}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

const TeachingLoad: React.FC<TeachingLoadProps> = ({ loadData, focusedInstructor, setFocusedInstructor }) => {
    
    const techLoad = loadData.filter(d => d.type === 'tech').sort((a,b) => (b.tech + b.pd) - (a.tech + a.pd));
    const professionalLoad = loadData.filter(d => d.type === 'professional').sort((a,b) => (b.tech + b.pd) - (a.tech + a.pd));
    const maxLoad = Math.max(...loadData.map(d => d.tech + d.pd), 0);

    return (
        <div className="bg-bg-panel dark:bg-dark-panel border border-slate-200 dark:border-dark-border rounded-lg shadow-sm h-full flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-dark-border flex-shrink-0">
                <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">Weekly Teaching Load Analysis</h3>
                <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">Total teaching periods assigned to each instructor for the selected week. Click an instructor to focus their schedule.</p>
            </div>
            <div className="flex-grow overflow-y-auto p-4 md:p-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <LoadSection 
                        title="Technical Instructors" 
                        data={techLoad} 
                        colorClass="text-status-tech" 
                        max={maxLoad} 
                        focusedInstructor={focusedInstructor}
                        setFocusedInstructor={setFocusedInstructor}
                    />
                     <LoadSection 
                        title="Professional Development" 
                        data={professionalLoad} 
                        colorClass="text-status-professional" 
                        max={maxLoad} 
                        focusedInstructor={focusedInstructor}
                        setFocusedInstructor={setFocusedInstructor}
                    />
                 </div>
            </div>
        </div>
    );
};

export default TeachingLoad;