import { create } from 'zustand';

const usePersonStore = create((set) => ({
  persons: [],
  setPersons: (persons) => set({ persons }),
  reset: () => set({ persons: [] }),
}));

export default usePersonStore;
