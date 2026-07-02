import crypto from "crypto";
import { SignJWT, jwtVerify } from "jose";

/**
 * Stateless signed-session helpers (backed by the `jose` library).
 *
 * A session is a signed JWT (HS256) stored in an HttpOnly cookie. This decouples
 * the app login from the short-lived Google ID token: the Google credential is
 * verified exactly once at sign-in, and from then on the user stays logged in for
 * SESSION_TTL_DAYS regardless of Google token expiry.
 *
 * NOTE: signSession / verifySession are async because jose's crypto is async.
 */

export const SESSION_COOKIE = "studyos_session";
export const CSRF_COOKIE = "studyos_csrf";
export const CSRF_HEADER = "x-csrf-token";
const SESSION_TTL_DAYS = 30;
const SESSION_TTL_SECONDS = SESSION_TTL_DAYS * 24 * 60 * 60;
const ALG = "HS256";

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

/**
 * Create a signed session JWT for the given user claims.
 * Only stable identity fields are stored; nothing security-sensitive.
 */
export async function signSession(user, { ttlSeconds = SESSION_TTL_SECONDS } = {}) {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    name: user.name ?? null,
    email: user.email ?? null,
    picture: user.picture ?? null,
  })
    .setProtectedHeader({ alg: ALG, typ: "JWT" })
    .setSubject(String(user.sub))
    .setIssuedAt(now)
    .setExpirationTime(now + ttlSeconds)
    .sign(getSecretKey());
}

/**
 * Verify a session JWT. Returns normalized user claims, or null when the token is
 * missing, malformed, tampered with, or expired. jose verifies the signature in
 * constant time and enforces the `exp` claim.
 */
export async function verifySession(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: [ALG] });
    if (!payload?.sub) return null;
    return {
      sub: payload.sub,
      name: payload.name ?? null,
      email: payload.email ?? null,
      picture: payload.picture ?? null,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export function generateCsrfToken() {
  return crypto.randomBytes(24).toString("base64url");
}

/**
 * Constant-time comparison of the CSRF cookie value and the request header.
 */
export function csrfMatches(cookieValue, headerValue) {
  if (!cookieValue || !headerValue) return false;
  const a = Buffer.from(String(cookieValue));
  const b = Buffer.from(String(headerValue));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function parseCookies(req) {
  const header = req.headers?.cookie;
  if (!header) return {};
  return header.split(";").reduce((acc, pair) => {
    const idx = pair.indexOf("=");
    if (idx === -1) return acc;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    if (key) acc[key] = decodeURIComponent(val);
    return acc;
  }, {});
}

function cookieString(name, value, { maxAge, httpOnly, secure }) {
  const parts = [`${name}=${encodeURIComponent(value)}`, "Path=/", "SameSite=Lax"];
  if (httpOnly) parts.push("HttpOnly");
  if (secure) parts.push("Secure");
  if (maxAge !== undefined) parts.push(`Max-Age=${maxAge}`);
  return parts.join("; ");
}

/**
 * Build the Set-Cookie header values for a freshly established session.
 * `secure` should be true whenever the request is served over HTTPS.
 */
export function buildSessionCookies({ sessionToken, csrfToken, secure }) {
  return [
    cookieString(SESSION_COOKIE, sessionToken, {
      maxAge: SESSION_TTL_SECONDS,
      httpOnly: true,
      secure,
    }),
    cookieString(CSRF_COOKIE, csrfToken, {
      maxAge: SESSION_TTL_SECONDS,
      httpOnly: false,
      secure,
    }),
  ];
}

export function buildClearCookies({ secure } = {}) {
  return [
    cookieString(SESSION_COOKIE, "", { maxAge: 0, httpOnly: true, secure }),
    cookieString(CSRF_COOKIE, "", { maxAge: 0, httpOnly: false, secure }),
  ];
}

export function isSecureRequest(req) {
  const proto = req.headers?.["x-forwarded-proto"] || (req.connection?.encrypted ? "https" : "");
  if (proto) return String(proto).split(",")[0].trim() === "https";
  return !!req.secure;
}

export async function getSessionUser(req) {
  const cookies = parseCookies(req);
  return verifySession(cookies[SESSION_COOKIE]);
}
