import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      authApi.me()
        .then(res => setUser(res.data.data))
        .catch(() => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(REFRESH_TOKEN_KEY); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    const { accessToken, refreshToken, user: userData } = res.data.data;
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setUser(null);
  };

  const register = async (data) => {
    const res = await authApi.register(data);
    const { accessToken, refreshToken, user: userData } = res.data.data;
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    setUser(userData);
    return userData;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
