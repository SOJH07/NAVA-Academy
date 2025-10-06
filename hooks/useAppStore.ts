import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LiveOpsFilters, FocusedPath } from '../types';

export const INITIAL_FILTERS: LiveOpsFilters = {
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

  // New states for advanced features
  focusedPath: FocusedPath;
  setFocusedPath: (path: FocusedPath) => void;
  isHeatmapVisible: boolean;
  setIsHeatmapVisible: (isVisible: boolean) => void;
  simulatedTime: number | null;
  setSimulatedTime: (time: number | null) => void;
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
      
      // New feature states
      focusedPath: null,
      setFocusedPath: (path) => set({ focusedPath: path }),
      isHeatmapVisible: false,
      setIsHeatmapVisible: (isVisible) => set({ isHeatmapVisible: isVisible }),
      simulatedTime: new Date('2025-10-06T08:35:00').getTime(),
      setSimulatedTime: (time) => set({ simulatedTime: time }),


      setFilters: (update) => set((state) => {
        const newFilters = typeof update === 'function' ? update(state.filters) : update;
        return { 
            filters: newFilters,
            activeFilterCount: calculateActiveFilterCount(newFilters)
        };
      }),
      clearFilters: () => set({ 
          filters: INITIAL_FILTERS, 
          globalSearchTerm: '', 
          activeFilterCount: 0,
          focusedPath: null,
          isHeatmapVisible: false,
          simulatedTime: null,
      }),
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
      // FIX: Explicitly typed `newSessionType` to prevent TypeScript from widening the type to a generic `string`, ensuring it conforms to `LiveOpsFilters['sessionType']`.
      toggleSessionTypeFilter: (sessionType: 'tech' | 'professional') => set(state => {
        const newSessionType: LiveOpsFilters['sessionType'] = state.filters.sessionType === sessionType ? 'all' : sessionType;
        const newFilters = {
            ...state.filters,
            sessionType: newSessionType,
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
        isHeatmapVisible: state.isHeatmapVisible, // Persist heatmap view preference
      }),
    }
  )
);

export default useAppStore;