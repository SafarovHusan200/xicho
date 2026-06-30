import { create } from 'zustand';

const useEmployeeStore = create((set) => ({
  employees: [],
  setEmployees: (employees) => set({ employees }),
}));

export default useEmployeeStore;
