import useFacilityStore from './useFacilityStore';
import useEmployeeStore from './useEmployeeStore';
import usePersonStore from './usePersonStore';
import useDeviceStore from './useDeviceStore';
import useTestLogStore from './useTestLogStore';
import useDeviceTypeStore from './useDeviceTypeStore';

export const resetAllStores = () => {
  useFacilityStore.getState().reset();
  useEmployeeStore.getState().reset();
  usePersonStore.getState().reset();
  useDeviceStore.getState().reset();
  useTestLogStore.getState().reset();
  useDeviceTypeStore.getState().reset();
};
