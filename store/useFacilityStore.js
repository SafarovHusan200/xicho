import { create } from 'zustand';

const useFacilityStore = create((set) => ({
  facilities: [],
  selectedFacility: null,

  setFacilities: (facilities) => set({ facilities }),
  setSelectedFacility: (facility) => set({ selectedFacility: facility }),
  clearSelectedFacility: () => set({ selectedFacility: null }),
  reset: () => set({ facilities: [], selectedFacility: null }),
}));

export default useFacilityStore;
