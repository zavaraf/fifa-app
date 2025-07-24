import api from "./api";

export const loginService = async (credentials) => {
  try {
    const response = await api.post("/usermanager/api/login", credentials); // Cambia la ruta según tu backend
    return response.data; // Devuelve los datos del servidor (por ejemplo, el token)
  } catch (error) {
    if (error.response && error.response.status === 401) {
      throw new Error("Credenciales incorrectas");
    }
    throw new Error("Error al iniciar sesión");
  }
};