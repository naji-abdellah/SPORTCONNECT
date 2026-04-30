import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sc_token');
    if (token) {
      authService.getProfile()
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('sc_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    localStorage.setItem('sc_token', res.data.idToken);
    localStorage.setItem('sc_uid', res.data.uid);
    localStorage.setItem('sc_displayName', res.data.displayName || '');
    setUser({ uid: res.data.uid, email: res.data.email, displayName: res.data.displayName });
    return res.data;
  };

  const register = async (formData) => {
    const res = await authService.register(formData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('sc_token');
    localStorage.removeItem('sc_uid');
    localStorage.removeItem('sc_displayName');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
