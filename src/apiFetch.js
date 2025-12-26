export function useApiFetch() {

    return async function apiFetch(url, options = {}) {
        try {
            let res = await fetch(url, {
                ...options,
                credentials: "include",
            });

            if (res.status !== 401) {
                return res;
            }

            const refresh = await fetch("/api/refresh-token", {
                method: "POST",
                credentials: "include",
            });

            if (!refresh.ok) {
                return res;
            }

            return await fetch(url, {
                ...options,
                credentials: "include",
            });


        } catch (error) {
            console.error(error);
            throw error;
        }

    }
}
