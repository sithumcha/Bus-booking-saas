import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const parsedInfo = JSON.parse(userInfo);
    if (parsedInfo.token) {
      config.headers.Authorization = `Bearer ${parsedInfo.token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
