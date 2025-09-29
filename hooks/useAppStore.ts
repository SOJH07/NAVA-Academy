import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LiveOpsFilters } from '../types';

const INITIAL_FILTERS: LiveOpsFilters = {
    status: 'all',
    companies: [],
    techTracks: [],
    techGroups: [],
    classrooms: [],
    aptisCEFRLevels: [],
    sessionType: 'all',
    technicalGrades: [],
    performanceSegments: [],
    gpaRange: [0, 4],
};

// FIX: Added a helper function to calculate the number of active filters.
const calculateActiveFilterCount = (filters: LiveOpsFilters): number => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.sessionType !== 'all') count++;
    if (filters.gpaRange[0] > 0 || filters.gpaRange[1] < 4) count++;
    
    count += filters.companies.length;
    count += filters.techTracks.length;
    count += filters.techGroups.length;
    count += filters.classrooms.length;
    count += filters.aptisCEFRLevels.length;
    count += filters.technicalGrades.length;
    count += filters.performanceSegments.length;
    
    return count;
};

type FilterArrayType = 'companies' | 'techTracks' | 'techGroups' | 'classrooms' | 'aptisCEFRLevels' | 'technicalGrades' | 'performanceSegments';

interface AppState {
  activePage: string;
  setActivePage: (pageId: string) => void;
  globalSearchTerm: string;
  setGlobalSearchTerm: (term: string) => void;
  filters: LiveOpsFilters;
  setFilters: (update: LiveOpsFilters | ((prev: LiveOpsFilters) => LiveOpsFilters)) => void;
  clearFilters: () => void;
  toggleArrayFilter: (filterType: FilterArrayType, value: string) => void;
  toggleSessionTypeFilter: (sessionType: 'tech' | 'professional') => void;
  // FIX: Added activeFilterCount to the state.
  activeFilterCount: number;
}

const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activePage: 'kpiOverview',
      setActivePage: (pageId) => set({ activePage: pageId }),
      globalSearchTerm: '',
      setGlobalSearchTerm: (term) => set({ globalSearchTerm: term }),
      filters: INITIAL_FILTERS,
      // FIX: Initialize and update activeFilterCount whenever filters change.
      activeFilterCount: 0,
      setFilters: (update) => set((state) => {
        const newFilters = typeof update === 'function' ? update(state.filters) : update;
        return { 
            filters: newFilters,
            activeFilterCount: calculateActiveFilterCount(newFilters)
        };
      }),
      clearFilters: () => set({ filters: INITIAL_FILTERS, globalSearchTerm: '', activeFilterCount: 0 }),
      toggleArrayFilter: (filterType, value) => set(state => {
        const currentFilterValues = state.filters[filterType] as string[];
        const newFilterValues = currentFilterValues.includes(value)
            ? currentFilterValues.filter(item => item !== value)
            : [...currentFilterValues, value];
        const newFilters = { ...state.filters, [filterType]: newFilterValues };
        return { 
            filters: newFilters,
            activeFilterCount: calculateActiveFilterCount(newFilters)
        };
      }),
      toggleSessionTypeFilter: (sessionType) => set(state => {
        const newFilters = {
            ...state.filters,
            sessionType: state.filters.sessionType === sessionType ? 'all' : sessionType,
        };
        return {
            filters: newFilters,
            activeFilterCount: calculateActiveFilterCount(newFilters)
        }
      }),
    }),
    {
      name: 'nava-app-state', 
      partialize: (state) => ({
        // Persist these properties
        activePage: state.activePage,
        filters: state.filters,
        globalSearchTerm: state.globalSearchTerm,
      }),
    }
  )
);

export default useAppStore;
