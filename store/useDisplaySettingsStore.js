import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useDisplaySettingsStore = create(
  persist(
    (set) => ({
      highContrast: false,
      fontScale: 100,
      fontFamily: 'inter',
      setHighContrast: (highContrast) => set({ highContrast }),
      setFontScale: (fontScale) => set({ fontScale }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
    }),
    { name: 'display-settings' }
  )
);

export default useDisplaySettingsStore;
