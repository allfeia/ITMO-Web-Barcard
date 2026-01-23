export function getUserIdFromCookies({ cookies }) {
  if (!cookies?.access_token) return null;

  try {
    const payload = JSON.parse(atob(cookies.access_token));
    return payload.id;
  } catch (e) {
    console.warn("Failed to parse access_token:", e);
    return null;
  }
}
