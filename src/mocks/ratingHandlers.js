import { http, HttpResponse } from "msw";
import { db, persistDb } from "./db.js";

export const ratingHandlers = [
  http.get("/api/rating", () => {
    const sortedUsers = [...db.users]
      .sort((a, b) => b.score - a.score)
      .map((user) => ({
        login: user.login,
        score: user.score,
      }));

    return HttpResponse.json(sortedUsers);
  }),

  http.get("/api/rating/:barId", ({ params }) => {
    const { barId } = params;
    const barIdNum = Number(barId);
    const filteredUsers = db.users
      .filter((user) => user.bar_id === barIdNum)
      .sort((a, b) => b.score - a.score)
      .map((user) => ({ login: user.login, score: user.score }));

    return HttpResponse.json(filteredUsers);
  }),
  http.post("/api/rating/update-score", async ({ request }) => {
    try {
      const { login, score } = await request.json();
      const userIndex = db.users.findIndex((user) => user.login === login);
      if (userIndex === -1) {
        return HttpResponse.json(
          { error: "Пользователь не найден" },
          { status: 404 },
        );
      }

      db.users[userIndex].score =
        (db.users[userIndex].score || 0) + Number(score);
      persistDb();
      console.log(
        `Очки обновлены для ${login}: +${score} → ${db.users[userIndex].score}`,
      );

      return HttpResponse.json({
        success: true,
        newScore: db.users[userIndex].score,
        message: "Очки успешно обновлены",
      });
    } catch (error) {
      console.error("Ошибка обновления счета:", error);
      return HttpResponse.json(
        { error: "Ошибка обновления счета" },
        { status: 500 },
      );
    }
  }),

  http.get("/api/bar/:barId/with-rating", ({ params }) => {
    const barId = Number(params.barId);

    const bar = db.bars.find((b) => b.id === barId);
    if (!bar) {
      return HttpResponse.json({ error: "Бар не найден" }, { status: 404 });
    }

    const barUsers = db.users
      .filter((user) => user.bar_id === barId)
      .sort((a, b) => b.score - a.score)
      .map((user) => ({
        login: user.login,
        score: user.score,
      }));

    return HttpResponse.json({
      bar: {
        id: bar.id,
        name: bar.name,
        // site: bar.site,
      },
      rating: barUsers,
    });
  }),
];
