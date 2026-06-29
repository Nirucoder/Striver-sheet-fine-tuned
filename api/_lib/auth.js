import pg from "pg";

const { Pool } = pg;

let pool;
export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

export async function verifyGoogleIdToken(authHeader) {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId || !authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  try {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`
    );
    if (!res.ok) return null;

    const payload = await res.json();
    if (payload.aud !== clientId) return null;
    if (payload.exp && Number(payload.exp) * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getGoogleUserId(req) {
  const payload = await verifyGoogleIdToken(req.headers.authorization);
  return payload?.sub ?? null;
}
