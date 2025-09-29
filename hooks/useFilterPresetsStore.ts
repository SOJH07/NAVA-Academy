import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LiveOpsFilters } from '../types';

export interface FilterPreset {
  id: string;
  name: string;
  filters: LiveOpsFilters;
}

interface FilterPresetsState {
  presets: FilterPreset[];
  addPreset: (preset: FilterPreset) => void;
  deletePreset: (id: string) => void;
}

const useFilterPresetsStore = create<FilterPresetsState>()(
  persist(
    (set) => ({
      presets: [],
      addPreset: (preset) => set((state) => ({ presets: [...state.presets, preset] })),
      deletePreset: (id) => set((state) => ({ presets: state.presets.filter(p => p.id !== id) })),
    }),
    {
      name: 'nava-filter-presets',
    }
  )
);

export default useFilterPresetsStore;
