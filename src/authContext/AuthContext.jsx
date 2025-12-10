import { createContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [token, setToken] = useState(() => sessionStorage.getItem("token") || null);
    const [roles, setRoles] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('roles') || '[]'); } catch { return []; }
    });

    useEffect(() => {
        if (token) {
            sessionStorage.setItem("token", token);
        } else {
            sessionStorage.removeItem("token");
        }
    }, [token]);

    useEffect(() => {
        sessionStorage.setItem('roles', JSON.stringify(roles || []));
    }, [roles]);

    const [barId, setBarId] = useState(() => {
        const fromSession = sessionStorage.getItem("barId");
        return fromSession ? Number(fromSession) : null;
    });

    const [isBarman, setIsBarman] = useState(() => {
        const fromSession = sessionStorage.getItem("isBarman");
        return fromSession === "true";
    });

    useEffect(() => {
        if (barId != null) sessionStorage.setItem("barId", String(barId));
        else sessionStorage.removeItem("barId");
    }, [barId]);

    useEffect(() => {
        if (isBarman != null) sessionStorage.setItem("isBarman", String(isBarman));
        else sessionStorage.removeItem("isBarman");
    }, [isBarman]);

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

    const [savedCocktailsId, setSavedCocktailsId] = useState(() => {
        try {
            const saved = sessionStorage.getItem('savedCocktailsId');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        if (savedCocktailsId && savedCocktailsId.length > 0) {
            sessionStorage.setItem('savedCocktailsId', JSON.stringify(savedCocktailsId));
        } else {
            sessionStorage.removeItem('savedCocktailsId');
        }
    }, [savedCocktailsId]);

    const value = useMemo(
        () => ({

            barId,
            isBarman,
            barName,
            barSite,
            setBarId,
            setIsBarman,
            setBarName,
            setBarSite,

            token,
            roles,
            savedCocktailsId,
            setRoles,
            setToken,
            setSavedCocktailsId,

            logout() {
                setToken(null);
                setRoles([]);
                setBarId(null);
                setIsBarman(null);
            }
        }),
        [token, barId, isBarman, barName, barSite, roles, savedCocktailsId]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
