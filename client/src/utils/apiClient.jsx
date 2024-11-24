import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const apiClient = axios.create({
  baseURL: import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_ENV_ROUTE
    : import.meta.env.VITE_DEV_ENV_ROUTE,
});

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userAddress');

      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
