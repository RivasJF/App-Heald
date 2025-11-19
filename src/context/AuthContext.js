import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // { id, role }
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Simulación: cargando user desde storage o backend
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);

      try {
        // Aquí puedes leer de SecureStore
        // const data = await SecureStore.getItemAsync("user");
        // const userToSet = data ? JSON.parse(data) : null;

        // DEMO: cliente
        const userToSet = { id: 1, role: "cliente" };

        // DEMO: doctor
        //const userToSet = { id: 1, role: "doctor" };

        setUser(userToSet);
        setIsAuthenticated(!!userToSet);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
