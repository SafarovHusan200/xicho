import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

const useMounted = () => useSyncExternalStore(subscribe, () => true, () => false);

export default useMounted;
