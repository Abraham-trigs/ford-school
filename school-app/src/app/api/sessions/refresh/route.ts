export async function apiRefresh(refreshToken: string) {
  const res = await fetch("/api/session/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) throw new Error("Refresh failed");
  return res.json(); // { token: string, refreshToken: string }
}
