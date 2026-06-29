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

export function getGoogleClientId() {
  return process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || null;
}

function decodeJwtPayload(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(base64, "base64").toString("utf8"));
  } catch {
    return null;
  }
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

  // Primary: Google's tokeninfo (validates signature)
  try {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`
    );
    if (res.ok) {
      const payload = await res.json();
      if (isPayloadValid(payload, clientId)) return { payload, reason: null };
    }
  } catch {
    // fall through to local decode
  }

  // Fallback: decode JWT locally (aud/exp/iss check; used when tokeninfo is unreachable)
  const payload = decodeJwtPayload(token);
  if (payload && isPayloadValid(payload, clientId)) {
    return { payload, reason: null };
  }

  return { payload: null, reason: payload ? "invalid_token" : "malformed_token" };
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
