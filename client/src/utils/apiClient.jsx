import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",
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