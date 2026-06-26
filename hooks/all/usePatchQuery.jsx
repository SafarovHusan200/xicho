import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from '@/services/api';

const patchRequest = async (url, attributes, config = {}) => {
  const response = await request.patch(url, attributes, {
    headers: {
      'Content-Type': 'application/json',
      ...(config.headers || {}),
    },
    ...config,
  });
  return response.data;
};

const usePatchPythonQuery = ({
  hideSuccessToast = false,
  hideErrorToast = false,
  listKeyId = null,
}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ url, attributes, config }) => patchRequest(url, attributes, config),

    onSuccess: (data) => {
      if (!hideSuccessToast) {
        toast.success(data?.message || 'Ma’lumot muvaffaqiyatli yangilandi');
      }

      if (listKeyId) {
        const keys = Array.isArray(listKeyId) ? listKeyId : [listKeyId];
        keys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
      }
    },

    onError: (error) => {
      const msg =
        error?.response?.data?.detail || error?.response?.data?.message || 'Xatolik yuz berdi';
      if (!hideErrorToast) {
        toast.error(msg);
      }
    },
  });

  return mutation;
};

export default usePatchPythonQuery;
