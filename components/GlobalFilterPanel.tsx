import React, { useState } from 'react';
import type { LiveOpsFilters } from '../types';
import useFilterPresetsStore, { FilterPreset } from '../hooks/useFilterPresetsStore';

interface FilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    filters: LiveOpsFilters;
    setFilters: (update: LiveOpsFilters | ((prev: LiveOpsFilters) => LiveOpsFilters)) => void;
    toggleArrayFilter: (filterType: 'companies' | 'techTracks' | 'techGroups' | 'classrooms' | 'aptisCEFRLevels' | 'technicalGrades' | 'performanceSegments', value: string) => void;
    clearFilters: () => void;
    allFilterOptions: {
        allCompanies: string[];
        allTechTracks: string[];
        allTechGroups: string[];
        allClassrooms: string[];
        allAptisCEFRLevels: string[];
    };
}

const FilterPill: React.FC<{ label: string; onClick: () => void; isActive: boolean; className?: string;}> = ({ label, onClick, isActive, className = '' }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 text-sm rounded-lg transition-all border ${
            isActive
                ? 'bg-brand-primary border-brand-primary text-white font-semibold shadow-sm'
                : 'bg-white dark:bg-dark-panel border-slate-300 dark:border-dark-border text-text-secondary dark:text-dark-text-secondary hover:bg-bg-panel-hover dark:hover:bg-dark-panel-hover hover:border-slate-400'
        } ${className}`}
    >
        {label}
    </button>
);

const FilterSection: React.FC<{ title: string; children: React.ReactNode, initiallyOpen?: boolean }> = ({ title, children, initiallyOpen = false }) => (
    <details className="py-4 border-b border-slate-200 dark:border-dark-border" open={initiallyOpen}>
        <summary className="font-semibold text-text-secondary dark:text-dark-text-secondary cursor-pointer hover:text-text-primary dark:hover:text-dark-text-primary transition-colors px-4 list-none flex justify-between items-center">
            {title}
            <svg className="w-4 h-4 transition-transform transform details-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </summary>
        <div className="pt-4 px-4">
            {children}
        </div>
        <style>{`
            details summary::-webkit-details-marker { display: none; }
            details[open] .details-arrow { transform: rotate(180deg); }
        `}</style>
    </details>
);

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

const allTechnicalGrades: Record<string, string> = { 'D': 'Distinction', 'M': 'Merit', 'P': 'Pass', 'UC': 'Unclassified' };
const allPerformanceSegments = ['High Achievers', 'Technically Strong', 'Linguistically Strong', 'Needs Support', 'Standard'];

const GlobalFilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose, filters, setFilters, toggleArrayFilter, clearFilters, allFilterOptions }) => {
    const { allCompanies, allTechTracks, allTechGroups, allClassrooms, allAptisCEFRLevels } = allFilterOptions;
    const { presets, addPreset, deletePreset } = useFilterPresetsStore();
    const [newPresetName, setNewPresetName] = useState('');

    const handleSavePreset = () => {
        if (newPresetName.trim() === '') return;
        const newPreset: FilterPreset = {
            id: new Date().toISOString(),
            name: newPresetName.trim(),
            filters: filters,
        };
        addPreset(newPreset);
        setNewPresetName('');
    };

    const handleApplyPreset = (preset: FilterPreset) => {
        setFilters(() => preset.filters);
        onClose();
    };

    const handleGpaChange = (type: 'min' | 'max', value: string) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue) && value !== '') return;

        const [min, max] = filters.gpaRange;
        let newRange: [number, number] = [min, max];

        if (type === 'min') {
            newRange = [value === '' ? 0 : numValue, max];
        } else {
            newRange = [min, value === '' ? 4 : numValue];
        }

        if (newRange[0] > newRange[1]) {
            if (type === 'min') newRange[1] = newRange[0];
            else newRange[0] = newRange[1];
        }
        newRange[0] = Math.max(0, newRange[0]);
        newRange[1] = Math.min(4, newRange[1]);
        
        setFilters(f => ({ ...f, gpaRange: newRange }));
    };
    
    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/30 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>
            <aside 
                className={`fixed top-0 right-0 h-full bg-bg-panel w-full max-w-sm z-50 shadow-xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-200 dark:border-dark-border">
                    <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">Filters</h3>
                    <div className="flex items-center gap-4">
                         <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-700 font-semibold transition-colors">Clear All</button>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-dark-panel-hover">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-muted dark:text-dark-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </header>
                <div className="flex-grow overflow-y-auto">
                    <FilterSection title="Saved Presets">
                        {presets.length === 0 ? (
                            <p className="text-sm text-text-muted italic">No saved presets. Save one below!</p>
                        ) : (
                            <ul className="space-y-2">
                                {presets.map(preset => (
                                    <li key={preset.id} className="flex items-center justify-between gap-2 p-2 pr-1 rounded-lg bg-slate-100 dark:bg-dark-panel">
                                        <span className="font-semibold text-text-primary dark:text-dark-text-primary truncate">{preset.name}</span>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button onClick={() => handleApplyPreset(preset)} className="px-3 py-1 text-sm font-bold text-brand-primary bg-white dark:bg-dark-panel-hover border border-slate-200 dark:border-dark-border rounded-md hover:bg-brand-primary-light transition-colors">Apply</button>
                                            <button onClick={() => deletePreset(preset.id)} className="p-2 text-red-500 rounded-md hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors" title={`Delete "${preset.name}"`}>
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </FilterSection>
                    <FilterSection title="General">
                         <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            <span className="font-medium text-text-secondary dark:text-dark-text-secondary text-sm w-24">Company:</span>
                            <div className="flex flex-wrap gap-2">
                                {allCompanies.map(c => <FilterPill key={c} label={c} isActive={filters.companies.includes(c)} onClick={() => toggleArrayFilter('companies', c)} />)}
                            </div>
                        </div>
                    </FilterSection>

                    <FilterSection title="Academic Performance">
                        <div className="space-y-4">
                            <div>
                                <h5 className="font-medium text-text-secondary dark:text-dark-text-muted text-sm mb-2">GPA Range</h5>
                                <div className="flex items-center gap-2">
                                    <input type="number" value={filters.gpaRange[0]} onChange={e => handleGpaChange('min', e.target.value)} min="0" max="4" step="0.1" className="w-full p-2 border border-slate-300 dark:border-dark-border rounded-md bg-white dark:bg-dark-body" />
                                    <span className="text-text-muted dark:text-dark-text-muted">-</span>
                                    <input type="number" value={filters.gpaRange[1]} onChange={e => handleGpaChange('max', e.target.value)} min="0" max="4" step="0.1" className="w-full p-2 border border-slate-300 dark:border-dark-border rounded-md bg-white dark:bg-dark-body" />
                                </div>
                            </div>
                            <div>
                                <h5 className="font-medium text-text-secondary dark:text-dark-text-muted text-sm mb-2">Technical Grades</h5>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(allTechnicalGrades).map(([grade, label]) => 
                                        <FilterPill key={grade} label={`${label} (${grade})`} isActive={filters.technicalGrades.includes(grade)} onClick={() => toggleArrayFilter('technicalGrades', grade)} />
                                    )}
                                </div>
                            </div>
                             <div>
                                <h5 className="font-medium text-text-secondary dark:text-dark-text-muted text-sm mb-2">Performance Segment</h5>
                                <div className="flex flex-wrap gap-2">
                                    {allPerformanceSegments.map(segment => <FilterPill key={segment} label={segment} isActive={filters.performanceSegments.includes(segment)} onClick={() => toggleArrayFilter('performanceSegments', segment)} />)}
                                </div>
                            </div>
                             <div>
                                <h5 className="font-medium text-text-secondary dark:text-dark-text-muted text-sm mb-2">CEFR Level</h5>
                                <div className="flex flex-wrap gap-2">
                                    {allAptisCEFRLevels.map(level => <FilterPill key={level} label={level} isActive={filters.aptisCEFRLevels.includes(level)} onClick={() => toggleArrayFilter('aptisCEFRLevels', level)} />)}
                                </div>
                            </div>
                        </div>
                    </FilterSection>

                    <FilterSection title="Technical Program">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            <span className="font-medium text-text-secondary dark:text-dark-text-muted text-sm w-24">Tech Track:</span>
                             <div className="flex flex-wrap gap-2">
                                {allTechTracks.map(t => <FilterPill key={t} label={t} isActive={filters.techTracks.includes(t)} onClick={() => toggleArrayFilter('techTracks', t)} />)}
                            </div>
                        </div>
                    </FilterSection>

                    <FilterSection title="Live Operations">
                         <div className="space-y-4">
                             <div>
                                <h5 className="font-medium text-text-secondary dark:text-dark-text-muted text-sm mb-2">Status</h5>
                                <div className="flex flex-wrap gap-2">
                                    <FilterPill label="All" isActive={filters.status === 'all'} onClick={() => setFilters(f => ({...f, status: 'all'}))} />
                                    <FilterPill label="Live" isActive={filters.status === 'live'} onClick={() => setFilters(f => ({...f, status: 'live'}))} />
                                    <FilterPill label="Not Live" isActive={filters.status === 'not-live'} onClick={() => setFilters(f => ({...f, status: 'not-live'}))} />
                                </div>
                            </div>
                             <div>
                                <h5 className="font-medium text-text-secondary dark:text-dark-text-muted text-sm mb-2">Session Type</h5>
                                <div className="flex flex-wrap gap-2">
                                    <FilterPill label="All" isActive={filters.sessionType === 'all'} onClick={() => setFilters(f => ({...f, sessionType: 'all'}))} />
                                    <FilterPill label="Tech" isActive={filters.sessionType === 'tech'} onClick={() => setFilters(f => ({...f, sessionType: 'tech'}))} />
                                    <FilterPill label="Professional" isActive={filters.sessionType === 'professional'} onClick={() => setFilters(f => ({...f, sessionType: 'professional'}))} />
                                </div>
                            </div>
                         </div>
                    </FilterSection>

                    <FilterSection title="Specific Groups & Classrooms">
                        <div className="space-y-4">
                             <div>
                                <h5 className="font-medium text-text-secondary dark:text-dark-text-muted text-sm mb-2">Technical Groups</h5>
                                <div className="flex flex-wrap gap-1.5">
                                    {allTechGroups.map(g => <FilterPill key={g} label={g} isActive={filters.techGroups.includes(g)} onClick={() => toggleArrayFilter('techGroups', g)} />)}
                                </div>
                            </div>
                            <div>
                                <h5 className="font-medium text-text-secondary dark:text-dark-text-muted text-sm mb-2">Classrooms</h5>
                                <div className="flex flex-wrap gap-1.5">
                                    {allClassrooms.map(c => <FilterPill key={c} label={c} isActive={filters.classrooms.includes(c)} onClick={() => toggleArrayFilter('classrooms', c)} />)}
                                </div>
                            </div>
                        </div>
                    </FilterSection>
                </div>
                <footer className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-panel space-y-2">
                    <h4 className="font-semibold text-text-secondary dark:text-dark-text-secondary text-sm">Save Current Filter Set</h4>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Preset Name (e.g., Ceer Industrial)" 
                            value={newPresetName}
                            onChange={(e) => setNewPresetName(e.target.value)}
                            className="flex-grow bg-white dark:bg-dark-body border border-slate-300 dark:border-dark-border rounded-lg py-2 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        />
                        <button
                            onClick={handleSavePreset}
                            disabled={!newPresetName.trim()}
                            className="flex-shrink-0 px-4 py-2 bg-brand-secondary text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                            title="Save Preset"
                        >
                            Save
                        </button>
                    </div>
                </footer>
            </aside>
        </>
    );
};

export default GlobalFilterPanel;