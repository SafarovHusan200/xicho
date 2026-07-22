'use client';
import { useQuery } from '@tanstack/react-query';
import { request } from '@/services/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const useGetQuery = ({
  key = 'get-all',
  url = '/',
  params = {},
  headers = {},
  showSuccessMsg = false,
  showErrorMsg = false,
  enabled = true,
  redirectOn403 = true,
  redirectOn500 = true,
  apiClient = request,
}) => {
  const router = useRouter();

  const { isLoading, isError, data, error, isFetching } = useQuery({
    queryKey: [key, params],
    queryFn: () =>
      apiClient.get(url, {
        params,
        headers,
      }),
    placeholderData: (previousData) => previousData, // Replaces keepPreviousData
    enabled,
  });

  // Handle success
  if (data && showSuccessMsg) {
    toast.success('SUCCESS');
  }

  // Handle errors
  if (error) {
    const status = error?.response?.status;
    // no response at all (server down, connection refused, timeout) — not a cancelled request
    const isNetworkError = !error?.response && error?.code !== 'ERR_CANCELED';

    // 🔴 401 - Let ErrorBoundary/component handle refresh attempt
    if (status === 401) {
      // Don't redirect, let component decide
    }
    // 🔴 403 - Forbidden
    else if (status === 403 && redirectOn403) {
      router.replace('/403');
    }
    // 🔴 404 - Page Not Found
    else if (status === 404 && showErrorMsg) {
      toast.error(error?.response?.data?.message || 'Resurs topilmadi');
    }
    // 🔴 500 - Server error (or server unreachable)
    else if ((status >= 500 || isNetworkError) && redirectOn500) {
      router.replace('/500');
    } else if (showErrorMsg) {
      toast.error(error?.response?.data?.message || 'Ошибка запроса');
    }
  }

  return {
    isLoading,
    isError,
    data,
    error,
    isFetching,
    status: error?.response?.status, // Add status code
  };
};

export default useGetQuery;
