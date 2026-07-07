import useFacilityStore from './useFacilityStore';
import useEmployeeStore from './useEmployeeStore';
import usePersonStore from './usePersonStore';

export const resetAllStores = () => {
  useFacilityStore.getState().reset();
  useEmployeeStore.getState().reset();
  usePersonStore.getState().reset();
};
