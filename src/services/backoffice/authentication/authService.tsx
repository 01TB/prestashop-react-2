/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // On initialise l'état en regardant si un token existe déjà dans le navigateur
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    localStorage.getItem('isLoggedIn') === 'true'
  );

  const login = (email: string, pass: string): boolean => {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const adminPass = import.meta.env.VITE_ADMIN_PASSWORD;

    if (email === adminEmail && pass === adminPass) {
      setIsAuthenticated(true);
      localStorage.setItem('isLoggedIn', 'true'); // Persistance
      return true;
    }
    return false;
  };

  // La fonction de déconnexion
  const logout = () => {
    setIsAuthenticated(false); // Change l'état global immédiatement
    localStorage.removeItem('isLoggedIn'); // Supprime la persistance
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return context;
};