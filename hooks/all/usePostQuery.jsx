import { useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from '@/services/api';
import { toast } from 'react-hot-toast';
import { isArray, get, forEach, isObject } from 'lodash';

const usePostQuery = ({
  hideSuccessToast = false,
  hideErrorToast = false,
  listKeyId = null,
  apiClient = request,
}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: ({ url, attributes, config = {} }) =>
      apiClient.post(url, attributes, {
        headers: { 'Content-Type': 'application/json', ...(config.headers || {}) },
        ...config,
      }),
    onSuccess: (data) => {
      if (!hideSuccessToast) {
        toast.success(data?.data?.message || 'SUCCESS');
      }
      if (listKeyId) {
        const keys = isArray(listKeyId) ? listKeyId : [listKeyId];
        forEach(keys, (key) => queryClient.invalidateQueries({ queryKey: [key] }));
      }
    },
    onError: (data) => {
      if (isArray(get(data, 'response.data'))) {
        forEach(get(data, 'response.data'), (val) => toast.error(get(val, 'message', 'ERROR')));
      } else if (!isObject(get(data, 'response.data')) && !hideErrorToast) {
        toast.error(data?.response?.data?.message || 'ERROR');
      }
    },
  });

  return { mutate, isPending, isError, error };
};

export default usePostQuery;
