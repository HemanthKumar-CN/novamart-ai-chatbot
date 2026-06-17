import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('novamart_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('novamart_token'));
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);

  // Verify token on first load
  useEffect(() => {
    const init = async () => {
      if (!token) {
        setBootstrapping(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
        localStorage.setItem('novamart_user', JSON.stringify(data.user));
      } catch {
        logout();
      } finally {
        setBootstrapping(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('novamart_token', newToken);
    localStorage.setItem('novamart_user', JSON.stringify(newUser));
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', { name, email, password });
      persist(data.token, data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      persist(data.token, data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('novamart_token');
    localStorage.removeItem('novamart_user');
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, bootstrapping, signup, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
