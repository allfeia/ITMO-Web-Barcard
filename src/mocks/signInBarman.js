import { http, HttpResponse } from "msw";

const db = {
    bars: [
        {
            id: 123,
            name: "Olive Bar",
            pass_key: "OLIVE-2000",
            site: "https://olivebarandkitchen.com",
        },

        {
            id: 777,
            name: "Negroni Club",
            pass_key: "NEGRONI-777",
            site: "https://negronibar.de",
        },
    ],

    users: [
        {
            id: 42,
            login: "ivan",
            email: "ivan@gmail.com",
            name: "ivan",
            password: "ivan",
            roles: ["staff"],
            bar_id: 123,
            saved_cocktails_id: [1, 2],
        },
    ],
};
function fakeJwt(payload) {
    return btoa(JSON.stringify(payload));
}

export const signInBarman = [
    http.post("/api/barman/auth", async ({ request }) => {
        const { barId, username, password, barKey } = await request.json();

        const bar = db.bars.find(b => b.id === Number(barId));
        if (!bar) {
            return HttpResponse.json({ error: "Бар не найден" }, { status: 404 });
        }

        if (bar.pass_key !== barKey) {
            return HttpResponse.json(
                { error: "Неверные учетные данные" },
                { status: 403 }
            );
        }

        const user = db.users.find(
            u =>
                u.bar_id === bar.id &&
                (u.login === username || u.email === username || u.name === username)
        );

        if (
            !user ||
            !["staff", "bar_admin"].some(r => user.roles.includes(r)) ||
            user.password !== password
        ) {
            return HttpResponse.json(
                { error: "Неверные учетные данные" },
                { status: 403 }
            );
        }

        return HttpResponse.json(
            {
                ok: true,
                mode: "login",
                message: "Успешный вход",
                user: {
                    id: user.id,
                    email: user.email,
                    login: user.login,
                    name: user.name,
                    roles: user.roles,
                    bar_id: user.bar_id,
                },
                barName: bar.name,
                barSite: bar.site ?? null,
                saved_cocktails_id: user.saved_cocktails_id,
            },
            {
                headers: {
                    'set-cookie': [
                        `access_token=${fakeJwt({ id: user.id, roles: user.roles, bar_id: user.bar_id })}; Path=/; SameSite=Lax`,
                        `refresh_token=${fakeJwt({ id: user.id })}; Path=/; SameSite=Lax`,
                    ],
                },
            }
        );
    }),
];
