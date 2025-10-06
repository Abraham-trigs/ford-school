export async function apiLogin(email: string, password: string) {
  const res = await fetch("/api/sessions/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json(); // expects { token?: string }
}

export async function apiLogout(token: string) {
  await fetch("/api/sessions/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function apiGetProfile(token: string) {
  const res = await fetch("/api/sessions/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Fetching profile failed");
  return res.json();
}
