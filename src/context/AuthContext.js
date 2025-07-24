import React, { createContext, useState, useEffect } from "react";
import useSesion from "../hooks/useSesion";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { refreshTemporadaData } = useSesion();

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          
          // Solo actualizar temporada si hay datos de usuario pero no hay datos recientes
          // Verificar si necesitamos actualizar (por ejemplo, si han pasado más de 5 minutos)
          const lastRefresh = sessionStorage.getItem("lastTemporadaRefresh");
          const now = Date.now();
          const shouldRefresh = !lastRefresh || (now - parseInt(lastRefresh)) > 5 * 60 * 1000; // 5 minutos
          
          if (shouldRefresh) {
            const temporadaActualizada = await refreshTemporadaData();
            
            if (temporadaActualizada) {
              const userActualizado = {
                ...parsedUser,
                idTemporada: temporadaActualizada.id,
                torneos: temporadaActualizada.torneos || []
              };
              
              setUser(userActualizado);
              localStorage.setItem("user", JSON.stringify(userActualizado));
              sessionStorage.setItem("lastTemporadaRefresh", now.toString());
            } else {
              setUser(parsedUser);
            }
          } else {
            // Si no necesitamos actualizar, usar datos existentes
            setUser(parsedUser);
          }
        }
      } catch (error) {
        console.error("Error al cargar usuario desde storage:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []); // Array de dependencias vacío para que solo se ejecute una vez

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    sessionStorage.removeItem("selectedTemporada");
    sessionStorage.removeItem("lastTemporadaRefresh");
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };