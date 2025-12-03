import { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from 'expo-secure-store';
import { loginUser, getProfile } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      let storedUser = null;
      console.log('AuthContext: loadSession - Starting...');
      setLoading(true);
      try {
        const token = await SecureStore.getItemAsync("userToken");
        console.log('AuthContext: token found:', !!token);
        if (token) {
          const profile = await getProfile();
          console.log('AuthContext: profile received:', !!profile);
          if (profile) {
            storedUser = profile;
          } else {
            console.log('AuthContext: Invalid token, clearing...');
            await SecureStore.deleteItemAsync("userToken");
          }
        }
      } catch (error) {
        console.error("AuthContext: Error loading session:", error);
        await SecureStore.deleteItemAsync("userToken");
      } finally {
        setUser(storedUser);
        setIsAuthenticated(!!storedUser);
        setLoading(false);
        console.log('AuthContext: loadSession - Finished. Loading:', false, 'IsAuthenticated:', !!storedUser);
      }
    };
    loadSession();
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { access_token, user: loggedInUser } = await loginUser(email, password);
      await SecureStore.setItemAsync("userToken", access_token);
      setUser(loggedInUser);
      setIsAuthenticated(true);
      return loggedInUser;
    } catch (error) {
      console.error("Login failed:", error);
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await SecureStore.deleteItemAsync("userToken");
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, isAuthenticated, setIsAuthenticated, signIn, signOut }}>
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
