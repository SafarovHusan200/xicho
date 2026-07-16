import { create } from 'zustand';

const useDeviceStore = create((set) => ({
  devices: [],
  setDevices: (devices) => set({ devices }),
  reset: () => set({ devices: [] }),
}));

export default useDeviceStore;
