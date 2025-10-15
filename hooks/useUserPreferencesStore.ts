import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface PreferencesState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (isCollapsed: boolean) => void;
  isLiveStatusSidebarCollapsed: boolean;
  setIsLiveStatusSidebarCollapsed: (isCollapsed: boolean) => void;
  hasSeenConstructionNotice: boolean;
  setHasSeenConstructionNotice: (hasSeen: boolean) => void;
}

const useUserPreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      isSidebarCollapsed: false,
      setIsSidebarCollapsed: (isCollapsed) => set({ isSidebarCollapsed: isCollapsed }),
      isLiveStatusSidebarCollapsed: false,
      setIsLiveStatusSidebarCollapsed: (isCollapsed) => set({ isLiveStatusSidebarCollapsed: isCollapsed }),
      hasSeenConstructionNotice: false,
      setHasSeenConstructionNotice: (hasSeen) => set({ hasSeenConstructionNotice: hasSeen }),
    }),
    {
      name: 'nava-user-preferences',
    }
  )
);

export default useUserPreferencesStore;