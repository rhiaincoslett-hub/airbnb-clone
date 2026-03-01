import { createContext, useContext, useState, useEffect } from 'react';

/**
 * Decode JWT payload without verification (client-side only; server verifies).
 * @param {string} token - JWT string
 * @returns {object|null} Decoded payload or null
 */
function decodeToken(token) {
  if (!token) return null;
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

const AuthContext = createContext(null);

/**
 * Auth provider: stores JWT in localStorage, exposes user, token, login, logout.
 * Decodes token on load to restore session.
 */
export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('token');
    const payload = decodeToken(t);
    return payload ? { id: payload.id, username: payload.username, role: payload.role } : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      const payload = decodeToken(token);
      setUser(payload ? { id: payload.id, username: payload.username, role: payload.role } : null);
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  const login = (newToken) => setTokenState(newToken);
  const logout = () => setTokenState(null);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
