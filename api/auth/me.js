import { getSessionUser } from "../_lib/session.js";

/**
 * GET /api/auth/me
 * Returns the current user derived from the session cookie, or 401 when there is
 * no valid session. Used by the client to bootstrap auth on page load.
 */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await getSessionUser(req);
  if (!user) return res.status(401).json({ user: null });

  return res.json({
    user: { sub: user.sub, name: user.name, email: user.email, picture: user.picture },
  });
}
