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

export async function verifyGoogleIdToken(authHeader) {
  const clientId = getGoogleClientId();
  const header = authHeader || "";
  if (!clientId) return { payload: null, reason: "missing_client_id" };
  if (!header.startsWith("Bearer ")) return { payload: null, reason: "missing_token" };

  const token = header.slice(7);
  if (!token) return { payload: null, reason: "missing_token" };

  const cached = verifiedTokenCache.get(token);
  if (cached && isPayloadValid(cached, clientId)) {
    return { payload: cached, reason: null };
  }
  verifiedTokenCache.delete(token);

  // The signature must be verified because the Google subject is the cloud data key.
  try {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`
    );
    if (!res.ok) return { payload: null, reason: "invalid_token" };

    const payload = await res.json();
    if (!isPayloadValid(payload, clientId)) {
      return { payload: null, reason: "invalid_token" };
    }

    verifiedTokenCache.set(token, payload);
    return { payload, reason: null };
  } catch {
    return { payload: null, reason: "auth_unavailable" };
  }
}

export async function getGoogleUserId(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const { payload } = await verifyGoogleIdToken(authHeader);
  return payload?.sub ?? null;
}

export async function getAuthFailureReason(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const { reason } = await verifyGoogleIdToken(authHeader);
  return reason;
}
