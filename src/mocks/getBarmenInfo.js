import { http, HttpResponse } from "msw";
import { getUserIdFromCookies } from "./authUtils.js";
import { db } from "./db.js";

export const meInfo = [
  http.get("/api/me", ({ cookies }) => {
    const userId = getUserIdFromCookies({ cookies });
    if (!userId) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      return HttpResponse.json({ error: "User not found" }, { status: 404 });
    }

    return HttpResponse.json({
      id: user.id,
      email: user.email,
      login: user.login,
      name: user.name,
      roles: user.roles,
      bar_id: user.bar_id,
      points: user.score ?? 0,
    });
  }),
];
