import { create } from 'zustand';

const useDeviceTypeStore = create((set) => ({
  deviceTypes: [],
  setDeviceTypes: (deviceTypes) => set({ deviceTypes }),
  reset: () => set({ deviceTypes: [] }),
}));

export default useDeviceTypeStore;
