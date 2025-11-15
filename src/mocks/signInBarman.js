import { http, HttpResponse } from "msw";

const barsDatabase = {
    BAR123: {
        barKey: "OLIVE-2024",
        barmen: [
            { username: "ivan", barPassword: "ivan" },
        ]
    },
    BAR777: {
        barKey: "NEGRONI-777",
        barmen: []
    }
};

export const signInBarman = [

    http.post("/api/barman/auth", async ({ request }) => {
        const { barId, username, barPassword, barKey} = await request.json();

        const bar = barsDatabase[barId];
        if (!bar) {
            return HttpResponse.json(
                { error: "Бар не найден" },
                { status: 404 }
            );
        }

        if (bar.barKey !== barKey) {
            return HttpResponse.json(
                { error: "Неверный ключ бара" },
                { status: 403 }
            );
        }

        const existingUser = bar.barmen.find((bar) => bar.username === username);

        if (existingUser) {
            if (existingUser.barPassword !== barPassword) {
                return HttpResponse.json(
                    { error: "Неверный пароль бара" },
                    { status: 403 }
                );
            }

            return HttpResponse.json({
                ok: true,
                mode: "login",
                message: "Успешный вход",
                user: { username, barPassword, barId }
            });
        }

        bar.barmen.push({ username, barPassword });

        return HttpResponse.json({
            ok: true,
            mode: "register",
            message: "Новый бармен создан",
            user: { username, barPassword, barId }
        });
    }),
];
