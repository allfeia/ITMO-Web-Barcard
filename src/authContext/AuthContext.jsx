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

  const [barName, setBarName] = useState(() => {
      return sessionStorage.getItem('barName') || null;
  });
  useEffect(() => {
      if (barName) {
          sessionStorage.setItem('barName', barName);
      } else {
          sessionStorage.removeItem('barName');
      }
  }, [barName]);

    const [barSite, setBarSite] = useState(() => {
        return sessionStorage.getItem('barSite') || null;
    });
    useEffect(() => {
        if (barSite) {
            sessionStorage.setItem('barSite', barSite);
        } else {
            sessionStorage.removeItem('barSite');
        }
    }, [barSite]);

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

  const value = useMemo(() => ({ token, roles, barId, barName, barSite, setToken, setRoles, setBarId, setBarSite, setBarName, logout }), [token, roles, barId, barName, barSite]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;