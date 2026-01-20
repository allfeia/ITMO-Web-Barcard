import { db } from "./db.js";
import {http, HttpResponse} from "msw";
import {getUserIdFromCookies} from "./authUtils.js";

export const getRefreshCookie = [
    http.post("/api/refresh-token", ({ request }) => {
        const userId = getUserIdFromCookies(request);
        if (!userId) {
            return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = db.users.find(u => u.id === userId);
        if (!user) {
            return HttpResponse.json({ error: "User not found" }, { status: 404 });
        }

        const newToken = btoa(JSON.stringify({
            id: user.id,
            roles: user.roles,
            bar_id: user.bar_id
        }));

        return HttpResponse.json(null, {
            headers: {
                "set-cookie": `access_token=${newToken}; Path=/; SameSite=Lax`,
            },
        });
    })
]