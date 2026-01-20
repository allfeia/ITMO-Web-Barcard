export const db = {
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
    ],
};