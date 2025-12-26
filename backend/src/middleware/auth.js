import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev";
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_dev';

export function signJwt(payload) {
    return jwt.sign(
        {
            id: payload.id,
            roles: Array.isArray(payload.roles)
                ? payload.roles.filter(Boolean)
                : [],
            bar_id: typeof payload.bar_id === "number"
                ? payload.bar_id
                : (payload.barId ?? null)
        },
        JWT_SECRET,
        { expiresIn: "15min" }
    );
}

export function signRefreshToken(payload) {
    return jwt.sign(
        {
            id: payload.id,
            roles: Array.isArray(payload.roles)
                ? payload.roles.filter(Boolean)
                : [],
            bar_id: typeof payload.bar_id === "number"
                ? payload.bar_id
                : (payload.barId ?? null)
        },
        REFRESH_SECRET,
        { expiresIn: '3h' }
    );
}


export function authRequired(req, res, next) {
    const token = req.cookies?.access_token;

    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);

        req.user = {
            ...payload,
            roles: Array.isArray(payload.roles) ? payload.roles.filter(Boolean) : [],
            bar_id: payload.bar_id ?? payload.barId ?? null,
        };

        next();
    } catch {
        return res.status(401).json({ error: "Invalid token" });
    }
}

export function requireRole(...roles) {
  return (req, res, next) => {
      const userRoles = req.user?.roles || [];
      if (!roles.some(r => userRoles.includes(r))) {
          return res.status(403).json({ error: "Forbidden" });
      }
      next();
  };
}
