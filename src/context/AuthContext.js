import { createContext, useContext, useEffect, useState } from "react";
import Constants from 'expo-constants';

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

        let userToSet = null;
        switch (Number(Constants.expoConfig.extra.USER)) {
          case 1:
            // DEMO: cliente
            userToSet = { id: 1, role: "cliente" };
            break;
          case 2:
            // DEMO: doctor
            userToSet = { id: 2, role: "doctor" };
            break;
          default:
            // DEMO: login
            userToSet = null;
            break;
        }

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
