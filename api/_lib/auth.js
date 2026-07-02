import pg from "pg";

const { Pool } = pg;

let pool;
const verifiedTokenCache = new Map();
export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

export function getGoogleClientId() {
  return process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || null;
}

function audMatches(payload, clientId) {
  if (!payload?.aud || !clientId) return false;
  if (Array.isArray(payload.aud)) return payload.aud.includes(clientId);
  return payload.aud === clientId;
}

function isPayloadValid(payload, clientId) {
  if (!payload?.sub) return false;
  const validIss =
    payload.iss === "accounts.google.com" ||
    payload.iss === "https://accounts.google.com";
  if (!validIss || !audMatches(payload, clientId)) return false;
  if (payload.exp && Number(payload.exp) * 1000 < Date.now()) return false;
  return true;
}

/**
 * Verify a raw Google ID token (the credential returned by Google Identity
 * Services). This now runs exactly once per login — inside POST /api/auth/google —
 * to mint a durable app session. It is no longer called on every API request.
 */
export async function verifyGoogleCredential(credential) {
  const clientId = getGoogleClientId();
  if (!clientId) return { payload: null, reason: "missing_client_id" };
  if (!credential) return { payload: null, reason: "missing_token" };

  const cached = verifiedTokenCache.get(credential);
  if (cached && isPayloadValid(cached, clientId)) {
    return { payload: cached, reason: null };
  }
  verifiedTokenCache.delete(credential);

  try {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );
    if (!res.ok) return { payload: null, reason: "invalid_token" };

    const payload = await res.json();
    if (!isPayloadValid(payload, clientId)) {
      return { payload: null, reason: "invalid_token" };
    }

    verifiedTokenCache.set(credential, payload);
    return { payload, reason: null };
  } catch {
    return { payload: null, reason: "auth_unavailable" };
  }
}
