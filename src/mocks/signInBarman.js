import { http, HttpResponse } from "msw";

const barsDatabase = {
    BAR123: {
        barPassword: "OLIVE-2024",
        barmen: [
            { username: "ivan" },
        ]
    },
    BAR777: {
        barPassword: "NEGRONI-777",
        barmen: []
    }
};

export const signInBarman = [

    http.post("/api/barman/auth", async ({ request }) => {
        const { barId, username, barPassword } = await request.json();

        const bar = barsDatabase[barId];
        if (!bar) {
            return HttpResponse.json(
                { error: "Бар не найден" },
                { status: 404 }
            );
        }

        if (bar.barPassword !== barPassword) {
            return HttpResponse.json(
                { error: "Неверный пароль бара" },
                { status: 403 }
            );
        }

        const existing = bar.barmen.find((b) => b.username === username);

        if (existing) {

            return HttpResponse.json({
                ok: true,
                mode: "login",
                message: "Успешный вход",
                user: { username, barId }
            });
        }

        bar.barmen.push({ username });

        return HttpResponse.json({
            ok: true,
            mode: "register",
            message: "Новый бармен создан",
            user: { username, barId }
        });
    }),
];
