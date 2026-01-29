import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { useData } from './DataContext';

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (newPass: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { users, updateUser } = useData();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedId = localStorage.getItem('spazio_auth_user_id');
    if (storedId) {
      const found = users.find(u => u.id === storedId);
      if (found) setCurrentUser(found);
    }
    setIsLoading(false);
  }, [users]);

  const login = async (username: string, pass: string): Promise<boolean> => {
    // In a real app, password should be hashed. Here we compare plaintext for simulation.
    const user = users.find(u => u.username === username && u.password === pass);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('spazio_auth_user_id', user.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('spazio_auth_user_id');
  };

  const changePassword = (newPass: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, password: newPass, mustChangePassword: false };
    updateUser(updated);
    setCurrentUser(updated); // Update local state immediately
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, changePassword, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};