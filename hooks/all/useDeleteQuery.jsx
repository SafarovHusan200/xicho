import { useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from '@/services/api';
import { toast } from 'react-hot-toast';
import { isArray, get, forEach } from 'lodash';

const deleteRequest = (apiClient, url, config = {}) =>
  apiClient.delete(url, {
    headers: { 'Content-Type': 'application/json', ...(config.headers || {}) },
    ...config,
  });

const useDeleteQuery = ({
  hideSuccessToast = false,
  hideErrorToast = false,
  listKeyId = null,
  apiClient = request,
}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: ({ url, config = {} }) => deleteRequest(apiClient, url, config),
    onSuccess: (data) => {
      if (!hideSuccessToast) {
        toast.success(data?.data?.message || "Muvaffaqiyatli o'chirildi");
      }
      if (listKeyId) {
        const keys = isArray(listKeyId) ? listKeyId : [listKeyId];
        forEach(keys, (key) => queryClient.invalidateQueries({ queryKey: [key] }));
      }
    },
    onError: (data) => {
      if (isArray(get(data, 'response.data'))) {
        forEach(get(data, 'response.data'), (val) => toast.error(get(val, 'message', 'ERROR')));
      } else if (!hideErrorToast) {
        toast.error(data?.response?.data?.message || 'ERROR');
      }
    },
  });

  return { mutate, isPending, isError, error };
};

export default useDeleteQuery;
