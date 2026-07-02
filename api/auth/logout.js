import { buildClearCookies, isSecureRequest } from "../_lib/session.js";

/**
 * POST /api/auth/logout
 * Clears the session and CSRF cookies.
 */
export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  res.setHeader("Set-Cookie", buildClearCookies({ secure: isSecureRequest(req) }));
  return res.json({ success: true });
}
