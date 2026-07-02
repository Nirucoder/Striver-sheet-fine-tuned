import { verifyGoogleCredential, getGoogleClientId } from "../_lib/auth.js";
import {
  signSession,
  generateCsrfToken,
  buildSessionCookies,
  isSecureRequest,
} from "../_lib/session.js";

/**
 * POST /api/auth/google
 * Body: { credential }  (the Google Identity Services ID token)
 *
 * Verifies the Google credential once, then issues a durable HttpOnly session
 * cookie + a readable CSRF cookie. The client never sees or stores the Google
 * token again.
 */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!getGoogleClientId()) {
    return res.status(503).json({
      message: "Server misconfigured",
      hint: "GOOGLE_CLIENT_ID is not set in environment variables.",
    });
  }
  if (!process.env.SESSION_SECRET) {
    return res.status(503).json({
      message: "Server misconfigured",
      hint: "SESSION_SECRET is not set in environment variables.",
    });
  }

  const credential = req.body?.credential;
  const { payload, reason } = await verifyGoogleCredential(credential);
  if (!payload) {
    return res.status(401).json({ message: "Invalid Google credential", reason });
  }

  const user = {
    sub: payload.sub,
    name: payload.name,
    email: payload.email,
    picture: payload.picture,
  };
  const sessionToken = await signSession(user);
  const csrfToken = generateCsrfToken();
  res.setHeader(
    "Set-Cookie",
    buildSessionCookies({ sessionToken, csrfToken, secure: isSecureRequest(req) })
  );

  return res.json({ user });
}
