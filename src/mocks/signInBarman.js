import { http, HttpResponse } from "msw";

const barsDatabase = {
  bar: [
    {
      id: 123,
      name: "Olive Bar",
      barKey: "OLIVE-2000",
      site: "https://olivebarandkitchen.com",
      barmen: [42],
    },

    {
      id: 777,
      name: "Negroni Club",
      barKey: "NEGRONI-777",
      site: "https://negronibar.de",
      barmen: [],
    },
  ],

  barmen: [
    {
      id: 42,
      username: "ivan",
      barPassword: "ivan",
      bar_id: 123,
      score: 1422,
      saved_cocktails_id: [1, 2],
    },
  ],
};

function generateToken(username, barId) {
  return btoa(`${username}-${barId}-${Date.now()}`);
}

function generateUserId() {
  return Math.floor(Math.random() * 1000000);
}

export const signInBarman = [
  http.post("/api/barman/auth", async ({ request }) => {
    const { barId, username, barPassword, barKey } = await request.json();

    const bar = barsDatabase.bar.find((bar) => bar.id === Number(barId));
    if (!bar) {
      return HttpResponse.json({ error: "Бар не найден" }, { status: 404 });
    }

    if (bar.barKey !== barKey) {
      return HttpResponse.json({ error: "wrong_bar_key" }, { status: 403 });
    }

    const existingUser = barsDatabase.barmen.find(
      (bar) => bar.username === username,
    );

    if (existingUser) {
      if (existingUser.barPassword !== barPassword) {
        return HttpResponse.json({ error: "wrong_password" }, { status: 403 });
      }

      return HttpResponse.json({
        ok: true,
        mode: "login",
        message: "Успешный вход",
        token: generateToken(username, barId),
        userId: existingUser.id,
        roles: ["BARMAN"],
        saved_cocktails_id: existingUser.saved_cocktails_id,
        barId,
        barName: bar.name,
        barSite: bar.site,
      });
    }

    const newUserId = generateUserId();
    const newUser = {
      id: newUserId,
      username: username,
      barPassword,
      points: 0,
      saved_cocktails_id: [],
    };

    bar.barmen.push(newUser);

    return HttpResponse.json({
      ok: true,
      mode: "register",
      message: "Новый бармен создан",
      token: generateToken(username, barId),
      userId: newUser.id,
      roles: ["BARMAN"],
      saved_cocktails_id: newUser.saved_cocktails_id,
      barId,
      barName: bar.name,
      barSite: bar.site,
    });
  }),
];
