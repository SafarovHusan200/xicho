// hooks/useApi.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession, signOut, getSession } from 'next-auth/react';
import axios from 'axios';

const createApiInstance = (token) => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const freshSession = await getSession();

        if (!freshSession || freshSession.error) {
          await signOut({ callbackUrl: '/' });
          return Promise.reject(error);
        }

        originalRequest.headers['Authorization'] = `Bearer ${freshSession.accessToken}`;
        return axios(originalRequest);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// ─────────────────────────────────────────
// GET
// ─────────────────────────────────────────
export const useFetch = (key, url, options = {}) => {
  const { data: session } = useSession();
  const api = createApiInstance(session?.accessToken);

  return useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: async () => {
      const { data } = await api.get(url);
      return data;
    },
    enabled: !!session?.accessToken,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// ─────────────────────────────────────────
// POST / PUT / PATCH
// ─────────────────────────────────────────
export const useMutate = (url, method = 'post', invalidateKeys = []) => {
  const { data: session } = useSession();
  const api = createApiInstance(session?.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api[method](url, payload);
      return data;
    },
    onSuccess: () => {
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
      });
    },
  });
};

// ─────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────
export const useDelete = (baseUrl, invalidateKeys = []) => {
  const { data: session } = useSession();
  const api = createApiInstance(session?.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`${baseUrl}/${id}`);
      return data;
    },
    onSuccess: () => {
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
      });
    },
  });
};
