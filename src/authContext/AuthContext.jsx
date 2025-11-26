import { createContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('token') || null);
  const [roles, setRoles] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('roles') || '[]'); } catch { return []; }
  });
    const [barId, setBarId] = useState(() => {
    const fromSession = sessionStorage.getItem('barId');
    return fromSession ? Number(fromSession) : null;
  });

  useEffect(() => {
    if (token) sessionStorage.setItem('token', token);
    else sessionStorage.removeItem('token');
  }, [token]);

  useEffect(() => {
    sessionStorage.setItem('roles', JSON.stringify(roles || []));
  }, [roles]);

    useEffect(() => {
    if (barId != null) {
      sessionStorage.setItem('barId', String(barId));
    } else {
      sessionStorage.removeItem('barId');
    }
    }, [barId]);

  const logout = () => {
    setToken(null);
    setRoles([]);
    setBarId(null);
  };

  const value = useMemo(() => ({ token, roles, barId, setToken, setRoles, setBarId, logout }), [token, roles, barId]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;