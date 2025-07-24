import axios from "axios";
import API_CONFIG from "../config/apiConfig";

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL, // Esto debe apuntar a https://fifa-xgamers.com:8080/fifaapp/rest
  timeout: 10000,
  withCredentials: true, // Para manejar cookies de sesión
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    // Agregar headers adicionales si es necesario
    "Access-Control-Allow-Origin": "*",
  },
});

// Interceptor para solicitudes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken"); // Obtén el token del almacenamiento local
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Agrega el token al encabezado Authorization
  }
  console.log("Request URL:", config.baseURL + config.url); // Imprime la URL completa
  console.log("Request Config:", config); // Imprime la configuración completa de la solicitud
  return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpiar sesión local si el backend dice que no está autenticado
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/fifa-app/login";
    }
    return Promise.reject(error);
  }
);

export default api;