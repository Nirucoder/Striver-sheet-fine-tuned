export const supabase = null;

export async function loadUserProgress(userId) {
  if (!userId) return null;
  try {
    const res = await fetch(`/api/progress/${encodeURIComponent(userId)}`, {
      credentials: "include",
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Server error ${res.status}`);
    const json = await res.json();
    return json.data ?? null;
  } catch (e) {
    console.error("Load error:", e);
    throw e;
  }
}

export async function saveUserProgress(userId, payload) {
  if (!userId) return;
  try {
    const res = await fetch(`/api/progress/${encodeURIComponent(userId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ data: payload }),
    });
    if (!res.ok) throw new Error(`Server error ${res.status}`);
  } catch (e) {
    console.error("Save error:", e);
    throw e;
  }
}
