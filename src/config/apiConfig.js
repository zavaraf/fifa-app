import axios from 'axios';

const API_CONFIG = {
  BASE_URL: `${process.env.REACT_APP_API_BASE_URL}/fifaapp/rest`
};

// Interceptor para manejar respuestas de sesión expirada
axios.interceptors.response.use(
  (response) => {
    // Verificar si la respuesta es HTML de sesión expirada
    if (typeof response.data === 'string' && 
        (response.data.includes('<!DOCTYPE HTML') || 
         response.data.includes('Sesión no válida') || 
         response.data.includes('Inactividad de Sesión'))) {
      console.error('Sesión expirada detectada por interceptor');
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = '/fifa-app/login';
      return Promise.reject(new Error('Sesión expirada'));
    }
    return response;
  },
  (error) => {
    // Verificar si el error contiene HTML de sesión expirada
    if (error.response && typeof error.response.data === 'string' && 
        (error.response.data.includes('<!DOCTYPE HTML') || 
         error.response.data.includes('Sesión no válida') || 
         error.response.data.includes('Inactividad de Sesión'))) {
      console.error('Sesión expirada detectada en error por interceptor');
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = '/fifa-app/login';
      return Promise.reject(new Error('Sesión expirada'));
    }
    return Promise.reject(error);
  }
);

export default API_CONFIG;