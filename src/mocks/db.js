
function persistDb() {
    try {
        localStorage.setItem('mockDb', JSON.stringify(db));
        console.log("Мок-бд сохранена в localStorage");
    } catch (err) {
        console.error("Ошибка сохранения mockDb:", err);
    }
}

let loadedDb = null;
try {
    const saved = localStorage.getItem('mockDb');
    if (saved) {
        loadedDb = JSON.parse(saved);
        console.log("Загружена сохранённая mockDb из localStorage");
    }
} catch (err) {
    console.warn("Не удалось загрузить сохранённую mockDb:", err);
}

const defaultDb = {
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
            score: 1422,
        },
        {
            id: 43,
            login: "alex",
            email: "alex@example.com",
            name: "Алексей",
            password: "alex123",
            roles: ["staff"],
            bar_id: 123,
            saved_cocktails_id: [3, 4, 5],
            score: 2350,
        },
        {
            id: 44,
            login: "maria",
            email: "maria@example.com",
            name: "Мария",
            password: "maria456",
            roles: ["staff"],
            bar_id: 123,
            saved_cocktails_id: [1, 3, 6],
            score: 1980,
        },
        {
            id: 45,
            login: "dmitry",
            email: "dmitry@example.com",
            name: "Дмитрий",
            password: "dmitry789",
            roles: ["staff"],
            bar_id: 123,
            saved_cocktails_id: [2, 4, 7],
            score: 3120,
        },
        {
            id: 46,
            login: "anna",
            email: "anna@example.com",
            name: "Анна",
            password: "anna012",
            roles: ["staff"],
            bar_id: 123,
            saved_cocktails_id: [5, 8],
            score: 2750,
        },
    ],
    ingredient: [
        { id: 1, name: "Белый ром", type: "alcohol" },
        { id: 2, name: "Содовая", type: "non-alcohol" },
        { id: 3, name: "Лайм", type: "fruit" },
        { id: 4, name: "Мята", type: "decoration" },
        { id: 5, name: "Базилик", type: "decoration" },
        { id: 6, name: "Джин", type: "alcohol" },
        { id: 7, name: "Апельсин", type: "decoration" },
        { id: 8, name: "Кампари", type: "alcohol" },
        { id: 9, name: "Сладкий вермут", type: "alcohol" },
        { id: 10, name: "Малиновый сироп", type: "syrup" },
        { id: 11, name: "Яичный белок", type: "other" },
        { id: 12, name: "Виски", type: "alcohol" },
        { id: 13, name: "Мёд", type: "added" },
        { id: 14, name: "Кипяток", type: "non-alcohol" },
        { id: 15, name: "Лимон", type: "fruit" },
        { id: 16, name: "Гвоздика", type: "spice" },
        { id: 17, name: "Лимонный сок", type: "non-alcohol" },
    ],
};

export const db = loadedDb || defaultDb;

export { persistDb };