// Axios instance configurado com interceptors
import axios from 'axios';
import API_URL from '@/config';

// Criar instância do axios
const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor - Injeta token automaticamente
api.interceptors.request.use(
  (config) => {
    // Ler token dinamicamente a cada requisição
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Trata erros 401 automaticamente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se receber 401 Unauthorized, fazer logout automático
    if (error.response?.status === 401) {
      console.warn('Token inválido ou expirado. Fazendo logout...');

      // Limpar storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      sessionStorage.removeItem('authToken');

      // Redirecionar para login (apenas se não estiver já na página de login)
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
