import { http, HttpResponse } from "msw";

const barsDatabase = {
    123: {
        name: "Olive Bar",
        barKey: "OLIVE-2000",
        site: "https://olivebarandkitchen.com",
        barmen: [{ username: "ivan", barPassword: "ivan" }],
    },
    777: {
        name: "Negroni Club",
        barKey: "NEGRONI-777",
        site: "https://negronibar.de",
        barmen: [],
    },
};

function generateToken(username, barId) {
    return btoa(`${username}-${barId}-${Date.now()}`);
}

export const signInBarman = [
    http.post("/api/barman/auth", async ({ request }) => {
        const { barId, username, barPassword, barKey } = await request.json();

        const bar = barsDatabase[Number(barId)];
        if (!bar) {
            return HttpResponse.json({ error: "Бар не найден" }, { status: 404 });
        }

        if (bar.barKey !== barKey) {
            return HttpResponse.json({ error: "wrong_bar_key" }, { status: 403 });
        }

        const existingUser = bar.barmen.find((bar) => bar.username === username);

        if (existingUser) {
            if (existingUser.barPassword !== barPassword) {
                return HttpResponse.json({ error: "wrong_password" }, { status: 403 });
            }

            return HttpResponse.json({
                ok: true,
                mode: "login",
                message: "Успешный вход",
                token: generateToken(username, barId),
                roles: ["BARMAN"],
                barId,
                barName: bar.name,
                barSite: bar.site
            });
        }

        bar.barmen.push({ username, barPassword });

        return HttpResponse.json({
            ok: true,
            mode: "register",
            message: "Новый бармен создан",
            token: generateToken(username, barId),
            roles: ["BARMAN"],
            barId,
            barName: bar.name,
            barSite: bar.site
        });
    }),
];