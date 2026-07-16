import { create } from 'zustand';

const useTestLogStore = create((set) => ({
  testLogs: [],
  setTestLogs: (testLogs) => set({ testLogs }),
  reset: () => set({ testLogs: [] }),
}));

export default useTestLogStore;
