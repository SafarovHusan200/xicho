import axios from 'axios';
import { config } from '@/config';

const staffio = axios.create({
  baseURL: config.PYTHON_API_URL,
  headers: {
    common: {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
    },
  },
});

export { staffio };
