import {http} from "msw";

const usersDatabase = {
    barmen: [
        {id: 42, username: "ivan", barPassword: "ivan", bar_id: 123, score: 1422, saved_cocktails_id: [1, 2]}
    ]
}

function parseToken(token) {
    try {
        const decoded = atob(token);
        const [username, barIdStr] = decoded.split('-');
        const barId = Number(barIdStr);
        return { username, barId };
    } catch {
        return null;
    }
}

export const meInfo = [
    http.get('/api/me', ({ request }) => {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const token = authHeader.substring(7);
        const parsed = parseToken(token);
        if (!parsed) {
            return new Response(JSON.stringify({ error: 'Invalid token' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { username } = parsed;
        const user = usersDatabase.barmen.find(u => u.username === username);

        if (!user) {
            return new Response(JSON.stringify({ error: 'User not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(
            JSON.stringify({
                login: user.username,
                points: user.score,
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }),
];