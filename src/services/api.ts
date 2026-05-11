import axios from 'axios';

// La clé API reste nécessaire pour l'authentification

const api = axios.create({
  // baseURL est maintenant relatif, le proxy Vite va l'intercepter
  baseURL: '/api', 
  timeout: 15000,
  headers: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Content-Type': 'application/xml'
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Erreur API :", error);
    return Promise.reject(error);
  }
);

export default api;