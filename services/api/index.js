import axios from 'axios';

const request = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  params: {},
  headers: {
    common: {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
    },
  },
});

request.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { request };
