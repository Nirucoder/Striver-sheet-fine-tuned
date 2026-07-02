import crypto from "crypto";

/**
 * Stateless signed-session helpers.
 *
 * A session is a compact HMAC-signed token (header.body.signature, all base64url)
 * stored in an HttpOnly cookie. This decouples the app login from the short-lived
 * Google ID token: the Google credential is verified exactly once at sign-in, and
 * from then on the user stays logged in for SESSION_TTL_DAYS regardless of Google
 * token expiry.
 */

export const SESSION_COOKIE = "studyos_session";
export const CSRF_COOKIE = "studyos_csrf";
export const CSRF_HEADER = "x-csrf-token";
const SESSION_TTL_DAYS = 30;
const SESSION_TTL_SECONDS = SESSION_TTL_DAYS * 24 * 60 * 60;

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not configured");
  return secret;
}

function b64urlEncode(input) {
  return Buffer.from(input).toString("base64url");
}

function b64urlDecode(input) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(data) {
  return crypto.createHmac("sha256", getSecret()).update(data).digest("base64url");
}

/**
 * Create a signed session token for the given user claims.
 * Only stable identity fields are stored; nothing security-sensitive.
 */
export function signSession(user, { ttlSeconds = SESSION_TTL_SECONDS } = {}) {
  const now = Math.floor(Date.now() / 1000);
  const body = {
    sub: user.sub,
    name: user.name ?? null,
    email: user.email ?? null,
    picture: user.picture ?? null,
    iat: now,
    exp: now + ttlSeconds,
  };
  const headerPart = b64urlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const bodyPart = b64urlEncode(JSON.stringify(body));
  const signature = sign(`${headerPart}.${bodyPart}`);
  return `${headerPart}.${bodyPart}.${signature}`;
}

/**
 * Verify a session token. Returns the user claims, or null when the token is
 * missing, malformed, tampered with, or expired.
 */
export function verifySession(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerPart, bodyPart, signature] = parts;

  const expected = sign(`${headerPart}.${bodyPart}`);
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const body = JSON.parse(b64urlDecode(bodyPart));
    if (!body?.sub) return null;
    if (body.exp && Number(body.exp) * 1000 < Date.now()) return null;
    return body;
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

export function getSessionUser(req) {
  const cookies = parseCookies(req);
  return verifySession(cookies[SESSION_COOKIE]);
}
