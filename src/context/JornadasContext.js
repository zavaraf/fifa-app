// filepath: src/context/JornadasContext.js
import React, { createContext, useState, useEffect } from "react";

export const JornadasContext = createContext();

export const JornadasProvider = ({ children }) => {
  const [jornadas, setJornadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJornadas = async () => {
      try {
        const response = await fetch("http://localhost:8081/fifaapp/rest/jornadas/activas");
        if (!response.ok) {
          throw new Error("Error al cargar las jornadas activas");
        }
        const data = await response.json();
        setJornadas(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJornadas();
  }, []); // Solo se ejecuta una vez al montar el proveedor

  return (
    <JornadasContext.Provider value={{ jornadas, loading, error }}>
      {children}
    </JornadasContext.Provider>
  );
};