import jwt from "jsonwebtoken";

export function signJwt(payload) {
  const secret = process.env.JWT_SECRET || "dev";
  const expiresIn = "7d";
  const roles = Array.isArray(payload.roles)
    ? payload.roles.filter(Boolean)
    : [];

  const bar_id =
    typeof payload.bar_id === "number"
      ? payload.bar_id
      : (payload.barId ?? null);

  const safePayload = {
    id: payload.id,
    email: payload.email,
    login: payload.login,
    name: payload.name,
    roles,
    bar_id,
  };

  return jwt.sign(safePayload, secret, { expiresIn });
}

export function authRequired(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev");
    decoded.roles = Array.isArray(decoded.roles) ? decoded.roles : [];
    decoded.bar_id =
      typeof decoded.bar_id === "number"
        ? decoded.bar_id
        : (decoded.barId ?? null);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [];
    const ok = roles.some((r) => userRoles.includes(r));
    if (!ok) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}
